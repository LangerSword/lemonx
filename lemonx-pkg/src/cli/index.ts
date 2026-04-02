#!/usr/bin/env node
import { init } from "./commands/init.js";

const command = process.argv[2];

switch (command) {
  case "init":
    await init();
    break;
  default:
    console.log(`
🍋 lemonx — AI-powered test generation, execution, and self-healing fixes

Usage:
  npx lemonx init [dir]    Generate CircleCI config for your repo

Run \`npx lemonx init\` in your target repo to set up CircleCI integration.
`);
    break;
}
