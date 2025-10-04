# Project Restructure Proposal

## Executive Summary

This document outlines a comprehensive restructuring plan for the FarmRPG automation project to improve maintainability, scalability, and developer experience.

---

## Current State Analysis

### ✅ Strengths
1. **Clean MVC Architecture** - Well-separated concerns in the server
2. **Comprehensive Testing** - 68 tests with good coverage
3. **Modern Tech Stack** - Bun, Hono, React 19, TypeScript
4. **Monorepo Setup** - Workspace-based architecture
5. **Code Quality Tools** - Biome, commitlint, husky
6. **WebSocket Support** - Real-time bot updates
7. **Good Documentation** - API docs, MVC architecture guide

### ⚠️ Areas for Improvement

#### 1. **Project Structure**
- Missing shared packages for common types/utilities
- No centralized configuration management
- Client-server coupling through direct API calls
- Missing environment validation

#### 2. **Code Organization**
- Large service files (FarmRPGService.ts is 632 lines)
- Mixed concerns in some controllers
- No middleware layer for common operations
- Missing API client abstraction

#### 3. **Type Safety**
- No shared types between client and server
- Manual type definitions for API responses
- Missing runtime validation (Zod/Valibot)

#### 4. **Testing**
- No integration tests
- No E2E tests
- Missing test utilities/fixtures
- No client tests

#### 5. **Developer Experience**
- No API documentation generation (OpenAPI/Swagger)
- Missing development tools (API mocking, debugging)
- No database layer (everything is API-based)
- Missing error tracking/logging

#### 6. **Scalability**
- No caching layer
- No rate limiting
- No request queuing
- Singleton services (not horizontally scalable)

---

## Proposed Structure

### New Directory Layout

```
farmrpg/
├── apps/
│   ├── server/                 # Backend API
│   │   ├── src/
│   │   │   ├── api/           # API layer (routes + controllers)
│   │   │   │   ├── routes/
│   │   │   │   ├── controllers/
│   │   │   │   └── middleware/
│   │   │   ├── core/          # Business logic
│   │   │   │   ├── services/
│   │   │   │   ├── repositories/
│   │   │   │   └── domain/
│   │   │   ├── infrastructure/ # External integrations
│   │   │   │   ├── http/
│   │   │   │   ├── cache/
│   │   │   │   └── queue/
│   │   │   ├── config/        # Configuration
│   │   │   └── utils/         # Utilities
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── fixtures/
│   │   └── index.ts
│   │
│   ├── client/                # Frontend UI
│   │   ├── src/
│   │   │   ├── features/     # Feature-based organization
│   │   │   │   ├── fishing/
│   │   │   │   ├── inventory/
│   │   │   │   └── player/
│   │   │   ├── shared/       # Shared components
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── utils/
│   │   │   ├── lib/          # Third-party setup
│   │   │   └── api/          # API client
│   │   └── tests/
│   │
│   └── bot/                  # Standalone bot application
│       ├── src/
│       │   ├── bots/         # Bot implementations
│       │   ├── strategies/   # Bot strategies
│       │   └── scheduler/    # Task scheduling
│       └── tests/
│
├── packages/                 # Shared packages
│   ├── types/               # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api/        # API types
│   │   │   ├── models/     # Domain models
│   │   │   └── events/     # Event types
│   │   └── package.json
│   │
│   ├── config/              # Shared configuration
│   │   ├── src/
│   │   │   ├── env.ts      # Environment validation
│   │   │   └── constants.ts
│   │   └── package.json
│   │
│   ├── utils/               # Shared utilities
│   │   ├── src/
│   │   │   ├── async.ts
│   │   │   ├── validation.ts
│   │   │   └── logger.ts
│   │   └── package.json
│   │
│   └── api-client/          # Typed API client
│       ├── src/
│       │   ├── client.ts
│       │   └── endpoints/
│       └── package.json
│
├── tools/                   # Development tools
│   ├── scripts/            # Build/deployment scripts
│   └── generators/         # Code generators
│
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   ├── architecture/      # Architecture docs
│   └── guides/            # User guides
│
└── .github/               # GitHub workflows
    ├── workflows/
    └── COMMIT_CONVENTION.md
```

