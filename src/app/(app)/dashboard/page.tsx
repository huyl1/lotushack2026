"use client";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardStudents } from "@/components/dashboard/dashboard-students";
import { PanelActionQueue } from "@/components/dashboard/panel-action-queue";
import { StudentTableSkeleton } from "@/components/dashboard/student-table-skeleton";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import { useStudents } from "@/lib/hooks/use-students";

export default function DashboardPage() {
  const { data: stats, isPending: statsLoading } = useDashboardStats();
  const { data: studentsData, isPending: studentsLoading } = useStudents();

  if (statsLoading || !stats) {
    return (
      <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
        <div className="skeleton" style={{ height: 80 }} />
        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, border: "1px solid var(--color-border)" }} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 panels-row" style={{ gap: "var(--space-md)" }}>
          <div className="skeleton" style={{ border: "1px solid var(--color-border)" }} />
          <div className="skeleton" style={{ border: "1px solid var(--color-border)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
      <DashboardOverview
        stats={stats}
        actionSlot={
          studentsLoading || !studentsData ? (
            <div
              className="skeleton"
              style={{ height: "100%", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
            />
          ) : (
            <PanelActionQueue students={studentsData.students} />
          )
        }
      />

      {studentsLoading || !studentsData ? (
        <StudentTableSkeleton />
      ) : (
        <DashboardStudents
          students={studentsData.students}
          stageCounts={studentsData.stageCounts}
        />
      )}
    </div>
  );
}
