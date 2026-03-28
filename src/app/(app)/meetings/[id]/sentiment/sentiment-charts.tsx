"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]!.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export function SentimentLineChart({ lineData }: { lineData: { i: number; c: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useContainerSize(ref);
  return (
    <div ref={ref} className="mt-4 h-56">
      {lineData.length > 0 && size ? (
        <LineChart data={lineData} width={size.w} height={size.h}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="i" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Line type="monotone" dataKey="c" stroke="#10b981" dot={{ r: 4 }} />
        </LineChart>
      ) : lineData.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No sentiment samples yet.</p>
      ) : null}
    </div>
  );
}

export function SentimentBarChart({ distRows, hasData }: { distRows: { name: string; count: number; fill: string }[]; hasData: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useContainerSize(ref);
  return (
    <div ref={ref} className="mt-4 h-56">
      {hasData && size ? (
        <BarChart data={distRows} width={size.w} height={size.h}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="count">
            {distRows.map((row) => (
              <Cell key={row.name} fill={row.fill} />
            ))}
          </Bar>
        </BarChart>
      ) : !hasData ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No data.</p>
      ) : null}
    </div>
  );
}
