# MVC Architecture Documentation

This project follows the **Model-View-Controller (MVC)** pattern to ensure separation of concerns, maintainability, and scalability.

---

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Architecture Layers](#architecture-layers)
3. [Standardized Response Format](#standardized-response-format)
4. [API Endpoints](#api-endpoints)
5. [Adding New Features](#adding-new-features)
6. [Benefits](#benefits)

---

## Directory Structure

```
src/
├── models/                    # Data structures and type definitions
│   ├── ApiResponse.ts         # Generic API response wrapper
│   ├── FishCatch.ts           # Fish catch response types
│   └── ...                    # Other domain models
├── services/                  # Business logic and external integrations
│   ├── FarmRPGService.ts      # FarmRPG API service
│   └── ...                    # Other services
├── controllers/               # Request handlers and response formatting
│   ├── HelloController.ts     # Hello endpoint handlers
│   ├── FishController.ts      # Fish-related endpoint handlers
│   └── ...                    # Other controllers
├── routes/                    # Route definitions and endpoint mapping
│   └── api.ts                 # API route configuration
└── index.tsx                  # Application entry point
```

---

## Architecture Layers

### 1. Models (`src/models/`)

**Purpose:** Define data structures and TypeScript interfaces for type safety.

**Responsibilities:**
- Define domain models and data transfer objects (DTOs)
- Provide type definitions for API requests and responses
- Define enums for error codes and constants

**Key Components:**
- **`ApiResponse<T>`**: Generic response wrapper for all endpoints
- **Domain Models**: `FishCatchData`, `PlayerCoins`, `InventoryItem`, etc.
- **Error Codes**: `ErrorCode` enum for standardized error handling

**Example:**
```typescript
export interface PlayerCoins {
  silver: number;
  gold: number;
}

export type PlayerStatsResponse = ApiResponse<PlayerCoins>;
```

---

### 2. Services (`src/services/`)

**Purpose:** Handle business logic and external API integrations.

**Responsibilities:**
- Make external API calls (e.g., FarmRPG API)
- Process and transform data
- Implement core business logic
- Handle data validation and parsing

**Example:**
```typescript
export class FarmRPGService {
  async getPlayerCoins(): Promise<{ status: number; data?: PlayerCoins; error?: string }> {
    // API call and data transformation logic
  }
}
```

---

### 3. Controllers (`src/controllers/`)

**Purpose:** Handle HTTP requests and orchestrate service calls.

**Responsibilities:**
- Process incoming HTTP requests
- Extract and validate request parameters
- Call appropriate service methods
- Format responses using standardized `ApiResponse<T>`
- Handle error cases and return appropriate HTTP status codes

**Example:**
```typescript
export class FishController {
  private farmRPGService = new FarmRPGService();
  
  async catchFish(c: Context) {
    const result = await this.farmRPGService.catchFish();
    
    if (result.error) {
      return c.json({
        success: false,
        error: {
          code: ErrorCode.UPSTREAM_ERROR,
          message: result.error
        }
      }, result.status);
    }
    
    return c.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    }, 200);
  }
}
```

---

### 4. Routes (`src/routes/`)

**Purpose:** Define API endpoints and map them to controller methods.

**Responsibilities:**
- Register HTTP routes (GET, POST, PUT, DELETE)
- Map URLs to controller methods
- Group related routes together
- Apply middleware (authentication, validation, etc.)

**Example:**
```typescript
import { Hono } from "hono";
import { FishController } from "../controllers/FishController";

const api = new Hono();
const fishController = new FishController();

api.post("/catchfish", (c) => fishController.catchFish(c));

export default api;
```

---

### 5. Entry Point (`src/index.tsx`)

**Purpose:** Initialize and configure the application.

**Responsibilities:**
- Create Hono application instance
- Mount route modules
- Configure middleware (CORS, static files, HMR)
- Start the HTTP server
- Handle global error handling

---

## Standardized Response Format

All API endpoints return responses using the generic `ApiResponse<T>` model:

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

### Success Response Example

```json
{
  "success": true,
  "data": {
    "silver": 1000,
    "gold": 50
  },
  "timestamp": "2025-10-04T12:15:09Z"
}
```

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "NO_BAIT",
    "message": "No bait available for fishing",
    "statusCode": 400
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `NO_BAIT` | No bait available for fishing |
| `UPSTREAM_ERROR` | External service error |
| `INTERNAL_ERROR` | Server error |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input |
| `UNAUTHORIZED` | Authentication required |

---

## API Endpoints

### Player Endpoints

- **`GET /api/player/stats`**  
  Get player coins (Silver & Gold)

### Inventory Endpoints

- **`GET /api/inventory`**  
  Get full inventory with all item details

- **`GET /api/item/:id`**  
  Get item details including price and crafting info

### Item Transaction Endpoints

- **`POST /api/item/buy`**  
  Purchase items from the store (supports buying all with -1)

- **`POST /api/item/sell`**  
  Sell a specific item by ID and quantity

- **`POST /api/item/sell-all`**  
  Sell all items or only capped items (use `onlyCapped` parameter)

### Bot Endpoints

- **`POST /api/bot/fishing`**  
  Control automated fishing bot (start/stop/status)

- **`GET /api/bot/fishing/status`**  
  Get current fishing bot status

---

## Adding New Features

Follow these steps to add a new API endpoint while maintaining the MVC architecture:

### Step-by-Step Guide

#### 1. Define Types (`src/models/`)

Create a new model file or add to an existing one:

```typescript
// src/models/User.ts
import type { ApiResponse } from "./ApiResponse";

export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserResponse = ApiResponse<User>;
```

#### 2. Create Service (`src/services/`)

Implement business logic and external API calls:

```typescript
// src/services/UserService.ts
import type { User } from "../models/User";

export class UserService {
  async getUser(id: string): Promise<{ status: number; data?: User; error?: string }> {
    try {
      // External API call or database query
      const response = await fetch(`https://api.example.com/users/${id}`);
      
      if (!response.ok) {
        return { status: 404, error: "User not found" };
      }
      
      const data = await response.json();
      return { status: 200, data };
    } catch (error) {
      return { status: 500, error: "Failed to fetch user" };
    }
  }
}
```

#### 3. Create Controller (`src/controllers/`)

Handle HTTP requests and format responses:

```typescript
// src/controllers/UserController.ts
import type { Context } from "hono";
import { UserService } from "../services/UserService";
import { ErrorCode } from "../models/ApiResponse";
import type { UserResponse } from "../models/User";

export class UserController {
  private userService = new UserService();
  
  async getUser(c: Context) {
    const id = c.req.param("id");
    
    if (!id) {
      return c.json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "User ID is required"
        }
      } as UserResponse, 400);
    }
    
    const result = await this.userService.getUser(id);
    
    if (result.error) {
      return c.json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: result.error
        }
      } as UserResponse, result.status);
    }
    
    return c.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    } as UserResponse, 200);
  }
}
```

#### 4. Register Route (`src/routes/api.ts`)

Map the endpoint to the controller:

```typescript
// src/routes/api.ts
import { UserController } from "../controllers/UserController";

