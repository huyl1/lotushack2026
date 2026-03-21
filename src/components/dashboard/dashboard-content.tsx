"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { PageGrid, type LayoutItem } from "@/components/ui/page-grid";
import { StageBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { PageBanner } from "@/components/ui/page-banner";
import { PanelRecentStudents } from "./panel-recent-students";
import { PanelStagePipeline } from "./panel-stage-pipeline";
import { PanelScoreDistribution } from "./panel-score-distribution";
import { PanelGeography } from "./panel-geography";
import { getStudentsWithLatestState, getDashboardStats } from "@/lib/data/mock";
import { relativeTime } from "@/lib/utils/time";

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

/* ─── Grid Layout ─── */
// Row height = 32px
const dashboardLayout: LayoutItem[] = [
  // Banner — full width, 3 rows (96px)
  { i: "banner",          x: 0,  y: 0, w: 12, h: 3 },
  // Overview section
  { i: "hdr-overview",    x: 0,  y: 3, w: 12, h: 1, isResizable: false },
  { i: "stat-total",      x: 0,  y: 4, w: 3,  h: 3 },
  { i: "stat-active",     x: 3,  y: 4, w: 3,  h: 3 },
  { i: "stat-attention",  x: 6,  y: 4, w: 3,  h: 3 },
  { i: "stat-recent",     x: 9,  y: 4, w: 3,  h: 3 },
  // Analytics panels
  { i: "panel-recent",    x: 0,  y: 7, w: 3,  h: 8 },
  { i: "panel-pipeline",  x: 3,  y: 7, w: 3,  h: 8 },
  { i: "panel-scores",    x: 6,  y: 7, w: 3,  h: 8 },
  { i: "panel-geo",       x: 9,  y: 7, w: 3,  h: 8 },
  // Students section
  { i: "hdr-students",    x: 0,  y: 15, w: 12, h: 1, isResizable: false },
  { i: "panel-students",  x: 0,  y: 16, w: 12, h: 20 },
];

export function DashboardContent() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const students = useMemo(() => getStudentsWithLatestState(), []);
  const stats = useMemo(() => getDashboardStats(), []);

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

  // Filter tabs rendered in panel header
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
              color: isActive
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              background: isActive
                ? "var(--color-hover-bg-strong)"
                : "transparent",
              borderRadius: "var(--radius-xs)",
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {tab.label}
            <span
              className="ml-1 text-mono"
              style={{
                fontSize: 12,
                color: isActive
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-muted)",
                opacity: 0.7,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );

  const widgets: Record<string, React.ReactNode> = {
    /* ─── Banner ─── */
    "banner": (
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
              fontSize: 13,
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
    ),

    /* ─── Stats ─── */
    "stat-total": (
      <StatCard label="Total Students" value={stats.total} dotColor="var(--color-text-primary)" subtext="all active" />
    ),
    "stat-active": (
      <StatCard label="Active" value={stats.active} dotColor="var(--color-tier-match)" subtext="building + matched" />
    ),
    "stat-attention": (
      <StatCard label="Needs Attention" value={stats.needsAttention} dotColor="var(--color-warning)" subtext="stale > 14 days" />
    ),
    "stat-recent": (
      <StatCard label="Recently Active" value={stats.recentlyActive} dotColor="var(--color-info)" subtext="last 7 days" />
    ),

    /* ─── Section Headers ─── */
    "hdr-overview": <SectionHeader title="Overview" />,
    "hdr-students": <SectionHeader title="Students" count={activeCount} />,

    /* ─── Analytics Panels ─── */
    "panel-recent": <PanelRecentStudents />,
    "panel-pipeline": <PanelStagePipeline />,
    "panel-scores": <PanelScoreDistribution />,
    "panel-geo": <PanelGeography />,

    /* ─── Student List ─── */
    "panel-students": (
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
            {/* Column Headers */}
            <div
              className="grid items-center px-4 py-2"
              style={{
                gridTemplateColumns: "1.8fr 0.6fr 0.7fr 0.6fr 0.6fr 0.8fr 0.8fr 0.7fr",
                gap: "var(--space-sm)",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-bg-wash)",
              }}
            >
              {["Name", "Grade", "SAT/ACT", "GPA", "IELTS", "Countries", "Stage", "Updated"].map((col) => (
                <span
                  key={col}
                  className={`text-caption uppercase ${col === "Updated" ? "text-right" : ""}`}
                  style={{ color: "var(--color-text-muted)", letterSpacing: "0.06em", fontSize: 12 }}
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Student Rows */}
            {filteredStudents.map((student, index) => {
              const ls = student.latest_state;
              const latestDate = ls ? ls.created_at : student.created_at;

              return (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="grid items-center px-4 py-3 transition-colors group"
                  style={{
                    gridTemplateColumns: "1.8fr 0.6fr 0.7fr 0.6fr 0.6fr 0.8fr 0.8fr 0.7fr",
                    gap: "var(--space-sm)",
                    borderBottom:
                      index < filteredStudents.length - 1
                        ? "1px solid var(--color-border-subtle)"
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span className="text-body truncate" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {student.name}
                  </span>
                  <span className="text-mono" style={{ color: "var(--color-text-secondary)" }}>
                    {student.grade || "—"}
                  </span>
                  <span className="text-mono" style={{ color: ls?.sat_score || ls?.act_score ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {ls?.sat_score ? ls.sat_score : ls?.act_score ? `ACT ${ls.act_score}` : "—"}
                  </span>
                  <span className="text-mono" style={{ color: ls?.gpa ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {ls?.gpa ? ls.gpa.toFixed(2) : "—"}
                  </span>
                  <span className="text-mono" style={{ color: ls?.ielts_score ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {ls?.ielts_score ? ls.ielts_score.toFixed(1) : "—"}
                  </span>
                  <span className="text-caption truncate" style={{ color: ls?.preferred_countries ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                    {formatCountries(ls?.preferred_countries ?? null)}
                  </span>
                  <div>
                    <StageBadge stage={student.stage} />
                  </div>
                  <span className="text-mono text-right" style={{ color: "var(--color-text-muted)" }}>
                    {relativeTime(latestDate)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>
    ),
  };

  return (
    <div>
      <PageGrid
        storageKey="edify-dashboard"
        defaultLayout={dashboardLayout}
        widgets={widgets}
      />
    </div>
  );
}
