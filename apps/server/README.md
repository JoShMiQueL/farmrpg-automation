# FarmRPG Server

FarmRPG API backend built with Hono and Bun.

## Technologies

- **Bun**: Ultra-fast JavaScript runtime
- **Hono**: Minimalist web framework
- **Cheerio**: Web scraping and HTML parsing
- **TypeScript**: Static typing

## MVC Architecture

This server follows the **Model-View-Controller** pattern. See [MVC_ARCHITECTURE.md](./MVC_ARCHITECTURE.md) for more details.

```
src/
├── controllers/     # Controller logic
│   └── FishController.ts
├── models/          # Data types and models
│   └── FishCatch.ts
├── routes/          # Route definitions
│   └── api.ts
└── services/        # External services
    └── FarmRPGService.ts
```

## Development

```bash
# From project root
bun run dev:server

# Or from this directory
bun run dev
```

The server runs at **http://localhost:3000** with automatic hot reload.
## Endpoints

### Player API
- `GET /api/player/stats` - Get player's current coins (Silver & Gold)

**Response:**
```json
{
  "success": true,
  "data": {
    "silver": 500,
    "gold": 10
  },
  "timestamp": "2025-10-02T13:18:55.000Z"
}
```

### Fishing Bot API

#### Start/Stop/Status Bot
- `POST /api/bot/fishing` - Control the fishing bot

**Start Bot:**
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

**Stop Bot:**
```json
{
  "action": "stop"
}
```

**Get Status:**
```json
{
  "action": "status"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "totalFishCaught": 45,
    "totalBaitUsed": 45,
    "totalBaitPurchased": 100,
    "totalSilverSpent": 300,
    "totalSilverEarned": 150,
    "currentBait": 55,
    "currentSilver": 1126,
    "currentFishCount": 45,
    "lastAction": "Caught Minnow! (Bait left: 55)",
    "startTime": "2025-10-02T13:50:00.000Z",
    "errors": []
  },
  "timestamp": "2025-10-02T14:01:44.000Z"
}
```

#### Get Bot Status
- `GET /api/bot/fishing/status` - Get current bot status

**Response:** Same as control endpoint

**Bot Behavior:**
1. **Checks fish inventory** before each catch
2. **If at 200 fish cap** → Sells all fish at market
3. **Catches fish** every 2-6 seconds (random)
4. **When out of bait** → Buys 100 worms
5. **If not enough silver** → Sells all fish at market
6. Repeats until stopped

**Inventory Management:**
- Monitors fish count in real-time
- Automatically sells when reaching 200 fish cap
- Prevents inventory overflow

### Inventory API

#### Get Full Inventory
- `GET /api/inventory` - Get all items from market with complete details

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 17,
        "name": "Drum",
        "quantity": 200,
        "price": 12,
        "totalValue": 2400,
        "isAtCap": true,
        "imageUrl": "https://farmrpg.com/img/items/7718.PNG"
      },
      {
        "id": 215,
        "name": "Cogwheel",
        "quantity": 17,
        "price": 1750,
        "totalValue": 29750,
        "isAtCap": false,
        "imageUrl": "https://farmrpg.com/img/items/7211.png"
      }
    ],
    "totalItems": 217,
    "totalValue": 32150
  },
  "timestamp": "2025-10-02T16:29:19.000Z"
}
```

**Features:**
- Complete item details (ID, name, quantity, price)
- Inventory cap detection (`isAtCap: true` when at 200)
- Total items count (sum of all quantities)
- Total value calculation
- Item images

### Item API

#### Get Item Details
- `GET /api/item/:id` - Get item details including price, description, and crafting use

**Example:** `GET /api/item/18`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 18,
    "name": "Worms",
    "description": "Use this to catch fish",
    "image": "/img/items/7758.png",
    "inventory": {
      "quantity": 10
    },
    "buyPrice": {
      "amount": 3,
      "currency": "Silver",
      "location": "Buy at Country Store"
    },
    "givable": true,
    "helpRequests": 12,
    "craftingUse": [
      {
        "itemName": "Chum",
        "itemId": 481,
        "requirements": ["1x Bucket", "7x Grubs", "4x Minnows", "10x Worms"],
        "requiredLevel": 52
      }
    ]
  },
  "timestamp": "2025-10-02T13:25:41.000Z"
}
```

#### Buy Item
- `POST /api/item/buy` - Purchase an item from the store

**Request:**
```json
{
  "itemId": 18,
  "quantity": 10
}
```

**Special:** 
- Use `quantity: -1` to buy all available with current silver/gold
- Automatically respects 200 item inventory cap
- Example: If you have 165 items and request 200, it will buy only 35

**Response:**
```json
{
  "success": true,
  "data": {
    "itemId": 18,
    "itemName": "Worms",
    "quantityPurchased": 10,
    "currentInventory": 25,
    "totalCost": {
      "amount": 30,
      "currency": "Silver"
    },
    "remainingCoins": {
      "silver": 470,
      "gold": 10
    }
  },
  "timestamp": "2025-10-02T13:25:41.000Z"
}
```

**Error Response (Insufficient Funds):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Insufficient Silver. Need 30 Silver, have 20",
    "statusCode": 400
  }
}
```

#### Sell Item
- `POST /api/item/sell` - Sell a specific item by ID and quantity

**Request:**
```json
{
  "itemId": 17,
  "quantity": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itemId": 17,
    "quantitySold": 50
  },
  "timestamp": "2025-10-02T16:51:42.000Z"
}
```

#### Sell All Items
- `POST /api/item/sell-all` - Sell all items in inventory or only capped items

**Request (optional):**
```json
{
  "onlyCapped": true
}
```

**Response (all items):**
```json
{
  "success": true,
  "data": {
    "totalSilver": 15000,
    "itemsSold": 500,
    "itemTypes": 10
  },
  "timestamp": "2025-10-02T16:54:19.000Z"
}
```

**Response (only capped):**
```json
{
  "success": true,
  "data": {
    "totalSilver": 5000,
    "itemsSold": 250,
    "itemTypes": 3
  },
  "timestamp": "2025-10-02T16:54:19.000Z"
}
```

## Adding New Endpoints

1. **Create model** in `src/models/`
2. **Create service** (if needed) in `src/services/`
3. **Create controller** in `src/controllers/`
4. **Register route** in `src/routes/api.ts`

See [MVC_ARCHITECTURE.md](./MVC_ARCHITECTURE.md) for complete examples.

## Environment Variables

Create a `.env` file for configuration:

```env
PORT=3000
NODE_ENV=development

# Your FarmRPG authentication cookie (REQUIRED)
# Get this from your browser:
# 1. Go to https://farmrpg.com and login
# 2. Open DevTools (F12) → Application/Storage → Cookies
# 3. Copy the values of 'farmrpg_token' and 'HighwindFRPG'
# 4. Format: "farmrpg_token=YOUR_TOKEN; HighwindFRPG=YOUR_SESSION"
FARMRPG_COOKIE="farmrpg_token=YOUR_TOKEN_HERE; HighwindFRPG=YOUR_SESSION_HERE"
```

**⚠️ Important:** Without setting `FARMRPG_COOKIE`, the API will not work as it needs authentication to access FarmRPG data.

## Production

```bash
# From project root
bun run start

# Or from this directory
NODE_ENV=production bun index.ts
```

## Testing

```bash
# TODO: Add tests
bun test
```

## CORS

The server has CORS enabled for development. In production, configure allowed origins in `index.ts`:

```typescript
app.use("*", cors({
  origin: ["https://yourdomain.com"],
}));
```
