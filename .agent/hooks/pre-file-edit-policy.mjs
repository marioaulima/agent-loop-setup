#!/usr/bin/env node

const input = JSON.parse(await readStdin());

const filePath =
  input?.tool_input?.file_path ??
  input?.tool_input?.path ??
  input?.tool_input?.command ??
  "";

function block(reason) {
  console.error(reason);
  process.exit(2);
}

const protectedPatterns = [
  /(^|\/)\.env(\..*)?$/,
  /(^|\/)\.env$/,
  /(^|\/)\.npmrc$/,
  /(^|\/)\.pypirc$/,
  /(^|\/)\.netrc$/,
  /(^|\/)id_rsa$/,
  /(^|\/)id_ed25519$/,
  /\.(pem|key|p12|pfx)$/,
  /secrets?\//i,
];

for (const pattern of protectedPatterns) {
  if (pattern.test(filePath)) {
    block(`Blocked edit to protected/sensitive file: ${filePath}`);
  }
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
