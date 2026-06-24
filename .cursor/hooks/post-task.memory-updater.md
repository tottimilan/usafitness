---
event: post-task
scope: non-trivial task completion
triggers: ["skill finishes", "workflow finishes", "commits created", "phase transition", "plan executed"]
status: active
kill-switch: MM_HOOK_MEMORY_UPDATER=off
---

# Post-task hook — Memory Updater

**Purpose.** After any non-trivial task completes (skill finished, workflow finished, commits created, phase transition, plan executed), ensure `memory-updater` runs so the session leaves a trace. Without this hook, memory drift accumulates.

## Activation conditions

The hook arms when **any** of these is true at the end of a turn:

1. A skill ended with a Handoff block.
2. A workflow reached its Exit criteria.
3. One or more git commits were created in this turn.
4. `memory/` files were directly edited.
5. A decision was taken that changes direction.

## Behavior when armed

1. Before the final chat response, check whether `memory-updater` has already been invoked this turn.
2. If not, invoke it now following its own process:
   - Identify scope (which memory files need updating).
   - Apply canonical formats.
   - Verify drift with code.
   - Dedicated `docs(memory): …` commit.
3. If invoking `memory-updater` reveals nothing to update (nothing actually changed), emit *"memory-updater: no-op — nothing to persist this turn."* and move on.

## Behavior when NOT armed

Silent. Many turns are read-only (questions, code review, research) and have nothing to persist.

## Exceptions — do NOT arm

- Pure Coach-mode conversations that produced no artifact and no decision.
- Read-only queries ("show me X").
- `/mm-doubt` pre-task runs — those update `memory/12-*` themselves.
- Kill switch `MM_HOOK_MEMORY_UPDATER=off` set.

## Logging

The `memory-updater` skill already logs its own runs. This hook just ensures the skill was not forgotten.

## Change control

Edits logged in `memory/07-decisions-log.md`.
