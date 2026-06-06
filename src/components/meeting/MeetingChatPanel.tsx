/**
 * In-call chat panel — shares the same Firestore message subcollection as the
 * study room session page, so messages stay in sync across both views.
 */

import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/integrations/firebase/config";
import {
  STUDY_MESSAGES_SUBCOLLECTION,
  STUDY_ROOMS_COLLECTION,
} from "@/lib/study-room";
import { cn } from "@/lib/utils";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMsg {
  id: string;
  text: string;
  displayName: string;
  uid: string;
  createdAt: Timestamp | null;
}

interface MeetingChatPanelProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  uid: string | null;
  displayName: string;
}

export function MeetingChatPanel({
  open,
  onClose,
  roomId,
  uid,
  displayName,
}: MeetingChatPanelProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;
    const db = getFirestoreDb();
    const q = query(
      collection(db, STUDY_ROOMS_COLLECTION, roomId, STUDY_MESSAGES_SUBCOLLECTION),
      orderBy("createdAt", "asc"),
      limit(100)
    );
    return onSnapshot(q, (snap) => {
      const list: ChatMsg[] = [];
      snap.forEach((d) => {
        const x = d.data() as {
          text?: string;
          displayName?: string;
          uid?: string;
          createdAt?: Timestamp | null;
        };
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
  }, [roomId]);

  useEffect(() => {
    if (open) messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !uid || !roomId || sending) return;
    if (text.length > 800) return;
    setSending(true);
    setInput("");
    try {
      const db = getFirestoreDb();
      await addDoc(
        collection(db, STUDY_ROOMS_COLLECTION, roomId, STUDY_MESSAGES_SUBCOLLECTION),
        {
          text,
          uid,
          displayName: displayName.trim() || "Student",
          createdAt: serverTimestamp(),
        }
      );
    } catch {
      // keep the typed text so the user can retry
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <aside
      className={cn(
        "absolute top-0 right-0 h-full w-full sm:w-80 bg-[#292a2d] border-l border-[#3c4043] z-20 flex flex-col shadow-xl",
        "animate-in slide-in-from-right duration-200"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c4043]">
        <h2 className="text-sm font-semibold text-[#e8eaed]">In-call messages</h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#e8eaed] hover:bg-[#3c4043]"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-[#9aa0a6] text-center py-8">
            No messages yet — say hi.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span
                className={cn(
                  "font-semibold",
                  m.uid === uid ? "text-[#8ab4f8]" : "text-[#e8eaed]"
                )}
              >
                {m.uid === uid ? "You" : m.displayName}
              </span>
              <span className="text-[#9aa0a6] ml-2 text-[10px]">
                {m.createdAt
                  ? m.createdAt
                      .toDate()
                      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </span>
              <p className="text-[#e8eaed] mt-0.5 whitespace-pre-wrap break-words">
                {m.text}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEnd} />
      </div>

      <form
        className="p-3 border-t border-[#3c4043] flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={uid ? "Type a message…" : "Sign in to chat"}
          maxLength={800}
          disabled={sending || !uid}
          className="bg-[#202124] border-[#3c4043] text-[#e8eaed] placeholder:text-[#9aa0a6]"
        />
        <Button type="submit" size="icon" disabled={sending || !input.trim() || !uid}>
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </aside>
  );
}
