"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TierBadge } from "@/components/ui/badges";
import { useBreadcrumb } from "@/lib/context/breadcrumb";
import type { Student, StudentState, Recommendation, Tier } from "@/lib/supabase/types";

interface ReportViewProps {
  student: Student;
  state: StudentState;
  recommendations: Recommendation[];
}

const SCORE_LABELS: { key: keyof Pick<Recommendation, "academic_alignment" | "financial_sustainability" | "student_success" | "lifestyle_culture" | "admission_chance">; descKey: keyof Pick<Recommendation, "academic_alignment_description" | "financial_sustainability_description" | "student_success_description" | "lifestyle_culture_description" | "admission_chance_description">; label: string }[] = [
  { key: "academic_alignment", descKey: "academic_alignment_description", label: "Academic Alignment" },
  { key: "financial_sustainability", descKey: "financial_sustainability_description", label: "Financial Sustainability" },
  { key: "student_success", descKey: "student_success_description", label: "Student Success" },
  { key: "lifestyle_culture", descKey: "lifestyle_culture_description", label: "Lifestyle & Culture" },
  { key: "admission_chance", descKey: "admission_chance_description", label: "Admission Chance" },
];

const TIER_ORDER: Tier[] = ["reach", "match", "safety"];

const TIER_COLORS: Record<Tier, { color: string; bg: string }> = {
  reach: { color: "var(--color-tier-reach)", bg: "var(--color-tier-reach-dim)" },
  match: { color: "var(--color-tier-match)", bg: "var(--color-tier-match-dim)" },
  safety: { color: "var(--color-tier-safety)", bg: "var(--color-tier-safety-dim)" },
};

function scoreColor(score: number): string {
  // Interpolate from red (0) → yellow (50) → green (100)
  const r = score < 50 ? 220 : Math.round(220 - (score - 50) * 3.6);
  const g = score < 50 ? Math.round(60 + score * 3.2) : 220;
  const b = score < 50 ? 50 : Math.round(50 + (score - 50) * 0.6);
  return `rgb(${r}, ${g}, ${b})`;
}

function ScoreBar({ label, score, description }: { label: string; score: number; description?: string | null }) {
  const color = scoreColor(score);

  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", width: 180, flexShrink: 0 }}>
          {label}
        </span>
        <div className="flex-1" style={{ height: 10, borderRadius: 5, background: "var(--color-border)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${score}%`, borderRadius: 5, background: color, transition: "width 0.3s ease" }} />
        </div>
        <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 600, color, width: 32, textAlign: "right", flexShrink: 0 }}>
          {score}
        </span>
      </div>
      {description && (
        <p style={{ fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", margin: 0, paddingLeft: 190, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
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
      </div>
    </button>
  );
}

export function ReportView({ student, state, recommendations }: ReportViewProps) {
  const [selectedId, setSelectedId] = useState<string>(recommendations[0]?.id ?? "");
  const [collapsedTiers, setCollapsedTiers] = useState<Set<Tier>>(new Set());
  const { setDynamicLabel } = useBreadcrumb();
  useEffect(() => {
    setDynamicLabel(student.id, student.name);
  }, [student.id, student.name, setDynamicLabel]);

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
        className="relative overflow-hidden"
        style={{
          background: "#0f0f14",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)",
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex items-center"
          style={{
            padding: "0 var(--space-lg)",
            height: 72,
            gap: "var(--space-md)",
          }}
        >
          <h1
            className="flex-1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Recommendation Report
          </h1>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              margin: 0,
            }}
          >
            {student.name} · {stateDate}
          </p>

          <div className="flex items-center" style={{ gap: 8 }}>
            {snapshotParts.map((p) => (
              <span key={p} style={{
                fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 500,
                color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)",
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
          {TIER_ORDER.map((tier) => {
            if (grouped[tier].length === 0) return null;
            const isCollapsed = collapsedTiers.has(tier);
            const tierColor = TIER_COLORS[tier];
            return (
              <div key={tier}>
                <button
                  onClick={() => setCollapsedTiers((prev) => {
                    const next = new Set(prev);
                    if (next.has(tier)) next.delete(tier); else next.add(tier);
                    return next;
                  })}
                  className="flex items-center justify-between w-full"
                  style={{
                    padding: "8px 14px",
                    fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)",
                    color: tierColor.color, textTransform: "uppercase", letterSpacing: "0.08em",
                    background: tierColor.bg,
                    border: "none", borderBottomStyle: "solid", borderBottomWidth: 1, borderBottomColor: "var(--color-border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  <span>{tier} ({grouped[tier].length})</span>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: "transform 0.15s", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </button>
                {!isCollapsed && grouped[tier].map((rec) => (
                  <NavItem
                    key={rec.id}
                    rec={rec}
                    isActive={rec.id === selected.id}
                    onClick={() => setSelectedId(rec.id)}
                  />
                ))}
              </div>
            );
          })}
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
              {SCORE_LABELS.map(({ key, descKey, label }) => (
                <ScoreBar key={key} label={label} score={Number(selected[key] ?? 0)} description={selected[descKey]} />
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
