# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

### Type Safety & Explicitness

- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types

### Modern JavaScript/TypeScript

- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

---

## Agent skills

### Issue tracker

Issues live in Linear (team: odiniy) via the Linear MCP. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context repo — CONTEXT-MAP.md at root points to per-context CONTEXT.md files. See `docs/agents/domain.md`.

---

## Required quality gates

If the change is user-facing, the agent must also run the highest-practical smoke/e2e check:
- UI: Playwright happy path
- Backend: HTTP against running service with real test DB

Do not chase coverage percentage.
Coverage is not a goal.
Behavioral confidence is the goal.
