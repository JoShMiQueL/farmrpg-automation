// Service layer for external API calls
import * as cheerio from "cheerio";
import type { FishCatchData } from "../models/FishCatch";
import type { PlayerCoins } from "../models/PlayerStats";
import type { ItemDetails } from "../models/Item";
import type { BuyItemResult } from "../models/BuyItem";

export class FarmRPGService {
  private readonly baseUrl = "https://farmrpg.com";
  private readonly headers = {
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
  };

  async catchFish(): Promise<{ status: number; data?: FishCatchData; error?: string }> {
    try {
      const res = await fetch(
        `${this.baseUrl}/worker.php?go=fishcaught&id=1&r=335405&bamt=1&p=481&q=803`,
        {
          headers: this.headers,
          body: null,
          method: "POST"
        }
      );

      if (res.status !== 200) {
        return {
          status: res.status,
          error: "Failed to catch fish from upstream service"
        };
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      const fishName = $("img").attr("alt");
      const totalFishCaught = Number.parseInt($("#fishcnt").text());
      const fishingXpPercent = Number.parseFloat($("#fishingpb").text());
      const staminaLeft = Number.parseInt($("#staminacnt").text());
      const baitLeft = Number.parseInt($("#baitcnt").text());

      if (fishName == null) {
        return {
          status: 400,
          error: "No bait remaining to catch fish"
        };
      }

      return {
        status: 200,
        data: {
          catch: {
            fishName: fishName
          },
          stats: {
            totalFishCaught: totalFishCaught,
            fishingXpPercent: fishingXpPercent
          },
          resources: {
            stamina: staminaLeft,
            bait: baitLeft
          }
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getPlayerStats(): Promise<{ status: number; data?: PlayerCoins; error?: string }> {
    try {
      const cachebuster = Date.now();
      const res = await fetch(
        `${this.baseUrl}/worker.php?cachebuster=${cachebuster}&go=getstats`,
        {
          headers: this.headers,
          method: "GET"
        }
      );

      if (res.status !== 200) {
        return {
          status: res.status,
          error: "Failed to fetch player stats from upstream service"
        };
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Parse silver coins
      const silverImg = $('img[alt="Silver"]');
      const silverText = silverImg.next('strong').text().replace(/,/g, '');
      const silver = Number.parseInt(silverText) || 0;

      // Parse gold coins
      const goldImg = $('img[alt="Gold"]');
      const goldText = goldImg.next('strong').text().replace(/,/g, '');
      const gold = Number.parseInt(goldText) || 0;

      return {
        status: 200,
        data: {
          silver,
          gold
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getItemDetails(itemId: number): Promise<{ status: number; data?: ItemDetails; error?: string }> {
    try {
      const res = await fetch(
        `${this.baseUrl}/item.php?id=${itemId}`,
        {
          headers: this.headers,
          method: "GET"
        }
      );

      if (res.status !== 200) {
        return {
          status: res.status,
          error: "Failed to fetch item details from upstream service"
        };
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Extract item name from navbar
      const itemName = $(".navbar-inner .center a").text().trim();
      
      // Extract description
      const description = $("#img").text().trim().split("\n").pop()?.trim() || "";
      
      // Extract image
      const image = `${this.baseUrl}${$("#img img").attr("src")}` || "";
      
      // Extract inventory quantity
      const inventoryText = $(".item-title:contains('My Inventory')").parent().find(".item-after").text().trim();
      const inventoryQuantity = Number.parseInt(inventoryText) || 0;
      
      // Extract buy price
      const buyPriceText = $(".item-title:contains('Buy Price')").parent().find(".item-after").text().trim();
      const buyPriceMatch = buyPriceText.match(/(\d+)\s+(Silver|Gold)/);
      const buyLocation = $(".item-title:contains('Buy Price') span").text().trim();
      
      // Extract givable status
      const givableText = $(".item-title:contains('Givable')").parent().find(".item-after").text().trim();
      const givable = givableText.toLowerCase() === "yes";
      
      // Extract help requests
      const helpRequestsText = $(".item-title:contains('Help Requests')").parent().find(".item-after").text().trim();
      const helpRequestsMatch = helpRequestsText.match(/(\d+)/);
      
      // Extract crafting use
      const craftingUse: ItemDetails["craftingUse"] = [];
      $(".list-block ul li a[href^='item.php']").each((_, elem) => {
        const craftItemName = $(elem).find(".item-title strong").text().trim();
        const craftItemHref = $(elem).attr("href") || "";
        const craftItemIdMatch = craftItemHref.match(/id=(\d+)/);
        const craftItemIdStr = craftItemIdMatch?.[1];
        const craftItemId = craftItemIdStr ? Number.parseInt(craftItemIdStr) : 0;
        const requirementsHtml = $(elem).find(".item-title span").html();
        const requirements = requirementsHtml ? requirementsHtml.split("<br/>").map(r => r.trim()) : [];
        const levelText = $(elem).find(".item-after").text().trim();
        const levelMatch = levelText.match(/(\d+)/);
        const levelStr = levelMatch?.[1];
        const requiredLevel = levelStr ? Number.parseInt(levelStr) : 0;
        
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
          amount: Number.parseInt(buyPriceMatch[1]),
          currency: buyPriceMatch[2] as "Silver" | "Gold",
          location: buyLocation
        } : undefined,
        givable,
        helpRequests: helpRequestsMatch?.[1] ? Number.parseInt(helpRequestsMatch[1]) : undefined,
        craftingUse: craftingUse.length > 0 ? craftingUse : undefined
      };

      return {
        status: 200,
        data: itemDetails
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async buyItem(itemId: number, quantity: number): Promise<{ status: number; data?: BuyItemResult; error?: string }> {
    try {
      // First, get item details to know the price
      const itemResult = await this.getItemDetails(itemId);
      if (itemResult.error || !itemResult.data) {
        return {
          status: itemResult.status,
          error: itemResult.error || "Failed to fetch item details"
        };
      }

      const itemDetails = itemResult.data;
      if (!itemDetails.buyPrice) {
        return {
          status: 400,
          error: "Item is not available for purchase"
        };
      }

      // Get current player stats to check available coins
      const statsResult = await this.getPlayerStats();
      if (statsResult.error || !statsResult.data) {
        return {
          status: statsResult.status,
          error: statsResult.error || "Failed to fetch player stats"
        };
      }

      const currentCoins = statsResult.data;
      const itemPrice = itemDetails.buyPrice.amount;
      const currency = itemDetails.buyPrice.currency;

      // Calculate quantity to buy
      let quantityToBuy = quantity;
      if (quantity === -1) {
        // Buy all available with current silver
        if (currency === "Silver") {
          quantityToBuy = Math.floor(currentCoins.silver / itemPrice);
        } else {
          quantityToBuy = Math.floor(currentCoins.gold / itemPrice);
        }

        if (quantityToBuy === 0) {
          return {
            status: 400,
            error: `Insufficient ${currency}. Need ${itemPrice} ${currency}, have ${currency === "Silver" ? currentCoins.silver : currentCoins.gold}`
          };
        }
      } else {
        // Check if user can afford the specified quantity
        const totalCost = itemPrice * quantityToBuy;
        const availableCoins = currency === "Silver" ? currentCoins.silver : currentCoins.gold;
        
        if (totalCost > availableCoins) {
          return {
            status: 400,
            error: `Insufficient ${currency}. Need ${totalCost} ${currency}, have ${availableCoins}`
          };
        }
      }

      // Make the purchase
      const res = await fetch(
        `${this.baseUrl}/worker.php?go=buyitem&id=${itemId}&qty=${quantityToBuy}`,
        {
          headers: this.headers,
          method: "POST"
        }
      );

      if (res.status !== 200) {
        return {
          status: res.status,
          error: "Failed to purchase item from upstream service"
        };
      }

      const responseText = (await res.text()).trim();
      
      // Response can be "success" or a number representing quantity purchased
      const isSuccess = responseText.toLowerCase() === "success";
      const isNumericResponse = /^\d+$/.test(responseText);
      
      if (!isSuccess && !isNumericResponse) {
        return {
          status: 400,
          error: `Purchase failed: ${responseText}`
        };
      }
      
      // If response is numeric, it represents the actual quantity purchased
      if (isNumericResponse) {
        quantityToBuy = Number.parseInt(responseText);
      }

      // Calculate remaining coins
      const totalCost = itemPrice * quantityToBuy;
      const remainingCoins = {
        silver: currency === "Silver" ? currentCoins.silver - totalCost : currentCoins.silver,
        gold: currency === "Gold" ? currentCoins.gold - totalCost : currentCoins.gold
      };

      return {
        status: 200,
        data: {
          itemId,
          itemName: itemDetails.name,
          quantityPurchased: quantityToBuy,
          totalCost: {
            amount: totalCost,
            currency
          },
          remainingCoins
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getFishInventory(): Promise<{ status: number; data?: Array<{ id: number; name: string; quantity: number }>; error?: string }> {
    try {
      const res = await fetch(
        `${this.baseUrl}/market.php`,
        {
          headers: this.headers,
          method: "GET"
        }
      );

      if (res.status !== 200) {
        return {
          status: res.status,
          error: "Failed to fetch market page"
        };
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      const fishItems: Array<{ id: number; name: string; quantity: number }> = [];

      // Parse all items in market page
      $("li.close-panel").each((_, elem) => {
        const itemLink = $(elem).find("a[href^='item.php']");
        const href = itemLink.attr("href") || "";
        const idMatch = href.match(/id=(\d+)/);
        const itemId = idMatch?.[1] ? Number.parseInt(idMatch[1]) : 0;
        
        const itemName = $(elem).find(".item-title strong").text().trim();
        const quantityInput = $(elem).find("input.qty");
        const quantityText = quantityInput.attr("value") || "0";
        const quantity = Number.parseInt(quantityText.replace(/,/g, '')) || 0;
        
        // Check if item has sell button (fish items have sellbtn)
        const hasSellButton = $(elem).find(".sellbtn").length > 0;
        
        // Only add items with sell button and quantity > 0
        // Exclude worms (id=18) and other bait items
        if (itemId && itemName && quantity > 0 && hasSellButton && itemId !== 18) {
          fishItems.push({ id: itemId, name: itemName, quantity });
        }
      });

      return {
        status: 200,
        data: fishItems
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async sellItem(itemId: number, quantity: number): Promise<{ status: number; data?: number; error?: string }> {
    try {
      const res = await fetch(
        `${this.baseUrl}/worker.php?go=sellitem&id=${itemId}&qty=${quantity}`,
        {
          headers: this.headers,
          method: "POST"
        }
      );

      if (res.status !== 200) {
        return {
          status: res.status,
          error: "Failed to sell item"
        };
      }

      const responseText = (await res.text()).trim();
      
      // Response should be "success" or an error message
      if (responseText.toLowerCase() !== "success") {
        return {
          status: 400,
          error: `Sell failed: ${responseText}`
        };
      }

      return {
        status: 200,
        data: quantity // Return quantity sold
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async sellAllFish(): Promise<{ status: number; data?: { totalSilver: number; itemsSold: number }; error?: string }> {
    try {
      // Get all fish from inventory
      const inventoryResult = await this.getFishInventory();
      if (inventoryResult.error || !inventoryResult.data) {
        return {
          status: inventoryResult.status,
          error: inventoryResult.error || "Failed to get fish inventory"
        };
      }

      const fishItems = inventoryResult.data;
      if (fishItems.length === 0) {
        return {
          status: 200,
          data: { totalSilver: 0, itemsSold: 0 }
        };
      }

      // Get current silver before selling
      const statsBefore = await this.getPlayerStats();
      const silverBefore = statsBefore.data?.silver || 0;

      // Sell each fish item
      let itemsSold = 0;
      for (const fish of fishItems) {
        const sellResult = await this.sellItem(fish.id, fish.quantity);
        if (!sellResult.error) {
          itemsSold += fish.quantity;
        }
        // Small delay between sells
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get silver after selling to calculate earnings
      const statsAfter = await this.getPlayerStats();
      const silverAfter = statsAfter.data?.silver || 0;
      const silverEarned = silverAfter - silverBefore;

      return {
        status: 200,
        data: {
          totalSilver: silverEarned,
          itemsSold
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}
