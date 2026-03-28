"use client";

import Link from "next/link";
import { NewMeetingDialog } from "@/components/meeting/new-meeting-dialog";
import { useMeetings } from "@/lib/hooks/use-meetings";

export default function MeetingsPage() {
  const { data: meetings, isPending } = useMeetings();
  const rows = meetings ?? [];

  return (
    <div
      className="mx-auto max-w-4xl px-6 py-8"
      style={{ color: "var(--color-text-primary)" }}
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Meetings
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Start a session and share the guest link. Live transcription uses
            VALSEA (run{" "}
            <code className="rounded bg-[var(--color-bg-muted)] px-1 py-0.5 text-xs">
              yarn demo:valsea-proxy
            </code>{" "}
            locally).
          </p>
        </div>
        <NewMeetingDialog canCreate />
      </div>

      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <table className="w-full text-left text-sm">
          <thead
            className="border-b text-xs uppercase"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-4 py-3"><div className="skeleton" style={{ width: "60%", height: 14 }} /></td>
                  <td className="px-4 py-3"><div className="skeleton" style={{ width: 60, height: 14 }} /></td>
                  <td className="px-4 py-3"><div className="skeleton" style={{ width: 120, height: 14 }} /></td>
                  <td className="px-4 py-3"><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  No meetings yet. Create one to get a guest link.
                </td>
              </tr>
            ) : (
              rows.map((m) => (
                <tr
                  key={m.id}
                  className="border-t"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3 capitalize">{m.status}</td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/meetings/${m.id}`}
                      className="text-sm font-medium underline-offset-2 hover:underline"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Open host room
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
