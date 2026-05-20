/**
 * Responsive Google Meet–style grid. Spotlight = presenter or dominant speaker.
 */

import { cn } from "@/lib/utils";
import { VideoTile } from "./VideoTile";
import type { RemotePeerStream } from "@/hooks/useMeshWebRTC";

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
  onPin,
}: VideoGridProps) {
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

  return (
    <div className="flex-1 flex flex-col gap-3 p-3 sm:p-4 overflow-y-auto min-h-0">
      {showSpotlight && (
        <VideoTile
          stream={spotlightIsSelf ? local.stream : spotlightRemote!.stream}
          displayName={spotlightIsSelf ? local.displayName : spotlightRemote!.displayName}
          isSelf={spotlightIsSelf}
          isPresenting={
            spotlightIsSelf ? !!local.isPresenting : spotlightRemote!.isPresenting
          }
            {...tileProps(spotlightIsSelf ? local.socketId : spotlightRemote?.socketId ?? null, spotlightIsSelf)}
            connectionQuality={spotlightRemote?.quality}
          micEnabled={spotlightIsSelf ? local.micEnabled : true}
          cameraEnabled={spotlightIsSelf ? local.cameraEnabled : true}
          isSpotlight
          onPin={() => onPin(null)}
          className="w-full max-h-[55vh] min-h-[200px]"
        />
      )}

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
            connectionQuality={peer.quality}
            onPin={() => onPin(peer.socketId)}
          />
        ))}
      </div>
    </div>
  );
}
