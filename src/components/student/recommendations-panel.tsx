"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RecommendationCard } from "./recommendation-card";
import type { FilterKey, RecommendationsPanelProps } from "./student.types";
import { FILTERS } from "./constants";

function formatStateLabel(s: {
  created_at: string;
  sat_score: number | null;
  gpa: number | null;
}): string {
  const date = new Date(s.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const parts = [date];
  if (s.sat_score) parts.push(`SAT ${s.sat_score}`);
  if (s.gpa) parts.push(`GPA ${Number(s.gpa).toFixed(1)}`);
  return parts.join(" · ");
}

export function RecommendationsPanel({
  recommendations,
  studentId,
  basedOnState,
  tierCounts: serverCounts,
  statesWithRecs,
  onStateChange,
}: RecommendationsPanelProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [isPending, startTransition] = useTransition();
  const [matchError, setMatchError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRunMatching() {
    setMatchError(null);
    const res = await fetch(`/api/students/${studentId}/recommend`, {
      method: "POST",
    });
    const body = await res.json();
    if (!res.ok) {
      setMatchError(body.error ?? "Matching failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  // Recommendations are already filtered by the API when a tier is selected
  const recs = recommendations;

  // Use server-provided counts when available, otherwise compute locally
  const counts = serverCounts ?? {
    all: recommendations.length,
    reach: recommendations.filter((r) => r.match_category === "reach").length,
    match: recommendations.filter((r) => r.match_category === "match").length,
    safety: recommendations.filter((r) => r.match_category === "safety").length,
  };

  const filterTabs = (
    <div className="flex items-center" style={{ gap: 2 }}>
      {FILTERS.map((f) => {
        const isActive = filter === f.key;
        const count = counts[f.key];
        return (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-2.5 py-1 cursor-pointer transition-colors"
            style={{
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              background: isActive
                ? "var(--color-hover-bg-strong)"
                : "transparent",
              borderRadius: "var(--radius-xs)",
              border: "none",
            }}
          >
            {f.label}
            <span
              className="ml-1"
              style={{
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
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

  return (
    <Panel
      title="Recommendations"
      dotColor="var(--color-stage-matched)"
      headerRight={filterTabs}
      footer={
        <div
          className="flex items-center justify-between"
          style={{ width: "100%" }}
        >
          <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
            {/* Inference selector */}
            {statesWithRecs && statesWithRecs.length > 1 && (
              <select
                value={basedOnState?.id ?? ""}
                onChange={(e) => onStateChange?.(e.target.value)}
                style={{
                  fontSize: 14,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-secondary)",
                  background: "var(--color-hover-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-xs)",
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
              >
                {statesWithRecs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatStateLabel(s)}
                  </option>
                ))}
              </select>
            )}
            {basedOnState &&
              (!statesWithRecs || statesWithRecs.length <= 1) && (
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Based on {formatStateLabel(basedOnState)}
                </span>
              )}
          </div>
          <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
            <span
              style={{
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              {recs.length} shown
            </span>
            {recommendations.length > 0 && basedOnState && (
              <Link
                href={`/students/${studentId}/report/${basedOnState.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 transition-colors"
                style={{
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  background: "var(--color-hover-bg)",
                  borderRadius: "var(--radius-xs)",
                  textDecoration: "none",
                  border: "1px solid var(--color-border)",
                }}
              >
                View Full Report
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 1.5l4 3.5-4 3.5" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      }
    >
      {recommendations.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="Run AI matching to generate university recommendations."
          icon={
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="16" cy="16" r="12" />
              <path d="M34 34l-8-8" />
            </svg>
          }
          action={
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleRunMatching}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-caption transition-colors cursor-pointer"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-text-inverse)",
                  borderRadius: "var(--radius-xs)",
                  fontWeight: 600,
                  border: "none",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                {isPending ? "Running…" : "Run Matching"}
              </button>
              {matchError && (
                <span
                  style={{ fontSize: 12, color: "var(--color-error, #ef4444)" }}
                >
                  {matchError}
                </span>
              )}
            </div>
          }
        />
      ) : recs.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <span
            style={{
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-muted)",
            }}
          >
            No {filter} recommendations
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "var(--space-sm)",
            alignItems: "start",
          }}
        >
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </Panel>
  );
}
