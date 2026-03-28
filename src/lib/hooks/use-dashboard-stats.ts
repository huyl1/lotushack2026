"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";
import type { DashboardStats } from "@/components/dashboard/dashboard.types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetchJSON<DashboardStats>("/api/dashboard/stats"),
  });
}
