interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  dotColor?: string;
}

export function StatCard({ label, value, subtext, dotColor }: StatCardProps) {
  return (
    <div
      className="flex flex-col justify-between p-4 h-full"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      <div className="flex items-center gap-2">
        {dotColor && (
          <span
            className="shrink-0 rounded-full"
            style={{ width: 6, height: 6, background: dotColor }}
          />
        )}
        <span className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </span>
      </div>
      <span className="text-display">{value}</span>
      <span className="text-mono" style={{ color: "var(--color-text-muted)" }}>
        {subtext || "\u00A0"}
      </span>
    </div>
  );
}
