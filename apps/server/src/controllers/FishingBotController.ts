// Controller for fishing bot endpoints

import type { Context } from "hono";
import { ErrorCode } from "../models/ApiResponse";
import type { FishingBotService } from "../services/FishingBotService";

export class FishingBotController {
  private botService: FishingBotService;

  constructor(botService: FishingBotService) {
    this.botService = botService;
  }

  // Get current bot status
  async getStatus(c: Context) {
    try {
      const state = this.botService.getState();
      return c.json({
        success: true,
        data: state,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        500,
      );
    }
  }

  // Start the bot
  async start(c: Context) {
    try {
      let body: any = {};
      try {
        body = await c.req.json();
      } catch {
        // Use default config if no body
      }

      if (body.config) {
        this.botService.updateConfig(body.config);
      }

      await this.botService.start();

      return c.json({
        success: true,
        data: this.botService.getState(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        400,
      );
    }
  }

  // Stop the bot
  async stop(c: Context) {
    try {
      this.botService.stop();

      return c.json({
        success: true,
        data: this.botService.getState(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        400,
      );
    }
  }

  // Pause the bot
  async pause(c: Context) {
    try {
      this.botService.pause();

      return c.json({
        success: true,
        data: this.botService.getState(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        400,
      );
    }
  }

  // Resume the bot
  async resume(c: Context) {
    try {
      this.botService.resume();

      return c.json({
        success: true,
        data: this.botService.getState(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        400,
      );
    }
  }

  // Update bot configuration
  async updateConfig(c: Context) {
    try {
      const body = await c.req.json();

      if (!body.config) {
        return c.json(
          {
            success: false,
            error: {
              code: ErrorCode.VALIDATION_ERROR,
              message: "config is required",
            },
          },
          400,
        );
      }

      this.botService.updateConfig(body.config);

      return c.json({
        success: true,
        data: this.botService.getState(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        400,
      );
    }
  }
}
