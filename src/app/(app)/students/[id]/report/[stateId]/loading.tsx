export default function ReportLoading() {
  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
      <div className="skeleton" style={{ height: 20, width: 140 }} />
      <div className="skeleton" style={{ height: 72 }} />
      <div className="grid" style={{ gridTemplateColumns: "280px 1fr", gap: "var(--space-md)", minHeight: 600 }}>
        <div className="skeleton" style={{ border: "1px solid var(--color-border)" }} />
        <div className="skeleton" style={{ border: "1px solid var(--color-border)" }} />
      </div>
    </div>
  );
}
