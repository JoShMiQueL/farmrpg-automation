# Git Hooks Scripts

Cross-platform Git hooks using Bun shell for consistent behavior across Windows, Linux, and macOS.

## Installation

Hooks are automatically installed when you run `bun install` (via the `prepare` script).

To manually install:

```bash
bun run hooks:install
```

## Available Hooks

### Pre-commit Hook
Runs before each commit:
- ✅ Runs all tests
- ✅ TypeScript type checking

### Pre-push Hook
Runs before each push:
- ✅ Runs all tests with coverage
- ✅ TypeScript type checking

## Manual Testing

Test the hooks manually:

```bash
# Test pre-commit checks
bun run precommit

# Test pre-push checks
bun run prepush

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run TypeScript type check
bun run typecheck
```

## Skipping Hooks

If you need to skip hooks temporarily:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

## How It Works

1. **install-hooks.ts** - Creates Git hook files in `.git/hooks/`
2. **pre-commit.ts** - Runs tests and type checking using Bun shell
3. **pre-push.ts** - Runs tests with coverage and type checking using Bun shell

All scripts use Bun's cross-platform shell (`$`) for consistent behavior.
