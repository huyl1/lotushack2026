"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StudentBanner } from "./student-header";
import { ProfilePanel } from "./profile-panel";
import { ScoreTimeline } from "./score-timeline";
import { InferenceHistoryPanel } from "./inference-history-panel";
import { useBreadcrumb } from "@/lib/context/breadcrumb";
import type { StudentDetail as StudentDetailType } from "@/lib/supabase/types";

interface StudentDetailProps {
  student: StudentDetailType;
}

export function StudentDetailView({ student }: StudentDetailProps) {
  const { setDynamicLabel } = useBreadcrumb();
  useEffect(() => {
    setDynamicLabel(student.id, student.name);
  }, [student.id, student.name, setDynamicLabel]);
  const latestState = student.states.length > 0
    ? student.states[student.states.length - 1]
    : null;

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-caption transition-colors self-start"
        style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2L4 7l5 5" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Banner */}
      <StudentBanner student={student} />

      {/* Top row: Profile (6w) + Score Progression (4w) */}
      <div className="grid" style={{ gridTemplateColumns: "6fr 5fr", gap: "var(--space-md)", height: 420 }}>
        <ProfilePanel state={latestState} tags={student.tags} grade={student.grade} dob={student.dob} />
        <ScoreTimeline states={student.states} />
      </div>

      {/* Inference History */}
      <InferenceHistoryPanel inferenceRuns={student.inference_runs} studentId={student.id} />
    </div>
  );
}
