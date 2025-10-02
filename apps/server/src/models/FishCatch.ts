// Fish catch models
import type { ApiResponse } from "./ApiResponse";

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

export type FishCatchResponse = ApiResponse<FishCatchData>;
