"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface StackingSectionProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  style?: React.CSSProperties;
}

export function StackingSection({ children, index, className, style }: StackingSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // As this section scrolls out, it scales down and dims — next section covers it
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.4]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 16]);

  return (
    <div ref={ref} style={{ position: "relative", zIndex: index }}>
      <motion.div
        className={className}
        style={{
          position: "sticky",
          top: 0,
          scale,
          opacity,
          borderRadius,
          transformOrigin: "center top",
          overflow: "hidden",
          ...style,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
