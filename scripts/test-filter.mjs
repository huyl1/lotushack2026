/**
 * test-filter.mjs
 * ---------------
 * Tests the hard filter (Phase 1) + structured scoring (Phase 2) against the
 * dev Supabase instance using REAL student data from student_states.
 *
 * Usage:
 *   node scripts/test-filter.mjs               # tests all students (latest state each)
 *   node scripts/test-filter.mjs --id <uuid>   # tests one specific student_state row
 *
 * Reads credentials from .env.local automatically.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ───────────────────────────────────────────────────────────

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

if (!existsSync(envPath)) {
  console.error("❌  .env.local not found at", envPath);
  process.exit(1);
}

for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Scoring helpers (mirrors src/lib/recommendation/scoring.ts) ───────────────

function clamp100(v) { return Math.min(100, Math.max(0, v)); }
function linearMap(x, lo, hi) { return clamp100(((x - lo) / (hi - lo)) * 100); }

function parseAcceptanceRate(text) {
  if (!text) return null;
  const c = String(text).replace(/[%~\s<>]/g, "");
  const range = c.match(/^(\d+\.?\d*)-(\d+\.?\d*)$/);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  const n = parseFloat(c);
  return isNaN(n) ? null : n;
}

function scoreAcademic(student, c) {
  const parts = [];
  if (student.gpa != null && c.gpa_min != null)
    parts.push(linearMap(student.gpa - c.gpa_min, -0.5, 0.5));
  if (student.ielts_score != null && c.ielts_min != null)
    parts.push(linearMap(student.ielts_score - c.ielts_min, -1.0, 1.0));
  if (student.sat_score != null && c.sat_min != null)
    parts.push(linearMap(student.sat_score - c.sat_min, -200, 200));
  if (student.act_score != null && c.act_min != null)
    parts.push(linearMap(student.act_score - c.act_min, -6, 6));
  return parts.length === 0 ? 50 : parts.reduce((a, b) => a + b, 0) / parts.length;
}

function scoreFinancial(student, c) {
  if (c.tuition_usd == null || student.budget_usd == null) return 70;
  const r = c.tuition_usd / student.budget_usd;
  let s = r <= 0.7 ? 100 : r <= 1.0 ? linearMap(1 - r, 0, 0.3) * 30 + 70 : r <= 1.5 ? linearMap(1.5 - r, 0, 0.5) * 70 : 0;
  return clamp100(s);
}

function scoreSuccess(c) {
  if (c.overall_score != null) return clamp100((c.overall_score / 100) * 80 + ((c.eo_score ?? 50) / 100) * 20);
  const r = c.qs_rank;
  if (!r) return 50;
  return r <= 10 ? 95 : r <= 25 ? 88 : r <= 50 ? 80 : r <= 100 ? 70 : r <= 150 ? 58 : r <= 200 ? 46 : 35;
}

function scoreLifestyle(student, c) {
  let country = 60;
  if (student.preferred_countries?.length) {
    country = student.preferred_countries.some(
      (p) => p.toLowerCase() === (c.country ?? "").toLowerCase()
    ) ? 100 : 0;
  }
  let setting = 60;
  if (student.preferred_setting && c.setting)
    setting = student.preferred_setting.toLowerCase() === c.setting.toLowerCase() ? 100 : 30;
  let size = 60;
  if (student.preferred_size && c.size_category)
    size = student.preferred_size.toLowerCase() === c.size_category.toLowerCase() ? 100 : 40;
  return clamp100(country * 0.5 + setting * 0.3 + size * 0.2);
}

function scoreAdmission(student, c) {
  const rate = parseAcceptanceRate(c.overall_acceptance_rate) ??
    (c.major_acceptance_rate != null ? parseFloat(String(c.major_acceptance_rate)) * 100 : null);
  const academic = scoreAcademic(student, c);
  const ease = rate != null ? clamp100(rate * 2) : 50;
  return clamp100(academic * 0.6 + ease * 0.4);
}

function composite(student, c) {
  const ac = scoreAcademic(student, c);
  const fi = scoreFinancial(student, c);
  const su = scoreSuccess(c);
  const li = scoreLifestyle(student, c);
  const ad = scoreAdmission(student, c);
  return {
    academic: Math.round(ac),
    financial: Math.round(fi),
    success: Math.round(su),
    lifestyle: Math.round(li),
    admission: Math.round(ad),
    composite: Math.round(ac * 0.35 + fi * 0.25 + su * 0.15 + li * 0.15 + ad * 0.10),
  };
}

// ── Hard filter query ─────────────────────────────────────────────────────────

async function runFilter(student) {
  const { gpa, ielts_score: ielts, sat_score: sat, act_score: act,
          budget_usd: budget, target_majors: majors } = student;

  let q = sb.from("majors").select(
    `id, university_id, major_name, acceptance_rate, ielts_min, gpa_min, sat_min, act_min, subject_ranking,
     universities!inner(id, name, country, qs_rank, size_category, region, focus,
       financial_aid, tuition_usd, overall_acceptance_rate, overall_score, eo_score)`
  );

  if (majors?.length) {
    q = q.or(majors.map((m) => `major_name.ilike.%${m.replace(/[%_]/g, "")}%`).join(","));
  }
  if (gpa > 0)   q = q.or(`gpa_min.is.null,gpa_min.lte.${gpa + 0.5}`);
  if (ielts > 0) q = q.or(`ielts_min.is.null,ielts_min.lte.${ielts + 1.0}`);
  if (sat > 0)   q = q.or(`sat_min.is.null,sat_min.lte.${sat + 100}`);
  if (act > 0)   q = q.or(`act_min.is.null,act_min.lte.${act + 4}`);

  const { data, error } = await q.limit(1000);
  if (error) throw new Error(error.message);

  // Deduplicate: one row per university (best-ranked major)
  const best = new Map();
  for (const row of data) {
    const prev = best.get(row.university_id);
    if (!prev || (row.subject_ranking != null &&
        (prev.subject_ranking == null || row.subject_ranking < prev.subject_ranking))) {
      best.set(row.university_id, row);
    }
  }

  // Budget hard cap at 150%
  return [...best.values()].filter((r) => {
    const u = r.universities;
    return !(budget != null && u.tuition_usd != null && u.tuition_usd > budget * 1.5);
  });
}

// ── Fetch latest state per student ───────────────────────────────────────────

async function fetchLatestStates(specificId = null) {
  if (specificId) {
    const { data, error } = await sb
      .from("student_states")
      .select("*, students(name)")
      .eq("id", specificId)
      .single();
    if (error) throw new Error(error.message);
    return [data];
  }

  // Fetch all students, then get their latest state
  const { data: students, error: sErr } = await sb.from("students").select("id, name");
  if (sErr) throw new Error(sErr.message);

  const states = [];
  for (const s of students) {
    const { data, error } = await sb
      .from("student_states")
      .select("*")
      .eq("student_id", s.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data?.length) continue;
    states.push({ ...data[0], students: { name: s.name } });
  }
  return states;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const specificId = args.includes("--id") ? args[args.indexOf("--id") + 1] : null;

console.log(`\n🔌  Connected to ${SUPABASE_URL}`);
console.log(`📋  Fetching ${specificId ? "state " + specificId : "latest state for all students"}...\n`);

const states = await fetchLatestStates(specificId);

if (states.length === 0) {
  console.log("No student states found.");
  process.exit(0);
}

const SEP = "─".repeat(72);

for (const state of states) {
  const name = state.students?.name ?? "Unknown";
  const profile = [
    state.gpa       ? `GPA ${state.gpa}`            : null,
    state.ielts_score ? `IELTS ${state.ielts_score}` : null,
    state.sat_score ? `SAT ${state.sat_score}`       : null,
    state.act_score ? `ACT ${state.act_score}`       : null,
    state.budget_usd ? `$${state.budget_usd.toLocaleString()}/yr` : null,
    state.target_majors?.join(", ") ?? null,
    state.preferred_countries?.join(", ") ?? null,
  ].filter(Boolean).join(" | ");

  console.log(SEP);
  console.log(`👤  ${name}  (state ${state.id})`);
  console.log(`    ${profile}`);

  let candidates;
  try {
    candidates = await runFilter(state);
  } catch (err) {
    console.log(`    ❌  Filter error: ${err.message}\n`);
    continue;
  }

  // Score and sort
  const scored = candidates
    .map((c) => {
      const u = Array.isArray(c.universities) ? c.universities[0] : c.universities;
      const scores = composite(state, {
        gpa_min: c.gpa_min, ielts_min: c.ielts_min, sat_min: c.sat_min, act_min: c.act_min,
        major_acceptance_rate: c.acceptance_rate,
        tuition_usd: u.tuition_usd, budget_usd: state.budget_usd,
        overall_score: u.overall_score, eo_score: u.eo_score, qs_rank: u.qs_rank,
        overall_acceptance_rate: u.overall_acceptance_rate,
        country: u.country, size_category: u.size_category,
        preferred_countries: state.preferred_countries,
        preferred_size: state.preferred_size,
      });
      return { name: u.name, country: u.country, qs_rank: u.qs_rank,
               major: c.major_name, tuition: u.tuition_usd,
               acceptance: u.overall_acceptance_rate, scores };
    })
    .sort((a, b) => b.scores.composite - a.scores.composite);

  // Coverage stats
  const withIelts   = candidates.filter((c) => c.ielts_min != null).length;
  const withGpa     = candidates.filter((c) => c.gpa_min != null).length;
  const univ0       = (c) => Array.isArray(c.universities) ? c.universities[0] : c.universities;
  const withTuition = candidates.filter((c) => univ0(c).tuition_usd != null).length;

  console.log(`\n    ✅  ${candidates.length} candidates after filter`);
  console.log(`    📊  Coverage — IELTS min: ${withIelts}, GPA min: ${withGpa}, Tuition: ${withTuition}`);
  console.log(`\n    Top 10 by composite score:`);
  console.log(`    ${"School".padEnd(38)} QS   Composite  Acad  Fin  Succ  Life  Adm`);
  console.log(`    ${"─".repeat(68)}`);

  for (const c of scored.slice(0, 10)) {
    const s = c.scores;
    const label = `${c.name} (${c.country ?? "?"})`.slice(0, 37).padEnd(37);
    const rank = String(c.qs_rank ?? "?").padStart(4);
    console.log(
      `    ${label} ${rank}   ${String(s.composite).padStart(3)}        ${String(s.academic).padStart(3)}   ${String(s.financial).padStart(3)}   ${String(s.success).padStart(3)}   ${String(s.lifestyle).padStart(3)}   ${String(s.admission).padStart(3)}`
    );
  }

  if (candidates.length < 15) {
    console.log(`\n    ⚠️  Only ${candidates.length} candidates — below the 15 minimum for the full pipeline.`);
    console.log(`       Consider relaxing score constraints or removing country/budget filters.`);
  }

  console.log();
}

console.log(SEP);
console.log("✅  Filter test complete.\n");
