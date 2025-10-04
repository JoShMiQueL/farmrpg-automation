import { z } from "zod";

// Environment variable schema with validation
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Server configuration
  PORT: z.coerce.number().min(1).max(65535).default(3000),

  // FarmRPG API credentials
  FARMRPG_COOKIE: z.string().min(1, "FARMRPG_COOKIE is required"),

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // CORS
  CORS_ORIGIN: z.string().default("*"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Cache
  CACHE_TTL: z.coerce.number().default(60), // seconds
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Helper to check if we're in development
export const isDevelopment = env.NODE_ENV === "development";

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === "production";

// Helper to check if we're in test
export const isTest = env.NODE_ENV === "test";
