"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";
import type { StudentWithLatestState } from "@/lib/supabase/types";

interface StudentsResponse {
  students: StudentWithLatestState[];
  stageCounts: Record<string, number>;
}

export function useStudents(params?: { stage?: string; sort?: string }) {
  const search = new URLSearchParams();
  if (params?.stage) search.set("stage", params.stage);
  if (params?.sort) search.set("sort", params.sort);
  const qs = search.toString();

  return useQuery({
    queryKey: ["students", params?.stage ?? "all", params?.sort ?? "created_at:desc"],
    queryFn: () => fetchJSON<StudentsResponse>(`/api/students${qs ? `?${qs}` : ""}`),
  });
}
