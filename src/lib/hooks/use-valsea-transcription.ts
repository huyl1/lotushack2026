"use client";

import {
  VALSEA_FLUSH_MS,
  VALSEA_TARGET_SAMPLE_RATE,
  downsampleBuffer,
  floatTo16BitPCM,
  getValseaProxyUrl,
  int16ToBase64,
} from "@/lib/utils/audio";
import {
  DEDUPE_SHORT_PHRASE_COOLDOWN_MS,
  DEDUPE_SHORT_PHRASE_MAX_LEN,
  normalizeTranscriptForDedupe,
  shouldDiscardTranscriptSegment,
} from "@/lib/utils/transcript-filters";
import { useCallback, useEffect, useRef, useState } from "react";

export type ValseaTranscriptionStatus =
  | "disconnected"
  | "connecting"
  | "ready"
  | "recording"
  | "error";

export interface UseValseaTranscriptionOptions {
  language: string;
  onFinal: (text: string, rawText: string | null, timestampMs: number) => void;
  onPartial: (text: string) => void;
  /**
   * When true, mic audio is not sent to VALSEA for this participant.
   * Use the same flag as WebRTC mute: cloned tracks still capture the mic, but we
   * drop samples here so speaker bleed / room audio is not saved under this role
   * while the user is muted for others.
   */
  micMuted?: boolean;
}

export interface UseValseaTranscriptionReturn {
  status: ValseaTranscriptionStatus;
  error: string | null;
  partialText: string;
  start: (existingStream?: MediaStream | null) => Promise<void>;
  stop: () => void;
  disconnect: () => void;
}

