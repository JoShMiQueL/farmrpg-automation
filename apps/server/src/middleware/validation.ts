import { type ApiResponse, ErrorCode } from "@farmrpg/types";
import { formatZodError } from "@farmrpg/utils";
import type { Context, Next } from "hono";
import type { z } from "zod";

/**
 * Request body validation middleware
 * Validates request body against a Zod schema
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const response: ApiResponse<never> = {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: formatZodError(result.error),
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        };

        return c.json(response, 400);
      }

      // Store validated data in context
      c.set("validatedBody", result.data);
      await next();
    } catch (_error) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid JSON body",
          statusCode: 400,
        },
        timestamp: new Date().toISOString(),
      };

      return c.json(response, 400);
    }
  };
};

/**
 * Query parameter validation middleware
 * Validates query parameters against a Zod schema
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);

    if (!result.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: formatZodError(result.error),
          statusCode: 400,
        },
        timestamp: new Date().toISOString(),
      };

      return c.json(response, 400);
    }

    // Store validated data in context
    c.set("validatedQuery", result.data);
    await next();
  };
};

/**
 * Path parameter validation middleware
 * Validates path parameters against a Zod schema
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    const params = c.req.param();
    const result = schema.safeParse(params);

    if (!result.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: formatZodError(result.error),
          statusCode: 400,
        },
        timestamp: new Date().toISOString(),
      };

      return c.json(response, 400);
    }

    // Store validated data in context
    c.set("validatedParams", result.data);
    await next();
  };
};
