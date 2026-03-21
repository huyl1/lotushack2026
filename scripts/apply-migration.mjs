/**
 * apply-migration.mjs
 * Applies a SQL file directly to the remote Supabase project
 * via the Management API using a personal access token.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=<pat> node scripts/apply-migration.mjs <sql-file>
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root    = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1 || line.trim().startsWith("#")) continue;
    const k = line.slice(0, eq).trim(), v = line.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const pat        = process.env.SUPABASE_ACCESS_TOKEN;
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const projectRef = projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const sqlFile    = process.argv[2];

if (!pat)        { console.error("❌  Set SUPABASE_ACCESS_TOKEN env var"); process.exit(1); }
if (!projectRef) { console.error("❌  Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL"); process.exit(1); }
if (!sqlFile || !existsSync(sqlFile)) { console.error("❌  Usage: node scripts/apply-migration.mjs <sql-file>"); process.exit(1); }

const sql = readFileSync(sqlFile, "utf8");
console.log(`Applying ${sqlFile} to project ${projectRef}...`);

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${pat}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`❌  ${res.status}: ${body}`);
  process.exit(1);
}

console.log("✅  Migration applied successfully.");
