# FarmRPG Client

FarmRPG frontend built with React 19, Vite, and TailwindCSS.

## Technologies

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **TailwindCSS 4**: Utility-first CSS
- **shadcn/ui**: Reusable UI components
- **Lucide React**: Icons

## Structure

```
src/
├── components/
│   └── ui/          # shadcn/ui components
├── lib/
│   └── utils.ts     # Utilities (cn, etc.)
├── App.tsx          # Main component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Development

```bash
# From project root
bun run dev:client

# Or from this directory
bun run dev
```

The development server runs at **http://localhost:5173**

## API Proxy

All requests to `/api/*` are automatically redirected to the backend server at `http://localhost:3000/api/*`

Configured in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## Build

```bash
# From project root
bun run build

# Or from this directory
bun run build
```

Compiled files are generated in `dist/`

## Adding Components

To add new shadcn/ui components:

```bash
bunx shadcn@latest add <component-name>
```

Example:
```bash
bunx shadcn@latest add button
bunx shadcn@latest add card
```

## Environment Variables

Create a `.env.local` file for environment variables:

```env
VITE_API_URL=http://localhost:3000
```

Access them with `import.meta.env.VITE_API_URL`
