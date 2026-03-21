"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Panel } from "@/components/ui/panel";
import type { StudentState } from "@/lib/supabase/types";

interface ScoreTimelineProps {
  states: StudentState[];
}

type View = "chart" | "snapshots";
type Metric = "All" | "SAT" | "ACT" | "GPA" | "IELTS";

const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e0d9",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  color: "#1a1a1a",
  padding: "6px 10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

function DiffIndicator({ prev, curr }: { prev: number | null; curr: number | null }) {
  if (prev == null || curr == null) return <span style={{ color: "var(--color-text-muted)" }}>—</span>;
  const diff = Number(curr) - Number(prev);
  if (diff === 0) return <span style={{ color: "var(--color-text-muted)" }}>—</span>;
  const isUp = diff > 0;
  return (
    <span style={{ fontSize: 14, fontWeight: 600, color: isUp ? "var(--color-stage-matched)" : "var(--color-destructive)" }}>
      {isUp ? "▲" : "▼"} {Math.abs(diff) % 1 !== 0 ? Math.abs(diff).toFixed(1) : Math.abs(diff)}
    </span>
  );
}

export function ScoreTimeline({ states }: ScoreTimelineProps) {
  const [view, setView] = useState<View>("chart");
  const [metric, setMetric] = useState<Metric>("All");

  const chartData = useMemo(() => {
    return states.map((s) => ({
      date: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      SAT: s.sat_score,
      ACT: s.act_score,
      GPA: s.gpa ? Number(s.gpa) : null,
      IELTS: s.ielts_score ? Number(s.ielts_score) : null,
    }));
  }, [states]);

  const yDomain: Record<string, [number | string, number | string]> = {
    SAT: ["auto", "auto"],
    ACT: [15, 36],
    GPA: [0, 4.0],
    IELTS: [4.0, 9.0],
  };

  const LINES: { key: "SAT" | "ACT" | "GPA" | "IELTS"; color: string }[] = [
    { key: "SAT", color: "#6366f1" },
    { key: "ACT", color: "#f59e0b" },
    { key: "GPA", color: "#10b981" },
    { key: "IELTS", color: "#8b5cf6" },
  ];

  const hasChartData = metric === "All"
    ? chartData.some((d) => d.SAT != null || d.ACT != null || d.GPA != null || d.IELTS != null)
    : chartData.some((d) => d[metric] != null);

  return (
    <Panel
      title="Score Progression"
      dotColor="var(--color-stage-building)"
      tabs={view === "chart" ? ["Chart", "Snapshots", "—", "All", "SAT", "ACT", "GPA", "IELTS"] : ["Chart", "Snapshots"]}
      activeTab={view === "chart" ? metric : "Snapshots"}
      onTabChange={(t) => {
        if (t === "Chart") { setView("chart"); return; }
        if (t === "Snapshots") { setView("snapshots"); return; }
        if (t === "—") return;
        setMetric(t as Metric); setView("chart");
      }}
      footer={
        <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {states.length} {states.length === 1 ? "snapshot" : "snapshots"} recorded
        </span>
      }
    >
      {view === "chart" ? (
        states.length === 0 || !hasChartData ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>
              No {metric} data to display
            </span>
          </div>
        ) : (
          <div style={{ width: "100%", flex: 1, minHeight: 0 }}>
            <ResponsiveContainer>
              {metric === "All" ? (
                <LineChart data={chartData} margin={{ top: 8, right: 32, bottom: 8, left: -8 }}>
                  <CartesianGrid stroke="#ece9e1" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 14, fill: "#8a857e", fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "#c4c1b9" }}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  {LINES.map(({ key, color }) => (
                    chartData.some((d) => d[key] != null) && (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                        connectNulls
                        yAxisId={key}
                      />
                    )
                  ))}
                  {/* Separate Y axes (hidden) so different scales don't conflict */}
                  <YAxis yAxisId="SAT" hide domain={["auto", "auto"]} />
                  <YAxis yAxisId="ACT" hide domain={[15, 36]} />
                  <YAxis yAxisId="GPA" hide domain={[0, 4.0]} />
                  <YAxis yAxisId="IELTS" hide domain={[4.0, 9.0]} />
                </LineChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 8, right: 32, bottom: 8, left: -8 }}>
                  <CartesianGrid stroke="#ece9e1" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 14, fill: "#8a857e", fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "#c4c1b9" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 14, fill: "#8a857e", fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "#c4c1b9" }}
                    tickLine={false}
                    domain={yDomain[metric]}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke={LINES.find((l) => l.key === metric)?.color ?? "#6366f1"}
                    strokeWidth={2}
                    dot={{ fill: LINES.find((l) => l.key === metric)?.color ?? "#6366f1", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                    connectNulls
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )
      ) : (
        /* Snapshots table */
        states.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>No snapshots yet</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {/* Header */}
            <div
              className="grid items-center px-3 py-2"
              style={{
                gridTemplateColumns: "1fr 0.6fr 0.4fr 0.6fr 0.4fr 0.6fr 0.4fr 0.6fr 0.4fr",
                gap: 4,
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-bg-wash)",
              }}
            >
              {["Date", "SAT", "", "ACT", "", "GPA", "", "IELTS", ""].map((col, i) => (
                <span key={i} style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  {col}
                </span>
              ))}
            </div>
            {/* Rows */}
            {states.map((s, idx) => {
              const prev = idx > 0 ? states[idx - 1] : null;
              return (
                <div
                  key={s.id}
                  className="grid items-center px-3 py-2"
                  style={{
                    gridTemplateColumns: "1fr 0.6fr 0.4fr 0.6fr 0.4fr 0.6fr 0.4fr 0.6fr 0.4fr",
                    gap: 4,
                    borderBottom: idx < states.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                  }}
                >
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                  </span>
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 500, color: s.sat_score ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
                    {s.sat_score ?? "—"}
                  </span>
                  <DiffIndicator prev={prev?.sat_score ?? null} curr={s.sat_score} />
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 500, color: s.act_score ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
                    {s.act_score ?? "—"}
                  </span>
                  <DiffIndicator prev={prev?.act_score ?? null} curr={s.act_score} />
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 500, color: s.gpa ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
                    {s.gpa != null ? Number(s.gpa).toFixed(2) : "—"}
                  </span>
                  <DiffIndicator prev={prev?.gpa ? Number(prev.gpa) : null} curr={s.gpa ? Number(s.gpa) : null} />
                  <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 500, color: s.ielts_score ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
                    {s.ielts_score != null ? Number(s.ielts_score).toFixed(1) : "—"}
                  </span>
                  <DiffIndicator prev={prev?.ielts_score ? Number(prev.ielts_score) : null} curr={s.ielts_score ? Number(s.ielts_score) : null} />
                </div>
              );
            })}
          </div>
        )
      )}
    </Panel>
  );
}
