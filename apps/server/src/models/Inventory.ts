// Inventory models
import type { ApiResponse } from "./ApiResponse";

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
  isAtCap: boolean;
  imageUrl: string;
}

export interface InventoryData {
  items: InventoryItem[];
  totalItems: number;
  totalValue: number;
}

export type InventoryResponse = ApiResponse<InventoryData>;
