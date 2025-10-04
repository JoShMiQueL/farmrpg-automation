// Application constants

// Inventory
export const INVENTORY_CAP = 200;

// Items
export const BAIT_ITEM_ID = 18; // Worms item ID

// FarmRPG API
export const FARMRPG_BASE_URL = "https://farmrpg.com";

// Bot defaults
export const DEFAULT_BOT_CONFIG = {
  locationId: 1,
  baitId: 1,
  delay: {
    min: 1000,
    max: 3000,
  },
  autoBuyBait: {
    enabled: false,
    baitItemId: BAIT_ITEM_ID,
    minBaitCount: 10,
    buyQuantity: 100,
  },
  autoStop: {
    enabled: true,
    noBait: true,
    noStamina: true,
  },
} as const;

// HTTP
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const DEFAULT_RETRY_DELAY = 1000; // 1 second
