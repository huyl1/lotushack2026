"use client";

import Link from "next/link";
import type { Recommendation } from "@/lib/supabase/types";

interface RecommendationCardProps {
  recommendation: Recommendation;
  studentId: string;
}

function MiniScore({ label, score }: { label: string; score: number }) {
  let color = "var(--color-text-muted)";
  if (score >= 90) color = "var(--color-stage-matched)";
  else if (score >= 70) color = "var(--color-stage-new)";
  else if (score >= 50) color = "var(--color-warning)";

  return (
    <div className="flex items-center" style={{ gap: 4 }}>
      <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", width: 22, flexShrink: 0 }}>
        {label}
      </span>
      <div className="flex-1" style={{ height: 3, borderRadius: 2, background: "var(--color-border)" }}>
        <div style={{ height: "100%", width: `${score}%`, borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color, width: 20, textAlign: "right", flexShrink: 0 }}>
        {score}
      </span>
    </div>
  );
}

// Composite score color matches tier: green (safety 70+), indigo (match 45-69), amber (reach <45)
function getCompositeColor(composite: number) {
  if (composite >= 70) return { bg: "var(--color-stage-matched-dim)", fg: "var(--color-stage-matched)" };
  if (composite >= 45) return { bg: "var(--color-stage-new-dim)", fg: "var(--color-stage-new)" };
  return { bg: "var(--color-stage-building-dim)", fg: "var(--color-stage-building)" };
}

export function RecommendationCard({ recommendation: rec, studentId }: RecommendationCardProps) {
  const { university: u, score: s } = rec;
  const { bg, fg } = getCompositeColor(s.composite);

  const meta = [
    u.qs_rank ? `#${u.qs_rank}` : null,
    u.country,
    u.overall_acceptance_rate,
    u.tuition_usd ? `$${Math.round(u.tuition_usd / 1000)}k` : null,
  ].filter(Boolean).join("  ·  ");

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
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color: fg }}>
            {s.composite}
          </span>
        </div>
        <span
          className="flex-1"
          style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", lineHeight: 1.3, paddingTop: 2 }}
        >
          {u.name}
        </span>
      </div>

      {/* Info line */}
      <div className="px-3 pb-2">
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
          {meta}
        </span>
      </div>

      {/* Mini scores */}
      <div className="px-3 pb-3 flex flex-col" style={{ gap: 4 }}>
        <MiniScore label="AF" score={s.sections.academicFit.score} />
        <MiniScore label="MA" score={s.sections.majorAlignment.score} />
        <MiniScore label="FF" score={s.sections.financialFit.score} />
        <MiniScore label="PM" score={s.sections.preferenceMatch.score} />
        <MiniScore label="AD" score={s.sections.admissibility.score} />
      </div>

      {/* View details link */}
      <Link
        href={`/students/${studentId}/match/${rec.id}`}
        className="flex items-center justify-between px-3 py-2 transition-colors"
        style={{
          fontSize: 12,
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          color: "var(--color-text-muted)",
          textDecoration: "none",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
      >
        <span>View details</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 2l4 4-4 4" />
        </svg>
      </Link>
    </div>
  );
}
