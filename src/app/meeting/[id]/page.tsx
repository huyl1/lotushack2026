"use client";

import { useValseaTranscription } from "@/lib/hooks/use-valsea-transcription";
import { useWebRTC } from "@/lib/hooks/use-webrtc";
import { createClient } from "@/lib/supabase/client";
import type { Meeting, MeetingUtterance } from "@/lib/supabase/types";
import { setLocalMicMuted } from "@/lib/utils/meeting-media";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Next.js can reuse this client component when only `[id]` changes, which leaves
 * joined/stream/name state from the previous meeting. Remount per meeting id.
 */
export default function GuestMeetingPage() {
  const params = useParams();
  const meetingId = params.id as string;
  return <GuestMeetingSession key={meetingId} meetingId={meetingId} />;
}

function GuestMeetingSession({ meetingId }: { meetingId: string }) {
  const supabase = useMemo(() => createClient(), []);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [utterances, setUtterances] = useState<MeetingUtterance[]>([]);
  const [guestName, setGuestName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const onFinalGuest = useCallback(
    async (text: string, rawText: string | null, timestampMs: number) => {
      const res = await fetch(`/api/meeting/${meetingId}/utterance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "guest",
          text,
          raw_text: rawText,
          timestamp_ms: timestampMs,
          speaker: guestName || "Guest",
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        console.error(j.error ?? "utterance failed");
      }
    },
    [guestName, meetingId],
  );

  const transcription = useValseaTranscription({
    language: meeting?.language ?? "english",
    onFinal: onFinalGuest,
    onPartial: () => {},
    micMuted,
  });

  const webrtc = useWebRTC({
    supabase,
    meetingId,
    isHost: false,
    localStream,
    displayName: guestName.trim() || "Guest",
    enabled: Boolean(localStream && joined),
  });

  const toggleMic = useCallback(() => {
    if (!localStream) return;
    setMicMuted((m) => {
      const next = !m;
      setLocalMicMuted(localStream, next);
      return next;
    });
  }, [localStream]);

  const leaveSession = useCallback(() => {
    transcription.disconnect();
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setMicMuted(false);
    setJoined(false);
    setError(null);
  }, [localStream, transcription]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    return () => {
      transcription.disconnect();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [transcription]);

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
      const { data, error: e } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .maybeSingle();
      if (cancelled) return;
      if (e || !data) {
        setError("Meeting not found");
        return;
      }
      setMeeting(data as Meeting);

      const { data: rows } = await supabase
        .from("meeting_utterances")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });
      if (rows) setUtterances(rows as MeetingUtterance[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [meetingId, supabase]);

  useEffect(() => {
    const ch = supabase
      .channel(`meeting-guest:${meetingId}`)
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

  async function handleJoin() {
    if (!guestName.trim()) {
      setError("Enter your name");
      return;
    }
    if (meeting?.status === "ended") {
      setError("This meeting has ended");
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setLocalStream(stream);
      setMicMuted(false);
      setJoined(true);
      await transcription.start(stream);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not access camera/mic");
    }
  }

  if (error && !meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  const statusLine =
    meeting.status === "ended"
      ? "Ended"
      : meeting.status === "waiting"
        ? "Waiting for host to start"
        : "Live";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {!joined ? (
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md space-y-8">
            <header className="text-center">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {meeting.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                {statusLine}
                {webrtc.peerName ? ` · Host: ${webrtc.peerName}` : ""}
              </p>
            </header>
            <div className="mx-auto w-full space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <label className="block text-left text-sm">
                Your name
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Alex"
                  autoComplete="name"
                />
              </label>
              {error ? (
                <p className="text-center text-sm text-red-600">{error}</p>
              ) : null}
              <button
                type="button"
                disabled={meeting.status === "ended"}
                onClick={() => void handleJoin()}
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Join with camera & mic
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-xl font-semibold">{meeting.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {statusLine}
            {webrtc.peerName ? ` · Host: ${webrtc.peerName}` : ""}
          </p>

          {(error || transcription.error || webrtc.error) && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error || transcription.error || webrtc.error}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleMic}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
            >
              {micMuted ? "Unmute mic" : "Mute mic"}
            </button>
            <button
              type="button"
              onClick={leaveSession}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
            >
              Leave session
            </button>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  Host
                </span>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
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
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-medium text-zinc-500">Transcript</h2>
              <div className="mt-3 space-y-2 text-sm">
                {utterances.map((u) => (
                  <div key={u.id}>
                    <span className="text-zinc-400">
                      {u.role === "guest" ? "You" : (u.speaker ?? "Host")}:
                    </span>{" "}
                    {u.text}
                  </div>
                ))}
                {transcription.partialText ? (
                  <div className="text-zinc-400">
                    You (partial): {transcription.partialText}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
