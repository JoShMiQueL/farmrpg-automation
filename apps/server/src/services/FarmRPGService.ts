// Refactored FarmRPG Service with separated responsibilities
import { HttpClient } from "./HttpClient";
import { sleep } from "../utils/async";
import { INVENTORY_CAP, BAIT_ITEM_ID, DEFAULT_FISHING_LOCATION, DEFAULT_BAIT_AMOUNT, DEFAULT_FISHING_PARAMS } from "../utils/constants";
import type { FishCatchData } from "../models/FishCatch";
import type { PlayerCoins } from "../models/PlayerStats";
import type { ItemDetails } from "../models/Item";
import type { BuyItemResult } from "../models/BuyItem";
import type { InventoryItem, InventoryData } from "../models/Inventory";

export class FarmRPGService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient({
      baseUrl: "https://farmrpg.com",
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.5",
        "priority": "u=1, i",
        "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-requested-with": "XMLHttpRequest",
        "cookie": process.env.FARMRPG_COOKIE || "",
        "Referer": "https://farmrpg.com/"
      }
    });
  }

  // === FISHING METHODS ===
  
  async catchFish(params?: {
    id?: number;      // Location ID
    r?: number;       // Random value
    bamt?: number;    // Bait amount
    p?: number;       // Unknown parameter
    q?: number;       // Unknown parameter
  }): Promise<{ status: number; data?: FishCatchData; error?: string }> {
    const id = params?.id ?? DEFAULT_FISHING_LOCATION;
    const r = params?.r ?? Math.floor(Math.random() * 1000000);
    const bamt = params?.bamt ?? DEFAULT_BAIT_AMOUNT;
    const p = params?.p ?? DEFAULT_FISHING_PARAMS.p;
    const q = params?.q ?? DEFAULT_FISHING_PARAMS.q;
    
    const result = await this.http.get(`/worker.php?go=fishcaught&id=${id}&r=${r}&bamt=${bamt}&p=${p}&q=${q}`);
    
    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const html = result.data!;
      const $ = this.http.parseHtml(html);

      // Check for "no bait" error
      if (html.includes("You do not have any bait")) {
        return { status: 400, error: "No bait available" };
      }

      const fishName = $(".content-block-title").first().text().trim();
      const totalFishText = $("strong:contains('Total Fish Caught:')").text();
      const totalFishMatch = totalFishText.match(/(\d+)/);
      const totalFishCaught = this.http.parseNumber(totalFishMatch?.[1] || "0");

      const fishingXpText = $("strong:contains('Fishing XP:')").parent().text();
      const fishingXpMatch = fishingXpText.match(/(\d+)%/);
      const fishingXpPercent = this.http.parseNumber(fishingXpMatch?.[1] || "0");

      const staminaText = $("strong:contains('Stamina:')").parent().text();
      const staminaMatch = staminaText.match(/(\d+)/);
      const staminaLeft = this.http.parseNumber(staminaMatch?.[1] || "0");

      const baitText = $("strong:contains('Bait Left:')").parent().text();
      const baitMatch = baitText.match(/(\d+)/);
      const baitLeft = this.http.parseNumber(baitMatch?.[1] || "0");

      return {
        status: 200,
        data: {
          catch: { fishName },
          stats: { totalFishCaught, fishingXpPercent },
          resources: { stamina: staminaLeft, bait: baitLeft }
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error"
      };
    }
  }

  // === PLAYER STATS METHODS ===

  async getPlayerStats(): Promise<{ status: number; data?: PlayerCoins; error?: string }> {
    const cachebuster = Date.now();
    const result = await this.http.get(`/worker.php?cachebuster=${cachebuster}&go=getstats`);

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data!);

      const silverText = $('img[alt="Silver"]').next('strong').text();
      const silver = this.http.parseNumber(silverText);

      const goldText = $('img[alt="Gold"]').next('strong').text();
      const gold = this.http.parseNumber(goldText);

      return {
        status: 200,
        data: { silver, gold }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error"
      };
    }
  }

  // === ITEM METHODS ===

  async getItemDetails(itemId: number): Promise<{ status: number; data?: ItemDetails; error?: string }> {
    const result = await this.http.get(`/item.php?id=${itemId}`);

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data!);

      const itemName = $(".navbar-inner .center a").text().trim();
      const description = $("#img").text().trim().split("\n").pop()?.trim() || "";
      const image = `https://farmrpg.com${$("#img img").attr("src")}` || "";

      const inventoryText = $(".item-title:contains('My Inventory')").parent().find(".item-after").text().trim();
      const inventoryQuantity = this.http.parseNumber(inventoryText);

      const buyPriceText = $(".item-title:contains('Buy Price')").parent().find(".item-after").text().trim();
      const buyPriceMatch = buyPriceText.match(/(\d+)\s+(Silver|Gold)/);
      const buyLocation = $(".item-title:contains('Buy Price') span").text().trim();

      const givableText = $(".item-title:contains('Givable')").parent().find(".item-after").text().trim();
      const givable = givableText.toLowerCase() === "yes";

      const helpRequestsText = $(".item-title:contains('Help Requests')").parent().find(".item-after").text().trim();
      const helpRequestsMatch = helpRequestsText.match(/(\d+)/);

      const craftingUse: ItemDetails["craftingUse"] = [];
      $(".list-block ul li a[href^='item.php']").each((_, elem) => {
        const craftItemName = $(elem).find(".item-title strong").text().trim();
        const craftItemHref = $(elem).attr("href") || "";
        const craftItemIdMatch = craftItemHref.match(/id=(\d+)/);
        const craftItemIdStr = craftItemIdMatch?.[1];
        const craftItemId = craftItemIdStr ? this.http.parseNumber(craftItemIdStr) : 0;
        const requirementsHtml = $(elem).find(".item-title span").html();
        const requirements = requirementsHtml ? requirementsHtml.split("<br/>").map(r => r.trim()) : [];
        const levelText = $(elem).find(".item-after").text().trim();
        const levelMatch = levelText.match(/(\d+)/);
        const levelStr = levelMatch?.[1];
        const requiredLevel = levelStr ? this.http.parseNumber(levelStr) : 0;

        if (craftItemName && craftItemId) {
          craftingUse.push({
            itemName: craftItemName,
            itemId: craftItemId,
            requirements,
            requiredLevel
          });
        }
      });

      const itemDetails: ItemDetails = {
        id: itemId,
        name: itemName,
        description,
        image,
        inventory: inventoryQuantity > 0 ? { quantity: inventoryQuantity } : undefined,
        buyPrice: buyPriceMatch?.[1] && buyPriceMatch?.[2] ? {
          amount: this.http.parseNumber(buyPriceMatch[1]),
          currency: buyPriceMatch[2] as "Silver" | "Gold",
          location: buyLocation
        } : undefined,
        givable,
        helpRequests: helpRequestsMatch?.[1] ? this.http.parseNumber(helpRequestsMatch[1]) : undefined,
        craftingUse: craftingUse.length > 0 ? craftingUse : undefined
      };

      return { status: 200, data: itemDetails };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error"
      };
    }
  }

  // === BUYING METHODS ===

  async buyItem(itemId: number, quantity: number): Promise<{ status: number; data?: BuyItemResult; error?: string }> {
    // Get item details and player stats
    const [itemResult, statsResult] = await Promise.all([
      this.getItemDetails(itemId),
      this.getPlayerStats()
    ]);

    if (itemResult.error || !itemResult.data) {
      return { status: itemResult.status, error: itemResult.error || "Failed to fetch item details" };
    }

    if (statsResult.error || !statsResult.data) {
      return { status: statsResult.status, error: statsResult.error || "Failed to fetch player stats" };
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
        (currency === "Silver" ? currentCoins.silver : currentCoins.gold) / itemPrice
      );

      if (quantityToBuy === 0) {
        const available = currency === "Silver" ? currentCoins.silver : currentCoins.gold;
        return {
          status: 400,
          error: `Insufficient ${currency}. Need ${itemPrice} ${currency}, have ${available}`
        };
      }
    } else {
      const totalCost = itemPrice * quantityToBuy;
      const availableCoins = currency === "Silver" ? currentCoins.silver : currentCoins.gold;

      if (totalCost > availableCoins) {
        return {
          status: 400,
          error: `Insufficient ${currency}. Need ${totalCost} ${currency}, have ${availableCoins}`
        };
      }
    }

    // Check inventory cap
    const spaceAvailable = INVENTORY_CAP - currentInventory;
    if (spaceAvailable <= 0) {
      return {
        status: 400,
        error: `Inventory full. You have ${currentInventory}/${INVENTORY_CAP} items.`
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

    const responseText = result.data!.trim();
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
      gold: currency === "Gold" ? currentCoins.gold - totalCost : currentCoins.gold
    };

    // Get updated item details to get current inventory count
    const updatedItemResult = await this.getItemDetails(itemId);
    const finalInventory = updatedItemResult.data?.inventory?.quantity || (currentInventory + quantityToBuy);

    return {
      status: 200,
      data: {
        itemId,
        itemName: itemDetails.name,
        quantityPurchased: quantityToBuy,
        currentInventory: finalInventory,
        totalCost: { amount: totalCost, currency },
        remainingCoins
      }
    };
  }

  // === INVENTORY METHODS ===

  async getInventory(): Promise<{ status: number; data?: InventoryData; error?: string }> {
    const result = await this.http.get("/market.php");

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data!);
      const items: InventoryItem[] = [];

      $("li.close-panel").each((_, elem) => {
        const itemLink = $(elem).find("a[href^='item.php']");
        const href = itemLink.attr("href") || "";
        const idMatch = href.match(/id=(\d+)/);
        const itemId = idMatch?.[1] ? this.http.parseNumber(idMatch[1]) : 0;

        const itemName = $(elem).find(".item-title strong").text().trim();
        const quantityInput = $(elem).find("input.qty");
        const quantityText = quantityInput.attr("value") || "0";
        const quantity = this.http.parseNumber(quantityText);

        // Check if at cap (red text)
        const isAtCap = quantityInput.attr("style")?.includes("color:red") || false;

        // Get price per item
        const priceAttr = quantityInput.attr("data-price") || "0";
        const price = this.http.parseNumber(priceAttr);

        // Get image
        const imgSrc = $(elem).find(".item-media img").attr("src") || "";
        const imageUrl = imgSrc ? `https://farmrpg.com${imgSrc}` : "";

        const hasSellButton = $(elem).find(".sellbtn").length > 0;

        if (itemId && itemName && quantity > 0 && hasSellButton) {
          items.push({
            id: itemId,
            name: itemName,
            quantity,
            price,
            totalValue: price * quantity,
            isAtCap,
            imageUrl
          });
        }
      });

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

      return {
        status: 200,
        data: {
          items,
          totalItems,
          totalValue
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error"
      };
    }
  }

  async getFishInventory(): Promise<{ status: number; data?: Array<{ id: number; name: string; quantity: number }>; error?: string }> {
    const result = await this.http.get("/market.php");

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    try {
      const $ = this.http.parseHtml(result.data!);
      const fishItems: Array<{ id: number; name: string; quantity: number }> = [];

      $("li.close-panel").each((_, elem) => {
        const itemLink = $(elem).find("a[href^='item.php']");
        const href = itemLink.attr("href") || "";
        const idMatch = href.match(/id=(\d+)/);
        const itemId = idMatch?.[1] ? this.http.parseNumber(idMatch[1]) : 0;

        const itemName = $(elem).find(".item-title strong").text().trim();
        const quantityInput = $(elem).find("input.qty");
        const quantityText = quantityInput.attr("value") || "0";
        const quantity = this.http.parseNumber(quantityText);

        const hasSellButton = $(elem).find(".sellbtn").length > 0;

        // Exclude worms (id=18) and other bait items
        if (itemId && itemName && quantity > 0 && hasSellButton && itemId !== 18) {
          fishItems.push({ id: itemId, name: itemName, quantity });
        }
      });

      return { status: 200, data: fishItems };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Parse error"
      };
    }
  }

  // === SELLING METHODS ===

  async sellItem(itemId: number, quantity: number): Promise<{ status: number; data?: number; error?: string }> {
    const result = await this.http.post(`/worker.php?go=sellitem&id=${itemId}&qty=${quantity}`);

    if (result.error) {
      return { status: result.status, error: result.error };
    }

    const responseText = result.data!.trim();

    if (responseText.toLowerCase() !== "success") {
      return { status: 400, error: `Sell failed: ${responseText}` };
    }

    return { status: 200, data: quantity };
  }

  async sellAllItems(onlyCapped: boolean = false): Promise<{ status: number; data?: { totalSilver: number; itemsSold: number; itemTypes: number }; error?: string }> {
    const inventoryResult = await this.getInventory();
    if (inventoryResult.error || !inventoryResult.data) {
      return {
        status: inventoryResult.status,
        error: inventoryResult.error || "Failed to get inventory"
      };
    }

    const itemsToSell = onlyCapped 
      ? inventoryResult.data.items.filter(item => item.isAtCap)
      : inventoryResult.data.items;
    
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
        itemTypes: itemsToSell.length
      }
    };
  }
}
