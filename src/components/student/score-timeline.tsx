"use client";

import { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Panel } from "@/components/ui/panel";
import type { StudentState } from "@/lib/supabase/types";

interface ScoreTimelineProps {
  states: StudentState[];
}

type Metric = "SAT" | "ACT" | "GPA" | "IELTS";

const METRICS: { key: Metric; color: string; domain: [number | string, number | string]; format: (v: number) => string }[] = [
  { key: "SAT",   color: "#6366f1", domain: ["auto", "auto"],  format: (v) => String(v) },
  { key: "ACT",   color: "#f59e0b", domain: [1, 36],           format: (v) => String(v) },
  { key: "GPA",   color: "#10b981", domain: [0, 4.0],          format: (v) => v.toFixed(2) },
  { key: "IELTS", color: "#8b5cf6", domain: [0, 9.0],          format: (v) => v.toFixed(1) },
];

const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e0d9",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "var(--font-sans)",
  color: "#1a1a1a",
  padding: "6px 10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

function scoreColor(prev: number | null, curr: number): string {
  if (prev == null) return "var(--color-text-primary)";
  const diff = curr - prev;
  if (diff > 0) return "var(--color-stage-matched)";
  if (diff < 0) return "var(--color-destructive)";
  return "var(--color-text-primary)";
}

function getValue(s: StudentState, key: Metric): number | null {
  switch (key) {
    case "SAT":   return s.sat_score ?? null;
    case "ACT":   return s.act_score ?? null;
    case "GPA":   return s.gpa != null ? Number(s.gpa) : null;
    case "IELTS": return s.ielts_score != null ? Number(s.ielts_score) : null;
  }
}

export function ScoreTimeline({ states }: ScoreTimelineProps) {
  const [metric, setMetric] = useState<Metric>("SAT");
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState<{ w: number; h: number } | null>(null);
  const m = METRICS.find((x) => x.key === metric)!;

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]!.contentRect;
      if (width > 0 && height > 0) setChartSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chartData = states.map((s) => ({
    date: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
    value: getValue(s, metric),
  }));

  const tableRows = [...states].reverse();
  const hasData = chartData.some((d) => d.value != null);

  return (
    <Panel
      title="Snapshots"
      dotColor="var(--color-stage-building)"
      tabs={["SAT", "ACT", "GPA", "IELTS"]}
      activeTab={metric}
      onTabChange={(t) => setMetric(t as Metric)}
      footer={
        <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {states.length} {states.length === 1 ? "snapshot" : "snapshots"} recorded
        </span>
      }
    >
      {states.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>No snapshots yet</span>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: 0, height: "100%" }}>
          {/* Chart */}
          <div ref={chartRef} style={{ flex: "0 0 45%", minHeight: 0, padding: "8px 0 4px" }}>
            {hasData && chartSize ? (
              <LineChart data={chartData} width={chartSize.w} height={chartSize.h} margin={{ top: 4, right: 16, bottom: 4, left: -16 }}>
                <CartesianGrid stroke="#ece9e1" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#8a857e", fontFamily: "var(--font-mono)" }}
                  axisLine={{ stroke: "#c4c1b9" }}
                  tickLine={false}
                />
                <YAxis
                  domain={m.domain}
                  tick={{ fontSize: 11, fill: "#8a857e", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={m.format}
                  width={36}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [
                    m.format(typeof v === "number" ? v : Number(v)),
                    metric,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={m.color}
                  strokeWidth={2}
                  dot={{ fill: m.color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  connectNulls
                />
              </LineChart>
            ) : !hasData ? (
              <div className="flex items-center justify-center h-full">
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No {metric} data</span>
              </div>
            ) : null}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--color-border)", flexShrink: 0 }} />

          {/* Table */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div
              className="grid px-4 py-2"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                background: "var(--color-bg-wash)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {["Date", metric].map((col) => (
                <span key={col} style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {col}
                </span>
              ))}
            </div>
            {tableRows.map((s, idx, arr) => {
              const curr = getValue(s, metric);
              const prevState = idx < arr.length - 1 ? arr[idx + 1] : null;
              const prev = prevState ? getValue(prevState, metric) : null;
              const isLatest = idx === 0;
              return (
                <div
                  key={s.id}
                  className="grid px-4 py-2"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    borderBottom: idx < tableRows.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                  }}
                >
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", textDecoration: isLatest ? "underline" : "none", textUnderlineOffset: 4 }}>
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                  </span>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 500, color: curr != null ? scoreColor(prev, curr) : "var(--color-text-muted)" }}>
                    {curr != null ? m.format(curr) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Panel>
  );
}
