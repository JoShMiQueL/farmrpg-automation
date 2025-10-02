import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Context } from "hono";
import { InventoryController } from "../../src/controllers/InventoryController";

describe("InventoryController", () => {
  let controller: InventoryController;
  let mockContext: any;
  let mockFarmRPGService: any;

  beforeEach(() => {
    mockFarmRPGService = {
      getInventory: mock(() =>
        Promise.resolve({
          status: 200,
          data: {
            categories: [
              {
                category: "fish",
                items: [
                  {
                    id: 17,
                    name: "Drum",
                    description: "Not an instrument",
                    quantity: 179,
                    imageUrl: "https://farmrpg.com/img/items/7718.PNG",
                  },
                ],
              },
            ],
            stats: {
              uniqueItems: 8,
              totalItems: 407,
              maxCapacity: 200,
            },
          },
        }),
      ),
    };

    controller = new InventoryController();
    // @ts-ignore - Replace service for testing
    controller["farmRPGService"] = mockFarmRPGService;

    mockContext = {
      req: {
        query: mock(() => undefined),
      },
      json: mock((data: any, _status?: number) => data as any),
    };
  });

  describe("getInventory", () => {
    test("should return all categories when no filter provided", async () => {
      const result: any = await controller.getInventory(mockContext as Context);

      expect(mockFarmRPGService.getInventory).toHaveBeenCalledWith(undefined);
      expect(result.success).toBe(true);
      expect(result.data.categories).toHaveLength(1);
    });

    test("should filter by single category", async () => {
      mockContext.req.query.mockReturnValue("fish");

      const result: any = await controller.getInventory(mockContext as Context);

      expect(mockFarmRPGService.getInventory).toHaveBeenCalledWith("fish");
      expect(result.success).toBe(true);
    });

    test("should filter by multiple categories", async () => {
      mockContext.req.query.mockReturnValue("fish,crops");

      const result: any = await controller.getInventory(mockContext as Context);

      expect(mockFarmRPGService.getInventory).toHaveBeenCalledWith(["fish", "crops"]);
      expect(result.success).toBe(true);
    });

    test("should return error for invalid category", async () => {
      mockContext.req.query.mockReturnValue("invalid");

      const result: any = await controller.getInventory(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should handle service errors", async () => {
      mockFarmRPGService.getInventory.mockResolvedValue({
        status: 500,
        error: "Internal error",
      });

      const result: any = await controller.getInventory(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("INTERNAL_ERROR");
    });

    test("should handle upstream errors", async () => {
      mockFarmRPGService.getInventory.mockResolvedValue({
        status: 502,
        error: "FarmRPG API error",
      });

      const result: any = await controller.getInventory(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UPSTREAM_ERROR");
    });
  });
});
