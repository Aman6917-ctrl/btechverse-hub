/**
 * Phase 2 — Socket.IO client factory.
 *
 * Uses the same backend host as REST (getApiBase). In dev, base is "" so io()
 * connects to Vite :8080 and the proxy forwards /socket.io → API :3001.
 */

import { io, type Socket } from "socket.io-client";
import { getApiBase } from "@/lib/api-base";

const PRODUCTION_API_BASE = "https://btechverse-hub.onrender.com";

/** WebSocket / Engine.IO target origin (not the /socket.io path — that is separate). */
export function getSignalingUrl(): string {
  const base = getApiBase();
  if (base) return base;
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
    return PRODUCTION_API_BASE;
  }
  // Dev: same origin as React app → Vite proxy
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

/**
 * Create a fresh Socket.IO client. Caller owns lifecycle (connect, listeners, disconnect).
 * One socket per study room session is typical — do not share across unrelated rooms.
 */
export function createSignalingSocket(): Socket {
  return io(getSignalingUrl(), {
    path: "/socket.io",
    /**
     * Polling first, then auto-upgrade to WebSocket. Forcing "websocket" first
     * fails on Render free-tier cold starts and some proxies ("WebSocket closed
     * before connection established"). Polling handshake is far more reliable.
     */
    transports: ["polling", "websocket"],
    upgrade: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
  });
}
