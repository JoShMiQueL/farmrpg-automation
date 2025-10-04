// Controller for health check endpoints
import type { Context } from "hono";

export class HealthController {
  /**
   * Basic health check
   * Returns 200 if server is running
   */
  async health(c: Context) {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  /**
   * Readiness check
   * Returns 200 if server is ready to accept requests
   */
  async ready(c: Context) {
    // Add checks for dependencies (database, external APIs, etc.)
    const checks = {
      server: true,
      // Add more checks as needed
    };

    const isReady = Object.values(checks).every((check) => check === true);

    return c.json(
      {
        status: isReady ? "ready" : "not_ready",
        checks,
        timestamp: new Date().toISOString(),
      },
      isReady ? 200 : 503,
    );
  }

  /**
   * Liveness check
   * Returns 200 if server is alive
   */
  async live(c: Context) {
    return c.json({
      status: "alive",
      timestamp: new Date().toISOString(),
    });
  }
}
