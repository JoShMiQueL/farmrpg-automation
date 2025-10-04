import type { BotConfig } from "@farmrpg/types";
import { logger, randomSleep } from "@farmrpg/utils";
import type { BotApiClient } from "../api/client";

/**
 * Fishing bot strategy
 * Handles the logic for automated fishing
 */
export class FishingStrategy {
  private client: BotApiClient;
  private config: BotConfig;
  private running = false;
  private stats = {
    totalCatches: 0,
    errors: 0,
    startTime: Date.now(),
  };

  constructor(client: BotApiClient, config: BotConfig) {
    this.client = client;
    this.config = config;
  }

  async start(): Promise<void> {
    this.running = true;
    this.stats.startTime = Date.now();

    logger.info("🎣 Starting fishing bot...");
    logger.info({
      locationId: this.config.locationId,
      baitId: this.config.baitId,
      autoBuyBait: this.config.autoBuyBait?.enabled,
      autoStop: this.config.autoStop?.enabled,
    });

    while (this.running) {
      try {
        await this.fishingCycle();

        // Check stop conditions
        if (this.shouldStop()) {
          break;
        }

        // Random delay between catches
        const delay = randomSleep(this.config.delay?.min || 1000, this.config.delay?.max || 3000);
        await delay;
      } catch (error) {
        this.stats.errors++;
        logger.error({ error }, "Error in fishing cycle");

        // Stop on too many errors
        if (this.stats.errors >= 5) {
          logger.error("Too many errors, stopping bot");
          break;
        }

        // Wait before retry
        await randomSleep(5000, 10000);
      }
    }

    this.logStats();
  }

  stop(): void {
    this.running = false;
    logger.info("🛑 Stopping fishing bot...");
  }

  private async fishingCycle(): Promise<void> {
    // Catch fish
    const result = await this.client.catchFish(this.config.locationId, this.config.baitId);

    if (!result.success) {
      // Handle errors
      const errorCode = result.error?.code;

      if (errorCode === "NO_BAIT") {
        logger.warn("No bait remaining");

        if (this.config.autoBuyBait?.enabled) {
          await this.buyBait();
          return; // Try again after buying
        }

        if (this.config.autoStop?.noBait) {
          logger.info("Auto-stop: No bait");
          this.stop();
        }
        return;
      }

      throw new Error(result.error?.message || "Failed to catch fish");
    }

    // Success!
    this.stats.totalCatches++;

    const fish = result.data?.catch;
    const resources = result.data?.resources;

    logger.info({
      fish: fish?.name,
      totalCatches: this.stats.totalCatches,
      stamina: resources?.stamina,
      bait: resources?.bait,
    });

    // Check if out of stamina
    if (resources?.stamina === 0 && this.config.autoStop?.noStamina) {
      logger.info("Auto-stop: No stamina");
      this.stop();
    }

    // Check bait level
    if (
      this.config.autoBuyBait?.enabled &&
      resources?.bait &&
      resources.bait < (this.config.autoBuyBait.minBaitCount || 10)
    ) {
      await this.buyBait();
    }
  }

  private async buyBait(): Promise<void> {
    if (!this.config.autoBuyBait?.enabled) return;

    try {
      logger.info("🛒 Buying bait...");

      const result = await this.client.buyItem(
        this.config.autoBuyBait.baitItemId,
        this.config.autoBuyBait.buyQuantity,
      );

      if (result.success) {
        logger.info({
          quantity: result.data?.quantityPurchased,
          cost: result.data?.totalCost,
        });
      }
    } catch (error) {
      logger.error({ error }, "Failed to buy bait");
    }
  }

  private shouldStop(): boolean {
    if (!this.config.autoStop?.enabled) return false;

    // Check max catches
    if (
      this.config.autoStop.maxCatches &&
      this.stats.totalCatches >= this.config.autoStop.maxCatches
    ) {
      logger.info(`Auto-stop: Reached max catches (${this.config.autoStop.maxCatches})`);
    }

    return false;
  }

  private logStats(): void {
    const duration = Date.now() - this.stats.startTime;
    const minutes = Math.floor(duration / 60000);

    logger.info(
      {
        totalCatches: this.stats.totalCatches,
        errors: this.stats.errors,
        duration: `${minutes} minutes`,
      },
      "📊 Session Stats",
    );
  }
}