const userController = new UserController();

// Register the route
api.get("/user/:id", (c) => userController.getUser(c));
```

### Best Practices

- **Keep controllers thin**: Move complex logic to services
- **Use TypeScript types**: Ensure type safety across all layers
- **Follow naming conventions**: Use descriptive names for files and classes
- **Handle errors gracefully**: Always return standardized error responses
- **Add validation**: Validate input parameters in controllers
- **Write tests**: Create unit tests for services and controllers
- **Document endpoints**: Update the API Endpoints section

---

## Benefits

### 1. **Separation of Concerns**
Each layer has a single, well-defined responsibility, making the codebase easier to understand and maintain.

### 2. **Maintainability**
Changes to one layer don't affect others. For example, you can modify the FarmRPG API integration without touching controllers or routes.

### 3. **Testability**
Controllers and services can be unit tested independently with mocked dependencies.

### 4. **Scalability**
New features can be added without modifying existing code, following the Open/Closed Principle.

### 5. **Type Safety**
TypeScript interfaces ensure data consistency across all layers, catching errors at compile time.

### 6. **Code Reusability**
Services can be reused across multiple controllers, reducing code duplication.

### 7. **Team Collaboration**
Clear structure makes it easier for multiple developers to work on different features simultaneously.

---

## Development Workflow

### Adding a New Feature

1. **Plan**: Identify the data models, business logic, and endpoints needed
2. **Model**: Define TypeScript interfaces and types
3. **Service**: Implement business logic and external integrations
4. **Controller**: Create request handlers
5. **Route**: Register the endpoint
6. **Test**: Write unit and integration tests
7. **Document**: Update this documentation

### Debugging

- **Check logs**: Review console output for errors
- **Inspect responses**: Use tools like Postman or curl to test endpoints
- **Validate types**: Ensure TypeScript types match actual data
- **Test services**: Isolate and test service methods independently

### Code Review Checklist

- [ ] Types are properly defined in `models/`
- [ ] Business logic is in `services/`, not controllers
- [ ] Controllers only handle HTTP concerns
- [ ] Routes are properly registered
- [ ] Error handling follows standardized format
- [ ] Code follows existing naming conventions
- [ ] Tests are included (if applicable)
- [ ] Documentation is updated
