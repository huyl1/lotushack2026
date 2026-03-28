"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { StudentDetailView } from "@/components/student/student-detail";
import { useStudentDetail } from "@/lib/hooks/use-student-detail";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: student, isPending, error } = useStudentDetail(id);

  if (isPending) {
    return (
      <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
        <div className="skeleton" style={{ height: 64 }} />
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, border: "1px solid var(--color-border)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !student) {
    notFound();
  }

  return <StudentDetailView student={student} />;
}
