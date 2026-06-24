---
event: pre-task
scope: high-complexity prompts
triggers: [design, decide, pivot, architecture, stack, roadmap, auth, payments, migrate, refactor > 5 files, "what should we build", "how should we"]
status: active
kill-switch: MM_HOOK_DOUBT_SURFACER=off
---

# Pre-task hook — Doubt Surfacer

**Purpose.** When the incoming user prompt triggers high-complexity keywords OR when the estimated task scope exceeds ~4 hours OR when the task touches a sensitive area (auth, payments, schema, production), this hook enforces running `doubt-surfacer` **before** any final output.

**This is an instruction, not a script.** Cursor (or any MASTERMIND-aware agent) reads this file at the start of each non-trivial user turn and applies the rule.

## Activation conditions (evaluate in order)

1. **Keyword match.** If the user prompt contains any of the trigger keywords at the top of this file, the hook is armed.
2. **Phase sensitivity.** If the project phase (from `memory/02-current-state.md`) is `Launch` and the action touches a production path, the hook is armed regardless of keywords.
3. **Scope heuristic.** If the task is estimated to span > 5 files or > 4 hours of work, the hook is armed.
4. **Override.** If the user message starts with `/mm-` (slash command), the command governs what runs; do not double-arm.
5. **Kill switch.** If environment variable `MM_HOOK_DOUBT_SURFACER=off` is set, skip.

## Behavior when armed

Before producing any substantive output:

1. State the hook's activation in a one-line note: *"(Doubt-Surfacer pre-task hook armed — running Question Protocol before proceeding.)"*
2. Run the `doubt-surfacer` skill in full (6 steps). Present assumptions + doubts + 8–20 questions.
3. Wait for user response or mark open in `memory/12-open-doubts-and-questions.md`.
4. **Only then** proceed to the original task.

## Behavior when NOT armed

Silent. Do not mention the hook. Proceed normally.

## Exceptions that should NOT arm the hook

- Single-file cosmetic changes (typos, comments).
- Already-approved plans being executed (the plan itself went through doubt-surfacer earlier).
- Pure Auditor-mode review of existing code.
- Explicit user declaration: *"skip doubt-surfacer for this one"*.

## Logging

When the hook arms, append a one-line note at the end of the session in `memory/11-session-summary.md` under "What was done":

> *"Doubt-surfacer pre-task hook armed on prompt: <first 50 chars…>"*

## Change control

Edits to this hook must be logged in `memory/07-decisions-log.md`. The hook is active by default in new projects; to disable globally for a project, set `MM_HOOK_DOUBT_SURFACER=off` in `.env.local`.
