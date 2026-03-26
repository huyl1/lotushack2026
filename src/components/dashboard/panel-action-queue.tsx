"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/utils/time";
import type { StudentStage, StudentWithLatestState } from "@/lib/supabase/types";
import type { PanelActionQueueProps } from "./dashboard.types";
import { ACTION_TABS } from "./constants";

export function PanelActionQueue({ students }: PanelActionQueueProps) {
  const [activeStage, setActiveStage] = useState<StudentStage>("new");

  const grouped = useMemo(() => {
    const map: Record<string, StudentWithLatestState[]> = {};
    for (const tab of ACTION_TABS) {
      map[tab.key] = students
        .filter((s) => s.stage === tab.key)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return map;
  }, [students]);

  const items = grouped[activeStage] ?? [];
  const activeTab = ACTION_TABS.find((t) => t.key === activeStage)!;

  return (
    <Panel
      title="Action Queue"
      dotColor="var(--color-warning)"
      tabs={ACTION_TABS.map((t) => `${t.label} ${grouped[t.key]?.length ?? 0}`)}
      activeTab={`${activeTab.label} ${items.length}`}
      onTabChange={(label) => {
        const found = ACTION_TABS.find((t) => `${t.label} ${grouped[t.key]?.length ?? 0}` === label);
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
          {items.map((student) => {
            const latestDate = student.latest_state?.created_at ?? student.created_at;

            return (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="flex items-center px-3 py-2.5 transition-colors"
                style={{ gap: "var(--space-sm)", textDecoration: "none", borderBottom: "1px solid var(--color-border-subtle)" }}
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
