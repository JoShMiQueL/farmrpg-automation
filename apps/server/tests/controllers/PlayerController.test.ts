import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Context } from "hono";
import { PlayerController } from "../../src/controllers/PlayerController";

describe("PlayerController", () => {
  let controller: PlayerController;
  let mockContext: any;
  let mockFarmRPGService: any;

  beforeEach(() => {
    mockFarmRPGService = {
      getPlayerStats: mock(() =>
        Promise.resolve({
          status: 200,
          data: {
            silver: 1234,
            gold: 56,
          },
        }),
      ),
    };

    controller = new PlayerController();
    // @ts-expect-error - Replace service for testing
    controller.farmRPGService = mockFarmRPGService;

    mockContext = {
      json: mock((data: any, _status?: number) => data as any),
    };
  });

  describe("getStats", () => {
    test("should return player stats successfully", async () => {
      const result: any = await controller.getStats(mockContext as Context);

      expect(mockFarmRPGService.getPlayerStats).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.silver).toBe(1234);
      expect(result.data.gold).toBe(56);
    });

    test("should handle service errors", async () => {
      mockFarmRPGService.getPlayerStats.mockResolvedValue({
        status: 500,
        error: "Parse error",
      });

      const result: any = await controller.getStats(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("INTERNAL_ERROR");
    });

    test("should handle upstream errors", async () => {
      mockFarmRPGService.getPlayerStats.mockResolvedValue({
        status: 502,
        error: "FarmRPG API error",
      });

      const result: any = await controller.getStats(mockContext as Context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UPSTREAM_ERROR");
    });
  });
});
