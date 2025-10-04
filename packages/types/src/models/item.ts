import type { ApiResponse } from "../api/response";

// Item models
export interface ItemDetails {
  id: number;
  name: string;
  description: string;
  image: string;
  inventory?: {
    quantity: number;
  };
  buyPrice?: {
    amount: number;
    currency: "Silver" | "Gold";
    location: string;
  };
  sellPrice?: {
    amount: number;
    currency: "Silver" | "Gold";
  };
  givable: boolean;
  helpRequests?: number;
  craftingUse?: Array<{
    itemName: string;
    itemId: number;
    requirements: string[];
    requiredLevel: number;
  }>;
}

export interface BuyItemResult {
  itemId: number;
  itemName: string;
  quantityPurchased: number;
  currentInventory: number;
  totalCost: {
    amount: number;
    currency: "Silver" | "Gold";
  };
  remainingCoins: {
    silver: number;
    gold: number;
  };
}

export interface SellItemResult {
  itemId: number;
  quantity: number;
  totalSilver: number;
}

export interface SellAllItemsResult {
  totalSilver: number;
  itemsSold: number;
  itemTypes: number;
}

export type ItemResponse = ApiResponse<ItemDetails>;
export type BuyItemResponse = ApiResponse<BuyItemResult>;
export type SellItemResponse = ApiResponse<SellItemResult>;
export type SellAllItemsResponse = ApiResponse<SellAllItemsResult>;
