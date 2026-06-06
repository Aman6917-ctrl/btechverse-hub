/**
 * Responsive Google Meet–style grid. Spotlight = presenter or dominant speaker.
 */

import { cn } from "@/lib/utils";
import { MonitorUp } from "lucide-react";
import { VideoTile } from "./VideoTile";
import type { RemotePeerStream } from "@/hooks/useMeshWebRTC";
import type { RemoteMediaState } from "@/lib/signaling/types";

export interface LocalTileData {
  stream: MediaStream | null;
  displayName: string;
  socketId: string | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  isPresenting?: boolean;
}

interface VideoGridProps {
  local: LocalTileData;
  remotes: RemotePeerStream[];
  dominantSpeakerId: string | null;
  speakingBySocketId: Record<string, boolean>;
  spotlightId: string | null;
  /** Mic/camera on-off state of remote peers, keyed by socketId. */
  remoteMediaState: Record<string, RemoteMediaState>;
  onPin: (socketId: string | null) => void;
}

function gridClass(count: number): string {
  if (count <= 1) return "grid-cols-1 max-w-3xl mx-auto";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 6) return "grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

export function VideoGrid({
  local,
  remotes,
  dominantSpeakerId,
  speakingBySocketId,
  spotlightId,
  remoteMediaState,
  onPin,
}: VideoGridProps) {
  // Remote peer is presenting → always show stream; otherwise honour their
  // signalled camera state (default true until media-state arrives).
  const remoteCameraEnabled = (peer: RemotePeerStream) =>
    peer.isPresenting || (remoteMediaState[peer.socketId]?.cameraEnabled ?? true);
  const remoteMicEnabled = (socketId: string) =>
    remoteMediaState[socketId]?.micEnabled ?? true;
  const total = 1 + remotes.length;
  const anyoneSpeaking = Object.values(speakingBySocketId).some(Boolean);

  const spotlightRemote = spotlightId
    ? remotes.find((r) => r.socketId === spotlightId)
    : null;
  const spotlightIsSelf = spotlightId === local.socketId;

  const stripRemotes = spotlightId
    ? remotes.filter((r) => r.socketId !== spotlightId)
    : remotes;

  const showSpotlight = spotlightId && (spotlightRemote || spotlightIsSelf);

  const tileProps = (socketId: string | null, isSelf: boolean) => {
    const id = socketId ?? "";
    return {
      isDominantSpeaker: !!socketId && dominantSpeakerId === socketId,
      isSpeaking: !!socketId && !!speakingBySocketId[socketId],
      isDimmed:
        anyoneSpeaking &&
        !!socketId &&
        dominantSpeakerId !== socketId &&
        !speakingBySocketId[socketId],
    };
  };

  // Showing your own screen capture back to yourself causes an infinite
  // "hall of mirrors" when the shared window contains the meeting. Remote
  // peers still see the screen; locally we show a clean placeholder instead.
  const selfPresentingSpotlight =
    showSpotlight && spotlightIsSelf && !!local.isPresenting;

  return (
    <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 overflow-y-auto min-h-0">
      {selfPresentingSpotlight ? (
        <div className="relative w-full max-h-[55vh] min-h-[200px] flex-1 rounded-xl overflow-hidden bg-[#3c4043] flex flex-col items-center justify-center gap-3 ring-2 ring-[#8ab4f8]/80">
          <div className="h-14 w-14 rounded-full bg-[#8ab4f8] flex items-center justify-center">
            <MonitorUp className="h-7 w-7 text-[#202124]" />
          </div>
          <p className="text-sm font-medium text-[#e8eaed]">
            You are presenting to everyone
          </p>
          <p className="text-xs text-[#9aa0a6] max-w-xs text-center px-4">
            Your screen is visible to others. Your own preview is hidden to avoid a mirror loop.
          </p>
        </div>
      ) : showSpotlight ? (
        <VideoTile
          stream={spotlightIsSelf ? local.stream : spotlightRemote!.stream}
          displayName={spotlightIsSelf ? local.displayName : spotlightRemote!.displayName}
          isSelf={spotlightIsSelf}
          isPresenting={
            spotlightIsSelf ? !!local.isPresenting : spotlightRemote!.isPresenting
          }
            {...tileProps(spotlightIsSelf ? local.socketId : spotlightRemote?.socketId ?? null, spotlightIsSelf)}
            connectionQuality={spotlightRemote?.quality}
          micEnabled={
            spotlightIsSelf
              ? local.micEnabled
              : spotlightRemote
                ? remoteMicEnabled(spotlightRemote.socketId)
                : true
          }
          cameraEnabled={
            spotlightIsSelf
              ? local.cameraEnabled
              : spotlightRemote
                ? remoteCameraEnabled(spotlightRemote)
                : true
          }
          isSpotlight
          onPin={() => onPin(null)}
          className="w-full max-h-[55vh] min-h-[200px]"
        />
      ) : null}

      <div className={cn("grid gap-2 sm:gap-3 w-full", gridClass(total))}>
        {!spotlightIsSelf && (
          <VideoTile
            stream={local.stream}
            displayName={local.displayName}
            isSelf
            isPresenting={local.isPresenting}
            {...tileProps(local.socketId, true)}
            micEnabled={local.micEnabled}
            cameraEnabled={local.cameraEnabled}
            onPin={local.socketId ? () => onPin(local.socketId) : undefined}
          />
        )}

        {stripRemotes.map((peer) => (
          <VideoTile
            key={peer.socketId}
            stream={peer.stream}
            displayName={peer.displayName}
            isPresenting={peer.isPresenting}
            {...tileProps(peer.socketId, false)}
            micEnabled={remoteMicEnabled(peer.socketId)}
            cameraEnabled={remoteCameraEnabled(peer)}
            connectionQuality={peer.quality}
            onPin={() => onPin(peer.socketId)}
          />
        ))}
      </div>
    </div>
  );
}
