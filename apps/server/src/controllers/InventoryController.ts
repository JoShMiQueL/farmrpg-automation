// Controller for inventory-related endpoints
import type { Context } from "hono";
import { farmRPGService } from "../services";
import type { InventoryResponse } from "../models/Inventory";
import { ErrorCode } from "../models/ApiResponse";

export class InventoryController {
  private farmRPGService = farmRPGService;

  async getInventory(c: Context) {
    const result = await this.farmRPGService.getInventory();

    if (result.error) {
      const errorResponse: InventoryResponse = {
        success: false,
        error: {
          code: result.status === 502 ? ErrorCode.UPSTREAM_ERROR : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined
        }
      };
      return c.json(errorResponse, result.status as 500 | 502);
    }

    const successResponse: InventoryResponse = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    };

    return c.json(successResponse, 200);
  }
}
