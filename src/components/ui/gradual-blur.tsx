"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

type Position = "top" | "bottom" | "left" | "right";
type CurveType = "linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out";

interface GradualBlurProps {
  position?: Position;
  strength?: number;
  height?: string;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  opacity?: number;
  curve?: CurveType;
  target?: "parent" | "page";
  className?: string;
  style?: React.CSSProperties;
}

const CURVE_FUNCTIONS: Record<CurveType, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  "ease-in": (p) => p * p,
  "ease-out": (p) => 1 - Math.pow(1 - p, 2),
  "ease-in-out": (p) =>
    p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
};

const getGradientDirection = (position: Position) => {
  const directions: Record<Position, string> = {
    top: "to top",
    bottom: "to bottom",
    left: "to left",
    right: "to right",
  };
  return directions[position] || "to bottom";
};

export function GradualBlur({
  position = "bottom",
  strength = 2,
  height = "6rem",
  divCount = 5,
  exponential = false,
  zIndex = 1000,
  opacity = 1,
  curve = "linear",
  target = "parent",
  className = "",
  style = {},
}: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const blurDivs = useMemo(() => {
    const divs: React.ReactElement[] = [];
    const increment = 100 / divCount;
    const curveFunc = CURVE_FUNCTIONS[curve] || CURVE_FUNCTIONS.linear;

    for (let i = 1; i <= divCount; i++) {
      let progress = i / divCount;
      progress = curveFunc(progress);

      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * strength
        : 0.0625 * (progress * divCount + 1) * strength;

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(position);

      divs.push(
        <div
          key={i}
          style={{
            position: "absolute",
            inset: "0",
            maskImage: `linear-gradient(${direction}, ${gradient})`,
            WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
            backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            opacity,
          }}
        />
      );
    }

    return divs;
  }, [divCount, curve, exponential, strength, position, opacity]);

  const isVertical = ["top", "bottom"].includes(position);
  const isPageTarget = target === "page";

  const containerStyle: React.CSSProperties = {
    position: isPageTarget ? "fixed" : "absolute",
    pointerEvents: "none",
    opacity: isVisible ? 1 : 0,
    zIndex: isPageTarget ? zIndex + 100 : zIndex,
    ...style,
  };

  if (isVertical) {
    containerStyle.height = height;
    containerStyle.width = "100%";
    containerStyle[position as "top" | "bottom"] = 0;
    containerStyle.left = 0;
    containerStyle.right = 0;
  } else {
    containerStyle.width = height;
    containerStyle.height = "100%";
    containerStyle[position as "left" | "right"] = 0;
    containerStyle.top = 0;
    containerStyle.bottom = 0;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
    >
      <div className="relative w-full h-full">{blurDivs}</div>
    </div>
  );
}
