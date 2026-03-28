"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";

export function useDeleteStudent() {
  return useMutation({
    mutationFn: (studentId: string) =>
      fetchJSON<{ ok: true }>(`/api/students/${studentId}`, {
        method: "DELETE",
      }),
  });
}
