# Reference: open-pr-with-briefing

Detail behind `SKILL.md`. Read when writing the PR body or rendering the briefing.

## Git inspection

```bash
BASE=$(git remote show origin 2>/dev/null | sed -n 's/.*HEAD branch: //p')   # default branch
BASE=${BASE:-main}
git rev-parse --abbrev-ref HEAD            # current branch (must differ from BASE)
git log --oneline $(git merge-base HEAD "$BASE")..HEAD
git diff --stat $(git merge-base HEAD "$BASE")..HEAD
git diff $(git merge-base HEAD "$BASE")..HEAD   # read for understanding; do NOT transcribe into PR
```

The branch name carries the issue key: `agent/<issue-key>-<short-slug>`.

## PR writing principles

- **Contextualize, don't enumerate.** "Fixed the disabled-state logic" beats "changed line 47, renamed var on line 83." If you can't describe the change without listing files, you don't understand it yet — go back to the diff.
- **Anchor to behavior, not coordinates.** Describe what the code now *does* and *why*, never where lines moved. Line numbers go stale on the next push; the diff already shows the *where*.
- **Explain decisions, not just files.** If you chose approach A over B, say why in one sentence — reviewers wonder about alternatives.
- **Link, don't repeat.** Point at the briefing and the ticket; don't paste them into the PR body.
- **Testing builds confidence, not score.** Say *what behavior* you verified and *how* (manual/browser steps, edge cases). No test counts, no coverage %, no "N passing" — CI owns the numbers and they rot.
- **Short paragraphs.** 2–3 sentences per section. Walls of text don't get read.
- **No fake certainty.** Don't claim screenshots, results, or guarantees that don't exist. Don't write "various improvements" or "minor changes" when behavior actually changed.

The PR body should let a reviewer answer: what problem did this solve · what behavior changed · how should I review it · how should I manually QA it · what risks remain · what was intentionally not done.

### Teaching stance

Explain context first, make reasoning easy to follow, help the reader build a mental model, avoid raw diff dumps. **Do not** create lessons, missions, learning records, resources, or any teaching curriculum. This is a PR briefing, not a teaching workspace.

## Briefing artifact

- **Path:** `docs/pr-briefings/<issue-key-or-branch-slug>.html` (follow a better repo convention if one exists).
- **Self-contained:** no external network assets (no CDN fonts/CSS/JS). Inline CSS only, kept simple — clean and readable, not overengineered.
- **Committed** with the PR unless the user/project says otherwise.
- **Mandatory** when the issue has `requires-briefing`, `frontend`, or `ui`. Otherwise still recommended.
- Render from `templates/pr-briefing.html` by replacing the `[BRACKETED]` placeholders.

### Required sections

```txt
Title                         One-sentence summary
Issue link/key                Context (what problem existed, why it matters)
PR branch                     What changed (behavior-level)
How it works now (flow/state/data)
Implementation decisions (decision + reason)
Review guide (conceptual areas, not line numbers)
Human QA walkthrough (numbered, reproducible steps)
Automated verification (command → result, real only)
Risks
Non-goals
```

### Verification rules

Source of truth is the issue's `### Required commands`. If absent, infer from repo scripts. Common types: `test:unit`, `test:integration`, `typecheck`, `lint`, `format/check`, `impeccable detect`. Record the real outcome of each command. If a command was not run, say so and why — never invent a result.

### Screenshots

Frontend/ui issues: capture when practical and embed (e.g. base64 `data:` URI to stay self-contained) or link; if not possible, explain why and give QA steps that reproduce the UI state. Never fabricate.

## Handling existing PRs

Detect with `gh pr view --json number,url 2>/dev/null` or `gh pr list --head <branch>`. If one exists: update its body, replace the briefing artifact, keep the existing PR link on the issue, do not create a duplicate. If none: create, link to the issue, move to `PR Open`.

## Linear operations

- `mcp__claude_ai_Linear__get_issue` — load the issue and sections.
- `mcp__claude_ai_Linear__save_issue` — set status to `PR Open`; manage labels (remove `ready-for-agent`, keep context labels).
- `mcp__claude_ai_Linear__save_comment` — comment the PR URL and briefing path.
- `mcp__claude_ai_Linear__list_issue_statuses` / `list_issue_labels` — resolve status/label IDs if needed.

Context labels: `requires-briefing`, `frontend`, `ui`, `db-migration`, `risky`, `external-service`, `auth`.
