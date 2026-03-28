export default function StudentLoading() {
  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
      <div
        className="skeleton"
        style={{
          height: 64,
          borderRadius: "var(--radius-sm)",
          background: "var(--color-bg-wash)",
        }}
      />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: 200,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg-wash)",
              border: "1px solid var(--color-border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
