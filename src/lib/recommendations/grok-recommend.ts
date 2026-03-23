import { createAdminClient } from "@/lib/supabase/server";

type Tier = "reach" | "match" | "safety";

type CandidateUniversity = {
  id: string;
  name: string;
  country: string | null;
  qs_rank: number | null;
  size_category: string | null;
  region: string | null;
  focus: string | null;
  research: string | null;
  financial_aid: string | null;
  tuition_usd: number | null;
  overall_acceptance_rate: string | null;
  overall_score: number | null;
  eo_score: number | null;
  ar_score: number | null;
  er_score: number | null;
};

type CandidateRow = {
  id: string;
  university_id: string;
  major_name: string;
  acceptance_rate: number | null;
  ielts_min: number | null;
  gpa_min: number | null;
  sat_min: number | null;
  act_min: number | null;
  subject_ranking: number | null;
  major_embedding: number[] | string | null;
  universities: CandidateUniversity[] | CandidateUniversity;
};

type StudentStateRow = {
  id: string;
  gpa: number | null;
  ielts_score: number | null;
  sat_score: number | null;
  act_score: number | null;
  target_majors: string[] | null;
  preferred_countries: string[] | null;
  preferred_setting: string | null;
  preferred_size: string | null;
  budget_usd: number | null;
  needs_financial_aid: boolean | null;
  student_embedding: number[] | string | null;
};

type TierScores = {
  university_id: string;
  academic_alignment: number;
  financial_sustainability: number;
  student_success: number;
  lifestyle_culture: number;
  admission_chance: number;
  academic_alignment_description?: string;
  financial_sustainability_description?: string;
  student_success_description?: string;
  lifestyle_culture_description?: string;
  admission_chance_description?: string;
};

type TieredResult = Record<Tier, TierScores[]>;

export type RunGrokRecommendationInput = {
  studentId?: string;
  studentName?: string;
  dryRun?: boolean;
};

export type RunGrokRecommendationOutput = {
  student: { id: string; name: string };
  studentStateId: string;
  candidatesCount: number;
  filteredCount: number;
  persistedCount: number;
  tiered: TieredResult;
};

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

function parseEmbedding(v: unknown): number[] | null {
  if (!v) return null;
  if (Array.isArray(v)) return v as number[];
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as number[];
    } catch {
      return null;
    }
  }
  return null;
}

