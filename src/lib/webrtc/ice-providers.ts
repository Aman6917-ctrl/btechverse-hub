/**
 * ICE provider presets — free public TURN for demos (no VPS required).
 *
 * Provider order in VITE_ICE_PROVIDERS controls fallback priority.
 * Within each TURN provider: UDP → TCP → TLS (browser picks best working pair).
 */

import { webrtcLog, webrtcWarn } from "@/lib/webrtc/logger";

export type IceProviderId = "stun" | "openrelay" | "metered" | "custom";

export interface TurnEndpointSet {
  provider: IceProviderId;
  /** STUN entries (no credentials). */
  stun: string[];
  /** TURN UDP (default transport). */
  turnUdp: string[];
  /** TURN over TCP (port 443/80 — strict firewalls). */
  turnTcp: string[];
  /** TURN over TLS (turns:) — DPI / proxy bypass. */
  turnTls: string[];
  username?: string;
  credential?: string;
}

function splitUrls(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function readEnv(key: string): string {
  return (import.meta.env[key] as string | undefined)?.trim() ?? "";
}

function readBool(key: string, defaultValue: boolean): boolean {
  const raw = readEnv(key).toLowerCase();
  if (!raw) return defaultValue;
  return raw === "1" || raw === "true" || raw === "yes";
}

/** Comma-separated provider list; default enables STUN + free OpenRelay demo tier. */
export function parseIceProviders(): IceProviderId[] {
  const raw = readEnv("VITE_ICE_PROVIDERS");
  const freeTurn = readBool("VITE_ICE_ENABLE_FREE_TURN", true);

  if (!raw) {
    const defaults: IceProviderId[] = ["stun"];
    if (freeTurn) defaults.push("openrelay");
    if (readEnv("VITE_METERED_TURN_USERNAME") && readEnv("VITE_METERED_TURN_CREDENTIAL")) {
      defaults.push("metered");
    }
    if (readEnv("VITE_TURN_URLS")) defaults.push("custom");
    return defaults;
  }

  const allowed = new Set<IceProviderId>(["stun", "openrelay", "metered", "custom"]);
  const parsed = splitUrls(raw)
    .map((s) => s.toLowerCase() as IceProviderId)
    .filter((id) => allowed.has(id));

  if (parsed.length === 0) return ["stun", ...(freeTurn ? (["openrelay"] as const) : [])];
  return parsed;
}

export function isFreeTurnEnabled(): boolean {
  return readBool("VITE_ICE_ENABLE_FREE_TURN", true);
}

/** Google + optional override STUN. */
export function buildStunProvider(): TurnEndpointSet {
  const stunRaw =
    readEnv("VITE_STUN_URLS") ||
    "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302";
  return {
    provider: "stun",
    stun: splitUrls(stunRaw),
    turnUdp: [],
    turnTcp: [],
    turnTls: [],
  };
}

/**
 * Open Relay Project (Metered) — free ~20 GB/mo tier for demos.
 * Static credentials work for student/placement projects; production should use
 * VITE_METERED_API_KEY fetch or your own Metered dashboard credentials.
 */
export function buildOpenRelayProvider(): TurnEndpointSet | null {
  if (!isFreeTurnEnabled()) return null;

  const host = readEnv("VITE_OPENRELAY_HOST") || "openrelay.metered.ca";
  const username = readEnv("VITE_OPENRELAY_USERNAME") || "openrelayproject";
  const credential = readEnv("VITE_OPENRELAY_CREDENTIAL") || "openrelayproject";

  if (!username || !credential) return null;

  return {
    provider: "openrelay",
    stun: [`stun:${host}:80`],
    turnUdp: [`turn:${host}:80`, `turn:${host}:443`],
    turnTcp: [
      `turn:${host}:80?transport=tcp`,
      `turn:${host}:443?transport=tcp`,
    ],
    turnTls: [`turns:${host}:443?transport=tcp`],
    username,
    credential,
  };
}

/** Metered.ca free dashboard credentials (signup at dashboard.metered.ca). */
export function buildMeteredProvider(): TurnEndpointSet | null {
  const username = readEnv("VITE_METERED_TURN_USERNAME");
  const credential = readEnv("VITE_METERED_TURN_CREDENTIAL");
  if (!username || !credential) return null;

  const host = readEnv("VITE_METERED_TURN_HOST") || "standard.relay.metered.ca";

  return {
    provider: "metered",
    stun: [`stun:stun.relay.metered.ca:80`, `stun:${host}:80`],
    turnUdp: [`turn:${host}:80`, `turn:${host}:443`],
    turnTcp: [
      `turn:${host}:80?transport=tcp`,
      `turn:${host}:443?transport=tcp`,
    ],
    turnTls: [`turns:${host}:443?transport=tcp`],
    username,
    credential,
  };
}

/** Legacy manual TURN (coturn / any provider) via VITE_TURN_* */
export function buildCustomProvider(): TurnEndpointSet | null {
  const turnUrls = splitUrls(readEnv("VITE_TURN_URLS"));
  const username = readEnv("VITE_TURN_USERNAME");
  const credential = readEnv("VITE_TURN_CREDENTIAL");

  if (turnUrls.length === 0) return null;
  if (!username || !credential) {
    webrtcWarn("[ice] custom provider: VITE_TURN_URLS set but credentials missing");
    return null;
  }

  const stun: string[] = [];
  const turnUdp: string[] = [];
  const turnTcp: string[] = [];
  const turnTls: string[] = [];

  for (const url of turnUrls) {
    const lower = url.toLowerCase();
    if (lower.startsWith("stun:")) {
      stun.push(url);
    } else if (lower.startsWith("turns:")) {
      turnTls.push(url);
    } else if (lower.includes("transport=tcp")) {
      turnTcp.push(url);
    } else {
      turnUdp.push(url);
    }
  }

  return {
    provider: "custom",
    stun,
    turnUdp,
    turnTcp,
    turnTls,
    username,
    credential,
  };
}

/** Fetch dynamic iceServers from Metered REST API (free tier API key). */
export async function fetchMeteredApiIceServers(): Promise<RTCIceServer[] | null> {
  const apiKey = readEnv("VITE_METERED_API_KEY");
  const appName = readEnv("VITE_METERED_APP_NAME");
  if (!apiKey || !appName) return null;

  const region = readEnv("VITE_METERED_TURN_REGION");
  const base = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
  const url = region ? `${base}&region=${encodeURIComponent(region)}` : base;

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      webrtcWarn("[ice] Metered API fetch failed", { status: res.status });
      return null;
    }
    const data = (await res.json()) as RTCIceServer[];
    if (!Array.isArray(data) || data.length === 0) return null;
    webrtcLog("[ice] Metered API iceServers fetched", { count: data.length });
    return data;
  } catch (err) {
    webrtcWarn("[ice] Metered API fetch error", { error: String(err) });
    return null;
  }
}

