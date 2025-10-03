// Refactored FarmRPG Service with separated responsibilities

import type { BuyItemResult } from "../models/BuyItem";
import type { FishCatchData } from "../models/FishCatch";
import type {
  InventoryCategory,
  InventoryCategoryData,
  InventoryData,
  InventoryItem,
  InventoryStats,
} from "../models/Inventory";
import type { ItemDetails } from "../models/Item";
import type { PlayerCoins } from "../models/PlayerStats";
import { sleep } from "../utils/async";
import { INVENTORY_CAP } from "../utils/constants";
import { HttpClient } from "./HttpClient";

export class FarmRPGService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient({
      baseUrl: "https://farmrpg.com",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.5",
        priority: "u=1, i",
        "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-requested-with": "XMLHttpRequest",
        cookie: process.env.FARMRPG_COOKIE || "",
        Referer: "https://farmrpg.com/",
      },
    });
  }

  // === PLAYER STATS METHODS ===

  async getPlayerStats(): Promise<{ status: number; data?: PlayerCoins; error?: string }> {
    const cachebuster = Date.now();
    const result = await this.http.get(`/worker.php?cachebuster=${cachebuster}&go=getstats`);

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data || "");

      const silverText = $('img[alt="Silver"]').next("strong").text();
      const silver = this.http.parseNumber(silverText);

      const goldText = $('img[alt="Gold"]').next("strong").text();
      const gold = this.http.parseNumber(goldText);

      return {
        status: 200,
        data: { silver, gold },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error",
      };
    }
  }

  // === ITEM METHODS ===

  async getItemDetails(
    itemId: number,
  ): Promise<{ status: number; data?: ItemDetails; error?: string }> {
    const result = await this.http.get(`/item.php?id=${itemId}`);

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data || "");

      const itemName = $(".navbar-inner .center a").text().trim();
      const description = $("#img").text().trim().split("\n").pop()?.trim() || "";
      const image = `https://farmrpg.com${$("#img img").attr("src")}` || "";

      const inventoryText = $(".item-title:contains('My Inventory')")
        .parent()
        .find(".item-after")
        .text()
        .trim();
      const inventoryQuantity = this.http.parseNumber(inventoryText);

      const buyPriceText = $(".item-title:contains('Buy Price')")
        .parent()
        .find(".item-after")
        .text()
        .trim();
      const buyPriceMatch = buyPriceText.match(/(\d+)\s+(Silver|Gold)/);
      const buyLocation = $(".item-title:contains('Buy Price') span").text().trim();

      const givableText = $(".item-title:contains('Givable')")
        .parent()
        .find(".item-after")
        .text()
        .trim();
      const givable = givableText.toLowerCase() === "yes";

      const helpRequestsText = $(".item-title:contains('Help Requests')")
        .parent()
        .find(".item-after")
        .text()
        .trim();
      const helpRequestsMatch = helpRequestsText.match(/(\d+)/);

      const craftingUse: ItemDetails["craftingUse"] = [];
      $(".list-block ul li a[href^='item.php']").each((_, elem) => {
        const craftItemName = $(elem).find(".item-title strong").text().trim();
        const craftItemHref = $(elem).attr("href") || "";
        const craftItemIdMatch = craftItemHref.match(/id=(\d+)/);
        const craftItemIdStr = craftItemIdMatch?.[1];
        const craftItemId = craftItemIdStr ? this.http.parseNumber(craftItemIdStr) : 0;
        const requirementsHtml = $(elem).find(".item-title span").html();
        const requirements = requirementsHtml
          ? requirementsHtml.split("<br/>").map((r) => r.trim())
          : [];
        const levelText = $(elem).find(".item-after").text().trim();
        const levelMatch = levelText.match(/(\d+)/);
        const levelStr = levelMatch?.[1];
        const requiredLevel = levelStr ? this.http.parseNumber(levelStr) : 0;

        if (craftItemName && craftItemId) {
          craftingUse.push({
            itemName: craftItemName,
            itemId: craftItemId,
            requirements,
            requiredLevel,
          });
        }
      });

      const itemDetails: ItemDetails = {
        id: itemId,
        name: itemName,
        description,
        image,
        inventory: inventoryQuantity > 0 ? { quantity: inventoryQuantity } : undefined,
        buyPrice:
          buyPriceMatch?.[1] && buyPriceMatch?.[2]
            ? {
                amount: this.http.parseNumber(buyPriceMatch[1]),
                currency: buyPriceMatch[2] as "Silver" | "Gold",
                location: buyLocation,
              }
            : undefined,
        givable,
        helpRequests: helpRequestsMatch?.[1]
          ? this.http.parseNumber(helpRequestsMatch[1])
          : undefined,
        craftingUse: craftingUse.length > 0 ? craftingUse : undefined,
      };

      return { status: 200, data: itemDetails };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error",
      };
    }
  }

  // === BUYING METHODS ===

  async buyItem(
    itemId: number,
    quantity: number,
  ): Promise<{ status: number; data?: BuyItemResult; error?: string }> {
    // Get item details and player stats
    const [itemResult, statsResult] = await Promise.all([
      this.getItemDetails(itemId),
      this.getPlayerStats(),
    ]);

    if (itemResult.error || !itemResult.data) {
      return {
        status: itemResult.status,
        error: itemResult.error || "Failed to fetch item details",
      };
    }

    if (statsResult.error || !statsResult.data) {
      return {
        status: statsResult.status,
        error: statsResult.error || "Failed to fetch player stats",
      };
    }

    const itemDetails = itemResult.data;
    if (!itemDetails.buyPrice) {
      return { status: 400, error: "Item is not available for purchase" };
    }

    const currentCoins = statsResult.data;
    const itemPrice = itemDetails.buyPrice.amount;
    const currency = itemDetails.buyPrice.currency;
    const currentInventory = itemDetails.inventory?.quantity || 0;

    // Calculate quantity to buy
    let quantityToBuy = quantity;
    if (quantity === -1) {
      quantityToBuy = Math.floor(
        (currency === "Silver" ? currentCoins.silver : currentCoins.gold) / itemPrice,
      );

      if (quantityToBuy === 0) {
        const available = currency === "Silver" ? currentCoins.silver : currentCoins.gold;
        return {
          status: 400,
          error: `Insufficient ${currency}. Need ${itemPrice} ${currency}, have ${available}`,
        };
      }
    } else {
      const totalCost = itemPrice * quantityToBuy;
      const availableCoins = currency === "Silver" ? currentCoins.silver : currentCoins.gold;

      if (totalCost > availableCoins) {
        return {
          status: 400,
          error: `Insufficient ${currency}. Need ${totalCost} ${currency}, have ${availableCoins}`,
        };
      }
    }

    // Check inventory cap
    const spaceAvailable = INVENTORY_CAP - currentInventory;
    if (spaceAvailable <= 0) {
      return {
        status: 400,
        error: `Inventory full. You have ${currentInventory}/${INVENTORY_CAP} items.`,
      };
    }

    if (quantityToBuy > spaceAvailable) {
      quantityToBuy = spaceAvailable;
    }

    // Make the purchase
    const result = await this.http.post(`/worker.php?go=buyitem&id=${itemId}&qty=${quantityToBuy}`);

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    const responseText = result.data?.trim() || "";
    const isSuccess = responseText.toLowerCase() === "success";
    const isNumericResponse = /^\d+$/.test(responseText);

    if (!isSuccess && !isNumericResponse) {
      return { status: 400, error: `Purchase failed: ${responseText}` };
    }

    if (isNumericResponse) {
      quantityToBuy = this.http.parseNumber(responseText);
    }

    const totalCost = itemPrice * quantityToBuy;
    const remainingCoins = {
      silver: currency === "Silver" ? currentCoins.silver - totalCost : currentCoins.silver,
      gold: currency === "Gold" ? currentCoins.gold - totalCost : currentCoins.gold,
    };

    // Get updated item details to get current inventory count
    const updatedItemResult = await this.getItemDetails(itemId);
    const finalInventory =
      updatedItemResult.data?.inventory?.quantity || currentInventory + quantityToBuy;

    return {
      status: 200,
      data: {
        itemId,
        itemName: itemDetails.name,
        quantityPurchased: quantityToBuy,
        currentInventory: finalInventory,
        totalCost: { amount: totalCost, currency },
        remainingCoins,
      },
    };
  }

  // === INVENTORY METHODS ===

  async getInventory(
    categoryFilter?: InventoryCategory | InventoryCategory[],
  ): Promise<{ status: number; data?: InventoryData; error?: string }> {
    const result = await this.http.get("/inventory.php");

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data || "");
      const categories: InventoryCategoryData[] = [];

      // Parse each category group
      $(".list-group").each((_, groupElem) => {
        const groupTitle = $(groupElem).find(".list-group-title").text().trim();

        // Determine category from group title
        let category: InventoryCategory | null = null;
        const lowerTitle = groupTitle.toLowerCase();

        if (lowerTitle.includes("items")) category = "items";
        else if (lowerTitle.includes("fish")) category = "fish";
        else if (lowerTitle.includes("crops")) category = "crops";
        else if (lowerTitle.includes("seeds")) category = "seeds";
        else if (lowerTitle.includes("loot")) category = "loot";
        else if (lowerTitle.includes("runestones")) category = "runestones";
        else if (lowerTitle.includes("books")) category = "books";
        else if (lowerTitle.includes("cards")) category = "cards";
        else if (lowerTitle.includes("rares")) category = "rares";

        if (!category) return;

        const items: InventoryItem[] = [];

        // Parse items in this category
        $(groupElem)
          .find("li")
          .not(".list-group-title")
          .each((_, itemElem) => {
            const itemLink = $(itemElem).find("a[href^='item.php']");

            // Skip if no link (e.g., "None" entries)
            if (itemLink.length === 0) return;

            const href = itemLink.attr("href") || "";
            const idMatch = href.match(/id=(\d+)/);
            const itemId = idMatch?.[1] ? this.http.parseNumber(idMatch[1]) : 0;

            const itemName = $(itemElem).find(".item-title strong").text().trim();

            // Get description (text after <br/> in item-title)
            const itemTitleHtml = $(itemElem).find(".item-title").html() || "";
            const descMatch = itemTitleHtml.match(/<span[^>]*>([^<]+)<\/span>/);
            const description = descMatch?.[1]?.trim() || "";

            const quantityText = $(itemElem).find(".item-after").text().trim();
            const quantity = this.http.parseNumber(quantityText);

            // Get image
            const imgSrc = $(itemElem).find(".item-media img").attr("src") || "";
            const imageUrl = imgSrc ? `https://farmrpg.com${imgSrc}` : "";

            if (itemId && itemName && quantity > 0) {
              items.push({
                id: itemId,
                name: itemName,
                description,
                quantity,
                imageUrl,
              });
            }
          });

        if (items.length > 0) {
          categories.push({ category, items });
        }
      });

      // Parse inventory stats from the card at the bottom
      const statsHtml = $(".card-content-inner:contains('Your inventory contains')").html() || "";
      const uniqueItemsMatch = statsHtml.match(/contains\s+<strong>(\d+)<\/strong>\s+unique items/);
      const totalItemsMatch = statsHtml.match(/and\s+<strong>(\d+)<\/strong>\s+items in total/);

      // Parse max capacity from the top card
      const capacityHtml = $(".card-content-inner:contains('cannot have more than')").html() || "";
      const maxCapacityMatch = capacityHtml.match(/more than\s+<strong>(\d+)<\/strong>/);

      const stats: InventoryStats = {
        uniqueItems: uniqueItemsMatch?.[1] ? this.http.parseNumber(uniqueItemsMatch[1]) : 0,
        totalItems: totalItemsMatch?.[1] ? this.http.parseNumber(totalItemsMatch[1]) : 0,
        maxCapacity: maxCapacityMatch?.[1] ? this.http.parseNumber(maxCapacityMatch[1]) : 200,
      };

      // Filter categories if categoryFilter is provided
      let filteredCategories = categories;

      if (categoryFilter) {
        const filters = Array.isArray(categoryFilter) ? categoryFilter : [categoryFilter];
        filteredCategories = categories.filter((cat) => filters.includes(cat.category));
      }

      return {
        status: 200,
        data: {
          categories: filteredCategories,
          stats,
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error",
      };
    }
  }

  async getBaitInfo(locationId: number = 1): Promise<{
    status: number;
    data?: { baitName: string; baitCount: number; streak: number; bestStreak: number };
    error?: string;
  }> {
    const cachebuster = Date.now();
    const result = await this.http.get(
      `/worker.php?cachebuster=${cachebuster}&go=baitarea&id=${locationId}`,
    );

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data || "");

      // Parse bait count from "Worms: <strong id="baitleft">0</strong>"
      const baitCountText = $("#baitleft").text().trim();
      const baitCount = this.http.parseNumber(baitCountText);

      // Parse bait name from hidden div
      const baitName = $("#last_bait").text().trim() || "Unknown";

      // Parse streak and best streak from "Streak: <strong>5,267</strong> &nbsp; Best: <strong>5,267</strong>"
      const streakText = $(".col-55:contains('Streak:')").html() || "";
      const streakMatch = streakText.match(/Streak:\s*<strong>([\d,]+)<\/strong>/);
      const bestStreakMatch = streakText.match(/Best:\s*<strong>([\d,]+)<\/strong>/);

      const streak = streakMatch?.[1] ? this.http.parseNumber(streakMatch[1].replace(/,/g, "")) : 0;
      const bestStreak = bestStreakMatch?.[1]
        ? this.http.parseNumber(bestStreakMatch[1].replace(/,/g, ""))
        : 0;

      return {
        status: 200,
        data: {
          baitName,
          baitCount,
          streak,
          bestStreak,
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error",
      };
    }
  }

  // === FISHING METHODS ===

  async catchFish(
    locationId: number = 1,
    baitAmount: number = 1,
  ): Promise<{ status: number; data?: FishCatchData; error?: string }> {
    // Generate random parameters
    const r = Math.floor(Math.random() * 1000000);
    const p = Math.floor(Math.random() * 1000);
    const q = Math.floor(Math.random() * 1000);

    const result = await this.http.post(
      `/worker.php?go=fishcaught&id=${locationId}&r=${r}&bamt=${baitAmount}&p=${p}&q=${q}`,
    );

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data || "");

      // Extract fish name from alt attribute
      const fishName = $("img.itemimg").attr("alt")?.trim() || "";

      // Extract fish image from src attribute
      const fishImageSrc = $("img.itemimg").attr("src")?.trim() || "";
      const fishImage = fishImageSrc ? `https://farmrpg.com${fishImageSrc}` : "";

      // Extract fish ID from image filename
      // Try numeric format first (e.g., /img/items/7718.PNG -> 7718)
      const fishIdMatch = fishImageSrc.match(/\/(\d+)\./);
      let fishId = fishIdMatch?.[1] ? this.http.parseNumber(fishIdMatch[1]) : 0;

      // If no numeric ID found, extract from filename (e.g., yellowperch.png -> 0, we'll use name as fallback)
      if (fishId === 0 && fishImageSrc) {
        // For non-numeric filenames, we can't determine the ID, so leave it as 0
        fishId = 0;
      }

      // Parse hidden stats
      const totalFishCaughtText = $("#fishcnt").text().trim();
      const totalFishCaught = this.http.parseNumber(totalFishCaughtText);

      const fishingXpPercentText = $("#fishingpb").text().trim();
      const fishingXpPercent = parseFloat(fishingXpPercentText) || 0;

      const staminaText = $("#staminacnt").text().trim();
      const stamina = this.http.parseNumber(staminaText);

      const baitText = $("#baitcnt").text().trim();
      const bait = this.http.parseNumber(baitText);

      if (!fishName || !fishImage) {
        return { status: 400, error: "Failed to catch fish - no fish data returned" };
      }

      return {
        status: 200,
        data: {
          catch: {
            id: fishId,
            name: fishName,
            image: fishImage,
          },
          stats: {
            totalFishCaught,
            fishingXpPercent,
          },
          resources: {
            stamina,
            bait,
          },
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error",
      };
    }
  }

  // === SELLING METHODS ===

  async sellItem(
    itemId: number,
    quantity: number,
  ): Promise<{ status: number; data?: number; error?: string }> {
    const result = await this.http.post(`/worker.php?go=sellitem&id=${itemId}&qty=${quantity}`);

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    const responseText = result.data?.trim() || "";

    // Empty string means invalid item ID
    if (responseText === "") {
      return { status: 404, error: "Item not found or invalid item ID" };
    }

    // "error" string means quantity exceeds what user has
    if (responseText.toLowerCase() === "error") {
      return { status: 400, error: "Insufficient quantity in inventory" };
    }

    // Response should be a number representing total sell value
    const totalSellValue = this.http.parseNumber(responseText);
    if (Number.isNaN(totalSellValue) || totalSellValue === 0) {
      return { status: 400, error: `Unexpected response: ${responseText}` };
    }

    return { status: 200, data: totalSellValue };
  }

  async sellAllItems(categoryFilter?: InventoryCategory): Promise<{
    status: number;
    data?: { totalSilver: number; itemsSold: number; itemTypes: number };
    error?: string;
  }> {
    const inventoryResult = await this.getInventory();
    if (inventoryResult.error || !inventoryResult.data) {
      return {
        status: inventoryResult.status,
        error: inventoryResult.error || "Failed to get inventory",
      };
    }

    // Collect all items to sell, optionally filtered by category
    const itemsToSell: InventoryItem[] = [];

    for (const categoryData of inventoryResult.data.categories) {
      if (!categoryFilter || categoryData.category === categoryFilter) {
        itemsToSell.push(...categoryData.items);
      }
    }

    if (itemsToSell.length === 0) {
      return { status: 200, data: { totalSilver: 0, itemsSold: 0, itemTypes: 0 } };
    }

    const statsBefore = await this.getPlayerStats();
    const silverBefore = statsBefore.data?.silver || 0;

    let itemsSold = 0;
    for (const item of itemsToSell) {
      const sellResult = await this.sellItem(item.id, item.quantity);
      if (!sellResult.error) {
        itemsSold += item.quantity;
      }
      await sleep(100);
    }

    const statsAfter = await this.getPlayerStats();
    const silverAfter = statsAfter.data?.silver || 0;
    const silverEarned = silverAfter - silverBefore;

    return {
      status: 200,
      data: {
        totalSilver: silverEarned,
        itemsSold,
        itemTypes: itemsToSell.length,
      },
    };
  }
}
