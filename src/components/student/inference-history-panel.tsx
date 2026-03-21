"use client";

import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import type { InferenceRun } from "@/lib/supabase/types";

interface InferenceHistoryPanelProps {
  inferenceRuns: InferenceRun[];
  studentId: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatScores(run: InferenceRun): string {
  const parts: string[] = [];
  if (run.sat_score) parts.push(`SAT ${run.sat_score}`);
  if (run.act_score) parts.push(`ACT ${run.act_score}`);
  if (run.gpa) parts.push(`GPA ${Number(run.gpa).toFixed(2)}`);
  if (run.ielts_score) parts.push(`IELTS ${Number(run.ielts_score).toFixed(1)}`);
  return parts.join("  ·  ");
}

export function InferenceHistoryPanel({ inferenceRuns, studentId }: InferenceHistoryPanelProps) {
  return (
    <Panel
      title="Matching Reports"
      dotColor="var(--color-stage-matched)"
      footer={
        <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
          {inferenceRuns.length} {inferenceRuns.length === 1 ? "report" : "reports"} generated
        </span>
      }
    >
      {inferenceRuns.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Run AI matching to generate university recommendations."
          icon={
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="16" cy="16" r="12" />
              <path d="M34 34l-8-8" />
            </svg>
          }
          action={
            <Link
              href={`/students/${studentId}/match`}
              className="inline-flex items-center gap-2 px-4 py-2 text-caption transition-colors"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-text-inverse)",
                borderRadius: "var(--radius-xs)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Run Matching
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col">
          {inferenceRuns.map((run, index) => (
            <Link
              key={run.state_id}
              href={`/students/${studentId}/report/${run.state_id}`}
              className="flex items-center px-3 py-3 transition-colors"
              style={{
                gap: "var(--space-md)",
                textDecoration: "none",
                borderBottom: index < inferenceRuns.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {/* Run number */}
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 36, height: 36, borderRadius: "var(--radius-xs)",
                  background: index === 0 ? "var(--color-stage-matched-dim)" : "var(--color-hover-bg)",
                  fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)",
                  color: index === 0 ? "var(--color-stage-matched)" : "var(--color-text-muted)",
                }}
              >
                #{inferenceRuns.length - index}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
                    {formatDate(run.created_at)}
                  </span>
                  {index === 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, fontFamily: "var(--font-sans)",
                      color: "var(--color-stage-matched)", background: "var(--color-stage-matched-dim)",
                      padding: "1px 6px", borderRadius: "var(--radius-xs)", textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      Latest
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                  {formatScores(run)}
                </span>
              </div>

              {/* Rec count + arrow */}
              <div className="flex items-center shrink-0" style={{ gap: 8 }}>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                  {run.rec_count} recs
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 2l5 5-5 5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}
