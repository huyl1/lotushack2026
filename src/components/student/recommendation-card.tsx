"use client";

import type { Recommendation } from "@/lib/supabase/types";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

type ScoreKey = "academic_alignment" | "financial_sustainability" | "student_success" | "lifestyle_culture" | "admission_chance";

const SCORE_LABELS: { key: ScoreKey; label: string }[] = [
  { key: "academic_alignment", label: "Academic" },
  { key: "financial_sustainability", label: "Financial" },
  { key: "student_success", label: "Success" },
  { key: "lifestyle_culture", label: "Lifestyle" },
  { key: "admission_chance", label: "Admission" },
];


function MiniScore({ label, score }: { label: string; score: number }) {
  let color = "var(--color-text-muted)";
  if (score >= 90) color = "var(--color-stage-matched)";
  else if (score >= 70) color = "var(--color-stage-new)";
  else if (score >= 50) color = "var(--color-warning)";

  return (
    <div className="flex items-center" style={{ gap: 4 }}>
      <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", width: 52, flexShrink: 0 }}>
        {label}
      </span>
      <div className="flex-1" style={{ height: 6, borderRadius: 3, background: "var(--color-border)" }}>
        <div style={{ height: "100%", width: `${score}%`, borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color, width: 20, textAlign: "right", flexShrink: 0 }}>
        {score}
      </span>
    </div>
  );
}

function getCompositeColor(composite: number) {
  if (composite >= 70) return { bg: "var(--color-stage-matched-dim)", fg: "var(--color-stage-matched)" };
  if (composite >= 45) return { bg: "var(--color-stage-new-dim)", fg: "var(--color-stage-new)" };
  return { bg: "var(--color-stage-building-dim)", fg: "var(--color-stage-building)" };
}

export function RecommendationCard({ recommendation: rec }: RecommendationCardProps) {
  const u = rec.university;
  const composite = Math.round(Number(rec.composite_score ?? 0));
  const { bg, fg } = getCompositeColor(composite);

  // Extract a short acceptance rate (strip long descriptions)
  const acceptanceShort = u?.overall_acceptance_rate
    ? u.overall_acceptance_rate.length > 10
      ? u.overall_acceptance_rate.match(/[\d.]+%/)?.[0] ?? u.overall_acceptance_rate.slice(0, 10)
      : u.overall_acceptance_rate
    : null;

  return (
    <div
      className="flex flex-col overflow-hidden transition-colors"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-sm)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-hover-border)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; }}
    >
      {/* Header — Score left, Name right */}
      <div className="flex items-start p-3" style={{ gap: "var(--space-sm)" }}>
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: "var(--radius-xs)", background: bg }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: fg }}>
            {composite}
          </span>
        </div>
        <span
          className="flex-1"
          style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", lineHeight: 1.3, paddingTop: 2 }}
        >
          {u?.name ?? "Unknown University"}
        </span>
      </div>

      {/* Info lines */}
      <div className="px-3 pb-2 flex flex-col" style={{ gap: 2 }}>
        <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
          {[u?.qs_rank ? `Rank #${u.qs_rank}` : null, u?.country].filter(Boolean).join("  ·  ") || "—"}
        </span>
        <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
          {[acceptanceShort ? `AR ${acceptanceShort}` : null, u?.tuition_usd ? `Fee $${Math.round(u.tuition_usd / 1000)}k/yr` : null].filter(Boolean).join("  ·  ") || "—"}
        </span>
      </div>

      {/* Mini scores */}
      <div className="px-3 pb-3 flex flex-col" style={{ gap: 4 }}>
        {SCORE_LABELS.map(({ key, label }) => (
          <MiniScore key={key} label={label} score={Number(rec[key] ?? 0)} />
        ))}
      </div>

    </div>
  );
}
