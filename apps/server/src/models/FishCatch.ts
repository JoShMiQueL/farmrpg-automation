// Fish catch response types
import type { ApiResponse } from "./ApiResponse";

export interface FishCatchData {
  catch: {
    fishName: string;
  };
  stats: {
    totalFishCaught: number;
    fishingXpPercent: number;
  };
  resources: {
    stamina: number;
    bait: number;
  };
}

export type FishCatchResponse = ApiResponse<FishCatchData>;
