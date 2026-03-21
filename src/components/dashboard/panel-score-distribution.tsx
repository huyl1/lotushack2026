"use client";

import { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, Customized,
} from "recharts";
import { Panel } from "@/components/ui/panel";
import { getStudentsWithLatestState } from "@/lib/data/mock";

const STAGE_COLORS: Record<string, string> = {
  new: "#6366f1",
  profile_building: "#f59e0b",
  matched: "#10b981",
  presented: "#8b5cf6",
  decided: "#06b6d4",
  archived: "#a09a92",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  profile_building: "Building",
  matched: "Matched",
  presented: "Presented",
  decided: "Decided",
};

type Metric = "sat" | "gpa" | "ielts" | "act";

const METRIC_CONFIG: Record<Metric, { label: string; key: string; domain: [number, number]; format: (v: number) => string }> = {
  sat:   { label: "SAT",   key: "sat_score",   domain: [1000, 1600], format: (v) => String(v) },
  gpa:   { label: "GPA",   key: "gpa",         domain: [2.5, 4.0],  format: (v) => v.toFixed(2) },
  ielts: { label: "IELTS", key: "ielts_score", domain: [5.0, 9.0],  format: (v) => v.toFixed(1) },
  act:   { label: "ACT",   key: "act_score",   domain: [20, 36],    format: (v) => String(v) },
};

const AXIS_TICK = { fontSize: 12, fill: "#8a857e", fontFamily: "var(--font-mono)" };
const AXIS_LINE = { stroke: "#c4c1b9" };
const GRID_STYLE = { stroke: "#ece9e1", strokeDasharray: "3 3" };
const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e0d9",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  color: "#1a1a1a",
  padding: "6px 10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const selectStyle: React.CSSProperties = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xs)",
  padding: "2px 6px",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  outline: "none",
};

function getRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  if (data.length < 2) return null;
  const n = data.length;
  const sumX = data.reduce((a, d) => a + d.x, 0);
  const sumY = data.reduce((a, d) => a + d.y, 0);
  const sumXY = data.reduce((a, d) => a + d.x * d.y, 0);
  const sumX2 = data.reduce((a, d) => a + d.x * d.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  return { slope: (n * sumXY - sumY * sumX) / denom, intercept: (sumY - (n * sumXY - sumY * sumX) / denom * sumX) / n };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendLine({ xAxisMap, yAxisMap, regression }: any) {
  if (!regression || !xAxisMap || !yAxisMap) return null;
  const xAxis = Object.values(xAxisMap)[0] as { scale: (v: number) => number; domain: number[] } | undefined;
  const yAxis = Object.values(yAxisMap)[0] as { scale: (v: number) => number } | undefined;
  if (!xAxis || !yAxis) return null;
  const [xMin, xMax] = xAxis.domain;
  return (
    <line
      x1={xAxis.scale(xMin)} y1={yAxis.scale(regression.slope * xMin + regression.intercept)}
      x2={xAxis.scale(xMax)} y2={yAxis.scale(regression.slope * xMax + regression.intercept)}
      stroke="#c4c1b9" strokeWidth={1.5} strokeDasharray="6 4"
    />
  );
}

export function PanelScoreDistribution() {
  const [xMetric, setXMetric] = useState<Metric>("sat");
  const [yMetric, setYMetric] = useState<Metric>("gpa");
  const students = useMemo(() => getStudentsWithLatestState(), []);

  const xConfig = METRIC_CONFIG[xMetric];
  const yConfig = METRIC_CONFIG[yMetric];

  const data = useMemo(() => {
    return students
      .filter((s) => {
        const ls = s.latest_state;
        if (!ls) return false;
        const xVal = (ls as unknown as Record<string, unknown>)[xConfig.key];
        const yVal = (ls as unknown as Record<string, unknown>)[yConfig.key];
        return xVal != null && yVal != null;
      })
      .map((s) => {
        const ls = s.latest_state!;
        return {
          name: s.name,
          x: (ls as unknown as Record<string, unknown>)[xConfig.key] as number,
          y: (ls as unknown as Record<string, unknown>)[yConfig.key] as number,
          stage: s.stage,
          color: STAGE_COLORS[s.stage] ?? "#a09a92",
        };
      });
  }, [students, xConfig.key, yConfig.key]);

  const regression = useMemo(() => getRegression(data), [data]);

  const axisSelectors = (
    <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
      <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>X:</span>
      <select value={xMetric} onChange={(e) => setXMetric(e.target.value as Metric)} style={selectStyle}>
        {(Object.keys(METRIC_CONFIG) as Metric[]).map((m) => (
          <option key={m} value={m}>{METRIC_CONFIG[m].label}</option>
        ))}
      </select>
      <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>Y:</span>
      <select value={yMetric} onChange={(e) => setYMetric(e.target.value as Metric)} style={selectStyle}>
        {(Object.keys(METRIC_CONFIG) as Metric[]).map((m) => (
          <option key={m} value={m}>{METRIC_CONFIG[m].label}</option>
        ))}
      </select>
    </div>
  );

  const legend = (
    <div className="flex flex-wrap items-center" style={{ gap: "6px 12px" }}>
      {Object.entries(STAGE_LABELS).map(([key, label]) => (
        <span
          key={key}
          className="flex items-center gap-1.5"
          style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}
        >
          <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: STAGE_COLORS[key] }} />
          {label}
        </span>
      ))}
    </div>
  );

  return (
    <Panel
      title="Score Distribution"
      dotColor="var(--color-stage-new)"
      headerRight={axisSelectors}
      footer={legend}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
              No students have both {xConfig.label} and {yConfig.label}
            </span>
          </div>
        ) : (
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="x" type="number" name={xConfig.label} domain={xConfig.domain} tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <YAxis dataKey="y" type="number" name={yConfig.label} domain={yConfig.domain} tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name) => [
                  name === "x" ? xConfig.format(Number(value)) : yConfig.format(Number(value)),
                  name === "x" ? xConfig.label : yConfig.label,
                ]}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload as { name: string } | undefined;
                  return item?.name ?? "";
                }}
                cursor={{ strokeDasharray: "3 3", stroke: "#c4c1b9" }}
              />
              <Customized component={(props: Record<string, unknown>) => <TrendLine {...props} regression={regression} />} />
              <Scatter data={data} dataKey="y">
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} r={6} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}
