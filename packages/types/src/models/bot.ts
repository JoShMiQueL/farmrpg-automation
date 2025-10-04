import type { ApiResponse } from "../api/response";

// Models for fishing bot functionality
export enum BotStatus {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  STOPPED = "stopped",
  ERROR = "error",
}

export interface BotConfig {
  locationId: number;
  baitId: number; // Bait type ID (e.g., 1 for Worms, 2 for Grubs, etc.)
  autoBuyBait?: {
    enabled: boolean;
    baitItemId: number; // Item ID for the bait to purchase
    minBaitCount: number; // Buy bait when count falls below this
    buyQuantity: number; // How many to buy each time
  };
  autoStop?: {
    enabled: boolean;
    maxCatches?: number;
    noBait?: boolean;
    noStamina?: boolean;
  };
  delay?: {
    min: number; // milliseconds
    max: number; // milliseconds
  };
}

export interface BotState {
  status: BotStatus;
  config: BotConfig;
  stats: {
    totalCatches: number;
    sessionStartTime?: string;
    lastCatchTime?: string;
    errors: number;
  };
  currentResources?: {
    stamina: number;
    bait: number;
  };
  lastError?: string;
}

export interface BotCommand {
  action: "start" | "stop" | "pause" | "resume" | "status" | "config";
  config?: Partial<BotConfig>;
}

export type FishingBotResponse = ApiResponse<BotState>;
