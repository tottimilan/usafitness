# Phase History — [PROJECT NAME]

> **Append-only log of phase transitions.** Every time the project moves from one phase to another (Idea → Discovery → Definition → Prototype → MVP → Iteration → Launch), add a new entry at the top of the *Transitions* section.
>
> This file is the timeline of the project's strategic posture. Consumed by `phase-gate-reviewer` to verify entry/exit criteria and by `project-deep-audit` to understand where the project has been.
>
> **Never** delete an entry. Supersede in place when a transition was reversed (e.g. reverted from Iteration back to Definition after a pivot).

---

## Current phase

**Phase:** Idea | Discovery | Definition | Prototype | MVP | Iteration | Launch
**Since:** 2026-06-24
**Confidence:** Low | Medium | High
**Next expected phase:** _TBD_

---

## Phase definitions (canonical — do not edit per project)

> The table below is **generated** from `phase-criteria.json` (the single source of truth) by `scripts/render-phase-criteria.ps1` / `.sh`. Do not edit the rows by hand — edit `phase-criteria.json` and re-render. Entry/exit criteria for each phase also live in `phase-criteria.json` and are consumed by the `phase-gate-reviewer` skill and `scripts/phase-gate-check`.

<!-- BEGIN generated:phase-definitions (source: phase-criteria.json — do not edit by hand) -->
| Phase | Purpose | Typical artifacts produced |
|---|---|---|
| **Idea** | The thing is a sentence or a paragraph | `memory/00-project-brief.md` skeleton |
| **Discovery** | Validate problem + user + market | `docs/product/executive-summary.md`, `docs/product/personas.md`, `docs/product/competitive-analysis.md`, `memory/08-known-risks.md` |
| **Definition** | Lock the MVP scope | `docs/product/prd.md`, `docs/features/<epic>.md`, `docs/architecture/system-map.md`, first ADRs |
| **Prototype** *(UI projects only)* | Iterative full-app design before committing to MVP build. v1 → feedback → v2 → … → freeze. Validates experience with stakeholders/users on a navigable artifact. | `docs/design/mockups/v1-…/`, `v2-…/`, `final/`, updated `memory/14-design-system.md` (tokens, patterns, installed components frozen) |
| **MVP** | Build and ship the MVP | Code in `main`, `docs/flows/*.md`, `docs/testing/strategy.md`, feature-map MVP rows all `Shipped` |
| **Iteration** | Learn from users, improve | Updated `memory/08-known-risks.md` with real-world risks, pivots logged in `memory/07-decisions-log.md`, new slices shipped |
| **Launch** | Public release, scale | SLA/SLO docs, `docs/security/*` hardened, observability deployed, `docs/adr/` coverage complete |
<!-- END generated:phase-definitions -->

Transitions between phases require explicit approval via `phase-gate-reviewer`. Skipping phases is possible but must be logged as a decision.

**Prototype is the only optional canonical phase.** UI-heavy projects are strongly recommended to go through it; non-UI projects (backend-only services, CLIs, libraries, SDKs) may skip directly `Definition → MVP` with a mandatory `--skip-reason "no UI"` justification recorded in this file.

---

## Transitions

> Newest first. Each transition = one entry. Use the template below.

### 2026-06-24 - Onboarded existing project into MASTERMIND at phase Iteration
- **Decided by:** User + <Model>
- **Trigger:** Existing codebase incorporated into MASTERMIND 2.0 via scripts/onboard-existing-project.
- **Entry criteria met:**
  - [x] Code exists in the repo (phase >= Idea was already the case).
  - [x] MASTERMIND shell installed (rules, skills, workflows, commands, hooks, scripts, memory skeleton).
  - [ ] Retroactive documentation of memory/ is the next step (run retroactive-documenter skill or /mm-audit on the codebase).
- **Artifacts promoted:** none yet; onboarding installs the shell, retroactive audit populates memory/.
- **Confidence at entry:** Medium (phase picked by user during onboarding; confirm with /mm-gate after retroactive audit).
- **Expected duration in new phase:** depends on where the project actually is.
- **Success metric for this phase:** to be set once memory/00-project-brief.md is filled.
- **Link to gate review:** pending first /mm-gate run.

### Transition template

```markdown
### YYYY-MM-DD — <Previous phase> → <New phase>
- **Decided by:** User + <Model>
- **Trigger:** <what prompted the transition>
- **Entry criteria met:**
  - [x] <criterion>
  - [x] <criterion>
- **Artifacts promoted:**
  - <path> — <summary>
- **Blockers waived (if any):**
  - <blocker> — <reason approved to skip>
- **Confidence at entry:** Low | Medium | High
- **Expected duration in new phase:** <weeks>
- **Success metric for this phase:** <what will tell us the phase is done>
- **Link to gate review:** `docs/adr/XXXX-phase-gate-<slug>.md` (or in-chat transcript reference)
```

### Entries

### 2026-05-03 — Template taxonomy change: canonical phases 6 → 7 (added `Prototype`)
- **Decided by:** Template author
- **Trigger:** Recognized that iterative full-app design (v1 → v2 → … → freeze) is a first-class activity for UI-heavy projects that was previously hidden inside Definition. Making it explicit gives it a gate, trackable duration, and stakeholder-friendly signal.
- **Entry criteria met:**
  - [x] User interview confirmed: "I always iterate 2–5 times on design before starting MVP build."
  - [x] Option 1 (formal phase) chosen over Option 3 (sub-step of Definition) because iteration duration measured in days/weeks merits its own phase.
- **Artifacts promoted:**
  - `.cursor/skills/mockup-factory/SKILL.md` — new skill with 3 modes (create / iterate / freeze)
  - `.claude/commands/mm-mockup.md` — new slash command
  - `.claude/workflows/07-full-app-prototyping.md` — new workflow
  - `phase-gate-reviewer` — updated for Definition→Prototype and Prototype→MVP transitions + skip rule for non-UI projects
- **Blockers waived:** none.
- **Confidence at entry:** High.
- **Expected duration in new phase (typical project):** 1–3 weeks.
- **Success metric for this phase:** stakeholder-approved mockup + frozen tokens/components in memory/14 before MVP build starts.
- **Link to gate review:** `memory/07-decisions-log.md#2026-05-03-added-prototype-phase`

_(This entry is the taxonomy change itself. Normal per-project transitions begin below.)_

_No per-project transitions yet. The project starts at `Idea` by default when the template is cloned. The first transition (`Idea → Discovery`) is logged when the user kicks off `doubt-surfacer` + `project-deep-audit` for the first time._

---

## Reverted / superseded transitions

> Transitions that were later reversed (pivot back, scope rollback, etc.). Kept as history.

_None yet._

---

## Maintenance

- `phase-gate-reviewer` writes here when a gate is approved.
- `memory-updater` writes here when a session crosses a phase boundary, even without formal gate review.
- On a clone of the template, leave the "Current phase" as `Idea` and let the first transition populate this file.

