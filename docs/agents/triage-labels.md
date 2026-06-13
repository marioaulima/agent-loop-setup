# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning |
| -------------------------- | -------------------- | ------- |
| `needs-triage`             | `needs-triage`       | Needs maintainer evaluation |
| `needs-info`               | `needs-info`         | Waiting for more information or clarification |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, has ATDD plan, ready for AFK agent |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation or taste/product judgment |
| `wontfix`                  | `wontfix`            | Will not be actioned |

When a skill mentions a role, use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

# Context Labels

These labels do not replace Linear statuses. They describe constraints, risks, or workflow requirements.

| Label | Meaning |
| ----- | ------- |
| `needs-atdd` | Issue exists but still needs `atdd-plan-for-issue` before agent execution |
| `requires-briefing` | PR must include an HTML review briefing |
| `frontend` | Changes user-facing frontend code |
| `ui` | Requires UI quality review / Impeccable |
| `db-migration` | Includes schema/data migration work |
| `risky` | Higher-risk issue; agent should be conservative and stop earlier |
| `external-service` | Touches third-party APIs, webhooks, LLMs, payments, messaging, etc. |
| `auth` | Touches auth/session/permission behavior |
