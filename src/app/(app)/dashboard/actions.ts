"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function createStudent(data: {
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
}) {
  const supabase = createAdminClient();

  const { data: student, error } = await supabase
    .from("students")
    .insert({ name: data.name, grade: data.grade ?? null, dob: data.dob ?? null })
    .select("id")
    .single();

  if (error || !student) throw new Error(error?.message ?? "Failed to create student");

  if (data.snapshot) {
    await supabase.from("student_states").insert({
      student_id: student.id,
      ...data.snapshot,
    });
  }

  revalidatePath("/dashboard");
  return student.id;
}
