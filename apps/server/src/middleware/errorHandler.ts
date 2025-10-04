import { type ApiResponse, ErrorCode } from "@farmrpg/types";
import { logger } from "@farmrpg/utils";
import type { Context, Next } from "hono";

/**
 * Global error handler middleware
 * Catches all errors and returns standardized API responses
 */
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    const err = error as Error;

    // Log the error
    logger.error(
      {
        error: {
          message: err.message,
          stack: err.stack,
          path: c.req.path,
          method: c.req.method,
        },
      },
      `Error in ${c.req.method} ${c.req.path}`,
    );

    // Return standardized error response
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: process.env.NODE_ENV === "production" ? "An internal error occurred" : err.message,
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
    };

    return c.json(response, 500);
  }
};
