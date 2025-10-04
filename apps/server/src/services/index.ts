// Shared service instances (Dependency Injection)
import { FarmRPGService } from "./FarmRPGService";
import { FishingBotService } from "./FishingBotService";

// Singleton instance of FarmRPGService
export const farmRPGService = new FarmRPGService();

// Singleton instance of FishingBotService
export const fishingBotService = new FishingBotService(farmRPGService);
