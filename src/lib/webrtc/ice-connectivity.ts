/**
 * TURN connectivity probe — logs relay candidate availability before mesh starts.
 * Safe for demos: short-lived PC, no media, no signaling.
 */

import { webrtcLog, webrtcWarn } from "@/lib/webrtc/logger";
import {
  countCandidatesByKind,
  parseCandidateKind,
  type IceCandidateKind,
} from "@/lib/webrtc/ice-utils";

export type IceConnectivityStatus = "pending" | "ok" | "partial" | "failed";

export interface IceConnectivityResult {
  status: IceConnectivityStatus;
  /** At least one relay candidate gathered. */
  relayVerified: boolean;
  /** STUN reflexive candidate (public IP discovery). */
  srflxVerified: boolean;
  hostCount: number;
  srflxCount: number;
  relayCount: number;
  durationMs: number;
  error?: string;
}

const DEFAULT_PROBE_MS = 8000;

function summarizeKinds(counts: Record<IceCandidateKind, number>): string {
  return `host=${counts.host} srflx=${counts.srflx} relay=${counts.relay}`;
}

/**
 * Gather ICE candidates on a throwaway PeerConnection to verify TURN reachability.
 * Uses iceTransportPolicy "all" so STUN + TURN are both exercised.
 */
export async function runIceConnectivityTest(
  iceServers: RTCIceServer[],
  options?: { timeoutMs?: number; label?: string }
): Promise<IceConnectivityResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_PROBE_MS;
  const label = options?.label ?? "preflight";
  const started = performance.now();

  if (iceServers.length === 0) {
    return {
      status: "failed",
      relayVerified: false,
      srflxVerified: false,
      hostCount: 0,
      srflxCount: 0,
      relayCount: 0,
      durationMs: 0,
      error: "no iceServers",
    };
  }

  webrtcLog(`[ice] connectivity test start (${label})`, {
    iceServers: iceServers.length,
    timeoutMs,
  });

  const pc = new RTCPeerConnection({
    iceServers,
    iceTransportPolicy: "all",
    iceCandidatePoolSize: 4,
  });

  const kinds: IceCandidateKind[] = [];

  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: IceConnectivityResult) => {
      if (settled) return;
      settled = true;
      pc.onicecandidate = null;
      pc.close();
      webrtcLog(`[ice] connectivity test done (${label})`, {
        status: result.status,
        relayVerified: result.relayVerified,
        srflxVerified: result.srflxVerified,
        ...result,
      });
      resolve(result);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        const kind = parseCandidateKind(ev.candidate);
        kinds.push(kind);
        webrtcLog(`[ice] probe candidate ${kind}`, {
          line: ev.candidate.candidate?.slice(0, 72) ?? "",
        });
      }
    };

    const timer = window.setTimeout(() => {
      const counts = countCandidatesByKind(kinds);
      const relayVerified = counts.relay > 0;
      const srflxVerified = counts.srflx > 0;
      const status: IceConnectivityStatus = relayVerified
        ? "ok"
        : srflxVerified
          ? "partial"
          : counts.host > 0
            ? "partial"
            : "failed";

      if (!relayVerified) {
        webrtcWarn(
          "[ice] relay candidate NOT seen — strict NAT may fail (try TCP/TLS TURN or Metered API key)"
        );
      } else {
        webrtcLog("[ice] relay candidate verified — TURN path available");
      }

      finish({
        status,
        relayVerified,
        srflxVerified,
        hostCount: counts.host,
        srflxCount: counts.srflx,
        relayCount: counts.relay,
        durationMs: Math.round(performance.now() - started),
      });
    }, timeoutMs);

    pc.createDataChannel("ice-probe");

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch((err) => {
        window.clearTimeout(timer);
        finish({
          status: "failed",
          relayVerified: false,
          srflxVerified: false,
          hostCount: 0,
          srflxCount: 0,
          relayCount: 0,
          durationMs: Math.round(performance.now() - started),
          error: String(err),
        });
      });

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") {
        window.clearTimeout(timer);
        const counts = countCandidatesByKind(kinds);
        const relayVerified = counts.relay > 0;
        const srflxVerified = counts.srflx > 0;
        finish({
          status: relayVerified ? "ok" : srflxVerified ? "partial" : "partial",
          relayVerified,
          srflxVerified,
          hostCount: counts.host,
          srflxCount: counts.srflx,
          relayCount: counts.relay,
          durationMs: Math.round(performance.now() - started),
        });
        webrtcLog(`[ice] probe gathering complete ${summarizeKinds(counts)}`);
      }
    };
  });
}

/** Track relay candidates on a live mesh PeerConnection. */
export function createRelayCandidateTracker(
  onRelayVerified: () => void
): (candidate: RTCIceCandidate | null) => void {
  let relaySeen = false;
  return (candidate) => {
    if (!candidate) return;
    if (parseCandidateKind(candidate) === "relay") {
      if (!relaySeen) {
        relaySeen = true;
        webrtcLog("[ice] relay candidate verified on mesh PC");
        onRelayVerified();
      }
    }
  };
}
