/**
 * ICE candidate parsing, transport detection, connection quality helpers.
 */

import { webrtcLog, webrtcWarn } from "@/lib/webrtc/logger";

export type IceCandidateKind = "host" | "srflx" | "prflx" | "relay" | "unknown";

export type PeerTransportMode = "direct" | "relay" | "unknown";

export type PeerConnectionQuality =
  | "excellent"
  | "connecting"
  | "good"
  | "poor"
  | "reconnecting"
  | "failed";

/** Parse `typ host|srflx|relay` from SDP candidate line. */
export function parseCandidateKind(
  candidate: RTCIceCandidateInit | RTCIceCandidate | string | null | undefined
): IceCandidateKind {
  const line =
    typeof candidate === "string"
      ? candidate
      : candidate?.candidate ?? "";
  if (!line) return "unknown";
  const m = line.match(/typ (\w+)/);
  const typ = m?.[1] as IceCandidateKind | undefined;
  return typ ?? "unknown";
}

export function countCandidatesByKind(
  kinds: IceCandidateKind[]
): Record<IceCandidateKind, number> {
  const counts: Record<IceCandidateKind, number> = {
    host: 0,
    srflx: 0,
    prflx: 0,
    relay: 0,
    unknown: 0,
  };
  for (const k of kinds) {
    if (k in counts && k !== "unknown") counts[k]++;
    else counts.unknown++;
  }
  return counts;
}

export function hasRelayCandidate(
  candidate: RTCIceCandidateInit | RTCIceCandidate | string | null | undefined
): boolean {
  return parseCandidateKind(candidate) === "relay";
}

export function formatCandidateForLog(
  candidate: RTCIceCandidateInit | RTCIceCandidate
): string {
  const kind = parseCandidateKind(candidate);
  const line = "candidate" in candidate ? candidate.candidate : "";
  const short = line ? line.slice(0, 60) : "(end)";
  return `${kind} ${short}`;
}

/**
 * After ICE connects, inspect active candidate-pair via getStats()
 * to learn if traffic is relayed (TURN) or direct (host/srflx).
 */
export async function detectTransportMode(
  pc: RTCPeerConnection
): Promise<PeerTransportMode> {
  try {
    const stats = await pc.getStats();
    let selectedPairId: string | null = null;

    stats.forEach((report) => {
      if (report.type === "transport" && "selectedCandidatePairId" in report) {
        const id = (report as RTCStats & { selectedCandidatePairId?: string })
          .selectedCandidatePairId;
        if (id) selectedPairId = id;
      }
    });

    if (!selectedPairId) {
      stats.forEach((report) => {
        if (
          report.type === "candidate-pair" &&
          (report as RTCStats & { selected?: boolean }).selected
        ) {
          selectedPairId = report.id;
        }
      });
    }

    if (!selectedPairId) return "unknown";

    let localId: string | null = null;
    let remoteId: string | null = null;
    const report = stats.get(selectedPairId);
    if (report && report.type === "candidate-pair") {
      const pair = report as RTCStats & {
        localCandidateId?: string;
        remoteCandidateId?: string;
      };
      localId = pair.localCandidateId ?? null;
      remoteId = pair.remoteCandidateId ?? null;
    }

    const kinds: IceCandidateKind[] = [];
    for (const id of [localId, remoteId]) {
      if (!id) continue;
      const cand = stats.get(id);
      if (cand && cand.type === "local-candidate") {
        const ct = (cand as RTCStats & { candidateType?: string }).candidateType;
        if (ct) kinds.push(ct as IceCandidateKind);
      }
      if (cand && cand.type === "remote-candidate") {
        const ct = (cand as RTCStats & { candidateType?: string }).candidateType;
        if (ct) kinds.push(ct as IceCandidateKind);
      }
    }

    if (kinds.includes("relay")) {
      webrtcLog("[ice] transport=relay (TURN in use)");
      return "relay";
    }
    if (kinds.includes("host") || kinds.includes("srflx") || kinds.includes("prflx")) {
      webrtcLog("[ice] transport=direct");
      return "direct";
    }
    return "unknown";
  } catch (e) {
    webrtcWarn("[ice] getStats transport detection failed", { error: String(e) });
    return "unknown";
  }
}

export function qualityFromIceState(
  iceState: RTCIceConnectionState,
  connectionState: RTCPeerConnectionState
): PeerConnectionQuality {
  if (connectionState === "failed" || iceState === "failed") return "failed";
  if (iceState === "disconnected" || connectionState === "disconnected") {
    return "reconnecting";
  }
  if (iceState === "checking" || connectionState === "connecting") {
    return "connecting";
  }
  if (iceState === "connected" || iceState === "completed") {
    return "good";
  }
  return "connecting";
}
