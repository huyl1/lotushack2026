"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { StageBadge } from "@/components/ui/badges";
import { getStudentsWithLatestState } from "@/lib/data/mock";
import { relativeTime } from "@/lib/utils/time";

type View = "Recent" | "Attention";

export function PanelRecentStudents() {
  const [view, setView] = useState<View>("Recent");
  const allStudents = useMemo(() => getStudentsWithLatestState(), []);

  const students = useMemo(() => {
    if (view === "Recent") {
      return [...allStudents]
        .filter((s) => s.stage !== "archived")
        .sort((a, b) => {
          const aDate = a.latest_state?.created_at ?? a.created_at;
          const bDate = b.latest_state?.created_at ?? b.created_at;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        })
        .slice(0, 4);
    }
    // Needs Attention: stale > 14 days or new with no states
    const staleDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    return allStudents
      .filter((s) => {
        if (s.stage === "archived" || s.stage === "decided") return false;
        if (!s.latest_state) return s.stage === "new";
        return new Date(s.latest_state.created_at) < staleDate;
      })
      .slice(0, 4);
  }, [allStudents, view]);

  return (
    <Panel
      title="Recent Students"
      dotColor="var(--color-accent)"
      tabs={["Recent", "Attention"]}
      activeTab={view}
      onTabChange={(t) => setView(t as View)}
      footer={
        <Link
          href="/"
          className="transition-colors"
          style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)", textDecoration: "none" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
        >
          View all students
        </Link>
      }
    >
      {students.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-caption" style={{ color: "var(--color-text-muted)" }}>
            No students need attention
          </span>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          {students.map((student) => {
            const ls = student.latest_state;
            const latestDate = ls?.created_at ?? student.created_at;

            return (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="flex items-center p-3 transition-colors group"
                style={{
                  gap: "var(--space-sm)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-xs)",
                  background: "var(--color-bg-card)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-hover-border)";
                  e.currentTarget.style.background = "var(--color-bg-wash)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border-subtle)";
                  e.currentTarget.style.background = "var(--color-bg-card)";
                }}
              >
                {/* Avatar circle with initials */}
                <div
                  className="shrink-0 flex items-center justify-center text-caption"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-bg-elevated)",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-body-sm truncate"
                      style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
                    >
                      {student.name}
                    </span>
                    <StageBadge stage={student.stage} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {ls?.sat_score && (
                      <span className="text-mono" style={{ color: "var(--color-text-muted)" }}>
                        SAT {ls.sat_score}
                      </span>
                    )}
                    {ls?.gpa && (
                      <span className="text-mono" style={{ color: "var(--color-text-muted)" }}>
                        GPA {ls.gpa.toFixed(1)}
                      </span>
                    )}
                    {!ls?.sat_score && !ls?.gpa && (
                      <span className="text-mono" style={{ color: "var(--color-text-muted)" }}>
                        No scores yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Time */}
                <span className="text-mono shrink-0" style={{ color: "var(--color-text-muted)" }}>
                  {relativeTime(latestDate)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
