"use client";

import { useEffect, useRef, useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

export function MeetingChart({ data }: { data: { i: number; c: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
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
  }, []);

  return (
    <div ref={ref} className="mt-4 h-32 w-full">
      {size && (
        <LineChart data={data} width={size.w} height={size.h}>
          <XAxis dataKey="i" hide />
          <YAxis domain={[0, 1]} width={32} />
          <Tooltip />
          <Line type="monotone" dataKey="c" stroke="#10b981" dot />
        </LineChart>
      )}
    </div>
  );
}
