import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import api, { websocket } from "./src/routes/api";

const app = new Hono();

// Enable CORS for development
app.use("*", cors());

// Enable logging
app.use("*", logger());

// Mount API routes
app.route("/api", api);

const _isDevelopment = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

Bun.serve({
  port,
  fetch: app.fetch,
  websocket,
});

console.log(`🚀 Hono API Server running at http://localhost:${port}`);
console.log(`🔌 WebSocket endpoint: ws://localhost:${port}/api/bot/ws`);
