interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  dotColor?: string;
}

export function StatCard({ label, value, subtext, dotColor }: StatCardProps) {
  return (
    <div
      className="flex flex-col p-4 h-full"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        gap: 4,
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
      <span className="text-mono" style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
        {subtext || "\u00A0"}
      </span>
      <span
        style={{
          fontSize: 40,
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          color: dotColor || "var(--color-text-primary)",
          lineHeight: 1,
          marginTop: 4,
        }}
      >
        {value}
      </span>
    </div>
  );
}
