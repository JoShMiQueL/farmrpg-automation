# FarmRPG API

[![CI](https://img.shields.io/github/actions/workflow/status/JoShMiQueL/farmrpg-automation/ci.yml?branch=develop&label=CI&logo=github)](https://github.com/JoShMiQueL/farmrpg-automation/actions/workflows/ci.yml)

A TypeScript-based REST API for FarmRPG with monorepo architecture using Bun workspaces.

## ✨ Features

### Server (API)
- **Item Management** - Buy/sell items with automatic 200 cap handling
- **Inventory Tracking** - Category-based inventory with filtering support
- **Fishing System** - Catch fish and track bait/stamina
- **Player Stats** - Silver/gold balance tracking
- **Smart Cap Handling** - Automatic inventory cap detection and management

### Client (UI)
- **React 19** - Modern UI with shadcn/ui components
- **Responsive Design** - TailwindCSS styling
- **API Integration** - Seamless backend communication

## 🏗️ Architecture

### Monorepo Structure
```
farmrpg/
├── apps/
│   ├── client/          # React + Vite frontend
│   ├── server/          # Hono + Bun API backend
│   ├── bot/             # Standalone bot application
│   └── DEVELOPMENT.md   # Development guide
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── config/          # Shared configuration
│   └── utils/           # Shared utilities
├── package.json         # Workspaces configuration
└── README.md
```

### Server Architecture (MVC)
```
apps/server/src/
├── controllers/    # Request handlers
├── middleware/     # Express-like middleware
├── routes/         # API routes
├── services/       # Business logic
└── models/         # (Deprecated - use @farmrpg/types)
```

### Shared Packages
```
packages/
├── types/          # Shared TypeScript types
│   ├── api/        # API request/response types
│   ├── models/     # Domain models
│   └── events/     # Event types
├── config/         # Environment & constants
└── utils/          # Async, logging, validation
```

## 🚀 Quick Start

### Installation
```bash
bun install
```

### Development

**Run both client and server:**
```bash
bun run dev
```

**Run client only:**
```bash
bun run dev:client
```

**Run server only:**
```bash
bun run dev:server
```

**Run bot:**
```bash
cd apps/bot
bun run fishing
```

### Production

**Build client:**
```bash
bun run build
```

**Run server:**
```bash
bun run start
```

**Run bot:**
```bash
cd apps/bot
bun run start
```

## 📡 API Endpoints

### Player
- `GET /api/player/stats` - Get silver/gold balance

### Inventory
- `GET /api/inventory` - Get all inventory categories with stats
- `GET /api/inventory?category=fish` - Get specific category
- `GET /api/inventory?category=fish,crops` - Get multiple categories (comma-separated)

**Categories:** `items`, `fish`, `crops`, `seeds`, `loot`, `runestones`, `books`, `cards`, `rares`

### Items
- `GET /api/item/:id` - Get item details including price and inventory
- `POST /api/item/buy` - Buy items (automatically respects 200 cap)
- `POST /api/item/sell` - Sell specific item by ID and quantity
- `POST /api/item/sell-all` - Sell all items or filter by category

### Fishing
- `POST /api/fish/catch` - Catch fish at a location
  ```json
  {
    "locationId": 1,
    "baitId": 1
  }
  ```
- `GET /api/fish/bait?locationId=1` - Get bait info (count, streak, best streak)

### Bot (Deprecated - Use standalone bot app)
- Bot endpoints have been moved to the standalone bot application
- See `apps/bot/README.md` for bot usage

## 📊 Technologies

### Client
- **React 19** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library

### Server
- **Bun** - Runtime
- **Hono** - Web framework
- **TypeScript** - Type safety
- **Cheerio** - HTML parsing

### Shared Packages
- **@farmrpg/types** - Shared TypeScript types
- **@farmrpg/config** - Environment validation with Zod
- **@farmrpg/utils** - Logging, async utilities, validation

### Architecture
- **Bun Workspaces** - Monorepo with 3 apps + 3 packages
- **MVC Pattern** - Backend structure
- **Middleware Layer** - Error handling, logging, validation
- **Feature-based** - Client organization
- **Strategy Pattern** - Bot extensibility

## 🔒 Security

- ✅ Environment variables for credentials
- ✅ `.env` excluded from git
- ✅ Input validation on all endpoints
- ✅ No hardcoded secrets

## 📚 Documentation

- **[Server API Docs](apps/server/README.md)** - Detailed API documentation
- **[MVC Architecture](apps/server/MVC_ARCHITECTURE.md)** - Backend architecture patterns
- **[Fishing Bot API](apps/server/FISHING_BOT_API.md)** - Bot WebSocket API (deprecated)
- **[Bot Application](apps/bot/README.md)** - Standalone bot documentation
- **[Restructure Proposal](RESTRUCTURE_PROPOSAL.md)** - Complete restructure plan

## 🔧 Code Quality

- ✅ TypeScript throughout
- ✅ MVC architecture
- ✅ Dependency injection
- ✅ Constants extraction
- ✅ DRY principles
- ✅ Consistent error handling
- ✅ Biome for linting and formatting
- ✅ Conventional Commits enforced

## 📝 Contributing

This project follows [Conventional Commits](https://www.conventionalcommits.org/). See [COMMIT_CONVENTION.md](.github/COMMIT_CONVENTION.md) for details.

Commits are automatically validated by commitlint via git hooks.

---

**Built with ❤️ using Bun and TypeScript**
