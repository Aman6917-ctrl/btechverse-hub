import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Bot, User, Send, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatMsg = { type: "user" | "bot"; message: string };

const NOTE_CONTEXT_SYSTEM =
  "You are an in-app study assistant. The user is viewing a PDF note right now. Help them understand it, summarize parts, or answer questions about the content. Keep answers concise and in simple language (Hinglish ok).";

export default function NoteViewPage() {
  const [searchParams] = useSearchParams();
  const rawUrl = searchParams.get("url") || "";
  const title = searchParams.get("title") || "Note";
  const subject = searchParams.get("subject") || "";

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      type: "bot",
      message: `Ye note ke saath tumhara AI assistant. "${title}"${subject ? ` (${subject})` : ""} — kuch bhi puch sakte ho.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!rawUrl) {
      setPdfError("No document URL");
      return;
    }
    let cancelled = false;
    setPdfError(null);
    fetch(`/api/presign?url=${encodeURIComponent(rawUrl)}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (cancelled) return;
        if (data.url) setPdfUrl(data.url);
        else setPdfError(data.error || "Could not load PDF");
      })
      .catch(() => {
        if (!cancelled) setPdfError("Failed to load document");
      });
    return () => {
      cancelled = true;
    };
  }, [rawUrl]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", message: text }]);
    setLoading(true);

    const chatHistory = messages
      .concat([{ type: "user", message: text }])
      .map((m) => ({
        role: (m.type === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.message,
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: NOTE_CONTEXT_SYSTEM },
            ...chatHistory,
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", message: `Error: ${data.error || "Could not get response"}` },
        ]);
        return;
      }
      setMessages((prev) => [...prev, { type: "bot", message: data.content ?? "No response." }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "bot", message: "Network error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/#branches">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <span className="text-sm font-medium truncate flex-1" title={title}>
          {title}
        </span>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left: PDF – zyada jagah */}
        <div className="w-[72%] min-w-0 border-r border-border flex flex-col bg-muted/20">
          {pdfError && (
            <div className="p-4 text-center text-destructive text-sm">{pdfError}</div>
          )}
          {!pdfUrl && !pdfError && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title={title}
              className="w-full h-full min-h-0 border-0"
            />
          )}
        </div>

        {/* Right: Assistant */}
        <div className="w-[28%] flex flex-col min-w-[280px] bg-muted/20 border-l border-border shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Assistant</p>
              <p className="text-xs text-muted-foreground">
                {loading ? "Replying…" : "Ask about this note"}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.type === "user" ? "justify-end" : ""}`}
              >
                {msg.type === "bot" && (
                  <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-snug">{msg.message}</p>
                </div>
                {msg.type === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-xl px-3.5 py-2.5 bg-card border border-border">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-4 border-t border-border bg-card"
          >
            <div className="flex gap-2 rounded-xl border border-input bg-background overflow-hidden focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a question…"
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 text-sm focus:outline-none placeholder:text-muted-foreground min-w-0"
              />
              <Button
                type="submit"
                disabled={loading}
                className="shrink-0 h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
