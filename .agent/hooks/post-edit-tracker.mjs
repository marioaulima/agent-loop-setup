#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const input = JSON.parse(await readStdin());

const filePath =
  input?.tool_input?.file_path ??
  input?.tool_response?.filePath ??
  input?.tool_input?.path ??
  "";

if (!filePath) process.exit(0);

const stateDir = ".agent/state";
fs.mkdirSync(stateDir, { recursive: true });

const normalized = filePath.replaceAll("\\", "/");

const frontendPattern = /\.(tsx|jsx|css|scss|sass|module\.css)$/i;

const frontendPathPattern =
  /(^|\/)(app|pages|components|src\/components|features|styles|public)\//i;

if (frontendPattern.test(normalized) || frontendPathPattern.test(normalized)) {
  fs.writeFileSync(path.join(stateDir, "frontend-changed"), "true\n");
}

process.exit(0);

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data || "{}"));
  });
}
