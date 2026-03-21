/**
 * impute-acceptance-rate.mjs
 * --------------------------
 * Fills NULL acceptance_rate values in the majors table using a two-stage approach:
 *
 *   Stage A — University anchor:  parse the university's overall_acceptance_rate string,
 *             then scale by a major-category multiplier (CS/Medicine more competitive, etc.)
 *
 *   Stage B — Rank-band fallback: when the university rate is unparseable, use empirical
 *             averages computed from the 2021 existing rows that already have data.
 *
 * Values are stored as a plain numeric percentage  (e.g. 12.5 = 12.5 %).
 * Result is rounded to one decimal place.
 *
 * Usage:
 *   node scripts/impute-acceptance-rate.mjs [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Env ────────────────────────────────────────────────────────────────────────
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
if (!existsSync(envPath)) { console.error("❌  .env.local not found"); process.exit(1); }
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const eq = line.indexOf("=");
  if (eq === -1 || line.trim().startsWith("#")) continue;
  const k = line.slice(0, eq).trim(), v = line.slice(eq + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const DRY_RUN = process.argv.includes("--dry-run");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Major classification ───────────────────────────────────────────────────────

function classify(name) {
  const n = (name ?? "").toLowerCase();
  if (/medicine|medical|clinical|mbbs|dentis|pharma|nursing|health sci/.test(n)) return "Medicine";
  if (/comput|software|data sci|\bai\b|artificial intel|machine learn|cybersec/.test(n)) return "CS";
  if (/electrical|electronic|mechan|civil|chemical|aerospace|industrial|engineer/.test(n)) return "Engineering";
  if (/\bmath|physics|chemistry|statistics|actuarial|bioinformat/.test(n))        return "HardScience";
  if (/business|finance|account|economics|management|marketing|\bmba\b|commerce/.test(n)) return "Business";
  if (/\blaw\b|legal|juris/.test(n))                                               return "Law";
  if (/history|philosophy|literature|language|linguis|music|\bart\b|theatre|communicat|media|journalism|psychology|sociology|political|international rel|public policy/.test(n)) return "Arts";
  return "Other";
}

// ── Stage B: empirical rank-band × category fallback table ────────────────────
// Derived from averages across the 2021 rows that already have acceptance_rate data.

const FALLBACK = {
  //  band      CS    Eng   Med   HardSci  Business  Law   Arts  Other
  "1-10":   { CS:  8, Engineering: 18, Medicine: 16, HardScience:  9, Business:  8, Law: 13, Arts:  9, Other: 10 },
  "11-25":  { CS: 14, Engineering: 24, Medicine:  7, HardScience: 17, Business: 24, Law: 14, Arts: 24, Other: 27 },
  "26-50":  { CS: 15, Engineering: 30, Medicine: 15, HardScience: 22, Business: 24, Law: 13, Arts: 21, Other: 28 },
  "51-100": { CS: 21, Engineering: 29, Medicine: 15, HardScience: 25, Business: 26, Law: 22, Arts: 25, Other: 23 },
  "101-200":{ CS: 26, Engineering: 29, Medicine: 21, HardScience: 29, Business: 37, Law: 26, Arts: 32, Other: 41 },
  "201-300":{ CS: 26, Engineering: 32, Medicine: 36, HardScience: 27, Business: 40, Law: 27, Arts: 47, Other: 36 },
  "300+":   { CS: 50, Engineering: 50, Medicine: 23, HardScience: 55, Business: 55, Law: 45, Arts: 40, Other: 70 },
};

function rankBand(rank) {
  if (!rank)       return "201-300";  // unknown rank → mid-tier default
  if (rank <= 10)  return "1-10";
  if (rank <= 25)  return "11-25";
  if (rank <= 50)  return "26-50";
  if (rank <= 100) return "51-100";
  if (rank <= 200) return "101-200";
  if (rank <= 300) return "201-300";
  return "300+";
}

// ── Stage A: scale university overall AR by major-category multiplier ─────────
// Multipliers calibrated so that competitive fields (CS, Medicine) sit below the
// university average and accessible fields (Arts, Other) sit at or above it.

const MULTIPLIER = {
  Medicine:    0.55,
  CS:          0.75,
  Engineering: 0.90,
  HardScience: 0.85,
  Business:    1.00,
  Law:         0.80,
  Arts:        1.10,
  Other:       1.00,
};

/**
 * Parse the university's overall_acceptance_rate string → numeric percent.
 * Handles: "5.65%", "0.15", "~30-40%", "34%", "~60%", "< 5%", etc.
 * Returns null if unparseable.
 */
