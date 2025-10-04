#!/usr/bin/env bun

import { logger } from "@farmrpg/utils";
import { BotApiClient } from "../api/client";
import { botConfig } from "../config/botConfig";
import { FishingStrategy } from "../strategies/FishingStrategy";

/**
 * Fishing Bot CLI
 * Automated fishing with configurable options
 */

async function main() {
  logger.info("🎣 FarmRPG Fishing Bot");
  logger.info("========================");

  // Create API client
  const apiUrl = process.env.API_URL || "http://localhost:3000";
  const client = new BotApiClient(apiUrl);

  // Create fishing strategy
  const strategy = new FishingStrategy(client, botConfig);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    logger.info("\n🛑 Received SIGINT, shutting down...");
    strategy.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("\n🛑 Received SIGTERM, shutting down...");
    strategy.stop();
    process.exit(0);
  });

  // Start the bot
  try {
    await strategy.start();
  } catch (error) {
    logger.error({ error }, "Bot crashed");
    process.exit(1);
  }
}

main();
