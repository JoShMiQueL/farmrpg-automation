// Controller for fishing-related endpoints
import type { Context } from "hono";
import { ErrorCode } from "../models/ApiResponse";
import type { FishCatchResponse } from "../models/FishCatch";
import { farmRPGService } from "../services";

export class FishController {
  private farmRPGService = farmRPGService;

  async catchFish(c: Context) {
    let body: any = {};

    try {
      body = await c.req.json();
    } catch (_error) {
      // If JSON parsing fails, use empty object (will use defaults)
      body = {};
    }

    const locationId = body.locationId ?? 1;
    const baitAmount = body.baitAmount ?? 1;

    if (typeof locationId !== "number" || locationId < 1) {
      const errorResponse: FishCatchResponse = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "locationId must be a number greater than 0",
        },
      };
      return c.json(errorResponse, 400);
    }

    if (typeof baitAmount !== "number" || baitAmount < 1) {
      const errorResponse: FishCatchResponse = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "baitAmount must be a number greater than 0",
        },
      };
      return c.json(errorResponse, 400);
    }

    const result = await this.farmRPGService.catchFish(locationId, baitAmount);

    if (result.error) {
      const errorResponse: FishCatchResponse = {
        success: false,
        error: {
          code: result.status === 502 ? ErrorCode.UPSTREAM_ERROR : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
        },
      };
      return c.json(errorResponse, result.status as 400 | 500 | 502);
    }

    const successResponse: FishCatchResponse = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    return c.json(successResponse, 200);
  }

  async getBaitInfo(c: Context) {
    const locationId = Number(c.req.query("locationId")) || 1;

    const result = await this.farmRPGService.getBaitInfo(locationId);

    if (result.error) {
      return c.json(
        {
          success: false,
          error: {
            code: result.status === 502 ? ErrorCode.UPSTREAM_ERROR : ErrorCode.INTERNAL_ERROR,
            message: result.error,
            statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
          },
        },
        result.status as 500 | 502,
      );
    }

    return c.json(
      {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  }
}
