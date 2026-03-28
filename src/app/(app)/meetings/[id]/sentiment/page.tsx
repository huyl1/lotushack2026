"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMeetingDetail } from "@/lib/hooks/use-meeting-detail";
import type {
  MeetingSentiment,
  MeetingUtterance,
} from "@/lib/supabase/types";
import { SENTIMENT_COLOR } from "./constants";

// Dynamic import — recharts ~200KB, only loaded when chart data exists
const SentimentLineChart = dynamic(
  () => import("./sentiment-charts").then((m) => ({ default: m.SentimentLineChart })),
  { ssr: false }
);
const SentimentBarChart = dynamic(
  () => import("./sentiment-charts").then((m) => ({ default: m.SentimentBarChart })),
  { ssr: false }
);

export default function MeetingSentimentDashboardPage() {
  const params = useParams();
  const meetingId = params.id as string;
  const supabase = useMemo(() => createClient(), []);

  // Cached via TanStack Query — shared cache with the host meeting page
  const { utterances, sentiments, appendUtterance, appendSentiment } = useMeetingDetail(meetingId);

  // Realtime subscriptions push into TanStack Query cache
  useEffect(() => {
    const ch = supabase
      .channel(`sentiment-dash:${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_sentiments",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          appendSentiment(payload.new as MeetingSentiment);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_utterances",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          appendUtterance(payload.new as MeetingUtterance);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [meetingId, supabase, appendSentiment, appendUtterance]);

  const dist = sentiments.reduce(
    (acc, s) => {
      acc[s.sentiment] = (acc[s.sentiment] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const distRows = ["positive", "neutral", "negative"].map((k) => ({
    name: k,
    count: dist[k] ?? 0,
    fill: SENTIMENT_COLOR[k] ?? "#888",
  }));

  const lineData = sentiments.map((s, i) => ({
    i,
    c: s.confidence,
    sentiment: s.sentiment,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href={`/meetings/${meetingId}`}
        className="text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        ← Host room
      </Link>
      <h1
        className="mt-4 text-2xl font-semibold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Guest sentiment (live)
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        VALSEA sentiment on batched guest transcript. Updates as new rows arrive.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-sm font-medium">Confidence over time</h2>
          <SentimentLineChart lineData={lineData} />
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-sm font-medium">Distribution</h2>
          <SentimentBarChart distRows={distRows} hasData={sentiments.length > 0} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-sm font-medium">Reasoning (latest)</h2>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {sentiments
              .slice()
              .reverse()
              .map((s) => (
                <li key={s.id} className="border-b border-[var(--color-border)] pb-2">
                  <span className="capitalize text-emerald-600">
                    {s.sentiment}
                  </span>{" "}
                  ({s.confidence.toFixed(2)})
                  {s.reasoning ? (
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {s.reasoning}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-sm font-medium">Transcript (compact)</h2>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {utterances.map((u) => (
              <div key={u.id}>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {u.role === "host" ? "Host" : "Guest"}:
                </span>{" "}
                {u.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
