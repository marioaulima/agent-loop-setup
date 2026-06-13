#!/usr/bin/env node

import fs from "node:fs";
import { execSync } from "node:child_process";

const pkg = readJson("package.json");

if (!pkg?.scripts?.fix) {
  process.exit(0);
}

const pm = detectPackageManager();
const fixScript = pkg.scripts.fix;
const usesUltracite = /ultracite/.test(fixScript);

const command = usesUltracite
  ? `${runScript(pm, "fix")} --skip=correctness/noUnusedImports`
  : runScript(pm, "fix");

try {
  console.log(`Running post-edit formatter: ${command}`);
  execSync(command, { stdio: "inherit", shell: true });
  process.exit(0);
} catch {
  console.error(`Post-edit formatter failed: ${command}`);
  process.exit(2);
}

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function detectPackageManager() {
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("bun.lockb")) return "bun";
  return "npm";
}

function runScript(pm, scriptName) {
  if (pm === "npm") return `npm run ${scriptName}`;
  return `${pm} ${scriptName}`;
}
