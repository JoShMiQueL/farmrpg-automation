import { DEFAULT_BOT_CONFIG } from "@farmrpg/config";
import type { BotConfig } from "@farmrpg/types";

/**
 * Bot configuration
 * Can be overridden via environment variables or CLI arguments
 */
export const botConfig: BotConfig = {
  ...DEFAULT_BOT_CONFIG,
  // Override defaults here if needed
  locationId: Number(process.env.FISHING_LOCATION_ID) || 1,
  baitId: Number(process.env.FISHING_BAIT_ID) || 1,
  delay: {
    min: Number(process.env.DELAY_MIN) || 1000,
    max: Number(process.env.DELAY_MAX) || 3000,
  },
  autoBuyBait: {
    enabled: process.env.AUTO_BUY_BAIT === "true",
    baitItemId: Number(process.env.BAIT_ITEM_ID) || 18,
    minBaitCount: Number(process.env.MIN_BAIT_COUNT) || 10,
    buyQuantity: Number(process.env.BUY_QUANTITY) || 100,
  },
  autoStop: {
    enabled: process.env.AUTO_STOP === "true" || true,
    maxCatches: Number(process.env.MAX_CATCHES) || undefined,
    noBait: process.env.STOP_NO_BAIT !== "false",
    noStamina: process.env.STOP_NO_STAMINA !== "false",
  },
};
