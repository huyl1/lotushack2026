"use client";

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export interface UseWebRTCOptions {
  supabase: SupabaseClient;
  meetingId: string;
  isHost: boolean;
  localStream: MediaStream | null;
  displayName: string;
  /** True when meetingId is set and local media is ready */
  enabled: boolean;
}

export interface UseWebRTCReturn {
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | "new";
  peerName: string | null;
  error: string | null;
}

/**
 * WebRTC 1:1 audio/video with Supabase Realtime Broadcast as signaling.
 * Requires `localStream` before enabling so tracks are attached before peer-ready.
 */
export function useWebRTC(options: UseWebRTCOptions): UseWebRTCReturn {
  const { supabase, meetingId, isHost, localStream, displayName, enabled } =
    options;

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<
    RTCPeerConnectionState | "new"
  >("new");
  const [peerName, setPeerName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pendingRemoteIceRef = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef(false);
  const hostReadyRef = useRef(false);
  const guestReadyRef = useRef(false);

  const sendBroadcast = useCallback(
    async (event: string, payload: Record<string, unknown>) => {
      const ch = channelRef.current;
      if (!ch) return;
      await ch.send({
        type: "broadcast",
        event,
        payload,
      });
    },
    [],
  );

  const teardown = useCallback(() => {
    pendingRemoteIceRef.current = [];
    makingOfferRef.current = false;
    hostReadyRef.current = false;
    guestReadyRef.current = false;
    pcRef.current?.close();
    pcRef.current = null;
    void channelRef.current?.unsubscribe();
    channelRef.current = null;
    setRemoteStream(null);
    setConnectionState("new");
    setPeerName(null);
  }, []);

  useEffect(() => {
    if (!enabled || !meetingId || !localStream) {
      teardown();
      return;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      if (stream) setRemoteStream(stream);
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        void sendBroadcast("webrtc-ice", {
          candidate: ev.candidate.toJSON(),
        });
      }
    };

    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }

    const channel = supabase.channel(`meeting-webrtc:${meetingId}`, {
      config: { broadcast: { self: true } },
    });
    channelRef.current = channel;

    const flushPendingIce = async () => {
      const remote = pendingRemoteIceRef.current.splice(
        0,
        pendingRemoteIceRef.current.length,
      );
      for (const c of remote) {
        try {
          await pc.addIceCandidate(c);
        } catch {
          /* ignore */
        }
      }
    };

    const tryNegotiate = async () => {
      if (!isHost) return;
      if (!guestReadyRef.current || !hostReadyRef.current) return;
      if (makingOfferRef.current) return;
      if (pc.signalingState !== "stable") return;

      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendBroadcast("webrtc-offer", {
          sdp: offer.sdp,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Negotiation failed");
      } finally {
        makingOfferRef.current = false;
      }
    };

    channel.on("broadcast", { event: "peer-ready" }, ({ payload }) => {
      const p = payload as { role?: string; name?: string };
      if (p.role === "host") {
        hostReadyRef.current = true;
        if (!isHost && p.name) setPeerName(p.name);
      }
      if (p.role === "guest") {
        guestReadyRef.current = true;
        if (isHost && p.name) setPeerName(p.name);
      }
      void tryNegotiate();
    });

    channel.on("broadcast", { event: "webrtc-offer" }, async ({ payload }) => {
      const p = payload as { sdp?: string };
      if (!p.sdp || isHost) return;
      try {
        await pc.setRemoteDescription({ type: "offer", sdp: p.sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendBroadcast("webrtc-answer", { sdp: answer.sdp });
        await flushPendingIce();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Answer failed");
      }
    });

    channel.on("broadcast", { event: "webrtc-answer" }, async ({ payload }) => {
      const p = payload as { sdp?: string };
      if (!p.sdp || !isHost) return;
      try {
        await pc.setRemoteDescription({ type: "answer", sdp: p.sdp });
        await flushPendingIce();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Remote answer failed");
      }
    });

    channel.on("broadcast", { event: "webrtc-ice" }, async ({ payload }) => {
      const p = payload as { candidate?: RTCIceCandidateInit };
      if (!p.candidate) return;
      if (!pc.remoteDescription) {
        pendingRemoteIceRef.current.push(p.candidate);
        return;
      }
      try {
        await pc.addIceCandidate(p.candidate);
      } catch {
        /* ignore */
      }
    });

    void channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      if (isHost) {
        hostReadyRef.current = true;
      } else {
        guestReadyRef.current = true;
      }
      await sendBroadcast("peer-ready", {
        role: isHost ? "host" : "guest",
        name: displayName,
      });
      void tryNegotiate();
    });

    return () => {
      teardown();
    };
  }, [
    displayName,
    enabled,
    isHost,
    localStream,
    meetingId,
    sendBroadcast,
    supabase,
    teardown,
  ]);

  return {
    remoteStream,
    connectionState,
    peerName,
    error,
  };
}
