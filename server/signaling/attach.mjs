import { Server as SocketIOServer } from "socket.io";
import { registerSignalingHandlers } from "./handlers.mjs";

const LOG_PREFIX = "[signaling]";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://btechverse.cloud",
  "https://www.btechverse.cloud",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

function getAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_ORIGINS;
}

export function attachSignaling(httpServer, options = {}) {
  const allowedOrigins = options.allowedOrigins ?? getAllowedOrigins();

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        console.warn(`${LOG_PREFIX} CORS blocked origin: ${origin}`);
        callback(new Error("Origin not allowed"));
      },
      credentials: true,
    },
    connectionStateRecovery: false,
  });

  registerSignalingHandlers(io);

  console.log(
    `${LOG_PREFIX} attached to HTTP server (path /socket.io, origins: ${allowedOrigins.join(", ")})`
  );

  return io;
}
