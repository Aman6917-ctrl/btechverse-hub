/**
 * Phase 1 — Socket.IO event handlers.
 *
 * This file connects Socket.IO events to roomStore.ts:
 *   join-room  → joinRoom()  → room-users + user-joined
 *   leave-room → leaveRoom() → user-left
 *   disconnect → removeSocketFromAllRooms() → user-left (each room)
 *
 * Phase 3: webrtc-offer / webrtc-answer / webrtc-ice-candidate relay (1:1).
 */

import type { Server, Socket } from "socket.io";
import {
  SignalingEvents,
  type JoinRoomPayload,
  type LeaveRoomPayload,
  type RoomUsersPayload,
  type UserJoinedPayload,
  type UserLeftPayload,
  type WebRTCRelayPayload,
  type WebRTCSignalPayload,
} from "./types";
import {
  joinRoom,
  leaveRoom,
  removeSocketFromAllRooms,
  getStoreStats,
  isSocketInRoom,
  normalizeRoomId,
} from "./roomStore";

const LOG_PREFIX = "[signaling]";

function log(message: string, extra?: Record<string, unknown>): void {
  if (extra) {
    console.log(`${LOG_PREFIX} ${message}`, extra);
  } else {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

function isValidJoinPayload(data: unknown): data is JoinRoomPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.roomId === "string" &&
    d.roomId.trim().length > 0 &&
    typeof d.odId === "string" &&
    d.odId.trim().length > 0 &&
    typeof d.displayName === "string"
  );
}

function isValidLeavePayload(data: unknown): data is LeaveRoomPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.roomId === "string" && d.roomId.trim().length > 0;
}

/** Phase 3 — relay offer / answer / ICE to one peer (1:1 only; no SFU). */
function isValidWebRTCRelay(data: unknown): data is WebRTCRelayPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const hasSdp = d.sdp != null && typeof d.sdp === "object";
  const hasCandidate = d.candidate != null && typeof d.candidate === "object";
  return (
    typeof d.roomId === "string" &&
    d.roomId.trim().length > 0 &&
    typeof d.targetSocketId === "string" &&
    d.targetSocketId.trim().length > 0 &&
    (hasSdp || hasCandidate)
  );
}

function relayWebRTC(
  socket: Socket,
  eventName: string,
  raw: unknown
): void {
  if (!isValidWebRTCRelay(raw)) {
    log(`${eventName} rejected: invalid payload`, { socketId: socket.id, raw });
    return;
  }

  const roomId = normalizeRoomId(raw.roomId);
  if (!isSocketInRoom(socket.id, roomId)) {
    log(`${eventName} rejected: sender not in room`, { socketId: socket.id, roomId });
    return;
  }
  if (!isSocketInRoom(raw.targetSocketId, roomId)) {
    log(`${eventName} rejected: target not in room`, {
      socketId: socket.id,
      targetSocketId: raw.targetSocketId,
      roomId,
    });
    return;
  }

  const outbound: WebRTCSignalPayload = {
    roomId,
    fromSocketId: socket.id,
    ...(raw.sdp ? { sdp: raw.sdp } : {}),
    ...(raw.candidate ? { candidate: raw.candidate } : {}),
  };

  socket.to(raw.targetSocketId).emit(eventName, outbound);

  log(eventName, {
    roomId,
    from: socket.id,
    to: raw.targetSocketId,
    hasSdp: !!raw.sdp,
    hasCandidate: !!raw.candidate,
  });
}

/**
 * Register all Phase 1 signaling listeners on the Socket.IO server.
 * Called once from attach.ts when the server starts.
 */
