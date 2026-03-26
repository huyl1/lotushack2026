import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SnapshotInput } from "@/lib/supabase/types";
import {
  buildStudentEmbedText,
  embedTextsVoyage,
  embeddingToPgVector,
  enrichRowWithLeftOvertime,
} from "@/lib/embeddings/student-embedding";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
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

  const data: SnapshotInput = await request.json().catch(() => null);
  if (!data) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: state, error: stateError } = await supabase
      .from("student_states")
      .insert({
        student_id: studentId,
        sat_score: data.sat_score ?? null,
        act_score: data.act_score ?? null,
        gpa: data.gpa ?? null,
        ielts_score: data.ielts_score ?? null,
        target_majors: data.target_majors ?? null,
        preferred_countries: data.preferred_countries ?? null,
        preferred_setting: data.preferred_setting ?? null,
        preferred_size: data.preferred_size ?? null,
        budget_usd: data.budget_usd ?? null,
        needs_financial_aid: data.needs_financial_aid ?? null,
        target_acceptance_rate_min: data.target_acceptance_rate_min ?? null,
        application_round: data.application_round ?? null,
      })
      .select("id, created_at")
      .single();

    if (stateError || !state)
      throw new Error(stateError?.message ?? "Failed to create snapshot");

    const [, { data: student }] = await Promise.all([
      data.grade !== undefined
        ? supabase.from("students").update({ grade: data.grade }).eq("id", studentId)
        : Promise.resolve(null),
      supabase.from("students").select("name, grade").eq("id", studentId).single(),
    ]);

    const rowForEmbed = enrichRowWithLeftOvertime({
      ...data,
      id: state.id as string,
      student_id: studentId,
      name: student?.name ?? null,
      grade: data.grade ?? student?.grade ?? null,
      created_at: state.created_at,
    });

    const text = buildStudentEmbedText(rowForEmbed);
    if (text.trim()) {
      const [embedding] = await embedTextsVoyage([text]);
      const { error: embedUpdateError } = await supabase
        .from("student_states")
        .update({
          student_embedding: embeddingToPgVector(embedding),
        })
        .eq("id", state.id as string);

      if (embedUpdateError) {
        throw new Error(embedUpdateError.message);
      }
    }

    revalidatePath(`/students/${studentId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create snapshot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
