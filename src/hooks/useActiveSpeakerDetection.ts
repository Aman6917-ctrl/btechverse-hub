/**
 * Active speaker detection — Web Audio API + requestAnimationFrame loop.
 *
 * Separated from UI and from useMeshWebRTC so components stay light.
 * Analyser refs live here; teardown on peer leave prevents AudioNode leaks.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { RemotePeerStream } from "@/hooks/useMeshWebRTC";
import {
  DEFAULT_SPEAKER_CONFIG,
  pickDominantSpeaker,
  StreamAudioProbe,
  type ParticipantLevelState,
  type SpeakerDetectionConfig,
  updateSpeakingState,
} from "@/lib/webrtc/audio-analysis";
import { webrtcLog } from "@/lib/webrtc/logger";

const LOCAL_PROBE_ID = "__local__";

export interface UseActiveSpeakerDetectionOptions {
  enabled?: boolean;
  localSocketId: string | null;
  /** Camera stream (mic audio) — not screen-only preview */
  localAudioStream: MediaStream | null;
  remotePeers: RemotePeerStream[];
  micEnabled?: boolean;
  /** When set, auto-spotlight stays on presenter (screen share priority) */
  presenterSpotlightId: string | null;
  config?: Partial<SpeakerDetectionConfig>;
  debug?: boolean;
}

export interface UseActiveSpeakerDetectionResult {
  /** Loudest current speaker (smoothed, with hysteresis) — primary highlight */
  dominantSpeakerId: string | null;
  /** All participants currently over speaking threshold */
  speakingBySocketId: Record<string, boolean>;
  /** Normalized 0–1 levels for UI/debug */
  levelsBySocketId: Record<string, number>;
  /** Spotlight suggestion: null if presenter takes priority */
  suggestedSpotlightId: string | null;
}

function emptySpeakingMap(): Record<string, boolean> {
  return {};
}

