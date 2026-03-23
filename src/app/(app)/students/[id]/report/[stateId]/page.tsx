import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getRecommendationsForState } from "@/lib/data/queries";
import { ReportView } from "@/components/student/report-view";
import type { Student } from "@/lib/supabase/types";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string; stateId: string }>;
}) {
  const { id, stateId } = await params;

  const supabase = createAdminClient();
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const result = await getRecommendationsForState(stateId);
  if (!result) notFound();

  return (
    <ReportView
      student={student as unknown as Student}
      state={result.state}
      recommendations={result.recommendations}
    />
  );
}
