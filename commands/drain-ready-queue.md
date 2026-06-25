---
description: Start the sequential Linear ready-for-agent drain loop.
argument-hint: [RUN_CONTEXT=local|conductor] [WORKSPACE_MODE=same-thread|per-issue] [MAX_ISSUES=<number>] [MERGE=true|false]
---

Invoke the `drain-ready-issues` skill to sequentially complete eligible Linear `ready-for-agent` issues.

If this host supports goal mode, set or continue this goal:

```txt
Use the drain-ready-issues skill to sequentially complete all eligible Linear ready-for-agent issues with arguments: RUN_CONTEXT=local WORKSPACE_MODE=same-thread MERGE=true. In Conductor, use RUN_CONTEXT=conductor WORKSPACE_MODE=per-issue, create a fresh workspace from latest origin/main after each merged PR, and continue there automatically. Stop when no eligible issue remains or a stop condition requires human input.
```

Arguments from the user: `$ARGUMENTS`

Use the explicit arguments from the user instead of the defaults in the goal text. If no arguments are provided, assume `RUN_CONTEXT=local`, `WORKSPACE_MODE=same-thread`, and `MERGE=true`.
