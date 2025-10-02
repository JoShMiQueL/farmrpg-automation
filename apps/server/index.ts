import { Hono } from "hono";
import { cors } from "hono/cors";
import api from "./src/routes/api";

const app = new Hono();

// Enable CORS for development
app.use("*", cors());

// Mount API routes
app.route("/api", api);

const _isDevelopment = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`🚀 Hono API Server running at http://localhost:${server.port}`);
