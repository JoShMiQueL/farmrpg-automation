// Player statistics models
import type { ApiResponse } from "./ApiResponse";

export interface PlayerCoins {
  silver: number;
  gold: number;
}

export type PlayerStatsResponse = ApiResponse<PlayerCoins>;
