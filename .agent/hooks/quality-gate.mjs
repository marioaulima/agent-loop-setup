#!/usr/bin/env node

import fs from "node:fs";
import { execSync } from "node:child_process";

const pkg = readJson("package.json");
const scripts = pkg?.scripts ?? {};
const pm = detectPackageManager();

const failures = [];

function run(name, command) {
  console.log(`\n▶ ${name}: ${command}`);
  try {
    execSync(command, { stdio: "inherit", shell: true });
  } catch {
    failures.push(name);
  }
}

function hasScript(name) {
  return Boolean(scripts[name]);
}

function script(name) {
  return `${pm} ${pm === "npm" ? "run " : ""}${name}`;
}

const required = [];

if (hasScript("typecheck")) required.push(["typecheck", script("typecheck")]);
if (hasScript("lint")) required.push(["lint", script("lint")]);
if (hasScript("test:unit")) required.push(["test:unit", script("test:unit")]);
if (hasScript("test:integration"))
  required.push(["test:integration", script("test:integration")]);

if (!required.length && hasScript("test")) {
  required.push(["test", script("test")]);
}

for (const [name, command] of required) {
  run(name, command);
}

checkNoFocusedTests();
checkNoEnvChanges();
checkBriefingArtifact();
checkImpeccableIfFrontendChanged();

if (failures.length > 0) {
  console.error(`\nQuality gate failed: ${failures.join(", ")}`);
  process.exit(2);
}

console.log("\nQuality gate passed.");
process.exit(0);

function detectPackageManager() {
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("bun.lockb")) return "bun";
  return "npm";
}

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function changedFiles() {
  try {
    const base = execSync("git merge-base HEAD origin/HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return execSync(
      `git diff --name-only ${base}...HEAD && git diff --name-only && git diff --cached --name-only`,
      {
        encoding: "utf8",
        shell: true,
      },
    )
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  } catch {
    return execSync(
      "git diff --name-only HEAD && git diff --name-only && git diff --cached --name-only",
      {
        encoding: "utf8",
        shell: true,
      },
    )
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }
}

function checkNoFocusedTests() {
  const files = changedFiles().filter((f) =>
    /\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f),
  );

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    if (/\b(describe|it|test)\.only\b/.test(content)) {
      failures.push(`focused test in ${file}`);
    }
  }
}

function checkNoEnvChanges() {
  const bad = changedFiles().filter((f) => /(^|\/)\.env(\..*)?$/.test(f));
  if (bad.length) {
    failures.push(`protected env file changed: ${bad.join(", ")}`);
  }
}

function checkBriefingArtifact() {
  const files = changedFiles();
  const productFiles = files.filter((f) =>
    /^(app|src|pages|components|features|server|api|packages)\//.test(f),
  );

  if (!productFiles.length) return;

  const hasBriefing = files.some((f) =>
    /^docs\/pr-briefings\/.+\.html$/.test(f),
  );

  if (!hasBriefing) {
    failures.push("missing docs/pr-briefings/*.html artifact");
  }
}

function checkImpeccableIfFrontendChanged() {
  if (!fs.existsSync(".agent/state/frontend-changed")) return;

  if (hasScript("impeccable")) {
    run("impeccable", script("impeccable"));
    return;
  }

  if (hasScript("ui:check")) {
    run("ui:check", script("ui:check"));
    return;
  }

  console.warn(
    "Frontend changed, but no Impeccable/UI check script was found.",
  );
}
