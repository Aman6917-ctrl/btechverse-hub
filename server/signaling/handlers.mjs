import { SignalingEvents } from "./types.mjs";
import {
  joinRoom,
  leaveRoom,
  removeSocketFromAllRooms,
  getStoreStats,
  isSocketInRoom,
  normalizeRoomId,
} from "./roomStore.mjs";

const LOG_PREFIX = "[signaling]";

function log(message, extra) {
  if (extra) {
    console.log(`${LOG_PREFIX} ${message}`, extra);
  } else {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

function isValidJoinPayload(data) {
  if (!data || typeof data !== "object") return false;
  return (
    typeof data.roomId === "string" &&
    data.roomId.trim().length > 0 &&
    typeof data.odId === "string" &&
    data.odId.trim().length > 0 &&
    typeof data.displayName === "string"
  );
}

function isValidLeavePayload(data) {
  if (!data || typeof data !== "object") return false;
  return typeof data.roomId === "string" && data.roomId.trim().length > 0;
}

function isValidWebRTCRelay(data) {
  if (!data || typeof data !== "object") return false;
  const hasSdp = data.sdp != null && typeof data.sdp === "object";
  const hasCandidate = data.candidate != null && typeof data.candidate === "object";
  return (
    typeof data.roomId === "string" &&
    data.roomId.trim().length > 0 &&
    typeof data.targetSocketId === "string" &&
    data.targetSocketId.trim().length > 0 &&
    (hasSdp || hasCandidate)
  );
}

function relayWebRTC(socket, eventName, raw) {
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

  const outbound = {
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

export function registerSignalingHandlers(io) {
  io.on("connection", (socket) => {
    log("socket connected", { socketId: socket.id });

    socket.on(SignalingEvents.JOIN_ROOM, (raw) => {
      if (!isValidJoinPayload(raw)) {
        log("join-room rejected: invalid payload", { socketId: socket.id, raw });
        return;
      }

      try {
        const result = joinRoom(socket.id, raw);
        void socket.join(result.roomId);

        socket.emit(SignalingEvents.ROOM_USERS, {
          roomId: result.roomId,
          users: result.existingUsers,
        });

        socket.to(result.roomId).emit(SignalingEvents.USER_JOINED, {
          roomId: result.roomId,
          user: {
            socketId: result.participant.socketId,
            odId: result.participant.odId,
            displayName: result.participant.displayName,
          },
        });

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

    socket.on(SignalingEvents.LEAVE_ROOM, (raw) => {
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

      socket.to(result.roomId).emit(SignalingEvents.USER_LEFT, {
        roomId: result.roomId,
        socketId: result.socketId,
        odId: result.odId,
      });

      log("leave-room", {
        roomId: result.roomId,
        socketId: result.socketId,
        odId: result.odId,
        roomDeleted: result.roomDeleted,
        stats: getStoreStats(),
      });
    });

    socket.on(SignalingEvents.WEBRTC_OFFER, (raw) => {
      relayWebRTC(socket, SignalingEvents.WEBRTC_OFFER, raw);
    });

    socket.on(SignalingEvents.WEBRTC_ANSWER, (raw) => {
      relayWebRTC(socket, SignalingEvents.WEBRTC_ANSWER, raw);
    });

    socket.on(SignalingEvents.WEBRTC_ICE, (raw) => {
      relayWebRTC(socket, SignalingEvents.WEBRTC_ICE, raw);
    });

    socket.on("disconnect", (reason) => {
      const left = removeSocketFromAllRooms(socket.id);

      for (const result of left) {
        io.to(result.roomId).emit(SignalingEvents.USER_LEFT, {
          roomId: result.roomId,
          socketId: result.socketId,
          odId: result.odId,
        });

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