export function useValseaTranscription(
  options: UseValseaTranscriptionOptions,
): UseValseaTranscriptionReturn {
  const { language, onFinal, onPartial, micMuted = false } = options;

  const onFinalRef = useRef(onFinal);
  const onPartialRef = useRef(onPartial);
  const micMutedRef = useRef(micMuted);
  useEffect(() => {
    onFinalRef.current = onFinal;
    onPartialRef.current = onPartial;
  }, [onFinal, onPartial]);

  const [status, setStatus] =
    useState<ValseaTranscriptionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [partialText, setPartialText] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const sessionReadyRef = useRef(false);
  /** Last **emitted** final, normalized — blocks mở / Mở / mở repeats back-to-back. */
  const lastEmittedNormRef = useRef<string | null>(null);
  /** Short phrase → last emit time (ms) — blocks hallucination loops during silence. */
  const shortPhraseEmitAtRef = useRef<Map<string, number>>(new Map());
  /** Drop identical partial events (VALSEA sometimes resends the same partial). */
  const lastPartialRawRef = useRef<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const ownsStreamRef = useRef(false);
  const pcmQueueRef = useRef<Int16Array[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    micMutedRef.current = micMuted;
    if (micMuted) {
      pcmQueueRef.current = [];
      setPartialText("");
      lastPartialRawRef.current = null;
    }
  }, [micMuted]);

  const flushAudio = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const queue = pcmQueueRef.current;
    if (queue.length === 0) return;
    let total = 0;
    for (const chunk of queue) total += chunk.length;
    const merged = new Int16Array(total);
    let offset = 0;
    while (queue.length) {
      const c = queue.shift()!;
      merged.set(c, offset);
      offset += c.length;
    }
    if (merged.length === 0) return;
    ws.send(
      JSON.stringify({
        type: "audio.append",
        audio: int16ToBase64(merged),
      }),
    );
  }, []);

  const disconnect = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    flushAudio();
    processorRef.current?.disconnect();
    processorRef.current = null;
    if (ownsStreamRef.current) {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    }
    ownsStreamRef.current = false;
    mediaStreamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    pcmQueueRef.current = [];
    sessionReadyRef.current = false;
    lastEmittedNormRef.current = null;
    shortPhraseEmitAtRef.current.clear();
    lastPartialRawRef.current = null;
    setPartialText("");

    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "session.stop" }));
      } catch {
        /* ignore */
      }
      ws.close();
    }
    setStatus("disconnected");
  }, [flushAudio]);

  const stop = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    flushAudio();
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "audio.commit" }));
      } catch {
        /* ignore */
      }
    }
    processorRef.current?.disconnect();
    processorRef.current = null;
    if (ownsStreamRef.current) {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    }
    ownsStreamRef.current = false;
    mediaStreamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    pcmQueueRef.current = [];
    setStatus((s) => (s === "disconnected" ? s : "ready"));
  }, [flushAudio]);

  const waitForSessionReady = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (sessionReadyRef.current) {
        resolve();
        return;
      }
      const t = setInterval(() => {
        if (sessionReadyRef.current) {
          clearInterval(t);
          resolve();
        }
      }, 30);
      setTimeout(() => {
        clearInterval(t);
        if (!sessionReadyRef.current) {
          reject(new Error("VALSEA session did not become ready"));
        }
      }, 15000);
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setError(null);
      setPartialText("");
      sessionReadyRef.current = false;

      const url = getValseaProxyUrl();
      if (!url) {
        setError("Could not determine WebSocket URL.");
        setStatus("error");
        reject(new Error("No WebSocket URL"));
        return;
      }

      setStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "session.start",
            model: "valsea-rtt",
            language,
            enable_correction: true,
            hint_text: "",
          }),
        );
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as {
            type: string;
            text?: string;
            raw_text?: string;
            message?: string;
            timestampMs?: number;
          };
          switch (msg.type) {
            case "session.ready":
              sessionReadyRef.current = true;
              setStatus("ready");
              resolve();
              break;
            case "transcript.partial":
              if (msg.text != null) {
                if (shouldDiscardTranscriptSegment(msg.text)) {
                  setPartialText("");
                  lastPartialRawRef.current = null;
                } else if (msg.text === lastPartialRawRef.current) {
                  /* duplicate partial frame */
                } else {
                  lastPartialRawRef.current = msg.text;
                  setPartialText(msg.text);
                  onPartialRef.current(msg.text);
                }
              }
              break;
            case "transcript.final":
              if (msg.text != null) {
                setPartialText("");
                lastPartialRawRef.current = null;
                if (!shouldDiscardTranscriptSegment(msg.text)) {
                  const norm = normalizeTranscriptForDedupe(msg.text);
                  const now = Date.now();
                  let skip = false;
                  if (norm.length > 0) {
                    if (norm === lastEmittedNormRef.current) {
                      skip = true;
                    } else if (norm.length <= DEDUPE_SHORT_PHRASE_MAX_LEN) {
                      const prevAt = shortPhraseEmitAtRef.current.get(norm);
                      if (
                        prevAt != null &&
                        now - prevAt < DEDUPE_SHORT_PHRASE_COOLDOWN_MS
                      ) {
                        skip = true;
                      }
                    }
                  }
                  if (!skip) {
                    if (
                      norm.length > 0 &&
                      norm.length <= DEDUPE_SHORT_PHRASE_MAX_LEN
                    ) {
                      shortPhraseEmitAtRef.current.set(norm, now);
                      for (const [k, t] of shortPhraseEmitAtRef.current) {
                        if (
                          now - t >
                          DEDUPE_SHORT_PHRASE_COOLDOWN_MS * 4
                        ) {
                          shortPhraseEmitAtRef.current.delete(k);
                        }
                      }
                    }
                    lastEmittedNormRef.current = norm;
                    onFinalRef.current(
                      msg.text,
                      msg.raw_text ?? null,
                      msg.timestampMs ?? 0,
                    );
                  }
                }
              }
              break;
            case "error":
              setError(msg.message ?? "Unknown error");
              setStatus("error");
              reject(new Error(msg.message ?? "VALSEA error"));
              break;
            default:
              break;
          }
        } catch {
          setError("Invalid message from server");
          setStatus("error");
          reject(new Error("Invalid message"));
        }
      };

      ws.onerror = () => {
        const err = new Error("WebSocket error — is the VALSEA proxy running?");
        setError(err.message);
        setStatus("error");
        reject(err);
      };

      ws.onclose = () => {
        wsRef.current = null;
        sessionReadyRef.current = false;
        setStatus("disconnected");
      };
    });
  }, [language]);

  const start = useCallback(
    async (existingStream?: MediaStream | null) => {
      try {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          await connectWebSocket();
        } else if (!sessionReadyRef.current) {
          await waitForSessionReady();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
        throw e;
      }

      setError(null);
      let stream = existingStream ?? null;
      ownsStreamRef.current = false;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
          },
        });
        ownsStreamRef.current = true;
      }
      // Clone audio tracks so external mute (track.enabled = false) does not
      // silence the transcription pipeline — cloned tracks stay live independently.
      const srcAudio = stream.getAudioTracks();
      let audioOnly: MediaStream;
      if (srcAudio.length > 0) {
        audioOnly = new MediaStream(srcAudio.map((t) => t.clone()));
        if (ownsStreamRef.current) {
          for (const t of stream.getTracks()) t.stop();
        }
        ownsStreamRef.current = true;
      } else {
        audioOnly = stream;
      }
      mediaStreamRef.current = audioOnly;

      const audioContext = new AudioContext();
      audioCtxRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(audioOnly);
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 2, 2);
      processorRef.current = processor;
      processor.onaudioprocess = (ev) => {
        if (micMutedRef.current) return;
        const inBuf = ev.inputBuffer;
        const ch0 = inBuf.getChannelData(0);
        const ch1 = inBuf.numberOfChannels > 1 ? inBuf.getChannelData(1) : ch0;
        const mono = new Float32Array(ch0.length);
        for (let i = 0; i < ch0.length; i++) {
          mono[i] = (ch0[i]! + ch1[i]!) * 0.5;
        }
        const down = downsampleBuffer(
          mono,
          audioContext.sampleRate,
          VALSEA_TARGET_SAMPLE_RATE,
        );
        const pcm = floatTo16BitPCM(down);
        pcmQueueRef.current.push(pcm);
      };
      const mute = audioContext.createGain();
      mute.gain.value = 0;
      source.connect(processor);
      processor.connect(mute);
      mute.connect(audioContext.destination);

      flushTimerRef.current = setInterval(flushAudio, VALSEA_FLUSH_MS);
      setStatus("recording");
    },
    [connectWebSocket, flushAudio, waitForSessionReady],
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    error,
    partialText,
    start,
    stop,
    disconnect,
  };
}
