"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";

export function useRunMatching() {
  return useMutation({
    mutationFn: (studentId: string) =>
      fetchJSON<{ studentStateId: string }>("/api/recommendations/run", {
        method: "POST",
        body: JSON.stringify({ studentId }),
      }),
  });
}