export function registerSignalingHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    log("socket connected", { socketId: socket.id });

    // -----------------------------------------------------------------------
    // join-room (client → server)
    // -----------------------------------------------------------------------
    socket.on(SignalingEvents.JOIN_ROOM, (raw: unknown) => {
      if (!isValidJoinPayload(raw)) {
        log("join-room rejected: invalid payload", { socketId: socket.id, raw });
        return;
      }

      try {
        const result = joinRoom(socket.id, raw);

        // Socket.IO built-in room: used for efficient broadcast (socket.to(roomId))
        void socket.join(result.roomId);

        const roomUsersPayload: RoomUsersPayload = {
          roomId: result.roomId,
          users: result.existingUsers,
        };

        // 1) Tell the joiner who was already here
        socket.emit(SignalingEvents.ROOM_USERS, roomUsersPayload);

        // 2) Tell everyone else that someone new arrived
        const userJoinedPayload: UserJoinedPayload = {
          roomId: result.roomId,
          user: {
            socketId: result.participant.socketId,
            odId: result.participant.odId,
            displayName: result.participant.displayName,
          },
        };

        socket.to(result.roomId).emit(SignalingEvents.USER_JOINED, userJoinedPayload);

        log("join-room", {
          roomId: result.roomId,
          socketId: socket.id,
          odId: result.participant.odId,
          displayName: result.participant.displayName,
          existingCount: result.existingUsers.length,
          replacedExisting: result.replacedExisting,
          stats: getStoreStats(),
        });
      } catch (err) {
        log("join-room error", {
          socketId: socket.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    // -----------------------------------------------------------------------
    // leave-room (client → server, graceful)
    // -----------------------------------------------------------------------
    socket.on(SignalingEvents.LEAVE_ROOM, (raw: unknown) => {
      if (!isValidLeavePayload(raw)) {
        log("leave-room rejected: invalid payload", { socketId: socket.id, raw });
        return;
      }

      const result = leaveRoom(socket.id, raw.roomId);
      if (!result) {
        log("leave-room: socket not in room", { socketId: socket.id, roomId: raw.roomId });
        return;
      }

      void socket.leave(result.roomId);

      const payload: UserLeftPayload = {
        roomId: result.roomId,
        socketId: result.socketId,
        odId: result.odId,
      };

      socket.to(result.roomId).emit(SignalingEvents.USER_LEFT, payload);

      log("leave-room", {
        roomId: result.roomId,
        socketId: result.socketId,
        odId: result.odId,
        roomDeleted: result.roomDeleted,
        stats: getStoreStats(),
      });
    });

    // -----------------------------------------------------------------------
    // Phase 3 — WebRTC signaling relay (SDP + ICE, 1:1)
    // -----------------------------------------------------------------------
    socket.on(SignalingEvents.WEBRTC_OFFER, (raw: unknown) => {
      relayWebRTC(socket, SignalingEvents.WEBRTC_OFFER, raw);
    });

    socket.on(SignalingEvents.WEBRTC_ANSWER, (raw: unknown) => {
      relayWebRTC(socket, SignalingEvents.WEBRTC_ANSWER, raw);
    });

    socket.on(SignalingEvents.WEBRTC_ICE, (raw: unknown) => {
      relayWebRTC(socket, SignalingEvents.WEBRTC_ICE, raw);
    });

    // -----------------------------------------------------------------------
    // disconnect (tab closed, network lost — not graceful)
    // -----------------------------------------------------------------------
    socket.on("disconnect", (reason) => {
      const left = removeSocketFromAllRooms(socket.id);

      for (const result of left) {
        const payload: UserLeftPayload = {
          roomId: result.roomId,
          socketId: result.socketId,
          odId: result.odId,
        };
        // socket is dead; broadcast via server to the room
        io.to(result.roomId).emit(SignalingEvents.USER_LEFT, payload);

        log("disconnect → user-left", {
          roomId: result.roomId,
          socketId: result.socketId,
          odId: result.odId,
          reason,
          roomDeleted: result.roomDeleted,
        });
      }

      if (left.length === 0) {
        log("disconnect (was not in any room)", { socketId: socket.id, reason });
      }

      log("socket disconnected", { socketId: socket.id, reason, stats: getStoreStats() });
    });
  });

  log("handlers registered", SignalingEvents);
}
