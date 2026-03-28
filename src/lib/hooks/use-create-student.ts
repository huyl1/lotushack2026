"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJSON } from "./fetch-json";
import type { CreateStudentInput } from "@/lib/supabase/types";

export function useCreateStudent() {
  return useMutation({
    mutationFn: (data: CreateStudentInput) =>
      fetchJSON<{ id: string }>("/api/students", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
