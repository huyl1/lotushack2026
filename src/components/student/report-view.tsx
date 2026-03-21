"use client";

import { useState } from "react";
import Link from "next/link";
import { TierBadge } from "@/components/ui/badges";
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

const TIER_ORDER: Tier[] = ["reach", "match", "safety"];

function ScoreBar({ label, weight, score }: { label: string; weight: string; score: number }) {
  let color = "var(--color-text-muted)";
  if (score >= 90) color = "var(--color-stage-matched)";
  else if (score >= 70) color = "var(--color-stage-new)";
  else if (score >= 50) color = "var(--color-warning)";

  return (
    <div className="flex items-center" style={{ gap: 10 }}>
      <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", width: 180, flexShrink: 0 }}>
        {label} <span style={{ fontSize: 12, opacity: 0.6 }}>({weight})</span>
      </span>
      <div className="flex-1" style={{ height: 10, borderRadius: 5, background: "var(--color-border)" }}>
        <div style={{ height: "100%", width: `${score}%`, borderRadius: 5, background: color, transition: "width 0.3s ease" }} />
      </div>
      <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 600, color, width: 32, textAlign: "right", flexShrink: 0 }}>
        {score}
      </span>
    </div>
  );
}

function NavItem({ rec, isActive, onClick }: { rec: Recommendation; isActive: boolean; onClick: () => void }) {
  const composite = Math.round(Number(rec.composite_score ?? 0));
  const u = rec.university;

  return (
    <button
      onClick={onClick}
      className="flex items-center w-full px-3 py-2.5 transition-colors text-left cursor-pointer"
      style={{
        gap: 10,
        background: isActive ? "var(--color-hover-bg-strong)" : "transparent",
        border: "none",
        borderLeft: isActive ? "3px solid var(--color-accent)" : "3px solid transparent",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--color-hover-bg)"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 32, height: 32, borderRadius: "var(--radius-xs)",
          background: composite >= 70 ? "var(--color-stage-matched-dim)" : composite >= 45 ? "var(--color-stage-new-dim)" : "var(--color-stage-building-dim)",
          fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)",
          color: composite >= 70 ? "var(--color-stage-matched)" : composite >= 45 ? "var(--color-stage-new)" : "var(--color-stage-building)",
        }}
      >
        {composite}
      </div>
      <div className="flex-1 min-w-0">
        <span className="block truncate" style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
          {u?.name ?? "Unknown"}
        </span>
        <TierBadge tier={rec.match_category} />
      </div>
    </button>
  );
}

