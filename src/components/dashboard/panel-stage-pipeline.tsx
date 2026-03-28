"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Panel } from "@/components/ui/panel";
import type { PanelStagePipelineProps } from "./dashboard.types";
import { STAGES, TOOLTIP_STYLE } from "./constants";
import { renderPieLabel } from "./utils";

export function PanelStagePipeline({ stageCounts, total }: PanelStagePipelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]!.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    return STAGES.map((stage) => ({
      name: stage.label,
      value: stageCounts[stage.key] ?? 0,
      color: stage.color,
    })).filter((d) => d.value > 0);
  }, [stageCounts]);

  const legend = (
    <div className="flex flex-wrap items-center" style={{ gap: "6px 12px" }}>
      {data.map((entry) => (
        <span
          key={entry.name}
          className="flex items-center gap-1.5"
          style={{ fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}
        >
          <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: entry.color }} />
          {entry.name} ({entry.value})
        </span>
      ))}
    </div>
  );

  return (
    <Panel
      title="Stage Overview"
      dotColor="var(--color-stage-matched)"
      headerRight={
        <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
          {total} total
        </span>
      }
      footer={legend}
    >
      <div ref={containerRef} className="relative" style={{ flex: 1, minHeight: 0 }}>
        {size && (
          <div className="animate-scale-fade-in">
          <PieChart width={size.w} height={size.h}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              dataKey="value"
              strokeWidth={2}
              stroke="#ffffff"
              label={renderPieLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => [`${value} students`, String(name)]}
            />
          </PieChart>
          </div>
        )}
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span style={{ fontSize: 24, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            {total}
          </span>
          <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
            students
          </span>
        </div>
      </div>
    </Panel>
  );
}
