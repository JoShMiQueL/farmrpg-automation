// Controller for inventory-related endpoints
import type { Context } from "hono";
import { ErrorCode } from "../models/ApiResponse";
import type { InventoryCategory, InventoryResponse } from "../models/Inventory";
import { farmRPGService } from "../services";

export class InventoryController {
  private farmRPGService = farmRPGService;

  async getInventory(c: Context) {
    const categoryParam = c.req.query("category");

    // Validate category if provided
    const validCategories: InventoryCategory[] = [
      "items",
      "fish",
      "crops",
      "seeds",
      "loot",
      "runestones",
      "books",
      "cards",
      "rares",
    ];

    let categoryFilter: InventoryCategory | InventoryCategory[] | undefined;

    if (categoryParam) {
      // Support comma-separated categories (e.g., ?category=fish,crops)
      const categories = categoryParam.split(",").map((c) => c.trim()) as InventoryCategory[];

      // Validate all categories
      const invalidCategories = categories.filter((cat) => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        const errorResponse: InventoryResponse = {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: `Invalid category: ${invalidCategories.join(", ")}. Valid categories: ${validCategories.join(", ")}`,
          },
        };
        return c.json(errorResponse, 400);
      }

      categoryFilter = categories.length === 1 ? categories[0] : categories;
    }

    const result = await this.farmRPGService.getInventory(categoryFilter);

    if (result.error) {
      const errorResponse: InventoryResponse = {
        success: false,
        error: {
          code: result.status === 502 ? ErrorCode.UPSTREAM_ERROR : ErrorCode.INTERNAL_ERROR,
          message: result.error,
          statusCode: result.status !== 200 && result.status !== 500 ? result.status : undefined,
        },
      };
      return c.json(errorResponse, result.status as 500 | 502);
    }

    const successResponse: InventoryResponse = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    return c.json(successResponse, 200);
  }
}
