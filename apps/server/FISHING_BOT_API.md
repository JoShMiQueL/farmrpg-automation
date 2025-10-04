# Fishing Bot API Documentation

The Fishing Bot provides automated fishing functionality with real-time WebSocket updates for monitoring and control.

## Features

- ✅ Automated fishing with configurable delays
- ✅ Real-time WebSocket updates for catches, stats, and errors
- ✅ Auto-buy bait when running low
- ✅ Auto-stop conditions (no bait, no stamina, max catches)
- ✅ Pause/Resume functionality
- ✅ Configurable fishing location and bait type
- ✅ Session statistics tracking

## REST API Endpoints

### Get Bot Status
```http
GET /api/bot/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "idle|running|paused|stopped|error",
    "config": {
      "locationId": 1,
      "baitId": 1,
      "autoBuyBait": {
        "enabled": false,
        "baitItemId": 18,
        "minBaitCount": 10,
        "buyQuantity": 100
      },
      "autoStop": {
        "enabled": true,
        "maxCatches": 100,
        "noBait": true,
        "noStamina": true
      },
      "delay": {
        "min": 1000,
        "max": 3000
      }
    },
    "stats": {
      "totalCatches": 0,
      "errors": 0,
      "sessionStartTime": "2025-10-03T18:30:00.000Z",
      "lastCatchTime": "2025-10-03T18:31:00.000Z"
    },
    "currentResources": {
      "stamina": 100,
      "bait": 50
    }
  },
  "timestamp": "2025-10-03T18:30:00.000Z"
}
```

### Start Bot
```http
POST /api/bot/start
Content-Type: application/json

{
  "config": {
    "locationId": 1,
    "baitId": 1,
    "autoStop": {
      "enabled": true,
      "maxCatches": 100,
      "noBait": true,
      "noStamina": true
    },
    "delay": {
      "min": 1000,
      "max": 3000
    }
  }
}
```

**Response:** Same as Get Bot Status

### Stop Bot
```http
POST /api/bot/stop
```

**Response:** Same as Get Bot Status

### Pause Bot
```http
POST /api/bot/pause
```

**Response:** Same as Get Bot Status

### Resume Bot
```http
POST /api/bot/resume
```

**Response:** Same as Get Bot Status

### Update Configuration
```http
POST /api/bot/config
Content-Type: application/json

{
  "config": {
    "locationId": 2,
    "baitId": 5
  }
}
```

**Response:** Same as Get Bot Status

## WebSocket API

### Connection
```
ws://localhost:3000/api/bot/ws
```

### Client → Server Messages

Send JSON commands to control the bot:

#### Start Bot
```json
{
  "action": "start",
  "config": {
    "locationId": 1,
    "baitId": 1
  }
}
```

#### Stop Bot
```json
{
  "action": "stop"
}
```

#### Pause Bot
```json
{
  "action": "pause"
}
```

#### Resume Bot
```json
{
  "action": "resume"
}
```

#### Get Status
```json
{
  "action": "status"
}
```

#### Update Config
```json
{
  "action": "config",
  "config": {
    "locationId": 2,
    "delay": {
      "min": 2000,
      "max": 4000
    }
  }
}
```

### Server → Client Events

The server sends real-time events as JSON:

#### Status Event
```json
{
  "type": "status",
  "timestamp": "2025-10-03T18:30:00.000Z",
  "data": {
    "status": "running",
    "message": "Bot started",
    "stats": {
      "totalCatches": 0,
      "errors": 0
    }
  }
}
```

#### Catch Event
```json
{
  "type": "catch",
  "timestamp": "2025-10-03T18:30:01.000Z",
  "data": {
    "catch": {
      "id": 7718,
      "name": "Yellow Perch",
      "image": "https://farmrpg.com/img/items/7718.PNG"
    },
    "stats": {
      "totalFishCaught": 1234,
      "fishingXpPercent": 45.5
    },
    "resources": {
      "stamina": 99,
      "bait": 49
    },
    "sessionStats": {
      "totalCatches": 1,
      "errors": 0,
      "sessionStartTime": "2025-10-03T18:30:00.000Z",
      "lastCatchTime": "2025-10-03T18:30:01.000Z"
    }
  }
}
```

