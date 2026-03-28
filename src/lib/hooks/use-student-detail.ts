"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";
import type { StudentDetail } from "@/lib/supabase/types";

export function useStudentDetail(studentId: string) {
  return useQuery({
    queryKey: ["students", studentId],
    queryFn: () => fetchJSON<StudentDetail>(`/api/students/${studentId}`),
    enabled: !!studentId,
  });
}
