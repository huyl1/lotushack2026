export default function SentimentLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="skeleton" style={{ height: 28, width: 200 }} />
      <div className="skeleton mt-2" style={{ height: 16, width: 360 }} />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="skeleton" style={{ height: 280, border: "1px solid var(--color-border)" }} />
        <div className="skeleton" style={{ height: 280, border: "1px solid var(--color-border)" }} />
      </div>
    </div>
  );
}
