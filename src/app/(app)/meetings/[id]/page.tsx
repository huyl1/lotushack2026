"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useValseaTranscription } from "@/lib/hooks/use-valsea-transcription";
import { useWebRTC } from "@/lib/hooks/use-webrtc";
import { createClient } from "@/lib/supabase/client";
import type {
  Meeting,
  MeetingSentiment,
  MeetingUtterance,
} from "@/lib/supabase/types";
import { setLocalMicMuted } from "@/lib/utils/meeting-media";

const SENTIMENT_BATCH = 3;

export default function HostMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  const supabase = useMemo(() => createClient(), []);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [utterances, setUtterances] = useState<MeetingUtterance[]>([]);
  const [sentiments, setSentiments] = useState<MeetingSentiment[]>([]);
  const [hostLabel, setHostLabel] = useState("Host");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const guestBatchRef = useRef<string[]>([]);
  const guestTsRef = useRef<number[]>([]);

  const onFinalHost = useCallback(
    async (text: string, rawText: string | null, timestampMs: number) => {
      const { error } = await supabase.from("meeting_utterances").insert({
        meeting_id: meetingId,
        role: "host",
        speaker: hostLabel,
        text,
        raw_text: rawText,
        timestamp_ms: timestampMs,
      });
      if (error) console.error(error);
    },
    [hostLabel, meetingId, supabase],
  );

  const transcription = useValseaTranscription({
    language: meeting?.language ?? "english",
    onFinal: onFinalHost,
    onPartial: () => {},
  });

  const webrtc = useWebRTC({
    supabase,
    meetingId,
    isHost: true,
    localStream,
    displayName: hostLabel,
    enabled: Boolean(localStream),
  });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && webrtc.remoteStream) {
      remoteVideoRef.current.srcObject = webrtc.remoteStream;
    }
  }, [webrtc.remoteStream]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user?.email) setHostLabel(u.user.email.split("@")[0] ?? "Host");
    })();

    void (async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setLoadError(error?.message ?? "Meeting not found");
        return;
      }
      setMeeting(data as Meeting);

      const { data: urows } = await supabase
        .from("meeting_utterances")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });
      if (urows) setUtterances(urows as MeetingUtterance[]);

      const { data: srows } = await supabase
        .from("meeting_sentiments")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });
      if (srows) setSentiments(srows as MeetingSentiment[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [meetingId, supabase]);

  useEffect(() => {
    const ch = supabase
      .channel(`meeting-host:${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_utterances",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          const row = payload.new as MeetingUtterance;
          setUtterances((prev) => [...prev, row]);
          if (row.role === "guest") {
            guestBatchRef.current.push(row.text);
            guestTsRef.current.push(row.timestamp_ms);
            if (guestBatchRef.current.length >= SENTIMENT_BATCH) {
              const transcript = guestBatchRef.current.join("\n");
              const w0 = guestTsRef.current[0]!;
              const w1 = guestTsRef.current[guestTsRef.current.length - 1]!;
              guestBatchRef.current = [];
              guestTsRef.current = [];
              void fetch(`/api/meeting/${meetingId}/sentiment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  transcript,
                  window_start_ms: w0,
                  window_end_ms: w1,
                }),
              }).catch(console.error);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_sentiments",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          const row = payload.new as MeetingSentiment;
          setSentiments((prev) => [...prev, row]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "meetings",
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          setMeeting(payload.new as Meeting);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [meetingId, supabase]);

  async function startSession() {
    setSessionError(null);
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      setLocalStream(stream);
      setMicMuted(false);

      const { data: updated, error } = await supabase
        .from("meetings")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
          host_name: hostLabel,
        })
        .eq("id", meetingId)
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      if (updated) setMeeting(updated as Meeting);

      await transcription.start(stream);
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : "Could not start session");
    } finally {
      setStarting(false);
    }
  }

  const toggleMic = useCallback(() => {
    if (!localStream) return;
    setMicMuted((m) => {
      const next = !m;
      setLocalMicMuted(localStream, next);
      return next;
    });
  }, [localStream]);

  async function endSession() {
    transcription.disconnect();
    localStream?.getTracks().forEach((t) => t.stop());
    setMicMuted(false);
    setLocalStream(null);
    await fetch(`/api/meeting/${meetingId}/end`, { method: "POST" });
    router.refresh();
  }

  const latestSentiment = sentiments[sentiments.length - 1];
  const chartData = sentiments.map((s, i) => ({
    i,
    t: s.window_end_ms ?? i,
    c: s.confidence,
    sentiment: s.sentiment,
  }));

  if (loadError) {
    return (
      <div className="p-8 text-center text-red-600">
        {loadError}
        <div className="mt-4">
          <Link href="/meetings" className="underline">
            Back to meetings
          </Link>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>
        Loading…
      </div>
    );
  }

  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/meeting/${meetingId}`
      : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/meetings"
            className="text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Meetings
          </Link>
          <h1
            className="mt-2 text-xl font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {meeting.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Status: {meeting.status}
            {webrtc.peerName ? ` · Guest: ${webrtc.peerName}` : ""}
          </p>
          <p className="mt-2 break-all text-xs" style={{ color: "var(--color-text-muted)" }}>
            Guest link: {base}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!localStream ? (
            <button
              type="button"
              disabled={meeting.status === "ended" || starting}
              onClick={() => void startSession()}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--color-accent)" }}
            >
              {starting ? "Starting…" : "Start session"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleMic}
                className="rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: "var(--color-border)" }}
              >
                {micMuted ? "Unmute mic" : "Mute mic"}
              </button>
              <button
                type="button"
                onClick={() => void endSession()}
                className="rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: "var(--color-border)" }}
              >
                End session
              </button>
            </>
          )}
          <Link
            href={`/meetings/${meetingId}/sentiment`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border px-4 py-2 text-sm"
            style={{ borderColor: "var(--color-border)" }}
          >
            Sentiment tab
          </Link>
        </div>
      </div>

      {(sessionError || transcription.error || webrtc.error) && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {sessionError || transcription.error || webrtc.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div
              className="relative aspect-video overflow-hidden rounded-lg bg-black"
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                Guest
              </span>
            </div>
            <div
              className="relative aspect-video overflow-hidden rounded-lg bg-black"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                You{micMuted ? " · Mic off" : ""}
              </span>
            </div>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h3 className="text-sm font-medium">Guest sentiment (VALSEA)</h3>
            {latestSentiment ? (
              <>
                <p className="mt-2 text-lg capitalize">
                  {latestSentiment.sentiment}{" "}
                  <span className="text-sm opacity-70">
                    ({latestSentiment.confidence.toFixed(2)})
                  </span>
                </p>
                {latestSentiment.emotions &&
                latestSentiment.emotions.length > 0 ? (
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {latestSentiment.emotions.join(", ")}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Waiting for enough guest speech (batches of {SENTIMENT_BATCH}{" "}
                segments)…
              </p>
            )}
            {chartData.length > 0 ? (
              <div className="mt-4 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="i" hide />
                    <YAxis domain={[0, 1]} width={32} />
                    <Tooltip />
                    <Line type="monotone" dataKey="c" stroke="#10b981" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </div>

        <div
          className="flex max-h-[70vh] flex-col rounded-lg border"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="border-b px-4 py-2 text-sm font-medium"
            style={{ borderColor: "var(--color-border)" }}
          >
            Live transcript
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {utterances.map((u) => (
              <div key={u.id}>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {u.role === "host" ? "You" : u.speaker ?? "Guest"}:
                </span>{" "}
                {u.text}
              </div>
            ))}
            {transcription.partialText ? (
              <div style={{ color: "var(--color-text-muted)" }}>
                You (partial): {transcription.partialText}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