function parseUnivRate(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/[%~\s<>()a-z;,.*]/gi, "");
  // Range like "30-40" → midpoint
  const range = cleaned.match(/^(\d+\.?\d*)-(\d+\.?\d*)$/);
  if (range) {
    const mid = (parseFloat(range[1]) + parseFloat(range[2])) / 2;
    return mid <= 1 ? mid * 100 : mid;   // 0.30-0.40 vs 30-40
  }
  const n = parseFloat(cleaned);
  if (isNaN(n)) return null;
  return n <= 1 ? n * 100 : n;           // 0.15 → 15, 34 → 34
}

function impute(majorName, rank, univRateRaw) {
  const cat = classify(majorName);
  const band = rankBand(rank);

  // Stage A: anchor to university rate when available
  const univRate = parseUnivRate(univRateRaw);
  if (univRate != null && univRate > 0 && univRate <= 100) {
    const scaled = univRate * MULTIPLIER[cat];
    // Clamp to sensible bounds: never below 0.5 % or above 95 %
    return Math.round(Math.min(95, Math.max(0.5, scaled)) * 10) / 10;
  }

  // Stage B: rank-band + category fallback
  return FALLBACK[band][cat];
}

// ── Fetch null rows ────────────────────────────────────────────────────────────

console.log("⏳  Fetching majors with null acceptance_rate...");

const nullRows = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await sb
    .from("majors")
    .select("id, major_name, acceptance_rate, universities(qs_rank, overall_acceptance_rate)")
    .is("acceptance_rate", null)
    .range(from, from + PAGE - 1);
  if (error) { console.error("Fetch error:", error.message); process.exit(1); }
  if (!data || data.length === 0) break;
  nullRows.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}

console.log(`   Found ${nullRows.length} rows with null acceptance_rate.\n`);

// ── Compute imputed values ─────────────────────────────────────────────────────

// Stage A vs B diagnostics
let stageA = 0, stageB = 0;

// Group by value to minimise API calls
const byValue = new Map(); // imputed_value → id[]

for (const row of nullRows) {
  const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
  const rank      = u?.qs_rank ?? null;
  const univRate  = u?.overall_acceptance_rate ?? null;
  const val       = impute(row.major_name, rank, univRate);

  if (parseUnivRate(univRate) != null) stageA++; else stageB++;

  if (!byValue.has(val)) byValue.set(val, []);
  byValue.get(val).push(row.id);
}

console.log(`📊  Stage A (anchored to university rate): ${stageA} rows`);
console.log(`    Stage B (rank-band fallback):          ${stageB} rows`);
console.log(`    Distinct imputed values: ${byValue.size}`);
console.log();

// Print distribution
const dist = {};
for (const [val, ids] of byValue) {
  const bucket = val < 5 ? "<5%" : val < 15 ? "5-15%" : val < 30 ? "15-30%" : val < 50 ? "30-50%" : "50%+";
  dist[bucket] = (dist[bucket] || 0) + ids.length;
}
console.log("   Distribution of imputed values:");
for (const [b, n] of Object.entries(dist).sort()) {
  console.log(`   ${b.padEnd(8)}  ${n} rows`);
}
console.log();

if (DRY_RUN) {
  console.log("🔎  DRY RUN — sample imputed values:");
  let shown = 0;
  for (const row of nullRows.slice(0, 20)) {
    const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
    const val = impute(row.major_name, u?.qs_rank, u?.overall_acceptance_rate);
    console.log(`    QS#${String(u?.qs_rank ?? "?").padStart(3)}  ${row.major_name.slice(0,38).padEnd(38)} univAR=${String(u?.overall_acceptance_rate ?? "n/a").slice(0,12).padEnd(12)} → ${val}%`);
    if (++shown >= 20) break;
  }
  console.log("\n✅  Dry run complete. Rerun without --dry-run to apply.");
  process.exit(0);
}

// ── Apply updates ─────────────────────────────────────────────────────────────

const BATCH = 500;

console.log("✍️   Applying updates...");
let total = 0;
for (const [val, ids] of byValue) {
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const { error } = await sb
      .from("majors")
      .update({ acceptance_rate: val })
      .in("id", chunk);
    if (error) console.error(`  ❌  val=${val}:`, error.message);
    else total += chunk.length;
  }
}

console.log(`\n✅  Updated ${total} rows.`);
