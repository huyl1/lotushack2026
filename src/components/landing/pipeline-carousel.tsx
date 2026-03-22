"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PipelineStep {
  n: string;
  title: string;
  desc: string;
  tool: string;
  image: string | null;
}

export function PipelineCarousel({ steps }: { steps: PipelineStep[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);

  // Calculate max translate: how far track needs to move so last card's right edge
  // aligns with the 960px content boundary right edge
  const calcMaxTranslate = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.children.length) return;

    const lastCard = track.children[track.children.length - 1] as HTMLElement;
    const contentRightEdge = (window.innerWidth + 960) / 2; // right edge of 960px centered content
    const lastCardRight = lastCard.offsetLeft + lastCard.offsetWidth;
    const needed = lastCardRight - contentRightEdge;
    setMaxTranslate(Math.max(0, needed));
  }, []);

  useEffect(() => {
    calcMaxTranslate();
    window.addEventListener("resize", calcMaxTranslate);
    return () => window.removeEventListener("resize", calcMaxTranslate);
  }, [calcMaxTranslate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = containerHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const translateX = -scrollProgress * maxTranslate;

  // Container height: 100vh visible + enough scroll to move the track fully
  // Scale scroll distance proportional to how much we need to translate
  const extraScroll = maxTranslate > 0 ? Math.ceil(maxTranslate / 2) : 0;

  return (
    <div
      ref={containerRef}
      style={{ height: `calc(100vh + ${extraScroll}px)`, position: "relative", background: "var(--color-bg-card)" }}
    >
      <div
        className="sticky flex flex-col overflow-hidden"
        style={{ top: 64, height: "calc(100vh - 64px)" }}
      >
        {/* Section bar — inside sticky */}
        <div style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
          <div className="flex items-center justify-between" style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px" }}>
            <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-text-muted)" }}>[03] HOW IT WORKS</span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-text-muted)" }}>/ 6 STEPS</span>
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", width: "100%", padding: "32px 24px 0" }}>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 24px 0", color: "var(--color-text-primary)" }}>
            From raw data to<br />
            <span style={{ color: "var(--color-text-muted)" }}>personalized recommendations.</span>
          </h2>

          {/* Progress dots */}
          <div className="flex items-center" style={{ gap: 6, marginBottom: 40 }}>
            {steps.map((step, i) => {
              const stepProgress = i / (steps.length - 1);
              const isActive = scrollProgress >= stepProgress - 0.05;
              return (
                <div key={step.n}>
                  <div style={{
                    width: isActive ? 24 : 8, height: 8, borderRadius: 4,
                    background: isActive ? "var(--color-accent)" : "var(--color-border)",
                    transition: "all 0.3s ease",
                  }} />
                </div>
              );
            })}
          </div>
        </div>
        {/* Cards track */}
        <div
          ref={trackRef}
          className="flex"
          style={{
            gap: 16,
            transform: `translateX(${translateX}px)`,
            transition: "transform 0.05s linear",
            paddingLeft: "max(24px, calc((100vw - 960px) / 2))",
          }}
        >
          {steps.map((step) => (
            <div
              key={step.n}
              className="flex flex-col shrink-0"
              style={{
                width: 480,
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {/* Image */}
              <div
                className="flex items-center justify-center"
                style={{
                  height: 260,
                  background: "var(--color-bg-muted)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {step.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={step.image} alt={step.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{
                    fontSize: 64, fontWeight: 800, fontFamily: "var(--font-poppins)",
                    color: "var(--color-border)", opacity: 0.4, lineHeight: 1,
                  }}>
                    {step.n}
                  </span>
                )}
                {/* Tool badge */}
                <div
                  className="absolute flex items-center"
                  style={{
                    top: 12, left: 12, gap: 6,
                    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
                    padding: "4px 10px", borderRadius: 6,
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono)", fontWeight: 600, color: "var(--color-text-secondary)" }}>{step.tool}</span>
                </div>
              </div>
              {/* Content */}
              <div className="flex flex-col" style={{ padding: 20, gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)" }}>{step.title}</span>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
