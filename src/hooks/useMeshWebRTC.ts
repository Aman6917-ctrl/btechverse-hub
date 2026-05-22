/**
 * Multi-user mesh WebRTC — one RTCPeerConnection per remote participant.
 *
 * Topology: each pair (A,B) has a dedicated PC. N users → up to N×(N-1) PCs across
 * the room (each client holds N-1 PCs). Signaling relays SDP/ICE per targetSocketId.
 *
 * Negotiation rule (avoids offer glare):
 *   - Joiner who receives room-users with existing peers → creates offer to EACH
 *   - Peers already in room on user-joined → only answer incoming offers
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  SignalingEvents,
  type RoomUsersPayload,
  type SignalingParticipant,
  type UserLeftPayload,
  type WebRTCSignalPayload,
} from "@/lib/signaling/types";
import {
  getIceDiagnostics,
  getIceDisconnectGraceMs,
  getIceRestartMaxAttempts,
  getRtcConfiguration,
  resolveRtcConfiguration,
  runIceConnectivityTest,
  setIceConnectivityResult,
  type IceDiagnostics,
} from "@/lib/webrtc/config";
import {
  detectTransportMode,
  formatCandidateForLog,
  hasRelayCandidate,
  qualityFromIceState,
  type PeerConnectionQuality,
  type PeerTransportMode,
} from "@/lib/webrtc/ice-utils";
import { isScreenShareTrack } from "@/lib/webrtc/screen-share";
import { webrtcError, webrtcLog, webrtcWarn } from "@/lib/webrtc/logger";
import { WebRTCEvents } from "@/lib/webrtc/types";

interface PeerMeta {
  odId: string;
  displayName: string;
  isPresenting: boolean;
  iceConnectionState: RTCIceConnectionState;
  connectionState: RTCPeerConnectionState;
  transport: PeerTransportMode;
  quality: PeerConnectionQuality;
  iceRestartAttempts: number;
}

function createPeerMeta(
  partial: Partial<PeerMeta> & Pick<PeerMeta, "odId" | "displayName">
): PeerMeta {
  return {
    isPresenting: false,
    iceConnectionState: "new",
    connectionState: "new",
    transport: "unknown",
    quality: "connecting",
    iceRestartAttempts: 0,
    ...partial,
  };
}

function normalizeRoomId(roomId: string): string {
  return roomId.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export type MeshConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed";

export interface RemotePeerStream {
  socketId: string;
  odId: string;
  displayName: string;
  stream: MediaStream;
  isPresenting: boolean;
  quality: PeerConnectionQuality;
  transport: PeerTransportMode;
  iceConnectionState: RTCIceConnectionState;
}

export interface UseMeshWebRTCOptions {
  socket: Socket | null;
  roomId: string;
  localSocketId: string | null;
  localStream: MediaStream | null;
  participants: SignalingParticipant[];
  enabled?: boolean;
}

export interface UseMeshWebRTCResult {
  status: MeshConnectionStatus;
  remotePeers: RemotePeerStream[];
  error: string | null;
  logs: string[];
  /** socketId of remote peer currently screen sharing, if any */
  presentingPeerId: string | null;
  /**
   * Swap outgoing video on every RTCRtpSender (mesh) — used for screen share.
   * Does NOT create new RTCPeerConnections or renegotiate SDP.
   */
  replaceOutgoingVideoTrack: (track: MediaStreamTrack | null) => Promise<void>;
  teardownAll: () => void;
  iceDiagnostics: IceDiagnostics;
}

