# TODO - Planned Features & Refactors

## 🔄 Refactors

### Inventory System Refactor
**Priority:** High

**Current Implementation:**
- Uses `https://farmrpg.com/#!/market.php` to retrieve inventory
- Returns all items in a flat list

**Planned Changes:**
- Migrate to `https://farmrpg.com/#!/inventory.php`
- Parse items categorized by their types (Fish, Crops, Materials, etc.)
- Better organization and filtering capabilities

**Benefits:**
- More accurate inventory data
- Category-based filtering
- Better alignment with FarmRPG's actual inventory structure

**Files to Modify:**
- `src/services/FarmRPGService.ts` - Update `getInventory()` method
- `src/models/Inventory.ts` - Add category types
- `src/controllers/InventoryController.ts` - Support category filtering

---

## ✨ New Features

### Catch Fish Endpoint
**Priority:** High

**Endpoint:** `POST /api/fish/catch`

**Request:**
```json
{
  "locationId": 1,
  "baitAmount": 1
}
```

**Implementation Details:**

**API Call:**
```
POST https://farmrpg.com/worker.php?go=fishcaught&id={locationId}&r={random}&bamt={baitAmount}&p={p}&q={q}
```

**Parameters:**
- `id` - Location ID (e.g., 1 for Farm Pond)
- `r` - Random number (0-999999)
- `bamt` - Bait amount (default: 1)
- `p` - Unknown parameter (observed: 505, 481)
- `q` - Unknown parameter (observed: 716, 803)

**Response HTML Example:**
```html
<img src='/img/items/7718.PNG' alt='Drum' class='itemimg' ><br/>Drum
<span style='display:none'>
  <div id="fishcnt">275</div>
  <div id="fishingpb">86.51</div>
  <div id="staminacnt">50</div>
  <div id="baitcnt">101</div>
</span>
```

**Parsing Strategy:**
1. Extract fish name from `alt` attribute: `alt='Drum'`
2. Extract fish image from `src` attribute: `/img/items/7718.PNG`
3. Parse hidden divs using Cheerio `.html()` method:
   - `#fishcnt` - Total fish caught
   - `#fishingpb` - Fishing XP percentage
   - `#staminacnt` - Stamina remaining
   - `#baitcnt` - Bait remaining

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

**Error Handling:**
- No bait available: Return 400 error
- Invalid location: Return 404 error
- Parse errors: Return 500 error

**Files to Create:**
- `src/controllers/FishController.ts`
- `src/models/FishCatch.ts`

**Files to Modify:**
- `src/services/FarmRPGService.ts` - Add `catchFish()` method
- `src/routes/api.ts` - Add fish routes
- `src/utils/constants.ts` - Add fishing constants

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
