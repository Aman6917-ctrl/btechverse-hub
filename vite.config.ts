import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// In dev, handle /api/presign inside Vite so PDF opens even without running dev:api
function presignPlugin() {
  return {
    name: "presign",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== "GET" || !req.url?.includes("presign")) {
          next();
          return;
        }
        const rawUrl = new URL(req.url, "http://localhost").searchParams.get("url");
        if (!rawUrl) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing url query" }));
          return;
        }
        try {
          const { getPresignedUrl } = await import("./server/presign.mjs");
          const { url } = await getPresignedUrl(rawUrl);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ url }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: String(e?.message || e) }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  plugins: [presignPlugin(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
