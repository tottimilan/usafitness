---
description: Full-app iterative mockup (design validation before MVP build). Wraps the mockup-factory skill. Works in 3 modes: create (v1 from scratch), iterate (v2/v3/... from stakeholder feedback), freeze (declare design-final and consolidate into memory/14). Platform-aware: web → shadcn/ui + Vercel preview; mobile → RNR + Expo Go. Used during the Prototype phase, between Definition exit and MVP entry.
---

# /mm-mockup

Arguments: $ARGUMENTS

Usage patterns:

- `/mm-mockup create [scope-hint]` — produce v1 of the full-app mockup.
- `/mm-mockup iterate --feedback "<freeform stakeholder notes>"` — produce v(N+1) from feedback.
- `/mm-mockup feedback --feedback "<notes>"` — alias for `iterate`.
- `/mm-mockup freeze` — declare the current v(N) as design-final, consolidate into memory/14, recommend /mm-gate MVP.
- `/mm-mockup status` — report the current mockup state (which version, time since last update, feedback pending, recommended next step).

## Execution

Invoke the `mockup-factory` skill at [`.cursor/skills/mockup-factory/SKILL.md`](.cursor/skills/mockup-factory/SKILL.md) with the parsed mode + arguments.

## Preconditions to verify (before running any mode)

1. `memory/14-design-system.md §Platform` is set to one of `web` / `mobile` / `cross`. If still `_TBD_`, STOP and tell the user to fill it.
2. `components.json` exists at repo root (design system installed). If not, STOP and recommend `pwsh -File scripts/install-shadcn-mcp.ps1 -Apply`.
3. `memory/02-current-state.md §Phase` reads `Prototype` or `Definition` (late Definition — entering Prototype soon). If `Idea` / `Discovery` / `MVP` / `Iteration` / `Launch`, STOP and explain that mockup-factory is for the Prototype phase specifically; recommend the correct phase transition.
4. `memory/05-user-flows.md` has flows populated (not all placeholders). If empty, STOP and recommend running `flow-analyzer` first.
5. `memory/06-feature-map.md` has at least one MVP-marked slice. If all placeholders, STOP and recommend running `feature-breakdown` first.
6. For `iterate` / `freeze` / `status`: `docs/design/mockups/` exists with at least one `v<N>-<date>/` folder. If not, tell the user to run `/mm-mockup create` first.

## After each mode

- Follow the 3-mode process in the skill (create: 7 steps; iterate: 8 steps; freeze: 8 steps; status: 3 steps).
- Honor per-file / per-decision approval patterns (same as `continuous-learner` and `prototype-designer`).
- Close each run with the `memory-updater` skill and a closing recommendation (HIGH for create + freeze, MEDIUM for iterate).
- Never bypass the Question & Doubt Protocol. If the user's feedback is ambiguous or conflicts with something in memory/14, run `/mm-doubt` inline.

## Related

- `/mm-design` → single-feature prototyping via `prototype-designer`. Different scope.
- `/mm-gate MVP` → post-freeze phase transition.
- Workflow `07-full-app-prototyping.md` → full procedure overview.
