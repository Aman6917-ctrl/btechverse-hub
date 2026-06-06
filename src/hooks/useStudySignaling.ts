/**
 * Phase 2 — React hook for study room Socket.IO presence (no WebRTC).
 *
 * useRef(socket): the Socket instance is mutable I/O state — storing it in useState
 * would trigger re-renders on every internal socket tick and risk recreating connections.
 *
 * useEffect cleanup: on unmount or room change, emit leave-room, remove listeners,
 * disconnect — prevents ghost participants and memory leaks.
 *
 * Refs for roomId/odId/displayName: event handlers are registered once per effect run;
 * reading .current avoids stale closures when parent re-renders with new names.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSignalingSocket } from "@/lib/signaling/socket-client";
import {
  SignalingEvents,
  type MediaStatePayload,
  type RemoteMediaState,
  type RoomUsersPayload,
  type SignalingConnectionStatus,
  type SignalingParticipant,
  type UserJoinedPayload,
  type UserLeftPayload,
} from "@/lib/signaling/types";

function normalizeRoomId(roomId: string): string {
  return roomId.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function upsertParticipant(
  list: SignalingParticipant[],
  next: Omit<SignalingParticipant, "isSelf">,
  selfSocketId: string | null
): SignalingParticipant[] {
  const isSelf = next.socketId === selfSocketId;
  const without = list.filter((p) => p.socketId !== next.socketId);
  return [...without, { ...next, isSelf }];
}

function removeBySocketId(
  list: SignalingParticipant[],
  socketId: string
): SignalingParticipant[] {
  return list.filter((p) => p.socketId !== socketId);
}

export interface UseStudySignalingOptions {
  roomId: string;
  odId: string;
  displayName: string;
  /** When false, no socket is created (e.g. room still loading). */
  enabled?: boolean;
}

export interface UseStudySignalingResult {
  status: SignalingConnectionStatus;
  participants: SignalingParticipant[];
  /**
   * Socket ids of peers already in the room when we joined (from room-users).
   * Mesh uses this to send WebRTC offers after ICE config is ready — the event itself
   * may have fired before the mesh hook subscribed.
   */
  joinOfferTargets: string[];
  /** Live mic/camera state of remote peers, keyed by socketId. */
  remoteMediaState: Record<string, RemoteMediaState>;
  /** Broadcast this client's mic/camera state to everyone in the room. */
  emitMediaState: (state: RemoteMediaState) => void;
  /** Live Socket.IO instance when connected — pass to useMeshWebRTC (do not create a second socket). */
  socket: Socket | null;
  socketId: string | null;
  error: string | null;
  /** Emit join-room (also runs automatically on connect / reconnect). */
  joinRoom: () => void;
  /** Graceful leave + disconnect. */
  leaveRoom: () => void;
  /** Disconnect and create a new socket (debug / recovery). */
  reconnect: () => void;
}

