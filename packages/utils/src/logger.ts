import pino from "pino";

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// Helper functions for common log patterns
export const logRequest = (method: string, path: string, statusCode: number, duration: number) => {
  logger.info(
    {
      method,
      path,
      statusCode,
      duration,
    },
    `${method} ${path} ${statusCode} - ${duration}ms`,
  );
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    },
    error.message,
  );
};

export const logBotEvent = (event: string, data?: Record<string, any>) => {
  logger.info(
    {
      event,
      ...data,
    },
    `Bot event: ${event}`,
  );
};
