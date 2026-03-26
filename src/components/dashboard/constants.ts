import type { ActionTab, StageEntry } from "./dashboard.types";

export const ACTION_TABS: ActionTab[] = [
  { key: "new", label: "New", action: "Start Profile" },
  { key: "profile_building", label: "Building", action: "Complete Profile" },
  { key: "matched", label: "Matched", action: "Present" },
  { key: "presented", label: "Presented", action: "Follow Up" },
];

export const STAGES: StageEntry[] = [
  { key: "new", label: "New", color: "#6366f1" },
  { key: "profile_building", label: "Building", color: "#f59e0b" },
  { key: "matched", label: "Matched", color: "#10b981" },
  { key: "presented", label: "Presented", color: "#8b5cf6" },
  { key: "decided", label: "Decided", color: "#06b6d4" },
];

export const STAGE_TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "profile_building", label: "Building" },
  { key: "matched", label: "Matched" },
  { key: "presented", label: "Presented" },
  { key: "decided", label: "Decided" },
] as const;

export const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e0d9",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  color: "#1a1a1a",
  padding: "6px 10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
} as const;