function cosineSimilarity(a: unknown, b: unknown): number {
  const pa = parseEmbedding(a);
  const pb = parseEmbedding(b);
  if (!pa || !pb || pa.length !== pb.length || pa.length === 0) return 50;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < pa.length; i++) {
    dot += pa[i]! * pb[i]!;
    normA += pa[i]! * pa[i]!;
    normB += pb[i]! * pb[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 50;
  const sim = dot / denom;
  return Math.round(((sim + 1) / 2) * 100);
}

function getUniversity(u: CandidateRow["universities"]): CandidateUniversity {
  return Array.isArray(u)
    ? (u[0] as CandidateUniversity)
    : (u as CandidateUniversity);
}

async function fetchCandidates(
  student: StudentStateRow,
): Promise<CandidateRow[]> {
  const sb = createAdminClient();
  const gpa = student.gpa ?? 0;
  const ielts = student.ielts_score ?? 0;
  const sat = student.sat_score ?? 0;
  const act = student.act_score ?? 0;
  const majors = student.target_majors ?? [];

  let q = sb.from("majors").select(
    `id, university_id, major_name, acceptance_rate, ielts_min, gpa_min,
     sat_min, act_min, subject_ranking, major_embedding,
     universities!inner(
       id, name, country, qs_rank, size_category, region, focus, research,
       financial_aid, tuition_usd, overall_acceptance_rate, overall_score,
       eo_score, ar_score, er_score
     )`,
  );

  if (majors.length) {
    q = q.or(
      majors
        .map((m) => `major_name.ilike.%${m.replace(/[%_]/g, "")}%`)
        .join(","),
    );
  }
  if (gpa > 0) q = q.or(`gpa_min.is.null,gpa_min.lte.${gpa + 0.5}`);
  if (ielts > 0) q = q.or(`ielts_min.is.null,ielts_min.lte.${ielts + 1.0}`);
  if (sat > 0) q = q.or(`sat_min.is.null,sat_min.lte.${sat + 100}`);
  if (act > 0) q = q.or(`act_min.is.null,act_min.lte.${act + 4}`);

  const { data, error } = await q.limit(1000);
  if (error) throw new Error(error.message);

  const best = new Map<string, CandidateRow>();
  for (const row of (data ?? []) as unknown as CandidateRow[]) {
    const prev = best.get(row.university_id);
    if (
      !prev ||
      (row.subject_ranking != null &&
        (prev.subject_ranking == null ||
          row.subject_ranking < prev.subject_ranking))
    ) {
      best.set(row.university_id, row);
    }
  }

  return [...best.values()].filter((row) => {
    const u = getUniversity(row.universities);
    return !(
      student.budget_usd &&
      u.tuition_usd &&
      u.tuition_usd > student.budget_usd * 1.5
    );
  });
}

async function runLLMScoring(
  student: StudentStateRow,
  candidates: Array<CandidateRow & { semanticFit: number }>,
): Promise<TieredResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const studentSummary = [
    student.gpa != null ? `GPA: ${student.gpa}` : null,
    student.ielts_score != null ? `IELTS: ${student.ielts_score}` : null,
    student.sat_score != null ? `SAT: ${student.sat_score}` : null,
    student.act_score != null ? `ACT: ${student.act_score}` : null,
    student.budget_usd != null
      ? `Budget: $${student.budget_usd.toLocaleString()}/yr`
      : null,
    student.needs_financial_aid ? "Needs financial aid" : null,
    student.target_majors?.length
      ? `Majors: ${student.target_majors.join(", ")}`
      : null,
    student.preferred_countries?.length
      ? `Countries: ${student.preferred_countries.join(", ")}`
      : null,
    student.preferred_setting ? `Setting: ${student.preferred_setting}` : null,
    student.preferred_size ? `Size: ${student.preferred_size}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  const candidateLines = candidates
    .map((c, i) => {
      const u = getUniversity(c.universities);
      let rate: string;
      if (c.acceptance_rate != null) {
        rate = `${Number(c.acceptance_rate).toFixed(1)}%`;
      } else {
        const rateRaw = u.overall_acceptance_rate ?? "";
        const cleaned = rateRaw.replace(/[%~\s<>]/g, "");
        const rangeM = cleaned.match(/^(\d+\.?\d*)-(\d+\.?\d*)$/);
        let num = rangeM
          ? (parseFloat(rangeM[1]!) + parseFloat(rangeM[2]!)) / 2
          : parseFloat(cleaned);
        if (!isNaN(num)) {
          if (num < 1) num *= 100;
          rate = `${num.toFixed(1)}%`;
        } else {
          rate = "unknown";
        }
      }

      const tuition = u.tuition_usd
        ? `$${u.tuition_usd.toLocaleString()}`
        : "unknown";
      const lines = [
        `${i + 1}. [${u.id}] ${u.name} — ${u.country ?? "?"}, QS #${u.qs_rank ?? "?"}`,
        `   Major: ${c.major_name} | Acceptance: ${rate} | Tuition: ${tuition}/yr`,
        `   Focus: ${u.focus ?? "?"} | Research: ${u.research ?? "?"} | Size: ${u.size_category ?? "?"} | Employment score: ${u.eo_score ?? "?"}`,
        `   Semantic fit: ${c.semanticFit}/100`,
      ];
      const reqs: string[] = [];
      if (c.gpa_min != null) reqs.push(`GPA min ${c.gpa_min}`);
      if (c.ielts_min != null) reqs.push(`IELTS min ${c.ielts_min}`);
      if (c.sat_min != null) reqs.push(`SAT min ${c.sat_min}`);
      if (c.act_min != null) reqs.push(`ACT min ${c.act_min}`);
      if (reqs.length) lines.push(`   Requirements: ${reqs.join(", ")}`);
      return lines.join("\n");
    })
    .join("\n\n");

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
    }
  ],
  "match":  [ ...5 items ],
  "safety": [ ...5 items ]
}`;

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
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 8000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from model");

  const jsonStr = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(jsonStr) as TieredResult;
}

export async function runGrokRecommendation(
  input: RunGrokRecommendationInput,
): Promise<RunGrokRecommendationOutput> {
  const sb = createAdminClient();
  const { studentId, studentName, dryRun = false } = input;

  if (!studentId && !studentName) {
    throw new Error("Provide studentId or studentName");
  }

  let studentRow: { id: string; name: string } | null = null;
  if (studentId) {
    const { data, error } = await sb
      .from("students")
      .select("id,name")
      .eq("id", studentId)
      .single();
    if (error || !data)
      throw new Error(
        `Student not found by id: ${error?.message ?? "unknown"}`,
      );
    studentRow = data as { id: string; name: string };
  } else {
    const { data, error } = await sb
      .from("students")
      .select("id,name")
      .ilike("name", `%${studentName}%`)
      .limit(5);
    if (error || !data?.length)
      throw new Error(
        `Student not found by name: ${error?.message ?? "unknown"}`,
      );
    studentRow = data[0] as { id: string; name: string };
  }

  const { data: states, error: stateErr } = await sb
    .from("student_states")
    .select("*, student_embedding")
    .eq("student_id", studentRow.id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (stateErr) throw new Error(stateErr.message);
  if (!states?.length) throw new Error("No student_states found");

  const student = states[0] as StudentStateRow;
  if (!student.student_embedding)
    throw new Error("No student_embedding on latest state");

  const rawCandidates = await fetchCandidates(student);
  if (rawCandidates.length < 15) {
    throw new Error(
      `Only ${rawCandidates.length} candidates after hard filter; need at least 15`,
    );
  }

  const ranked = rawCandidates
    .map((row) => ({
      ...row,
      semanticFit: cosineSimilarity(
        student.student_embedding,
        row.major_embedding,
      ),
    }))
    .sort((a, b) => b.semanticFit - a.semanticFit);

  const preferredCountries = (student.preferred_countries ?? []).map((c) =>
    c.toLowerCase(),
  );
  const countryFiltered =
    preferredCountries.length > 0
      ? ranked.filter((c) =>
          preferredCountries.includes(
            (getUniversity(c.universities).country ?? "").toLowerCase(),
          ),
        )
      : ranked;

  const targetMajors = (student.target_majors ?? []).map((m) =>
    m.toLowerCase(),
  );
  const majorFiltered =
    targetMajors.length > 0
      ? countryFiltered.filter((c) =>
          targetMajors.some(
            (m) =>
              c.major_name.toLowerCase().includes(m) ||
              m.includes(c.major_name.toLowerCase()),
          ),
        )
      : countryFiltered;

  const pool = majorFiltered.length >= 15 ? majorFiltered : countryFiltered;
  const top20 = pool.slice(0, 20);
  const tiered = await runLLMScoring(student, top20);

  const candidateMap = new Map(
    ranked.map((c) => [getUniversity(c.universities).id, c]),
  );

  const allRecs: Array<{ tier: Tier; majorId: string; scores: TierScores }> =
    [];
  for (const tier of ["reach", "match", "safety"] as Tier[]) {
    const items = tiered[tier] ?? [];
    for (const item of items) {
      const c = candidateMap.get(item.university_id);
      if (!c) continue;
      allRecs.push({ tier, majorId: c.id, scores: item });
    }
  }

  const seen = new Set<string>();
  const deduped = allRecs.filter((r) => {
    if (seen.has(r.majorId)) return false;
    seen.add(r.majorId);
    return true;
  });

  if (!dryRun) {
    const { error: delErr } = await sb
      .from("recommendations")
      .delete()
      .eq("student_state_id", student.id);
    if (delErr) throw new Error(delErr.message);

    const rows = deduped.map(({ tier, majorId, scores }) => ({
      student_state_id: student.id,
      major_id: majorId,
      match_category: tier,
      academic_alignment: scores.academic_alignment,
      financial_sustainability: scores.financial_sustainability,
      student_success: scores.student_success,
      lifestyle_culture: scores.lifestyle_culture,
      admission_chance: scores.admission_chance,
      academic_alignment_description: scores.academic_alignment_description,
      financial_sustainability_description: scores.financial_sustainability_description,
      student_success_description: scores.student_success_description,
      lifestyle_culture_description: scores.lifestyle_culture_description,
      admission_chance_description: scores.admission_chance_description,
    }));

    const { error: insErr } = await sb.from("recommendations").insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  return {
    student: studentRow!,
    studentStateId: student.id,
    candidatesCount: rawCandidates.length,
    filteredCount: pool.length,
    persistedCount: dryRun ? 0 : deduped.length,
    tiered,
  };
}
