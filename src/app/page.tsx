import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Nav */}
      <header
        className="flex items-center justify-between px-8 shrink-0"
        style={{
          height: 64,
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-surface)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--color-tier-match)" }}
          />
          <span className="text-heading tracking-tight">Edify</span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center px-5 h-9 text-caption transition-colors"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-text-inverse)",
            borderRadius: "var(--radius-xs)",
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div
          className="w-full flex flex-col items-center text-center animate-fade-up"
          style={{ maxWidth: 640, gap: "var(--space-lg)" }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 text-caption"
            style={{
              background: "var(--color-success-dim)",
              color: "var(--color-success)",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-success)" }}
            />
            AI-powered university matching
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Smarter student
            <br />
            placement starts here
          </h1>

          {/* Subtitle */}
          <p
            className="text-body"
            style={{
              color: "var(--color-text-secondary)",
              fontSize: 17,
              lineHeight: 1.6,
              maxWidth: 480,
            }}
          >
            Edify helps education consultants match students to the right
            universities with AI-driven recommendations, profile tracking, and
            actionable insights.
          </p>

          {/* CTA */}
          <div
            className="flex items-center justify-center"
            style={{ gap: "var(--space-sm)", paddingTop: "var(--space-sm)" }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 h-11 text-subhead transition-colors"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-text-inverse)",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
            >
              Get started
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 7h12M8 2l5 5-5 5" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-6 h-11 text-subhead border transition-colors"
              style={{
                background: "transparent",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div
          className="w-full grid animate-fade-up"
          style={{
            maxWidth: 800,
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-md)",
            marginTop: "var(--space-3xl)",
            animationDelay: "120ms",
          }}
        >
          {[
            {
              title: "Student Profiles",
              description:
                "Track academic scores, preferences, and progress across the entire advisory journey.",
              color: "var(--color-stage-new)",
            },
            {
              title: "AI Matching",
              description:
                "Get intelligent university and major recommendations based on student data and fit analysis.",
              color: "var(--color-tier-match)",
            },
            {
              title: "Pipeline View",
              description:
                "Manage your caseload with stage-based tracking from intake through final decision.",
              color: "var(--color-tier-reach)",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col p-5"
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-md)",
                gap: "var(--space-sm)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: feature.color }}
              />
              <h3 className="text-subhead" style={{ margin: 0 }}>
                {feature.title}
              </h3>
              <p
                className="text-body-sm"
                style={{
                  color: "var(--color-text-secondary)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="flex items-center justify-center shrink-0 py-6"
        style={{ borderTop: "1px solid var(--color-border-subtle)" }}
      >
        <span
          className="text-caption"
          style={{ color: "var(--color-text-muted)" }}
        >
          Edify — Built for LotusHack 2026
        </span>
      </footer>
    </div>
  );
}