export function useMeshWebRTC({
  socket,
  roomId,
  localSocketId,
  localStream,
  participants,
  enabled = true,
}: UseMeshWebRTCOptions): UseMeshWebRTCResult {
  const [status, setStatus] = useState<MeshConnectionStatus>("idle");
  const [remotePeers, setRemotePeers] = useState<RemotePeerStream[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  /** One PC per remote socket — core of mesh architecture */
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const remoteStreamsRef = useRef(new Map<string, MediaStream>());
  const pendingIceRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const pendingOffersRef = useRef(new Map<string, WebRTCSignalPayload>());
  const metaRef = useRef(new Map<string, PeerMeta>());
  const makingOfferRef = useRef(new Set<string>());
  const disconnectTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const iceRestartMaxRef = useRef(getIceRestartMaxAttempts());
  const iceGraceMsRef = useRef(getIceDisconnectGraceMs());
  const rtcConfigRef = useRef(getRtcConfiguration());
  const [iceReady, setIceReady] = useState(false);
  const [iceDiagnostics, setIceDiagnostics] = useState<IceDiagnostics>(() =>
    getIceDiagnostics()
  );
  const roomIdRef = useRef(roomId);
  const localStreamRef = useRef(localStream);
  roomIdRef.current = roomId;
  localStreamRef.current = localStream;

  const pushLog = useCallback((line: string) => {
    const ts = new Date().toISOString().slice(11, 19);
    setLogs((prev) => [...prev.slice(-50), `${ts} ${line}`]);
    webrtcLog(`[mesh] ${line}`);
  }, []);

  const syncRemotePeersState = useCallback(() => {
    const list: RemotePeerStream[] = [];
    for (const [socketId, stream] of remoteStreamsRef.current.entries()) {
      const meta = metaRef.current.get(socketId);
      list.push({
        socketId,
        stream,
        odId: meta?.odId ?? "",
        displayName: meta?.displayName ?? "Participant",
        isPresenting: meta?.isPresenting ?? false,
        quality: meta?.quality ?? "connecting",
        transport: meta?.transport ?? "unknown",
        iceConnectionState: meta?.iceConnectionState ?? "new",
      });
    }
    setRemotePeers(list);

    const qualities = list.map((p) => p.quality);
    if (qualities.some((q) => q === "failed")) setStatus("failed");
    else if (qualities.some((q) => q === "reconnecting")) setStatus("reconnecting");
    else if (qualities.some((q) => q === "connecting")) setStatus("connecting");
    else if (list.length > 0) setStatus("connected");
  }, []);

  const updatePeerMeta = useCallback(
    (peerId: string, patch: Partial<PeerMeta>) => {
      const prev = metaRef.current.get(peerId);
      if (!prev) return;
      metaRef.current.set(peerId, { ...prev, ...patch });
      syncRemotePeersState();
    },
    [syncRemotePeersState]
  );

  const clearDisconnectTimer = useCallback((peerId: string) => {
    const t = disconnectTimersRef.current.get(peerId);
    if (t) {
      clearTimeout(t);
      disconnectTimersRef.current.delete(peerId);
    }
  }, []);

  const getPendingIce = (peerId: string): RTCIceCandidateInit[] => {
    let list = pendingIceRef.current.get(peerId);
    if (!list) {
      list = [];
      pendingIceRef.current.set(peerId, list);
    }
    return list;
  };

  const flushPendingIce = useCallback(
    async (peerId: string, pc: RTCPeerConnection) => {
      const pending = pendingIceRef.current.get(peerId) ?? [];
      if (pending.length === 0) return;
      pushLog(`flush ${pending.length} ICE → ${peerId.slice(0, 8)}`);
      for (const c of pending) {
        try {
          await pc.addIceCandidate(c);
        } catch (e) {
          webrtcWarn("buffered ICE failed", { peerId, error: String(e) });
        }
      }
      pendingIceRef.current.delete(peerId);
    },
    [pushLog]
  );

  const removePeer = useCallback(
    (peerId: string) => {
      clearDisconnectTimer(peerId);
      pushLog(`remove peer ${peerId.slice(0, 8)}`);
      const pc = peersRef.current.get(peerId);
      if (pc) {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onconnectionstatechange = null;
        pc.close();
        peersRef.current.delete(peerId);
      }
      const stream = remoteStreamsRef.current.get(peerId);
      if (stream) {
        for (const t of stream.getTracks()) t.stop();
        remoteStreamsRef.current.delete(peerId);
      }
      pendingIceRef.current.delete(peerId);
      pendingOffersRef.current.delete(peerId);
      metaRef.current.delete(peerId);
      makingOfferRef.current.delete(peerId);
      syncRemotePeersState();
    },
    [clearDisconnectTimer, pushLog, syncRemotePeersState]
  );

  const attemptIceRestart = useCallback(
    async (peerId: string) => {
      const pc = peersRef.current.get(peerId);
      const meta = metaRef.current.get(peerId);
      if (!pc || !socket?.connected || !meta) return;

      if (meta.iceRestartAttempts >= iceRestartMaxRef.current) {
        pushLog(`ICE restart max reached for ${peerId.slice(0, 8)}`);
        updatePeerMeta(peerId, { quality: "failed" });
        setError(
          `Could not reconnect to ${meta.displayName}. Check network or TURN settings.`
        );
        return;
      }

      meta.iceRestartAttempts += 1;
      updatePeerMeta(peerId, { quality: "reconnecting", iceRestartAttempts: meta.iceRestartAttempts });
      pushLog(`ICE restart #${meta.iceRestartAttempts} → ${peerId.slice(0, 8)}`);

      try {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        socket.emit(WebRTCEvents.OFFER, {
          roomId: normalizeRoomId(roomIdRef.current),
          targetSocketId: peerId,
          sdp: offer,
        });
      } catch (e) {
        webrtcError("ICE restart failed", e);
      }
    },
    [pushLog, socket, updatePeerMeta]
  );

  const scheduleDisconnectRecovery = useCallback(
    (peerId: string) => {
      clearDisconnectTimer(peerId);
      const timer = setTimeout(() => {
        disconnectTimersRef.current.delete(peerId);
        const pc = peersRef.current.get(peerId);
        if (!pc) return;
        const ice = pc.iceConnectionState;
        if (ice === "disconnected" || ice === "failed") {
          void attemptIceRestart(peerId);
        }
      }, iceGraceMsRef.current);
      disconnectTimersRef.current.set(peerId, timer);
    },
    [attemptIceRestart, clearDisconnectTimer]
  );

  /**
   * RTCRtpSender.replaceTrack: swaps encoded media on the existing sender.
   * Remote peer's RTCRtpReceiver continues; decoder gets new frames (screen vs camera).
   * No new offer/answer — avoids mesh renegotiation storm.
   */
  const replaceOutgoingVideoTrack = useCallback(
    async (videoTrack: MediaStreamTrack | null) => {
      const label = videoTrack
        ? isScreenShareTrack(videoTrack)
          ? "screen"
          : "camera"
        : "none";
      pushLog(`replaceOutgoingVideoTrack (${label}) on ${peersRef.current.size} PC(s)`);

      for (const [peerId, pc] of peersRef.current.entries()) {
        const senders = pc.getSenders();
        const videoSender =
          senders.find((s) => s.track?.kind === "video") ??
          senders.find((s) => !s.track);
        if (videoSender) {
          try {
            await videoSender.replaceTrack(videoTrack);
            pushLog(`replaceTrack → peer ${peerId.slice(0, 8)}`);
          } catch (e) {
            webrtcError(`replaceTrack ${peerId}`, e);
          }
        } else if (videoTrack && localStreamRef.current) {
          pc.addTrack(videoTrack, localStreamRef.current);
          pushLog(`addTrack (no sender yet) → peer ${peerId.slice(0, 8)}`);
        }
      }
    },
    [pushLog]
  );

  const teardownAll = useCallback(() => {
    pushLog("teardown all peer connections");
    for (const peerId of [...peersRef.current.keys()]) {
      removePeer(peerId);
    }
    setStatus("idle");
  }, [pushLog, removePeer]);

  const attachLocalTracks = useCallback(
    (pc: RTCPeerConnection) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      const senders = pc.getSenders();
      for (const track of stream.getTracks()) {
        const hasKind = senders.some((s) => s.track?.kind === track.kind);
        if (!hasKind) {
          pc.addTrack(track, stream);
          pushLog(`addTrack ${track.kind} to PC`);
        }
      }
    },
    [pushLog]
  );

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existing = peersRef.current.get(peerId);
      if (existing) return existing;

      if (!metaRef.current.has(peerId)) {
        metaRef.current.set(
          peerId,
          createPeerMeta({ odId: "", displayName: "Participant" })
        );
      }

      pushLog(`new RTCPeerConnection → ${peerId.slice(0, 8)}`);
      const pc = new RTCPeerConnection(rtcConfigRef.current);
      peersRef.current.set(peerId, pc);

      attachLocalTracks(pc);

      const refreshQuality = () => {
        const q = qualityFromIceState(pc.iceConnectionState, pc.connectionState);
        updatePeerMeta(peerId, {
          iceConnectionState: pc.iceConnectionState,
          connectionState: pc.connectionState,
          quality: q,
        });
      };

      pc.onconnectionstatechange = () => {
        pushLog(
          `[ice] PC[${peerId.slice(0, 8)}] connectionState=${pc.connectionState}`
        );
        refreshQuality();
        if (pc.connectionState === "failed") {
          void attemptIceRestart(peerId);
        }
      };

      pc.oniceconnectionstatechange = () => {
        const ice = pc.iceConnectionState;
        pushLog(`[ice] PC[${peerId.slice(0, 8)}] iceConnectionState=${ice}`);
        refreshQuality();

        if (ice === "connected" || ice === "completed") {
          clearDisconnectTimer(peerId);
          const m = metaRef.current.get(peerId);
          if (m) {
            m.iceRestartAttempts = 0;
            metaRef.current.set(peerId, m);
          }
          void detectTransportMode(pc).then((transport) => {
            updatePeerMeta(peerId, { transport });
          });
        } else if (ice === "disconnected") {
          updatePeerMeta(peerId, { quality: "reconnecting" });
          scheduleDisconnectRecovery(peerId);
        } else if (ice === "failed") {
          void attemptIceRestart(peerId);
        }
      };

      pc.onicegatheringstatechange = () => {
        pushLog(
          `[ice] PC[${peerId.slice(0, 8)}] gathering=${pc.iceGatheringState}`
        );
      };

      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          const relay = hasRelayCandidate(ev.candidate);
          pushLog(
            `[ice] local candidate → ${peerId.slice(0, 8)} ${formatCandidateForLog(ev.candidate)}${relay ? " ✓relay" : ""}`
          );
          if (!socket?.connected) return;
          socket.emit(WebRTCEvents.ICE, {
            roomId: normalizeRoomId(roomIdRef.current),
            targetSocketId: peerId,
            candidate: ev.candidate.toJSON(),
          });
        } else {
          pushLog(`[ice] local gathering complete → ${peerId.slice(0, 8)}`);
        }
      };

      /**
       * Each PC fires ontrack independently when that peer's media arrives.
       * We store streams in remoteStreamsRef and sync to React state for tiles.
       */
      pc.ontrack = (ev) => {
        const presenting = ev.track.kind === "video" && isScreenShareTrack(ev.track);
        pushLog(
          `ontrack from ${peerId.slice(0, 8)} kind=${ev.track.kind}${presenting ? " (screen)" : ""}`
        );

        let stream = remoteStreamsRef.current.get(peerId);
        if (!stream) {
          stream = ev.streams[0] ?? new MediaStream();
          remoteStreamsRef.current.set(peerId, stream);
        }

        if (ev.track.kind === "video") {
          for (const old of stream.getVideoTracks()) {
            if (old.id !== ev.track.id) {
              stream.removeTrack(old);
            }
          }
          if (!stream.getVideoTracks().some((t) => t.id === ev.track.id)) {
            stream.addTrack(ev.track);
          }
          const meta = metaRef.current.get(peerId);
          if (meta) {
            meta.isPresenting = presenting;
          } else {
            metaRef.current.set(
              peerId,
              createPeerMeta({
                odId: "",
                displayName: "Participant",
                isPresenting: presenting,
              })
            );
          }
        } else if (!stream.getTracks().some((t) => t.id === ev.track.id)) {
          stream.addTrack(ev.track);
        }

        syncRemotePeersState();
      };

      return pc;
    },
    [
      attachLocalTracks,
      attemptIceRestart,
      clearDisconnectTimer,
      pushLog,
      scheduleDisconnectRecovery,
      socket,
      syncRemotePeersState,
      updatePeerMeta,
    ]
  );

  const offerToPeer = useCallback(
    async (peerId: string) => {
      if (!socket?.connected || !localStreamRef.current) return;
      if (makingOfferRef.current.has(peerId)) return;
      makingOfferRef.current.add(peerId);

      try {
        const pc = createPeerConnection(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit(WebRTCEvents.OFFER, {
          roomId: normalizeRoomId(roomIdRef.current),
          targetSocketId: peerId,
          sdp: offer,
        });
        pushLog(`sent offer → ${peerId.slice(0, 8)}`);
        setStatus("connecting");
      } catch (e) {
        webrtcError(`offerToPeer ${peerId}`, e);
        makingOfferRef.current.delete(peerId);
      }
    },
    [createPeerConnection, pushLog, socket]
  );

  const handleRemoteOffer = useCallback(
    async (payload: WebRTCSignalPayload) => {
      const peerId = payload.fromSocketId;
      if (peerId === localSocketId) return;
      if (!localStreamRef.current) {
        pendingOffersRef.current.set(peerId, payload);
        pushLog(`offer queued (no local media yet) from ${peerId.slice(0, 8)}`);
        return;
      }

      try {
        const pc = createPeerConnection(peerId);
        const renegotiate = pc.signalingState !== "stable";
        if (renegotiate) {
          pushLog(`[ice] renegotiate/ICE-restart offer ← ${peerId.slice(0, 8)}`);
        }
        await pc.setRemoteDescription(payload.sdp!);
        await flushPendingIce(peerId, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.emit(WebRTCEvents.ANSWER, {
          roomId: normalizeRoomId(roomIdRef.current),
          targetSocketId: peerId,
          sdp: answer,
        });
        pushLog(`sent answer → ${peerId.slice(0, 8)}`);
      } catch (e) {
        webrtcError("handleRemoteOffer", e);
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [createPeerConnection, flushPendingIce, localSocketId, pushLog, socket]
  );

  const handleRemoteAnswer = useCallback(
    async (payload: WebRTCSignalPayload) => {
      const peerId = payload.fromSocketId;
      const pc = peersRef.current.get(peerId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(payload.sdp!);
        await flushPendingIce(peerId, pc);
        makingOfferRef.current.delete(peerId);
        pushLog(`applied answer ← ${peerId.slice(0, 8)}`);
      } catch (e) {
        webrtcError("handleRemoteAnswer", e);
      }
    },
    [flushPendingIce, pushLog]
  );

  const addIceCandidate = useCallback(
    async (peerId: string, candidate: RTCIceCandidateInit) => {
      const pc = peersRef.current.get(peerId);
      if (!pc || !pc.remoteDescription) {
        getPendingIce(peerId).push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(candidate);
        pushLog(
          `[ice] remote candidate ← ${peerId.slice(0, 8)} ${formatCandidateForLog(candidate)}`
        );
      } catch (e) {
        webrtcWarn("[ice] addIceCandidate failed", {
          peerId: peerId.slice(0, 8),
          error: String(e),
        });
      }
    },
    [pushLog]
  );

  // Resolve ICE servers (free TURN + optional Metered API) and run connectivity probe
  useEffect(() => {
    if (!enabled) {
      setIceReady(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      pushLog("[ice] resolving STUN/TURN providers…");
      try {
        const config = await resolveRtcConfiguration();
        if (cancelled) return;
        rtcConfigRef.current = config;

        const probe = await runIceConnectivityTest(config.iceServers ?? [], {
          label: "meeting-preflight",
        });
        if (cancelled) return;

        setIceConnectivityResult(probe);
        setIceDiagnostics(getIceDiagnostics(config.iceServers));
        pushLog(
          `[ice] preflight ${probe.status}: relay=${probe.relayVerified} srflx=${probe.srflxVerified} (${probe.durationMs}ms)`
        );
        if (!probe.relayVerified) {
          pushLog("[ice] no relay yet — will retry via TCP/TLS TURN or direct path");
        }
        setIceReady(true);
      } catch (e) {
        if (cancelled) return;
        webrtcWarn("[ice] async resolve failed — sync fallback", { error: String(e) });
        rtcConfigRef.current = getRtcConfiguration();
        setIceDiagnostics(getIceDiagnostics());
        setIceReady(true);
      }
    })();

    return () => {
      cancelled = true;
      setIceReady(false);
    };
  }, [enabled, pushLog]);

  // Sync participant metadata for labels
  useEffect(() => {
    for (const p of participants) {
      if (!p.isSelf) {
        const prev = metaRef.current.get(p.socketId);
        metaRef.current.set(
          p.socketId,
          createPeerMeta({
            odId: p.odId,
            displayName: p.displayName,
            isPresenting: prev?.isPresenting ?? false,
            transport: prev?.transport ?? "unknown",
            quality: prev?.quality ?? "connecting",
            iceConnectionState: prev?.iceConnectionState ?? "new",
            connectionState: prev?.connectionState ?? "new",
            iceRestartAttempts: prev?.iceRestartAttempts ?? 0,
          })
        );
      }
    }
    syncRemotePeersState();
  }, [participants, syncRemotePeersState]);

  // Add tracks to existing PCs when local stream appears + process queued offers
  useEffect(() => {
    if (!localStream) return;
    for (const pc of peersRef.current.values()) {
      attachLocalTracks(pc);
    }
    for (const [peerId, payload] of pendingOffersRef.current.entries()) {
      pendingOffersRef.current.delete(peerId);
      void handleRemoteOffer(payload);
    }
  }, [localStream, attachLocalTracks, handleRemoteOffer]);

  // Joiner: offer to everyone already in room
  useEffect(() => {
    if (!socket || !enabled || !iceReady || !localStream) return;

    const onRoomUsers = (payload: RoomUsersPayload) => {
      if (normalizeRoomId(payload.roomId) !== normalizeRoomId(roomIdRef.current)) return;
      if (payload.users.length === 0) return;
      pushLog(`room-users: offering to ${payload.users.length} peer(s)`);
      for (const u of payload.users) {
        metaRef.current.set(
          u.socketId,
          createPeerMeta({
            odId: u.odId,
            displayName: u.displayName,
          })
        );
        void offerToPeer(u.socketId);
      }
    };

    socket.on(SignalingEvents.ROOM_USERS, onRoomUsers);
    return () => socket.off(SignalingEvents.ROOM_USERS, onRoomUsers);
  }, [socket, enabled, iceReady, localStream, offerToPeer, pushLog]);

  // user-joined: existing members wait for offer from newcomer (no offer here)
  useEffect(() => {
    if (!socket || !enabled || !iceReady) return;

    const onUserJoined = () => {
      pushLog("user-joined: waiting for peer offer(s)");
    };

    socket.on(SignalingEvents.USER_JOINED, onUserJoined);
    return () => socket.off(SignalingEvents.USER_JOINED, onUserJoined);
  }, [socket, enabled, iceReady, pushLog]);

  // WebRTC signaling
  useEffect(() => {
    if (!socket || !enabled || !iceReady) return;

    const onOffer = (p: WebRTCSignalPayload) => {
      if (normalizeRoomId(p.roomId) !== normalizeRoomId(roomIdRef.current)) return;
      void handleRemoteOffer(p);
    };
    const onAnswer = (p: WebRTCSignalPayload) => {
      if (normalizeRoomId(p.roomId) !== normalizeRoomId(roomIdRef.current)) return;
      void handleRemoteAnswer(p);
    };
    const onIce = (p: WebRTCSignalPayload) => {
      if (normalizeRoomId(p.roomId) !== normalizeRoomId(roomIdRef.current)) return;
      if (!p.candidate) return;
      void addIceCandidate(p.fromSocketId, p.candidate);
    };

    socket.on(WebRTCEvents.OFFER, onOffer);
    socket.on(WebRTCEvents.ANSWER, onAnswer);
    socket.on(WebRTCEvents.ICE, onIce);

    return () => {
      socket.off(WebRTCEvents.OFFER, onOffer);
      socket.off(WebRTCEvents.ANSWER, onAnswer);
      socket.off(WebRTCEvents.ICE, onIce);
    };
  }, [socket, enabled, iceReady, handleRemoteOffer, handleRemoteAnswer, addIceCandidate]);

  // Peer left → close that PC only
  useEffect(() => {
    if (!socket || !enabled || !iceReady) return;
    const onUserLeft = (p: UserLeftPayload) => {
      removePeer(p.socketId);
    };
    socket.on(SignalingEvents.USER_LEFT, onUserLeft);
    return () => socket.off(SignalingEvents.USER_LEFT, onUserLeft);
  }, [socket, enabled, iceReady, removePeer]);

  // Socket reconnect
  useEffect(() => {
    if (!socket || !enabled || !iceReady) return;
    const onDisconnect = () => {
      setStatus("reconnecting");
      pushLog("signaling disconnected — peers may need renegotiation");
    };
    const onConnect = () => {
      pushLog("signaling reconnected — attempting ICE recovery on peers");
      setStatus("reconnecting");
      if (localStreamRef.current) {
        for (const peerId of peersRef.current.keys()) {
          void attemptIceRestart(peerId);
        }
      }
    };
    socket.on("disconnect", onDisconnect);
    socket.on("connect", onConnect);
    return () => {
      socket.off("disconnect", onDisconnect);
      socket.off("connect", onConnect);
    };
  }, [socket, enabled, iceReady, attemptIceRestart, pushLog]);

  useEffect(() => {
    return () => teardownAll();
  }, [teardownAll]);

  const presentingPeerId =
    remotePeers.find((p) => p.isPresenting)?.socketId ?? null;

  return {
    status,
    remotePeers,
    error,
    logs,
    presentingPeerId,
    replaceOutgoingVideoTrack,
    teardownAll,
    iceDiagnostics,
  };
}
