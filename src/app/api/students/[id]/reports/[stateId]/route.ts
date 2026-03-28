import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Student,
  StudentState,
  Recommendation,
  Major,
  University,
} from "@/lib/supabase/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; stateId: string }> },
) {
  const { id: studentId, stateId } = await params;

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Fetch student, state, and recommendations in parallel
    const [studentResult, stateResult, recResult] = await Promise.all([
      supabase.from("students").select("*").eq("id", studentId).single(),
      supabase.from("student_states").select("*").eq("id", stateId).single(),
      supabase.from("recommendations").select("*").eq("student_state_id", stateId),
    ]);

    if (studentResult.error || !studentResult.data) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (stateResult.error || !stateResult.data) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    const student = studentResult.data as unknown as Student;
    const state = stateResult.data as unknown as StudentState;
    const recData = recResult.data;

    if (!recData?.length) {
      return NextResponse.json({ student, state, recommendations: [] });
    }

    // Fetch majors for all recommendations
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

    // Fetch universities
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

    // Pre-group by tier, sorted by composite_score desc within each tier
    const grouped: Record<string, Recommendation[]> = { reach: [], match: [], safety: [] };
    const tierCounts: Record<string, number> = { all: recommendations.length, reach: 0, match: 0, safety: 0 };
    for (const rec of recommendations) {
      const tier = rec.match_category;
      if (grouped[tier]) grouped[tier].push(rec);
      tierCounts[tier] = (tierCounts[tier] ?? 0) + 1;
    }
    for (const tier of Object.keys(grouped)) {
      grouped[tier].sort((a, b) => Number(b.composite_score ?? 0) - Number(a.composite_score ?? 0));
    }

    // Also apply optional ?tier= filter param
    const url = new URL(request.url);
    const tierFilter = url.searchParams.get("tier");
    const filtered = tierFilter && tierFilter !== "all"
      ? recommendations.filter((r) => r.match_category === tierFilter)
          .sort((a, b) => Number(b.composite_score ?? 0) - Number(a.composite_score ?? 0))
      : recommendations;

    return NextResponse.json({ student, state, recommendations: filtered, grouped, tierCounts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; stateId: string }> },
) {
  const { id: studentId, stateId } = await params;

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("recommendations")
      .delete()
      .eq("student_state_id", stateId);

    if (error) throw new Error(error.message);

    revalidatePath(`/students/${studentId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
