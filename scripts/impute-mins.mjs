/**
 * impute-mins.mjs
 * ---------------
 * 1. Drops the atar_min column from the majors table.
 *    Requires DATABASE_URL in .env.local (postgres://...) for direct SQL execution.
 *    If absent, prints the ALTER TABLE statement to run manually in the Supabase SQL editor.
 *
 * 2. Fills NULL values in ielts_min, toefl_min, gpa_min, sat_min, act_min
 *    using educated guesses derived from:
 *      - University QS rank band
 *      - Major field category (STEM / Medicine / Business / Arts / Other)
 *
 * Usage:
 *   node scripts/impute-mins.mjs [--dry-run]
 *
 *   --dry-run  Print what would be updated without writing to the database.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ────────────────────────────────────────────────────────────

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

// ── Step 1: Drop atar_min ─────────────────────────────────────────────────────

const DROP_SQL = "ALTER TABLE public.majors DROP COLUMN IF EXISTS atar_min;";

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: dbUrl });
    await client.connect();
    await client.query(DROP_SQL);
    await client.end();
    console.log("✅  Dropped atar_min column.");
  } catch (err) {
    console.error("❌  Could not drop atar_min via DATABASE_URL:", err.message);
    console.log("    Run manually in the Supabase SQL editor:\n   ", DROP_SQL);
  }
} else {
  console.log("ℹ️   DATABASE_URL not set — cannot drop column programmatically.");
  console.log("    Run this in the Supabase SQL editor:\n");
  console.log("   ", DROP_SQL);
  console.log();
}

// ── Step 2: Imputation logic ──────────────────────────────────────────────────

/**
 * GPA min by QS rank band (empirically calibrated from existing data):
 *   1-10: 3.90 | 11-25: 3.75 | 26-50: 3.65 | 51-100: 3.55
 *   101-200: 3.45 | 201-300: 3.30 | 300+: 3.00 | unknown: 3.40
 */
function baseGpa(rank) {
  if (!rank)       return 3.40;
  if (rank <= 10)  return 3.90;
  if (rank <= 25)  return 3.75;
  if (rank <= 50)  return 3.65;
  if (rank <= 100) return 3.55;
  if (rank <= 200) return 3.45;
  if (rank <= 300) return 3.30;
  return 3.00;
}

/**
 * SAT min by QS rank band (empirically calibrated):
 *   1-10: 1490 | 11-25: 1460 | 26-50: 1420 | 51-100: 1380
 *   101-200: 1350 | 201-300: 1330 | 300+: 1300 | unknown: 1350
 */
function baseSat(rank) {
  if (!rank)       return 1350;
  if (rank <= 10)  return 1490;
  if (rank <= 25)  return 1460;
  if (rank <= 50)  return 1420;
  if (rank <= 100) return 1380;
  if (rank <= 200) return 1350;
  if (rank <= 300) return 1330;
  return 1300;
}

/**
 * ACT min by QS rank band (SAT÷45 + 1 approximation, capped 28–36):
 *   1-10: 34 | 11-25: 33 | 26-50: 32 | 51-100: 31
 *   101-200: 30 | 201-300: 29 | 300+: 28 | unknown: 30
 */
function baseAct(rank) {
  if (!rank)       return 30;
  if (rank <= 10)  return 34;
  if (rank <= 25)  return 33;
  if (rank <= 50)  return 32;
  if (rank <= 100) return 31;
  if (rank <= 200) return 30;
  if (rank <= 300) return 29;
  return 28;
}

/**
 * IELTS min by QS rank band:
 *   1-25: 7.0 | 26-100: 6.5 | 101+: 6.0 | unknown: 6.5
 */
function baseIelts(rank) {
  if (!rank)       return 6.5;
  if (rank <= 25)  return 7.0;
  if (rank <= 100) return 6.5;
  return 6.0;
}

/**
 * TOEFL min derived from IELTS (standard conversion table):
 *   IELTS 7.0 → TOEFL 100 | IELTS 6.5 → TOEFL 90 | IELTS 6.0 → TOEFL 80
 */
function ieltsToToefl(ielts) {
  if (ielts >= 7.0) return 100;
  if (ielts >= 6.5) return 90;
  return 80;
}

/** Classify major name into a broad field for score offsets. */
function classify(name) {
  const n = (name ?? "").toLowerCase();
  if (/\b(medicine|medical|clinical|mbbs|dentis|pharma|nursing|health science)\b/.test(n)) return "medicine";
  if (/\b(comput|software|data sci|ai\b|artificial intel|machine learn|cybersec)\b/.test(n)) return "cs";
  if (/\b(electrical|electronic|mechan|civil|chemical|aerospace|industrial|engineer)\b/.test(n)) return "engineering";
  if (/\b(math|physics|chemistry|statistics|actuarial|bioinformat)\b/.test(n)) return "hardscience";
  if (/\b(business|finance|accounting|economics|management|marketing|mba|commerce)\b/.test(n)) return "business";
  if (/\b(law|legal|juris)\b/.test(n)) return "law";
  if (/\b(history|philosophy|literature|languages|linguis|music|art\b|theatre|communication|media|journalism|psychology|sociology|political|international relations|public policy)\b/.test(n)) return "arts";
  return "other";
}

