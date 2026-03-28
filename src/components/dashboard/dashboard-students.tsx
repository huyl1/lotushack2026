"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { StageBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { useStudents } from "@/lib/hooks/use-students";
import { relativeTime } from "@/lib/utils/time";
import { STAGE_TABS } from "./constants";

type FilterKey = (typeof STAGE_TABS)[number]["key"];

interface DashboardStudentsProps {
  students: import("@/lib/supabase/types").StudentWithLatestState[];
  stageCounts: Record<string, number>;
}

export function DashboardStudents({ students: initialStudents, stageCounts: initialCounts }: DashboardStudentsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // When a filter tab is clicked, fetch filtered data from the API
  const { data, isPending } = useStudents(
    activeFilter !== "all" ? { stage: activeFilter } : undefined
  );

  // Use API response if filter is active and data is loaded, otherwise use initial data
  const students = activeFilter === "all"
    ? initialStudents
    : (isPending ? initialStudents.filter((s) => s.stage === activeFilter) : data?.students ?? []);

  const stageCounts = data?.stageCounts ?? initialCounts;
  const activeCount = students.length;

  const filterTabs = (
    <div className="flex items-center" style={{ gap: "2px" }}>
      {STAGE_TABS.map((tab) => {
        const isActive = activeFilter === tab.key;
        const count = stageCounts[tab.key] ?? 0;

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
    <div className="animate-fade-up">
      {/* Student Table */}
      <SectionHeader title="Students" count={activeCount} />
      <Panel
        title="All Students"
        dotColor="var(--color-accent)"
        headerRight={filterTabs}
        noPadding
        style={{ minHeight: 280 }}
        footer={
          <span>
            {activeCount} {activeCount === 1 ? "student" : "students"}
          </span>
        }
      >
        {students.length === 0 ? (
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

            {students.map((student, index) => {
              const ls = student.latest_state;
              const latestDate = ls ? ls.created_at : student.created_at;

              return (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="animate-stagger-in grid items-center px-4 py-3 transition-colors group"
                  style={{
                    "--stagger": index,
                    gridTemplateColumns: "2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.7fr 0.6fr",
                    gap: "var(--space-sm)",
                    borderBottom: index < students.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                    textDecoration: "none",
                  } as React.CSSProperties}
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
