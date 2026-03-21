"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const TARGET_RATE = 16000;
const FLUSH_MS = 100;

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "singlish", label: "Singlish" },
  { value: "chinese", label: "Chinese" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "thai", label: "Thai" },
  { value: "indonesian", label: "Indonesian" },
  { value: "malay", label: "Malay" },
  { value: "filipino", label: "Filipino" },
  { value: "tamil", label: "Tamil" },
  { value: "khmer", label: "Khmer" },
] as const;

function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number,
): Float32Array {
  if (inputSampleRate === outputSampleRate) return buffer;
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let sum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      sum += buffer[i]!;
      count++;
    }
    result[offsetResult] = count ? sum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    output[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
  }
  return output;
}

function int16ToBase64(samples: Int16Array): string {
  const b = new Uint8Array(
    samples.buffer,
    samples.byteOffset,
    samples.byteLength,
  );
  let binary = "";
  for (let i = 0; i < b.length; i++) binary += String.fromCharCode(b[i]!);
  return btoa(binary);
}

function getProxyUrl(): string {
  if (typeof window === "undefined") return "";
  const fromEnv = process.env.NEXT_PUBLIC_VALSEA_WS_PROXY;
  if (fromEnv) return fromEnv;
  const { protocol, hostname } = window.location;
  const isLocal =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  if (isLocal) return "ws://127.0.0.1:8765";
  return `${protocol === "https:" ? "wss:" : "ws:"}//${hostname}:8765`;
}

export default function ValseaLiveDemoPage() {
  const [language, setLanguage] =
    useState<(typeof LANGUAGES)[number]["value"]>("english");
  const [status, setStatus] = useState<string>("Disconnected");
  const [partial, setPartial] = useState<string>("");
  const [finalLines, setFinalLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [socketOpen, setSocketOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pcmQueueRef = useRef<Int16Array[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const disconnect = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    processorRef.current?.disconnect();
    processorRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    pcmQueueRef.current = [];
    setIsRecording(false);
    setSessionReady(false);
    setSocketOpen(false);

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
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

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

  const stopRecording = useCallback(() => {
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
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    pcmQueueRef.current = [];
    setIsRecording(false);
  }, [flushAudio]);

  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!sessionReady) return;
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
      },
    });
    mediaStreamRef.current = stream;
    const audioContext = new AudioContext();
    audioCtxRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const bufferSize = 4096;
    // ScriptProcessorNode is deprecated but widely supported; avoids extra worklets for a demo.
    const processor = audioContext.createScriptProcessor(
      bufferSize,
      2,
      2,
    );
    processorRef.current = processor;
    processor.onaudioprocess = (ev) => {
      const inBuf = ev.inputBuffer;
      const ch0 = inBuf.getChannelData(0);
      const ch1 =
        inBuf.numberOfChannels > 1 ? inBuf.getChannelData(1) : ch0;
      const mono = new Float32Array(ch0.length);
      for (let i = 0; i < ch0.length; i++) {
        mono[i] = (ch0[i]! + ch1[i]!) * 0.5;
      }
      const down = downsampleBuffer(
        mono,
        audioContext.sampleRate,
        TARGET_RATE,
      );
      const pcm = floatTo16BitPCM(down);
      pcmQueueRef.current.push(pcm);
    };
    const mute = audioContext.createGain();
    mute.gain.value = 0;
    source.connect(processor);
    processor.connect(mute);
    mute.connect(audioContext.destination);

    flushTimerRef.current = setInterval(flushAudio, FLUSH_MS);
    setIsRecording(true);
  }, [flushAudio, sessionReady]);

  const connect = useCallback(() => {
    setError(null);
    setPartial("");
    setFinalLines([]);
    setSessionReady(false);
    disconnect();

    const url = getProxyUrl();
    if (!url) {
      setError("Could not determine WebSocket URL.");
      return;
    }

    setStatus(`Connecting to ${url}…`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setSocketOpen(true);
      setStatus("Connected — starting session…");
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
          message?: string;
          code?: string;
        };
        switch (msg.type) {
          case "session.created":
            setStatus("Session created");
            break;
          case "session.ready":
            setSessionReady(true);
            setStatus("Ready — press Start microphone");
            break;
          case "transcript.partial":
            if (msg.text != null) setPartial(msg.text);
            break;
          case "transcript.final":
            if (msg.text != null) {
              setFinalLines((prev) => [...prev, msg.text!]);
              setPartial("");
            }
            break;
          case "error":
            setError(msg.message ?? "Unknown error");
            setStatus("Error");
            break;
          default:
            break;
        }
      } catch {
        setError("Invalid message from server");
      }
    };

    ws.onerror = () => {
      setError("WebSocket error — is the proxy running?");
      setStatus("Error");
    };

    ws.onclose = () => {
      wsRef.current = null;
      setSocketOpen(false);
      setStatus("Disconnected");
      setSessionReady(false);
      stopRecording();
    };
  }, [disconnect, language, stopRecording]);

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            VALSEA live transcription
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Streams partial and final transcripts over WebSocket (
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
              transcript.partial
            </code>
            ,{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
              transcript.final
            </code>
            ). Browsers cannot send API keys on WebSocket requests, so run the
            local proxy (see below).
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            1. Start the proxy (separate terminal)
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {`npm run demo:valsea-proxy
# (loads VALSEA_API_KEY from .env.development.local in repo root)
# or: VALSEA_API_KEY=vl_your_key npm run demo:valsea-proxy`}
          </pre>
          <p className="mt-2 text-xs text-zinc-500">
            Optional:{" "}
            <code className="rounded bg-zinc-200/80 px-1 dark:bg-zinc-800">
              VALSEA_PROXY_PORT=8765
            </code>
            . Override browser URL with{" "}
            <code className="rounded bg-zinc-200/80 px-1 dark:bg-zinc-800">
              NEXT_PUBLIC_VALSEA_WS_PROXY
            </code>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Language</span>
            <select
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              value={language}
              disabled={socketOpen}
              onChange={(e) =>
                setLanguage(e.target.value as (typeof LANGUAGES)[number]["value"])
              }
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            onClick={connect}
          >
            Connect
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            onClick={disconnect}
          >
            Disconnect
          </button>
          <button
            type="button"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            disabled={!sessionReady || isRecording}
            onClick={() => void startRecording()}
          >
            Start microphone
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            disabled={!isRecording}
            onClick={stopRecording}
          >
            Stop microphone
          </button>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Status: <span className="font-medium text-zinc-900 dark:text-zinc-100">{status}</span>
        </p>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-2 text-sm font-medium text-zinc-500">
              Partial (streaming)
            </h2>
            <p className="min-h-16 whitespace-pre-wrap text-lg leading-relaxed">
              {partial || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-2 text-sm font-medium text-zinc-500">
              Final segments
            </h2>
            <ul className="max-h-64 list-decimal space-y-2 overflow-y-auto pl-5 text-sm leading-relaxed">
              {finalLines.length === 0 ? (
                <li className="list-none text-zinc-400">—</li>
              ) : (
                finalLines.map((line, i) => (
                  <li key={`${i}-${line.slice(0, 12)}`}>{line}</li>
                ))
              )}
            </ul>
          </div>
        </div>

        <p className="text-xs text-zinc-500">
          Reference:{" "}
          <a
            className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            href="https://valsea.app/docs/realtime"
            target="_blank"
            rel="noreferrer"
          >
            VALSEA live transcription docs
          </a>
        </p>
      </div>
    </div>
  );
}
