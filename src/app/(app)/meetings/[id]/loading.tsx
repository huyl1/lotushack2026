export default function MeetingDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col" style={{ gap: 8 }}>
          <div className="skeleton" style={{ height: 28, width: 200 }} />
          <div className="skeleton" style={{ height: 16, width: 300 }} />
        </div>
        <div className="skeleton" style={{ height: 36, width: 120 }} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton" style={{ height: 400, border: "1px solid var(--color-border)" }} />
        <div className="skeleton" style={{ height: 400, border: "1px solid var(--color-border)" }} />
      </div>
    </div>
  );
}
