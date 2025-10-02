// Fishing bot models
import type { ApiResponse } from "./ApiResponse";

export interface FishingBotConfig {
  minDelay: number; // Minimum delay in seconds (default: 2)
  maxDelay: number; // Maximum delay in seconds (default: 6)
  baitToBuy: number; // Amount of bait to buy when out (default: 100)
}

export interface FishingBotStatus {
  isRunning: boolean;
  totalFishCaught: number;
  totalBaitUsed: number;
  totalBaitPurchased: number;
  totalSilverSpent: number;
  totalSilverEarned: number;
  currentBait: number;
  currentSilver: number;
  currentItemCount: number;
  lastAction: string;
  startTime?: string;
  errors: string[];
}

export type FishingBotStatusResponse = ApiResponse<FishingBotStatus>;

export interface FishingBotControl {
  action: "start" | "stop" | "status";
  config?: FishingBotConfig;
}

export type FishingBotControlResponse = ApiResponse<FishingBotStatus>;
