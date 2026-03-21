"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Panel } from "@/components/ui/panel";
import type { StudentStage } from "@/lib/supabase/types";

interface PanelStagePipelineProps {
  stageCounts: Record<string, number>;
  total: number;
}

const STAGES: { key: StudentStage; label: string; color: string }[] = [
  { key: "new", label: "New", color: "#6366f1" },
  { key: "profile_building", label: "Building", color: "#f59e0b" },
  { key: "matched", label: "Matched", color: "#10b981" },
  { key: "presented", label: "Presented", color: "#8b5cf6" },
  { key: "decided", label: "Decided", color: "#06b6d4" },
];

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderLabel(props: any) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const value = Number(props.value ?? 0);

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#6b6560"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontFamily="var(--font-mono)"
      fontWeight={500}
    >
      {value}
    </text>
  );
}

export function PanelStagePipeline({ stageCounts, total }: PanelStagePipelineProps) {

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
      <div className="relative" style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              dataKey="value"
              strokeWidth={2}
              stroke="#ffffff"
              label={renderLabel}
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
        </ResponsiveContainer>
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
