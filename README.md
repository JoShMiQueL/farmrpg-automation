# FarmRPG

FarmRPG project with Bun workspaces architecture, separating client and server.

## Project Structure

```
farmrpg/
├── apps/
│   ├── client/          # React + Vite application
│   ├── server/          # Hono + Bun API
│   └── DEVELOPMENT.md   # Development guide
├── package.json         # Workspaces configuration
└── README.md
```

## Quick Start

### Installation
```bash
bun install
```

### Development

**Run client and server simultaneously:**
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

**Run server in production:**
```bash
bun run start
```

## Technologies

- **Client**: React 19, Vite, TailwindCSS, shadcn/ui
- **Server**: Bun, Hono, Cheerio
- **Workspaces**: Bun workspaces for monorepo management

## Documentation

- **[Development Guide](apps/DEVELOPMENT.md)** - Complete development workflow
- **[Client Documentation](apps/client/README.md)** - Frontend setup and usage
- **[Server Documentation](apps/server/README.md)** - Backend API documentation
- **[MVC Architecture](apps/server/MVC_ARCHITECTURE.md)** - Server architecture patterns

## Features

- ✅ Monorepo with Bun workspaces
- ✅ Separate client and server packages
- ✅ Hot module replacement (HMR) for both
- ✅ TypeScript throughout
- ✅ Modern UI with shadcn/ui
- ✅ API proxy configuration
- ✅ MVC architecture on backend
