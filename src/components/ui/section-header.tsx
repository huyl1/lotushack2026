interface SectionHeaderProps {
  title: string;
  count?: number | string;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 select-none h-full">
      <span
        className="text-caption shrink-0 uppercase"
        style={{
          color: "var(--color-text-muted)",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </span>
      <div
        className="flex-1"
        style={{ height: 1, background: "var(--color-border)" }}
      />
      {count !== undefined && (
        <span className="text-mono shrink-0" style={{ color: "var(--color-text-muted)" }}>
          {count}
        </span>
      )}
    </div>
  );
}
