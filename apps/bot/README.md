# FarmRPG Bot

Standalone bot application for automated FarmRPG tasks.

## Features

- 🎣 **Fishing Bot** - Automated fishing with configurable options
- 🛒 **Auto-buy Bait** - Automatically purchase bait when running low
- 🛑 **Auto-stop** - Stop on no bait, no stamina, or max catches
- 📊 **Statistics** - Track catches, errors, and session duration
- ⚙️ **Configurable** - Environment variables or CLI arguments

## Installation

```bash
# Install dependencies
bun install
```

## Usage

### Fishing Bot

```bash
# Run fishing bot
bun run fishing

# Or with custom API URL
API_URL=http://localhost:3000 bun run fishing
```

### Configuration

Configure via environment variables:

```bash
# Fishing location (default: 1)
FISHING_LOCATION_ID=1

# Bait type ID (default: 1 for Worms)
FISHING_BAIT_ID=1

# Delay between catches (ms)
DELAY_MIN=1000
DELAY_MAX=3000

# Auto-buy bait
AUTO_BUY_BAIT=true
BAIT_ITEM_ID=18
MIN_BAIT_COUNT=10
BUY_QUANTITY=100

# Auto-stop conditions
AUTO_STOP=true
MAX_CATCHES=100
STOP_NO_BAIT=true
STOP_NO_STAMINA=true

# API URL
API_URL=http://localhost:3000
```

## Architecture

```
apps/bot/
├── src/
│   ├── api/          # API client for server communication
│   ├── bots/         # Bot executables
│   ├── strategies/   # Bot strategies (fishing, etc.)
│   └── config/       # Configuration
├── index.ts          # Entry point
└── package.json
```

## Bot Strategies

### FishingStrategy

Handles automated fishing with:
- Random delays between catches
- Auto-buy bait when running low
- Auto-stop on conditions
- Error handling and retry logic
- Session statistics

## Development

```bash
# Run with hot reload
bun run dev

# Run specific bot
bun run fishing
```

## Graceful Shutdown

The bot handles `SIGINT` (Ctrl+C) and `SIGTERM` gracefully:
- Logs final statistics
- Cleans up resources
- Exits cleanly

## Logging

Structured logging with Pino:
- Info: Bot status and catches
- Warn: Low bait, errors
- Error: Critical failures

## Future Bots

Planned bot types:
- 🌾 Farming bot
- 🏪 Trading bot
- 🎁 Quest bot
- 🏭 Crafting bot
