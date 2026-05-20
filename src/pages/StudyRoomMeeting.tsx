/**
 * Custom Google Meet–style study room video (mesh WebRTC + Socket.IO).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, MonitorUp, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useStudySignaling } from "@/hooks/useStudySignaling";
import { useMediaControls } from "@/hooks/useMediaControls";
import { useMeshWebRTC } from "@/hooks/useMeshWebRTC";
import { useActiveSpeakerDetection } from "@/hooks/useActiveSpeakerDetection";
import { VideoGrid } from "@/components/meeting/VideoGrid";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { ParticipantSidebar } from "@/components/meeting/ParticipantSidebar";
import { MeetingConnectionBanner } from "@/components/meeting/MeetingConnectionBanner";
import { getFirestoreDb } from "@/integrations/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { STUDY_ROOMS_COLLECTION } from "@/lib/study-room";

export default function StudyRoomMeeting() {
  const { roomId: rawRoomId } = useParams<{ roomId: string }>();
  const roomId = (rawRoomId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [roomTitle, setRoomTitle] = useState("Study session");
  const [roomLoading, setRoomLoading] = useState(true);
  const [manualPinId, setManualPinId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mediaStarted, setMediaStarted] = useState(false);

  const replaceVideoRef = useRef<
    ((track: MediaStreamTrack | null) => Promise<void>) | undefined
  >(undefined);

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "Student";

  const signaling = useStudySignaling({
    roomId,
    odId: user?.uid ?? "",
    displayName,
    enabled: !authLoading && !!roomId && !!user?.uid,
  });

  const media = useMediaControls({
    replaceVideoTrackOnPeers: (track) =>
      replaceVideoRef.current?.(track) ?? Promise.resolve(),
  });

  const mesh = useMeshWebRTC({
    socket: signaling.socket,
    roomId,
    localSocketId: signaling.socketId,
    localStream: media.cameraStream,
    participants: signaling.participants,
    enabled:
      mediaStarted &&
      !!media.cameraStream &&
      signaling.status === "joined" &&
      !!signaling.socket,
  });

  useEffect(() => {
    replaceVideoRef.current = mesh.replaceOutgoingVideoTrack;
  }, [mesh.replaceOutgoingVideoTrack]);

  const presenterSpotlightId =
    media.isScreenSharing && signaling.socketId
      ? signaling.socketId
      : mesh.presentingPeerId;

  const speakers = useActiveSpeakerDetection({
    enabled:
      mediaStarted &&
      !!media.cameraStream &&
      signaling.status === "joined",
    localSocketId: signaling.socketId,
    localAudioStream: media.cameraStream,
    remotePeers: mesh.remotePeers,
    micEnabled: media.micEnabled,
    presenterSpotlightId,
  });

  /** Screen share wins; else manual pin; else dominant speaker spotlight */
  const spotlightId =
    presenterSpotlightId ??
    manualPinId ??
    speakers.suggestedSpotlightId;

  useEffect(() => {
    if (!roomId) {
      setRoomLoading(false);
      return;
    }
    const db = getFirestoreDb();
    getDoc(doc(db, STUDY_ROOMS_COLLECTION, roomId)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data() as { topic?: string };
        setRoomTitle(d.topic || "Study session");
      }
      setRoomLoading(false);
    });
  }, [roomId]);

  useEffect(() => {
    if (mediaStarted || signaling.status !== "joined" || !signaling.socket) return;
    void (async () => {
      const stream = await media.startMedia();
      if (stream) setMediaStarted(true);
    })();
  }, [signaling.status, signaling.socket, mediaStarted, media]);

  const leaveMeeting = useCallback(() => {
    void media.stopScreenShare();
    mesh.teardownAll();
    media.stopMedia();
    signaling.leaveRoom();
    navigate(`/study/room/${roomId}`, { replace: true });
  }, [mesh, media, signaling, navigate, roomId]);

  const participantCount = signaling.participants.length;
  const connectionLabel =
    signaling.status === "joined"
      ? mesh.status === "connected"
        ? "Connected"
        : mesh.status === "connecting"
          ? "Connecting peers…"
          : mesh.status === "reconnecting"
            ? "Reconnecting…"
            : "In room"
      : signaling.status;

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#202124] text-[#e8eaed]">
        Invalid room code.
      </div>
    );
  }

  if (authLoading || roomLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#202124]">
        <Loader2 className="h-10 w-10 animate-spin text-[#8ab4f8]" />
        <p className="text-sm text-[#9aa0a6]">Joining meeting…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#202124] p-4">
        <p className="text-[#e8eaed]">Sign in to join the video call.</p>
        <Button asChild>
          <Link to={`/auth?redirect=${encodeURIComponent(`/study/room/${roomId}/meeting`)}`}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#202124] text-[#e8eaed] relative overflow-hidden">
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[#3c4043] z-10">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base font-medium truncate">{roomTitle}</h1>
          <p className="text-xs text-[#9aa0a6] font-mono">{roomId}</p>
        </div>
        {media.isScreenSharing && (
          <Badge className="bg-[#8ab4f8] text-[#202124] shrink-0">
            <MonitorUp className="h-3 w-3 mr-1" />
            You are presenting
          </Badge>
        )}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#9aa0a6]">
          {signaling.status === "joined" ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-amber-500" />
          )}
          <span>{participantCount} in call</span>
          <span className="hidden sm:inline">· {connectionLabel}</span>
        </div>
      </header>

      <MeetingConnectionBanner
        meshStatus={mesh.status}
        ice={mesh.iceDiagnostics}
        peerQualities={mesh.remotePeers.map((p) => ({
          displayName: p.displayName,
          quality: p.quality,
          transport: p.transport,
        }))}
      />

      <div className="flex-1 flex min-h-0 relative">
        {media.isStarting || !media.localPreviewStream ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#8ab4f8]" />
            <p className="text-sm text-[#9aa0a6]">Starting camera and microphone…</p>
            {media.error && (
              <p className="text-sm text-red-400 max-w-md text-center">{media.error}</p>
            )}
          </div>
        ) : (
          <VideoGrid
            local={{
              stream: media.localPreviewStream,
              displayName,
              socketId: signaling.socketId,
              micEnabled: media.micEnabled,
              cameraEnabled: media.cameraEnabled,
              isPresenting: media.isScreenSharing,
            }}
            remotes={mesh.remotePeers}
            dominantSpeakerId={speakers.dominantSpeakerId}
            speakingBySocketId={speakers.speakingBySocketId}
            spotlightId={spotlightId}
            onPin={setManualPinId}
          />
        )}

        <ParticipantSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          participants={signaling.participants}
          connectionStatus={connectionLabel}
          dominantSpeakerId={speakers.dominantSpeakerId}
          speakingBySocketId={speakers.speakingBySocketId}
          remotePeers={mesh.remotePeers}
        />
      </div>

      {(mesh.error || signaling.error || media.error) && (
        <p className="text-center text-xs text-red-400 px-4 py-1 shrink-0" role="alert">
          {mesh.error || signaling.error || media.error}
        </p>
      )}

      <MeetingControls
        micEnabled={media.micEnabled}
        cameraEnabled={media.cameraEnabled}
        isScreenSharing={media.isScreenSharing}
        isScreenShareLoading={media.isScreenShareLoading}
        onToggleMic={media.toggleMic}
        onToggleCamera={media.toggleCamera}
        onToggleScreenShare={() => void media.toggleScreenShare()}
        onLeave={leaveMeeting}
        onToggleParticipants={() => setSidebarOpen((o) => !o)}
        participantsOpen={sidebarOpen}
        disabled={!media.cameraStream}
      />
    </div>
  );
}
