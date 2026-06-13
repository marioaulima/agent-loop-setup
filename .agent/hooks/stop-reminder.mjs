#!/usr/bin/env node

import fs from "node:fs";

const frontendChanged = fs.existsSync(".agent/state/frontend-changed");

if (!frontendChanged) {
  process.exit(0);
}

const hasBriefingDir = fs.existsSync("docs/pr-briefings");

if (!hasBriefingDir) {
  console.error(
    "Reminder: frontend/UI files changed. Before opening a PR, create a PR briefing and include human QA steps.",
  );
}

process.exit(0);
