---
description: Run a Klein-method premortem on a plan, launch, decision, or commitment. Assumes it has already failed 6 months from now and works backward to surface failure modes, the hidden assumption, and a concrete revised plan. Use for high-cost or irreversible decisions; not for exploration (use /mm-doubt) or post-hoc analysis.
---

# /mm-premortem

Arguments: $ARGUMENTS (the topic to premortem — a plan path, a launch description, a decision name, or a free-form sentence describing what is about to be committed)

Execute the `premortem` skill immediately, regardless of the surrounding context:

1. If `$ARGUMENTS` is non-empty, treat it as the topic under premortem. If empty, ask one focused question: *"What specifically are you about to commit to that you want premortemed?"*

2. Load the prerequisites from `.cursor/skills/premortem/SKILL.md`:
   - `CLAUDE.md`
   - `memory/00-project-brief.md`
   - `memory/02-current-state.md`
   - `memory/07-decisions-log.md`
   - `memory/08-known-risks.md`
   - `memory/12-open-doubts-and-questions.md`
   - The plan, document, or description named in `$ARGUMENTS`.

3. Run the full 5-step process of the skill:
   - Confirm the 3 context items (what / who / success). Ask one focused question only if a piece is missing.
   - State the premortem frame explicitly: *"It is 6 months from now. This has failed."*
   - Generate 5–7 failure reasons (cap is hard — group by theme if more emerge).
   - Dispatch one sub-agent per failure reason in **parallel** (cheap fast model per `.cursor/rules/07-subagent-orchestration.mdc §Model selection per role`).
   - Synthesize (most capable model): Most Likely Failure / Most Dangerous Failure / Hidden Assumption / Revised Plan / Pre-Launch Checklist.

4. Save the report to `docs/premortems/YYYY-MM-DD-<slug>.md`.

5. Update `memory/07-decisions-log.md`, `memory/08-known-risks.md`, and `memory/12-open-doubts-and-questions.md` per the skill's Outputs section.

6. Close with a ≤ 3-sentence chat summary (Most Likely Failure, Hidden Assumption, single most important revision).

**Anti-actions:**
- Do not auto-trigger `doubt-surfacer` mid-process. If the topic is too vague, ask one focused question and only then proceed.
- If the decision is already irreversible, stop and propose a post-mortem framework instead.
- Do not produce other output (code, plan, document) until the synthesis is delivered.
