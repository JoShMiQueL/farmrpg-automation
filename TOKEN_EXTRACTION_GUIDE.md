# 🔑 FarmRPG Token Extraction Guide

This guide explains how to extract your authentication tokens from FarmRPG to use with this API.

## ⚠️ Important Security Notes

- **Never share your tokens** - They provide full access to your FarmRPG account
- **Keep your `.env` file private** - It's already in `.gitignore` to prevent accidental commits
- **Tokens may expire** - If the API stops working, you may need to extract fresh tokens

---

## 📋 Prerequisites

- A FarmRPG account (logged in)
- A modern web browser (Chrome, Firefox, Edge, or Brave)
- Basic knowledge of browser Developer Tools

---

## 🔍 Method 1: Using Browser DevTools (Recommended)

### Step 1: Open FarmRPG
1. Navigate to [https://farmrpg.com](https://farmrpg.com)
2. Log in to your account if you haven't already

### Step 2: Open Developer Tools
- **Chrome/Edge/Brave**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)

### Step 3: Navigate to Application/Storage Tab
- **Chrome/Edge/Brave**: Click on the **"Application"** tab
- **Firefox**: Click on the **"Storage"** tab

### Step 4: Find Cookies
1. In the left sidebar, expand **"Cookies"**
2. Click on **"https://farmrpg.com"**

### Step 5: Copy Required Tokens
You need to copy **two cookies**:

#### 1. `farmrpg_token`
- Find the row with **Name**: `farmrpg_token`
- Copy the **Value** (long alphanumeric string)

#### 2. `HighwindFRPG`
- Find the row with **Name**: `HighwindFRPG`
- Copy the **Value** (long alphanumeric string)

### Step 6: Format Your Cookie String
Combine both tokens in this format:
```
farmrpg_token=YOUR_TOKEN_VALUE; HighwindFRPG=YOUR_SESSION_VALUE
```

**Example:**
```
farmrpg_token=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz; HighwindFRPG=xyz987wvu654tsr321qpo098nml765kji432hgf210edc
```

---

## 🔍 Method 2: Using Network Tab (Alternative)

### Step 1: Open Developer Tools
1. Navigate to [https://farmrpg.com](https://farmrpg.com) and log in
2. Press `F12` to open Developer Tools
3. Click on the **"Network"** tab

### Step 2: Perform an Action
1. Click on any page within FarmRPG (e.g., go to your inventory)
2. In the Network tab, you'll see requests being made

### Step 3: Find a Request
1. Look for any request to `farmrpg.com` (e.g., `inventory.php`, `worker.php`)
2. Click on the request to view details

### Step 4: Copy Cookie Header
1. Scroll down to **"Request Headers"**
2. Find the **"cookie:"** header
3. Copy the entire cookie string (it should contain both `farmrpg_token` and `HighwindFRPG`)

---

## ⚙️ Configuration

### Step 1: Create Environment File
1. Navigate to `apps/server/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp apps/server/.env.example apps/server/.env
   ```

### Step 2: Add Your Tokens
Open `apps/server/.env` and replace the placeholder:

```env
# FarmRPG API Configuration
PORT=3000
NODE_ENV=development

# Your FarmRPG authentication cookie
FARMRPG_COOKIE="farmrpg_token=YOUR_TOKEN_HERE; HighwindFRPG=YOUR_SESSION_HERE"
```

**Replace:**
- `YOUR_TOKEN_HERE` with your actual `farmrpg_token` value
- `YOUR_SESSION_HERE` with your actual `HighwindFRPG` value

### Step 3: Verify Configuration
The final format should look like:
```env
FARMRPG_COOKIE="farmrpg_token=abc123def456...; HighwindFRPG=xyz987wvu654..."
```

---

## ✅ Testing Your Configuration

### Step 1: Start the Server
```bash
bun run dev:server
```

### Step 2: Test the API
Open your browser or use curl to test:

```bash
curl http://localhost:3000/api/player/stats
```

**Expected Response:**
```json
{
  "silver": 12345,
  "gold": 67
}
```

If you see your actual silver and gold values, **congratulations!** Your tokens are working correctly.

---

## 🔧 Troubleshooting

### Issue: "Unauthorized" or "Invalid Cookie"
**Solution:**
- Your tokens may have expired
- Re-extract tokens following the steps above
- Ensure there are no extra spaces or quotes in your `.env` file

### Issue: "Cannot connect to FarmRPG"
**Solution:**
- Check your internet connection
- Verify FarmRPG is accessible at [https://farmrpg.com](https://farmrpg.com)
- Check if FarmRPG is undergoing maintenance

### Issue: API returns empty or incorrect data
**Solution:**
- Verify both `farmrpg_token` AND `HighwindFRPG` are present
- Make sure the cookie string format is correct (semicolon-separated)
- Try logging out and back into FarmRPG, then re-extract tokens

### Issue: Tokens work initially but stop working
**Solution:**
- FarmRPG may have logged you out or rotated your session
- Log back into FarmRPG in your browser
- Extract fresh tokens and update your `.env` file

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already handled by `.gitignore`
2. **Don't share your tokens** - They're equivalent to your password
3. **Use environment variables** - Never hardcode tokens in your code
4. **Rotate tokens regularly** - Extract new tokens periodically
5. **Keep your repository private** - If it contains sensitive data

---

## 📚 Additional Resources

- **[FarmRPG Official Site](https://farmrpg.com)**
- **[Server API Documentation](apps/server/README.md)**
- **[MVC Architecture Guide](apps/server/MVC_ARCHITECTURE.md)**

---

## 🆘 Need Help?

If you're still having issues:
1. Double-check each step in this guide
2. Verify your `.env` file format matches the examples
3. Test your tokens by logging into FarmRPG in a browser
4. Check the server logs for specific error messages

---

**Last Updated:** 2025-10-03
