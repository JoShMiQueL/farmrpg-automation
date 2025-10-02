# TODO - Planned Features & Refactors

## 🔄 Refactors

### ✅ Inventory System Refactor (COMPLETED)
**Priority:** High

**Implementation:**
- ✅ Migrated to `https://farmrpg.com/#!/inventory.php`
- ✅ Parse items categorized by their types (Items, Fish & Bait, Crops, Seeds, Loot & Treasure, Runestones, Books, Cards, Super Rares)
- ✅ Added inventory stats (unique items, total items, max capacity)
- ✅ Better organization with category-based structure

**Changes Made:**
- ✅ Updated `src/models/Inventory.ts` - Added `InventoryCategory`, `InventoryCategoryData`, and `InventoryStats` types
- ✅ Updated `src/services/FarmRPGService.ts` - Refactored `getInventory(categoryFilter?)` to parse `/inventory.php` HTML with optional category filtering
- ✅ Updated `src/controllers/InventoryController.ts` - Added category query parameter support with validation
- ✅ Removed `getFishInventory()` method (use `getInventory("fish")` instead)
- ✅ Updated `sellAllItems()` to support optional category filtering

**API Endpoints:**
- `GET /api/inventory` - Returns all categories
- `GET /api/inventory?category=fish` - Returns only fish items
- `GET /api/inventory?category=fish,crops` - Returns fish and crops items (comma-separated)
- `GET /api/inventory?category=crops` - Returns only crops
- Valid categories: `items`, `fish`, `crops`, `seeds`, `loot`, `runestones`, `books`, `cards`, `rares`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "fish",
        "items": [
          {
            "id": 17,
            "name": "Drum",
            "description": "Not an instrument",
            "quantity": 179,
            "imageUrl": "https://farmrpg.com/img/items/7718.PNG"
          }
        ]
      }
    ],
    "stats": {
      "uniqueItems": 8,
      "totalItems": 407,
      "maxCapacity": 200
    }
  }
}
```

---

## ✨ New Features

### ✅ Catch Fish Endpoint (COMPLETED)
**Priority:** High

**Endpoints:**
- `POST /api/fish/catch` - Catch a fish at a location
- `GET /api/fish/bait?locationId=1` - Get bait info for a location

**Request:**
```json
{
  "locationId": 1,
  "baitAmount": 1
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "catch": {
      "id": 7718,
      "name": "Drum",
      "image": "https://farmrpg.com/img/items/7718.PNG"
    },
    "stats": {
      "totalFishCaught": 275,
      "fishingXpPercent": 86.51
    },
    "resources": {
      "stamina": 50,
      "bait": 101
    }
  },
  "timestamp": "2025-10-02T18:17:00.000Z"
}
```

**Implementation:**
- ✅ Created `src/models/FishCatch.ts` - Fish catch data models
- ✅ Created `src/controllers/FishController.ts` - Fish controller with validation
- ✅ Updated `src/services/FarmRPGService.ts` - Added `catchFish()` and `getBaitInfo()` methods
- ✅ Updated `src/routes/api.ts` - Added fish routes
- ✅ Parses fish data from HTML response (name, image, ID)
- ✅ Extracts hidden stats (total fish caught, XP%, stamina, bait)
- ✅ Generates random parameters (r, p, q) for API call
- ✅ Error handling for invalid requests and parse errors

---

## 🎯 Future Considerations

### Fishing Bot (Phase 2)
After implementing the catch fish endpoint, consider:
- Automated fishing loop
- Auto-buy bait when running low
- Auto-sell fish at inventory cap
- Configurable delays between catches
- Real-time status tracking

### Additional Endpoints
- `GET /api/fish/locations` - List all fishing locations
- `GET /api/fish/stats` - Get fishing statistics
- `POST /api/fish/buy-bait` - Quick bait purchase

---

## 📝 Notes

### Cheerio Parsing Best Practices
- Use `.html()` instead of `.text()` for hidden divs
- Use `$("img").attr("alt")` for fish names
- Use `$("#elementId").html()` for div content
- Always provide fallback values

### Testing Checklist
- [ ] Test with different fishing locations
- [ ] Test with no bait scenario
- [ ] Test with different bait amounts
- [ ] Verify image URL construction
- [ ] Validate all parsed stats

---

**Last Updated:** 2025-10-02
