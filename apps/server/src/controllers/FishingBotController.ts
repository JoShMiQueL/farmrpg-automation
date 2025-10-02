// Controller for fishing bot endpoints
import type { Context } from "hono";
import { FishingBotService } from "../services/FishingBotService";
import type { FishingBotControlResponse, FishingBotStatusResponse } from "../models/FishingBot";
import { ErrorCode } from "../models/ApiResponse";

// Singleton instance
let fishingBotService: FishingBotService | null = null;

export class FishingBotController {
  private getFishingBotService(): FishingBotService {
    if (!fishingBotService) {
      fishingBotService = new FishingBotService();
    }
    return fishingBotService;
  }

  async control(c: Context) {
    const body = await c.req.json();
    const { action, config } = body;

    if (!action || !["start", "stop", "status"].includes(action)) {
      const errorResponse: FishingBotControlResponse = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid action. Must be 'start', 'stop', or 'status'.",
          statusCode: 400
        }
      };
      return c.json(errorResponse, 400);
    }

    const service = this.getFishingBotService();

    try {
      let status;
      
      if (action === "start") {
        status = await service.start(config);
      } else if (action === "stop") {
        status = service.stop();
      } else {
        status = service.getStatus();
      }

      const successResponse: FishingBotControlResponse = {
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      };

      return c.json(successResponse, 200);
    } catch (error) {
      const errorResponse: FishingBotControlResponse = {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : "Unknown error"
        }
      };
      return c.json(errorResponse, 500);
    }
  }

  async getStatus(c: Context) {
    const service = this.getFishingBotService();
    const status = service.getStatus();

    const successResponse: FishingBotStatusResponse = {
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    };

    return c.json(successResponse, 200);
  }
}
