# FarmRPG Automation

A full-stack TypeScript application for FarmRPG automation with monorepo architecture using Bun workspaces.

## ✨ Features

### Server (API)
- **Fishing Bot** - Automated fishing with smart inventory management
- **Item Management** - Buy/sell items with automatic 200 cap handling
- **Inventory Tracking** - Real-time inventory with cap detection
- **Player Stats** - Silver/gold balance tracking

### Client (UI)
- **React 19** - Modern UI with shadcn/ui components
- **Real-time Updates** - Live bot status and stats
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
- `GET /api/inventory` - Get all items with cap detection

### Items
- `GET /api/item/:id` - Get item details
- `POST /api/item/buy` - Buy items (respects 200 cap)
- `POST /api/item/sell` - Sell specific item
- `POST /api/item/sell-all` - Sell all or capped items

### Fishing Bot
- `POST /api/bot/fishing` - Start/stop bot
- `GET /api/bot/fishing/status` - Get bot status

## 🎣 Fishing Bot

### Automation Features
1. Catches fish every 2-6 seconds (configurable)
2. Auto-buys worms when out of bait
3. Auto-sells items at 200 cap
4. Handles insufficient silver

### Configuration
```json
{
  "action": "start",
  "config": {
    "minDelay": 2,
    "maxDelay": 6,
    "baitToBuy": 100
  }
}
```

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

- **[Development Guide](apps/DEVELOPMENT.md)** - Complete workflow
- **[Client Docs](apps/client/README.md)** - Frontend setup
- **[Server API Docs](apps/server/README.md)** - API endpoints
- **[MVC Architecture](apps/server/MVC_ARCHITECTURE.md)** - Backend patterns

## 🔧 Code Quality

- ✅ TypeScript throughout
- ✅ MVC architecture
- ✅ Dependency injection
- ✅ Constants extraction
- ✅ DRY principles
- ✅ Consistent error handling

---

**Built with ❤️ using Bun and TypeScript**
