---
name: open-pr-with-briefing
description: Open or update a pull request for the current branch and generate a review briefing with context, implementation decisions, verification, risks, and human QA walkthrough. Use after an issue has been implemented and required checks have passed. Do not use to implement feature code.
metadata:
  author: marioaulima
  version: '1.0.0'
---

# Open PR with Briefing

This skill ships an already-implemented issue for review. It opens (or updates) the PR for the current branch and writes a self-contained HTML **review briefing** so a human reviewer understands the product context, the decisions made, the review path, and the manual QA flow — without reverse-engineering the diff.

It owns exactly one transition: `Active → PR Open`. It does **not** implement code, pick issues, merge, or mark anything `Done`.

Tracker is Linear via the Linear MCP (`mcp__claude_ai_Linear__*`), never `gh`/shell for issue operations. See `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`.

**REQUIRED BACKGROUND:** the PR body and briefing must read like a human wrote them. Borrow the lightweight teaching stance — explain context, make reasoning easy to follow, build understanding, don't dump raw diff. Do **not** create a teaching workspace (no lessons, missions, learning records, resources). See [REFERENCE.md](REFERENCE.md) for full writing principles and the briefing spec.

## When this skill runs

| | |
|---|---|
| Runs after | `execute-ready-issue` finishes implementation and checks pass |
| Expects | `Status: Active`, branch `agent/<issue-key>-<short-slug>`, clean-ish tree |
| Owns | `Active → PR Open` |
| Does not own | `Ready for Agent → Active`, `PR Open → Done` |

**Do not run** to implement features, expand scope, pick another issue, or merge.

## Commit behavior

Before opening the PR, ensure implementation changes and the briefing artifact are committed.

If changes are uncommitted:
1. Review `git status`.
2. Stage only issue-related files.
3. Commit with message: `<ISSUE-KEY>: <short behavior summary>`.
4. Do not include unrelated files.
5. If unrelated changes exist, stop and ask.

## Preflight (stop if any fails)

```txt
Current branch is not the default branch (main)
Working tree clean, or only the intended briefing artifact is uncommitted
Linked tracker issue is identified or can be inferred (branch/commits)
Implementation matches the issue's ## What to build + ## Acceptance criteria
No unrelated broad refactor present
No obvious secrets / tokens / env values in the diff
Required commands were run, or can be run now
```

If preflight fails → do not open the PR. See **Status behavior** below.

## Procedure

1. **Inspect the branch.** Detect base branch (repo default), commits and diff since merge-base. See [REFERENCE.md](REFERENCE.md) for the git commands.
2. **Identify the issue.** Infer the key from branch/commits; load it with `mcp__claude_ai_Linear__get_issue`. Read `## What to build`, `## Acceptance criteria`, `## ATDD plan`, `### Required commands`, `## Stop conditions`, labels, status.
3. **Verify required commands.** Use `### Required commands` as the source of truth (e.g. `test:unit`, `test:integration`, `typecheck`, `lint`, `format/check`, `impeccable detect`). If missing, infer from repo scripts. If a command was not run, run it now or say explicitly it was not run and why. **Never invent results.**
4. **Generate the briefing artifact.** Render `templates/pr-briefing.html` to `docs/pr-briefings/<issue-key-or-branch-slug>.html` (follow a better repo convention if one exists). Self-contained, no external network assets. Sections and rules: [REFERENCE.md](REFERENCE.md). Briefing is **mandatory** if the issue has `requires-briefing`, `frontend`, or `ui`.
5. **Screenshots (frontend/ui only).** Capture when practical and embed/link them; otherwise explain why not and give QA steps that reproduce the UI state. Never fabricate screenshots.
6. **Open or update the PR.** Body format below. If a PR already exists for the branch, update it and replace the briefing — do not duplicate. Otherwise create it and link it to the issue.
7. **Move the issue to `PR Open`.** Remove `ready-for-agent` if present; keep context labels for history; comment with the PR URL and briefing path.

## PR body format

```md
## Summary
[Concise behavior-level summary.]

## Why
[Why this change exists and what user/product problem it solves.]

## Review briefing
[Link to the HTML briefing artifact.]

## Human QA walkthrough
1. [Step]
2. [Step]

## Verification
- [command] — passed

## Risks and non-goals
- [Risk or caveat]
- [Explicit non-goal]
```

Keep it concise — detail lives in the briefing. Contextualize, don't enumerate; no file lists, no line-number review guides, no "various improvements", no fake certainty. Full principles: [REFERENCE.md](REFERENCE.md).

## Status behavior

| Outcome | Action |
|---|---|
| Success | `PR Open`; remove `ready-for-agent`; keep context labels; comment PR URL + briefing path |
| Not ready (missing checks/scope) | Stay/return to `Active`; explain what's missing; do not open PR |
| Blocked (ambiguity/risk/access) | Move to `Needs Human`; explain blocker; do not open PR unless explicitly useful |

## Must not

implement feature code · rewrite product logic · pick another issue · expand scope · merge · mark `Done` · fabricate test results or screenshots · include secrets/tokens/env values · dump file lists or line-by-line diffs into the PR body · use line numbers as the review guide · create a teaching workspace.

## Output — success

```txt
PR opened/updated: <PR URL>
Issue moved to: PR Open
Briefing artifact: docs/pr-briefings/<file>.html

Verification:
- <command>: passed

Human QA:
- <short summary>
```

## Output — blocked

```txt
PR not opened.

Reason:
- <specific blocker>

Issue status:
- <Active or Needs Human>

Needed:
- <specific action needed>
```

## Loop position

```txt
Backlog → Planning → Ready for Agent → Active → [THIS SKILL] → PR Open → Done
```

Runs after `execute-ready-issue`. Owns `Active → PR Open` only.
