/**
 * Single participant tile — local or remote MediaStream on <video>.
 * Active speaker: animated glow; subtle dim on inactive tiles when someone speaks.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { PeerConnectionQuality } from "@/lib/webrtc/ice-utils";
import { Loader2, Mic, MicOff, MonitorUp, Pin, VideoOff } from "lucide-react";

export interface VideoTileProps {
  stream: MediaStream | null;
  displayName: string;
  isSelf?: boolean;
  /** Loudest / dominant speaker (primary highlight) */
  isDominantSpeaker?: boolean;
  /** Any speech over threshold (may be multiple) */
  isSpeaking?: boolean;
  micEnabled?: boolean;
  cameraEnabled?: boolean;
  isPresenting?: boolean;
  isSpotlight?: boolean;
  /** Slightly dim when others are speaking */
  isDimmed?: boolean;
  connectionQuality?: PeerConnectionQuality;
  onPin?: () => void;
  className?: string;
}

export function VideoTile({
  stream,
  displayName,
  isSelf = false,
  isDominantSpeaker = false,
  isSpeaking = false,
  micEnabled = true,
  cameraEnabled = true,
  isPresenting = false,
  isSpotlight = false,
  isDimmed = false,
  connectionQuality,
  onPin,
  className,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
  }, [stream]);

  const videoTrack = stream?.getVideoTracks()[0];
  const showVideo =
    !!videoTrack &&
    videoTrack.enabled &&
    (isPresenting || cameraEnabled || !isSelf);

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-[#3c4043] aspect-video min-h-[120px]",
        "transition-all duration-300 ease-out",
        isDimmed && !isDominantSpeaker && !isSpeaking && "opacity-70",
        isSpeaking && !isDominantSpeaker && "ring-2 ring-[#8ab4f8]/60",
        isDominantSpeaker && "ring-2 ring-[#8ab4f8] animate-[speaker-glow_1.6s_ease-in-out_infinite]",
        isSpotlight && !isDominantSpeaker && "ring-2 ring-[#8ab4f8]/80",
        className
      )}
    >
      {connectionQuality === "reconnecting" && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-600/90 text-white text-[10px] px-2 py-0.5 rounded">
          <Loader2 className="h-3 w-3 animate-spin" />
          Reconnecting
        </div>
      )}
      {connectionQuality === "failed" && (
        <div className="absolute top-2 left-2 z-10 bg-red-600/90 text-white text-[10px] px-2 py-0.5 rounded">
          Connection failed
        </div>
      )}
      {isPresenting && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#8ab4f8] text-[#202124] text-[10px] font-semibold px-2 py-0.5 rounded">
          <MonitorUp className="h-3 w-3" />
          Presenting
        </div>
      )}
      {isSpeaking && !isPresenting && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Speaking
        </div>
      )}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf}
          className={cn(
            "w-full h-full bg-black transition-opacity duration-300",
            isPresenting ? "object-contain" : "object-cover"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#5f6368] flex items-center justify-center text-2xl font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <VideoOff className="absolute bottom-14 right-3 h-5 w-5 text-[#9aa0a6]" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-sm text-white font-medium truncate">
          {displayName}
          {isSelf ? " (You)" : ""}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {micEnabled ? (
            <Mic
              className={cn(
                "h-4 w-4",
                isSpeaking ? "text-green-400" : "text-white/90"
              )}
            />
          ) : (
            <MicOff className="h-4 w-4 text-red-400" />
          )}
          {onPin && (
            <button
              type="button"
              onClick={onPin}
              className="p-1 rounded hover:bg-white/10"
              aria-label="Pin participant"
            >
              <Pin className={cn("h-4 w-4", isSpotlight ? "text-[#8ab4f8]" : "text-white/80")} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
