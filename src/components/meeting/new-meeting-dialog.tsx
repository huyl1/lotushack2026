"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { MEETING_LANGUAGES } from "@/lib/meeting/languages";

export function NewMeetingDialog({ canCreate = true }: { canCreate?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("english");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/meeting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          language,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to create meeting");
        return;
      }
      if (data.id) {
        setOpen(false);
        setTitle("");
        router.push(`/meetings/${data.id}`);
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  if (!canCreate) {
    return (
      <Link
        href="/login"
        className="rounded-lg px-4 py-2 text-sm font-medium text-white"
        style={{ background: "var(--color-accent)" }}
      >
        Sign in to create
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white"
        style={{ background: "var(--color-accent)" }}
      >
        New meeting
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            >
              <div
                className="w-full max-w-md rounded-xl border p-6 shadow-lg"
                style={{
                  background: "var(--color-bg-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h2 className="text-lg font-semibold">Create meeting</h2>
                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                  <label className="flex flex-col gap-1 text-sm">
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Title
                    </span>
                    <input
                      className="rounded-lg border px-3 py-2"
                      style={{ borderColor: "var(--color-border)" }}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Counseling session"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Transcription language
                    </span>
                    <select
                      className="rounded-lg border px-3 py-2"
                      style={{ borderColor: "var(--color-border)" }}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {MEETING_LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {error ? (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  ) : null}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="rounded-lg border px-4 py-2 text-sm"
                      style={{ borderColor: "var(--color-border)" }}
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      style={{ background: "var(--color-accent)" }}
                    >
                      {pending ? "Creating…" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
