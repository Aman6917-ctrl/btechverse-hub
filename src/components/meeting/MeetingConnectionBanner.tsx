/**
 * Top-of-meeting ICE / connection quality summary (Google Meet–style).
 */

import { Badge } from "@/components/ui/badge";
import type { IceDiagnostics } from "@/lib/webrtc/config";
import type { MeshConnectionStatus } from "@/hooks/useMeshWebRTC";
import type { PeerConnectionQuality } from "@/lib/webrtc/ice-utils";
import { AlertTriangle, Loader2, Radio, Server, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingConnectionBannerProps {
  meshStatus: MeshConnectionStatus;
  ice: IceDiagnostics;
  peerQualities: Array<{ displayName: string; quality: PeerConnectionQuality; transport: string }>;
}

function statusLabel(status: MeshConnectionStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting…";
    case "reconnecting":
      return "Reconnecting…";
    case "failed":
      return "Connection problem";
    default:
      return "Starting…";
  }
}

export function MeetingConnectionBanner({
  meshStatus,
  ice,
  peerQualities,
}: MeetingConnectionBannerProps) {
  const reconnecting = meshStatus === "reconnecting";
  const failed = meshStatus === "failed";
  const relayPeers = peerQualities.filter((p) => p.transport === "relay").length;
  const directPeers = peerQualities.filter((p) => p.transport === "direct").length;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 px-4 py-1.5 text-xs border-b",
        failed
          ? "bg-red-950/40 border-red-900/50 text-red-200"
          : reconnecting
            ? "bg-amber-950/30 border-amber-900/40 text-amber-100"
            : "bg-[#292a2d] border-[#3c4043] text-[#9aa0a6]"
      )}
    >
      {reconnecting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : failed ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Wifi className="h-3.5 w-3.5 shrink-0 text-green-500" />
      )}
      <span className="font-medium">{statusLabel(meshStatus)}</span>

      {ice.turnOnlyMode && (
        <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-200">
          TURN-only test
        </Badge>
      )}

      {!ice.turnConfigured && !ice.turnOnlyMode && (
        <span className="text-[10px] text-amber-200/80 hidden sm:inline">
          STUN-only — add free TURN via env (see docs)
        </span>
      )}

      {ice.turnConfigured && ice.connectivity?.relayVerified === false && (
        <span className="text-[10px] text-amber-200/80 hidden sm:inline">
          TURN configured — relay probe pending (TCP/TLS fallback)
        </span>
      )}

      {ice.connectivity?.relayVerified && (
        <Badge variant="outline" className="text-[10px] gap-1 border-[#8ab4f8]/40 text-[#8ab4f8]">
          TURN OK
        </Badge>
      )}

      {directPeers > 0 && (
        <Badge variant="outline" className="text-[10px] gap-1 border-green-700/50 text-green-300">
          <Radio className="h-3 w-3" />
          {directPeers} direct
        </Badge>
      )}
      {relayPeers > 0 && (
        <Badge variant="outline" className="text-[10px] gap-1 border-[#8ab4f8]/50 text-[#8ab4f8]">
          <Server className="h-3 w-3" />
          {relayPeers} relay (TURN)
        </Badge>
      )}

      {import.meta.env.DEV && (
        <span className="text-[10px] font-mono opacity-70 ml-auto hidden lg:inline">
          ICE={ice.iceTransportPolicy} · {ice.providers.join("+")} · STUN×{ice.stunCount} ·
          TURN×{ice.turnUrlCount}
          {ice.connectivity ? ` · relay=${ice.connectivity.relayVerified}` : ""}
        </span>
      )}
    </div>
  );
}
