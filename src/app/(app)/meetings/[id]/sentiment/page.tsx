"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import type {
  MeetingSentiment,
  MeetingUtterance,
} from "@/lib/supabase/types";

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "#10b981",
  neutral: "#a1a1aa",
  negative: "#ef4444",
};

export default function MeetingSentimentDashboardPage() {
  const params = useParams();
  const meetingId = params.id as string;
  const supabase = useMemo(() => createClient(), []);

  const [utterances, setUtterances] = useState<MeetingUtterance[]>([]);
  const [sentiments, setSentiments] = useState<MeetingSentiment[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: u } = await supabase
        .from("meeting_utterances")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });
      const { data: s } = await supabase
        .from("meeting_sentiments")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (u) setUtterances(u as MeetingUtterance[]);
      if (s) setSentiments(s as MeetingSentiment[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [meetingId, supabase]);

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
          setSentiments((prev) => [...prev, payload.new as MeetingSentiment]);
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
          setUtterances((prev) => [...prev, payload.new as MeetingUtterance]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [meetingId, supabase]);

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
          <div className="mt-4 h-56">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="i" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="c" stroke="#10b981" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No sentiment samples yet.
              </p>
            )}
          </div>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-sm font-medium">Distribution</h2>
          <div className="mt-4 h-56">
            {sentiments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={distRows}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="count">
                    {distRows.map((row) => (
                      <Cell key={row.name} fill={row.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No data.
              </p>
            )}
          </div>
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
