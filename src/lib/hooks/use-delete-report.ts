"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";

export function useDeleteReport(studentId: string) {
  return useMutation({
    mutationFn: (stateId: string) =>
      fetchJSON<{ ok: true }>(
        `/api/students/${studentId}/reports/${stateId}`,
        { method: "DELETE" },
      ),
  });
}
