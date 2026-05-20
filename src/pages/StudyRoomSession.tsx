import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestoreDb } from "@/integrations/firebase/config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getStudyRoomMeetingPath,
  STUDY_MESSAGES_SUBCOLLECTION,
  STUDY_ROOMS_COLLECTION,
} from "@/lib/study-room";
import {
  ArrowLeft,
  Copy,
  Loader2,
  Send,
  Timer,
  Trash2,
  Video,
} from "lucide-react";

type RoomDoc = {
  topic?: string;
  createdBy?: string;
  hostName?: string;
  timer?: {
    phase: "focus";
    startedAt: Timestamp;
    durationSec: number;
  } | null;
};

type ChatMsg = {
  id: string;
  text: string;
  displayName: string;
  uid: string;
  createdAt: Timestamp | null;
};

const FOCUS_25 = 25 * 60;

export default function StudyRoomSession() {
  const { roomId: rawRoomId } = useParams<{ roomId: string }>();
  const roomId = (rawRoomId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const db = getFirestoreDb();
  const messagesEnd = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tick, setTick] = useState(0);

  const isHost = !!(user?.uid && room?.createdBy === user.uid);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const ref = doc(db, STUDY_ROOMS_COLLECTION, roomId);
      const snap = await getDoc(ref);
      if (cancelled) return;
      if (!snap.exists()) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Room not found",
          description: "Check the code or ask your friend to create the room again.",
        });
        navigate("/study", { replace: true });
        return;
      }
      setRoom(snap.data() as RoomDoc);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, db, navigate, toast]);

  useEffect(() => {
    if (!roomId) return;
    const ref = doc(db, STUDY_ROOMS_COLLECTION, roomId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setRoom(snap.data() as RoomDoc);
    });
  }, [roomId, db]);

  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, STUDY_ROOMS_COLLECTION, roomId, STUDY_MESSAGES_SUBCOLLECTION),
      orderBy("createdAt", "asc"),
      limit(100)
    );
    return onSnapshot(q, (snap) => {
      const list: ChatMsg[] = [];
      snap.forEach((d) => {
        const x = d.data() as { text?: string; displayName?: string; uid?: string; createdAt?: Timestamp | null };
        list.push({
          id: d.id,
          text: x.text || "",
          displayName: x.displayName || "Someone",
          uid: x.uid || "",
          createdAt: x.createdAt ?? null,
        });
      });
      setMessages(list);
    });
  }, [roomId, db]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!room?.timer?.startedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [room?.timer?.startedAt]);

  const timerLabel = useMemo(() => {
    const t = room?.timer;
    if (!t?.startedAt || !t.durationSec) return null;
    const startMs = t.startedAt.toMillis();
    const endMs = startMs + t.durationSec * 1000;
    const now = Date.now();
    const left = Math.max(0, Math.floor((endMs - now) / 1000));
    if (left <= 0) return "Time's up — take a break or start again.";
    const m = Math.floor(left / 60);
    const s = left % 60;
    return `${m}:${s.toString().padStart(2, "0")} left`;
  }, [room?.timer, tick]);

  const copyCode = () => {
    void navigator.clipboard.writeText(roomId);
    toast({ title: "Copied", description: "Room code copied to clipboard." });
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/study/room/${roomId}`;
    void navigator.clipboard.writeText(link);
    toast({ title: "Link copied", description: "Invite link — dost ko bhejo." });
  };

  const joinVideoMeeting = () => {
    navigate(getStudyRoomMeetingPath(roomId));
  };

  const startFocus = async () => {
    if (!isHost || !roomId) return;
    try {
      await updateDoc(doc(db, STUDY_ROOMS_COLLECTION, roomId), {
        timer: {
          phase: "focus",
          startedAt: Timestamp.now(),
          durationSec: FOCUS_25,
        },
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Could not start timer",
        description: e instanceof Error ? e.message : "Firestore update failed.",
      });
    }
  };

  const resetTimer = async () => {
    if (!isHost || !roomId) return;
    try {
      await updateDoc(doc(db, STUDY_ROOMS_COLLECTION, roomId), { timer: null });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Could not reset",
        description: e instanceof Error ? e.message : "Firestore update failed.",
      });
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !user?.uid || !roomId || sending) return;
    if (text.length > 800) {
      toast({ variant: "destructive", title: "Too long", description: "Max 800 characters." });
      return;
    }
    setSending(true);
    setInput("");
    try {
      await addDoc(collection(db, STUDY_ROOMS_COLLECTION, roomId, STUDY_MESSAGES_SUBCOLLECTION), {
        text,
        uid: user.uid,
        displayName:
          user.displayName?.trim() ||
          user.email?.split("@")[0]?.trim() ||
          "Student",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Message failed",
        description: e instanceof Error ? e.message : "Firestore rules may block writes.",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6 pt-24 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/study">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Rooms
            </Link>
          </Button>
          <span className="text-muted-foreground">|</span>
          <span className="font-mono font-bold tracking-wider text-lg">{roomId}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyCode} aria-label="Copy code">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={copyInviteLink}>
            Copy invite link
          </Button>
        </div>

        <div className="rounded-xl border-2 border-border bg-card p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Topic</p>
          <p className="font-semibold text-foreground">{room?.topic || "Study session"}</p>
          <p className="text-xs text-muted-foreground">Host: {room?.hostName || "—"}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Timer className="h-4 w-4 text-primary" />
              Focus timer (synced)
            </div>
            <p className="text-2xl font-mono font-bold text-foreground min-h-[2rem]">
              {timerLabel ?? "Not running"}
            </p>
            {isHost ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={startFocus}>
                  Start 25 min
                </Button>
                <Button size="sm" variant="secondary" onClick={resetTimer}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Only the host can start or reset the timer.</p>
            )}
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Video className="h-4 w-4 text-accent" />
              Video call
            </div>
            <p className="text-xs text-muted-foreground">
              Built-in WebRTC meeting — camera, mic, and live participant grid on Btechverse.
            </p>
            <Button variant="secondary" className="w-full" onClick={joinVideoMeeting}>
              <Video className="h-4 w-4 mr-2" />
              Join video meeting
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-[280px] rounded-xl border-2 border-border bg-card overflow-hidden">
          <div className="px-4 py-2 border-b border-border text-sm font-semibold">Chat</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[45vh]">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No messages yet — say hi.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-semibold text-primary">{m.displayName}</span>
                  <span className="text-muted-foreground ml-2">
                    {m.createdAt ? m.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                  <p className="text-foreground mt-0.5 whitespace-pre-wrap break-words">{m.text}</p>
                </div>
              ))
            )}
            <div ref={messagesEnd} />
          </div>
          <form
            className="p-3 border-t border-border flex gap-2 bg-muted/30"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              maxLength={800}
              disabled={sending || !user}
            />
            <Button type="submit" size="icon" disabled={sending || !input.trim() || !user}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
