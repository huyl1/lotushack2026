"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";
import type { Student, StudentState, Recommendation, Tier } from "@/lib/supabase/types";

interface ReportResponse {
  student: Student;
  state: StudentState;
  recommendations: Recommendation[];
  grouped: Record<Tier, Recommendation[]>;
  tierCounts: Record<string, number>;
}

export function useRecommendations(studentId: string, stateId: string, tier?: string) {
  const search = new URLSearchParams();
  if (tier && tier !== "all") search.set("tier", tier);
  const qs = search.toString();

  return useQuery({
    queryKey: ["students", studentId, "reports", stateId, tier ?? "all"],
    queryFn: () =>
      fetchJSON<ReportResponse>(
        `/api/students/${studentId}/reports/${stateId}${qs ? `?${qs}` : ""}`
      ),
    enabled: !!studentId && !!stateId,
  });
}
