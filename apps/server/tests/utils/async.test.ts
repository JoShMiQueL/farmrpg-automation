import { describe, expect, test } from "bun:test";
import { randomSleep, sleep } from "../../src/utils/async";

describe("async utils", () => {
  describe("sleep", () => {
    test("should sleep for specified milliseconds", async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;

      // Allow some tolerance for timing
      expect(elapsed).toBeGreaterThanOrEqual(95);
      expect(elapsed).toBeLessThan(150);
    });

    test("should sleep for 0 milliseconds", async () => {
      const start = Date.now();
      await sleep(0);
      const elapsed = Date.now() - start;

      // Allow more tolerance for 0ms sleep (just checking it completes quickly)
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe("randomSleep", () => {
    test("should sleep for random duration between min and max", async () => {
      const start = Date.now();
      await randomSleep(50, 100);
      const elapsed = Date.now() - start;

      // Should be at least min and at most max (with some tolerance)
      expect(elapsed).toBeGreaterThanOrEqual(45);
      expect(elapsed).toBeLessThan(150);
    });

    test("should handle same min and max values", async () => {
      const start = Date.now();
      await randomSleep(50, 50);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(45);
      expect(elapsed).toBeLessThan(100);
    });
  });
});
