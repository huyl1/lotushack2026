/**
 * Mirrors python/scripts/embed_students.py + python/embeddings/pipeline.py
 * so server-side student creation can embed the new student_state in one step.
 */

const SEPARATOR = " | ";

export type StudentEmbedField = {
  name: string;
  weight: number;
  label: string;
};

/** Same order, weights, and labels as STUDENT_FIELDS in embed_students.py */
export const STUDENT_EMBED_FIELDS: StudentEmbedField[] = [
  { name: "left_overtime", weight: 4.0, label: "Months Until First Fall Semester" },
  { name: "name", weight: 4.0, label: "Student Name" },
  { name: "grade", weight: 3.0, label: "Grade Level" },
  { name: "sat_score", weight: 3.0, label: "SAT Score" },
  { name: "act_score", weight: 3.0, label: "ACT Score" },
  { name: "ielts_score", weight: 2.5, label: "IELTS Score" },
  { name: "gpa", weight: 3.5, label: "GPA" },
  { name: "target_majors", weight: 3.0, label: "Target Majors" },
  { name: "preferred_countries", weight: 2.5, label: "Preferred Countries" },
  { name: "preferred_setting", weight: 1.5, label: "Preferred Campus Setting" },
  { name: "preferred_size", weight: 1.0, label: "Preferred Campus Size" },
  { name: "budget_usd", weight: 2.5, label: "Budget (USD)" },
  { name: "needs_financial_aid", weight: 2.5, label: "Needs Financial Aid" },
  { name: "target_acceptance_rate_min", weight: 2.0, label: "Minimum Acceptance Rate Desired" },
  { name: "application_round", weight: 1.5, label: "Application Round" },
];

function repetitions(weight: number): number {
  return Math.max(1, Math.round(weight));
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value).trim();
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/** Same as EmbeddingPipeline.build_text (embeddings/pipeline.py) */
export function buildStudentEmbedText(row: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const fc of STUDENT_EMBED_FIELDS) {
    const value = row[fc.name];
    if (isEmptyValue(value)) continue;
    const snippet = `${fc.label}: ${formatFieldValue(value)}`.trim();
    for (let i = 0; i < repetitions(fc.weight); i++) {
      parts.push(snippet);
    }
  }
  return parts.join(SEPARATOR);
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;
  const normalized = raw.replace("Z", "+00:00");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseGrade(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return [9, 10, 11, 12].includes(value) ? value : null;

  const raw = String(value).trim().toLowerCase();
  const numeric: Record<string, number> = { "9": 9, "10": 10, "11": 11, "12": 12 };
  if (raw in numeric) return numeric[raw];

  const aliases: Record<string, number> = {
    freshman: 9,
    "9th": 9,
    "grade 9": 9,
    sophomore: 10,
    "10th": 10,
    "grade 10": 10,
    junior: 11,
    "11th": 11,
    "grade 11": 11,
    senior: 12,
    "12th": 12,
    "grade 12": 12,
  };
  return aliases[raw] ?? null;
}

function monthsUntilAugust(refYear: number, refMonth: number, yearsFromNow: number): number {
  const targetYear = refYear + yearsFromNow;
  const monthDiff = (targetYear - refYear) * 12 + (8 - refMonth);
  return Math.max(monthDiff, 0);
}

/** Same as compute_left_overtime in embed_students.py */
export function computeLeftOvertime(
  grade: string | number | null | undefined,
  signupDate: Date | null,
): number | null {
  const gradeNum = parseGrade(grade);
  if (gradeNum === null) return null;

  const ref = signupDate ?? new Date();
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth() + 1;
  const yearsToFirstFall = 12 - gradeNum + (m >= 9 ? 1 : 0);
  return monthsUntilAugust(y, m, yearsToFirstFall);
}

/** Same as enrich_row_with_left_overtime in embed_students.py */
export function enrichRowWithLeftOvertime(row: Record<string, unknown>): Record<string, unknown> {
  const enriched = { ...row };
  const grade = row.grade ?? row.student_grade;
  const signup = parseDate(row.created_at as string | undefined);
  const leftOvertime = computeLeftOvertime(grade as string | number | null | undefined, signup);
  if (leftOvertime !== null) {
    enriched.left_overtime = leftOvertime;
  }
  return enriched;
}

const VOYAGE_EMBEDDINGS_URL = "https://api.voyageai.com/v1/embeddings";

/** Same model / options as EmbeddingConfig in pipeline.py */
export async function embedTextsVoyage(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set");
  }
  if (texts.length === 0) return [];

  const res = await fetch(VOYAGE_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "voyage-3",
      input: texts,
      input_type: "document",
      truncation: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Voyage embeddings failed (${res.status}): ${errText}`);
  }

  const json = (await res.json()) as {
    data?: Array<{ embedding?: number[]; index?: number }>;
  };
  const data = json.data;
  if (!data?.length) {
    throw new Error("Voyage embeddings: empty data");
  }
  const sorted = [...data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return sorted.map((d) => {
    if (!d.embedding?.length) throw new Error("Voyage embeddings: missing vector");
    return d.embedding;
  });
}

/** pgvector-friendly string for Supabase */
export function embeddingToPgVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
