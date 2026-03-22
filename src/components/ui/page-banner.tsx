"use client";

import { type ReactNode, useEffect, useState } from "react";

interface PageBannerProps {
  title: string;
  subtitle: string;
  primaryMeta?: ReactNode;
  background?: ReactNode;
}

function LiveClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  );

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <>{time}</>;
}

export function PageBanner({
  title,
  subtitle,
  primaryMeta,
  background,
}: PageBannerProps) {
  return (
    <div
      className="relative h-full overflow-hidden"
      style={{
        background: "#0f0f14",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {/* Background layer */}
      <div className="absolute inset-0 pointer-events-none">
        {background ?? <DefaultGradientBackground />}
      </div>

      {/* Content row */}
      <div
        className="relative z-10 flex items-center h-full pointer-events-none"
        style={{
          padding: "0 var(--space-lg)",
          gap: "var(--space-md)",
        }}
      >
        <h1
          className="flex-1 pointer-events-auto"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {primaryMeta ?? <LiveClock />}
        </div>
      </div>
    </div>
  );
}

/* ─── CSS gradient background ─── */
function DefaultGradientBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)",
      }}
    />
  );
}
