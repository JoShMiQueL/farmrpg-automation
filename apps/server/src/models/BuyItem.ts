// Buy item models
import type { ApiResponse } from "./ApiResponse";

export interface BuyItemRequest {
  itemId: number;
  quantity: number; // -1 to buy all available with current silver
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

export type BuyItemResponse = ApiResponse<BuyItemResult>;
