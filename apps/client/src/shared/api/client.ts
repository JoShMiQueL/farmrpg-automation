import type {
  ApiResponse,
  BaitInfoResponse,
  BuyItemResponse,
  FishCatchResponse,
  FishingBotResponse,
  InventoryResponse,
  ItemResponse,
  PlayerStatsResponse,
  SellAllItemsResponse,
  SellItemResponse,
} from "@farmrpg/types";

/**
 * Typed API client for FarmRPG backend
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    return response.json();
  }

  // Player endpoints
  async getPlayerStats(): Promise<PlayerStatsResponse> {
    return this.request("/api/player/stats");
  }

  // Inventory endpoints
  async getInventory(category?: string): Promise<InventoryResponse> {
    const params = category ? `?category=${category}` : "";
    return this.request(`/api/inventory${params}`);
  }

  // Item endpoints
  async getItemDetails(itemId: number): Promise<ItemResponse> {
    return this.request(`/api/item/${itemId}`);
  }

  async buyItem(itemId: number, quantity: number): Promise<BuyItemResponse> {
    return this.request("/api/item/buy", {
      method: "POST",
      body: JSON.stringify({ itemId, quantity }),
    });
  }

  async sellItem(itemId: number, quantity: number): Promise<SellItemResponse> {
    return this.request("/api/item/sell", {
      method: "POST",
      body: JSON.stringify({ itemId, quantity }),
    });
  }

  async sellAllItems(onlyCapped?: boolean): Promise<SellAllItemsResponse> {
    return this.request("/api/item/sell-all", {
      method: "POST",
      body: JSON.stringify({ onlyCapped }),
    });
  }

  // Fishing endpoints
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

  // Bot endpoints
  async getBotStatus(): Promise<FishingBotResponse> {
    return this.request("/api/bot/status");
  }

  async startBot(config?: any): Promise<FishingBotResponse> {
    return this.request("/api/bot/start", {
      method: "POST",
      body: JSON.stringify(config || {}),
    });
  }

  async stopBot(): Promise<FishingBotResponse> {
    return this.request("/api/bot/stop", {
      method: "POST",
    });
  }

  async pauseBot(): Promise<FishingBotResponse> {
    return this.request("/api/bot/pause", {
      method: "POST",
    });
  }

  async resumeBot(): Promise<FishingBotResponse> {
    return this.request("/api/bot/resume", {
      method: "POST",
    });
  }

  async updateBotConfig(config: any): Promise<FishingBotResponse> {
    return this.request("/api/bot/config", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