export function useActiveSpeakerDetection({
  enabled = true,
  localSocketId,
  localAudioStream,
  remotePeers,
  micEnabled = true,
  presenterSpotlightId,
  config: configPartial,
  debug = import.meta.env.DEV,
}: UseActiveSpeakerDetectionOptions): UseActiveSpeakerDetectionResult {
  const configRef = useRef<SpeakerDetectionConfig>({
    ...DEFAULT_SPEAKER_CONFIG,
    ...configPartial,
  });
  configRef.current = {
    ...DEFAULT_SPEAKER_CONFIG,
    ...configPartial,
  };

  const [dominantSpeakerId, setDominantSpeakerId] = useState<string | null>(null);
  const [speakingBySocketId, setSpeakingBySocketId] = useState<Record<string, boolean>>(
    emptySpeakingMap
  );
  const [levelsBySocketId, setLevelsBySocketId] = useState<Record<string, number>>({});

  const audioContextRef = useRef<AudioContext | null>(null);
  const probesRef = useRef(new Map<string, StreamAudioProbe>());
  const levelStateRef = useRef(new Map<string, ParticipantLevelState>());
  const dominantRef = useRef<string | null>(null);
  const rafRef = useRef(0);
  const lastDebugLogRef = useRef(0);

  const disposeProbe = useCallback((id: string) => {
    const probe = probesRef.current.get(id);
    if (probe) {
      probe.dispose();
      probesRef.current.delete(id);
    }
    levelStateRef.current.delete(id);
  }, []);

  const disposeAll = useCallback(() => {
    for (const id of [...probesRef.current.keys()]) {
      disposeProbe(id);
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    dominantRef.current = null;
  }, [disposeProbe]);

  const syncProbes = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const wanted = new Set<string>();

    if (localAudioStream && localSocketId && micEnabled) {
      wanted.add(LOCAL_PROBE_ID);
      if (!probesRef.current.has(LOCAL_PROBE_ID)) {
        const audioTracks = localAudioStream.getAudioTracks().filter((t) => t.enabled);
        if (audioTracks.length > 0) {
          const ms = new MediaStream(audioTracks);
          probesRef.current.set(
            LOCAL_PROBE_ID,
            new StreamAudioProbe(ctx, LOCAL_PROBE_ID, ms)
          );
          levelStateRef.current.set(LOCAL_PROBE_ID, {
            smoothedLevel: 0,
            isSpeaking: false,
            speakingSince: null,
            silentSince: null,
          });
        }
      }
    } else {
      disposeProbe(LOCAL_PROBE_ID);
    }

    for (const peer of remotePeers) {
      wanted.add(peer.socketId);
      if (probesRef.current.has(peer.socketId)) continue;
      const audioTracks = peer.stream.getAudioTracks().filter((t) => t.enabled);
      if (audioTracks.length === 0) continue;
      const ms = new MediaStream(audioTracks);
      probesRef.current.set(
        peer.socketId,
        new StreamAudioProbe(ctx, peer.socketId, ms)
      );
      levelStateRef.current.set(peer.socketId, {
        smoothedLevel: 0,
        isSpeaking: false,
        speakingSince: null,
        silentSince: null,
      });
    }

    for (const id of [...probesRef.current.keys()]) {
      if (!wanted.has(id)) disposeProbe(id);
    }
  }, [localAudioStream, localSocketId, micEnabled, remotePeers, disposeProbe]);

  useEffect(() => {
    if (!enabled) {
      disposeAll();
      setDominantSpeakerId(null);
      setSpeakingBySocketId(emptySpeakingMap());
      setLevelsBySocketId({});
      return;
    }

    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    void ctx.resume().then(() => {
      webrtcLog("[speaker] AudioContext resumed");
    });

    syncProbes();

    const tick = () => {
      const now = performance.now();
      const speaking: Record<string, boolean> = {};
      const levels: Record<string, number> = {};
      const forDominant = new Map<string, { smoothedLevel: number; isSpeaking: boolean }>();

      for (const [probeId, probe] of probesRef.current.entries()) {
        const rms = probe.sampleRms();
        const prev = levelStateRef.current.get(probeId) ?? {
          smoothedLevel: 0,
          isSpeaking: false,
          speakingSince: null,
          silentSince: null,
        };
        const next = updateSpeakingState(prev, rms, now, configRef.current);
        levelStateRef.current.set(probeId, next);

        const socketId =
          probeId === LOCAL_PROBE_ID ? localSocketId : probeId;
        if (!socketId) continue;

        speaking[socketId] = next.isSpeaking;
        levels[socketId] = Math.min(1, next.smoothedLevel / 0.15);
        forDominant.set(socketId, {
          smoothedLevel: next.smoothedLevel,
          isSpeaking: next.isSpeaking,
        });
      }

      const nextDominant = pickDominantSpeaker(
        forDominant,
        dominantRef.current,
        configRef.current.dominantHysteresis
      );

      if (nextDominant !== dominantRef.current) {
        dominantRef.current = nextDominant;
        setDominantSpeakerId(nextDominant);
        if (debug && nextDominant) {
          webrtcLog("[speaker] dominant", {
            id: nextDominant.slice(0, 8),
            level: levels[nextDominant]?.toFixed(3),
          });
        }
      }

      setSpeakingBySocketId(speaking);
      setLevelsBySocketId(levels);

      if (debug && now - lastDebugLogRef.current > 2500) {
        lastDebugLogRef.current = now;
        const active = Object.entries(speaking)
          .filter(([, v]) => v)
          .map(([k]) => k.slice(0, 8));
        webrtcLog("[speaker] levels snapshot", { speaking: active, dominant: nextDominant?.slice(0, 8) });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      disposeAll();
    };
  }, [enabled, debug, disposeAll, syncProbes, localSocketId]);

  useEffect(() => {
    if (!enabled || !audioContextRef.current) return;
    syncProbes();
  }, [enabled, syncProbes, remotePeers, localAudioStream, micEnabled]);

  const suggestedSpotlightId = presenterSpotlightId
    ? null
    : dominantSpeakerId;

  return {
    dominantSpeakerId,
    speakingBySocketId,
    levelsBySocketId,
    suggestedSpotlightId,
  };
}
