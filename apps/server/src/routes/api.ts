// API routes configuration

import type { BotCommand } from "@farmrpg/types";
import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { FishController } from "../controllers/FishController";
import { FishingBotController } from "../controllers/FishingBotController";
import { HealthController } from "../controllers/HealthController";
import { InventoryController } from "../controllers/InventoryController";
import { ItemController } from "../controllers/ItemController";
import { PlayerController } from "../controllers/PlayerController";
import { fishingBotService } from "../services";

const api = new Hono();

// Initialize controllers
const healthController = new HealthController();
const playerController = new PlayerController();
const itemController = new ItemController();
const inventoryController = new InventoryController();
const fishController = new FishController();
const fishingBotController = new FishingBotController(fishingBotService);

// Health check routes
api.get("/health", (c) => healthController.health(c));
api.get("/health/ready", (c) => healthController.ready(c));
api.get("/health/live", (c) => healthController.live(c));

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

// Fishing bot routes
api.get("/bot/status", (c) => fishingBotController.getStatus(c));
api.post("/bot/start", (c) => fishingBotController.start(c));
api.post("/bot/stop", (c) => fishingBotController.stop(c));
api.post("/bot/pause", (c) => fishingBotController.pause(c));
api.post("/bot/resume", (c) => fishingBotController.resume(c));
api.post("/bot/config", (c) => fishingBotController.updateConfig(c));

// WebSocket route for real-time bot updates
api.get(
  "/bot/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      console.log("WebSocket client connected");

      // Send current state immediately
      ws.send(
        JSON.stringify({
          type: "status",
          timestamp: new Date().toISOString(),
          data: fishingBotService.getState(),
        }),
      );

      // Subscribe to bot events
      const unsubscribe = fishingBotService.subscribe((event) => {
        try {
          ws.send(JSON.stringify(event));
        } catch (error) {
          console.error("Error sending event to WebSocket:", error);
        }
      });

      // Store unsubscribe function for cleanup
      (ws as any)._unsubscribe = unsubscribe;
    },

    async onMessage(event, ws) {
      try {
        const command: BotCommand = JSON.parse(event.data.toString());

        switch (command.action) {
          case "start":
            if (command.config) {
              fishingBotService.updateConfig(command.config);
            }
            await fishingBotService.start();
            break;

          case "stop":
            fishingBotService.stop();
            break;

          case "pause":
            fishingBotService.pause();
            break;

          case "resume":
            fishingBotService.resume();
            break;

          case "status":
            ws.send(
              JSON.stringify({
                type: "status",
                timestamp: new Date().toISOString(),
                data: fishingBotService.getState(),
              }),
            );
            break;

          case "config":
            if (command.config) {
              fishingBotService.updateConfig(command.config);
            }
            break;

          default:
            ws.send(
              JSON.stringify({
                type: "error",
                timestamp: new Date().toISOString(),
                data: { message: `Unknown action: ${(command as any).action}` },
              }),
            );
        }
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: "error",
            timestamp: new Date().toISOString(),
            data: {
              message: error instanceof Error ? error.message : "Unknown error",
            },
          }),
        );
      }
    },

    onClose(_event, ws) {
      console.log("WebSocket client disconnected");

      // Unsubscribe from bot events
      const unsubscribe = (ws as any)._unsubscribe;
      if (unsubscribe) {
        unsubscribe();
      }
    },

    onError(_event, _ws) {
      console.error("WebSocket error");
    },
  })),
);

export default api;
export { websocket };
