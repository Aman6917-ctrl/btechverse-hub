/**
 * Phase 2 — client-side signaling types (mirrors server/signaling/types.ts).
 * Keep event names identical so client and server stay in sync.
 */

export interface JoinRoomPayload {
  roomId: string;
  odId: string;
  displayName: string;
}

export interface RoomUsersPayload {
  roomId: string;
  users: Array<{
    socketId: string;
    odId: string;
    displayName: string;
  }>;
}

export interface UserJoinedPayload {
  roomId: string;
  user: {
    socketId: string;
    odId: string;
    displayName: string;
  };
}

export interface UserLeftPayload {
  roomId: string;
  socketId: string;
  odId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

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

export interface MediaStatePayload {
  roomId: string;
  fromSocketId: string;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

export const SignalingEvents = {
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  WEBRTC_OFFER: "webrtc-offer",
  WEBRTC_ANSWER: "webrtc-answer",
  WEBRTC_ICE: "webrtc-ice-candidate",
  ROOM_USERS: "room-users",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  MEDIA_STATE: "media-state",
} as const;

/** Remote peer's mic/camera on-off state, keyed by socketId. */
export interface RemoteMediaState {
  micEnabled: boolean;
  cameraEnabled: boolean;
}

/** One row in the live participant list (UI + future WebRTC peer list). */
export interface SignalingParticipant {
  socketId: string;
  odId: string;
  displayName: string;
  /** True for this browser tab's socket connection */
  isSelf: boolean;
}

export type SignalingConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "joined"
  | "disconnected"
  | "error";
