/**
 * Chat API — Anthropic Claude (preferred) with OpenRouter fallback.
 * Keys come from env / Render. Never commit secrets.
 */
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

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-5";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-3.5-turbo";

function parseBody(body) {
  const data = JSON.parse(String(body || "{}"));
  const rawMessages = Array.isArray(data.messages) ? data.messages : [];
  const systemMsg = rawMessages.find((m) => m && m.role === "system");
  const chatMessages = rawMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      content: String(m.content || ""),
    }))
    .filter((m) => m.content.trim().length > 0);
  const systemText =
    (systemMsg && systemMsg.content) ||
    (typeof data.system === "string" ? data.system : null) ||
    "You are BTechVerse AI, a friendly study buddy for BTech students. Always answer in English only. Be clear and concise. If the user says they still didn't get it, explain the same concept again in simpler English with more real-world examples—still in English only, no Hindi.";
  return {
    data,
    chatMessages,
    systemText,
    maxTokens: data.max_tokens ?? 800,
    temperature: data.temperature ?? 0.7,
  };
}

async function chatAnthropic({ apiKey, model, systemText, chatMessages, maxTokens, temperature }) {
  const messages = [];
  for (const m of chatMessages) {
    const last = messages[messages.length - 1];
    if (last && last.role === m.role) {
      last.content += `\n${m.content}`;
    } else {
      messages.push({ role: m.role, content: m.content });
    }
  }
  if (messages.length === 0) {
    return { statusCode: 200, body: JSON.stringify({ content: null, error: "Empty message" }) };
  }
  if (messages[0].role !== "user") {
    messages.unshift({ role: "user", content: "Hello" });
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemText,
      messages,
    }),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = result?.error?.message ?? result?.error ?? `HTTP ${res.status}`;
    console.error("[Anthropic]", res.status, result?.error || result);
    const msg =
      res.status === 401 || res.status === 403
        ? "Claude API key invalid. Check ANTHROPIC_API_KEY on Render."
        : String(err);
    return { statusCode: 200, body: JSON.stringify({ content: null, error: msg }) };
  }

  const textParts = (result.content || [])
    .filter((b) => b && b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const content = textParts || "No response.";
  return { statusCode: 200, body: JSON.stringify({ content, usage: result.usage }) };
}

async function chatOpenRouter({ apiKey, model, systemText, chatMessages, maxTokens, temperature }) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://btechverse.online",
      "X-Title": "BTechVerse",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemText }, ...chatMessages],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = result?.error?.message ?? result?.error ?? result?.message ?? `HTTP ${res.status}`;
    console.error("[OpenRouter]", res.status, result?.error || result);
    const msg =
      res.status === 401
        ? "OpenRouter: key invalid or out of credits."
        : String(err);
    return { statusCode: 200, body: JSON.stringify({ content: null, error: msg }) };
  }

  const content = result.choices?.[0]?.message?.content ?? "No response.";
  return { statusCode: 200, body: JSON.stringify({ content, usage: result.usage }) };
}

export async function handleChat(body) {
  try {
    loadEnv();
    let data;
    try {
      data = parseBody(body);
    } catch {
      return { statusCode: 200, body: JSON.stringify({ content: null, error: "Invalid JSON" }) };
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
    if (anthropicKey) {
      return await chatAnthropic({
        apiKey: anthropicKey,
        model: data.data.model || process.env.ANTHROPIC_MODEL || DEFAULT_CLAUDE_MODEL,
        systemText: data.systemText,
        chatMessages: data.chatMessages,
        maxTokens: data.maxTokens,
        temperature: data.temperature,
      });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "";
    if (!openRouterKey) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          content: null,
          error: "ANTHROPIC_API_KEY not set on the server.",
        }),
      };
    }

    return await chatOpenRouter({
      apiKey: openRouterKey,
      model: data.data.model || process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
      systemText: data.systemText,
      chatMessages: data.chatMessages,
      maxTokens: data.maxTokens,
      temperature: data.temperature,
    });
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        content: null,
        error: (e && (e.message || e.code)) || "Chat failed. Try again.",
      }),
    };
  }
}
