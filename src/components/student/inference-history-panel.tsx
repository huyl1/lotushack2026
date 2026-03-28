"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { useDeleteReport } from "@/lib/hooks/use-delete-report";
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
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const router = useRouter();
  const deleteReportMutation = useDeleteReport(studentId);
  const isPending = deleteReportMutation.isPending;

  function handleDeleteReport(stateId: string) {
    deleteReportMutation.mutate(stateId, {
      onSuccess: () => {
        setConfirmId(null);
        router.refresh();
      },
    });
  }

  return (
    <Panel
      title="Matching Reports"
      dotColor="var(--color-stage-matched)"
      footer={
        <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
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
                  fontSize: 15, fontWeight: 700, fontFamily: "var(--font-mono)",
                  color: index === 0 ? "var(--color-stage-matched)" : "var(--color-text-muted)",
                }}
              >
                #{inferenceRuns.length - index}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
                    {formatDate(run.created_at)}
                  </span>
                  {index === 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)",
                      color: "var(--color-stage-matched)", background: "var(--color-stage-matched-dim)",
                      padding: "1px 6px", borderRadius: "var(--radius-xs)", textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      Latest
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                  {formatScores(run)}
                </span>
              </div>

              {/* Rec count + delete + arrow */}
              <div className="flex items-center shrink-0" style={{ gap: 8 }}>
                <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                  {run.rec_count} recs
                </span>
                {confirmId === run.state_id ? (
                  <div className="flex items-center" style={{ gap: 4 }} onClick={(e) => e.preventDefault()}>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDeleteReport(run.state_id); }}
                      disabled={isPending}
                      className="inline-flex items-center px-2 py-1 transition-colors"
                      style={{
                        fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
                        background: "rgba(239,68,68,0.15)", color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-xs)",
                        cursor: isPending ? "wait" : "pointer", opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      {isPending ? "..." : "Confirm"}
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmId(null); }}
                      className="inline-flex items-center px-2 py-1 transition-colors"
                      style={{
                        fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
                        background: "var(--color-hover-bg)", color: "var(--color-text-muted)",
                        border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); setConfirmId(run.state_id); }}
                    className="inline-flex items-center justify-center transition-colors"
                    style={{
                      width: 28, height: 28, borderRadius: "var(--radius-xs)",
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "var(--color-text-muted)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
                    title="Delete report"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5v8.5h7v-8.5M5.75 6v4M8.25 6v4" />
                    </svg>
                  </button>
                )}
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
