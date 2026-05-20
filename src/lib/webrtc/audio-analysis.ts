/**
 * Web Audio utilities for active speaker detection (no external libraries).
 *
 * AudioContext: browser audio graph runtime (scheduling, resampling).
 * AnalyserNode: taps audio without playing it — exposes FFT/time samples.
 * getByteTimeDomainData: waveform samples → RMS ≈ loudness.
 */

import { webrtcLog } from "@/lib/webrtc/logger";

/** Normalized RMS above this = possible speech (tune for room noise). */
export const DEFAULT_SPEAK_THRESHOLD = 0.028;

/** Must exceed threshold this long before isSpeaking=true (reduces clicks/pops). */
export const DEFAULT_MIN_SPEAK_MS = 180;

/** Silence this long before isSpeaking=false (silence decay). */
export const DEFAULT_SILENCE_MS = 900;

/** EMA factor for level smoothing (higher = smoother, slower). */
export const DEFAULT_SMOOTHING = 0.82;

/** New dominant must be this factor louder than current (reduces flicker). */
export const DEFAULT_DOMINANT_HYSTERESIS = 1.12;

export interface SpeakerDetectionConfig {
  speakThreshold: number;
  minSpeakMs: number;
  silenceMs: number;
  smoothing: number;
  dominantHysteresis: number;
}

export const DEFAULT_SPEAKER_CONFIG: SpeakerDetectionConfig = {
  speakThreshold: DEFAULT_SPEAK_THRESHOLD,
  minSpeakMs: DEFAULT_MIN_SPEAK_MS,
  silenceMs: DEFAULT_SILENCE_MS,
  smoothing: DEFAULT_SMOOTHING,
  dominantHysteresis: DEFAULT_DOMINANT_HYSTERESIS,
};

/**
 * RMS (root mean square) of time-domain samples — energy of the waveform.
 * Prefer over raw frequency average for voice activity.
 */
export function computeRms(timeDomain: Uint8Array): number {
  if (timeDomain.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < timeDomain.length; i++) {
    const sample = (timeDomain[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.sqrt(sum / timeDomain.length);
}

export function smoothLevel(prev: number, next: number, alpha: number): number {
  return prev * alpha + next * (1 - alpha);
}

export interface ParticipantLevelState {
  smoothedLevel: number;
  isSpeaking: boolean;
  speakingSince: number | null;
  silentSince: number | null;
}

export function updateSpeakingState(
  state: ParticipantLevelState,
  rms: number,
  now: number,
  config: SpeakerDetectionConfig
): ParticipantLevelState {
  const smoothed = smoothLevel(state.smoothedLevel, rms, config.smoothing);
  const above = smoothed >= config.speakThreshold;

  let { isSpeaking, speakingSince, silentSince } = state;

  if (above) {
    silentSince = null;
    if (speakingSince === null) speakingSince = now;
    if (!isSpeaking && now - speakingSince >= config.minSpeakMs) {
      isSpeaking = true;
    }
  } else {
    speakingSince = null;
    if (silentSince === null) silentSince = now;
    if (isSpeaking && now - silentSince >= config.silenceMs) {
      isSpeaking = false;
    }
  }

  return { smoothedLevel: smoothed, isSpeaking, speakingSince, silentSince };
}

/**
 * One MediaStream → AnalyserNode probe. Never connect analyser to destination
 * (we only measure, no playback — avoids feedback).
 */
export class StreamAudioProbe {
  readonly participantId: string;
  private readonly source: MediaStreamAudioSourceNode;
  readonly analyser: AnalyserNode;
  private readonly timeData: Uint8Array;
  private disposed = false;

  constructor(audioContext: AudioContext, participantId: string, stream: MediaStream) {
    this.participantId = participantId;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.4;
    this.source = audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    this.timeData = new Uint8Array(this.analyser.fftSize);
    webrtcLog(`[speaker] probe created: ${participantId.slice(0, 8)}`);
  }

  sampleRms(): number {
    if (this.disposed) return 0;
    this.analyser.getByteTimeDomainData(this.timeData);
    return computeRms(this.timeData);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.source.disconnect();
      this.analyser.disconnect();
    } catch {
      /* already disconnected */
    }
    webrtcLog(`[speaker] probe disposed: ${this.participantId.slice(0, 8)}`);
  }
}

export function pickDominantSpeaker(
  levels: Map<string, { smoothedLevel: number; isSpeaking: boolean }>,
  currentDominant: string | null,
  hysteresis: number
): string | null {
  let bestId: string | null = null;
  let bestLevel = 0;

  for (const [id, s] of levels.entries()) {
    if (!s.isSpeaking) continue;
    if (s.smoothedLevel > bestLevel) {
      bestLevel = s.smoothedLevel;
      bestId = id;
    }
  }

  if (!bestId) return null;

  if (currentDominant && currentDominant !== bestId) {
    const current = levels.get(currentDominant);
    if (current?.isSpeaking && bestLevel < current.smoothedLevel * hysteresis) {
      return currentDominant;
    }
  }

  return bestId;
}
