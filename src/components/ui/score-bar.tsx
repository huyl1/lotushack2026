interface ScoreBarProps {
  label: string;
  score: number; // 0-100
  maxScore?: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "var(--color-tier-match)";
  if (score >= 70) return "var(--color-info)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-text-muted)";
}

export function ScoreBar({ label, score, maxScore = 100 }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </span>
        <span className="text-mono" style={{ color }}>
          {score}
        </span>
      </div>
      <div
        className="w-full overflow-hidden"
        style={{
          height: 4,
          borderRadius: 2,
          background: "var(--color-border)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 2,
            background: color,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
