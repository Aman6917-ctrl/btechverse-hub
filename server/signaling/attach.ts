/**
 * Phase 1 — attach Socket.IO to the existing Node HTTP server.
 *
 * WHY a separate file (not all code in api.mjs)?
 * - api.mjs stays the HTTP API (presign, chat, run-code) in plain JS
 * - Signaling is TypeScript + Socket.IO-specific
 * - Easier to test, read, and later swap (Redis adapter) without touching REST routes
 *
 * Socket.IO does NOT create a new TCP port. It hooks into the same server:3001
 * and listens on path /socket.io (WebSocket upgrade + polling fallback).
 */

import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { registerSignalingHandlers } from "./handlers";

const LOG_PREFIX = "[signaling]";

/** Same defaults as api.mjs — keep lists aligned or set ALLOWED_ORIGINS in .env */
const DEFAULT_ALLOWED_ORIGINS = [
  "https://btechverse.cloud",
  "https://www.btechverse.cloud",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_ORIGINS;
}

export interface AttachSignalingOptions {
  /** Override env-based allowlist (used by api.mjs to share same origins) */
  allowedOrigins?: string[];
}

/**
 * Attach Socket.IO to an existing http.Server created by api.mjs.
 *
 * @param httpServer - return value of http.createServer(...) — must NOT be listening yet
 * @returns Socket.IO Server instance (for health checks / future admin)
 */
export function attachSignaling(
  httpServer: HttpServer,
  options: AttachSignalingOptions = {}
): SocketIOServer {
  const allowedOrigins = options.allowedOrigins ?? getAllowedOrigins();

  /**
   * CORS for Socket.IO handshake (different from setCors() on REST in api.mjs).
   *
   * - Browser sends Origin: http://localhost:8080 (Vite)
   * - Server must allow that origin or handshake fails
   * - credentials: true if you later send cookies (Firebase session cookies etc.)
   */
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: (origin, callback) => {
        // Some tools omit Origin; allow missing origin in dev (e.g. same-machine curl)
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        console.warn(`${LOG_PREFIX} CORS blocked origin: ${origin}`);
        callback(new Error("Origin not allowed"));
      },
      credentials: true,
    },
    // Reconnect-friendly defaults (Phase 1 join-room can be sent again after reconnect)
    connectionStateRecovery: false,
  });

  registerSignalingHandlers(io);

  console.log(
    `${LOG_PREFIX} attached to HTTP server (path /socket.io, origins: ${allowedOrigins.join(", ")})`
  );

  return io;
}
