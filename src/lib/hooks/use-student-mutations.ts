"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateStudentInput, SnapshotInput } from "@/lib/supabase/types";

async function fetchJSON<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const data: T & { error?: string } = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

export function useCreateStudent() {
  return useMutation({
    mutationFn: (data: CreateStudentInput) =>
      fetchJSON<{ id: string }>("/api/students", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useAddSnapshot(studentId: string) {
  return useMutation({
    mutationFn: (data: SnapshotInput) =>
      fetchJSON<{ ok: true }>(`/api/students/${studentId}/snapshots`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useDeleteStudent() {
  return useMutation({
    mutationFn: (studentId: string) =>
      fetchJSON<{ ok: true }>(`/api/students/${studentId}`, {
        method: "DELETE",
      }),
  });
}

export function useDeleteReport(studentId: string) {
  return useMutation({
    mutationFn: (stateId: string) =>
      fetchJSON<{ ok: true }>(
        `/api/students/${studentId}/reports/${stateId}`,
        { method: "DELETE" },
      ),
  });
}

export function useRunMatching() {
  return useMutation({
    mutationFn: (studentId: string) =>
      fetchJSON<{ studentStateId: string }>("/api/recommendations/run", {
        method: "POST",
        body: JSON.stringify({ studentId }),
      }),
  });
}
