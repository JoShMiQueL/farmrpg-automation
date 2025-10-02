# MVC Architecture Documentation

This project follows the **Model-View-Controller (MVC)** pattern to separate concerns and improve maintainability.

## Directory Structure

```
src/
├── models/           # Data structures and type definitions
│   └── FishCatch.ts  # Fish catch response types
├── services/         # External API integrations and business logic
│   └── FarmRPGService.ts  # FarmRPG API service
├── controllers/      # Request handlers and response formatting
│   ├── HelloController.ts  # Hello endpoint handlers
│   └── FishController.ts   # Fish-related endpoint handlers
├── routes/           # Route definitions
│   └── api.ts        # API route configuration
└── index.tsx         # Application entry point
```

## Architecture Layers

### 1. **Models** (`src/models/`)
- Define data structures and TypeScript interfaces
- Ensure type safety across the application
- **`ApiResponse<T>`**: Generic response wrapper for all endpoints
- Example: `FishCatchData`, `PlayerCoins`, `ErrorCode` enum

### 2. **Services** (`src/services/`)
- Handle external API calls and integrations
- Contain business logic for data processing
- Parse and transform external data
- Example: `FarmRPGService` handles all FarmRPG API interactions

### 3. **Controllers** (`src/controllers/`)
- Process HTTP requests
- Call appropriate services
- Format responses
- Handle error cases
- Example: `FishController.catchFish()` orchestrates the fish catching flow

### 4. **Routes** (`src/routes/`)
- Define API endpoints
- Map URLs to controller methods
- Group related routes together
- Example: `/api/catchfish` → `FishController.catchFish()`

### 5. **Entry Point** (`src/index.tsx`)
- Initialize Hono application
- Mount route modules
- Configure middleware (static file serving, HMR)
- Start the server

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Testability**: Controllers and services can be unit tested independently
4. **Scalability**: New features can be added without affecting existing code
5. **Type Safety**: TypeScript interfaces ensure data consistency

## Adding New Features

### To add a new API endpoint:

1. **Define types** in `src/models/`
2. **Create service** (if needed) in `src/services/`
3. **Create controller** in `src/controllers/`
4. **Register route** in `src/routes/api.ts`

### Example:

```typescript
// 1. Model (src/models/User.ts)
import type { ApiResponse } from "./ApiResponse";

export interface User {
  id: string;
  name: string;
}

export type UserResponse = ApiResponse<User>;

// 2. Service (src/services/UserService.ts)
export class UserService {
  async getUser(id: string): Promise<{ status: number; data?: User; error?: string }> {
    // Implementation
  }
}

// 3. Controller (src/controllers/UserController.ts)
import { ErrorCode } from "../models/ApiResponse";

export class UserController {
  private userService = new UserService();
  
  async getUser(c: Context) {
    const id = c.req.param("id");
    const result = await this.userService.getUser(id);
    
    if (result.error) {
      return c.json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: result.error
        }
      } as UserResponse, 404);
    }
    
    return c.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    } as UserResponse, 200);
  }
}

// 4. Route (src/routes/api.ts)
const userController = new UserController();
api.get("/user/:id", (c) => userController.getUser(c));
```

## Standardized Response Format

All API endpoints use the generic `ApiResponse<T>` model:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode?: number;
  };
  timestamp?: string;
}
```

**Error Codes:**
- `NO_BAIT` - No bait available for fishing
- `UPSTREAM_ERROR` - External service error
- `INTERNAL_ERROR` - Server error
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `UNAUTHORIZED` - Authentication required

## Current Endpoints

- `GET /api/player/stats` - Get player coins (Silver & Gold)
- `GET /api/inventory` - Get full inventory with all item details
- `GET /api/item/:id` - Get item details including price and crafting info
- `POST /api/item/buy` - Purchase items from the store (supports buying all with -1)
- `POST /api/item/sell` - Sell a specific item by ID and quantity
- `POST /api/item/sell-all` - Sell all items or only capped (onlyCapped parameter)
- `POST /api/bot/fishing` - Control automated fishing bot (start/stop/status)
- `GET /api/bot/fishing/status` - Get fishing bot status
