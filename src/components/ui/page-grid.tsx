"use client";

import { type ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { ReactGridLayout } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isResizable?: boolean;
  static?: boolean;
}

interface PageGridProps {
  storageKey: string;
  defaultLayout: LayoutItem[];
  widgets: Record<string, ReactNode>;
  isResizable?: boolean;
}

function mergeLayouts(
  stored: LayoutItem[] | null,
  defaults: LayoutItem[]
): LayoutItem[] {
  if (!stored) return defaults;

  const storedMap = new Map(stored.map((item) => [item.i, item]));

  const merged: LayoutItem[] = [];
  for (const def of defaults) {
    const saved = storedMap.get(def.i);
    merged.push(saved ? { ...def, ...saved } : def);
  }

  return merged;
}

function loadLayout(
  storageKey: string,
  defaultLayout: LayoutItem[]
): LayoutItem[] {
  if (typeof window === "undefined") return defaultLayout;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return mergeLayouts(JSON.parse(stored), defaultLayout);
    }
  } catch {
    // ignore
  }
  return defaultLayout;
}

export function PageGrid({
  storageKey,
  defaultLayout,
  widgets,
  isResizable = true,
}: PageGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1280); // Default to reasonable width

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Measure immediately on mount
    const w = el.offsetWidth;
    if (w > 0) setWidth(w);

    // Watch for resize changes
    const ro = new ResizeObserver((entries) => {
      const newW = entries[0]?.contentRect.width;
      if (newW && newW > 0) setWidth(newW);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [layout] = useState<LayoutItem[]>(() =>
    loadLayout(storageKey, defaultLayout)
  );

  const saveLayout = useCallback(
    (newLayout: LayoutItem[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newLayout));
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  return (
    <div ref={containerRef}>
      <ReactGridLayout
        width={width}
        layout={layout}
        cols={12}
        rowHeight={32}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={false}
        isResizable={isResizable}
        onDragStop={(_layout: readonly LayoutItem[]) =>
          saveLayout([..._layout])
        }
        onResizeStop={(_layout: readonly LayoutItem[]) =>
          saveLayout([..._layout])
        }
      >
        {layout.map((item) => (
          <div key={item.i}>{widgets[item.i] ?? null}</div>
        ))}
      </ReactGridLayout>
    </div>
  );
}
