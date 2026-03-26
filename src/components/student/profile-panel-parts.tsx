export function ScoreItem({ label, value }: { label: string; value: string | number | null }) {
  const display = value != null ? String(value) : "—";
  const hasValue = value != null;
  return (
    <div className="flex flex-col" style={{ gap: 2 }}>
      <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: 22, fontFamily: "var(--font-mono)", fontWeight: 600, color: hasValue ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
        {display}
      </span>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
      <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        fontSize: 15,
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        background: "var(--color-hover-bg)",
        borderRadius: "var(--radius-xs)",
      }}
    >
      {children}
    </span>
  );
}

export function PreferenceRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center py-1.5" style={{ gap: 8, borderBottom: "1px solid var(--color-border-subtle)" }}>
      <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{icon}</span>
      <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", minWidth: 60 }}>{label}</span>
      <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 15, fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {children}
    </span>
  );
}
