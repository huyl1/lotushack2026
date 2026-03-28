import type { StudentStage, StudentWithLatestState } from "@/lib/supabase/types";

export interface DashboardStats {
  total: number;
  inProgress: number;
  needsAttention: number;
  readyToPresent: number;
  stageCounts: Record<string, number>;
}

export interface DashboardContentProps {
  students: StudentWithLatestState[];
  stats: DashboardStats;
}

export interface DashboardOverviewProps {
  stats: DashboardStats;
}

export interface DashboardStudentsProps {
  students: StudentWithLatestState[];
}

export interface PanelActionQueueProps {
  students: StudentWithLatestState[];
}

export interface PanelStagePipelineProps {
  stageCounts: Record<string, number>;
  total: number;
}

export interface ActionTab {
  key: StudentStage;
  label: string;
  action: string;
}

export interface StageEntry {
  key: StudentStage;
  label: string;
  color: string;
}
