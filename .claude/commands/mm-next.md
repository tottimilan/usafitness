---
description: Show the next task to work on. Prefers task-master-ai when installed (uses next_task); falls back to walking the current plan file in .cursor/plans/. Use at the start of a work session to re-enter context fast.
---

# /mm-next

Arguments: $ARGUMENTS (optional — "details" to show full task content, "context" to show dependencies)

Determine the next task:

1. **If `task-master-ai` MCP is active** (check `.cursor/mcp.json` for `task-master-ai` entry AND `.taskmaster/tasks.json` exists):
   - Run `task-master next` (or equivalent `next_task` MCP tool).
   - Show: task ID, title, priority, dependencies satisfied, implementation notes.
   - If `$ARGUMENTS` is "details", also run `task-master show <id>` for the full task content.
2. **Otherwise** (no task-master-ai):
   - Find the most recent plan file under `.cursor/plans/` (sort by filename date).
   - Identify the first task not yet marked complete (read the plan file; tasks use `[ ]` / `[x]` checkboxes).
   - Show its name, files touched, and first step.

Context packaging:

1. Before showing the task, quickly re-load context:
   - `memory/02-current-state.md` — current phase.
   - `memory/11-session-summary.md` (latest session block) — last session's end state.
   - `memory/12-open-doubts-and-questions.md` — any open doubts relevant to this task.
2. If any doubt is still open and would block the task, surface it first and recommend `/mm-doubt` before proceeding.

Output format:

```
Current phase: <phase>
Last session ended with: <one line>

Next task: <name/id>
Source: <task-master-ai | .cursor/plans/<file>>
Dependencies: <status>
Files to touch: <paths>
First step: <text>

Blockers (if any): <list open doubts/risks that touch this task>
Recommended mode: <Executor | Coach | Auditor>
```

Do not start executing the task. This command sets up context; execution is invoked separately (`/mm-plan` for planning, `/mm-ship` for full lifecycle, or direct prompt for a specific step).