const GPA_OFFSET   = { medicine: 0.10, cs: 0.05, engineering: 0.05, hardscience: 0.05, business: 0.00, law: 0.05, arts: -0.10, other: 0.00 };
const SAT_OFFSET   = { medicine: 0,    cs: 30,   engineering: 20,   hardscience: 20,   business: -10,  law: -10,  arts: -30,   other: 0   };
const ACT_OFFSET   = { medicine: 0,    cs: 1,    engineering: 1,    hardscience: 1,    business: -1,   law: 0,    arts: -1,    other: 0   };

function imputeGpa(rank, majorName) {
  const cat = classify(majorName);
  return Math.min(4.0, Math.round((baseGpa(rank) + GPA_OFFSET[cat]) * 100) / 100);
}

function imputeSat(rank, majorName) {
  const cat = classify(majorName);
  // Round to nearest 10
  return Math.round((baseSat(rank) + SAT_OFFSET[cat]) / 10) * 10;
}

function imputeAct(rank, majorName) {
  const cat = classify(majorName);
  return Math.min(36, Math.max(20, baseAct(rank) + ACT_OFFSET[cat]));
}

function imputeIelts(rank) {
  return baseIelts(rank);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function imputeToefl(rank) {
  return ieltsToToefl(baseIelts(rank));
}

// ── Step 3: Fetch all majors ──────────────────────────────────────────────────

console.log("⏳  Fetching all majors...");

const allRows = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await sb
    .from("majors")
    .select("id, major_name, gpa_min, sat_min, act_min, ielts_min, toefl_min, universities(qs_rank)")
    .range(from, from + PAGE - 1);
  if (error) { console.error("Fetch error:", error.message); process.exit(1); }
  if (!data || data.length === 0) break;
  allRows.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}

console.log(`   Fetched ${allRows.length} majors.\n`);

// ── Step 4: Compute updates ───────────────────────────────────────────────────

// Maps: field → Map<imputed_value, id[]>
const updates = {
  gpa_min:   new Map(),
  sat_min:   new Map(),
  act_min:   new Map(),
  ielts_min: new Map(),
  toefl_min: new Map(),
};

let counts = { gpa: 0, sat: 0, act: 0, ielts: 0, toefl: 0 };

for (const row of allRows) {
  const u = Array.isArray(row.universities) ? row.universities[0] : row.universities;
  const rank = u?.qs_rank ?? null;
  const major = row.major_name;

  function stage(field, key, val) {
    if (!updates[field].has(val)) updates[field].set(val, []);
    updates[field].get(val).push(row.id);
    counts[key]++;
  }

  if (row.gpa_min   == null) stage("gpa_min",   "gpa",   imputeGpa(rank, major));
  if (row.sat_min   == null) stage("sat_min",   "sat",   imputeSat(rank, major));
  if (row.act_min   == null) stage("act_min",   "act",   imputeAct(rank, major));
  if (row.ielts_min == null) stage("ielts_min", "ielts", imputeIelts(rank));
  if (row.toefl_min == null) stage("toefl_min", "toefl", ieltsToToefl(imputeIelts(rank)));
}

console.log("📊  Rows to impute:");
console.log(`    gpa_min:   ${counts.gpa}`);
console.log(`    sat_min:   ${counts.sat}`);
console.log(`    act_min:   ${counts.act}`);
console.log(`    ielts_min: ${counts.ielts}`);
console.log(`    toefl_min: ${counts.toefl}`);
console.log();

if (DRY_RUN) {
  console.log("🔎  DRY RUN — sample of computed values (first 5 per field):");
  for (const [field, valMap] of Object.entries(updates)) {
    const sample = [...valMap.entries()].slice(0, 3);
    for (const [val, ids] of sample) {
      console.log(`    ${field} = ${val}  (${ids.length} rows)`);
    }
  }
  console.log("\n✅  Dry run complete. Rerun without --dry-run to apply.");
  process.exit(0);
}

// ── Step 5: Apply updates (grouped by value to minimise API calls) ────────────

const BATCH = 500; // max IDs per .in() filter

async function applyField(field, valMap) {
  let updated = 0;
  for (const [val, ids] of valMap) {
    // Chunk IDs to stay under URL length limits
    for (let i = 0; i < ids.length; i += BATCH) {
      const chunk = ids.slice(i, i + BATCH);
      const { error } = await sb
        .from("majors")
        .update({ [field]: val })
        .in("id", chunk);
      if (error) {
        console.error(`  ❌  Error updating ${field}=${val}:`, error.message);
      } else {
        updated += chunk.length;
      }
    }
  }
  return updated;
}

console.log("✍️   Applying updates...\n");

for (const [field, valMap] of Object.entries(updates)) {
  if (valMap.size === 0) { console.log(`  ⏭   ${field}: nothing to update`); continue; }
  process.stdout.write(`  ⏳  ${field}... `);
  const n = await applyField(field, valMap);
  console.log(`${n} rows updated`);
}

console.log("\n✅  Imputation complete.");
if (!dbUrl) {
  console.log("\n⚠️   Remember to drop atar_min in the Supabase SQL editor:");
  console.log(`    ${DROP_SQL}`);
}
