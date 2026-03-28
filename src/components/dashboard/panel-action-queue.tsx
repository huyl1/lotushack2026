"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { useStudents } from "@/lib/hooks/use-students";
import { relativeTime } from "@/lib/utils/time";
import type { StudentStage, StudentWithLatestState } from "@/lib/supabase/types";
import { ACTION_TABS } from "./constants";

interface PanelActionQueueProps {
  students: StudentWithLatestState[];
}

export function PanelActionQueue({ students: initialStudents }: PanelActionQueueProps) {
  const [activeStage, setActiveStage] = useState<StudentStage>("new");

  // Fetch filtered + sorted from API for the active tab
  const { data } = useStudents({ stage: activeStage, sort: "created_at:asc" });

  // Use API data when available, fall back to filtering initial data
  const items = data?.students ?? initialStudents.filter((s) => s.stage === activeStage);

  // Stage counts from any loaded API response, or compute from initial data
  const stageCounts = data?.stageCounts ?? (() => {
    const c: Record<string, number> = {};
    for (const s of initialStudents) {
      c[s.stage] = (c[s.stage] ?? 0) + 1;
    }
    return c;
  })();

  const activeTab = ACTION_TABS.find((t) => t.key === activeStage)!;

  return (
    <Panel
      className="animate-fade-up"
      title="Action Queue"
      dotColor="var(--color-warning)"
      tabs={ACTION_TABS.map((t) => `${t.label} ${stageCounts[t.key] ?? 0}`)}
      activeTab={`${activeTab.label} ${stageCounts[activeStage] ?? items.length}`}
      onTabChange={(label) => {
        const found = ACTION_TABS.find((t) => `${t.label} ${stageCounts[t.key] ?? 0}` === label);
        if (found) setActiveStage(found.key);
      }}
    >
      {items.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.label.toLowerCase()} students`}
          description={`No students are currently in the "${activeTab.label}" stage.`}
        />
      ) : (
        <div className="flex flex-col">
          {items.map((student, index) => {
            const latestDate = student.latest_state?.created_at ?? student.created_at;

            return (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="animate-stagger-in flex items-center px-3 py-2.5 transition-colors"
                style={{ "--stagger": index, gap: "var(--space-sm)", textDecoration: "none", borderBottom: "1px solid var(--color-border-subtle)" } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {/* Avatar */}
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 32, height: 32, borderRadius: "var(--radius-full)",
                    background: "var(--color-hover-bg-strong)",
                    fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {student.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <span className="truncate" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {student.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
                    Updated {relativeTime(latestDate)}
                  </span>
                </div>

                {/* Action hint */}
                <span
                  className="shrink-0"
                  style={{
                    fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)",
                    color: "var(--color-accent)", background: "var(--color-hover-bg)",
                    padding: "2px 8px", borderRadius: "var(--radius-xs)",
                  }}
                >
                  {activeTab.action}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
