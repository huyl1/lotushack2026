"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Panel } from "@/components/ui/panel";
import type { StudentState } from "@/lib/supabase/types";

interface ScoreTimelineProps {
  states: StudentState[];
}

type Metric = "SAT" | "GPA";

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

export function ScoreTimeline({ states }: ScoreTimelineProps) {
  const [metric, setMetric] = useState<Metric>("SAT");

  const data = useMemo(() => {
    return states.map((s) => ({
      date: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      SAT: s.sat_score,
      GPA: s.gpa,
      ACT: s.act_score,
      IELTS: s.ielts_score,
    }));
  }, [states]);

  const hasData = data.some((d) => d[metric] != null);

  return (
    <Panel
      title="Score History"
      dotColor="var(--color-stage-building)"
      tabs={["SAT", "GPA"]}
      activeTab={metric}
      onTabChange={(t) => setMetric(t as Metric)}
      footer={
        <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {states.length} {states.length === 1 ? "snapshot" : "snapshots"}
        </span>
      }
    >
      {states.length === 0 || !hasData ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-body-sm" style={{ color: "var(--color-text-muted)" }}>
            No {metric} data to display
          </span>
        </div>
      ) : (
        <div style={{ width: "100%", flex: 1, minHeight: 0 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
              <CartesianGrid stroke="#ece9e1" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#8a857e", fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "#c4c1b9" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#8a857e", fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "#c4c1b9" }}
                tickLine={false}
                domain={metric === "GPA" ? [0, 4.0] : ["auto", "auto"]}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey={metric}
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
