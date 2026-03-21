/**
 * run-recommend.mjs
 * -----------------
 * Runs the full recommendation pipeline for one student and persists results.
 *
 * Phases:
 *   1. Hard filter  — score gates + major match + budget cap (~50 candidates)
 *   2. Scoring      — 5-criteria weighted composite (mirrors scoring.ts)
 *   3. Tiering      — rule-based: admissionChance < 40 reach / 40-65 match / > 65 safety
 *   4. Reasoning    — data-driven text generated from the actual scores
 *   5. Persist      — upsert into recommendations table (replaces prior run)
 *
 * Usage:
 *   node scripts/run-recommend.mjs --id <student_id>
 *   node scripts/run-recommend.mjs --id <student_id> --dry-run
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

const args = process.argv.slice(2);
const studentId = args.includes("--id") ? args[args.indexOf("--id") + 1] : null;
const DRY_RUN   = args.includes("--dry-run");

if (!studentId) {
  console.error("Usage: node scripts/run-recommend.mjs --id <student_id> [--dry-run]");
  process.exit(1);
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────
function clamp(v) { return Math.min(100, Math.max(0, v)); }
function lmap(x, lo, hi) { return clamp(((x - lo) / (hi - lo)) * 100); }

function parseRate(t) {
  if (!t) return null;
  const c = String(t).replace(/[%~\s<>]/g, "");
  const r = c.match(/^(\d+\.?\d*)-(\d+\.?\d*)$/);
  if (r) return (parseFloat(r[1]) + parseFloat(r[2])) / 2;
  const n = parseFloat(c);
  return isNaN(n) ? null : n <= 1 ? n * 100 : n;
}

// ── Scoring (mirrors src/lib/recommendation/scoring.ts) ──────────────────────
function scoreAcademic(student, c) {
  const parts = [];
  if (student.gpa        != null && c.gpa_min   != null) parts.push(lmap(student.gpa        - c.gpa_min,   -0.5, 0.5));
  if (student.ielts_score != null && c.ielts_min != null) parts.push(lmap(student.ielts_score - c.ielts_min, -1.0, 1.0));
  if (student.sat_score  != null && c.sat_min    != null) parts.push(lmap(student.sat_score  - c.sat_min,  -200, 200));
  if (student.act_score  != null && c.act_min    != null) parts.push(lmap(student.act_score  - c.act_min,    -6,   6));
  return parts.length === 0 ? 50 : parts.reduce((a, b) => a + b, 0) / parts.length;
}

function scoreFinancial(student, u) {
  if (u.tuition_usd == null || student.budget_usd == null) return 70;
  const r = u.tuition_usd / student.budget_usd;
  let base = r <= 0.7 ? 100
    : r <= 1.0 ? lmap(1 - r, 0, 0.3) * 0.3 + 70
    : r <= 1.5 ? lmap(1.5 - r, 0, 0.5) * 0.7
    : 0;
  const aid = (u.financial_aid ?? "").toLowerCase();
  if (student.needs_financial_aid && /scholarship|grant|merit|aid/.test(aid)) base = clamp(base + 15);
  return clamp(base);
}

function scoreSuccess(u) {
  if (u.overall_score != null) return clamp((u.overall_score / 100) * 80 + ((u.eo_score ?? 50) / 100) * 20);
  const r = u.qs_rank;
  if (!r)        return 50;
  if (r <= 10)   return 95;
  if (r <= 25)   return 88;
  if (r <= 50)   return 80;
  if (r <= 100)  return 70;
  if (r <= 150)  return 58;
  if (r <= 200)  return 46;
  return 35;
}

function scoreLifestyle(student, u) {
  let country = 60;
  if (student.preferred_countries?.length) {
    country = student.preferred_countries.some(p => p.toLowerCase() === (u.country ?? "").toLowerCase()) ? 100 : 0;
  }
  let size = 60;
  if (student.preferred_size && u.size_category) {
    size = student.preferred_size.toLowerCase() === u.size_category.toLowerCase() ? 100 : 40;
  }
  return clamp(country * 0.6 + size * 0.4);
}

function scoreAdmission(student, u, c) {
  const rate = parseRate(u.overall_acceptance_rate) ?? (c.acceptance_rate != null ? c.acceptance_rate : null);
  const academic = scoreAcademic(student, c);
  const ease = rate != null ? clamp(rate * 2) : 50;
  const result = academic * 0.6 + ease * 0.4;
  return isNaN(result) ? 50 : clamp(result);
}

function scoreAll(student, u, c) {
  const academic    = scoreAcademic(student, c);
  const financial   = scoreFinancial(student, u);
  const success     = scoreSuccess(u);
  const lifestyle   = scoreLifestyle(student, u);
  const admission   = scoreAdmission(student, u, c);
  const composite   = academic * 0.35 + financial * 0.25 + success * 0.15 + lifestyle * 0.15 + admission * 0.10;
  return {
    academic:    Math.round(academic),
    financial:   Math.round(financial),
    success:     Math.round(success),
    lifestyle:   Math.round(lifestyle),
    admission:   Math.round(admission),
    composite:   Math.round(composite),
  };
}

// ── Reasoning generator ───────────────────────────────────────────────────────
function buildReasoning(tier, u, c, s, student) {
  const tuition = u.tuition_usd ? `$${u.tuition_usd.toLocaleString()}/yr` : "unknown tuition";
  const rate    = parseRate(u.overall_acceptance_rate) ?? c.acceptance_rate;
  const rateStr = rate != null ? `${rate.toFixed(1)}% acceptance rate` : "selective admissions";

  const academicNote = (() => {
    if (s.academic >= 75) return `Liam's academic profile comfortably exceeds the minimums`;
    if (s.academic >= 50) return `Liam's profile broadly aligns with the entry requirements`;
    if (s.academic >= 30) return `Liam's scores fall slightly below the typical admitted range`;
    return `Liam's scores are meaningfully below this program's minimums — a genuine stretch`;
  })();

  const finNote = (() => {
    if (!u.tuition_usd) return `Tuition data unavailable`;
    const r = u.tuition_usd / (student.budget_usd ?? 55000);
    if (r <= 0.7)  return `At ${tuition} it fits well within his $${(student.budget_usd ?? 55000).toLocaleString()} budget`;
    if (r <= 1.0)  return `${tuition} is within budget with some room to spare`;
    if (r <= 1.25) return `${tuition} is tight against his budget`;
    return `${tuition} exceeds his budget — financial planning required`;
  })();

  const locNote = s.lifestyle >= 80
    ? `${u.country} is a preferred destination and the campus size matches his preferences`
    : s.lifestyle >= 40
    ? `Location or size is partially mismatched with his preferences`
    : `Neither country nor size aligns with his stated preferences`;

  const admNote = (() => {
    if (tier === "safety") return `With ${rateStr} and his profile sitting above minimums, admission confidence is high`;
    if (tier === "match")  return `The ${rateStr} combined with his aligned scores gives a reasonable shot`;
    return `The ${rateStr} makes this highly competitive regardless of profile strength`;
  })();

  return `${academicNote}. ${finNote}. ${locNote}. ${admNote}.`;
}

// ── Phase 1: Hard filter ──────────────────────────────────────────────────────
async function fetchCandidates(student) {
  const gpa   = student.gpa          ?? 0;
  const ielts = student.ielts_score  ?? 0;
  const sat   = student.sat_score    ?? 0;
  const act   = student.act_score    ?? 0;
  const majors = student.target_majors ?? [];

  let q = sb.from("majors").select(
    `id, university_id, major_name, acceptance_rate, ielts_min, gpa_min, sat_min, act_min, subject_ranking,
     universities!inner(id, name, country, qs_rank, size_category, region, focus,
       financial_aid, tuition_usd, overall_acceptance_rate, overall_score, eo_score)`
  );

  if (majors.length) q = q.or(majors.map(m => `major_name.ilike.%${m.replace(/[%_]/g, "")}%`).join(","));
  // Wider tolerance to include elite reaches (scored low on academic alignment, but still shown)
  if (gpa   > 0) q = q.or(`gpa_min.is.null,gpa_min.lte.${gpa   + 1.0}`);
  if (ielts > 0) q = q.or(`ielts_min.is.null,ielts_min.lte.${ielts + 2.0}`);
  if (sat   > 0) q = q.or(`sat_min.is.null,sat_min.lte.${sat   + 300}`);
  if (act   > 0) q = q.or(`act_min.is.null,act_min.lte.${act   + 8}`);

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

  // Budget cap: exclude > 150 % of budget
  return [...best.values()].filter(row => {
    const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
    return !(student.budget_usd && u.tuition_usd && u.tuition_usd > student.budget_usd * 1.5);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("⏳  Fetching student...");
const { data: studentRow, error: sErr } = await sb
  .from("students").select("id, name").eq("id", studentId).single();
if (sErr || !studentRow) { console.error("Student not found:", sErr?.message); process.exit(1); }

const { data: states } = await sb
  .from("student_states").select("*")
  .eq("student_id", studentId).order("created_at", { ascending: false }).limit(1);
if (!states?.length) { console.error("No student_states found for", studentRow.name); process.exit(1); }

const student = states[0];
console.log(`   ${studentRow.name}  (state ${student.id})`);
console.log(`   GPA ${student.gpa ?? "n/a"} | SAT ${student.sat_score ?? "n/a"} | ACT ${student.act_score ?? "n/a"} | IELTS ${student.ielts_score ?? "n/a"}`);
console.log(`   Budget $${student.budget_usd?.toLocaleString() ?? "n/a"} | Majors: ${student.target_majors?.join(", ")} | Countries: ${student.preferred_countries?.join(", ")}\n`);

// Phase 1
process.stdout.write("🔍  Phase 1 — hard filter... ");
const candidates = await fetchCandidates(student);
console.log(`${candidates.length} candidates`);
if (candidates.length < 15) {
  console.error(`Only ${candidates.length} candidates — too few to tier. Relax constraints.`);
  process.exit(1);
}

// Phase 2 — score all
const scored = candidates.map(row => {
  const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
  const scores = scoreAll(student, u, row);
  return { u, major: row, scores };
}).sort((a, b) => b.scores.composite - a.scores.composite);

console.log(`📊  Phase 2 — scored ${scored.length} candidates. Top composite: ${scored[0].scores.composite}`);

// Phase 3 — tier ALL candidates by admission chance so elite schools appear as reaches
// even when composite ranks them lower (high tuition, low acceptance rate).
// Within each tier, schools are already sorted by composite desc.
const pools = { reach: [], match: [], safety: [] };
for (const c of scored) {
  const t = c.scores.admission < 40 ? "reach" : c.scores.admission <= 65 ? "match" : "safety";
  pools[t].push(c);
}

const usedIds = new Set();

function pickTop5(pool) {
  const chosen = pool.slice(0, 5);
  chosen.forEach(c => usedIds.add(c.u.id));
  return chosen;
}

// Fill a tier that has fewer than 5 from remaining unused candidates
function fillTier(existing, needed = 5) {
  if (existing.length >= needed) return existing;
  const extra = scored
    .filter(c => !usedIds.has(c.u.id))
    .slice(0, needed - existing.length);
  extra.forEach(c => usedIds.add(c.u.id));
  return [...existing, ...extra];
}

const reachPicked  = pickTop5(pools.reach);
const matchPicked  = pickTop5(pools.match);
const safetyPicked = pickTop5(pools.safety);

const tiers = {
  reach:  fillTier(reachPicked),
  match:  fillTier(matchPicked),
  safety: fillTier(safetyPicked),
};

console.log(`🏷️   Phase 3 — tiers: reach ${tiers.reach.length} | match ${tiers.match.length} | safety ${tiers.safety.length}`);

// Phase 4 — build reasoning + print table
const SEP = "─".repeat(80);
console.log(`\n${SEP}`);
console.log("  RECOMMENDATIONS FOR", studentRow.name.toUpperCase());
console.log(SEP);

const allRecs = [];
for (const [tier, list] of Object.entries(tiers)) {
  console.log(`\n  ${tier.toUpperCase()}`);
  for (const { u, major, scores } of list) {
    const reasoning = buildReasoning(tier, u, major, scores, student);
    const tuition = u.tuition_usd ? `$${u.tuition_usd.toLocaleString()}` : "n/a";
    console.log(`  • ${u.name} (${u.country ?? "?"})  QS#${u.qs_rank ?? "?"}  ${tuition}/yr`);
    console.log(`    Major: ${major.major_name}  | Composite: ${scores.composite}  | Acad: ${scores.academic}  Fin: ${scores.financial}  Succ: ${scores.success}  Life: ${scores.lifestyle}  Adm: ${scores.admission}`);
    console.log(`    ${reasoning}`);
    allRecs.push({ tier, u, major, scores, reasoning });
  }
}

console.log(`\n${SEP}\n`);

if (DRY_RUN) {
  console.log("✅  Dry run — no changes written.");
  process.exit(0);
}

// Phase 5 — persist
console.log("💾  Phase 5 — saving to recommendations table...");

// Delete prior recs for this student_state
await sb.from("recommendations").delete().eq("student_state_id", student.id);

const rows = allRecs.map(({ tier, major, scores, reasoning }) => ({
  student_state_id:        student.id,
  major_id:                major.id,
  match_category:          tier,
  description:             reasoning,
  academic_alignment:      scores.academic,
  financial_sustainability:scores.financial,
  student_success:         scores.success,
  lifestyle_culture:       scores.lifestyle,
  admission_chance:        scores.admission,
}));

const { error: insErr } = await sb.from("recommendations").insert(rows);
if (insErr) { console.error("Insert error:", insErr.message); process.exit(1); }

console.log(`✅  Saved ${rows.length} recommendations for ${studentRow.name}.`);
