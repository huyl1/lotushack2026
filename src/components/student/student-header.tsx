"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageBanner } from "@/components/ui/page-banner";
import { AddSnapshotDialog } from "./add-snapshot-dialog";
import { deleteStudent } from "@/app/(app)/students/[id]/actions";
import type { StudentDetail } from "@/lib/supabase/types";

type MatchingStatus = "idle" | "running" | "done" | "error";

const MATCHING_STEPS = [
  "Fetching student profile...",
  "Filtering university candidates...",
  "Computing semantic rankings...",
  "Running AI scoring model...",
  "Persisting recommendations...",
];

interface StudentHeaderProps {
  student: StudentDetail;
}

export function StudentBanner({ student }: StudentHeaderProps) {
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus>("idle");
  const [matchingStep, setMatchingStep] = useState(0);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteStudent(student.id);
      router.push("/dashboard");
    });
  }

  async function handleRunMatching() {
    setMatchingStatus("running");
    setMatchingStep(0);
    setMatchingError(null);

    const stepInterval = setInterval(() => {
      setMatchingStep((prev) => (prev < MATCHING_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    try {
      const res = await fetch("/api/recommendations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json();
      setMatchingStatus("done");

      setTimeout(() => {
        router.push(`/students/${student.id}/report/${result.studentStateId}`);
        router.refresh();
      }, 600);
    } catch (err) {
      clearInterval(stepInterval);
      setMatchingStatus("error");
      setMatchingError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const latestStateId = student.states.length > 0
    ? student.states[student.states.length - 1]!.id
    : null;

  const matchedStateIds = new Set(student.inference_runs.map((r) => r.state_id));
  const needsMatching = latestStateId != null && !matchedStateIds.has(latestStateId);

  return (
    <>
      <div style={{ height: matchingStatus === "running" ? 110 : 80, transition: "height 0.2s ease" }}>
        <PageBanner
          title={student.name}
          subtitle=""
          primaryMeta={
            <div className="flex items-center pointer-events-auto" style={{ gap: "var(--space-sm)" }}>
              <button
                type="button"
                onClick={() => setSnapshotOpen(true)}
                className="inline-flex items-center gap-2 px-4 h-9 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "var(--radius-xs)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 1v10M1 6h10" />
                </svg>
                Add Snapshot
              </button>
              {latestStateId && (
                <button
                  onClick={handleRunMatching}
                  disabled={matchingStatus === "running"}
                  className="inline-flex items-center gap-2 px-4 h-9 transition-colors"
                  style={{
                    background: matchingStatus === "running"
                      ? "rgba(255,255,255,0.08)"
                      : needsMatching
                        ? "rgba(99,179,237,0.25)"
                        : "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    color: "#ffffff",
                    border: needsMatching && matchingStatus === "idle"
                      ? "1px solid rgba(99,179,237,0.5)"
                      : "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "var(--radius-xs)",
                    fontFamily: "var(--font-sans)",
                    ...(needsMatching && matchingStatus === "idle" ? { animation: "glow 2s ease-in-out infinite" } : {}),
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: matchingStatus === "running" ? "wait" : "pointer",
                    opacity: matchingStatus === "running" ? 0.7 : 1,
                  }}
                >
                  {matchingStatus === "running" ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M6 1a5 5 0 0 1 5 5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="5" cy="5" r="3.5" />
                      <path d="M11 11l-3-3" />
                    </svg>
                  )}
                  {matchingStatus === "running" ? "Matching..." : "Run Matching"}
                </button>
              )}
              {confirmDelete ? (
                <div className="inline-flex items-center" style={{ gap: 4 }}>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-4 h-9 transition-colors"
                    style={{
                      background: "rgba(239,68,68,0.8)",
                      backdropFilter: "blur(8px)",
                      color: "#ffffff",
                      border: "1px solid rgba(239,68,68,0.6)",
                      borderRadius: "var(--radius-xs)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isPending ? "wait" : "pointer",
                      opacity: isPending ? 0.6 : 1,
                    }}
                  >
                    {isPending ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="inline-flex items-center px-3 h-9 transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "var(--radius-xs)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 px-4 h-9 transition-colors"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    backdropFilter: "blur(8px)",
                    color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "var(--radius-xs)",
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1.5 3h9M4.5 3V1.5h3V3M2.5 3v7.5h7V3M5 5.5v3M7 5.5v3" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          }
        />

        {/* Matching progress bar */}
        {(matchingStatus === "running" || matchingStatus === "done") && (
          <div
            style={{
              padding: "8px 16px",
              background: "rgba(0,0,0,0.3)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center" style={{ gap: 10, marginBottom: 4 }}>
              <span style={{
                fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500,
                color: matchingStatus === "done" ? "var(--color-stage-matched)" : "rgba(255,255,255,0.7)",
              }}>
                {matchingStatus === "done" ? "Matching complete — redirecting..." : MATCHING_STEPS[matchingStep]}
              </span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  background: matchingStatus === "done" ? "var(--color-stage-matched)" : "var(--color-accent)",
                  width: matchingStatus === "done" ? "100%" : `${((matchingStep + 1) / MATCHING_STEPS.length) * 90}%`,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        )}

        {matchingStatus === "error" && (
          <div
            style={{
              padding: "8px 16px",
              background: "rgba(239,68,68,0.1)",
              borderTop: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "#ef4444" }}>
              Matching failed: {matchingError}
            </span>
            <button
              onClick={() => setMatchingStatus("idle")}
              style={{
                marginLeft: 12, fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 600,
                color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 8px rgba(99,179,237,0.3), 0 0 16px rgba(99,179,237,0.1); }
          50% { box-shadow: 0 0 16px rgba(99,179,237,0.5), 0 0 32px rgba(99,179,237,0.2); }
        }
      `}</style>

      {snapshotOpen && (
        <AddSnapshotDialog
          studentId={student.id}
          open={snapshotOpen}
          onClose={() => setSnapshotOpen(false)}
          lastSnapshot={student.states[student.states.length - 1] ?? null}
          currentGrade={student.grade}
        />
      )}
    </>
  );
}
