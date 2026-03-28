export default function DashboardLoading() {
  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
      {/* Banner */}
      <div className="skeleton" style={{ height: 80 }} />

      {/* Stats row */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 120, border: "1px solid var(--color-border)" }}
          />
        ))}
      </div>

      {/* Pipeline + Action Queue side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 panels-row" style={{ gap: "var(--space-md)" }}>
        <div className="skeleton" style={{ border: "1px solid var(--color-border)" }} />
        <div className="skeleton" style={{ border: "1px solid var(--color-border)" }} />
      </div>
    </div>
  );
}
