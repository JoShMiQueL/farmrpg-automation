// Bot event types
export interface BotEvent {
  type: "status" | "catch" | "error" | "stats" | "bait_purchase";
  timestamp: string;
  data: any;
}

export interface BotStatusEvent extends BotEvent {
  type: "status";
  data: {
    status: string;
    message?: string;
    stats?: {
      totalCatches: number;
      errors: number;
    };
  };
}

export interface BotCatchEvent extends BotEvent {
  type: "catch";
  data: {
    catch: {
      id: number;
      name: string;
      image: string;
    };
    stats: {
      totalFishCaught: number;
      fishingXpPercent: number;
    };
    resources: {
      stamina: number;
      bait: number;
    };
    sessionStats: {
      totalCatches: number;
      errors: number;
      sessionStartTime?: string;
      lastCatchTime?: string;
    };
  };
}

export interface BotErrorEvent extends BotEvent {
  type: "error";
  data: {
    message: string;
    statusCode?: number;
  };
}

export interface BotStatsEvent extends BotEvent {
  type: "stats";
  data: {
    stats: {
      totalCatches: number;
      errors: number;
      sessionStartTime?: string;
      lastCatchTime?: string;
    };
    resources: {
      stamina: number;
      bait: number;
    };
  };
}

export interface BotBaitPurchaseEvent extends BotEvent {
  type: "bait_purchase";
  data: {
    itemId: number;
    itemName: string;
    quantityPurchased: number;
    totalCost: {
      amount: number;
      currency: string;
    };
    currentInventory: number;
    remainingCoins: {
      silver: number;
      gold: number;
    };
    newBaitCount: number;
  };
}
