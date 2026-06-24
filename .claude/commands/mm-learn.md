---
description: Run the continuous-learner skill to scan recent session summaries, decisions, risks, and post-mortems, and promote qualifying cross-project lessons to ~/.mastermind/global/. Applies the 3-part test (project-agnostic, evidence-backed, actionable) and asks for explicit user approval per entry before writing.
---

# /mm-learn

Arguments: $ARGUMENTS (optional — a window override like "last 30 days", "since 2026-04-01", or "since last gate")

Execute the `continuous-learner` skill:

1. Confirm `~/.mastermind/global/` exists. If not, stop and instruct the user to initialize it (see `.cursor/rules/05-claude-mcp-integration.mdc §Cross-project Memory Protocol`).
2. Set the window from `$ARGUMENTS` (default: last 7 days).
3. Follow the 9 steps of the skill:
   - Scan sessions, decisions, risks, post-mortems in the window.
   - Classify candidates by target file (lessons / patterns / pitfalls / stacks / vendors).
   - Apply the 3-part test and emit the verdict table.
   - Draft entries in the canonical format of each target file, stripping project-specific nouns.
   - Present drafts to the user **one by one**, ask for `approve` / `edit` / `skip`.
   - On approval: append to the target file + commit in the global memory repo with a structured message (`lesson:`, `pattern:`, `pitfall:`, `stack:`, `vendor:`).
   - Log a single summary entry in `memory/07-decisions-log.md`.
   - Emit closing summary.

Do not batch-approve. Each candidate gets its own moment. If the user says "approve all", offer to walk them through each one anyway so nothing sneaks in unchecked.
