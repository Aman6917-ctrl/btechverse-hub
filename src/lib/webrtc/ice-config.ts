/**
 * Production RTCConfiguration: STUN + free/public TURN + optional custom TURN.
 *
 * No VPS required for demos — OpenRelay + Metered free tier via env (see docs/WEBRTC_TURN.md).
 */

import { webrtcLog, webrtcWarn } from "@/lib/webrtc/logger";
import type { IceConnectivityResult } from "@/lib/webrtc/ice-connectivity";
import {
  collectProviderSets,
  fetchMeteredApiIceServers,
  flattenProvidersToIceServers,
  isFreeTurnEnabled,
  parseIceProviders,
  type IceProviderId,
} from "@/lib/webrtc/ice-providers";
import type { AppRtcConfiguration } from "./types";

function readEnv(key: string): string {
  return (import.meta.env[key] as string | undefined)?.trim() ?? "";
}

function splitUrls(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

let cachedConnectivity: IceConnectivityResult | null = null;
let cachedStaticIceServers: RTCIceServer[] | null = null;
let loggedIceStackBuild = false;
let loggedRtcConfiguration = false;

export function clearIceServerCache(): void {
  cachedStaticIceServers = null;
  loggedIceStackBuild = false;
  loggedRtcConfiguration = false;
}

export function setIceConnectivityResult(result: IceConnectivityResult | null): void {
  cachedConnectivity = result;
}

export function getIceConnectivityResult(): IceConnectivityResult | null {
  return cachedConnectivity;
}

/** Build iceServers synchronously from env provider presets (cached). */
export function buildIceServers(): RTCIceServer[] {
  if (cachedStaticIceServers) return cachedStaticIceServers;

  const sets = collectProviderSets();
  const servers = flattenProvidersToIceServers(sets, { logProviders: !loggedIceStackBuild });

  const hasTurn = sets.some(
    (s) =>
      s.provider !== "stun" &&
      !!s.username &&
      !!s.credential &&
      s.turnUdp.length + s.turnTcp.length + s.turnTls.length > 0
  );

  if (!loggedIceStackBuild) {
    if (!hasTurn) {
      webrtcWarn(
        "[ice] no TURN credentials — enable VITE_ICE_ENABLE_FREE_TURN or add Metered/OpenRelay/custom vars"
      );
    } else {
      webrtcLog("[ice] ICE stack built", {
        providers: parseIceProviders(),
        freeTurn: isFreeTurnEnabled(),
        serverEntries: servers.length,
      });
    }
    loggedIceStackBuild = true;
  }

  cachedStaticIceServers = servers;
  return servers;
}

/**
 * Async resolve: static providers + optional Metered REST API iceServers appended.
 * API response is merged last (nearest region, fresh credentials).
 */
export async function resolveIceServers(): Promise<RTCIceServer[]> {
  const staticServers = buildIceServers();
  const apiServers = await fetchMeteredApiIceServers();

  if (!apiServers) return staticServers;

  // API returns full iceServers array — prepend our STUN, append API TURN (dedupe by url)
  const seen = new Set<string>();
  const merged: RTCIceServer[] = [];

  const add = (entry: RTCIceServer) => {
    const key = JSON.stringify(entry);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(entry);
  };

  for (const s of staticServers) add(s);
  for (const s of apiServers) add(s);

  webrtcLog("[ice] merged static + Metered API iceServers", {
    static: staticServers.length,
    api: apiServers.length,
    total: merged.length,
  });

  return merged;
}

export type IceTransportPolicyMode = "all" | "relay";

export function getIceTransportPolicy(): IceTransportPolicyMode {
  const raw = readEnv("VITE_ICE_TRANSPORT_POLICY").toLowerCase();
  if (raw === "relay") return "relay";
  return "all";
}

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

export function getRtcConfiguration(iceServers?: RTCIceServer[]): AppRtcConfiguration {
  const servers = iceServers ?? buildIceServers();
  const policy = getIceTransportPolicy();

  const config: AppRtcConfiguration = {
    iceServers: servers,
    iceTransportPolicy: policy,
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
    iceCandidatePoolSize: 10,
  };

  if (!loggedRtcConfiguration) {
    webrtcLog("[ice] RTCConfiguration", {
      iceServers: servers.length,
      iceTransportPolicy: policy,
      turnOnly: policy === "relay",
      poolSize: config.iceCandidatePoolSize,
      providers: parseIceProviders(),
    });
    loggedRtcConfiguration = true;
  }

  return config;
}

export async function resolveRtcConfiguration(): Promise<AppRtcConfiguration> {
  const iceServers = await resolveIceServers();
  return getRtcConfiguration(iceServers);
}

export interface IceDiagnostics {
  turnConfigured: boolean;
  freeTurnEnabled: boolean;
  providers: IceProviderId[];
  openRelayEnabled: boolean;
  meteredEnabled: boolean;
  customTurnEnabled: boolean;
  meteredApiConfigured: boolean;
  turnOnlyMode: boolean;
  iceTransportPolicy: IceTransportPolicyMode;
  stunCount: number;
  turnUrlCount: number;
  connectivity: IceConnectivityResult | null;
}

function countTurnUrls(servers: RTCIceServer[]): number {
  let n = 0;
  for (const s of servers) {
    const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
    for (const u of urls) {
      const lower = String(u).toLowerCase();
      if (lower.startsWith("turn:") || lower.startsWith("turns:")) n++;
    }
  }
  return n;
}

export function getIceDiagnostics(iceServers?: RTCIceServer[]): IceDiagnostics {
  const servers = iceServers ?? buildIceServers();
  const providers = parseIceProviders();
  const sets = collectProviderSets();

  const hasTurnCreds = sets.some(
    (s) =>
      s.provider !== "stun" &&
      !!s.username &&
      s.turnUdp.length + s.turnTcp.length + s.turnTls.length > 0
  );

  return {
    turnConfigured: hasTurnCreds || !!readEnv("VITE_METERED_API_KEY"),
    freeTurnEnabled: isFreeTurnEnabled(),
    providers,
    openRelayEnabled: providers.includes("openrelay") && isFreeTurnEnabled(),
    meteredEnabled:
      providers.includes("metered") &&
      !!readEnv("VITE_METERED_TURN_USERNAME") &&
      !!readEnv("VITE_METERED_TURN_CREDENTIAL"),
    customTurnEnabled:
      providers.includes("custom") &&
      !!readEnv("VITE_TURN_URLS") &&
      !!readEnv("VITE_TURN_USERNAME"),
    meteredApiConfigured: !!readEnv("VITE_METERED_API_KEY") && !!readEnv("VITE_METERED_APP_NAME"),
    turnOnlyMode: isTurnOnlyTestMode(),
    iceTransportPolicy: getIceTransportPolicy(),
    stunCount: sets.reduce((acc, s) => acc + s.stun.length, 0),
    turnUrlCount: countTurnUrls(servers),
    connectivity: cachedConnectivity,
  };
}