---

## Detailed Improvements

### 1. **Shared Packages**

#### `@farmrpg/types`
```typescript
// Shared types between client and server
export interface Player {
  id: string;
  silver: number;
  gold: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export type ApiError = {
  code: ErrorCode;
  message: string;
  statusCode?: number;
};
```

#### `@farmrpg/config`
```typescript
// Environment validation with Zod
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  FARMRPG_COOKIE: z.string().min(1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(process.env);
```

#### `@farmrpg/api-client`
```typescript
// Type-safe API client
import type { ApiResponse, Player } from '@farmrpg/types';

export class FarmRPGClient {
  constructor(private baseUrl: string) {}
  
  async getPlayerStats(): Promise<ApiResponse<Player>> {
    // Implementation with full type safety
  }
}
```

### 2. **Clean Architecture (Server)**

#### Layered Architecture
```
┌─────────────────────────────────────┐
│   API Layer (Controllers/Routes)   │  ← HTTP/WebSocket
├─────────────────────────────────────┤
│   Application Layer (Use Cases)    │  ← Business logic
├─────────────────────────────────────┤
│   Domain Layer (Entities/Models)   │  ← Core domain
├─────────────────────────────────────┤
│   Infrastructure (External APIs)   │  ← FarmRPG API
└─────────────────────────────────────┘
```

#### Example Refactor: FarmRPGService

**Current:** 632 lines, mixed concerns

**Proposed:** Split into focused modules

```typescript
// core/services/PlayerService.ts
export class PlayerService {
  constructor(private farmRPGRepo: FarmRPGRepository) {}
  
  async getStats(): Promise<PlayerStats> {
    return this.farmRPGRepo.fetchPlayerStats();
  }
}

// core/services/InventoryService.ts
export class InventoryService {
  constructor(private farmRPGRepo: FarmRPGRepository) {}
  
  async getInventory(filters?: InventoryFilters): Promise<Inventory> {
    return this.farmRPGRepo.fetchInventory(filters);
  }
}

// infrastructure/repositories/FarmRPGRepository.ts
export class FarmRPGRepository {
  constructor(private httpClient: HttpClient) {}
  
  async fetchPlayerStats(): Promise<PlayerStats> {
    // HTTP implementation
  }
}
```

### 3. **Middleware Layer**

```typescript
// api/middleware/errorHandler.ts
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    }, 500);
  }
};

// api/middleware/rateLimit.ts
export const rateLimit = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    // Rate limiting logic
  };
};

// api/middleware/validation.ts
export const validate = <T>(schema: z.ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: result.error.message,
        },
      }, 400);
    }
    
    c.set('validatedData', result.data);
    await next();
  };
};
```

### 4. **Bot as Separate Application**

Move bot logic to dedicated app for better separation:

```typescript
// apps/bot/src/bots/FishingBot.ts
export class FishingBot {
  constructor(
    private apiClient: FarmRPGClient,
    private config: BotConfig,
  ) {}
  
  async run(): Promise<void> {
    // Bot logic
  }
}

// apps/bot/src/index.ts
const bot = new FishingBot(apiClient, config);
await bot.run();
```

### 5. **Feature-Based Client Structure**

```typescript
// apps/client/src/features/fishing/
├── components/
│   ├── FishingBot.tsx
│   └── FishingStats.tsx
├── hooks/
│   ├── useFishingBot.ts
│   └── useFishingStats.ts
├── api/
│   └── fishingApi.ts
└── types/
    └── fishing.types.ts
```

### 6. **Testing Infrastructure**

