// API routes configuration
import { Hono } from "hono";
import { FishController } from "../controllers/FishController";
import { InventoryController } from "../controllers/InventoryController";
import { ItemController } from "../controllers/ItemController";
import { PlayerController } from "../controllers/PlayerController";

const api = new Hono();

// Initialize controllers
const playerController = new PlayerController();
const itemController = new ItemController();
const inventoryController = new InventoryController();
const fishController = new FishController();

// Player routes
api.get("/player/stats", (c) => playerController.getStats(c));

// Item routes
api.get("/item/:id", (c) => itemController.getItemDetails(c));
api.post("/item/buy", (c) => itemController.buyItem(c));
api.post("/item/sell", (c) => itemController.sellItem(c));
api.post("/item/sell-all", (c) => itemController.sellAllItems(c));

// Inventory routes
api.get("/inventory", (c) => inventoryController.getInventory(c));

// Fish routes
api.post("/fish/catch", (c) => fishController.catchFish(c));
api.get("/fish/bait", (c) => fishController.getBaitInfo(c));

export default api;
