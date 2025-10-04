import { env } from "@farmrpg/config";
import type { BaitInfoResponse, BuyItemResponse, FishCatchResponse } from "@farmrpg/types";

/**
 * Simple API client for bot operations
 */
export class BotApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `http://localhost:${env.PORT}`;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = (await response.json()) as any;

    if (!data.success) {
      throw new Error(data.error?.message || "API request failed");
    }

    return data as T;
  }

  async catchFish(locationId: number, baitId: number): Promise<FishCatchResponse> {
    return this.request("/api/fish/catch", {
      method: "POST",
      body: JSON.stringify({ locationId, baitId }),
    });
  }

  async getBaitInfo(locationId?: number): Promise<BaitInfoResponse> {
    const params = locationId ? `?locationId=${locationId}` : "";
    return this.request(`/api/fish/bait${params}`);
  }

  async buyItem(itemId: number, quantity: number): Promise<BuyItemResponse> {
    return this.request("/api/item/buy", {
      method: "POST",
      body: JSON.stringify({ itemId, quantity }),
    });
  }
}