export function useStudySignaling({
  roomId,
  odId,
  displayName,
  enabled = true,
}: UseStudySignalingOptions): UseStudySignalingResult {
  const [status, setStatus] = useState<SignalingConnectionStatus>("idle");
  const [participants, setParticipants] = useState<SignalingParticipant[]>([]);
  const [joinOfferTargets, setJoinOfferTargets] = useState<string[]>([]);
  const [remoteMediaState, setRemoteMediaState] = useState<
    Record<string, RemoteMediaState>
  >({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Bump to tear down and recreate socket + listeners (reconnect / re-join). */
  const [sessionKey, setSessionKey] = useState(0);
  const [socketActive, setSocketActive] = useState(true);

  /** Mutable socket — survives renders without causing them */
  const socketRef = useRef<Socket | null>(null);
  const selfSocketIdRef = useRef<string | null>(null);
  /** Last broadcast mic/camera state — re-sent on reconnect / when peers join. */
  const lastMediaStateRef = useRef<RemoteMediaState>({
    micEnabled: true,
    cameraEnabled: true,
  });

  const roomIdRef = useRef(roomId);
  const odIdRef = useRef(odId);
  const displayNameRef = useRef(displayName);
  roomIdRef.current = roomId;
  odIdRef.current = odId;
  displayNameRef.current = displayName;

  const normalizedRoomId = normalizeRoomId(roomId);

  const buildSelfParticipant = useCallback((): SignalingParticipant | null => {
    const sid = selfSocketIdRef.current;
    if (!sid) return null;
    return {
      socketId: sid,
      odId: odIdRef.current,
      displayName: displayNameRef.current.trim() || "Student",
      isSelf: true,
    };
  }, []);

  const emitJoin = useCallback((socket: Socket) => {
    const rid = normalizeRoomId(roomIdRef.current);
    if (rid.length < 4) return;
    socket.emit(SignalingEvents.JOIN_ROOM, {
      roomId: rid,
      odId: odIdRef.current,
      displayName: displayNameRef.current.trim() || "Student",
    });
  }, []);

  const teardownSocket = useCallback((socket: Socket | null) => {
    if (!socket) return;
    const rid = normalizeRoomId(roomIdRef.current);
    if (rid.length >= 4 && socket.connected) {
      socket.emit(SignalingEvents.LEAVE_ROOM, { roomId: rid });
    }
    socket.removeAllListeners();
    socket.disconnect();
  }, []);

  const joinRoom = useCallback(() => {
    setSocketActive(true);
    setSessionKey((k) => k + 1);
  }, []);

  const leaveRoom = useCallback(() => {
    setSocketActive(false);
    teardownSocket(socketRef.current);
    socketRef.current = null;
    selfSocketIdRef.current = null;
    setSocket(null);
    setSocketId(null);
    setParticipants([]);
    setJoinOfferTargets([]);
    setRemoteMediaState({});
    setStatus("disconnected");
  }, [teardownSocket]);

  const reconnect = useCallback(() => {
    setSocketActive(true);
    setSessionKey((k) => k + 1);
  }, []);

  const emitMediaState = useCallback((state: RemoteMediaState) => {
    lastMediaStateRef.current = state;
    const socket = socketRef.current;
    const rid = normalizeRoomId(roomIdRef.current);
    if (!socket?.connected || rid.length < 4) return;
    socket.emit(SignalingEvents.MEDIA_STATE, {
      roomId: rid,
      micEnabled: state.micEnabled,
      cameraEnabled: state.cameraEnabled,
    });
  }, []);

  useEffect(() => {
    if (
      !enabled ||
      !socketActive ||
      !normalizedRoomId ||
      normalizedRoomId.length < 4 ||
      !odId.trim()
    ) {
      if (!socketActive) {
        setStatus("disconnected");
      } else {
        setStatus("idle");
      }
      return;
    }

    setStatus("connecting");
    setError(null);
    setParticipants([]);
    setJoinOfferTargets([]);
    setRemoteMediaState({});

    const socket = createSignalingSocket();
    socketRef.current = socket;

    const applySelfAndOthers = (others: SignalingParticipant[]) => {
      const self = buildSelfParticipant();
      const merged = [...others.map((u) => ({ ...u, isSelf: u.socketId === selfSocketIdRef.current }))];
      if (self && !merged.some((p) => p.socketId === self.socketId)) {
        merged.unshift(self);
      }
      setParticipants(merged);
    };

    const onConnect = () => {
      selfSocketIdRef.current = socket.id ?? null;
      setSocket(socket);
      setSocketId(socket.id ?? null);
      setStatus("connected");
      setError(null);
      emitJoin(socket);
    };

    const onConnectError = (err: Error) => {
      setStatus("error");
      setError(err.message || "Connection failed");
    };

    const onDisconnect = (reason: string) => {
      setStatus("disconnected");
      if (reason === "io server disconnect") {
        setError("Disconnected by server");
      }
    };

    const onRoomUsers = (payload: RoomUsersPayload) => {
      if (normalizeRoomId(payload.roomId) !== normalizedRoomId) return;
      setStatus("joined");
      setJoinOfferTargets(payload.users.map((u) => u.socketId));
      const others: SignalingParticipant[] = payload.users.map((u) => ({
        socketId: u.socketId,
        odId: u.odId,
        displayName: u.displayName,
        isSelf: false,
      }));
      applySelfAndOthers(others);
    };

    const onUserJoined = (payload: UserJoinedPayload) => {
      if (normalizeRoomId(payload.roomId) !== normalizedRoomId) return;
      setParticipants((prev) =>
        upsertParticipant(prev, payload.user, selfSocketIdRef.current)
      );
      setStatus("joined");
      // Re-broadcast our current mic/camera state so the newcomer sees it.
      const rid = normalizeRoomId(roomIdRef.current);
      if (socket.connected && rid.length >= 4) {
        socket.emit(SignalingEvents.MEDIA_STATE, {
          roomId: rid,
          micEnabled: lastMediaStateRef.current.micEnabled,
          cameraEnabled: lastMediaStateRef.current.cameraEnabled,
        });
      }
    };

    const onUserLeft = (payload: UserLeftPayload) => {
      if (normalizeRoomId(payload.roomId) !== normalizedRoomId) return;
      setParticipants((prev) => removeBySocketId(prev, payload.socketId));
      setRemoteMediaState((prev) => {
        if (!(payload.socketId in prev)) return prev;
        const next = { ...prev };
        delete next[payload.socketId];
        return next;
      });
    };

    const onMediaState = (payload: MediaStatePayload) => {
      if (normalizeRoomId(payload.roomId) !== normalizedRoomId) return;
      if (payload.fromSocketId === selfSocketIdRef.current) return;
      setRemoteMediaState((prev) => ({
        ...prev,
        [payload.fromSocketId]: {
          micEnabled: payload.micEnabled !== false,
          cameraEnabled: payload.cameraEnabled !== false,
        },
      }));
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on(SignalingEvents.ROOM_USERS, onRoomUsers);
    socket.on(SignalingEvents.USER_JOINED, onUserJoined);
    socket.on(SignalingEvents.USER_LEFT, onUserLeft);
    socket.on(SignalingEvents.MEDIA_STATE, onMediaState);

    return () => {
      teardownSocket(socket);
      socketRef.current = null;
      selfSocketIdRef.current = null;
      setSocket(null);
      setSocketId(null);
      setParticipants([]);
      setJoinOfferTargets([]);
      setRemoteMediaState({});
      setStatus("idle");
    };
  }, [
    enabled,
    socketActive,
    sessionKey,
    normalizedRoomId,
    odId,
    emitJoin,
    teardownSocket,
    buildSelfParticipant,
  ]);

  return {
    status,
    participants,
    joinOfferTargets,
    remoteMediaState,
    emitMediaState,
    socket,
    socketId,
    error,
    joinRoom,
    leaveRoom,
    reconnect,
  };
}
