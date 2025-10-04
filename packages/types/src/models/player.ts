import type { ApiResponse } from "../api/response";

// Player statistics models
export interface PlayerCoins {
  silver: number;
  gold: number;
}

export type PlayerStatsResponse = ApiResponse<PlayerCoins>;
