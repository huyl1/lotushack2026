"use server";

import { revalidatePath } from "next/cache";
import {
  buildStudentEmbedText,
  embedTextsVoyage,
  embeddingToPgVector,
  enrichRowWithLeftOvertime,
} from "@/lib/embeddings/student-embedding";
import { createAdminClient } from "@/lib/supabase/server";

export async function addSnapshot(
  studentId: string,
  data: {
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
    application_round?: string | null;
    grade?: string | null;
  }
) {
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

  if (stateError || !state) throw new Error(stateError?.message ?? "Failed to create snapshot");

  // Update grade on the student record if provided
  if (data.grade !== undefined) {
    await supabase.from("students").update({ grade: data.grade }).eq("id", studentId);
  }

  // Fetch student name + grade for embedding
  const { data: student } = await supabase
    .from("students")
    .select("name, grade")
    .eq("id", studentId)
    .single();

  const rowForEmbed = enrichRowWithLeftOvertime({
    ...data,
    id: state.id,
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
      .eq("id", state.id);

    if (embedUpdateError) {
      throw new Error(embedUpdateError.message);
    }
  }

  revalidatePath(`/students/${studentId}`);
}

export async function deleteStudent(studentId: string) {
  const supabase = createAdminClient();

  // Delete all student_states (recommendations cascade via FK)
  await supabase.from("student_states").delete().eq("student_id", studentId);
  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function deleteReport(studentId: string, stateId: string) {
  const supabase = createAdminClient();

  // Recommendations cascade-delete via FK on student_state_id
  const { error } = await supabase
    .from("recommendations")
    .delete()
    .eq("student_state_id", stateId);

  if (error) throw new Error(error.message);

  revalidatePath(`/students/${studentId}`);
}
