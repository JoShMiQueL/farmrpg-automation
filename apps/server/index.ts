import { env } from "@farmrpg/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler, requestLogger } from "./src/middleware";
import api, { websocket } from "./src/routes/api";

const app = new Hono();

// Global error handler (must be first)
app.use("*", errorHandler);

// Request logging
app.use("*", requestLogger);

// Enable CORS
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
  }),
);

// Mount API routes
app.route("/api", api);

const port = env.PORT;

Bun.serve({
  port,
  fetch: app.fetch,
  websocket,
});

console.log(`🚀 Hono API Server running at http://localhost:${port}`);
console.log(`🔌 WebSocket endpoint: ws://localhost:${port}/api/bot/ws`);