#### Stats Event
```json
{
  "type": "stats",
  "timestamp": "2025-10-03T18:30:01.000Z",
  "data": {
    "stats": {
      "totalCatches": 10,
      "errors": 0,
      "sessionStartTime": "2025-10-03T18:30:00.000Z",
      "lastCatchTime": "2025-10-03T18:30:10.000Z"
    },
    "resources": {
      "stamina": 90,
      "bait": 40
    }
  }
}
```

#### Error Event
```json
{
  "type": "error",
  "timestamp": "2025-10-03T18:30:01.000Z",
  "data": {
    "message": "Out of bait",
    "statusCode": 400
  }
}
```

#### Bait Purchase Event
```json
{
  "type": "bait_purchase",
  "timestamp": "2025-10-03T18:30:01.000Z",
  "data": {
    "itemId": 18,
    "itemName": "Worms",
    "quantityPurchased": 100,
    "totalCost": {
      "amount": 500,
      "currency": "Silver"
    },
    "currentInventory": 150,
    "remainingCoins": {
      "silver": 9500,
      "gold": 100
    },
    "newBaitCount": 150
  }
}
```

## Configuration Options

### Bot Config

- **locationId** (number): Fishing location ID (default: 1)
- **baitId** (number): Bait type ID (e.g., 1 for Worms, 2 for Grubs, etc.) (default: 1)
- **autoBuyBait** (object): Auto-buy bait configuration
  - **enabled** (boolean): Enable auto-buy bait (default: false)
  - **baitItemId** (number): Item ID of the bait to purchase (default: 18 for Worms)
  - **minBaitCount** (number): Buy bait when count falls below this (default: 10)
  - **buyQuantity** (number): How many to buy each time (default: 100)
- **autoStop** (object): Auto-stop conditions
  - **enabled** (boolean): Enable auto-stop (default: true)
  - **maxCatches** (number, optional): Stop after X catches
  - **noBait** (boolean): Stop when out of bait (default: true)
  - **noStamina** (boolean): Stop when out of stamina (default: true)
- **delay** (object): Delay between catches
  - **min** (number): Minimum delay in milliseconds (default: 1000)
  - **max** (number): Maximum delay in milliseconds (default: 3000)

## Bot Status Values

- **idle**: Bot is initialized but not running
- **running**: Bot is actively fishing
- **paused**: Bot is paused and can be resumed
- **stopped**: Bot has stopped (manually or due to auto-stop condition)
- **error**: Bot encountered an error

## Example Client Implementation

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/api/bot/ws');

ws.onopen = () => {
  console.log('Connected to fishing bot');
  
  // Start the bot with auto-buy bait enabled
  ws.send(JSON.stringify({
    action: 'start',
    config: {
      locationId: 1,
      baitId: 1,
      autoBuyBait: {
        enabled: true,
        baitItemId: 18, // Worms
        minBaitCount: 10,
        buyQuantity: 100
      },
      autoStop: {
        enabled: true,
        maxCatches: 50,
        noBait: false, // Don't stop on no bait since we auto-buy
        noStamina: true
      },
      delay: {
        min: 1500,
        max: 2500
      }
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'status':
      console.log('Bot status:', message.data.status);
      break;
      
    case 'catch':
      console.log('Caught:', message.data.catch.name);
      console.log('Session catches:', message.data.sessionStats.totalCatches);
      break;
      
    case 'stats':
      console.log('Stats update:', message.data.stats);
      break;
      
    case 'bait_purchase':
      console.log('Bought bait:', message.data.quantityPurchased, message.data.itemName);
      console.log('New bait count:', message.data.newBaitCount);
      break;
      
    case 'error':
      console.error('Error:', message.data.message);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from fishing bot');
};

// Stop the bot after 5 minutes
setTimeout(() => {
  ws.send(JSON.stringify({ action: 'stop' }));
}, 5 * 60 * 1000);
```

## Notes

- The bot uses random delays between catches to simulate human behavior
- WebSocket connections automatically receive the current bot state upon connection
- Multiple WebSocket clients can connect simultaneously and receive the same events
- The bot service is a singleton, so all clients control the same bot instance
- Auto-stop conditions are checked after each successful catch
- **Auto-buy bait**: When enabled, the bot will automatically purchase bait when the count falls below `minBaitCount`. It checks before each fishing attempt and when a "no bait" error occurs
- If auto-buy bait is enabled, consider setting `autoStop.noBait` to `false` to prevent stopping when bait runs out temporarily
- The bot will emit a `bait_purchase` event whenever it successfully buys bait, including purchase details and remaining coins
