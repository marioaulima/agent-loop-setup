---
name: setup-test-suite
description: Set up a repository's baseline unit and integration test suite, including package scripts, minimal passing example tests, and an isolated database strategy when the app uses a database. Use once per repo or when test tooling is missing or broken. Do not use for implementing feature coverage inside normal issues.
metadata:
  author: marioaulima
  version: '1.0.0'
---

# Set Up Test Suite

One-time setup of a repo's baseline unit + integration test infrastructure. Use when test tooling is **missing, weak, broken, or unconfigured** — NOT for feature-specific coverage during normal issue work.

## Workflow

Track these as todos. Do not skip step 1.

### 1. Inspect before changing anything

Detect, without editing: language/runtime · package manager · framework · existing test tooling · existing scripts · app entrypoints · database usage · ORM/query layer · migration tooling · env var conventions · CI/hook setup. Record findings before proceeding.

### 2. Decide the approach

Pick the conventional test runner for the stack. When multiple valid options exist (runner choice, DB strategy, integration boundary in a monorepo), **ask the user** rather than guessing. See [REFERENCE.md](REFERENCE.md) for per-stack defaults.

### 3. Configure unit + integration tiers

- **Unit**: fast, no I/O, no DB, no network.
- **Integration**: exercise the **highest practical public surface** (see below).

### 4. Database strategy (only if the repo uses a DB)

Tests MUST NOT point at dev, staging, or production data. Select or ask for one isolated strategy (Testcontainers · disposable Docker Compose DB · framework-native test transactions · local disposable test DB · in-memory only when faithful enough · existing project convention). **Stop and ask before anything destructive or anything needing credentials.** Document: how the test DB is created · how migrations/schema apply · how cleanup/isolation works · required env vars · the command that runs integration tests. Details in [REFERENCE.md](REFERENCE.md).

### 5. Write one minimal passing unit test

Prove the unit runner works. Prefer testing existing pure logic. Only if none exists, add the smallest reasonable pure helper — and only if it does not distort the architecture.

### 6. Write one minimal passing integration test

Prove the runtime can load the app, run realistic behavior, and isolate side effects. Target the smallest meaningful boundary:

- backend/API → HTTP request against the app/server handler
- frontend → render a public component/page behavior
- CLI → invoke the command entrypoint
- library → call the public exported API
- monorepo → pick the smallest meaningful app boundary first

### 7. Add scripts / commands

Repo must end with clear, named commands future skills cite under `### Required commands` in tracker issues. Adapt to the stack — do not assume JS/TS. JS/TS example:

```json
{ "test": "...", "test:unit": "...", "test:integration": "...", "test:watch": "..." }
```

### 8. Document

Add or update a short section (README or `docs/`) on how to run tests locally, including DB setup and required env vars.

### 9. Run and verify

Run the commands. Finish **only** when both baseline tests pass. Report the actual output.

## Constraints

- Do NOT add E2E infrastructure unless the user explicitly asks.
- Do NOT add CI from scratch unless the user explicitly asks.
- Coverage is not a goal — behavioral confidence is.

## Done means

Tooling configured · 1 passing unit test · 1 passing integration test · isolated DB strategy if DB present · scripts added · docs updated · all commands pass locally · a concise summary of what changed and which commands future agents should use.