export function ReportView({ student, state, recommendations }: ReportViewProps) {
  const [selectedId, setSelectedId] = useState<string>(recommendations[0]?.id ?? "");

  const stateDate = new Date(state.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const grouped: Record<Tier, Recommendation[]> = { reach: [], match: [], safety: [] };
  for (const rec of recommendations) {
    grouped[rec.match_category].push(rec);
  }
  for (const tier of TIER_ORDER) {
    grouped[tier].sort((a, b) => Number(b.composite_score ?? 0) - Number(a.composite_score ?? 0));
  }

  const selected = recommendations.find((r) => r.id === selectedId) ?? recommendations[0];

  const snapshotParts = [
    state.sat_score ? `SAT ${state.sat_score}` : null,
    state.act_score ? `ACT ${state.act_score}` : null,
    state.gpa ? `GPA ${Number(state.gpa).toFixed(2)}` : null,
    state.ielts_score ? `IELTS ${Number(state.ielts_score).toFixed(1)}` : null,
  ].filter(Boolean);

  if (!selected) return null;

  const u = selected.university;
  const m = selected.major;
  const composite = Math.round(Number(selected.composite_score ?? 0));

  const acceptanceShort = u?.overall_acceptance_rate
    ? u.overall_acceptance_rate.length > 15
      ? u.overall_acceptance_rate.match(/[\d.]+%/)?.[0] ?? u.overall_acceptance_rate.slice(0, 12)
      : u.overall_acceptance_rate
    : null;

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
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

      {/* Header */}
      <div
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          padding: "var(--space-lg)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-text-primary)", margin: 0 }}>
              Recommendation Report
            </h1>
            <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>
              {student.name} · {stateDate}
            </span>
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
            {snapshotParts.map((p) => (
              <span key={p} style={{
                fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 500,
                color: "var(--color-text-secondary)", background: "var(--color-hover-bg)",
                padding: "4px 10px", borderRadius: "var(--radius-xs)",
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body: Nav + Detail */}
      <div className="grid" style={{ gridTemplateColumns: "280px 1fr", gap: "var(--space-md)", minHeight: 600 }}>
        {/* Nav sidebar */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {TIER_ORDER.map((tier) => (
            grouped[tier].length > 0 && (
              <div key={tier}>
                <div
                  style={{
                    padding: "8px 14px",
                    fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)",
                    color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
                    background: "var(--color-bg-wash)",
                    borderBottom: "1px solid var(--color-border-subtle)",
                  }}
                >
                  {tier} ({grouped[tier].length})
                </div>
                {grouped[tier].map((rec) => (
                  <NavItem
                    key={rec.id}
                    rec={rec}
                    isActive={rec.id === selected.id}
                    onClick={() => setSelectedId(rec.id)}
                  />
                ))}
              </div>
            )
          ))}
        </div>

        {/* Detail panel */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-lg)",
            gap: "var(--space-lg)",
          }}
        >
          {/* University header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center" style={{ gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", margin: 0 }}>
                  {u?.name ?? "Unknown University"}
                </h2>
                <TierBadge tier={selected.match_category} />
              </div>
              {m && (
                <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)", marginTop: 4, display: "block" }}>
                  {m.major_name}
                </span>
              )}
              <div className="flex items-center mt-2" style={{ gap: 16 }}>
                {u?.qs_rank && (
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>Rank #{u.qs_rank}</span>
                )}
                {u?.country && (
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>{u.country}</span>
                )}
                {acceptanceShort && (
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>AR {acceptanceShort}</span>
                )}
                {u?.tuition_usd && (
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>${Math.round(u.tuition_usd / 1000)}k/yr</span>
                )}
              </div>
            </div>
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 64, height: 64, borderRadius: "var(--radius-sm)",
                background: composite >= 70 ? "var(--color-stage-matched-dim)" : composite >= 45 ? "var(--color-stage-new-dim)" : "var(--color-stage-building-dim)",
              }}
            >
              <span style={{
                fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)",
                color: composite >= 70 ? "var(--color-stage-matched)" : composite >= 45 ? "var(--color-stage-new)" : "var(--color-stage-building)",
              }}>
                {composite}
              </span>
            </div>
          </div>

          {/* Rationale */}
          {selected.description && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px 0" }}>
                Rationale
              </h3>
              <p style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {selected.description}
              </p>
            </div>
          )}

          {/* Score breakdown */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px 0" }}>
              Score Breakdown
            </h3>
            <div className="flex flex-col" style={{ gap: 10 }}>
              {SCORE_LABELS.map(({ key, label, weight }) => (
                <ScoreBar key={key} label={label} weight={weight} score={Number(selected[key] ?? 0)} />
              ))}
            </div>
          </div>

          {/* Major details */}
          {m && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px 0" }}>
                Program Details
              </h3>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                {([
                  m.acceptance_rate ? { label: "Acceptance Rate", value: m.acceptance_rate } : null,
                  m.sat_min ? { label: "SAT Min", value: String(m.sat_min) } : null,
                  m.act_min ? { label: "ACT Min", value: String(m.act_min) } : null,
                  m.gpa_min ? { label: "GPA Min", value: Number(m.gpa_min).toFixed(2) } : null,
                  m.ielts_min ? { label: "IELTS Min", value: Number(m.ielts_min).toFixed(1) } : null,
                  m.toefl_min ? { label: "TOEFL Min", value: String(m.toefl_min) } : null,
                  m.ib_min ? { label: "IB Min", value: String(m.ib_min) } : null,
                  m.a_level_grades ? { label: "A-Level", value: m.a_level_grades } : null,
                ] as ({ label: string; value: string } | null)[]).filter((x): x is { label: string; value: string } => x != null).map((item) => (
                  <div key={item.label} className="flex justify-between" style={{ borderBottom: "1px solid var(--color-border-subtle)", padding: "6px 0" }}>
                    <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
