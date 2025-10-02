// Item models
import type { ApiResponse } from "./ApiResponse";

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

export type ItemResponse = ApiResponse<ItemDetails>;
