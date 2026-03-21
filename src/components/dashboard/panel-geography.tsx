"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { Panel } from "@/components/ui/panel";
import { getStudentsWithLatestState } from "@/lib/data/mock";

type View = "Countries" | "Budget" | "Setting";

const BAR_COLORS: Record<View, string> = {
  Countries: "#6366f1",
  Budget: "#10b981",
  Setting: "#f59e0b",
};

const AXIS_TICK = { fontSize: 12, fill: "#8a857e", fontFamily: "var(--font-mono)" };
const AXIS_LABEL_TICK = { fontSize: 12, fill: "#6b6560", fontFamily: "var(--font-sans)" };
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

export function PanelGeography() {
  const [view, setView] = useState<View>("Countries");
  const students = useMemo(() => getStudentsWithLatestState(), []);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      s.latest_state?.preferred_countries?.forEach((c) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [students]);

  const budgetData = useMemo(() => {
    const buckets = [
      { name: "<$40k", min: 0, max: 40000, count: 0 },
      { name: "$40–55k", min: 40000, max: 55000, count: 0 },
      { name: "$55–70k", min: 55000, max: 70000, count: 0 },
      { name: "$70k+", min: 70000, max: Infinity, count: 0 },
    ];
    students.forEach((s) => {
      const budget = s.latest_state?.budget_usd;
      if (budget) {
        const bucket = buckets.find((b) => budget >= b.min && budget < b.max);
        if (bucket) bucket.count++;
      }
    });
    return buckets;
  }, [students]);

  const settingData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const setting = s.latest_state?.preferred_setting;
      if (setting) {
        const label = setting.charAt(0).toUpperCase() + setting.slice(1);
        counts[label] = (counts[label] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  const chartData = view === "Countries" ? countryData : view === "Budget" ? budgetData : settingData;
  const barColor = BAR_COLORS[view];

  const footerText = useMemo(() => {
    if (view === "Countries") return `${countryData.length} countries targeted`;
    if (view === "Budget") return `${students.filter((s) => s.latest_state?.budget_usd).length} with budget set`;
    return `${settingData.reduce((a, b) => a + b.count, 0)} with preference`;
  }, [view, countryData, students, settingData]);

  const maxLabelWidth = useMemo(() => {
    const maxLen = Math.max(...chartData.map((d) => d.name.length), 0);
    return Math.max(60, Math.min(maxLen * 8, 100));
  }, [chartData]);

  return (
    <Panel
      title="Student Preferences"
      dotColor="var(--color-stage-decided)"
      headerRight={
        <div className="flex items-center" style={{ gap: "2px" }}>
          {(["Countries", "Budget", "Setting"] as View[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className="px-2 py-0.5 cursor-pointer transition-colors border-b-2"
              style={{
                fontSize: 12,
                fontFamily: "var(--font-sans)",
                fontWeight: view === tab ? 600 : 400,
                color: view === tab ? "var(--color-text-primary)" : "var(--color-text-muted)",
                borderBottomColor: view === tab ? "var(--color-accent)" : "transparent",
                background: "transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      }
      footer={
        <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {footerText}
        </span>
      }
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
              No data available
            </span>
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 32, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#ece9e1" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={{ stroke: "#c4c1b9" }} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={AXIS_LABEL_TICK} axisLine={{ stroke: "#c4c1b9" }} tickLine={false} width={maxLabelWidth} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.03)" }} formatter={(value) => [`${value} students`]} />
              <Bar dataKey="count" fill={barColor} radius={[0, 4, 4, 0]} maxBarSize={16}>
                <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#8a857e" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}
