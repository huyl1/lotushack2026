"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";
import type { SnapshotInput } from "@/lib/supabase/types";

export function useAddSnapshot(studentId: string) {
  return useMutation({
    mutationFn: (data: SnapshotInput) =>
      fetchJSON<{ ok: true }>(`/api/students/${studentId}/snapshots`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
