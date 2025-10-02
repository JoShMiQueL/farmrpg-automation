# Development Guide

## Architecture

This project uses **Bun Workspaces** with a monorepo architecture:

- **Frontend**: React + Vite (port 5173) in `apps/client/`
- **Backend**: Hono + Bun (port 3000) in `apps/server/`

## Installation

```bash
# Install all workspace dependencies
bun install
```

## Development

### Run Both Servers (Recommended)

```bash
bun run dev
```

This runs both the client and server simultaneously.

### Run Servers Individually

**Frontend only:**
```bash
bun run dev:client
```
Runs Vite dev server at http://localhost:5173

**Backend only:**
```bash
bun run dev:server
```
Runs Hono API server at http://localhost:3000

## How It Works

1. **Vite** serves the React frontend with hot module replacement (HMR)
2. **Hono** handles all API requests at `/api/*`
3. **Vite proxy** redirects API requests from the frontend to the backend

When you make a request to `/api/catchfish` from the frontend:
- Vite intercepts it and redirects to `http://localhost:3000/api/catchfish`
- The Hono backend processes the request
- The response is sent back to the frontend

## Project Structure

```
farmrpg/
├── apps/
│   ├── client/              # React frontend
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # Utilities
│   │   │   ├── main.tsx     # React entry point
│   │   │   └── App.tsx      # Main component
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── server/              # Hono backend
│       ├── src/
│       │   ├── controllers/ # API controllers
│       │   ├── services/    # Business logic
│       │   ├── models/      # TypeScript types
│       │   └── routes/      # API routes
│       ├── index.ts         # Server entry point
│       └── package.json
│
├── package.json             # Workspaces configuration
└── README.md
```

## Dependency Management

### Add dependency to client:
```bash
cd apps/client
bun add <package>
```

### Add dependency to server:
```bash
cd apps/server
bun add <package>
```

### Add dependency to both:
```bash
bun add <package> --workspace
```

## Production Build

```bash
# Build client
bun run build
```

This builds the React app to `apps/client/dist/`

## Run in Production

```bash
# Run server
bun run start
```

Starts the Hono server in production mode. You'll need to serve the built frontend separately or configure Hono to serve static files from `apps/client/dist/`

## Additional Documentation

- [Client Documentation](./client/README.md) - Frontend setup and usage
- [Server Documentation](./server/README.md) - Backend API documentation
- [MVC Architecture](./server/MVC_ARCHITECTURE.md) - Server architecture patterns
