/**
 * Chat API for AI Buddy + S3 presigned URLs for View/Download.
 * Run: npm run dev:api  (port 3001)
 * Vite proxies /api/* to this server when using npm run dev.
 */
import http from "http";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env");
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch (_) {}
}

loadEnv();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const PORT = Number(process.env.CHAT_API_PORT) || 3001;

const { getPresignedUrl } = await import("./presign.mjs");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const pathname = (req.url?.split("?")[0] || "").replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  const query = Object.fromEntries(new URL(req.url || "", "http://x").searchParams);

  // GET .../presign?url=... – S3 presigned URL (Vite proxies /api to this server)
  const isPresign = req.method === "GET" && pathname.includes("presign");
  if (isPresign) {
    const rawUrl = query.url;
    if (!rawUrl) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing url query" }));
      return;
    }
    try {
      const { url } = await getPresignedUrl(rawUrl);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ url }));
    } catch (err) {
      console.error("[presign] S3 error:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message || "Failed to generate presigned URL" }));
    }
    return;
  }

  const isChat = pathname === "/api/chat" || pathname === "/chat";
  if (req.method !== "POST" || !isChat) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  if (!OPENAI_API_KEY) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "OPENAI_API_KEY not set in .env" }));
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  const messages = data.messages || [];
  let model = data.model || "gpt-3.5-turbo";

  const systemPrompt =
    "You are BTechVerse AI, a friendly study buddy for BTech students. Explain concepts in simple, casual Hinglish when appropriate. Be encouraging and clear. Keep answers concise but helpful.";

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    max_tokens: data.max_tokens ?? 800,
    temperature: data.temperature ?? 0.7,
  };

  // sk-or-* = OpenRouter key → use OpenRouter endpoint; else OpenAI
  const isOpenRouter = OPENAI_API_KEY.startsWith("sk-or-");
  if (isOpenRouter) {
    // Use free model so it works without credits (OpenRouter :free variant)
    payload.model = "google/gemini-2.0-flash-exp:free";
  }
  const chatUrl = isOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };
    if (isOpenRouter) {
      headers["Referer"] = "http://localhost:8080";
      headers["X-Title"] = "BTechVerse";
    }
    const response = await fetch(chatUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    let result = {};
    try {
      result = await response.json();
    } catch {
      result = { error: "Invalid response from AI provider" };
    }

    if (!response.ok) {
      const err =
        result?.error?.message ??
        result?.error ??
        result?.message ??
        (typeof result?.error === "string" ? result.error : null);
      let msg = err || `Request failed (${response.status})`;
      const errStr = String(msg).toLowerCase();
      const isKeyError =
        response.status === 401 ||
        errStr.includes("user not found") ||
        errStr.includes("invalid api key") ||
        errStr.includes("unauthorized");
      if (isKeyError && isOpenRouter) {
        msg =
          "API key invalid or out of credits. Get a free key at https://openrouter.ai/keys and add it to .env as OPENAI_API_KEY, then restart: npm run dev:api";
      }
      res.writeHead(response.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: typeof msg === "string" ? msg : String(msg) }));
      return;
    }

    const content = result.choices?.[0]?.message?.content ?? "Sorry, no response.";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ content, usage: result.usage }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message || "API request failed" }));
  }
});

server.listen(PORT, () => {
  console.log(`AI Buddy API running at http://localhost:${PORT}/api/chat`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Kill it with: kill $(lsof -t -i:${PORT})`);
    process.exit(1);
  }
  throw err;
});