/** Flatten provider sets into RTCIceServer[] with fallback ordering. */
export function flattenProvidersToIceServers(
  sets: TurnEndpointSet[],
  options?: { logProviders?: boolean }
): RTCIceServer[] {
  const logProviders = options?.logProviders ?? false;
  const servers: RTCIceServer[] = [];

  for (const set of sets) {
    for (const url of set.stun) {
      servers.push({ urls: url });
    }
  }

  for (const set of sets) {
    if (!set.username || !set.credential) continue;
    const turnUrls = [...set.turnUdp, ...set.turnTcp, ...set.turnTls];
    if (turnUrls.length === 0) continue;
    servers.push({
      urls: turnUrls,
      username: set.username,
      credential: set.credential,
    });
    if (logProviders) {
      webrtcLog(`[ice] provider=${set.provider} TURN`, {
        udp: set.turnUdp.length,
        tcp: set.turnTcp.length,
        tls: set.turnTls.length,
      });
    }
  }

  return servers;
}

export function collectProviderSets(): TurnEndpointSet[] {
  const ids = parseIceProviders();
  const sets: TurnEndpointSet[] = [];

  for (const id of ids) {
    if (id === "stun") sets.push(buildStunProvider());
    else if (id === "openrelay") {
      const open = buildOpenRelayProvider();
      if (open) sets.push(open);
    } else if (id === "metered") {
      const metered = buildMeteredProvider();
      if (metered) sets.push(metered);
    } else if (id === "custom") {
      const custom = buildCustomProvider();
      if (custom) sets.push(custom);
    }
  }

  return sets;
}
