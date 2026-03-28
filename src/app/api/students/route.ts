import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  CreateStudentInput,
  Student,
  StudentState,
  StudentWithLatestState,
} from "@/lib/supabase/types";
import {
  buildStudentEmbedText,
  embedTextsVoyage,
  embeddingToPgVector,
  enrichRowWithLeftOvertime,
} from "@/lib/embeddings/student-embedding";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const stageParam = url.searchParams.get("stage"); // "all" | specific stage | null
  const sortParam = url.searchParams.get("sort") ?? "created_at:desc";

  try {
    const supabase = createAdminClient();

    // Fetch students and latest states in parallel
    const [studentsResult, stateRpcResult] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.rpc("get_latest_states_with_counts"),
    ]);

    const { data: students, error } = studentsResult;
    if (error) throw error;
    if (!students?.length)
      return NextResponse.json({ students: [], stageCounts: {} });

    const { data: stateData } = stateRpcResult;

    // Build full list with latest state
    let all: StudentWithLatestState[];

    if (!stateData) {
      // Fallback if RPC doesn't exist — use JS grouping
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

      all = (students as unknown as Student[]).map((student) => {
        const studentStates = statesByStudent.get(student.id) ?? [];
        return {
          ...student,
          latest_state: studentStates[0] ?? null,
          state_count: studentStates.length,
        };
      });
    } else {
      const latestMap = new Map<string, { state: StudentState; count: number }>();
      for (const row of stateData) {
        const sid = row.student_id as string;
        const sc = row.state_count as number;
        latestMap.set(sid, {
          state: row as unknown as StudentState,
          count: sc,
        });
      }

      all = (students as unknown as Student[]).map((student) => {
        const entry = latestMap.get(student.id);
        return {
          ...student,
          latest_state: entry?.state ?? null,
          state_count: entry?.count ?? 0,
        };
      });
    }

    // Compute stage counts (always over full dataset, excluding archived)
    const stageCounts: Record<string, number> = {};
    let allCount = 0;
    for (const s of all) {
      if (s.stage === "archived") continue;
      stageCounts[s.stage] = (stageCounts[s.stage] ?? 0) + 1;
      allCount++;
    }
    stageCounts["all"] = allCount;

    // Filter by stage
    let filtered: StudentWithLatestState[];
    if (!stageParam || stageParam === "all") {
      filtered = all.filter((s) => s.stage !== "archived");
    } else {
      filtered = all.filter((s) => s.stage === stageParam);
    }

    // Sort
    const [sortField, sortDir] = sortParam.split(":");
    const asc = sortDir === "asc";
    filtered.sort((a, b) => {
      const aVal = new Date(a[sortField as keyof typeof a] as string).getTime();
      const bVal = new Date(b[sortField as keyof typeof b] as string).getTime();
      return asc ? aVal - bVal : bVal - aVal;
    });

    return NextResponse.json({ students: filtered, stageCounts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch students";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: CreateStudentInput = await request.json().catch(() => null);
  if (!data) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!data.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: student, error } = await supabase
      .from("students")
      .insert({
        name: data.name,
        grade: data.grade ?? null,
        dob: data.dob ?? null,
      })
      .select("id")
      .single();

    if (error || !student)
      throw new Error(error?.message ?? "Failed to create student");

    if (data.snapshot) {
      const { data: stateRow, error: stateError } = await supabase
        .from("student_states")
        .insert({
          student_id: student.id,
          ...data.snapshot,
        })
        .select("id, created_at")
        .single();

      if (stateError || !stateRow) {
        throw new Error(
          stateError?.message ?? "Failed to create student state",
        );
      }

      const rowForEmbed = enrichRowWithLeftOvertime({
        ...data.snapshot,
        id: stateRow.id as string,
        student_id: student.id,
        name: data.name,
        grade: data.grade ?? null,
        created_at: stateRow.created_at,
      });

      const text = buildStudentEmbedText(rowForEmbed);
      if (!text.trim()) {
        throw new Error(
          "Cannot embed student: no fields produced embedding text",
        );
      }

      const [embedding] = await embedTextsVoyage([text]);
      const { error: embedUpdateError } = await supabase
        .from("student_states")
        .update({
          student_embedding: embeddingToPgVector(embedding),
        })
        .eq("id", stateRow.id as string);

      if (embedUpdateError) {
        throw new Error(embedUpdateError.message);
      }
    }

    revalidatePath("/dashboard");
    return NextResponse.json({ id: student.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
