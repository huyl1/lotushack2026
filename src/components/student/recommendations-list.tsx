import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RecommendationCard } from "./recommendation-card";
import type { Recommendation, Tier } from "@/lib/supabase/types";

interface RecommendationsListProps {
  recommendations: Recommendation[];
  studentId: string;
}

const TIER_ORDER: Tier[] = ["reach", "match", "safety"];
const TIER_LABELS: Record<Tier, string> = {
  reach: "Reach",
  match: "Match",
  safety: "Safety",
};

export function RecommendationsList({ recommendations, studentId }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <div>
        <SectionHeader title="Recommendations" count={0} />
        <div
          className="mt-4"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <EmptyState
            title="No recommendations yet"
            description="Run AI matching to generate university recommendations for this student."
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
        </div>
      </div>
    );
  }

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    recs: recommendations.filter((r) => r.score.tier === tier),
  })).filter((g) => g.recs.length > 0);

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-lg)" }}>
      <SectionHeader title="Recommendations" count={recommendations.length} />

      {grouped.map((group) => (
        <div key={group.tier} className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
          <span
            className="text-caption uppercase"
            style={{
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              fontSize: 12,
            }}
          >
            {group.label} ({group.recs.length})
          </span>
          {group.recs.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      ))}
    </div>
  );
}
