// Fishing bot service
import { farmRPGService } from "./";
import type { FishingBotConfig, FishingBotStatus } from "../models/FishingBot";
import { sleep, randomSleep } from "../utils/async";
import { BAIT_ITEM_ID } from "../utils/constants";

export class FishingBotService {
  private farmRPGService = farmRPGService;
  private isRunning = false;
  private status: FishingBotStatus = {
    isRunning: false,
    totalFishCaught: 0,
    totalBaitUsed: 0,
    totalBaitPurchased: 0,
    totalSilverSpent: 0,
    totalSilverEarned: 0,
    currentBait: 0,
    currentSilver: 0,
    currentItemCount: 0,
    lastAction: "Idle",
    errors: []
  };
  private config: FishingBotConfig = {
    minDelay: 2,
    maxDelay: 6,
    baitToBuy: 100
  };

  async start(config?: Partial<FishingBotConfig>): Promise<FishingBotStatus> {
    if (this.isRunning) {
      return this.status;
    }

    // Update config if provided
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Reset status
    this.status = {
      isRunning: true,
      totalFishCaught: 0,
      totalBaitUsed: 0,
      totalBaitPurchased: 0,
      totalSilverSpent: 0,
      totalSilverEarned: 0,
      currentBait: 0,
      currentSilver: 0,
      currentItemCount: 0,
      lastAction: "Starting...",
      startTime: new Date().toISOString(),
      errors: []
    };

    this.isRunning = true;
    this.runBot();

    return this.status;
  }

  stop(): FishingBotStatus {
    this.isRunning = false;
    this.status.isRunning = false;
    this.status.lastAction = "Stopped";
    return this.status;
  }

  getStatus(): FishingBotStatus {
    return { ...this.status };
  }

  private async runBot() {
    while (this.isRunning) {
      try {
        // Check inventory for items at cap
        await this.checkAndSellIfAtCap();

        // Try to catch fish
        const fishResult = await this.farmRPGService.catchFish();

        if (fishResult.error) {
          if (fishResult.status === 400) {
            // Out of bait - try to buy
            await this.handleOutOfBait();
          } else {
            this.status.errors.push(`Fishing error: ${fishResult.error}`);
            this.status.lastAction = `Error: ${fishResult.error}`;
          }
        } else {
          // Successfully caught fish
          this.status.totalFishCaught++;
          this.status.totalBaitUsed++;
          this.status.currentBait = fishResult.data?.resources.bait || 0;
          this.status.lastAction = `Caught ${fishResult.data?.catch.fishName}! (Bait: ${this.status.currentBait})`;
        }

        // Random delay between minDelay and maxDelay seconds
        await randomSleep(this.config.minDelay * 1000, this.config.maxDelay * 1000);

      } catch (error) {
        this.status.errors.push(error instanceof Error ? error.message : "Unknown error");
        this.status.lastAction = "Unexpected error, stopping...";
        this.stop();
        break;
      }
    }
  }

  private async checkAndSellIfAtCap() {
    const inventoryResult = await this.farmRPGService.getInventory();
    if (inventoryResult.error || !inventoryResult.data) return;

    const itemsAtCap = inventoryResult.data.items.filter(item => item.isAtCap);
    const totalItems = inventoryResult.data.items.reduce((sum, item) => sum + item.quantity, 0);

    this.status.currentItemCount = totalItems;

    if (itemsAtCap.length > 0) {
      this.status.lastAction = `${itemsAtCap.length} items at cap, selling...`;
      await this.sellCappedItemsAndUpdateStatus();
      await sleep(2000);
    }
  }

  private async handleOutOfBait() {
    this.status.lastAction = "Out of bait, attempting to buy...";
    
    // Update current stats
    const statsResult = await this.farmRPGService.getPlayerStats();
    if (statsResult.data) {
      this.status.currentSilver = statsResult.data.silver;
      this.status.currentBait = 0;
    }

    // Try to buy bait
    const buyResult = await this.farmRPGService.buyItem(BAIT_ITEM_ID, this.config.baitToBuy);
    
    if (buyResult.error) {
      // Not enough silver - sell items at cap and retry
      this.status.lastAction = "Not enough silver, selling items at cap...";
      await this.sellCappedItemsAndUpdateStatus();

      const retryBuyResult = await this.farmRPGService.buyItem(BAIT_ITEM_ID, this.config.baitToBuy);
      if (retryBuyResult.error) {
        this.status.errors.push(`Still can't buy bait: ${retryBuyResult.error}`);
        this.status.lastAction = "Cannot buy bait, stopping...";
        this.stop();
        return;
      }

      this.updateBaitPurchaseStatus(retryBuyResult.data);
    } else {
      this.updateBaitPurchaseStatus(buyResult.data);
    }
  }

  private async sellCappedItemsAndUpdateStatus() {
    const sellResult = await this.farmRPGService.sellAllItems(true);
    
    if (sellResult.error) {
      this.status.errors.push(`Failed to sell items: ${sellResult.error}`);
      this.status.lastAction = "Error selling items, stopping...";
      this.stop();
      return;
    }

    const silverEarned = sellResult.data?.totalSilver || 0;
    const itemsSold = sellResult.data?.itemsSold || 0;
    const itemTypes = sellResult.data?.itemTypes || 0;
    this.status.totalSilverEarned += silverEarned;
    this.status.currentSilver += silverEarned;
    this.status.currentItemCount = 0;
    this.status.lastAction = `Sold ${itemTypes} types (${itemsSold} items) for ${silverEarned} silver`;
  }

  private updateBaitPurchaseStatus(data: any) {
    if (!data) return;
    this.status.totalBaitPurchased += data.quantityPurchased || 0;
    this.status.totalSilverSpent += data.totalCost?.amount || 0;
    this.status.currentBait = data.quantityPurchased || 0;
    this.status.currentSilver = data.remainingCoins?.silver || 0;
    this.status.lastAction = `Bought ${data.quantityPurchased} bait`;
  }
}
