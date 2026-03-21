"use server";

import { revalidatePath } from "next/cache";
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

  const { error: stateError } = await supabase.from("student_states").insert({
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
  });

  if (stateError) throw new Error(stateError.message);

  // Update grade on the student record if provided
  if (data.grade !== undefined) {
    await supabase.from("students").update({ grade: data.grade }).eq("id", studentId);
  }

  revalidatePath(`/students/${studentId}`);
}
