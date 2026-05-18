import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getJitsiRoomName } from "@/lib/study-room";

const JITSI_DOMAIN = "meet.jit.si";
const JITSI_SCRIPT = `https://${JITSI_DOMAIN}/external_api.js`;

type JitsiApi = {
  dispose: () => void;
  addEventListener: (event: string, listener: () => void) => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiApi;
  }
}

function loadJitsiScript(): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  const existing = document.querySelector(`script[src="${JITSI_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Jitsi script failed")), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = JITSI_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Jitsi script failed"));
    document.body.appendChild(script);
  });
}

export default function StudyRoomVoice() {
  const { roomId: rawRoomId } = useParams<{ roomId: string }>();
  const roomId = (rawRoomId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const leftRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backToRoom = useCallback(() => {
    if (leftRef.current || !roomId) return;
    leftRef.current = true;
    navigate(`/study/room/${roomId}`, { replace: true });
  }, [navigate, roomId]);

  useEffect(() => {
    if (!roomId) {
      setError("Invalid room");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        await loadJitsiScript();
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: getJitsiRoomName(roomId),
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          configOverwrite: {
            prejoinPageEnabled: false,
            enableClosePage: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            CLOSE_PAGE_GUEST_HINT: false,
          },
        });

        apiRef.current = api;
        api.addEventListener("readyToClose", backToRoom);
        api.addEventListener("videoConferenceLeft", backToRoom);

        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load voice room");
          setLoading(false);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [roomId, backToRoom]);

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Invalid room code.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card shrink-0 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to={`/study/room/${roomId}`}
            onClick={() => {
              leftRef.current = true;
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to room
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Voice · <span className="font-mono text-foreground">{roomId}</span>
        </span>
        <p className="text-xs text-muted-foreground ml-auto hidden sm:block">
          When you leave the call, you&apos;ll return to the study room.
        </p>
      </header>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-destructive text-sm">{error}</p>
          <Button asChild>
            <Link to={`/study/room/${roomId}`}>Back to study room</Link>
          </Button>
        </div>
      ) : (
        <div className="relative flex-1 min-h-0">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background z-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading voice room…</p>
            </div>
          )}
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        </div>
      )}
    </div>
  );
}
