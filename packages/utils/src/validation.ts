import type { z } from "zod";

/**
 * Validate data against a Zod schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validated data or throws error
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safely validate data against a Zod schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Result object with success flag and data or error
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Format Zod error for API response
 * @param error - Zod error
 * @returns Formatted error message
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`).join(", ");
}
