/**
 * Phase 1 signaling — shared TypeScript types.
 * No WebRTC here; only room membership over Socket.IO.
 */

/** Payload client sends when entering a study room. */
export interface JoinRoomPayload {
  /** Same code as Firestore study room, e.g. "XK7M2A" */
  roomId: string;
  /** Firebase uid or guest id — stable across reconnect if you reuse it */
  odId: string;
  /** Shown in logs / future video UI */
  displayName: string;
}

/** One participant stored in memory on the server. */
export interface RoomParticipant {
  socketId: string;
  odId: string;
  displayName: string;
  joinedAt: number;
}

/** What the server sends back to the joiner: who is already here. */
export interface RoomUsersPayload {
  roomId: string;
  users: Array<{
    socketId: string;
    odId: string;
    displayName: string;
  }>;
}

/** Notifies existing clients that someone new arrived. */
export interface UserJoinedPayload {
  roomId: string;
  user: {
    socketId: string;
    odId: string;
    displayName: string;
  };
}

/** Notifies clients that someone left (graceful or disconnect). */
export interface UserLeftPayload {
  roomId: string;
  socketId: string;
  odId: string;
}

/** Client → server: graceful leave before closing tab. */
export interface LeaveRoomPayload {
  roomId: string;
}

/** Phase 3 — client sends SDP or ICE to a specific peer in the same room (1:1 relay). */
export interface WebRTCRelayPayload {
  roomId: string;
  /** Other participant's socket.id */
  targetSocketId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

/** Phase 3 — server forwards to recipient (includes sender for logging). */
export interface WebRTCSignalPayload {
  roomId: string;
  fromSocketId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

/** Socket.IO event names — single source of truth. */
export const SignalingEvents = {
  // client → server
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  WEBRTC_OFFER: "webrtc-offer",
  WEBRTC_ANSWER: "webrtc-answer",
  WEBRTC_ICE: "webrtc-ice-candidate",

  // server → client
  ROOM_USERS: "room-users",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
} as const;

export type SignalingEventName =
  (typeof SignalingEvents)[keyof typeof SignalingEvents];
