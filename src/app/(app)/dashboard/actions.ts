"use server";

import {
  buildStudentEmbedText,
  embedTextsVoyage,
  embeddingToPgVector,
  enrichRowWithLeftOvertime,
} from "@/lib/embeddings/student-embedding";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStudent(data: import("@/lib/supabase/types").CreateStudentInput) {
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
      throw new Error(stateError?.message ?? "Failed to create student state");
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
  return student.id as string;
}
