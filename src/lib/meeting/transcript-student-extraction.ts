import { z } from "zod";
import type { MeetingUtterance } from "@/lib/supabase/types";

/** Matches `createStudent` in `src/app/(app)/dashboard/actions.ts` (LLM output + API). */
export const studentFromTranscriptPayloadSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  grade: z.union([z.string(), z.null()]).optional(),
  dob: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      z.null(),
      z.literal(""),
    ])
    .optional(),
  snapshot: z
    .object({
      sat_score: z.number().nullable().optional(),
      act_score: z.number().nullable().optional(),
      gpa: z.number().nullable().optional(),
      ielts_score: z.number().nullable().optional(),
      target_majors: z.array(z.string()).nullable().optional(),
      preferred_countries: z.array(z.string()).nullable().optional(),
      preferred_setting: z.string().nullable().optional(),
      preferred_size: z.string().nullable().optional(),
      budget_usd: z.number().nullable().optional(),
      needs_financial_aid: z.boolean().nullable().optional(),
      target_acceptance_rate_min: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type StudentFromTranscriptPayload = z.infer<
  typeof studentFromTranscriptPayloadSchema
>;

export type CreateStudentInput = {
  name: string;
  grade?: string | null;
  dob?: string | null;
  snapshot?: {
    sat_score?: number | null;
    act_score?: number | null;
    gpa?: number | null;
    ielts_score?: number | null;
    target_majors?: string[] | null;
    preferred_countries?: string[] | null;
    preferred_setting?: string | null;
    preferred_size?: string | null;
    budget_usd?: number | null;
    needs_financial_aid?: boolean | null;
    target_acceptance_rate_min?: number | null;
  } | null;
};

function snapshotHasMeaningfulData(
  s: NonNullable<NonNullable<StudentFromTranscriptPayload["snapshot"]>>,
): boolean {
  const arrays = [s.target_majors, s.preferred_countries].filter(Boolean) as string[][];
  if (arrays.some((a) => a.length > 0)) return true;
  if (s.sat_score != null || s.act_score != null || s.gpa != null || s.ielts_score != null)
    return true;
  if (s.budget_usd != null || s.target_acceptance_rate_min != null) return true;
  if (s.needs_financial_aid != null) return true;
  const strs = [s.preferred_setting, s.preferred_size].filter(Boolean) as string[];
  if (strs.some((t) => t.trim().length > 0)) return true;
  return false;
}

/** Normalize LLM output for `createStudent`. */
export function toCreateStudentInput(
  payload: StudentFromTranscriptPayload,
): CreateStudentInput {
  const grade =
    payload.grade === undefined || payload.grade === null
      ? null
      : payload.grade.trim() || null;
  let dob: string | null = null;
  if (payload.dob && payload.dob !== "") dob = payload.dob;

  let snapshot: CreateStudentInput["snapshot"] = null;
  if (payload.snapshot && snapshotHasMeaningfulData(payload.snapshot)) {
    const snap = payload.snapshot;
    snapshot = {
      sat_score: snap.sat_score ?? null,
      act_score: snap.act_score ?? null,
      gpa: snap.gpa ?? null,
      ielts_score: snap.ielts_score ?? null,
      target_majors:
        snap.target_majors?.filter((x) => x.trim().length > 0).length ?
          snap.target_majors!.map((x) => x.trim())
        : null,
      preferred_countries:
        snap.preferred_countries?.filter((x) => x.trim().length > 0).length ?
          snap.preferred_countries!.map((x) => x.trim())
        : null,
      preferred_setting: snap.preferred_setting?.trim() || null,
      preferred_size: snap.preferred_size?.trim() || null,
      budget_usd: snap.budget_usd ?? null,
      needs_financial_aid: snap.needs_financial_aid ?? null,
      target_acceptance_rate_min: snap.target_acceptance_rate_min ?? null,
    };
  }

  return {
    name: payload.name.trim(),
    grade,
    dob,
    snapshot,
  };
}

export function formatUtterancesForLlm(
  utterances: MeetingUtterance[],
  meetingTitle: string,
): string {
  const header = `Meeting title: ${meetingTitle}\n\nTranscript (chronological):\n`;
  const lines = utterances.map((u) => {
    const who = u.role === "host" ? `Host (${u.speaker ?? "Host"})` : `Guest (${u.speaker ?? "Guest"})`;
    return `[${who}] ${u.text}`;
  });
  return header + lines.join("\n");
}

function parseJsonFromAssistantContent(content: string): unknown {
  const trimmed = content.trim();
  const fence =
    /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed) ??
    /^```\s*([\s\S]*?)```$/m.exec(trimmed);
  const jsonStr = fence ? fence[1]!.trim() : trimmed;
  return JSON.parse(jsonStr) as unknown;
}

const SYSTEM_PROMPT = `You are an assistant for college counselors. Given a meeting transcript between a host (counselor) and a guest (student or family), extract a structured student profile for our database.

Rules:
- Focus on facts about the student (the guest). The host may restate or confirm information — prefer guest statements when they conflict.
- "name" must be the student's preferred full name as stated in the conversation. If only a first name is given, use that.
- "grade" is a short label (e.g. "11", "Year 12", "Senior") or null if unknown.
- "dob" must be ISO date YYYY-MM-DD or null. Only set if explicitly stated or clearly inferable (otherwise null).
- "snapshot" holds academics and preferences: SAT, ACT, GPA, IELTS, target majors (array), preferred countries (array), campus setting (e.g. urban/suburban/rural), school size preference, budget in USD, financial aid need (boolean), minimum acceptable acceptance rate (0–1 or percentage as decimal if clearly stated).
- Use null for any unknown numeric or string field. Omit arrays or use empty arrays only when the model explicitly said they have no preference; otherwise null is safer.
- Respond with a single JSON object only, no markdown outside JSON. Keys: name (string), grade (string|null), dob (string|null), snapshot (object|null). The snapshot object uses the field names: sat_score, act_score, gpa, ielts_score, target_majors, preferred_countries, preferred_setting, preferred_size, budget_usd, needs_financial_aid, target_acceptance_rate_min. All optional inside snapshot; use null for missing.`;

export async function extractStudentPayloadWithOpenAI(
  transcriptText: string,
): Promise<StudentFromTranscriptPayload> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.4";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: transcriptText },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (content == null || content === "") {
    throw new Error("Empty response from model");
  }

  let parsed: unknown;
  try {
    parsed = parseJsonFromAssistantContent(content);
  } catch {
    throw new Error("Model did not return valid JSON");
  }

  const result = studentFromTranscriptPayloadSchema.safeParse(parsed);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join("; ");
    throw new Error(`Invalid structured output: ${msg}`);
  }

  return result.data;
}
