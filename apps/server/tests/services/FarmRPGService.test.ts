import { beforeEach, describe, expect, mock, test } from "bun:test";
import { FarmRPGService } from "../../src/services/FarmRPGService";

describe("FarmRPGService", () => {
  let service: FarmRPGService;
  let mockHttpClient: any;

  beforeEach(() => {
    // Create a mock HttpClient
    mockHttpClient = {
      get: mock(() => Promise.resolve({ data: "", error: null, status: 200 })),
      post: mock(() => Promise.resolve({ data: "", error: null, status: 200 })),
      parseHtml: mock((html: string) => {
        const cheerio = require("cheerio");
        return cheerio.load(html);
      }),
      parseNumber: mock((str: string) => {
        const num = parseInt(str.replace(/,/g, ""), 10);
        return Number.isNaN(num) ? 0 : num;
      }),
    };

    service = new FarmRPGService();
    // @ts-expect-error - Replace http client for testing
    service.http = mockHttpClient;
  });

  describe("getPlayerStats", () => {
    test("should parse player stats correctly", async () => {
      const mockHtml = `
        <div>
          <img alt="Silver" /><strong>1,234</strong>
          <img alt="Gold" /><strong>56</strong>
        </div>
      `;
      mockHttpClient.get.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.getPlayerStats();

      expect(result.status).toBe(200);
      expect(result.data).toEqual({
        silver: 1234,
        gold: 56,
      });
    });

    test("should handle HTTP errors", async () => {
      mockHttpClient.get.mockResolvedValue({ data: null, error: "Network error", status: 502 });

      const result = await service.getPlayerStats();

      expect(result.status).toBe(502);
      expect(result.error).toBe("Network error");
    });
  });

  describe("getInventory", () => {
    test("should parse inventory with categories", async () => {
      const mockHtml = `
        <div class="list-group">
          <li class="list-group-title">Fish & Bait</li>
          <li>
            <a href="item.php?id=17">
              <div class="item-content">
                <div class="item-media"><img src="/img/items/7718.PNG" class="itemimg"></div>
                <div class="item-inner">
                  <div class="item-title"><strong>Drum</strong><br/><span>Not an instrument</span></div>
                  <div class="item-after">179</div>
                </div>
              </div>
            </a>
          </li>
        </div>
        <div class="card-content-inner">
          Your inventory contains <strong>8</strong> unique items and <strong>407</strong> items in total.
        </div>
        <div class="card-content-inner">
          Currently, you cannot have more than <strong>200</strong> of any single thing.
        </div>
      `;
      mockHttpClient.get.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.getInventory();

      expect(result.status).toBe(200);
      expect(result.data?.categories).toHaveLength(1);
      expect(result.data?.categories[0]?.category).toBe("fish");
      expect(result.data?.categories[0]?.items[0]?.name).toBe("Drum");
      expect(result.data?.stats.uniqueItems).toBe(8);
      expect(result.data?.stats.totalItems).toBe(407);
      expect(result.data?.stats.maxCapacity).toBe(200);
    });

    test("should filter by single category", async () => {
      const mockHtml = `
        <div class="list-group">
          <li class="list-group-title">Fish & Bait</li>
          <li><a href="item.php?id=17"><div class="item-title"><strong>Drum</strong></div><div class="item-after">10</div></a></li>
        </div>
        <div class="list-group">
          <li class="list-group-title">Crops</li>
          <li><a href="item.php?id=1"><div class="item-title"><strong>Corn</strong></div><div class="item-after">5</div></a></li>
        </div>
        <div class="card-content-inner">Your inventory contains <strong>2</strong> unique items and <strong>15</strong> items in total.</div>
        <div class="card-content-inner">Currently, you cannot have more than <strong>200</strong> of any single thing.</div>
      `;
      mockHttpClient.get.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.getInventory("fish");

      expect(result.status).toBe(200);
      expect(result.data?.categories).toHaveLength(1);
      expect(result.data?.categories[0]?.category).toBe("fish");
    });

    test("should filter by multiple categories", async () => {
      const mockHtml = `
        <div class="list-group">
          <li class="list-group-title">Fish & Bait</li>
          <li><a href="item.php?id=17"><div class="item-title"><strong>Drum</strong></div><div class="item-after">10</div></a></li>
        </div>
        <div class="list-group">
          <li class="list-group-title">Crops</li>
          <li><a href="item.php?id=1"><div class="item-title"><strong>Corn</strong></div><div class="item-after">5</div></a></li>
        </div>
        <div class="card-content-inner">Your inventory contains <strong>2</strong> unique items and <strong>15</strong> items in total.</div>
        <div class="card-content-inner">Currently, you cannot have more than <strong>200</strong> of any single thing.</div>
      `;
      mockHttpClient.get.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.getInventory(["fish", "crops"]);

      expect(result.status).toBe(200);
      expect(result.data?.categories).toHaveLength(2);
    });
  });

  describe("catchFish", () => {
    test("should parse fish catch response", async () => {
      const mockHtml = `
        <img src='/img/items/yellowperch.png' alt='Yellow Perch' class='itemimg' ><br/>Yellow Perch
        <span style='display:none'>
          <div id="fishcnt">377</div>
          <div id="fishingpb">7.16</div>
          <div id="staminacnt">50</div>
          <div id="baitcnt">198</div>
        </span>
      `;
      mockHttpClient.post.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.catchFish(1, 1);

      expect(result.status).toBe(200);
      expect(result.data?.catch.name).toBe("Yellow Perch");
      expect(result.data?.catch.image).toBe("https://farmrpg.com/img/items/yellowperch.png");
      expect(result.data?.stats.totalFishCaught).toBe(377);
      expect(result.data?.stats.fishingXpPercent).toBe(7.16);
      expect(result.data?.resources.stamina).toBe(50);
      expect(result.data?.resources.bait).toBe(198);
    });

    test("should handle numeric fish IDs", async () => {
      const mockHtml = `
        <img src='/img/items/7718.PNG' alt='Drum' class='itemimg' >
        <span style='display:none'>
          <div id="fishcnt">100</div>
          <div id="fishingpb">5.0</div>
          <div id="staminacnt">45</div>
          <div id="baitcnt">50</div>
        </span>
      `;
      mockHttpClient.post.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.catchFish(1, 1);

      expect(result.status).toBe(200);
      expect(result.data?.catch.id).toBe(7718);
      expect(result.data?.catch.name).toBe("Drum");
    });

    test("should return error when no fish data", async () => {
      mockHttpClient.post.mockResolvedValue({
        data: "<div>No fish</div>",
        error: null,
        status: 200,
      });

      const result = await service.catchFish(1, 1);

      expect(result.status).toBe(400);
      expect(result.error).toContain("Failed to catch fish");
    });
  });

  describe("getBaitInfo", () => {
    test("should parse bait information", async () => {
      const mockHtml = `
        <div class="row">
          <div class="col-45">
            Worms: <strong id="baitleft">199</strong>
          </div>
          <div class="col-55">Streak: <strong>5,268</strong> &nbsp; Best: <strong>5,268</strong></div>
        </div>
        <div id='last_bait' style='display:none'>Worms</div>
      `;
      mockHttpClient.get.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.getBaitInfo(1);

      expect(result.status).toBe(200);
      expect(result.data?.baitName).toBe("Worms");
      expect(result.data?.baitCount).toBe(199);
      expect(result.data?.streak).toBe(5268);
      expect(result.data?.bestStreak).toBe(5268);
    });
  });

  describe("getItemDetails", () => {
    test("should parse item details", async () => {
      const mockHtml = `
        <div class="navbar-inner"><div class="center"><a>Worms</a></div></div>
        <div id="img">
          <img src="/img/items/7758.png" />
          Description text
          Use this to catch fish
        </div>
        <ul>
          <li><div class="item-title">My Inventory</div><div class="item-after">100</div></li>
          <li><div class="item-title">Buy Price<span>Country Store</span></div><div class="item-after">3 Silver</div></li>
          <li><div class="item-title">Givable</div><div class="item-after">Yes</div></li>
        </ul>
      `;
      mockHttpClient.get.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.getItemDetails(7758);

      expect(result.status).toBe(200);
      expect(result.data?.name).toBe("Worms");
      expect(result.data?.inventory?.quantity).toBe(100);
      expect(result.data?.buyPrice?.amount).toBe(3);
      expect(result.data?.buyPrice?.currency).toBe("Silver");
      expect(result.data?.givable).toBe(true);
    });

    test("should parse crafting use information", async () => {
      const mockHtml = `
        <div class="navbar-inner"><div class="center"><a>Worms</a></div></div>
        <div id="img"><img src="/img/items/7758.png" />Description</div>
        <div class="list-block">
          <ul>
            <li>
              <a href="item.php?id=481">
                <div class="item-title">
                  <strong>Chum</strong>
                  <span>1x Bucket<br/>7x Grubs<br/>4x Minnows<br/>10x Worms</span>
                </div>
                <div class="item-after">Level 52</div>
              </a>
            </li>
          </ul>
        </div>
      `;
      mockHttpClient.get.mockResolvedValue({ data: mockHtml, error: null, status: 200 });

      const result = await service.getItemDetails(7758);

      expect(result.status).toBe(200);
      expect(result.data?.craftingUse).toHaveLength(1);
      expect(result.data?.craftingUse?.[0]?.itemName).toBe("Chum");
      expect(result.data?.craftingUse?.[0]?.itemId).toBe(481);
      expect(result.data?.craftingUse?.[0]?.requiredLevel).toBe(52);
      expect(result.data?.craftingUse?.[0]?.requirements.length).toBeGreaterThan(0);
    });
  });

  describe("buyItem", () => {
    test("should buy item successfully", async () => {
      // Mock getItemDetails
      const itemDetailsHtml = `
        <div class="navbar-inner"><div class="center"><a>Worms</a></div></div>
        <div id="img"><img src="/img/items/7758.png" /></div>
        <ul>
          <li><div class="item-title">My Inventory</div><div class="item-after">50</div></li>
          <li><div class="item-title">Buy Price</div><div class="item-after">3 Silver</div></li>
        </ul>
      `;

      // Mock getPlayerStats
      const playerStatsHtml = `<img alt="Silver" /><strong>1,000</strong><img alt="Gold" /><strong>10</strong>`;

      // Mock the actual buy request
      mockHttpClient.get.mockResolvedValueOnce({ data: itemDetailsHtml, error: null, status: 200 });
      mockHttpClient.get.mockResolvedValueOnce({ data: playerStatsHtml, error: null, status: 200 });
      mockHttpClient.post.mockResolvedValueOnce({ data: "success", error: null, status: 200 });
      mockHttpClient.get.mockResolvedValueOnce({ data: itemDetailsHtml, error: null, status: 200 });

      const result = await service.buyItem(7758, 10);

      expect(result.status).toBe(200);
      expect(result.data?.quantityPurchased).toBe(10);
    });

    test("should handle item not available for purchase", async () => {
      const itemDetailsHtml = `
        <div class="navbar-inner"><div class="center"><a>Worms</a></div></div>
        <div id="img"><img src="/img/items/7758.png" /></div>
        <ul>
          <li><div class="item-title">My Inventory</div><div class="item-after">50</div></li>
        </ul>
      `;
      const playerStatsHtml = `<img alt="Silver" /><strong>1,000</strong><img alt="Gold" /><strong>10</strong>`;

      mockHttpClient.get.mockResolvedValueOnce({ data: itemDetailsHtml, error: null, status: 200 });
      mockHttpClient.get.mockResolvedValueOnce({ data: playerStatsHtml, error: null, status: 200 });

      const result = await service.buyItem(7758, 10);

      expect(result.status).toBe(400);
      expect(result.error).toContain("not available for purchase");
    });
  });

  describe("sellItem", () => {
    test("should sell item successfully", async () => {
      mockHttpClient.post.mockResolvedValue({ data: "120", error: null, status: 200 });

      const result = await service.sellItem(7758, 50);

      expect(result.status).toBe(200);
      expect(result.data).toBe(120);
    });

    test("should handle sell failure", async () => {
      mockHttpClient.post.mockResolvedValue({ data: "error", error: null, status: 200 });

      const result = await service.sellItem(7758, 50);

      expect(result.status).toBe(400);
      expect(result.error).toContain("Insufficient quantity");
    });

    test("should handle invalid item ID", async () => {
      mockHttpClient.post.mockResolvedValue({ data: "", error: null, status: 200 });

      const result = await service.sellItem(321412, 1);

      expect(result.status).toBe(404);
      expect(result.error).toContain("Item not found");
    });
  });

  describe("sellAllItems", () => {
    test("should sell all items successfully", async () => {
      const mockInventoryHtml = `
        <div class="list-group">
          <li class="list-group-title">Fish & Bait</li>
          <li>
            <a href="item.php?id=17">
              <div class="item-content">
                <div class="item-inner">
                  <div class="item-title"><strong>Drum</strong></div>
                  <div class="item-after">100</div>
                </div>
              </div>
            </a>
          </li>
        </div>
        <div class="card-content-inner">Your inventory contains <strong>1</strong> unique items and <strong>100</strong> items in total.</div>
        <div class="card-content-inner">Currently, you cannot have more than <strong>200</strong> of any single thing.</div>
      `;

      mockHttpClient.get.mockResolvedValue({ data: mockInventoryHtml, error: null, status: 200 });
      mockHttpClient.post.mockResolvedValue({ data: "1200", error: null, status: 200 });

      const result = await service.sellAllItems();

      expect(result.status).toBe(200);
      expect(result.data?.itemsSold).toBeGreaterThan(0);
    });

    test("should handle empty inventory", async () => {
      const mockInventoryHtml = `
        <div class="card-content-inner">Your inventory contains <strong>0</strong> unique items and <strong>0</strong> items in total.</div>
        <div class="card-content-inner">Currently, you cannot have more than <strong>200</strong> of any single thing.</div>
      `;

      mockHttpClient.get.mockResolvedValue({ data: mockInventoryHtml, error: null, status: 200 });

      const result = await service.sellAllItems();

      expect(result.status).toBe(200);
      expect(result.data?.itemsSold).toBe(0);
      expect(result.data?.totalSilver).toBe(0);
    });
  });
});
