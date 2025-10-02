import { describe, test, expect, beforeEach, mock } from "bun:test";
import { FishController } from "../../src/controllers/FishController";
import type { Context } from "hono";

describe("FishController", () => {
  let controller: FishController;
  let mockContext: any;
  let mockFarmRPGService: any;

  beforeEach(() => {
    mockFarmRPGService = {
      catchFish: mock(() => Promise.resolve({
        status: 200,
        data: {
          catch: {
            id: 0,
            name: "Yellow Perch",
            image: "https://farmrpg.com/img/items/yellowperch.png"
          },
          stats: {
            totalFishCaught: 377,
            fishingXpPercent: 7.16
          },
          resources: {
            stamina: 50,
            bait: 198
          }
        }
      })),
      getBaitInfo: mock(() => Promise.resolve({
        status: 200,
        data: {
          baitName: "Worms",
          baitCount: 199,
          streak: 5268,
          bestStreak: 5268
        }
      }))
    };

    controller = new FishController();
    // @ts-ignore - Replace service for testing
    controller["farmRPGService"] = mockFarmRPGService;

    mockContext = {
      req: {
        json: mock(() => Promise.resolve({ locationId: 1, baitAmount: 1 })),
        query: mock(() => "1")
      },
      json: mock((data: any, status?: number) => {
        // Return the data directly to match what tests expect
        return data as any;
      })
    };
  });

  describe("catchFish", () => {
    test("should catch fish successfully with valid request", async () => {
      const result: any = await controller.catchFish(mockContext as Context);

      expect(mockFarmRPGService.catchFish).toHaveBeenCalledWith(1, 1);
      expect(result.success).toBe(true);
      expect(result.data.catch.name).toBe("Yellow Perch");
    });

    test("should use defaults when body is empty", async () => {
      mockContext.req.json.mockRejectedValue(new Error("Invalid JSON"));

      const result: any = await controller.catchFish(mockContext as Context);

      expect(mockFarmRPGService.catchFish).toHaveBeenCalledWith(1, 1);
      expect(result.success).toBe(true);
    });

    test("should validate locationId is a number", async () => {
      mockContext.req.json.mockResolvedValue({ locationId: "invalid", baitAmount: 1 });

      const result: any = await controller.catchFish(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should validate locationId is greater than 0", async () => {
      mockContext.req.json.mockResolvedValue({ locationId: 0, baitAmount: 1 });

      const result: any = await controller.catchFish(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should validate baitAmount is a number", async () => {
      mockContext.req.json.mockResolvedValue({ locationId: 1, baitAmount: "invalid" });

      const result: any = await controller.catchFish(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should validate baitAmount is greater than 0", async () => {
      mockContext.req.json.mockResolvedValue({ locationId: 1, baitAmount: 0 });

      const result: any = await controller.catchFish(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    test("should handle service errors", async () => {
      mockFarmRPGService.catchFish.mockResolvedValue({
        status: 400,
        error: "No bait available"
      });

      const result: any = await controller.catchFish(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("No bait available");
    });

    test("should handle upstream errors", async () => {
      mockFarmRPGService.catchFish.mockResolvedValue({
        status: 502,
        error: "FarmRPG API error"
      });

      const result: any = await controller.catchFish(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UPSTREAM_ERROR");
    });
  });

  describe("getBaitInfo", () => {
    test("should get bait info successfully", async () => {
      const result: any = await controller.getBaitInfo(mockContext as Context);

      expect(mockFarmRPGService.getBaitInfo).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.data.baitName).toBe("Worms");
      expect(result.data.baitCount).toBe(199);
    });

    test("should use default locationId when not provided", async () => {
      mockContext.req.query.mockReturnValue(undefined);

      const result: any = await controller.getBaitInfo(mockContext as Context);

      expect(mockFarmRPGService.getBaitInfo).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    test("should parse locationId from query parameter", async () => {
      mockContext.req.query.mockReturnValue("5");

      const result: any = await controller.getBaitInfo(mockContext as Context);

      expect(mockFarmRPGService.getBaitInfo).toHaveBeenCalledWith(5);
      expect(result.success).toBe(true);
    });

    test("should handle service errors", async () => {
      mockFarmRPGService.getBaitInfo.mockResolvedValue({
        status: 500,
        error: "Parse error"
      });

      const result: any = await controller.getBaitInfo(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