```typescript
// tests/fixtures/player.fixture.ts
export const mockPlayer = (): Player => ({
  id: '1',
  silver: 1000,
  gold: 50,
});

// tests/utils/testServer.ts
export const createTestServer = () => {
  // Test server setup
};

// tests/integration/player.test.ts
describe('Player API', () => {
  it('should get player stats', async () => {
    const server = createTestServer();
    const response = await server.request('/api/player/stats');
    expect(response.status).toBe(200);
  });
});
```

### 7. **Configuration Management**

```typescript
// packages/config/src/server.config.ts
export const serverConfig = {
  port: env.PORT,
  cors: {
    origin: env.CORS_ORIGIN.split(','),
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  cache: {
    ttl: 60,
  },
};
```

### 8. **Logging & Monitoring**

```typescript
// packages/utils/src/logger.ts
import pino from 'pino';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
  },
});

// Usage
logger.info({ userId: '123' }, 'User logged in');
logger.error({ error }, 'Failed to fetch data');
```

### 9. **OpenAPI Documentation**

```typescript
// Generate OpenAPI spec from Zod schemas
import { generateOpenAPI } from '@hono/zod-openapi';

const spec = generateOpenAPI({
  info: {
    title: 'FarmRPG API',
    version: '1.0.0',
  },
  servers: [
    { url: 'http://localhost:3000' },
  ],
});
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. ✅ Create shared packages structure
2. ✅ Set up `@farmrpg/types` with existing types
3. ✅ Set up `@farmrpg/config` with env validation
4. ✅ Set up `@farmrpg/utils` with shared utilities

### Phase 2: Server Refactor (Week 2-3)
1. ✅ Add middleware layer
2. ✅ Split FarmRPGService into focused services
3. ✅ Implement repository pattern
4. ✅ Add runtime validation with Zod
5. ✅ Improve error handling

### Phase 3: Client Improvements (Week 4)
1. ✅ Implement feature-based structure
2. ✅ Create typed API client
3. ✅ Add React Query for data fetching
4. ✅ Implement proper error boundaries

### Phase 4: Bot Separation (Week 5)
1. ✅ Extract bot to separate app
2. ✅ Implement bot strategies
3. ✅ Add scheduler for automated tasks

### Phase 5: Testing & Documentation (Week 6)
1. ✅ Add integration tests
2. ✅ Add E2E tests with Playwright
3. ✅ Generate OpenAPI documentation
4. ✅ Update all documentation

### Phase 6: DevOps & Monitoring (Week 7)
1. ✅ Add logging infrastructure
2. ✅ Implement health checks
3. ✅ Add performance monitoring
4. ✅ Set up deployment pipeline

---

## Benefits

### 1. **Maintainability**
- Smaller, focused modules
- Clear separation of concerns
- Easier to understand and modify

### 2. **Scalability**
- Horizontal scaling support
- Caching layer
- Rate limiting
- Queue system for heavy operations

### 3. **Type Safety**
- Shared types eliminate duplication
- Runtime validation catches errors early
- Full end-to-end type safety

### 4. **Developer Experience**
- Better IDE support
- Faster development cycles
- Clear project structure
- Comprehensive documentation

### 5. **Testing**
- Easier to test isolated components
- Better test coverage
- Integration and E2E tests

### 6. **Performance**
- Caching reduces API calls
- Optimized bundle sizes
- Better resource utilization

---

## Breaking Changes

### API Changes
- None (backward compatible)

### Internal Changes
- File structure reorganization
- Import paths will change
- Service instantiation patterns

### Migration Guide
All changes will be backward compatible. A detailed migration guide will be provided for each phase.

---

## Estimated Effort

- **Total Time**: 7 weeks
- **Team Size**: 1-2 developers
- **Risk Level**: Medium (well-planned migration)

---

## Next Steps

1. **Review & Approve** this proposal
2. **Create detailed tasks** for Phase 1
3. **Set up project board** for tracking
4. **Begin Phase 1** implementation

---

## Questions & Discussion

- Should we use a database for caching/state?
- Do we need Docker containerization?
- Should we implement GraphQL alongside REST?
- Do we need real-time notifications beyond WebSocket?

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-04  
**Author**: Development Team
