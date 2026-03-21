"use client";

import { type ReactNode, useState, useEffect } from "react";

interface PageBannerProps {
  title: string;
  subtitle: string;
  primaryMeta?: ReactNode;
  secondaryMeta?: ReactNode;
  background?: ReactNode;
  draggable?: boolean;
}

function LiveClock() {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;
  return <>{time}</>;
}

function FormattedDate() {
  const [date, setDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  if (!mounted) return null;
  return <>{date}</>;
}

export function PageBanner({
  title,
  subtitle,
  primaryMeta,
  secondaryMeta,
  background,
  draggable = true,
}: PageBannerProps) {
  return (
    <div
      className={`relative h-full overflow-hidden ${draggable ? "panel-header cursor-grab" : ""}`}
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

      {/* Four-corner content overlay */}
      <div
        className="relative z-10 grid h-full pointer-events-none"
        style={{
          gridTemplateColumns: "1fr auto",
          gridTemplateRows: "1fr 1fr",
          padding: "var(--space-md) var(--space-lg)",
        }}
      >
        {/* Top-left: Title */}
        <h1
          className="self-start pointer-events-auto"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        {/* Top-right: Primary metadata */}
        <div
          className="self-start text-right"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {primaryMeta ?? <LiveClock />}
        </div>

        {/* Bottom-left: Subtitle */}
        <p
          className="self-end"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            margin: 0,
          }}
        >
          {subtitle}
        </p>

        {/* Bottom-right: Secondary metadata */}
        <div
          className="self-end text-right"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {secondaryMeta ?? <FormattedDate />}
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
