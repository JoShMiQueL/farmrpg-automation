// API Request types
export interface BuyItemRequest {
  itemId: number;
  quantity: number; // -1 to buy all available with current silver
}

export interface SellItemRequest {
  itemId: number;
  quantity: number;
}

export interface SellAllItemsRequest {
  onlyCapped?: boolean;
}

export interface CatchFishRequest {
  locationId: number;
  baitId: number; // Bait type ID (e.g., 1 for Worms, 2 for Grubs, etc.)
}
