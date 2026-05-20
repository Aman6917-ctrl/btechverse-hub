/**
 * Phase 3 — WebRTC client types (mirror server relay payloads).
 */

export type WebRTCNegotiationRole = "offerer" | "answerer" | null;

export type WebRTCConnectionPhase =
  | "idle"
  | "getting-media"
  | "negotiating"
  | "connected"
  | "failed"
  | "closed";

export interface WebRTCRelayPayload {
  roomId: string;
  targetSocketId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface WebRTCSignalPayload {
  roomId: string;
  fromSocketId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export const WebRTCEvents = {
  OFFER: "webrtc-offer",
  ANSWER: "webrtc-answer",
  ICE: "webrtc-ice-candidate",
} as const;

export type IceTransportPolicyMode = "all" | "relay";

/** Browser RTCConfiguration + our policy labels. */
export type AppRtcConfiguration = RTCConfiguration & {
  iceTransportPolicy?: IceTransportPolicyMode;
};

/** @deprecated Use getRtcConfiguration() from ice-config.ts */
export type RTCConfiguration = AppRtcConfiguration;
