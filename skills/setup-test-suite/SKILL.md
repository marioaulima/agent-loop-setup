---
name: setup-test-suite
description: Set up a repository's baseline unit and integration test suite, including package scripts, minimal passing example tests, and an isolated database strategy when the app uses a database. Use once per repo or when test tooling is missing or broken. Do not use for implementing feature coverage inside normal issues.
metadata:
  author: marioaulima
  version: '1.1.0'
---

# Set Up Test Suite

One-time setup of a repo's baseline unit + integration test infrastructure. Use when test tooling is **missing, weak, broken, or unconfigured** — NOT for feature-specific coverage during normal issue work.

## Workflow

Track these as todos. Do not skip step 1. **Do not write any code before completing steps 1–2.**

---

### 1. Inspect before changing anything

Detect, without editing: language/runtime · package manager · framework · existing test tooling · existing scripts · app entrypoints · database usage · ORM/query layer · migration tooling · env var conventions · CI/hook setup. Record findings before proceeding.

---

### 2. STOP — Ask the user before writing any code

**This step is mandatory. Do not skip. Do not assume. Do not proceed to step 3 until the user answers.**

Present findings from step 1, then ask:

**Question A — Test runner** (only if multiple options are valid for the detected stack):
> "Which test runner do you want? Options for [detected stack]: [list options, e.g. Vitest / Jest]. Default recommendation: [X] because [reason]."

**Question B — Database strategy** (only if the repo uses a DB):
> "The repo uses [ORM/DB]. Integration tests need an isolated DB. Which strategy do you want?
> - Testcontainers (spins up real Postgres container per run — requires Docker)
> - Docker Compose (dedicated test compose file — requires Docker)
> - Framework-native test transactions (rollback after each test — no container needed)
> - Branch/separate DB (e.g. a Neon branch for tests — requires credentials)
> - Skip for now (use fake env vars, only test routes that don't hit DB)"

Wait for user answers before continuing.

---

### 3. Configure unit + integration tiers

- **Unit**: fast, no I/O, no DB, no network.
- **Integration**: exercise the **highest practical public surface** (see below).

---

### 4. Implement the chosen database strategy

Apply exactly what the user chose in step 2B. For each strategy:

**Testcontainers:**
- Install `@testcontainers/postgresql` (or equivalent)
- Create a `globalSetup` file: start container, run migrations, expose `DATABASE_URL`
- Create a `globalTeardown` file: stop container
- Document: Docker required, `DATABASE_URL` injected automatically

**Docker Compose:**
- Create `docker-compose.test.yml` with isolated Postgres service
- Create `globalSetup`: `docker compose -f docker-compose.test.yml up -d`, wait for health, run migrations
- Create `globalTeardown`: `docker compose -f docker-compose.test.yml down`
- Document: Docker required, run `pnpm test:integration`

**Test transactions:**
- Wrap each test in a transaction, rollback after
- No container needed
- Document: no setup required, works against any DB URL

**Branch/separate DB:**
- Add `.env.test` to `.gitignore`
- Document: user must provide real `DATABASE_URL` in `.env.test`
- Never commit real credentials

**Skip (fake env only):**
- Set fake-but-valid env values in vitest config or setup file
- Make explicit in docs that DB-touching tests are not covered yet
- Add a TODO comment in the integration test file

---

### 5. Write one minimal passing unit test

Prove the unit runner works. Prefer testing existing pure logic. Only if none exists, add the smallest reasonable pure helper — and only if it does not distort the architecture.

---

### 6. Write one minimal passing integration test

Prove the runtime can load the app, run realistic behavior, and isolate side effects. Target the smallest meaningful boundary:

- backend/API → HTTP request against the app/server handler
- frontend → render a public component/page behavior
- CLI → invoke the command entrypoint
- library → call the public exported API
- monorepo → pick the smallest meaningful app boundary first

If the user chose a real DB strategy (step 2B), the integration test must exercise at least one DB read/write to prove the connection works.

---

### 7. Add scripts / commands

Repo must end with clear, named commands future skills cite under `### Required commands` in tracker issues. Adapt to the stack — do not assume JS/TS. JS/TS example:

```json
{ "test": "...", "test:unit": "...", "test:integration": "...", "test:watch": "..." }
```

---

### 8. Document

Add or update a short section (README or `docs/`) on how to run tests locally, including DB setup and required env vars.

---

### 9. Run and verify

Run the commands. Finish **only** when both baseline tests pass. Report the actual output.

---

## Constraints

- Do NOT add E2E infrastructure unless the user explicitly asks.
- Do NOT add CI from scratch unless the user explicitly asks.
- Coverage is not a goal — behavioral confidence is.

## Done means

Tooling configured · 1 passing unit test · 1 passing integration test · chosen DB strategy implemented (not skipped unless user said so) · scripts added · docs updated · all commands pass locally · a concise summary of what changed and which commands future agents should use.
