---
description: Run the project-deep-audit skill with full context loading. Use when you want a fresh multi-angle audit of the current project, whether at the start, mid-course, or before entering a new phase.
---

# /mm-audit

Arguments: $ARGUMENTS (optional — a specific angle to emphasize, e.g. "risks", "pivots", "competitive")

Execute `project-deep-audit` with maximum awareness:

1. Load the prerequisites listed in `.cursor/skills/project-deep-audit/SKILL.md`.
2. If `~/.mastermind/global/` exists, also read `lessons.md`, `pitfalls.md`, `patterns.md` and surface relevant items as "Cross-project signals" before Step 1 of the skill.
3. If `$ARGUMENTS` is non-empty, treat it as a focus instruction: emphasize that angle but still walk all 12 mandatory angles (explicit note if an angle genuinely does not apply).
4. Produce the full set of artifacts listed in the skill's Outputs section.
5. The Hard Truth section is non-negotiable. Deliver it without softening.
6. Close by invoking `memory-updater` and emitting the standard Handoff block.

Prerequisite: run `doubt-surfacer` first if the project's answers to "target user, monetization, non-negotiables, success metric" are not already captured in `memory/00-project-brief.md`. The skill will complain if the ground is too unstable.
