"use client";

import { type ReactNode, useRef, useState, useEffect, useCallback } from "react";

interface TabGroup {
  tabs: string[];
  active: string;
  onChange?: (tab: string) => void;
}

interface PanelProps {
  title?: string;
  dotColor?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabGroups?: TabGroup[];
  headerRight?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  children?: ReactNode;
}

export function Panel({
  title,
  dotColor,
  tabs,
  activeTab,
  onTabChange,
  tabGroups,
  headerRight,
  footer,
  className = "",
  contentClassName = "",
  noPadding = false,
  children,
}: PanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(false);
  const [scrollBottom, setScrollBottom] = useState(false);

  const checkScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop > 0);
    setScrollBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const hasHeader = title || tabs || tabGroups || headerRight;

  return (
    <div
      className={`flex flex-col h-full overflow-hidden ${className}`}
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {/* Header — drag handle */}
      {hasHeader && (
        <div
          className="panel-header flex items-center shrink-0 select-none"
          style={{
            padding: "var(--space-sm) var(--space-md)",
            gap: "var(--space-sm)",
            borderBottom: `1px solid ${scrollTop ? "var(--color-hover-border)" : "var(--color-border-subtle)"}`,
            cursor: "grab",
            transition: "border-color var(--duration-default) ease",
          }}
        >
          {title && (
            <>
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: dotColor || "var(--color-tier-match)",
                }}
              />
              <span className="text-caption" style={{ color: "var(--color-text-secondary)" }}>
                {title}
              </span>
            </>
          )}

          {/* Simple tabs */}
          {tabs && (
            <div className="flex items-center gap-1 ml-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange?.(tab)}
                  className="px-1.5 py-0.5 text-caption cursor-pointer transition-colors border-b-2"
                  style={{
                    color:
                      activeTab === tab
                        ? "var(--color-text-primary)"
                        : "var(--color-text-muted)",
                    borderBottomColor:
                      activeTab === tab
                        ? "var(--color-accent)"
                        : "transparent",
                    background: "transparent",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Tab groups with separators */}
          {tabGroups && (
            <div className="flex items-center gap-1 ml-auto">
              {tabGroups.map((group, gi) => (
                <span key={gi} className="flex items-center gap-1">
                  {gi > 0 && (
                    <span
                      className="mx-1"
                      style={{
                        width: 1,
                        height: 14,
                        background: "var(--color-border)",
                      }}
                    />
                  )}
                  {group.tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => group.onChange?.(tab)}
                      className="px-1.5 py-0.5 text-caption cursor-pointer transition-colors border-b-2"
                      style={{
                        color:
                          group.active === tab
                            ? "var(--color-text-primary)"
                            : "var(--color-text-muted)",
                        borderBottomColor:
                          group.active === tab
                            ? "var(--color-accent)"
                            : "transparent",
                        background: "transparent",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </span>
              ))}
            </div>
          )}

          {headerRight && <div className="ml-auto">{headerRight}</div>}
        </div>
      )}

      {/* Content — cancel drag propagation */}
      <div
        ref={contentRef}
        className={`panel-content flex-1 min-h-0 flex flex-col overflow-y-auto ${contentClassName}`}
        style={{
          padding: noPadding ? 0 : "var(--space-md)",
          gap: "var(--space-sm)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          className="panel-footer shrink-0 flex items-center justify-between"
          style={{
            padding: "var(--space-sm) var(--space-md)",
            borderTop: `1px solid ${scrollBottom ? "var(--color-hover-border)" : "var(--color-border-subtle)"}`,
            color: "var(--color-text-muted)",
            transition: "border-color var(--duration-default) ease",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
