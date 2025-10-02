import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Context } from "hono";
import { ItemController } from "../../src/controllers/ItemController";

describe("ItemController", () => {
  let controller: ItemController;
  let mockContext: any;
  let mockFarmRPGService: any;

  beforeEach(() => {
    mockFarmRPGService = {
      getItemDetails: mock(() =>
        Promise.resolve({
          status: 200,
          data: {
            id: 7758,
            name: "Worms",
            image: "/img/items/7758.png",
            buyPrice: { amount: 3, currency: "Silver" },
            inventory: { quantity: 100 },
          },
        }),
      ),
      buyItem: mock(() =>
        Promise.resolve({
          status: 200,
          data: {
            itemId: 7758,
            itemName: "Worms",
            quantityPurchased: 10,
            currentInventory: 110,
            totalCost: { amount: 30, currency: "Silver" },
            remainingCoins: { silver: 970, gold: 10 },
          },
        }),
      ),
      sellItem: mock(() =>
        Promise.resolve({
          status: 200,
          data: 50,
        }),
      ),
      sellAllItems: mock(() =>
        Promise.resolve({
          status: 200,
          data: {
            totalSilver: 1000,
            itemsSold: 100,
            itemTypes: 5,
          },
        }),
      ),
    };

    controller = new ItemController();
    // @ts-expect-error - Replace service for testing
    controller.farmRPGService = mockFarmRPGService;

    mockContext = {
      req: {
        param: mock(() => "7758"),
        json: mock(() => Promise.resolve({ itemId: 7758, quantity: 10 })),
      },
      json: mock((data: any, _status?: number) => data as any),
    };
  });

  describe("getItemDetails", () => {
    test("should return item details successfully", async () => {
      const result: any = await controller.getItemDetails(mockContext as Context);

      expect(mockFarmRPGService.getItemDetails).toHaveBeenCalledWith(7758);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Worms");
    });

    test("should handle invalid item ID", async () => {
      mockContext.req.param.mockReturnValue("invalid");

      const result: any = await controller.getItemDetails(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should handle service errors", async () => {
      mockFarmRPGService.getItemDetails.mockResolvedValue({
        status: 404,
        error: "Item not found",
      });

      const result: any = await controller.getItemDetails(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("buyItem", () => {
    test("should buy item successfully", async () => {
      const result: any = await controller.buyItem(mockContext as Context);

      expect(mockFarmRPGService.buyItem).toHaveBeenCalledWith(7758, 10);
      expect(result.success).toBe(true);
      expect(result.data.quantityPurchased).toBe(10);
    });

    test("should validate itemId is required", async () => {
      mockContext.req.json.mockResolvedValue({ quantity: 10 });

      const result: any = await controller.buyItem(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should validate quantity is required", async () => {
      mockContext.req.json.mockResolvedValue({ itemId: 7758 });

      const result: any = await controller.buyItem(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should handle insufficient funds error", async () => {
      mockFarmRPGService.buyItem.mockResolvedValue({
        status: 400,
        error: "Insufficient Silver",
      });

      const result: any = await controller.buyItem(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("sellItem", () => {
    test("should sell item successfully", async () => {
      const result: any = await controller.sellItem(mockContext as Context);

      expect(mockFarmRPGService.sellItem).toHaveBeenCalledWith(7758, 10);
      expect(result.success).toBe(true);
      expect(result.data.quantitySold).toBe(50);
    });

    test("should validate itemId is required", async () => {
      mockContext.req.json.mockResolvedValue({ quantity: 10 });

      const result: any = await controller.sellItem(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should validate quantity is required", async () => {
      mockContext.req.json.mockResolvedValue({ itemId: 7758 });

      const result: any = await controller.sellItem(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("sellAllItems", () => {
    test("should sell all items successfully", async () => {
      mockContext.req.json.mockResolvedValue({});

      const result: any = await controller.sellAllItems(mockContext as Context);

      expect(mockFarmRPGService.sellAllItems).toHaveBeenCalledWith(false);
      expect(result.success).toBe(true);
      expect(result.data.totalSilver).toBe(1000);
      expect(result.data.itemsSold).toBe(100);
    });

    test("should sell only capped items when onlyCapped is true", async () => {
      mockContext.req.json.mockResolvedValue({ onlyCapped: true });

      const result: any = await controller.sellAllItems(mockContext as Context);

      expect(mockFarmRPGService.sellAllItems).toHaveBeenCalledWith(true);
      expect(result.success).toBe(true);
    });

    test("should handle service errors", async () => {
      mockFarmRPGService.sellAllItems.mockResolvedValue({
        status: 500,
        error: "Internal error",
      });

      const result: any = await controller.sellAllItems(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
