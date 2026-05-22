/** In-memory study room registry for Socket.IO signaling. */

const rooms = new Map();
const socketToRooms = new Map();

export function normalizeRoomId(roomId) {
  return roomId.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function isValidRoomId(roomId) {
  return roomId.length >= 4 && roomId.length <= 10;
}

function getOrCreateRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = new Map();
    rooms.set(roomId, room);
  }
  return room;
}

function trackSocketInRoom(socketId, roomId) {
  let set = socketToRooms.get(socketId);
  if (!set) {
    set = new Set();
    socketToRooms.set(socketId, set);
  }
  set.add(roomId);
}

function untrackSocketFromRoom(socketId, roomId) {
  const set = socketToRooms.get(socketId);
  if (!set) return;
  set.delete(roomId);
  if (set.size === 0) {
    socketToRooms.delete(socketId);
  }
}

function deleteRoomIfEmpty(roomId) {
  const room = rooms.get(roomId);
  if (room && room.size === 0) {
    rooms.delete(roomId);
    return true;
  }
  return false;
}

export function getStoreStats() {
  let connectionCount = 0;
  for (const room of rooms.values()) {
    connectionCount += room.size;
  }
  return { roomCount: rooms.size, connectionCount };
}

export function joinRoom(socketId, payload) {
  const roomId = normalizeRoomId(payload.roomId);

  if (!isValidRoomId(roomId)) {
    throw new Error(`Invalid roomId: ${payload.roomId}`);
  }

  const room = getOrCreateRoom(roomId);
  const existingUsers = [];

  for (const [id, p] of room.entries()) {
    if (id !== socketId) {
      existingUsers.push({
        socketId: p.socketId,
        odId: p.odId,
        displayName: p.displayName,
      });
    }
  }

  const replacedExisting = room.has(socketId);
  const participant = {
    socketId,
    odId: payload.odId,
    displayName: payload.displayName.trim() || "Student",
    joinedAt: Date.now(),
  };

  room.set(socketId, participant);
  trackSocketInRoom(socketId, roomId);

  return { roomId, existingUsers, participant, replacedExisting };
}

export function leaveRoom(socketId, roomIdRaw) {
  const roomId = normalizeRoomId(roomIdRaw);
  const room = rooms.get(roomId);
  if (!room) return null;

  const participant = room.get(socketId);
  if (!participant) return null;

  room.delete(socketId);
  untrackSocketFromRoom(socketId, roomId);
  const roomDeleted = deleteRoomIfEmpty(roomId);

  return {
    roomId,
    socketId: participant.socketId,
    odId: participant.odId,
    displayName: participant.displayName,
    roomDeleted,
  };
}

export function removeSocketFromAllRooms(socketId) {
  const roomIds = socketToRooms.get(socketId);
  if (!roomIds || roomIds.size === 0) {
    return [];
  }

  const toProcess = [...roomIds];
  const results = [];

  for (const roomId of toProcess) {
    const result = leaveRoom(socketId, roomId);
    if (result) {
      results.push(result);
    }
  }

  socketToRooms.delete(socketId);
  return results;
}

export function listParticipants(roomIdRaw) {
  const roomId = normalizeRoomId(roomIdRaw);
  const room = rooms.get(roomId);
  if (!room) return [];
  return [...room.values()];
}

export function isSocketInRoom(socketId, roomIdRaw) {
  const roomId = normalizeRoomId(roomIdRaw);
  return rooms.get(roomId)?.has(socketId) ?? false;
}
