"use client";

import { useMemo } from "react";
import Link from "next/link";
import { StudentBanner } from "./student-header";
import { ProfilePanel } from "./profile-panel";
import { ScoresPanel } from "./scores-panel";
import { ScoreTimeline } from "./score-timeline";
import { RecommendationsPanel } from "./recommendations-panel";
import { ActivityTimeline } from "./activity-timeline";
import { PageGrid, type LayoutItem } from "@/components/ui/page-grid";
import type { StudentDetail as StudentDetailType } from "@/lib/supabase/types";

interface StudentDetailProps {
  student: StudentDetailType;
}

export function StudentDetailView({ student }: StudentDetailProps) {
  const latestState = student.states.length > 0
    ? student.states[student.states.length - 1]
    : null;

  const recCount = student.recommendations.filter((r) => !r.is_dismissed).length;
  const recRows = recCount > 0 ? Math.max(10, Math.ceil(recCount / 5) * 7 + 3) : 6;

  const layout = useMemo<LayoutItem[]>(() => [
    // Banner — full width, 3 rows
    { i: "banner",   x: 0, y: 0, w: 12, h: 3 },
    // Profile (6 col) + Scores (6 col)
    { i: "profile",  x: 0, y: 3, w: 6, h: 7 },
    { i: "scores",   x: 6, y: 3, w: 6, h: 7 },
    // Score History (6 col) + Activity (6 col)
    { i: "timeline", x: 0, y: 10, w: 6, h: 8 },
    { i: "activity", x: 6, y: 10, w: 6, h: 8 },
    // Recommendations panel (full width)
    { i: "recs",     x: 0, y: 18, w: 12, h: recRows },
  ], [recRows]);

  const widgets = useMemo<Record<string, React.ReactNode>>(() => ({
    banner:   <StudentBanner student={student} />,
    profile:  <ProfilePanel state={latestState} />,
    scores:   <ScoresPanel state={latestState} />,
    timeline: <ScoreTimeline states={student.states} />,
    activity: <ActivityTimeline student={student} />,
    recs:     <RecommendationsPanel recommendations={student.recommendations} studentId={student.id} />,
  }), [latestState, student]);

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
      {/* Back link — outside the grid */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-caption transition-colors self-start"
        style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2L4 7l5 5" />
        </svg>
        Back to Dashboard
      </Link>

      <PageGrid
        storageKey={`edify-student-${student.id}`}
        defaultLayout={layout}
        widgets={widgets}
      />
    </div>
  );
}
