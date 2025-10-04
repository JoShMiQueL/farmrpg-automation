// Controller for item-related endpoints

import {
  type ApiResponse,
  type BuyItemResponse,
  ErrorCode,
  type ItemResponse,
} from "@farmrpg/types";
import type { Context } from "hono";
import { farmRPGService } from "../services";

export class ItemController {
  private farmRPGService = farmRPGService;

  async getItemDetails(c: Context) {
    const itemId = c.req.param("id");
    const itemIdNum = Number.parseInt(itemId, 10);

    if (!itemId || Number.isNaN(itemIdNum)) {
      const errorResponse: ItemResponse = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid item ID. Must be a number.",
          statusCode: 400,
        },
      };
      return c.json(errorResponse, 400);
    }

    const result = await this.farmRPGService.getItemDetails(itemIdNum);

    if (result.error) {
      const errorResponse: ItemResponse = {
        success: false,
        error: {
          code:
            result.status === 404
              ? ErrorCode.NOT_FOUND
              : result.status === 502
                ? ErrorCode.UPSTREAM_ERROR
                : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
        },
      };
      return c.json(errorResponse, result.status as 404 | 500 | 502);
    }

    const successResponse: ItemResponse = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    return c.json(successResponse, 200);
  }

  async buyItem(c: Context) {
    const body = await c.req.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof itemId !== "number") {
      const errorResponse: BuyItemResponse = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid itemId. Must be a number.",
          statusCode: 400,
        },
      };
      return c.json(errorResponse, 400);
    }

    if (quantity === undefined || typeof quantity !== "number") {
      const errorResponse: BuyItemResponse = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid quantity. Must be a number (-1 to buy all available).",
          statusCode: 400,
        },
      };
      return c.json(errorResponse, 400);
    }

    const result = await this.farmRPGService.buyItem(itemId, quantity);

    if (result.error) {
      const errorResponse: BuyItemResponse = {
        success: false,
        error: {
          code:
            result.status === 400
              ? ErrorCode.VALIDATION_ERROR
              : result.status === 502
                ? ErrorCode.UPSTREAM_ERROR
                : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
        },
      };
      return c.json(errorResponse, result.status as 400 | 500 | 502);
    }

    const successResponse: BuyItemResponse = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    return c.json(successResponse, 200);
  }

  async sellItem(c: Context) {
    const body = await c.req.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof itemId !== "number") {
      const errorResponse: ApiResponse<number> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid itemId. Must be a number.",
          statusCode: 400,
        },
      };
      return c.json(errorResponse, 400);
    }

    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      const errorResponse: ApiResponse<number> = {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Invalid quantity. Must be a positive number.",
          statusCode: 400,
        },
      };
      return c.json(errorResponse, 400);
    }

    const result = await this.farmRPGService.sellItem(itemId, quantity);

    if (result.error) {
      const errorResponse: ApiResponse<number> = {
        success: false,
        error: {
          code:
            result.status === 400
              ? ErrorCode.VALIDATION_ERROR
              : result.status === 404
                ? ErrorCode.NOT_FOUND
                : result.status === 502
                  ? ErrorCode.UPSTREAM_ERROR
                  : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
        },
      };
      return c.json(errorResponse, result.status as 400 | 404 | 500 | 502);
    }

    const successResponse: ApiResponse<{ itemId: number; quantity: number; totalSilver: number }> =
      {
        success: true,
        data: {
          itemId,
          quantity,
          totalSilver: result.data || 0,
        },
        timestamp: new Date().toISOString(),
      };

    return c.json(successResponse, 200);
  }

  async sellAllItems(c: Context) {
    const body = await c.req.json().catch(() => ({}));
    const { onlyCapped } = body;

    const result = await this.farmRPGService.sellAllItems(onlyCapped || false);

    if (result.error) {
      const errorResponse: ApiResponse<{
        totalSilver: number;
        itemsSold: number;
        itemTypes: number;
      }> = {
        success: false,
        error: {
          code: result.status === 502 ? ErrorCode.UPSTREAM_ERROR : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
        },
      };
      return c.json(errorResponse, result.status as 500 | 502);
    }

    const successResponse: ApiResponse<{
      totalSilver: number;
      itemsSold: number;
      itemTypes: number;
    }> = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    return c.json(successResponse, 200);
  }
}
