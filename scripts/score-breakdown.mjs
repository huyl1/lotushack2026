/**
 * score-breakdown.mjs
 * -------------------
 * Prints a full per-category score breakdown for a specific student state.
 *
 * Usage:
 *   node scripts/score-breakdown.mjs --id <student_state_id>
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ───────────────────────────────────────────────────────────

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
if (!existsSync(envPath)) { console.error("❌  .env.local not found"); process.exit(1); }
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const eq = line.indexOf("=");
  if (eq === -1 || line.trim().startsWith("#")) continue;
  const k = line.slice(0, eq).trim(), v = line.slice(eq + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Scoring ───────────────────────────────────────────────────────────────────

function clamp(v) { return Math.min(100, Math.max(0, v)); }
function lmap(x, lo, hi) { return clamp(((x - lo) / (hi - lo)) * 100); }

function parseRate(t) {
  if (!t) return null;
  const c = String(t).replace(/[%~\s<>]/g, "");
  const r = c.match(/^(\d+\.?\d*)-(\d+\.?\d*)$/);
  if (r) return (parseFloat(r[1]) + parseFloat(r[2])) / 2;
  const n = parseFloat(c);
  return isNaN(n) ? null : n;
}

function scoreAll(student, u, major) {
  // ── Academic Alignment (35%) ──
  const acParts = [];
  const acNotes = [];

  if (student.gpa != null && major.gpa_min != null) {
    acParts.push(lmap(student.gpa - major.gpa_min, -0.5, 0.5));
    acNotes.push(`GPA ${student.gpa} vs min ${major.gpa_min}`);
  }
  if (student.ielts_score != null && major.ielts_min != null) {
    acParts.push(lmap(student.ielts_score - major.ielts_min, -1, 1));
    acNotes.push(`IELTS ${student.ielts_score} vs min ${major.ielts_min}`);
  }
  if (student.sat_score != null && major.sat_min != null) {
    acParts.push(lmap(student.sat_score - major.sat_min, -200, 200));
    acNotes.push(`SAT ${student.sat_score} vs min ${major.sat_min}`);
  }
  if (student.act_score != null && major.act_min != null) {
    acParts.push(lmap(student.act_score - major.act_min, -6, 6));
    acNotes.push(`ACT ${student.act_score} vs min ${major.act_min}`);
  }
  if (acNotes.length === 0) acNotes.push("no score minimums on record → neutral 50");
  const academic = acParts.length ? acParts.reduce((a, b) => a + b, 0) / acParts.length : 50;

  // ── Financial Sustainability (25%) ──
  let financial = 70;
  let finNote = "tuition unknown → neutral 70";
  if (u.tuition_usd != null && student.budget_usd != null) {
    const ratio = u.tuition_usd / student.budget_usd;
    finNote = `$${u.tuition_usd.toLocaleString()} tuition / $${student.budget_usd.toLocaleString()} budget = ${(ratio * 100).toFixed(0)}%`;
    financial = ratio <= 0.7 ? 100
      : ratio <= 1.0 ? lmap(1 - ratio, 0, 0.3) * 0.3 + 70
      : ratio <= 1.5 ? lmap(1.5 - ratio, 0, 0.5) * 0.7
      : 0;
    const aidText = (u.financial_aid ?? "").toLowerCase();
    if (student.needs_financial_aid && /scholarship|grant|merit|aid/.test(aidText)) {
      financial = clamp(financial + 15);
      finNote += " + aid bonus";
    }
  }

  // ── Student Success (15%) ──
  let success, sucNote;
  if (u.overall_score != null) {
    success = clamp((u.overall_score / 100) * 80 + ((u.eo_score ?? 50) / 100) * 20);
    sucNote = `QS overall ${u.overall_score}/100, employment outcomes ${u.eo_score ?? "n/a"}`;
  } else {
    const bands = [[10, 95], [25, 88], [50, 80], [100, 70], [150, 58], [200, 46]];
    const band = bands.find(([k]) => u.qs_rank <= k);
    success = band ? band[1] : 35;
    sucNote = `QS rank #${u.qs_rank} → band score ${success}`;
  }

  // ── Lifestyle / Culture (15%) ──
  let countryScore = 60, countryNote = "no country preference set";
  if (student.preferred_countries?.length) {
    const match = student.preferred_countries.some(
      (p) => p.toLowerCase() === (u.country ?? "").toLowerCase()
    );
    countryScore = match ? 100 : 0;
    countryNote = match
      ? `${u.country} is in preferred list ✓`
      : `${u.country} not in [${student.preferred_countries.join(", ")}]`;
  }

  let sizeScore = 60, sizeNote = "no size preference set";
  if (student.preferred_size && u.size_category) {
    const match = student.preferred_size.toLowerCase() === u.size_category.toLowerCase();
    sizeScore = match ? 100 : 40;
    sizeNote = `preferred:${student.preferred_size} / school:${u.size_category} → ${match ? "match" : "mismatch"}`;
  }

  const lifestyle = clamp(countryScore * 0.6 + sizeScore * 0.4);

  // ── Admission Chance (10%) ──
  const rate = parseRate(u.overall_acceptance_rate)
    ?? (major.acceptance_rate != null ? parseFloat(String(major.acceptance_rate)) * 100 : null);
  const acceptanceEase = rate != null ? clamp(rate * 2) : 50;
  const admission = clamp(academic * 0.6 + acceptanceEase * 0.4);
  const admNote = rate != null
    ? `acceptance rate ${rate.toFixed(1)}% → ease score ${Math.round(acceptanceEase)}`
    : `acceptance rate unknown → ease score 50`;

  // ── Composite ──
  const composite = academic * 0.35 + financial * 0.25 + success * 0.15 + lifestyle * 0.15 + admission * 0.10;

  return {
    composite: Math.round(composite),
    academic: Math.round(academic),
    financial: Math.round(financial),
    success: Math.round(success),
    lifestyle: Math.round(lifestyle),
    admission: Math.round(admission),
    notes: {
      academic: acNotes.join(" | "),
      financial: finNote,
      success: sucNote,
      lifestyle: `Country: ${countryNote} | Size: ${sizeNote}`,
      admission: admNote,
    },
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const stateId = args.includes("--id") ? args[args.indexOf("--id") + 1] : null;

if (!stateId) {
  console.error("Usage: node scripts/score-breakdown.mjs --id <student_state_id>");
  process.exit(1);
}

const { data: state, error: stErr } = await sb
  .from("student_states")
  .select("*, students(name)")
  .eq("id", stateId)
  .single();

if (stErr) { console.error("Error fetching state:", stErr.message); process.exit(1); }

const student = state;
const studentName = state.students?.name ?? "Unknown";

let q = sb.from("majors").select(
  `id, university_id, major_name, acceptance_rate, ielts_min, gpa_min, sat_min, act_min, subject_ranking,
   universities!inner(id, name, country, qs_rank, size_category, region, focus, financial_aid, tuition_usd,
     overall_acceptance_rate, overall_score, eo_score)`
);
if (student.target_majors?.length) {
  q = q.or(student.target_majors.map((m) => `major_name.ilike.%${m.replace(/[%_]/g, "")}%`).join(","));
}
if (student.gpa)       q = q.or(`gpa_min.is.null,gpa_min.lte.${student.gpa + 0.5}`);
if (student.ielts_score) q = q.or(`ielts_min.is.null,ielts_min.lte.${student.ielts_score + 1}`);
if (student.sat_score) q = q.or(`sat_min.is.null,sat_min.lte.${student.sat_score + 100}`);
if (student.act_score) q = q.or(`act_min.is.null,act_min.lte.${student.act_score + 4}`);

const { data: rows, error: qErr } = await q.limit(1000);
if (qErr) { console.error("Query error:", qErr.message); process.exit(1); }

// Deduplicate by university, keep best-ranked major
const best = new Map();
for (const row of rows) {
  const prev = best.get(row.university_id);
  if (!prev || (row.subject_ranking != null &&
    (prev.subject_ranking == null || row.subject_ranking < prev.subject_ranking))) {
    best.set(row.university_id, row);
  }
}

// Budget cap + score
const top10 = [...best.values()]
  .filter((row) => {
    const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
    return !(student.budget_usd && u.tuition_usd && u.tuition_usd > student.budget_usd * 1.5);
  })
  .map((row) => {
    const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
    const scores = scoreAll(student, u, row);
    return { u, major: row, scores };
  })
  .sort((a, b) => b.scores.composite - a.scores.composite)
  .slice(0, 10);

// ── Output ────────────────────────────────────────────────────────────────────

const W = "═".repeat(74);
const D = "─".repeat(74);

console.log(`\n${W}`);
console.log(`  UNIVERSITY SCORE BREAKDOWN — ${studentName.toUpperCase()}`);
console.log(`  State ID: ${stateId}`);
console.log(`${W}`);
console.log(`  Profile: GPA ${student.gpa ?? "n/a"} | IELTS ${student.ielts_score ?? "n/a"} | SAT ${student.sat_score ?? "n/a"} | ACT ${student.act_score ?? "n/a"}`);
console.log(`  Budget:  $${student.budget_usd?.toLocaleString() ?? "n/a"}/yr | Aid needed: ${student.needs_financial_aid ? "yes" : "no"}`);
console.log(`  Majors:  ${student.target_majors?.join(", ") ?? "n/a"}`);
console.log(`  Country preference: ${student.preferred_countries?.join(", ") ?? "n/a"}`);
console.log(`  Size preference:    ${student.preferred_size ?? "n/a"}\n`);

for (let i = 0; i < top10.length; i++) {
  const { u, major, scores } = top10[i];
  const tuitionStr = u.tuition_usd != null ? `$${u.tuition_usd.toLocaleString()}/yr` : "unknown";

  console.log(W);
  console.log(`  #${i + 1}  ${u.name}`);
  console.log(`       ${u.country ?? "?"} | QS #${u.qs_rank ?? "?"} | Tuition: ${tuitionStr} | Size: ${u.size_category ?? "?"}`);
  console.log(`       Major: ${major.major_name}`);
  console.log(`       Acceptance rate: ${u.overall_acceptance_rate ?? "n/a"}`);
  console.log(D);

  const bar = (n) => "█".repeat(Math.round(n / 5)).padEnd(20, "░");

  console.log(`\n  COMPOSITE   ${String(scores.composite).padStart(3)}/100  ${bar(scores.composite)}\n`);
  console.log(`  Academic Alignment     (35%)  ${String(scores.academic).padStart(3)}/100  ${bar(scores.academic)}`);
  console.log(`    → ${scores.notes.academic}`);
  console.log(`  Financial Sustainability(25%) ${String(scores.financial).padStart(3)}/100  ${bar(scores.financial)}`);
  console.log(`    → ${scores.notes.financial}`);
  console.log(`  Student Success        (15%)  ${String(scores.success).padStart(3)}/100  ${bar(scores.success)}`);
  console.log(`    → ${scores.notes.success}`);
  console.log(`  Lifestyle / Culture    (15%)  ${String(scores.lifestyle).padStart(3)}/100  ${bar(scores.lifestyle)}`);
  console.log(`    → ${scores.notes.lifestyle}`);
  console.log(`  Admission Chance       (10%)  ${String(scores.admission).padStart(3)}/100  ${bar(scores.admission)}`);
  console.log(`    → ${scores.notes.admission}`);
  console.log();
}

console.log(W);
console.log(`  Total candidates in pool: ${[...best.values()].length}`);
console.log(W + "\n");
