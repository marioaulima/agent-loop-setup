# Issue tracker: Linear

Issues live in Linear, team `odiniy`. Use Linear MCP tools (`mcp__claude_ai_Linear__*`).
Do NOT use `gh` or shell commands for issue operations.

## Conventions

- **Create**: `mcp__claude_ai_Linear__save_issue` — resolve teamId via `mcp__claude_ai_Linear__get_team` for `odiniy`
- **Read**: `mcp__claude_ai_Linear__get_issue` with issue ID (e.g. `ODI-123`)
- **List**: `mcp__claude_ai_Linear__list_issues` with appropriate filters
- **Comment**: `mcp__claude_ai_Linear__save_comment` with `issueId` + `body`
- **Apply labels**: `mcp__claude_ai_Linear__save_issue` with `labelIds` — resolve label IDs via `mcp__claude_ai_Linear__list_issue_labels`
- **Close**: `mcp__claude_ai_Linear__save_issue` with terminal `stateId` — resolve via `mcp__claude_ai_Linear__get_issue_status`

## When a skill says "publish to the issue tracker"

Call `mcp__claude_ai_Linear__save_issue`. Resolve teamId first via `mcp__claude_ai_Linear__get_team` for `odiniy` if not already cached.

## When a skill says "fetch the relevant ticket"

Call `mcp__claude_ai_Linear__get_issue` with the issue identifier, or `mcp__claude_ai_Linear__list_issues` to search by title or label.
