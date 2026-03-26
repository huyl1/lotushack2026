import { NewMeetingDialog } from "@/components/meeting/new-meeting-dialog";
import { createClient } from "@/lib/supabase/server";
import type { Meeting } from "@/lib/supabase/types";
import Link from "next/link";

export default async function MeetingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (meetings ?? []) as unknown as Meeting[];

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
        <NewMeetingDialog canCreate={Boolean(user)} />
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
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {user
                    ? "No meetings yet. Create one to get a guest link."
                    : "No meetings shown. Sign in to create and list your sessions."}
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
