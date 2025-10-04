import { logger } from "@farmrpg/utils";
import type { Context, Next } from "hono";

/**
 * Request logging middleware
 * Logs all incoming requests with timing information
 */
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const { method, path } = c.req;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info(
    {
      method,
      path,
      status,
      duration,
    },
    `${method} ${path} ${status} - ${duration}ms`,
  );
};
