/**
 * Side panel — live participant list + speaking indicators.
 */

import { SignalingParticipant } from "@/lib/signaling/types";
import type { RemotePeerStream } from "@/hooks/useMeshWebRTC";
import type { PeerConnectionQuality } from "@/lib/webrtc/ice-utils";
import { cn } from "@/lib/utils";
import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParticipantSidebarProps {
  open: boolean;
  onClose: () => void;
  participants: SignalingParticipant[];
  connectionStatus: string;
  dominantSpeakerId: string | null;
  speakingBySocketId: Record<string, boolean>;
  remotePeers?: RemotePeerStream[];
}

function qualityBadge(q: PeerConnectionQuality): string {
  switch (q) {
    case "excellent":
    case "good":
      return "Good";
    case "poor":
      return "Weak";
    case "reconnecting":
      return "Reconnecting";
    case "failed":
      return "Failed";
    default:
      return "Connecting";
  }
}

export function ParticipantSidebar({
  open,
  onClose,
  participants,
  connectionStatus,
  dominantSpeakerId,
  speakingBySocketId,
  remotePeers = [],
}: ParticipantSidebarProps) {
  if (!open) return null;

  const peerBySocket = new Map(remotePeers.map((p) => [p.socketId, p]));

  return (
    <aside
      className={cn(
        "absolute top-0 right-0 h-full w-full sm:w-80 bg-[#292a2d] border-l border-[#3c4043] z-20 flex flex-col shadow-xl",
        "animate-in slide-in-from-right duration-200"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c4043]">
        <h2 className="text-sm font-semibold text-[#e8eaed]">
          Participants ({participants.length})
        </h2>
        <Button variant="ghost" size="icon" className="text-[#e8eaed] hover:bg-[#3c4043]" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="px-4 py-2 text-xs text-[#9aa0a6]">WebRTC: {connectionStatus}</p>
      <ul className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {participants.map((p) => {
          const speaking = !!speakingBySocketId[p.socketId];
          const dominant = dominantSpeakerId === p.socketId;
          const peer = peerBySocket.get(p.socketId);
          const quality = peer?.quality ?? (p.isSelf ? "connecting" : "connecting");
          const transport = peer?.transport ?? "unknown";
          return (
            <li
              key={p.socketId}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-300",
                dominant && "bg-[#8ab4f8]/15 ring-1 ring-[#8ab4f8]/40",
                speaking && !dominant && "bg-[#3c4043]/80"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium text-white relative",
                  dominant ? "bg-[#8ab4f8] text-[#202124]" : "bg-[#5f6368]"
                )}
              >
                {p.displayName.charAt(0).toUpperCase()}
                {speaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-[#292a2d]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#e8eaed] truncate flex items-center gap-2">
                  {p.displayName}
                  {p.isSelf ? " (You)" : ""}
                  {speaking && (
                    <span className="text-[10px] text-green-400 font-medium shrink-0">Speaking</span>
                  )}
                </p>
                <p className="text-[10px] text-[#9aa0a6] flex flex-wrap gap-1.5 items-center">
                  {!p.isSelf && (
                    <>
                      <span
                        className={cn(
                          "font-medium",
                          quality === "failed" && "text-red-400",
                          quality === "reconnecting" && "text-amber-400",
                          quality === "good" && "text-green-400"
                        )}
                      >
                        {qualityBadge(quality)}
                      </span>
                      {transport !== "unknown" && (
                        <span className="font-mono opacity-80">
                          {transport === "relay" ? "TURN relay" : "Direct"}
                        </span>
                      )}
                    </>
                  )}
                  {p.isSelf && <span>Local</span>}
                </p>
              </div>
              {speaking ? (
                <Mic className="h-4 w-4 text-green-400 shrink-0" />
              ) : (
                <Mic className="h-4 w-4 text-[#5f6368] shrink-0 opacity-40" />
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
