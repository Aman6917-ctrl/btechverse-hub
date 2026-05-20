/**
 * Phase 1 — in-memory study room registry.
 *
 * This module is the server's "attendance sheet":
 * - which rooms exist right now
 * - which socket connections are in each room
 *
 * handlers.ts will call these functions; Socket.IO does not live here.
 */

import type { JoinRoomPayload, RoomParticipant } from "./types";

// ---------------------------------------------------------------------------
// Data structures (two Maps — explained below)
// ---------------------------------------------------------------------------

/**
 * rooms: roomId → (socketId → participant)
 *
 * Outer Map key  = study room code, e.g. "XK7M2A"
 * Inner Map key  = Socket.IO socket.id for one browser tab
 * Inner Map value = metadata we need for signaling + logs
 */
const rooms = new Map<string, Map<string, RoomParticipant>>();

/**
 * socketToRooms: socketId → Set of roomIds
 *
 * WHY a second Map?
 * When a tab disconnects (Wi‑Fi drop, closed tab), we only get socketId.
 * We must remove that socket from EVERY room it joined without scanning all rooms.
 */
const socketToRooms = new Map<string, Set<string>>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Study room codes are uppercase alphanumeric (matches client normalization). */
export function normalizeRoomId(roomId: string): string {
  return roomId.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function isValidRoomId(roomId: string): boolean {
  return roomId.length >= 4 && roomId.length <= 10;
}

/** Ensure inner Map exists for a room; returns the participants map. */
function getOrCreateRoom(roomId: string): Map<string, RoomParticipant> {
  let room = rooms.get(roomId);
  if (!room) {
    room = new Map();
    rooms.set(roomId, room);
  }
  return room;
}

/** Remember that this socket is in this room (for fast disconnect cleanup). */
function trackSocketInRoom(socketId: string, roomId: string): void {
  let set = socketToRooms.get(socketId);
  if (!set) {
    set = new Set();
    socketToRooms.set(socketId, set);
  }
  set.add(roomId);
}

/** Stop tracking socket ↔ room link. */
function untrackSocketFromRoom(socketId: string, roomId: string): void {
  const set = socketToRooms.get(socketId);
  if (!set) return;
  set.delete(roomId);
  if (set.size === 0) {
    socketToRooms.delete(socketId);
  }
}

/**
 * If a room has zero participants, delete it so memory does not grow forever.
 * Returns true if the room was removed.
 */
function deleteRoomIfEmpty(roomId: string): boolean {
  const room = rooms.get(roomId);
  if (room && room.size === 0) {
    rooms.delete(roomId);
    return true;
  }
  return false;
}

/** Public snapshot for logging / health checks. */
export function getStoreStats(): { roomCount: number; connectionCount: number } {
  let connectionCount = 0;
  for (const room of rooms.values()) {
    connectionCount += room.size;
  }
  return { roomCount: rooms.size, connectionCount };
}

// ---------------------------------------------------------------------------
// Join
// ---------------------------------------------------------------------------

export interface JoinRoomResult {
  roomId: string;
  /** People already in the room BEFORE this socket joined (for room-users event). */
  existingUsers: Array<{
    socketId: string;
    odId: string;
    displayName: string;
  }>;
  /** This connection's record (for user-joined event to others). */
  participant: RoomParticipant;
  /** True if this socket was already in the room (reconnect / duplicate join). */
  replacedExisting: boolean;
}

/**
 * Register a socket in a room.
 *
 * Flow (conceptual):
 *   1. Validate roomId
 *   2. Add participant to rooms[roomId]
 *   3. Track socketId in socketToRooms
 *   4. Return list of OTHER participants (not including this socket)
 */
export function joinRoom(
  socketId: string,
  payload: JoinRoomPayload
): JoinRoomResult {
  const roomId = normalizeRoomId(payload.roomId);

  if (!isValidRoomId(roomId)) {
    throw new Error(`Invalid roomId: ${payload.roomId}`);
  }

  const room = getOrCreateRoom(roomId);

  // Collect who is already here (before we add the new socket).
  const existingUsers: JoinRoomResult["existingUsers"] = [];
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

  const participant: RoomParticipant = {
    socketId,
    odId: payload.odId,
    displayName: payload.displayName.trim() || "Student",
    joinedAt: Date.now(),
  };

  room.set(socketId, participant);
  trackSocketInRoom(socketId, roomId);

  return {
    roomId,
    existingUsers,
    participant,
    replacedExisting,
  };
}

// ---------------------------------------------------------------------------
// Leave (graceful)
// ---------------------------------------------------------------------------

export interface LeaveRoomResult {
  roomId: string;
  socketId: string;
  odId: string;
  displayName: string;
  /** True if the whole room was deleted because it became empty. */
  roomDeleted: boolean;
}

/**
 * Remove one socket from one room (user clicked Leave or navigated away).
 * Returns null if the socket was not in that room.
 */
export function leaveRoom(
  socketId: string,
  roomIdRaw: string
): LeaveRoomResult | null {
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

// ---------------------------------------------------------------------------
// Disconnect (not graceful — tab closed, network lost)
// ---------------------------------------------------------------------------

/**
 * Remove a socket from ALL rooms it was in.
 * Socket.IO fires "disconnect" once per socket — we may need multiple user-left payloads.
 */
export function removeSocketFromAllRooms(socketId: string): LeaveRoomResult[] {
  const roomIds = socketToRooms.get(socketId);
  if (!roomIds || roomIds.size === 0) {
    return [];
  }

  // Copy room ids because leaveRoom mutates the Set we are iterating.
  const toProcess = [...roomIds];
  const results: LeaveRoomResult[] = [];

  for (const roomId of toProcess) {
    const result = leaveRoom(socketId, roomId);
    if (result) {
      results.push(result);
    }
  }

  // Safety: ensure reverse index is gone.
  socketToRooms.delete(socketId);

  return results;
}

/**
 * List everyone still in a room (debug / optional admin).
 */
export function listParticipants(roomIdRaw: string): RoomParticipant[] {
  const roomId = normalizeRoomId(roomIdRaw);
  const room = rooms.get(roomId);
  if (!room) return [];
  return [...room.values()];
}

/**
 * Check if a socket is in a room (optional guard for duplicate events).
 */
export function isSocketInRoom(socketId: string, roomIdRaw: string): boolean {
  const roomId = normalizeRoomId(roomIdRaw);
  return rooms.get(roomId)?.has(socketId) ?? false;
}
