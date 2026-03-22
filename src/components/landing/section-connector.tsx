"use client";

import { motion } from "motion/react";

export function SectionConnector() {
  return (
    <div className="flex flex-col items-center" style={{ height: 80, position: "relative", zIndex: 5 }}>
      {/* Vertical line */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          width: 1,
          height: 48,
          background: "var(--color-border)",
          transformOrigin: "top",
        }}
      />
      {/* Dot */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.5, type: "spring", stiffness: 300 }}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--color-accent)",
          marginTop: 4,
        }}
      />
    </div>
  );
}
