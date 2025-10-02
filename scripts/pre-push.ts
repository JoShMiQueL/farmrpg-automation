#!/usr/bin/env bun
/**
 * Pre-push hook - runs tests with coverage and type checking before push
 */

import { $ } from "bun";

console.log("🚀 Running pre-push checks...\n");

try {
  // Run tests with coverage
  console.log("📊 Running tests with coverage...");
  await $`cd apps/server && bun test --coverage`;
  console.log("✅ Tests passed!\n");

  // Run TypeScript type checking
  console.log("🔧 Running TypeScript type check...");
  await $`cd apps/server && bun x tsc --noEmit`;
  console.log("✅ Type check passed!\n");

  console.log("✅ Pre-push checks passed!");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Pre-push checks failed!");
  console.error("Fix the errors above or use --no-verify to skip checks");
  process.exit(1);
}
