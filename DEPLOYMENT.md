# Deployment Guide

Complete guide for deploying the FarmRPG automation system.

---

## 📋 Prerequisites

- **Bun** v1.0.0 or higher
- **Node.js** v18+ (for compatibility)
- **Git** for version control
- **FarmRPG Account** with valid session cookie

---

## 🌍 Environment Variables

### Server (.env)
```bash
# Required
FARMRPG_COOKIE=your_session_cookie_here

# Optional
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CACHE_TTL=60
```

### Bot (.env)
```bash
# Required
FARMRPG_COOKIE=your_session_cookie_here

# Optional
API_URL=http://localhost:3000
FISHING_LOCATION_ID=1
FISHING_BAIT_ID=1
DELAY_MIN=1000
DELAY_MAX=3000
AUTO_BUY_BAIT=true
BAIT_ITEM_ID=18
MIN_BAIT_COUNT=10
BUY_QUANTITY=100
AUTO_STOP=true
MAX_CATCHES=100
STOP_NO_BAIT=true
STOP_NO_STAMINA=true
```

---

## 🚀 Deployment Options

### Option 1: Single Server Deployment

Deploy all components on one server.

```bash
# Install dependencies
bun install

# Build client
bun run build

# Start server (production)
NODE_ENV=production bun run start

# Start bot (separate terminal)
cd apps/bot
bun run fishing
```

### Option 2: Distributed Deployment

Deploy components on separate servers for better scalability.

#### Server Deployment
```bash
# On server machine
git clone <repo>
cd farmrpg
bun install
bun run build
NODE_ENV=production bun run start
```

#### Bot Deployment
```bash
# On bot machine
git clone <repo>
cd farmrpg/apps/bot
bun install
API_URL=http://your-server:3000 bun run fishing
```

#### Client Deployment
```bash
# Build and deploy static files
bun run build
# Deploy apps/client/dist to CDN or static hosting
```

---

## 🐳 Docker Deployment

### Server Dockerfile
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY packages ./packages
RUN bun install --frozen-lockfile

# Copy source
COPY apps/server ./apps/server

# Expose port
EXPOSE 3000

# Start server
CMD ["bun", "run", "start"]
```

### Bot Dockerfile
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY apps/bot/package.json ./apps/bot/
COPY packages ./packages
RUN bun install --frozen-lockfile

# Copy source
COPY apps/bot ./apps/bot

# Start bot
CMD ["bun", "--cwd", "apps/bot", "run", "fishing"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FARMRPG_COOKIE=${FARMRPG_COOKIE}
    restart: unless-stopped

  bot:
    build:
      context: .
      dockerfile: Dockerfile.bot
    environment:
      - API_URL=http://server:3000
      - FARMRPG_COOKIE=${FARMRPG_COOKIE}
      - FISHING_LOCATION_ID=1
      - AUTO_BUY_BAIT=true
    depends_on:
      - server
    restart: unless-stopped
```

---

## 🔧 Process Management

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start "bun run start" --name farmrpg-server

# Start bot
pm2 start "bun run fishing" --name farmrpg-bot --cwd apps/bot

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### Using systemd

#### Server Service
```ini
# /etc/systemd/system/farmrpg-server.service
[Unit]
Description=FarmRPG API Server
After=network.target

[Service]
Type=simple
User=farmrpg
WorkingDirectory=/opt/farmrpg
Environment="NODE_ENV=production"
EnvironmentFile=/opt/farmrpg/.env
ExecStart=/usr/local/bin/bun run start
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Bot Service
```ini
# /etc/systemd/system/farmrpg-bot.service
[Unit]
Description=FarmRPG Fishing Bot
After=network.target farmrpg-server.service

[Service]
Type=simple
User=farmrpg
WorkingDirectory=/opt/farmrpg/apps/bot
EnvironmentFile=/opt/farmrpg/apps/bot/.env
ExecStart=/usr/local/bin/bun run fishing
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable farmrpg-server farmrpg-bot
sudo systemctl start farmrpg-server farmrpg-bot
```

---

## 📊 Monitoring

### Health Checks

Server health endpoint:
```bash
curl http://localhost:3000/api/player/stats
```

Bot logs:
```bash
# PM2
pm2 logs farmrpg-bot

# systemd
journalctl -u farmrpg-bot -f
```

### Metrics

Monitor these metrics:
- Server response times
- Bot catches per hour
- Error rates
- Memory usage
- CPU usage

---

## 🔄 Updates

### Rolling Update

```bash
# Pull latest code
git pull

# Install dependencies
bun install

# Rebuild client
bun run build

# Restart services
pm2 restart farmrpg-server
pm2 restart farmrpg-bot
```

### Zero-Downtime Update

1. Start new server instance on different port
2. Update load balancer to point to new instance
3. Gracefully shutdown old instance
4. Update bot to use new server

---

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use environment-specific configurations**
3. **Enable CORS only for trusted origins**
4. **Use HTTPS in production**
5. **Rotate FarmRPG cookies regularly**
6. **Monitor for suspicious activity**
7. **Keep dependencies updated**
8. **Use rate limiting**

---

## 🐛 Troubleshooting

### Server won't start
- Check `FARMRPG_COOKIE` is set
- Verify port 3000 is available
- Check logs for errors

### Bot can't connect
- Verify `API_URL` is correct
- Check server is running
- Verify network connectivity

### Out of memory
- Increase Node.js memory limit
- Check for memory leaks
- Monitor resource usage

---

## 📝 Maintenance

### Daily Tasks
- Check bot is running
- Monitor error logs
- Verify catches are happening

### Weekly Tasks
- Review error rates
- Check resource usage
- Update dependencies if needed

### Monthly Tasks
- Rotate credentials
- Review and optimize performance
- Update documentation

---

## 🆘 Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Check GitHub issues
4. Create new issue with details

---

**Last Updated**: 2025-10-04  
**Version**: 1.0.0
