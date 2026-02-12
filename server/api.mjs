/**
 * Dev API server: /api/presign (S3) and POST /api/chat (OpenRouter).
 * Run: npm run dev:api (port 3001). Vite proxies /api to this when you run npm run dev.
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

const PORT = Number(process.env.CHAT_API_PORT) || 3001;
const { getPresignedUrl, getUploadPresignedUrl } = await import("./presign.mjs");
const { handleChat } = await import("./chat.mjs");
const { handleBookSession } = await import("./book-session.mjs");
const { handleRunCode } = await import("./run-code.mjs");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const rawUrl = req.url || "";
  let pathname = rawUrl.split("?")[0] || "/";
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    try {
      pathname = new URL(pathname).pathname;
    } catch (_) {}
  }
  pathname = pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  const query = Object.fromEntries(new URL(rawUrl.startsWith("http") ? rawUrl : "http://x" + rawUrl).searchParams);

  const isBookSession = pathname === "/api/book-session" || pathname.endsWith("/book-session");

  // POST /api/book-session – check first, exact path
  if ((req.method || "").toUpperCase() === "POST" && isBookSession) {
    console.log("[api] POST /api/book-session");
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8") || "{}";
    try {
      const out = await handleBookSession(body);
      res.writeHead(out.statusCode, { "Content-Type": "application/json" });
      res.end(out.body);
    } catch (err) {
      console.error("[book-session]", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err?.message || err) }));
    }
    return;
  }

  // GET /api/presign?url=...
  if (req.method === "GET" && pathname.includes("presign")) {
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
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err?.message || err) }));
    }
    return;
  }

  // POST /api/chat (OpenRouter) – exact path so /api/book-session doesn't match
  if (pathname === "/api/chat" && (req.method || "").toUpperCase() === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const out = await handleChat(body);
    res.writeHead(out.statusCode, { "Content-Type": "application/json" });
    res.end(out.body);
    return;
  }

  // POST /api/upload-presign – S3 presigned PUT for admin upload
  if (pathname === "/api/upload-presign" && (req.method || "").toUpperCase() === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8") || "{}";
    try {
      const data = JSON.parse(body);
      const { uploadUrl, fileUrl } = await getUploadPresignedUrl({
        branchCode: data.branchCode,
        category: data.category,
        fileName: data.fileName,
        contentType: data.contentType,
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ uploadUrl, fileUrl }));
    } catch (err) {
      console.error("[upload-presign]", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err?.message || err) }));
    }
    return;
  }

  // POST /api/run-code – run Python (and optionally other langs) on server
  if (pathname === "/api/run-code" && (req.method || "").toUpperCase() === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8") || "{}";
    try {
      const out = await handleRunCode(body);
      res.writeHead(out.statusCode, { "Content-Type": "application/json" });
      res.end(out.body);
    } catch (err) {
      console.error("[run-code]", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err?.message || err) }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT} (presign + chat + book-session)`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} in use. Run: kill $(lsof -t -i:${PORT})`);
    process.exit(1);
  }
  throw err;
});
