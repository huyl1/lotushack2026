"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { RecommendationCard } from "./recommendation-card";
import type { Recommendation, Tier } from "@/lib/supabase/types";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  studentId: string;
}

type FilterKey = "all" | Tier;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reach", label: "Reach" },
  { key: "match", label: "Match" },
  { key: "safety", label: "Safety" },
];

export function RecommendationsPanel({ recommendations, studentId }: RecommendationsPanelProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const recs = useMemo(() => {
    const active = recommendations.filter((r) => !r.is_dismissed);
    if (filter === "all") return active;
    return active.filter((r) => r.score.tier === filter);
  }, [recommendations, filter]);

  const counts = useMemo(() => {
    const active = recommendations.filter((r) => !r.is_dismissed);
    return {
      all: active.length,
      reach: active.filter((r) => r.score.tier === "reach").length,
      match: active.filter((r) => r.score.tier === "match").length,
      safety: active.filter((r) => r.score.tier === "safety").length,
    };
  }, [recommendations]);

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
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
              background: isActive ? "var(--color-hover-bg-strong)" : "transparent",
              borderRadius: "var(--radius-xs)",
              border: "none",
            }}
          >
            {f.label}
            <span
              className="ml-1"
              style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", opacity: 0.7 }}
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
        <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {recs.length} {recs.length === 1 ? "university" : "universities"} shown
        </span>
      }
    >
      {recommendations.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
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
      ) : recs.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <span style={{ fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
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
            <RecommendationCard key={rec.id} recommendation={rec} studentId={studentId} />
          ))}
        </div>
      )}
    </Panel>
  );
}
