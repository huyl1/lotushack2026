/** Skeleton shimmer for the student table, shown while data streams in via Suspense. */
export function StudentTableSkeleton() {
  return (
    <>
      {/* Section header placeholder */}
      <div className="flex items-center gap-2" style={{ height: 20 }}>
        <div className="skeleton" style={{ width: 80, height: 12 }} />
        <div className="flex-1" style={{ height: 1, background: "var(--color-border)" }} />
      </div>

      {/* Table shell */}
      <div
        style={{
          minHeight: 280,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg-card)",
          overflow: "hidden",
        }}
      >
        {/* Real header — zero CLS when data arrives */}
        <div
          className="grid items-center px-4 py-2"
          style={{
            gridTemplateColumns: "2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.7fr 0.6fr",
            gap: "var(--space-sm)",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg-wash)",
          }}
        >
          {["Name", "Grade", "SAT", "ACT", "GPA", "IELTS", "Stage", "Updated"].map((col) => (
            <span
              key={col}
              className="text-caption uppercase"
              style={{
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
                fontSize: 14,
                textAlign: col === "Name" ? "left" : "right",
              }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Shimmer rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid items-center px-4 py-3"
            style={{
              gridTemplateColumns: "2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.7fr 0.6fr",
              gap: "var(--space-sm)",
              borderBottom: i < 5 ? "1px solid var(--color-border-subtle)" : "none",
            }}
          >
            {/* Name cell */}
            <div className="flex items-center" style={{ gap: 8 }}>
              <div
                className="skeleton shrink-0"
                style={{ width: 28, height: 28, borderRadius: "var(--radius-full)" }}
              />
              <div
                className="skeleton"
                style={{ width: `${55 + (i % 3) * 15}%`, height: 14 }}
              />
            </div>
            {/* Score + stage cells */}
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="flex justify-end">
                <div className="skeleton" style={{ width: 32, height: 14 }} />
              </div>
            ))}
            {/* Updated cell */}
            <div className="flex justify-end">
              <div className="skeleton" style={{ width: 48, height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
