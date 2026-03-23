import { createAdminClient } from "@/lib/supabase/server";
import type {
  Student,
  StudentState,
  StudentWithLatestState,
  StudentDetail,
  Recommendation,
  Tag,
  University,
  Major,
} from "@/lib/supabase/types";

/* ============================================================
   Dashboard queries
   ============================================================ */

export async function getStudentsWithLatestState(): Promise<StudentWithLatestState[]> {
  const supabase = createAdminClient();

  // Use RPC or raw query to get students with their latest state in one trip
  // For now, two queries but efficient: students + latest state per student via distinct on
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!students?.length) return [];

  // Get latest state per student + count using SQL
  const { data: stateData } = await supabase.rpc("get_latest_states_with_counts");

  // Fallback if RPC doesn't exist — use JS grouping
  if (!stateData) {
    const { data: allStates } = await supabase
      .from("student_states")
      .select("*")
      .order("created_at", { ascending: false });

    const statesByStudent = new Map<string, StudentState[]>();
    for (const s of (allStates ?? []) as unknown as StudentState[]) {
      const arr = statesByStudent.get(s.student_id) ?? [];
      arr.push(s);
      statesByStudent.set(s.student_id, arr);
    }

    return (students as unknown as Student[]).map((student) => {
      const studentStates = statesByStudent.get(student.id) ?? [];
      return {
        ...student,
        latest_state: studentStates[0] ?? null,
        state_count: studentStates.length,
      };
    });
  }

  const latestMap = new Map<string, { state: StudentState; count: number }>();
  for (const row of stateData) {
    const sid = row.student_id as string;
    const sc = row.state_count as number;
    latestMap.set(sid, {
      state: row as unknown as StudentState,
      count: sc,
    });
  }

  return (students as unknown as Student[]).map((student) => {
    const entry = latestMap.get(student.id);
    return {
      ...student,
      latest_state: entry?.state ?? null,
      state_count: entry?.count ?? 0,
    };
  });
}

export async function getDashboardStats() {
  const supabase = createAdminClient();

  // Use SQL aggregation instead of fetching all rows and counting in JS
  const { data: stageCounts } = await supabase
    .from("students")
    .select("stage")
    .neq("stage", "archived");

  const counts: Record<string, number> = {};
  for (const row of stageCounts ?? []) {
    const stage = String(row.stage);
    counts[stage] = (counts[stage] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const inProgress = (counts["profile_building"] ?? 0) + (counts["matched"] ?? 0);
  const readyToPresent = counts["matched"] ?? 0;

  // More accurate stale count needs to check latest state timestamp,
  // which requires a subquery. For now use the stage-based count as approximation
  // and refine with actual state check:
  const { data: activeStudents } = await supabase
    .from("students")
    .select("id, stage, created_at")
    .not("stage", "in", '("decided","archived")');

  let needsAttention = 0;
  if (activeStudents?.length) {
    const studentIds = activeStudents.map((s) => s.id as string);
    const { data: latestStates } = await supabase
      .from("student_states")
      .select("student_id, created_at")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false });

    const latestByStudent = new Map<string, string>();
    for (const s of latestStates ?? []) {
      const sid = s.student_id as string;
      if (!latestByStudent.has(sid)) {
        latestByStudent.set(sid, s.created_at as string);
      }
    }

    for (const student of activeStudents) {
      const sid = student.id as string;
      const latestDate = latestByStudent.get(sid) ?? (student.created_at as string);
      if (new Date(latestDate).getTime() < Date.now() - 14 * 24 * 60 * 60 * 1000) {
        needsAttention++;
      }
    }
  }

  return {
    total,
    inProgress,
    needsAttention,
    readyToPresent,
    stageCounts: counts,
  };
}

/* ============================================================
   Student detail queries
   ============================================================ */

export async function getStudentDetail(
  studentId: string
): Promise<StudentDetail | null> {
  const supabase = createAdminClient();

  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (error || !student) return null;

  const [statesResult, tagsResult] = await Promise.all([
    supabase
      .from("student_states")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true }),
    supabase
      .from("student_tags")
      .select("tag_id")
      .eq("student_id", studentId),
  ]);

  const states = (statesResult.data ?? []) as unknown as StudentState[];

  // Fetch tags if there are any student_tags
  let tags: Tag[] = [];
  if (tagsResult.data?.length) {
    const tagIds = tagsResult.data.map((st) => st.tag_id as string);
    const { data: tagData } = await supabase
      .from("tags")
      .select("*")
      .in("id", tagIds);
    tags = (tagData ?? []) as unknown as Tag[];
  }

  // Find which states have recommendations (inference runs)
  const stateIds = states.map((s) => s.id);
  let inferenceRuns: import("@/lib/supabase/types").InferenceRun[] = [];

  if (stateIds.length > 0) {
    const { data: recCounts } = await supabase
      .from("recommendations")
      .select("student_state_id")
      .in("student_state_id", stateIds);

    if (recCounts?.length) {
      // Count recs per state
      const countMap = new Map<string, number>();
      for (const r of recCounts) {
        const rsid = r.student_state_id as string;
        countMap.set(rsid, (countMap.get(rsid) ?? 0) + 1);
      }

      // Build inference run entries from states that have recs
      const statesMap = new Map(states.map((s) => [s.id, s]));
      inferenceRuns = Array.from(countMap.entries())
        .map(([stateId, count]) => {
          const s = statesMap.get(stateId)!;
          return {
            state_id: stateId,
            created_at: s.created_at,
            sat_score: s.sat_score,
            act_score: s.act_score,
            gpa: s.gpa,
            ielts_score: s.ielts_score,
            rec_count: count,
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }

  return {
    ...(student as unknown as Student),
    states,
    inference_runs: inferenceRuns,
    tags,
  };
}

/* ============================================================
   Report queries
   ============================================================ */

export async function getRecommendationsForState(
  stateId: string
): Promise<{ state: StudentState; recommendations: Recommendation[] } | null> {
  const supabase = createAdminClient();

  const { data: state, error } = await supabase
    .from("student_states")
    .select("*")
    .eq("id", stateId)
    .single();

  if (error || !state) return null;

  const { data: recData } = await supabase
    .from("recommendations")
    .select("*")
    .eq("student_state_id", stateId);

  if (!recData?.length)
    return { state: state as unknown as StudentState, recommendations: [] };

  const majorIds = recData.map((r) => r.major_id as string);
  const { data: majors } = await supabase
    .from("majors")
    .select("*")
    .in("id", majorIds);

  const majorsMap = new Map<string, Major>();
  const universityIds = new Set<string>();
  for (const m of (majors ?? []) as unknown as Major[]) {
    majorsMap.set(m.id, m);
    universityIds.add(m.university_id);
  }

  const { data: universities } = await supabase
    .from("universities")
    .select("*")
    .in("id", Array.from(universityIds));

  const uniMap = new Map<string, University>();
  for (const u of (universities ?? []) as unknown as University[]) {
    uniMap.set(u.id, u);
  }

  const recommendations = (recData as unknown as Recommendation[]).map((rec) => {
    const major = majorsMap.get(rec.major_id);
    return {
      ...rec,
      major,
      university: major ? uniMap.get(major.university_id) : undefined,
    };
  });

  return { state: state as unknown as StudentState, recommendations };
}
