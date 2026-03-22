/**
 * Subtle background patterns for grid cells.
 * Usage: place as the first child of a cell with position: relative.
 * Each pattern is absolutely positioned and pointer-events: none.
 */

const base: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  zIndex: 0,
};

/** Evenly spaced dots */
export function DotGrid({ color = "var(--color-border)", size = 1, gap = 16, opacity = 0.5 }: { color?: string; size?: number; gap?: number; opacity?: number }) {
  return (
    <div
      style={{
        ...base,
        opacity,
        backgroundImage: `radial-gradient(circle, ${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  );
}

/** Fine grid lines */
export function FineGrid({ color = "var(--color-border-subtle)", gap = 24, opacity = 0.6 }: { color?: string; gap?: number; opacity?: number }) {
  return (
    <div
      style={{
        ...base,
        opacity,
        backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  );
}

/** Diagonal crosshatch lines */
export function Crosshatch({ color = "var(--color-border-subtle)", gap = 20, opacity = 0.35 }: { color?: string; gap?: number; opacity?: number }) {
  return (
    <div
      style={{
        ...base,
        opacity,
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent ${gap - 1}px, ${color} ${gap - 1}px, ${color} ${gap}px), repeating-linear-gradient(-45deg, transparent, transparent ${gap - 1}px, ${color} ${gap - 1}px, ${color} ${gap}px)`,
      }}
    />
  );
}

/** Horizontal dashed lines */
export function DashedLines({ color = "var(--color-border-subtle)", gap = 32, opacity = 0.45 }: { color?: string; gap?: number; opacity?: number }) {
  return (
    <div
      style={{
        ...base,
        opacity,
        backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${gap - 1}px, ${color} ${gap - 1}px, ${color} ${gap}px)`,
        maskImage: "repeating-linear-gradient(to right, black 8px, transparent 8px, transparent 16px)",
        WebkitMaskImage: "repeating-linear-gradient(to right, black 8px, transparent 8px, transparent 16px)",
      }}
    />
  );
}

/** Large plus/cross marks scattered */
export function PlusGrid({ color = "var(--color-border)", gap = 48, opacity = 0.3 }: { color?: string; gap?: number; opacity?: number }) {
  const half = gap / 2;
  return (
    <div
      style={{
        ...base,
        opacity,
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${half}px ${half}px`,
        maskImage: `radial-gradient(circle 3px at ${half}px ${half}px, black 100%, transparent 100%)`,
        maskSize: `${gap}px ${gap}px`,
        WebkitMaskImage: `radial-gradient(circle 3px at ${half}px ${half}px, black 100%, transparent 100%)`,
        WebkitMaskSize: `${gap}px ${gap}px`,
      }}
    />
  );
}
