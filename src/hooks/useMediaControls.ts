/**
 * Local camera/mic + screen share.
 *
 * Screen share uses getDisplayMedia → replaceTrack() on mesh senders (no new PC).
 * Camera video track is kept alive (paused) and restored when sharing stops.
 */

import { useCallback, useRef, useState } from "react";
import { webrtcError, webrtcLog } from "@/lib/webrtc/logger";

export interface UseMediaControlsOptions {
  /**
   * Called when screen share starts/stops so mesh can replaceTrack on every PC.
   * Injected from useMeshWebRTC.replaceOutgoingVideoTrack.
   */
  replaceVideoTrackOnPeers?: (track: MediaStreamTrack | null) => Promise<void>;
}

export interface UseMediaControlsResult {
  /** Stream for local <video> preview (camera+audio, or screen+audio while presenting) */
  localPreviewStream: MediaStream | null;
  /** Underlying camera/mic stream (always kept while in call) */
  cameraStream: MediaStream | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  isScreenSharing: boolean;
  isStarting: boolean;
  isScreenShareLoading: boolean;
  error: string | null;
  startMedia: () => Promise<MediaStream | null>;
  stopMedia: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

export function useMediaControls(
  options: UseMediaControlsOptions = {}
): UseMediaControlsResult {
  const replaceOnPeersRef = useRef(options.replaceVideoTrackOnPeers);
  replaceOnPeersRef.current = options.replaceVideoTrackOnPeers;
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isScreenShareLoading, setIsScreenShareLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildPreviewStream = useCallback(
    (videoTrack: MediaStreamTrack | null, audioStream: MediaStream | null) => {
      const tracks: MediaStreamTrack[] = [];
      if (videoTrack) tracks.push(videoTrack);
      if (audioStream) {
        for (const t of audioStream.getAudioTracks()) tracks.push(t);
      }
      if (tracks.length === 0) return null;
      return new MediaStream(tracks);
    },
    []
  );

  const syncPreviewFromCamera = useCallback(() => {
    const cam = cameraStreamRef.current;
    if (!cam) {
      setLocalPreviewStream(null);
      return;
    }
    const video = cam.getVideoTracks()[0] ?? null;
    cameraVideoTrackRef.current = video;
    setLocalPreviewStream(buildPreviewStream(video, cam));
  }, [buildPreviewStream]);

  const stopScreenShareInternal = useCallback(async () => {
    if (!isScreenSharing && !screenTrackRef.current) return;

    webrtcLog("stopScreenShare: restore camera track on all peers");

    const screenTrack = screenTrackRef.current;
    screenTrackRef.current = null;
    if (screenTrack) {
      screenTrack.onended = null;
      screenTrack.stop();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current = null;
    }

    const cameraVideo = cameraVideoTrackRef.current;
    if (cameraVideo) {
      cameraVideo.enabled = cameraEnabled;
    }

    try {
      await replaceOnPeersRef.current?.(cameraVideo ?? null);
    } catch (e) {
      webrtcError("replaceTrack restore camera", e);
    }

    setIsScreenSharing(false);
    syncPreviewFromCamera();
  }, [cameraEnabled, isScreenSharing, syncPreviewFromCamera]);

  const startMedia = useCallback(async () => {
    if (cameraStreamRef.current) return cameraStreamRef.current;
    setIsStarting(true);
    setError(null);
    try {
      webrtcLog("getUserMedia (mesh meeting)");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      cameraStreamRef.current = stream;
      cameraVideoTrackRef.current = stream.getVideoTracks()[0] ?? null;
      setCameraStream(stream);
      setMicEnabled(stream.getAudioTracks().every((t) => t.enabled));
      setCameraEnabled(stream.getVideoTracks().every((t) => t.enabled));
      syncPreviewFromCamera();
      webrtcLog("local stream ready", {
        tracks: stream.getTracks().map((t) => t.kind),
      });
      return stream;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      webrtcError("startMedia failed", e);
      return null;
    } finally {
      setIsStarting(false);
    }
  }, [syncPreviewFromCamera]);

  const stopMedia = useCallback(() => {
    void stopScreenShareInternal();
    const stream = cameraStreamRef.current;
    if (stream) {
      for (const t of stream.getTracks()) t.stop();
    }
    cameraStreamRef.current = null;
    cameraVideoTrackRef.current = null;
    setCameraStream(null);
    setLocalPreviewStream(null);
    webrtcLog("local media stopped");
  }, [stopScreenShareInternal]);

  const startScreenShare = useCallback(async () => {
    if (!cameraStreamRef.current) {
      setError("Start camera first before sharing screen");
      return;
    }
    if (isScreenSharing) return;

    setIsScreenShareLoading(true);
    setError(null);

    try {
      /**
       * getDisplayMedia: separate permission flow from camera.
       * User picks window/screen/tab; browser returns a display MediaStreamTrack.
       */
      webrtcLog("getDisplayMedia (screen share)");
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 15, max: 30 },
        },
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        throw new Error("No video track in display stream");
      }

      screenStreamRef.current = screenStream;
      screenTrackRef.current = screenTrack;

      const cameraVideo = cameraVideoTrackRef.current;
      if (cameraVideo) {
        cameraVideo.enabled = false;
      }

      /**
       * Browser "Stop sharing" toolbar ends the track → onended.
       * Must restore camera like an explicit stop.
       */
      screenTrack.onended = () => {
        webrtcLog("screen track onended (browser stop sharing)");
        void stopScreenShareInternal();
      };

      await replaceOnPeersRef.current?.(screenTrack);
      webrtcLog("replaceTrack(screen) on all mesh peers — no renegotiation");

      setIsScreenSharing(true);
      setLocalPreviewStream(
        buildPreviewStream(screenTrack, cameraStreamRef.current)
      );
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setError("Screen share permission denied");
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
      webrtcError("startScreenShare", e);
    } finally {
      setIsScreenShareLoading(false);
    }
  }, [
    buildPreviewStream,
    isScreenSharing,
    stopScreenShareInternal,
  ]);

  const stopScreenShare = useCallback(async () => {
    await stopScreenShareInternal();
  }, [stopScreenShareInternal]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) await stopScreenShare();
    else await startScreenShare();
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  const toggleMic = useCallback(() => {
    const stream = cameraStreamRef.current;
    if (!stream) return;
    const next = !micEnabled;
    for (const t of stream.getAudioTracks()) {
      t.enabled = next;
    }
    setMicEnabled(next);
    webrtcLog(`mic ${next ? "on" : "off"}`);
  }, [micEnabled]);

  const toggleCamera = useCallback(() => {
    if (isScreenSharing) {
      webrtcLog("toggleCamera ignored while presenting (stop screen share first)");
      return;
    }
    const stream = cameraStreamRef.current;
    if (!stream) return;
    const next = !cameraEnabled;
    for (const t of stream.getVideoTracks()) {
      t.enabled = next;
    }
    setCameraEnabled(next);
    webrtcLog(`camera ${next ? "on" : "off"}`);
  }, [cameraEnabled, isScreenSharing]);

  return {
    localPreviewStream,
    cameraStream,
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    isStarting,
    isScreenShareLoading,
    error,
    startMedia,
    stopMedia,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  };
}
