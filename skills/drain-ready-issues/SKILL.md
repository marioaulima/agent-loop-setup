---
name: drain-ready-issues
description: Sequentially drain Linear Ready for Agent issues end-to-end by composing take-next-issue, execute-ready-issue, PR merge, workspace/thread rollover, and the next issue handoff. Use when the user wants autonomous backlog draining, issue-by-issue execution, Conductor workspace-per-issue execution, or a goal that keeps working until no eligible ready-for-agent issues remain.
metadata:
  author: marioaulima
  version: '1.0.0'
---

# Drain Ready Issues

## Quick start

```txt
/goal Use drain-ready-issues with RUN_CONTEXT=local WORKSPACE_MODE=same-thread MERGE=true to sequentially complete all eligible Linear ready-for-agent issues. Stop when no eligible issue remains or a stop condition requires human input.
```

This skill is the **outer orchestrator**. It does not implement features directly. It repeatedly delegates exactly one issue to `take-next-issue` and `execute-ready-issue`, then owns the post-PR merge, Linear `Done` transition, workspace/thread rollover, and next-issue continuation.

## Scope

- Work sequentially: one issue, one branch, one PR, one merge at a time.
- Respect optional arguments: `RUN_CONTEXT=local|conductor`, `WORKSPACE_MODE=same-thread|per-issue`, `MAX_ISSUES=<number>`, and `MERGE=true|false`.
- Use Linear as the source of truth for issue selection and status.
- Use GitHub/PR tooling as the source of truth for PR state, checks, reviews, and mergeability.
- Prefer a fresh thread or workspace per issue when the host supports it; in Conductor, create a new workspace per issue instead of reusing the merged workspace.
- Never pick `ready-for-human`, `needs-atdd`, `needs-info`, `wontfix`, blocked, already-claimed, or already-open-PR issues.

## Loop

1. Confirm the local tree is clean before selecting work. If dirty, stop and report the files.
2. Run `take-next-issue`.
3. If no eligible issue exists, finish successfully and report that the queue is drained.
4. If an issue was claimed, continue with the claimed issue instead of asking the user to paste the handoff.
5. Run `execute-ready-issue` for the claimed issue and follow its ATDD plan, required commands, and stop conditions exactly.
6. If execution moves the issue to `Needs Human`, stop the drain loop and report the blocker.
7. If execution opens or updates a PR and moves the issue to `PR Open`, identify the PR URL/number and verify its checks.
8. Wait for required checks to finish. Poll at reasonable intervals; do not busy-loop.
9. Merge only when all required checks are green, the PR is mergeable, and there are no blocking reviews or unresolved merge conflicts.
10. After a successful merge, move the Linear issue to `Done` and add a comment with the merged PR URL and merge commit/SHA when available.
11. If `RUN_CONTEXT=conductor` or the host is clearly Conductor, archive/finish the merged issue workspace, create a new workspace from the latest `origin/main`, send it the same drain goal/command, and continue there. Do not ask the user to create the workspace.
12. If running in a normal local checkout, return to the default branch and refresh it:

```bash
git checkout main
git pull origin main
```

13. If not running in Conductor and thread creation is available, start the next issue in a fresh thread. If no fresh-thread control exists, continue in the current thread only after a short checkpoint that records the merged issue key, PR URL, and current `main` SHA.
14. Repeat from step 1.

## Conductor workspace mode

When running inside Conductor:

- Treat one workspace as one issue/branch/PR lifecycle.
- After merge, do not keep draining inside the completed workspace.
- Create the next workspace directly from the repository's configured base branch/latest `origin/main`.
- Start the new workspace with the same agent harness selected for the current run, whether Claude or Codex.
- Send the new workspace this instruction: `Use drain-ready-issues to continue draining eligible Linear ready-for-agent issues.`
- Stop only if Conductor workspace creation is unavailable to the agent; report that the required workspace-control capability is missing. Do not ask the user to create the workspace manually.

## Stop conditions

Stop immediately and do not claim more work if:

- There is no eligible `ready-for-agent` issue.
- The working tree is dirty with unrelated changes.
- `take-next-issue` cannot safely claim an issue.
- `execute-ready-issue` hits any issue stop condition.
- Required checks fail or cannot be run.
- CI fails, times out repeatedly, or requires unavailable credentials.
- The PR has blocking reviews, unresolved conflicts, branch protection that prevents merge, or manual approval requirements.
- Merge succeeds but `main` cannot be checked out or pulled cleanly.
- Running in Conductor requires a new workspace but workspace creation is unavailable to the agent.
- Linear or GitHub tooling is unavailable.

## Output

```txt
Ready-for-agent queue drained.

Completed:
- <ISSUE-KEY> -> <PR URL> -> merged

Stopped because:
- No eligible ready-for-agent issues remain.
```

```txt
Drain stopped.

Last issue:
- <ISSUE-KEY or none>

Reason:
- <specific stop condition>

Needed from human:
- <specific action>
```
