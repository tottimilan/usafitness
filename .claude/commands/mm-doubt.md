---
description: Force the Question & Doubt Protocol right now. Use when the agent seems to be answering too quickly, when the task is fuzzy, when decisions of weight are near, or when you want the agent to make its assumptions explicit before producing any output.
---

# /mm-doubt

Arguments: $ARGUMENTS (optional — a specific topic or decision to surface doubts about)

Execute the `doubt-surfacer` skill immediately, regardless of the surrounding context:

1. If `$ARGUMENTS` is non-empty, frame it as the topic under scrutiny.
2. Load the prerequisites from `.cursor/skills/doubt-surfacer/SKILL.md`:
   - `CLAUDE.md`
   - `memory/00-project-brief.md`
   - `memory/02-current-state.md`
   - `memory/07-decisions-log.md`
   - `memory/12-open-doubts-and-questions.md`
   - Relevant `memory/03`, `memory/05`, `memory/08` if they apply.
3. Run the full 6-step process of the skill:
   - Internal assumption pass.
   - List current doubts grouped by category (Technical / Product / Users / Business / UX / Risks / Assumptions).
   - Generate 8–20 high-quality questions grouped by the same categories. Each question: specific, consequential, with "Why it matters".
   - Present assumptions + doubts + questions **before** any deliverable.
   - Append to `memory/12-open-doubts-and-questions.md`.
   - Close with the invitation: *"Do you have any doubts, observations, or additional notes before we continue?"*

Do not produce any other output (code, plan, document) until this pass is complete and the user has responded.
