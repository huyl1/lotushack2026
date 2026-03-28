"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/student/report-view";
import { useRecommendations } from "@/lib/hooks/use-recommendations";

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string; stateId: string }>;
}) {
  const { id, stateId } = use(params);
  const { data, isPending, error } = useRecommendations(id, stateId);

  if (isPending) {
    return (
      <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
        <div className="skeleton" style={{ height: 64 }} />
        <div className="skeleton" style={{ height: 400, border: "1px solid var(--color-border)" }} />
      </div>
    );
  }

  if (error || !data) {
    notFound();
  }

  return (
    <ReportView
      student={data.student}
      state={data.state}
      recommendations={data.recommendations}
      grouped={data.grouped}
    />
  );
}
