import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Student,
  StudentState,
  Tag,
  InferenceRun,
  StudentDetail,
} from "@/lib/supabase/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: studentId } = await params;

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

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
    const stateIds = states.map((s) => s.id);

    const tagIds = (tagsResult.data ?? []).map((st) => st.tag_id as string);

    const [tagsData, recData] = await Promise.all([
      tagIds.length > 0
        ? supabase.from("tags").select("*").in("id", tagIds)
        : Promise.resolve({ data: null }),
      stateIds.length > 0
        ? supabase.from("recommendations").select("student_state_id").in("student_state_id", stateIds)
        : Promise.resolve({ data: null }),
    ]);

    const tags = (tagsData.data ?? []) as unknown as Tag[];

    let inferenceRuns: InferenceRun[] = [];
    const recCounts = recData.data;
    if (recCounts?.length) {
      const countMap = new Map<string, number>();
      for (const r of recCounts) {
        const rsid = r.student_state_id as string;
        countMap.set(rsid, (countMap.get(rsid) ?? 0) + 1);
      }

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

    const detail: StudentDetail = {
      ...(student as unknown as Student),
      states,
      inference_runs: inferenceRuns,
      tags,
    };

    return NextResponse.json(detail);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: studentId } = await params;

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    await supabase
      .from("student_states")
      .delete()
      .eq("student_id", studentId);
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
