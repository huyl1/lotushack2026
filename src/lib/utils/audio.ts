/**
 * PCM audio helpers for VALSEA realtime (16 kHz mono, base64 PCM16).
 * Extracted from the valsea-live demo so meeting pages can reuse the same pipeline.
 */

export const VALSEA_TARGET_SAMPLE_RATE = 16000;
export const VALSEA_FLUSH_MS = 100;

export function downsampleBuffer(
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

export function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    output[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
  }
  return output;
}

export function int16ToBase64(samples: Int16Array): string {
  const b = new Uint8Array(
    samples.buffer,
    samples.byteOffset,
    samples.byteLength,
  );
  let binary = "";
  for (let i = 0; i < b.length; i++) binary += String.fromCharCode(b[i]!);
  return btoa(binary);
}

/** Browser WebSocket URL for the local VALSEA proxy (see npm run demo:valsea-proxy). */
export function getValseaProxyUrl(): string {
  if (typeof window === "undefined") return "";
  const fromEnv = process.env.NEXT_PUBLIC_VALSEA_WS_PROXY;
  if (fromEnv) return fromEnv;
  const { protocol, hostname } = window.location;
  const isLocal =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  if (isLocal) return "ws://127.0.0.1:8765";
  return `${protocol === "https:" ? "wss:" : "ws:"}//${hostname}:8765`;
}
