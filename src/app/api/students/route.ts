import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { CreateStudentInput } from "@/lib/supabase/types";
import {
  buildStudentEmbedText,
  embedTextsVoyage,
  embeddingToPgVector,
  enrichRowWithLeftOvertime,
} from "@/lib/embeddings/student-embedding";
import { revalidatePath } from "next/cache";

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
