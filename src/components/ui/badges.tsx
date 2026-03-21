import type { CSSProperties } from "react";

/* ============================================================
   Stage Badge
   ============================================================ */

export type StudentStage =
  | "new"
  | "profile_building"
  | "matched"
  | "presented"
  | "decided"
  | "archived";

const stageConfig: Record<
  StudentStage,
  { label: string; color: string; bg: string }
> = {
  new: {
    label: "New",
    color: "var(--color-stage-new)",
    bg: "var(--color-stage-new-dim)",
  },
  profile_building: {
    label: "Building",
    color: "var(--color-stage-building)",
    bg: "var(--color-stage-building-dim)",
  },
  matched: {
    label: "Matched",
    color: "var(--color-stage-matched)",
    bg: "var(--color-stage-matched-dim)",
  },
  presented: {
    label: "Presented",
    color: "var(--color-stage-presented)",
    bg: "var(--color-stage-presented-dim)",
  },
  decided: {
    label: "Decided",
    color: "var(--color-stage-decided)",
    bg: "var(--color-stage-decided-dim)",
  },
  archived: {
    label: "Archived",
    color: "var(--color-text-muted)",
    bg: "var(--color-bg-muted)",
  },
};

export function StageBadge({ stage }: { stage: StudentStage }) {
  const config = stageConfig[stage];

  return (
    <span
      className="text-caption inline-flex items-center whitespace-nowrap"
      style={{
        padding: "1px 8px",
        borderRadius: "var(--radius-full)",
        background: config.bg,
        color: config.color,
        fontWeight: 500,
      }}
    >
      {config.label}
    </span>
  );
}

/* ============================================================
   Tier Badge
   ============================================================ */

export type Tier = "reach" | "match" | "safety";

const tierConfig: Record<Tier, { label: string; color: string; bg: string }> = {
  reach: {
    label: "Reach",
    color: "var(--color-tier-reach)",
    bg: "var(--color-tier-reach-dim)",
  },
  match: {
    label: "Match",
    color: "var(--color-tier-match)",
    bg: "var(--color-tier-match-dim)",
  },
  safety: {
    label: "Safety",
    color: "var(--color-tier-safety)",
    bg: "var(--color-tier-safety-dim)",
  },
};

export function TierBadge({
  tier,
  style,
}: {
  tier: Tier;
  style?: CSSProperties;
}) {
  const config = tierConfig[tier];

  return (
    <span
      className="inline-flex items-center whitespace-nowrap uppercase"
      style={{
        padding: "2px 10px",
        borderRadius: "var(--radius-full)",
        background: config.bg,
        color: config.color,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.06em",
        ...style,
      }}
    >
      {config.label}
    </span>
  );
}

/* ============================================================
   Score Badge (for fit scores)
   ============================================================ */

export function ScoreBadge({ score }: { score: number }) {
  let color = "var(--color-text-muted)";
  let bg = "var(--color-bg-muted)";

  if (score >= 90) {
    color = "var(--color-tier-match)";
    bg = "var(--color-tier-match-dim)";
  } else if (score >= 70) {
    color = "var(--color-info)";
    bg = "var(--color-info-dim)";
  } else if (score >= 50) {
    color = "var(--color-warning)";
    bg = "var(--color-warning-dim)";
  }

  return (
    <span
      className="text-mono-lg inline-flex items-center justify-center"
      style={{
        width: 36,
        height: 24,
        borderRadius: "var(--radius-xs)",
        background: bg,
        color,
        fontWeight: 600,
      }}
    >
      {score}
    </span>
  );
}
