"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";
import type { Meeting } from "@/lib/supabase/types";

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => fetchJSON<Meeting[]>("/api/meetings"),
  });
}
