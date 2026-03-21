"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { StageBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { PageBanner } from "@/components/ui/page-banner";
import { PanelActionQueue } from "./panel-action-queue";
import { PanelStagePipeline } from "./panel-stage-pipeline";
import { relativeTime } from "@/lib/utils/time";
import type { StudentWithLatestState } from "@/lib/supabase/types";

interface DashboardContentProps {
  students: StudentWithLatestState[];
  stats: {
    total: number;
    inProgress: number;
    needsAttention: number;
    readyToPresent: number;
    stageCounts: Record<string, number>;
  };
}

const STAGE_TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "profile_building", label: "Building" },
  { key: "matched", label: "Matched" },
  { key: "presented", label: "Presented" },
  { key: "decided", label: "Decided" },
] as const;

type FilterKey = (typeof STAGE_TABS)[number]["key"];

function formatCountries(countries: string[] | null): string {
  if (!countries || countries.length === 0) return "—";
  if (countries.length <= 2) return countries.join(", ");
  return `${countries[0]}, ${countries[1]} +${countries.length - 2}`;
}

export function DashboardContent({ students, stats }: DashboardContentProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredStudents = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? students.filter((s) => s.stage !== "archived")
        : students.filter((s) => s.stage === activeFilter);

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [students, activeFilter]);

  const activeCount = filteredStudents.length;

  const filterTabs = (
    <div className="flex items-center" style={{ gap: "2px" }}>
      {STAGE_TABS.map((tab) => {
        const isActive = activeFilter === tab.key;
        const count =
          tab.key === "all"
            ? students.filter((s) => s.stage !== "archived").length
            : students.filter((s) => s.stage === tab.key).length;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className="px-2.5 py-1 text-caption cursor-pointer transition-colors"
            style={{
              color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
              background: isActive ? "var(--color-hover-bg-strong)" : "transparent",
              borderRadius: "var(--radius-xs)",
              fontWeight: isActive ? 600 : 500,
              border: "none",
            }}
          >
            {tab.label}
            <span
              className="ml-1 text-mono"
              style={{ fontSize: 14, color: isActive ? "var(--color-text-secondary)" : "var(--color-text-muted)", opacity: 0.7 }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
      {/* Banner */}
      <PageBanner
        title="Dashboard"
        subtitle={`${stats.total} students across your caseload`}
        primaryMeta={
          <Link
            href="/students/new"
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
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 1v10M1 6h10" />
            </svg>
            New Student
          </Link>
        }
      />

      {/* Stats Row */}
      <SectionHeader title="Overview" />
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)" }}>
        <StatCard label="Total Students" value={stats.total} dotColor="var(--color-text-primary)" subtext="all active" />
        <StatCard label="In Progress" value={stats.inProgress} dotColor="var(--color-tier-match)" subtext="building + matched" />
        <StatCard label="Needs Attention" value={stats.needsAttention} dotColor="var(--color-warning)" subtext="no update in 2+ weeks" />
        <StatCard label="Ready to Present" value={stats.readyToPresent} dotColor="var(--color-info)" subtext="matched students" />
      </div>

      {/* Action Queue + Pipeline */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)", height: 340 }}>
        <PanelActionQueue students={students} />
        <PanelStagePipeline stageCounts={stats.stageCounts} total={stats.total} />
      </div>

      {/* Student Table */}
      <SectionHeader title="Students" count={activeCount} />
      <Panel
        title="All Students"
        dotColor="var(--color-accent)"
        headerRight={filterTabs}
        noPadding
        footer={
          <span>
            {activeCount} {activeCount === 1 ? "student" : "students"}
          </span>
        }
      >
        {filteredStudents.length === 0 ? (
          <div style={{ padding: "var(--space-md)" }}>
            <EmptyState
              title="No students found"
              description={
                activeFilter === "all"
                  ? "Add your first student to get started."
                  : `No students in "${STAGE_TABS.find((t) => t.key === activeFilter)?.label}" stage.`
              }
              icon={
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="20" cy="16" r="6" />
                  <path d="M8 36c0-6.6 5.4-12 12-12s12 5.4 12 12" />
                </svg>
              }
              action={
                activeFilter === "all" ? (
                  <Link
                    href="/students/new"
                    className="inline-flex items-center gap-2 px-4 py-2 text-caption transition-colors"
                    style={{
                      background: "var(--color-accent)",
                      color: "var(--color-text-inverse)",
                      borderRadius: "var(--radius-xs)",
                    }}
                  >
                    Add Student
                  </Link>
                ) : null
              }
            />
          </div>
        ) : (
          <div>
            <div
              className="grid items-center px-4 py-2"
              style={{
                gridTemplateColumns: "2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.7fr 0.6fr",
                gap: "var(--space-sm)",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-bg-wash)",
              }}
            >
              {["Name", "Grade", "SAT", "ACT", "GPA", "IELTS", "Stage", "Updated"].map((col) => (
                <span
                  key={col}
                  className="text-caption uppercase"
                  style={{ color: "var(--color-text-muted)", letterSpacing: "0.06em", fontSize: 14, textAlign: col === "Name" ? "left" : "right" }}
                >
                  {col}
                </span>
              ))}
            </div>

            {filteredStudents.map((student, index) => {
              const ls = student.latest_state;
              const latestDate = ls ? ls.created_at : student.created_at;

              return (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="grid items-center px-4 py-3 transition-colors group"
                  style={{
                    gridTemplateColumns: "2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.7fr 0.6fr",
                    gap: "var(--space-sm)",
                    borderBottom: index < filteredStudents.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex items-center" style={{ gap: 8, minWidth: 0 }}>
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: 28, height: 28, borderRadius: "var(--radius-full)",
                        background: "var(--color-hover-bg-strong)",
                        fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-body truncate" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {student.name}
                    </span>
                  </div>
                  <span className="text-mono" style={{ textAlign: "right", color: "var(--color-text-secondary)" }}>
                    {student.grade || "—"}
                  </span>
                  <span className="text-mono" style={{ textAlign: "right", color: ls?.sat_score ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {ls?.sat_score ?? "—"}
                  </span>
                  <span className="text-mono" style={{ textAlign: "right", color: ls?.act_score ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {ls?.act_score ?? "—"}
                  </span>
                  <span className="text-mono" style={{ textAlign: "right", color: ls?.gpa ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {ls?.gpa ? Number(ls.gpa).toFixed(2) : "—"}
                  </span>
                  <span className="text-mono" style={{ textAlign: "right", color: ls?.ielts_score ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {ls?.ielts_score ? Number(ls.ielts_score).toFixed(1) : "—"}
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <StageBadge stage={student.stage} />
                  </div>
                  <span className="text-mono" style={{ textAlign: "right", color: "var(--color-text-muted)" }}>
                    {relativeTime(latestDate)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
