# FarmRPG API

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
│   └── DEVELOPMENT.md   # Development guide
├── package.json         # Workspaces configuration
└── README.md
```

### Server Architecture (MVC)
```
apps/server/src/
├── controllers/    # Request handlers
├── models/         # TypeScript interfaces
├── routes/         # API routes
├── services/       # Business logic
└── utils/          # Helpers & constants
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

### Production

**Build client:**
```bash
bun run build
```

**Run server:**
```bash
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
    "baitAmount": 1
  }
  ```
- `GET /api/fish/bait?locationId=1` - Get bait info (count, streak, best streak)

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

### Architecture
- **Bun Workspaces** - Monorepo
- **MVC Pattern** - Backend structure
- **Dependency Injection** - Shared services

## 🔒 Security

- ✅ Environment variables for credentials
- ✅ `.env` excluded from git
- ✅ Input validation on all endpoints
- ✅ No hardcoded secrets

## 📚 Documentation

- **[Server API Docs](apps/server/README.md)** - Detailed API documentation
- **[MVC Architecture](apps/server/MVC_ARCHITECTURE.md)** - Backend architecture patterns

## 🔧 Code Quality

- ✅ TypeScript throughout
- ✅ MVC architecture
- ✅ Dependency injection
- ✅ Constants extraction
- ✅ DRY principles
- ✅ Consistent error handling

---

**Built with ❤️ using Bun and TypeScript**
