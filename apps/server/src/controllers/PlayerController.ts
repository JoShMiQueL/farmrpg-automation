// Controller for player-related endpoints
import type { Context } from "hono";
import { ErrorCode } from "../models/ApiResponse";
import type { PlayerStatsResponse } from "../models/PlayerStats";
import { farmRPGService } from "../services";

export class PlayerController {
  private farmRPGService = farmRPGService;

  async getStats(c: Context) {
    const result = await this.farmRPGService.getPlayerStats();

    if (result.error) {
      const errorResponse: PlayerStatsResponse = {
        success: false,
        error: {
          code: result.status === 502 ? ErrorCode.UPSTREAM_ERROR : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
        },
      };
      return c.json(errorResponse, result.status as 500 | 502);
    }

    const successResponse: PlayerStatsResponse = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    return c.json(successResponse, 200);
  }
}
