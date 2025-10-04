// Fishing bot service with automated fishing logic

import type { BotConfig, BotEvent, BotState, BotStatus } from "@farmrpg/types";
import { BotStatus as Status } from "@farmrpg/types";
import type { FarmRPGService } from "./FarmRPGService";

export class FishingBotService {
  private state: BotState;
  private farmRPGService: FarmRPGService;
  private runningInterval?: Timer;
  private eventCallbacks: Set<(event: BotEvent) => void> = new Set();

  constructor(farmRPGService: FarmRPGService) {
    this.farmRPGService = farmRPGService;
    this.state = this.createInitialState();
  }

  private createInitialState(): BotState {
    return {
      status: Status.IDLE,
      config: {
        locationId: 1,
        baitId: 1, // Default: Worms (bait type ID 1)
        autoBuyBait: {
          enabled: false,
          baitItemId: 18, // Default: Worms (item ID 18)
          minBaitCount: 10,
          buyQuantity: 100,
        },
        autoStop: {
          enabled: true,
          noBait: true,
          noStamina: true,
        },
        delay: {
          min: 1000,
          max: 3000,
        },
      },
      stats: {
        totalCatches: 0,
        errors: 0,
      },
    };
  }

  // Subscribe to bot events
  public subscribe(callback: (event: BotEvent) => void): () => void {
    this.eventCallbacks.add(callback);
    return () => {
      this.eventCallbacks.delete(callback);
    };
  }

