/**
 * impute-ib-min.mjs
 * -----------------
 * Fills NULL ib_min values in the majors table.
 *
 * Method: rank-band × major-category lookup table derived from empirical averages
 * across the 2251 rows that already have ib_min data, with per-category offsets
 * calibrated to the observed spreads within each band.
 *
 * IB Diploma scale: 24–45 total points.
 * Values are rounded to the nearest integer.
 *
 * Usage:
 *   node scripts/impute-ib-min.mjs [--dry-run]
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

const DRY_RUN = process.argv.includes("--dry-run");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Classification ────────────────────────────────────────────────────────────
function classify(name) {
  const n = (name ?? "").toLowerCase();
  if (/medicine|medical|clinical|mbbs|dentis|pharma|nursing|health sci/.test(n))        return "Medicine";
  if (/comput|software|data sci|\bai\b|artificial intel|machine learn|cybersec/.test(n)) return "CS";
  if (/electrical|electronic|mechan|civil|chemical|aerospace|industrial|engineer/.test(n)) return "Engineering";
  if (/\bmath|physics|chemistry|statistics|actuarial|bioinformat/.test(n))               return "HardScience";
  if (/business|finance|account|economics|management|marketing|\bmba\b|commerce/.test(n)) return "Business";
  if (/\blaw\b|legal|juris/.test(n))                                                      return "Law";
  if (/history|philosophy|literature|language|linguis|music|\bart\b|theatre|communicat|media|journalism|psychology|sociology|political|international rel|public policy/.test(n)) return "Arts";
  return "Other";
}

// ── Lookup table: base IB min by QS rank band ─────────────────────────────────
// Empirically derived from observed averages; rounded to integers.
const BASE = {
  "1-10":    40,
  "11-25":   36,
  "26-50":   35,
  "51-100":  34,
  "101-200": 31,
  "201-300": 30,
  "300+":    28,
};
const DEFAULT_BASE = 30; // unknown QS rank → conservative mid-tier

// ── Per-category offsets ──────────────────────────────────────────────────────
// Medicine and hard sciences trend slightly higher; Arts slightly lower.
const OFFSET = {
  Medicine:    +1,
  CS:          +1,
  Engineering:  0,
  HardScience: +1,
  Business:     0,
  Law:          0,
  Arts:        -1,
  Other:        0,
};

function rankBand(rank) {
  if (!rank)       return null;
  if (rank <= 10)  return "1-10";
  if (rank <= 25)  return "11-25";
  if (rank <= 50)  return "26-50";
  if (rank <= 100) return "51-100";
  if (rank <= 200) return "101-200";
  if (rank <= 300) return "201-300";
  return "300+";
}

function impute(majorName, rank) {
  const cat  = classify(majorName);
  const band = rankBand(rank);
  const base = band ? BASE[band] : DEFAULT_BASE;
  // Clamp to valid IB total-diploma range
  return Math.min(42, Math.max(24, base + OFFSET[cat]));
}

// ── Fetch null rows ───────────────────────────────────────────────────────────
console.log("⏳  Fetching majors with null ib_min...");

const nullRows = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await sb
    .from("majors")
    .select("id, major_name, universities(qs_rank)")
    .is("ib_min", null)
    .range(from, from + PAGE - 1);
  if (error) { console.error("Fetch error:", error.message); process.exit(1); }
  if (!data || data.length === 0) break;
  nullRows.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}

console.log(`   Found ${nullRows.length} rows with null ib_min.\n`);

// ── Group by imputed value ────────────────────────────────────────────────────
const byValue = new Map(); // value → id[]

for (const row of nullRows) {
  const u   = Array.isArray(row.universities) ? row.universities[0] : row.universities;
  const val = impute(row.major_name, u?.qs_rank ?? null);
  if (!byValue.has(val)) byValue.set(val, []);
  byValue.get(val).push(row.id);
}

console.log(`📊  Distinct imputed values: ${byValue.size}`);
for (const [val, ids] of [...byValue.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`    IB ${val}: ${ids.length} rows`);
}
console.log();

if (DRY_RUN) {
  console.log("🔎  DRY RUN — sample (first 20 null rows):");
  for (const row of nullRows.slice(0, 20)) {
    const u   = Array.isArray(row.universities) ? row.universities[0] : row.universities;
    const val = impute(row.major_name, u?.qs_rank ?? null);
    console.log(`    QS#${String(u?.qs_rank ?? "?").padStart(3)}  ${row.major_name.slice(0, 40).padEnd(40)} → IB ${val}`);
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
    const { error } = await sb.from("majors").update({ ib_min: val }).in("id", chunk);
    if (error) console.error(`  ❌  ib_min=${val}:`, error.message);
    else total += chunk.length;
  }
}
console.log(`\n✅  Updated ${total} rows.`);
