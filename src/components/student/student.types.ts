import type { Recommendation, StudentDetail, StudentState } from "@/lib/supabase/types";

export type MatchingStatus = "idle" | "running" | "done" | "error";

export interface StudentHeaderProps {
  student: StudentDetail;
}

export type FilterKey = "all" | Recommendation["match_category"];

export interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  studentId: string;
  basedOnState?: StudentState | null;
  tierCounts?: Record<string, number>;
  statesWithRecs?: {
    id: string;
    created_at: string;
    sat_score: number | null;
    gpa: number | null;
  }[];
  onStateChange?: (stateId: string) => void;
}
