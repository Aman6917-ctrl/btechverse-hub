/** Socket.IO event names — single source of truth. */
export const SignalingEvents = {
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  WEBRTC_OFFER: "webrtc-offer",
  WEBRTC_ANSWER: "webrtc-answer",
  WEBRTC_ICE: "webrtc-ice-candidate",
  ROOM_USERS: "room-users",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
};
