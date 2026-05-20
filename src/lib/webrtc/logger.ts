/**
 * Phase 3 — verbose console logging for learning (filter DevTools by "[webrtc]").
 */

const PREFIX = "[webrtc]";

export function webrtcLog(message: string, data?: Record<string, unknown>): void {
  if (data) {
    console.log(`${PREFIX} ${message}`, data);
  } else {
    console.log(`${PREFIX} ${message}`);
  }
}

export function webrtcWarn(message: string, data?: Record<string, unknown>): void {
  if (data) {
    console.warn(`${PREFIX} ${message}`, data);
  } else {
    console.warn(`${PREFIX} ${message}`);
  }
}

export function webrtcError(message: string, err?: unknown): void {
  console.error(`${PREFIX} ${message}`, err);
}
