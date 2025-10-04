import type { ApiResponse } from "../api/response";

// Inventory models
export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  imageUrl: string;
}

export type InventoryCategory =
  | "items"
  | "fish"
  | "crops"
  | "seeds"
  | "loot"
  | "runestones"
  | "books"
  | "cards"
  | "rares";

export interface InventoryCategoryData {
  category: InventoryCategory;
  items: InventoryItem[];
}

export interface InventoryStats {
  uniqueItems: number;
  totalItems: number;
  maxCapacity: number;
}

export interface InventoryData {
  categories: InventoryCategoryData[];
  stats: InventoryStats;
}

export type InventoryResponse = ApiResponse<InventoryData>;
