export default function MeetingsLoading() {
  return (
    <div className="flex flex-col" style={{ gap: "var(--space-md)", padding: "var(--space-md)" }}>
      <div
        className="skeleton"
        style={{
          height: 48,
          borderRadius: "var(--radius-sm)",
          background: "var(--color-bg-wash)",
        }}
      />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: 80,
            borderRadius: "var(--radius-sm)",
            background: "var(--color-bg-wash)",
            border: "1px solid var(--color-border)",
          }}
        />
      ))}
    </div>
  );
}
