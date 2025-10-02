#!/usr/bin/env bun
/**
 * Pre-commit hook - runs tests and type checking before commit
 */

import { $ } from "bun";

console.log("🔍 Running pre-commit checks...\n");

try {
  // Run tests
  console.log("📝 Running tests...");
  await $`cd apps/server && bun test`;
  console.log("✅ Tests passed!\n");

  // Run TypeScript type checking
  console.log("🔧 Running TypeScript type check...");
  await $`cd apps/server && bun x tsc --noEmit`;
  console.log("✅ Type check passed!\n");

  console.log("✅ Pre-commit checks passed!");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Pre-commit checks failed!");
  console.error("Fix the errors above or use --no-verify to skip checks");
  process.exit(1);
}
