"use client";

import Link from "next/link";
import { TierBadge } from "@/components/ui/badges";
import { SectionHeader } from "@/components/ui/section-header";
import type { Student, StudentState, Recommendation, Tier } from "@/lib/supabase/types";

interface ReportViewProps {
  student: Student;
  state: StudentState;
  recommendations: Recommendation[];
}

const SCORE_LABELS: { key: keyof Pick<Recommendation, "academic_alignment" | "financial_sustainability" | "student_success" | "lifestyle_culture" | "admission_chance">; label: string; weight: string }[] = [
  { key: "academic_alignment", label: "Academic Alignment", weight: "35%" },
  { key: "financial_sustainability", label: "Financial Sustainability", weight: "25%" },
  { key: "student_success", label: "Student Success", weight: "15%" },
  { key: "lifestyle_culture", label: "Lifestyle & Culture", weight: "15%" },
  { key: "admission_chance", label: "Admission Chance", weight: "10%" },
];

function ScoreBar({ label, weight, score }: { label: string; weight: string; score: number }) {
  let color = "var(--color-text-muted)";
  if (score >= 90) color = "var(--color-stage-matched)";
  else if (score >= 70) color = "var(--color-stage-new)";
  else if (score >= 50) color = "var(--color-warning)";

  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", width: 160, flexShrink: 0 }}>
        {label} <span style={{ fontSize: 10, opacity: 0.6 }}>({weight})</span>
      </span>
      <div className="flex-1" style={{ height: 8, borderRadius: 4, background: "var(--color-border)" }}>
        <div style={{ height: "100%", width: `${score}%`, borderRadius: 4, background: color, transition: "width 0.3s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, color, width: 28, textAlign: "right", flexShrink: 0 }}>
        {score}
      </span>
    </div>
  );
}

function ReportCard({ rec }: { rec: Recommendation }) {
  const u = rec.university;
  const m = rec.major;
  const composite = Math.round(Number(rec.composite_score ?? 0));

  const acceptanceShort = u?.overall_acceptance_rate
    ? u.overall_acceptance_rate.length > 10
      ? u.overall_acceptance_rate.match(/[\d.]+%/)?.[0] ?? u.overall_acceptance_rate.slice(0, 10)
      : u.overall_acceptance_rate
    : null;

  return (
    <div
      className="flex flex-col"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-md)",
        gap: "var(--space-sm)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
              {u?.name ?? "Unknown University"}
            </span>
            <TierBadge tier={rec.match_category} />
          </div>
          {m && (
            <span style={{ fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)", marginTop: 2, display: "block" }}>
              {m.major_name}
            </span>
          )}
          <div className="flex items-center mt-1" style={{ gap: 12 }}>
            {u?.qs_rank && (
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                Rank #{u.qs_rank}
              </span>
            )}
            {u?.country && (
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                {u.country}
              </span>
            )}
            {acceptanceShort && (
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                AR {acceptanceShort}
              </span>
            )}
            {u?.tuition_usd && (
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                ${Math.round(u.tuition_usd / 1000)}k/yr
              </span>
            )}
          </div>
        </div>
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 48, height: 48, borderRadius: "var(--radius-sm)",
            background: composite >= 70 ? "var(--color-stage-matched-dim)" : composite >= 45 ? "var(--color-stage-new-dim)" : "var(--color-stage-building-dim)",
          }}
        >
          <span style={{
            fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)",
            color: composite >= 70 ? "var(--color-stage-matched)" : composite >= 45 ? "var(--color-stage-new)" : "var(--color-stage-building)",
          }}>
            {composite}
          </span>
        </div>
      </div>

      {/* Description */}
      {rec.description && (
        <p style={{ fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          {rec.description}
        </p>
      )}

      {/* Score breakdown */}
      <div className="flex flex-col" style={{ gap: 6, marginTop: 4 }}>
        {SCORE_LABELS.map(({ key, label, weight }) => (
          <ScoreBar key={key} label={label} weight={weight} score={Number(rec[key] ?? 0)} />
        ))}
      </div>
    </div>
  );
}

export function ReportView({ student, state, recommendations }: ReportViewProps) {
  const stateDate = new Date(state.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const grouped: Record<Tier, Recommendation[]> = { reach: [], match: [], safety: [] };
  for (const rec of recommendations) {
    grouped[rec.match_category].push(rec);
  }
  // Sort each tier by composite score descending
  for (const tier of Object.keys(grouped) as Tier[]) {
    grouped[tier].sort((a, b) => Number(b.composite_score ?? 0) - Number(a.composite_score ?? 0));
  }

  const snapshotParts = [
    state.sat_score ? `SAT ${state.sat_score}` : null,
    state.act_score ? `ACT ${state.act_score}` : null,
    state.gpa ? `GPA ${Number(state.gpa).toFixed(2)}` : null,
    state.ielts_score ? `IELTS ${Number(state.ielts_score).toFixed(1)}` : null,
  ].filter(Boolean);

  const prefParts = [
    state.budget_usd ? `Budget $${Math.round(Number(state.budget_usd) / 1000)}k/yr` : null,
    state.needs_financial_aid ? "Needs Aid" : null,
    state.target_majors?.length ? state.target_majors.join(", ") : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-lg)", padding: "var(--space-md)", maxWidth: 960, margin: "0 auto" }}>
      {/* Back link */}
      <Link
        href={`/students/${student.id}`}
        className="inline-flex items-center gap-1.5 text-caption transition-colors self-start"
        style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2L4 7l5 5" />
        </svg>
        Back to {student.name}
      </Link>

      {/* Report header */}
      <div
        className="flex flex-col"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          padding: "var(--space-lg)",
          gap: "var(--space-sm)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-text-primary)", margin: 0 }}>
              Recommendation Report
            </h1>
            <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>
              {student.name} · {stateDate}
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: "var(--color-hover-bg)",
              borderRadius: "var(--radius-xs)",
              border: "1px solid var(--color-border)",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            {recommendations.length} Recommendations
          </div>
        </div>

        {/* Student snapshot */}
        <div className="flex flex-wrap mt-2" style={{ gap: "var(--space-md)" }}>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {snapshotParts.map((p) => (
              <span key={p} style={{
                fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 500,
                color: "var(--color-text-secondary)", background: "var(--color-hover-bg)",
                padding: "3px 10px", borderRadius: "var(--radius-xs)",
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>
        {prefParts.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {prefParts.map((p) => (
              <span key={p} style={{
                fontSize: 12, fontFamily: "var(--font-sans)",
                color: "var(--color-text-muted)",
                padding: "2px 8px", borderRadius: "var(--radius-xs)",
                border: "1px solid var(--color-border-subtle)",
              }}>
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reach */}
      {grouped.reach.length > 0 && (
        <>
          <SectionHeader title="Reach" count={grouped.reach.length} />
          <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
            {grouped.reach.map((rec) => <ReportCard key={rec.id} rec={rec} />)}
          </div>
        </>
      )}

      {/* Match */}
      {grouped.match.length > 0 && (
        <>
          <SectionHeader title="Match" count={grouped.match.length} />
          <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
            {grouped.match.map((rec) => <ReportCard key={rec.id} rec={rec} />)}
          </div>
        </>
      )}

      {/* Safety */}
      {grouped.safety.length > 0 && (
        <>
          <SectionHeader title="Safety" count={grouped.safety.length} />
          <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
            {grouped.safety.map((rec) => <ReportCard key={rec.id} rec={rec} />)}
          </div>
        </>
      )}
    </div>
  );
}
