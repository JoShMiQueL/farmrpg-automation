import type { ApiResponse } from "../api/response";

// Fish catch models
export interface FishCatch {
  id: number;
  name: string;
  image: string;
}

export interface FishingStats {
  totalFishCaught: number;
  fishingXpPercent: number;
}

export interface FishingResources {
  stamina: number;
  bait: number;
}

export interface FishCatchData {
  catch: FishCatch;
  stats: FishingStats;
  resources: FishingResources;
}

export interface BaitInfo {
  baitName: string;
  baitCount: number;
  streak: number;
  bestStreak: number;
}

export type FishCatchResponse = ApiResponse<FishCatchData>;
export type BaitInfoResponse = ApiResponse<BaitInfo>;
