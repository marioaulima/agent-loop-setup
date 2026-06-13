# Reference: setup-test-suite

Per-stack defaults and database isolation recipes. SKILL.md is the workflow; this is the lookup table. Always prefer a convention already present in the repo over a default here.

## Runner / integration defaults by stack

| Stack | Unit runner | Integration surface | Notes |
|---|---|---|---|
| Node/TS | Vitest (or repo's existing Jest) | `supertest`/`fetch` against the app handler | Don't introduce Jest if Vitest config exists, or vice versa. |
| Next.js / React | Vitest + Testing Library | `render()` a page/component; or route handler test | Reserve browser E2E for an explicit ask. |
| Python | pytest | `httpx`/`TestClient` (FastAPI), Django test client | Use `pytest` even if `unittest` exists, unless repo standardizes on `unittest`. |
| Go | `go test` | `httptest.Server` / handler invocation | Table-driven tests are idiomatic. |
| Rust | `cargo test` | integration tests under `tests/` hitting public crate API | |
| Ruby/Rails | RSpec (or Minitest if repo uses it) | request specs | Use Rails transactional fixtures for DB isolation. |
| CLI (any) | unit-test pure logic | invoke the command entrypoint, assert exit code + stdout | |
| Library | unit-test internals | exercise only the public exported API | |

When the repo already has a runner configured, **use it** — fix the config rather than swapping tools.

## Database isolation strategies

Pick one. Document creation, migration/schema application, cleanup, required env vars, and the run command. **Stop and ask before destructive actions or anything requiring credentials.**

### Framework-native test transactions (preferred when available)
Each test runs in a transaction rolled back at teardown. Rails (transactional fixtures), Django (`TestCase`), some ORMs via a wrapping transaction. Fastest, strongest isolation. Needs a real test DB to point at.

### Testcontainers
Spins up a throwaway DB container per run/suite. Highest fidelity, no shared state, works in CI. Requires Docker available. Good default when transactions aren't viable across the boundary you test.

### Disposable Docker Compose DB
A `docker-compose.test.yml` service started before the suite and torn down after. Good when the app already uses Compose locally.

### Local disposable test database
A dedicated `*_test` DB created/dropped by a script. Apply migrations with the project's migration tool before tests. Cheapest if Docker is unavailable.

### In-memory database
Only when behavior stays faithful enough (e.g. SQLite standing in for SQLite). Avoid when the app relies on engine-specific features (Postgres JSONB, extensions, specific SQL dialect) — fidelity gap causes false passes.

### Existing project convention
If the repo already has a test DB pattern (a `test` env, a seed script, a fixtures setup), follow it instead of introducing a new one.

## Env var conventions

- Use a separate `.env.test` / `TEST_DATABASE_URL` rather than overloading dev vars.
- Never read dev/staging/prod connection strings in the test path.
- Document every required var in the test docs section.

## Migration / schema application

Apply the project's own migration tool against the test DB before integration tests (e.g. `prisma migrate deploy`, `alembic upgrade head`, `rails db:schema:load`, `migrate up`). Do not hand-write schema that can drift from migrations.
