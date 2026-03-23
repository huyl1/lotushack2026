/**
 * Local WebSocket proxy for VALSEA realtime transcription.
 * Browsers cannot set Authorization headers on WebSocket handshakes, so this
 * forwards messages to the VALSEA realtime WebSocket with your API key.
 *
 * Usage: npm run demo:valsea-proxy  (from repo root; loads .env.development.local)
 *        or VALSEA_API_KEY=vl_... npm run demo:valsea-proxy
 *
 * Env (all optional except VALSEA_API_KEY):
 *   VALSEA_UPSTREAM      — upstream WSS URL (default: wss://api.valsea.app/v1/realtime)
 *   VALSEA_PROXY_HOST    — bind address (default: 127.0.0.1 locally, 0.0.0.0 on Railway)
 *   PORT                 — listen port (Railway sets this; overrides VALSEA_PROXY_PORT)
 *   VALSEA_PROXY_PORT    — listen port when PORT unset (default: 8765)
 *   VALSEA_API_KEY       — dashboard API key (vl_...); can live in .env.development.local
 *
 * Docs: https://valsea.app/docs/realtime
 */

import nextEnv from "@next/env";
import WebSocket, { WebSocketServer } from "ws";

const { loadEnvConfig } = nextEnv;
// Same file order as Next.js: .env.development.local overrides .env when not production
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const UPSTREAM =
  process.env.VALSEA_UPSTREAM ?? "wss://api.valsea.app/v1/realtime";
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);
const HOST =
  process.env.VALSEA_PROXY_HOST ?? (isRailway ? "0.0.0.0" : "127.0.0.1");
const PORT = Number(process.env.PORT ?? process.env.VALSEA_PROXY_PORT ?? 8765);
const apiKey = process.env.VALSEA_API_KEY;

if (!apiKey || !apiKey.startsWith("vl_")) {
  console.error(
    "Missing VALSEA_API_KEY (must start with vl_). Add it to .env.development.local " +
      "in the repo root, or run:\n" +
      "  VALSEA_API_KEY=vl_xxx npm run demo:valsea-proxy",
  );
  process.exit(1);
}

const wss = new WebSocketServer({ host: HOST, port: PORT });

wss.on("connection", (browserWs) => {
  const pendingFromBrowser = [];

  const upstream = new WebSocket(UPSTREAM, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  upstream.on("open", () => {
    while (
      pendingFromBrowser.length &&
      upstream.readyState === WebSocket.OPEN
    ) {
      upstream.send(pendingFromBrowser.shift());
    }
  });

  upstream.on("message", (data, isBinary) => {
    if (browserWs.readyState !== WebSocket.OPEN) return;
    browserWs.send(data, { binary: isBinary });
  });

  upstream.on("close", () => {
    try {
      browserWs.close();
    } catch {
      /* ignore */
    }
  });

  upstream.on("error", (err) => {
    console.error("[valsea-proxy] upstream error:", err.message);
    try {
      browserWs.close();
    } catch {
      /* ignore */
    }
  });

  browserWs.on("message", (data, isBinary) => {
    if (upstream.readyState === WebSocket.OPEN) {
      upstream.send(data, { binary: isBinary });
    } else {
      pendingFromBrowser.push(data);
    }
  });

  browserWs.on("close", () => {
    try {
      upstream.close();
    } catch {
      /* ignore */
    }
  });

  browserWs.on("error", (err) => {
    console.error("[valsea-proxy] browser error:", err.message);
    try {
      upstream.close();
    } catch {
      /* ignore */
    }
  });
});

wss.on("listening", () => {
  const localUrl =
    HOST.includes(":") && !HOST.startsWith("[")
      ? `ws://[${HOST}]:${PORT}`
      : `ws://${HOST}:${PORT}`;
  console.log(
    `[valsea-proxy] ${localUrl} → ${UPSTREAM}\n` +
      `Open the app at /demo/valsea-live with Next.js dev server running.`,
  );
});

wss.on("error", (err) => {
  console.error("[valsea-proxy] server error:", err.message);
  process.exit(1);
});