  private emitEvent(type: BotEvent["type"], data: any) {
    const event: BotEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    for (const callback of this.eventCallbacks) {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in event callback:", error);
      }
    }
  }

  public getState(): BotState {
    return { ...this.state };
  }

  public updateConfig(config: Partial<BotConfig>): void {
    this.state.config = {
      ...this.state.config,
      ...config,
      autoBuyBait: config.autoBuyBait
        ? { ...this.state.config.autoBuyBait, ...config.autoBuyBait }
        : this.state.config.autoBuyBait,
      autoStop: config.autoStop
        ? { ...this.state.config.autoStop, ...config.autoStop }
        : this.state.config.autoStop,
      delay: config.delay
        ? { ...this.state.config.delay, ...config.delay }
        : this.state.config.delay,
    };

    this.emitEvent("status", {
      status: this.state.status,
      message: "Configuration updated",
      config: this.state.config,
    });
  }

  private updateStatus(status: BotStatus, error?: string) {
    this.state.status = status;
    if (error) {
      this.state.lastError = error;
    }

    this.emitEvent("status", {
      status,
      error,
      stats: this.state.stats,
    });
  }

  public async start(): Promise<void> {
    if (this.state.status === Status.RUNNING) {
      throw new Error("Bot is already running");
    }

    this.state.stats = {
      totalCatches: 0,
      errors: 0,
      sessionStartTime: new Date().toISOString(),
    };

    this.updateStatus(Status.RUNNING);
    await this.runFishingLoop();
  }

  public stop(): void {
    if (this.runningInterval) {
      clearTimeout(this.runningInterval);
      this.runningInterval = undefined;
    }

    this.updateStatus(Status.STOPPED);
  }

  public pause(): void {
    if (this.state.status !== Status.RUNNING) {
      throw new Error("Bot is not running");
    }

    if (this.runningInterval) {
      clearTimeout(this.runningInterval);
      this.runningInterval = undefined;
    }

    this.updateStatus(Status.PAUSED);
  }

  public resume(): void {
    if (this.state.status !== Status.PAUSED) {
      throw new Error("Bot is not paused");
    }

    this.updateStatus(Status.RUNNING);
    this.runFishingLoop();
  }

  private async buyBait(itemId: number, quantity: number): Promise<boolean> {
    try {
      const result = await this.farmRPGService.buyItem(itemId, quantity);

      if (result.error || !result.data) {
        this.emitEvent("error", {
          message: `Failed to buy bait: ${result.error || "Unknown error"}`,
        });
        return false;
      }

      // Update current resources with new bait count
      if (this.state.currentResources) {
        // Get updated bait info to get accurate count
        const baitInfo = await this.farmRPGService.getBaitInfo(this.state.config.locationId);
        if (baitInfo.data) {
          this.state.currentResources.bait = baitInfo.data.baitCount;
        }
      }

      this.emitEvent("bait_purchase", {
        itemId,
        itemName: result.data.itemName,
        quantityPurchased: result.data.quantityPurchased,
        totalCost: result.data.totalCost,
        currentInventory: result.data.currentInventory,
        remainingCoins: result.data.remainingCoins,
        newBaitCount: this.state.currentResources?.bait,
      });

      return true;
    } catch (error) {
      this.emitEvent("error", {
        message: `Exception while buying bait: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
      return false;
    }
  }

  private async runFishingLoop(): Promise<void> {
    if (this.state.status !== Status.RUNNING) {
      return;
    }

    try {
      // Check if we need to buy bait before fishing
      if (this.state.config.autoBuyBait?.enabled && this.state.currentResources) {
        const autoBuyConfig = this.state.config.autoBuyBait;
        if (this.state.currentResources.bait < autoBuyConfig.minBaitCount) {
          await this.buyBait(autoBuyConfig.baitItemId, autoBuyConfig.buyQuantity);
        }
      }

      // Attempt to catch fish
      const result = await this.farmRPGService.catchFish(
        this.state.config.locationId,
        this.state.config.baitId,
      );

      if (result.error) {
        this.state.stats.errors++;
        this.state.lastError = result.error;

        this.emitEvent("error", {
          message: result.error,
          statusCode: result.status,
        });

        // Check if we should try to buy bait on error
        if (result.error.toLowerCase().includes("bait")) {
          if (this.state.config.autoBuyBait?.enabled) {
            const autoBuyConfig = this.state.config.autoBuyBait;
            const buyResult = await this.buyBait(
              autoBuyConfig.baitItemId,
              autoBuyConfig.buyQuantity,
            );

            if (!buyResult) {
              // Failed to buy bait, stop if configured
              if (this.state.config.autoStop?.noBait) {
                this.updateStatus(Status.STOPPED, "Out of bait and failed to auto-buy");
                return;
              }
            }
          } else if (this.state.config.autoStop?.noBait) {
            this.updateStatus(Status.STOPPED, "Out of bait");
            return;
          }
        }

        if (
          result.error.toLowerCase().includes("stamina") &&
          this.state.config.autoStop?.noStamina
        ) {
          this.updateStatus(Status.STOPPED, "Out of stamina");
          return;
        }
      } else if (result.data) {
        // Successful catch
        this.state.stats.totalCatches++;
        this.state.stats.lastCatchTime = new Date().toISOString();
        this.state.currentResources = result.data.resources;

        this.emitEvent("catch", {
          catch: result.data.catch,
          stats: result.data.stats,
          resources: result.data.resources,
          sessionStats: this.state.stats,
        });

        // Check auto-stop conditions
        if (this.state.config.autoStop?.enabled) {
          if (
            this.state.config.autoStop.maxCatches &&
            this.state.stats.totalCatches >= this.state.config.autoStop.maxCatches
          ) {
            this.updateStatus(Status.STOPPED, "Max catches reached");
            return;
          }

          if (this.state.config.autoStop.noBait && result.data.resources.bait === 0) {
            // Try to buy bait if auto-buy is enabled
            if (this.state.config.autoBuyBait?.enabled) {
              const autoBuyConfig = this.state.config.autoBuyBait;
              const buyResult = await this.buyBait(
                autoBuyConfig.baitItemId,
                autoBuyConfig.buyQuantity,
              );

              if (!buyResult) {
                this.updateStatus(Status.STOPPED, "Out of bait and failed to auto-buy");
                return;
              }
            } else {
              this.updateStatus(Status.STOPPED, "Out of bait");
              return;
            }
          }

          if (this.state.config.autoStop.noStamina && result.data.resources.stamina === 0) {
            this.updateStatus(Status.STOPPED, "Out of stamina");
            return;
          }
        }

        // Emit stats update
        this.emitEvent("stats", {
          stats: this.state.stats,
          resources: this.state.currentResources,
        });
      }

      // Schedule next iteration with random delay
      const delayConfig = this.state.config.delay;
      if (!delayConfig) {
        return;
      }
      const delay = Math.random() * (delayConfig.max - delayConfig.min) + delayConfig.min;

      this.runningInterval = setTimeout(() => {
        this.runFishingLoop();
      }, delay);
    } catch (error) {
      this.state.stats.errors++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.state.lastError = errorMessage;

      this.emitEvent("error", {
        message: errorMessage,
      });

      this.updateStatus(Status.ERROR, errorMessage);
    }
  }
}
