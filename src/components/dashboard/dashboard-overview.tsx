"use client";

import { type ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { PageBanner } from "@/components/ui/page-banner";
import type { DashboardOverviewProps } from "./dashboard.types";

const PanelStagePipeline = dynamic(
  () => import("./panel-stage-pipeline").then((m) => ({ default: m.PanelStagePipeline })),
  { ssr: false }
);

const NewStudentDialog = dynamic(
  () => import("./new-student-dialog").then((m) => ({ default: m.NewStudentDialog })),
  { ssr: false }
);

export function DashboardOverview({ stats, actionSlot }: DashboardOverviewProps & { actionSlot?: ReactNode }) {
  const [newStudentOpen, setNewStudentOpen] = useState(false);

  return (
    <>
      {/* Banner */}
      <div style={{ height: 80 }}>
        <PageBanner
          title="How would you like to consult today?"
          subtitle=""
          primaryMeta={
            <button
              onClick={() => setNewStudentOpen(true)}
              className="inline-flex items-center gap-2 px-4 h-9 transition-colors pointer-events-auto"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "var(--radius-xs)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 1v10M1 6h10" />
              </svg>
              New Student
            </button>
          }
        />
      </div>

      {/* Stats Row */}
      <SectionHeader title="Overview" />
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)" }}>
        <StatCard label="Total Students" value={stats.total} dotColor="var(--color-text-primary)" subtext="all active" />
        <StatCard label="In Progress" value={stats.inProgress} dotColor="var(--color-tier-match)" subtext="building + matched" />
        <StatCard label="Needs Attention" value={stats.needsAttention} dotColor="var(--color-warning)" subtext="no update in 2+ weeks" />
        <StatCard label="Ready to Present" value={stats.readyToPresent} dotColor="var(--color-info)" subtext="matched students" />
      </div>

      {/* Pipeline + Action Queue — side by side on md+, stacked on small */}
      <div className="grid grid-cols-1 md:grid-cols-2 panels-row" style={{ gap: "var(--space-md)" }}>
        <PanelStagePipeline stageCounts={stats.stageCounts} total={stats.total} />
        {actionSlot}
      </div>

      {newStudentOpen && (
        <NewStudentDialog open={newStudentOpen} onClose={() => setNewStudentOpen(false)} />
      )}
    </>
  );
}
