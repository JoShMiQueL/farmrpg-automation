#!/usr/bin/env bun
/**
 * Install Git hooks using Bun shell
 */

import { $ } from "bun";
import { writeFileSync, chmodSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

console.log("🔧 Installing Git hooks...\n");

try {
  const hooksDir = ".git/hooks";
  
  // Create hooks directory if it doesn't exist
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  const hookContent = (scriptName: string) => `#!/bin/sh
bun run scripts/${scriptName}.ts
`;

  // Install pre-commit hook
  console.log("📝 Installing pre-commit hook...");
  const preCommitPath = join(hooksDir, "pre-commit");
  writeFileSync(preCommitPath, hookContent("pre-commit"));
  chmodSync(preCommitPath, 0o755);
  console.log("✅ pre-commit hook installed");

  // Install pre-push hook
  console.log("📝 Installing pre-push hook...");
  const prePushPath = join(hooksDir, "pre-push");
  writeFileSync(prePushPath, hookContent("pre-push"));
  chmodSync(prePushPath, 0o755);
  console.log("✅ pre-push hook installed");

  console.log("\n✅ Git hooks installed successfully!\n");
  console.log("Hooks installed:");
  console.log("  - pre-commit: Runs tests and type checking");
  console.log("  - pre-push: Runs tests with coverage and type checking\n");
  console.log("To skip hooks, use: git commit --no-verify");
  
  process.exit(0);
} catch (error) {
  console.error("\n❌ Failed to install Git hooks");
  console.error(error);
  process.exit(1);
}
