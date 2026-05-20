/**
 * Production RTCConfiguration: STUN + TURN from environment.
 *
 * STUN: discovers your public IP (server reflexive / srflx) — works for many NATs.
 * TURN: relays all media when direct UDP cannot work (symmetric NAT, strict firewalls).
 *
 * Coturn: open-source TURN server. Set VITE_TURN_* in .env (see docs/WEBRTC_TURN.md).
 */

import { webrtcLog, webrtcWarn } from "@/lib/webrtc/logger";
import type { AppRtcConfiguration } from "./types";

function splitUrls(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function readEnv(key: string): string {
  return (import.meta.env[key] as string | undefined)?.trim() ?? "";
}

/** Build RTCIceServer[]: public STUN + optional TURN with credentials. */
export function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [];

  const stunRaw =
    readEnv("VITE_STUN_URLS") ||
    "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302";
  for (const url of splitUrls(stunRaw)) {
    servers.push({ urls: url });
  }

  const turnUrls = splitUrls(readEnv("VITE_TURN_URLS"));
  const turnUser = readEnv("VITE_TURN_USERNAME");
  const turnCred = readEnv("VITE_TURN_CREDENTIAL");

  if (turnUrls.length > 0) {
    if (turnUser && turnCred) {
      servers.push({
        urls: turnUrls,
        username: turnUser,
        credential: turnCred,
      });
      webrtcLog("[ice] TURN configured", {
        urls: turnUrls.length,
        user: turnUser.slice(0, 4) + "…",
      });
    } else {
      webrtcWarn(
        "[ice] VITE_TURN_URLS set but username/credential missing — TURN disabled"
      );
    }
  } else {
    webrtcLog("[ice] STUN-only mode (no VITE_TURN_URLS) — strict NAT may fail");
  }

  return servers;
}

export type IceTransportPolicyMode = "all" | "relay";

export function getIceTransportPolicy(): IceTransportPolicyMode {
  const raw = readEnv("VITE_ICE_TRANSPORT_POLICY").toLowerCase();
  if (raw === "relay") return "relay";
  return "all";
}

/** TURN-only test mode: forces relay candidates (debug strict-NAT scenarios). */
export function isTurnOnlyTestMode(): boolean {
  return getIceTransportPolicy() === "relay";
}

export function getIceRestartMaxAttempts(): number {
  const n = Number(readEnv("VITE_ICE_RESTART_MAX_ATTEMPTS") || "3");
  return Number.isFinite(n) && n > 0 ? Math.min(n, 8) : 3;
}

export function getIceDisconnectGraceMs(): number {
  const n = Number(readEnv("VITE_ICE_DISCONNECT_GRACE_MS") || "4500");
  return Number.isFinite(n) && n >= 1000 ? n : 4500;
}

/**
 * Full PeerConnection config used by mesh.
 * iceTransportPolicy: "all" (default) tries direct first, then relay.
 * "relay" skips host/srflx — only for testing TURN path.
 */
export function getRtcConfiguration(): AppRtcConfiguration {
  const iceServers = buildIceServers();
  const policy = getIceTransportPolicy();

  const config: AppRtcConfiguration = {
    iceServers,
    iceTransportPolicy: policy,
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
    iceCandidatePoolSize: 10,
  };

  webrtcLog("[ice] RTCConfiguration", {
    iceServers: iceServers.length,
    iceTransportPolicy: policy,
    turnOnly: policy === "relay",
    poolSize: config.iceCandidatePoolSize,
  });

  return config;
}

export interface IceDiagnostics {
  turnConfigured: boolean;
  turnOnlyMode: boolean;
  iceTransportPolicy: IceTransportPolicyMode;
  stunCount: number;
  turnUrlCount: number;
}

export function getIceDiagnostics(): IceDiagnostics {
  const iceServers = buildIceServers();
  const turnUrls = splitUrls(readEnv("VITE_TURN_URLS"));
  const hasTurnCreds =
    !!readEnv("VITE_TURN_USERNAME") && !!readEnv("VITE_TURN_CREDENTIAL");
  return {
    turnConfigured: turnUrls.length > 0 && hasTurnCreds,
    turnOnlyMode: isTurnOnlyTestMode(),
    iceTransportPolicy: getIceTransportPolicy(),
    stunCount: splitUrls(
      readEnv("VITE_STUN_URLS") ||
        "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302"
    ).length,
    turnUrlCount: turnUrls.length,
  };
}
