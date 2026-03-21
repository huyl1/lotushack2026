/**
 * grok-recommend.mjs
 * ------------------
 * Embedding-based recommendation pipeline for a student (default: Daniel Kim).
 *
 * Phase 1 — Hard filter: score gates + budget cap (~50 candidates)
 * Phase 2 — Semantic rank: cosine_similarity(student_embedding, major_embedding)
 * Phase 3 — Grok scoring: LLM produces 5 dimension scores + tier + reasoning
 * Phase 4 — Persist: upsert into recommendations table
 *
 * Usage:
 *   node scripts/grok-recommend.mjs [--name "Daniel Kim"] [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Env ───────────────────────────────────────────────────────────────────────
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
if (!existsSync(envPath)) { console.error("❌  .env.local not found"); process.exit(1); }
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const eq = line.indexOf("=");
  if (eq === -1 || line.trim().startsWith("#")) continue;
  const k = line.slice(0, eq).trim(), v = line.slice(eq + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const args       = process.argv.slice(2);
const targetName = args.includes("--name") ? args[args.indexOf("--name") + 1] : null;
const targetId   = args.includes("--id")   ? args[args.indexOf("--id")   + 1] : null;
const DRY_RUN    = args.includes("--dry-run");

if (!targetName && !targetId) {
  console.error("Usage: node scripts/grok-recommend.mjs --name <name> | --id <student_id> [--dry-run]");
  process.exit(1);
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Phase 2: Cosine similarity ────────────────────────────────────────────────
function parseEmbedding(v) {
  if (!v) return null;
  if (Array.isArray(v)) return v;
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return null; } }
  return null;
}

function cosineSimilarity(a, b) {
  a = parseEmbedding(a);
  b = parseEmbedding(b);
  if (!a || !b || a.length !== b.length || a.length === 0) return 50;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 50;
  const sim = dot / denom; // -1 to 1
  return Math.round(((sim + 1) / 2) * 100); // 0 to 100
}

// ── Phase 1: Hard filter ──────────────────────────────────────────────────────
async function fetchCandidates(student) {
  const gpa    = student.gpa          ?? 0;
  const ielts  = student.ielts_score  ?? 0;
  const sat    = student.sat_score    ?? 0;
  const act    = student.act_score    ?? 0;
  const majors = student.target_majors ?? [];

  let q = sb.from("majors").select(
    `id, university_id, major_name, acceptance_rate, ielts_min, gpa_min,
     sat_min, act_min, subject_ranking, major_embedding,
     universities!inner(
       id, name, country, qs_rank, size_category, region, focus, research,
       financial_aid, tuition_usd, overall_acceptance_rate, overall_score,
       eo_score, ar_score, er_score
     )`
  );

  if (majors.length) {
    q = q.or(majors.map(m => `major_name.ilike.%${m.replace(/[%_]/g, "")}%`).join(","));
  }
  if (gpa   > 0) q = q.or(`gpa_min.is.null,gpa_min.lte.${gpa   + 0.5}`);
  if (ielts > 0) q = q.or(`ielts_min.is.null,ielts_min.lte.${ielts + 1.0}`);
  if (sat   > 0) q = q.or(`sat_min.is.null,sat_min.lte.${sat   + 100}`);
  if (act   > 0) q = q.or(`act_min.is.null,act_min.lte.${act   + 4}`);

  const { data, error } = await q.limit(1000);
  if (error) throw new Error(error.message);

  // One row per university — keep best-ranked major
  const best = new Map();
  for (const row of data) {
    const prev = best.get(row.university_id);
    if (!prev || (row.subject_ranking != null &&
        (prev.subject_ranking == null || row.subject_ranking < prev.subject_ranking))) {
      best.set(row.university_id, row);
    }
  }

  // Budget cap
  return [...best.values()].filter(row => {
    const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
    return !(student.budget_usd && u.tuition_usd && u.tuition_usd > student.budget_usd * 1.5);
  });
}

// ── Phase 3: Grok scoring + tiering ──────────────────────────────────────────
const SYSTEM_PROMPT = `You are a frank, knowledgeable university admissions counselor. Given a student profile and a list of pre-filtered university/major candidates, you will:
1. Score each candidate on five dimensions (0–100 each).
2. For each dimension write a concise, honest rationale (2–4 sentences). Be direct about gaps — cite specific numbers where they matter — but write naturally, not as a checklist. Vary your phrasing across entries.
3. Assign each to a tier and select exactly 5 per tier.

SCORING DIMENSIONS:
- academic_alignment (30%): How well the student's GPA/SAT/ACT/IELTS match the program's requirements. High if clearly above minimums; low if below. Mention the relevant numbers but don't enumerate every single field if most are fine.
- financial_sustainability (20%): Tuition vs. budget fit. Call out whether the cost is comfortable, tight, or over budget, and flag financial aid relevance if the student needs it.
- student_success (10%): Career and academic outcomes — QS rank, employment score, research intensity. What does this school actually mean for the student's future?
- lifestyle_culture (10%): Does the country, city, campus size, and setting match what the student wants? Be specific about what fits and what doesn't.
- admission_chance (30%): Realistic odds given the acceptance rate and how the student's profile compares to typical admits. Don't soften low chances.

SEMANTIC FIT:
Each candidate has a "semantic_fit" score (0–100) representing how well the university+major embedding matches the student's profile embedding. Use it as a calibration signal across all dimensions.

TIER DEFINITIONS:
- reach: admission_chance score < 40, or acceptance rate < 15%, or highly selective program.
- match: admission_chance score 40–65, student profile near the admitted median.
- safety: admission_chance score > 65, student profile comfortably above requirements.

RULES:
- Select exactly 5 universities per tier.
- COUNTRY CONSTRAINT: Only select universities in the student's preferred countries. Do NOT include any university outside that list. Only relax if a tier cannot be filled otherwise.
- Prefer diversity across countries, sizes, and specializations within preferred countries.
- Return ONLY valid JSON — no prose outside the object.`;

async function runGrokScoring(student, candidates) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const studentSummary = [
    student.gpa         != null ? `GPA: ${student.gpa}` : null,
    student.ielts_score != null ? `IELTS: ${student.ielts_score}` : null,
    student.sat_score   != null ? `SAT: ${student.sat_score}` : null,
    student.act_score   != null ? `ACT: ${student.act_score}` : null,
    student.budget_usd  != null ? `Budget: $${student.budget_usd.toLocaleString()}/yr` : null,
    student.needs_financial_aid ? "Needs financial aid" : null,
    student.target_majors?.length       ? `Majors: ${student.target_majors.join(", ")}` : null,
    student.preferred_countries?.length ? `Countries: ${student.preferred_countries.join(", ")}` : null,
    student.preferred_setting ? `Setting: ${student.preferred_setting}` : null,
    student.preferred_size    ? `Size: ${student.preferred_size}` : null,
  ].filter(Boolean).join("; ");

  const candidateLines = candidates.map((c, i) => {
    const u = Array.isArray(c.universities) ? c.universities[0] : c.universities;
    // Prefer major-specific acceptance rate; fall back to university-wide
    let rate;
    if (c.acceptance_rate != null) {
      rate = parseFloat(c.acceptance_rate).toFixed(1) + "%";
    } else {
      const rateRaw = u.overall_acceptance_rate ?? "";
      const cleaned = rateRaw.replace(/[%~\s<>]/g, "");
      const rangeM  = cleaned.match(/^(\d+\.?\d*)-(\d+\.?\d*)$/);
      let num = rangeM
        ? (parseFloat(rangeM[1]) + parseFloat(rangeM[2])) / 2
        : parseFloat(cleaned);
      if (!isNaN(num)) {
        if (num < 1) num = num * 100; // stored as decimal fraction
        rate = num.toFixed(1) + "%";
      } else {
        rate = "unknown";
      }
    }
    const tuition = u.tuition_usd ? `$${u.tuition_usd.toLocaleString()}` : "unknown";

    const lines = [
      `${i + 1}. [${u.id}] ${u.name} — ${u.country ?? "?"}, QS #${u.qs_rank ?? "?"}`,
      `   Major: ${c.major_name} | Acceptance: ${rate} | Tuition: ${tuition}/yr`,
      `   Focus: ${u.focus ?? "?"} | Research: ${u.research ?? "?"} | Size: ${u.size_category ?? "?"} | Employment score: ${u.eo_score ?? "?"}`,
      `   Semantic fit: ${c.semanticFit}/100`,
    ];
    const reqs = [];
    if (c.gpa_min   != null) reqs.push(`GPA min ${c.gpa_min}`);
    if (c.ielts_min != null) reqs.push(`IELTS min ${c.ielts_min}`);
    if (c.sat_min   != null) reqs.push(`SAT min ${c.sat_min}`);
    if (c.act_min   != null) reqs.push(`ACT min ${c.act_min}`);
    if (reqs.length) lines.push(`   Requirements: ${reqs.join(", ")}`);
    return lines.join("\n");
  }).join("\n\n");

  const userPrompt = `Student profile: ${studentSummary}

Candidates (top ${candidates.length}, sorted by semantic fit):
${candidateLines}

Return JSON in this exact schema — pick 5 per tier, university_id must be a UUID from the list:
{
  "reach": [
    {
      "university_id": "uuid",
      "academic_alignment": 0,
      "financial_sustainability": 0,
      "student_success": 0,
      "lifestyle_culture": 0,
      "admission_chance": 0,
      "academic_alignment_description": "...",
      "financial_sustainability_description": "...",
      "student_success_description": "...",
      "lifestyle_culture_description": "...",
      "admission_chance_description": "..."
    },
    ...5 items
  ],
  "match":  [ ...5 items ],
  "safety": [ ...5 items ]
}`;

  console.log("🤖  Calling OpenAI (gpt-5.4)...");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 8000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Grok");

  const jsonStr = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  return JSON.parse(jsonStr);
}

// ── Main ──────────────────────────────────────────────────────────────────────
let studentRow;

if (targetId) {
  console.log(`⏳  Looking up student by ID: ${targetId}...`);
  const { data, error } = await sb.from("students").select("id, name").eq("id", targetId).single();
  if (error || !data) { console.error("Student not found:", error?.message); process.exit(1); }
  studentRow = data;
} else {
  console.log(`⏳  Looking up student: "${targetName}"...`);
  const { data, error } = await sb.from("students").select("id, name").ilike("name", `%${targetName}%`).limit(5);
  if (error || !data?.length) { console.error("Student not found:", error?.message ?? "no results"); process.exit(1); }
  studentRow = data[0];
}
console.log(`   Found: ${studentRow.name} (${studentRow.id})`);

const { data: states } = await sb
  .from("student_states")
  .select("*, student_embedding")
  .eq("student_id", studentRow.id)
  .order("created_at", { ascending: false })
  .limit(1);

if (!states?.length) { console.error("No student_states found"); process.exit(1); }

const student = states[0];
const studentEmbedding = student.student_embedding;

if (!studentEmbedding) {
  console.error("❌  No student_embedding on this state. Run the embedding backfill first.");
  process.exit(1);
}

console.log(`   State: ${student.id}`);
console.log(`   GPA ${student.gpa ?? "n/a"} | SAT ${student.sat_score ?? "n/a"} | ACT ${student.act_score ?? "n/a"} | IELTS ${student.ielts_score ?? "n/a"}`);
console.log(`   Budget $${student.budget_usd?.toLocaleString() ?? "n/a"} | Majors: ${student.target_majors?.join(", ") ?? "n/a"} | Countries: ${student.preferred_countries?.join(", ") ?? "n/a"}\n`);

// Phase 1 — hard filter
process.stdout.write("🔍  Phase 1 — hard filter... ");
const rawCandidates = await fetchCandidates(student);
console.log(`${rawCandidates.length} candidates`);

if (rawCandidates.length < 15) {
  console.error(`Only ${rawCandidates.length} candidates — too few. Relax constraints.`);
  process.exit(1);
}

// Phase 2 — semantic ranking
const ranked = rawCandidates
  .map(row => {
    const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
    return { ...row, _u: u, semanticFit: cosineSimilarity(studentEmbedding, row.major_embedding) };
  })
  .sort((a, b) => b.semanticFit - a.semanticFit);

// Hard filter 1: preferred countries
const preferredCountries = (student.preferred_countries ?? []).map(c => c.toLowerCase());
const countryFiltered = preferredCountries.length > 0
  ? ranked.filter(c => {
      const u = Array.isArray(c.universities) ? c.universities[0] : c.universities;
      return preferredCountries.includes((u.country ?? "").toLowerCase());
    })
  : ranked;

// Hard filter 2: target majors (partial match)
const targetMajors = (student.target_majors ?? []).map(m => m.toLowerCase());
const majorFiltered = targetMajors.length > 0
  ? countryFiltered.filter(c =>
      targetMajors.some(m =>
        c.major_name.toLowerCase().includes(m) || m.includes(c.major_name.toLowerCase())
      )
    )
  : countryFiltered;

const pool  = majorFiltered.length >= 15 ? majorFiltered : countryFiltered;
const top20 = pool.slice(0, 20);
console.log(`📐  Phase 2 — semantic fit computed. Top score: ${top20[0]?.semanticFit ?? "n/a"}/100 (${pool.length} filtered candidates)`);

// Phase 3 — Grok scores + tiers
const tiered = await runGrokScoring(student, top20);

// Build university id → candidate lookup for hydration
const candidateMap = new Map(ranked.map(c => {
  const u = Array.isArray(c.universities) ? c.universities[0] : c.universities;
  return [u.id, { ...c, u }];
}));

// ── Print results ──────────────────────────────────────────────────────────────
const SEP = "═".repeat(80);
const DIV = "─".repeat(80);
console.log(`\n${SEP}`);
console.log(`  RECOMMENDATIONS FOR ${studentRow.name.toUpperCase()}  (Grok / embedding-based)`);
console.log(SEP);

const allRecs = [];
for (const tier of ["reach", "match", "safety"]) {
  const items = tiered[tier] ?? [];
  console.log(`\n  ${tier.toUpperCase()} (${items.length})`);
  console.log(DIV);

  for (const item of items) {
    const c = candidateMap.get(item.university_id);
    if (!c) { console.log(`  ⚠️  Unknown university_id: ${item.university_id}`); continue; }
    const u = c.u;
    const tuition = u.tuition_usd ? `$${u.tuition_usd.toLocaleString()}` : "n/a";
    const composite = Math.round(
      item.academic_alignment      * 0.30 +
      item.financial_sustainability * 0.20 +
      item.student_success          * 0.10 +
      item.lifestyle_culture        * 0.10 +
      item.admission_chance         * 0.30
    );

    console.log(`  • ${u.name} (${u.country ?? "?"})  QS#${u.qs_rank ?? "?"}  ${tuition}/yr  Semantic fit: ${c.semanticFit}/100`);
    console.log(`    Major: ${c.major_name}`);
    console.log(`    Composite: ${composite}  | Acad: ${item.academic_alignment}  Fin: ${item.financial_sustainability}  Succ: ${item.student_success}  Life: ${item.lifestyle_culture}  Adm: ${item.admission_chance}`);
    console.log(`    [Academic]  ${item.academic_alignment_description}`);
    console.log(`    [Financial] ${item.financial_sustainability_description}`);
    console.log(`    [Success]   ${item.student_success_description}`);
    console.log(`    [Lifestyle] ${item.lifestyle_culture_description}`);
    console.log(`    [Admission] ${item.admission_chance_description}`);
    allRecs.push({ tier, majorId: c.id, scores: item });
  }
}

console.log(`\n${SEP}\n`);

if (DRY_RUN) {
  console.log("✅  Dry run — no changes written.");
  process.exit(0);
}

// Phase 4 — persist
console.log("💾  Phase 4 — saving to recommendations table...");
await sb.from("recommendations").delete().eq("student_state_id", student.id);

// Deduplicate across tiers (reach > match > safety)
const seenMajorIds = new Set();
const dedupedRecs = allRecs.filter(r => {
  if (seenMajorIds.has(r.majorId)) return false;
  seenMajorIds.add(r.majorId);
  return true;
});

const rows = dedupedRecs.map(({ tier, majorId, scores }) => ({
  student_state_id:                     student.id,
  major_id:                             majorId,
  match_category:                       tier,
  academic_alignment:                   scores.academic_alignment,
  financial_sustainability:             scores.financial_sustainability,
  student_success:                      scores.student_success,
  lifestyle_culture:                    scores.lifestyle_culture,
  admission_chance:                     scores.admission_chance,
  academic_alignment_description:       scores.academic_alignment_description,
  financial_sustainability_description: scores.financial_sustainability_description,
  student_success_description:          scores.student_success_description,
  lifestyle_culture_description:        scores.lifestyle_culture_description,
  admission_chance_description:         scores.admission_chance_description,
}));

const { error: insErr } = await sb.from("recommendations").insert(rows);
if (insErr) { console.error("Insert error:", insErr.message); process.exit(1); }

console.log(`✅  Saved ${rows.length} recommendations for ${studentRow.name}.`);
