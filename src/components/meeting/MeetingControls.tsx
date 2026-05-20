/**
 * Bottom control bar — Google Meet style (mic, camera, leave, placeholders).
 */

import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingControlsProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  isScreenSharing?: boolean;
  isScreenShareLoading?: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
  onToggleParticipants?: () => void;
  participantsOpen?: boolean;
  disabled?: boolean;
}

function ControlButton({
  onClick,
  active,
  destructive,
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  destructive?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex flex-col items-center justify-center gap-1 min-w-[56px] sm:min-w-[72px] py-2 px-2 rounded-full transition-colors",
        destructive
          ? "bg-red-600 hover:bg-red-700 text-white"
          : active
            ? "bg-[#3c4043] hover:bg-[#5f6368] text-white"
            : "bg-[#3c4043] hover:bg-[#5f6368] text-white",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {children}
      <span className="text-[10px] hidden sm:block text-[#e8eaed]">{label}</span>
    </button>
  );
}

export function MeetingControls({
  micEnabled,
  cameraEnabled,
  isScreenSharing = false,
  isScreenShareLoading = false,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onLeave,
  onToggleParticipants,
  participantsOpen,
  disabled,
}: MeetingControlsProps) {
  return (
    <footer className="shrink-0 flex items-center justify-center gap-2 sm:gap-4 px-4 py-3 bg-[#202124] border-t border-[#3c4043]">
      <ControlButton
        label={micEnabled ? "Mute" : "Unmute"}
        onClick={onToggleMic}
        active={!micEnabled}
        disabled={disabled}
      >
        {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-400" />}
      </ControlButton>

      <ControlButton
        label={cameraEnabled ? "Stop video" : "Start video"}
        onClick={onToggleCamera}
        active={!cameraEnabled}
        disabled={disabled}
      >
        {cameraEnabled ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5 text-red-400" />
        )}
      </ControlButton>

      <ControlButton
        label={isScreenSharing ? "Stop presenting" : "Present screen"}
        onClick={onToggleScreenShare}
        active={isScreenSharing}
        disabled={disabled || isScreenShareLoading}
      >
        {isScreenShareLoading ? (
          <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <MonitorUp className={cn("h-5 w-5", isScreenSharing && "text-[#8ab4f8]")} />
        )}
      </ControlButton>

      <ControlButton
        label="Leave"
        onClick={onLeave}
        destructive
      >
        <PhoneOff className="h-5 w-5" />
      </ControlButton>

      <div className="w-px h-10 bg-[#3c4043] mx-1 hidden sm:block" />

      <ControlButton
        label="Participants"
        onClick={onToggleParticipants ?? (() => {})}
        active={participantsOpen}
      >
        <Users className="h-5 w-5" />
      </ControlButton>

      <ControlButton label="Chat" onClick={() => {}} disabled>
        <MessageSquare className="h-5 w-5 opacity-50" />
      </ControlButton>
    </footer>
  );
}
