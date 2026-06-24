---
description: End-to-end workflow for the Prototype phase of a MASTERMIND project. Iterative full-app design (v1 → v2 → ... → vN → freeze) before any MVP code gets written. Invoked when a UI-heavy project exits the Definition gate and enters Prototype via /mm-gate Prototype. Non-UI projects skip this entire workflow with --skip-reason "no UI" at the gate and go directly Definition → MVP.
triggers: ["/mm-mockup", "mockup the full app", "design the whole product", "enter prototype phase", "iterate on the mockup", "freeze the design"]
---

# Workflow 07 — Full-App Prototyping (Prototype phase)

## Purpose

Turn the Definition-phase outputs (PRD, flows, feature-map, memory/14 §Platform + tokens) into a **stakeholder-validated, frozen, navigable full-app mockup** that the MVP build starts from. The mockup is an artefact of validation, not code: it lives in `docs/design/mockups/`, iterates via Claude Design + user feedback, and ends with a freeze that consolidates canonical design decisions into `memory/14-design-system.md`.

This is a dedicated phase because iterative design takes days to weeks and merits its own space in the project lifecycle. Hiding it inside Definition (previous model) caused three pathologies:
1. "Definition" became conflated with "design complete"; gates were fuzzy.
2. Stakeholders didn't know when their feedback was most wanted.
3. MVP started on ambiguous design foundations, causing expensive rework.

Separating it fixes all three.

## Applicable projects

- **Do this workflow:** web apps, mobile apps, marketing sites, dashboards, any product where the UI is a material part of the value.
- **Skip this workflow:** pure backend services, CLIs, libraries, SDKs, internal developer tools where the primary user = the developer themselves. For these, use `/mm-gate MVP` with `--skip-reason "no UI"` at the Definition→MVP direct transition; the workflow is not run.

## Preconditions (before entering Prototype phase)

1. Project currently at `Definition` phase (check `memory/02 §Phase`).
2. `memory/14-design-system.md §Platform` set to `web` / `mobile` / `cross`.
3. `memory/14` identity + tokens sections filled (not all `_TBD_`).
4. `memory/05-user-flows.md` has main flows populated.
5. `memory/06-feature-map.md` has MVP-marked slices identified.
6. `components.json` exists (design system installed via `scripts/install-shadcn-mcp.ps1`).
7. Claude Design access (Pro/Max/Team/Enterprise plan).
8. `phase-gate-reviewer` approved the `Definition → Prototype` transition (or will approve it at Phase 1 below).

## Phases

### Phase 1 — Enter Prototype (phase-gate-reviewer)

- **Mode:** Auditor.
- **Skill:** `phase-gate-reviewer`.
- **Command:** `/mm-gate Prototype`.
- **Steps:**
  1. Run `/mm-gate Prototype`. The skill checks entry criteria (Definition complete, Platform set, UI project).
  2. On approval, `memory/02-current-state.md §Phase` updates to `Prototype`.
  3. Entry appended to `memory/13-phase-history.md`: "Definition → Prototype on YYYY-MM-DD".
- **Output:** project officially in Prototype phase.
- **Exit criterion:** phase field reads `Prototype`.

### Phase 2 — Scope and constraints

- **Mode:** Coach.
- **Input:** `memory/05`, `memory/06`, `memory/14`.
- **Steps:**
  1. Confirm with user: which MVP features are in the mockup? Default: all `status = MVP` rows from memory/06.
  2. Which flows? Default: all from memory/05.
  3. Out of scope: post-MVP backlog features stay out of v1 (can be mentioned as "planned for post-launch" but not prototyped).
  4. Fidelity target: wireframe (low-fi) or hi-fi (tokens applied)? Hi-fi recommended for stakeholder testing; wireframe fine for internal alignment.
  5. Stakeholder list: who reviews each iteration? (One person or a small group is ideal; > 5 reviewers dilutes feedback.)
- **Output:** a 1-page scope note written to `docs/design/mockups/README.md` at the top.
- **Exit criterion:** scope agreed, written down.

### Phase 3 — Create v1

- **Mode:** Coach + Executor.
- **Skill:** `mockup-factory` in `create` mode.
- **Command:** `/mm-mockup create`.
- **Steps:**
  1. Skill reads memory/14 §Platform, composes platform-tuned prompt.
  2. Skill creates `docs/design/mockups/v1-YYYY-MM-DD/` with `prompt.md`, `claude-design-url.txt`, `handoff-bundle/`, `screenshots/`, `feedback.md`.
  3. User opens `claude.ai/design`, creates project, links repo (+ ideally `DESIGN.md` via `scripts/export-design-md.ps1 -Apply` first), pastes the prompt.
  4. User iterates within Claude Design's canvas until v1 is reasonably complete.
  5. User exports handoff bundle, screenshots the key flows.
- **Output:** `v1-<date>/` fully populated.
- **Exit criterion:** v1 can be clicked through end-to-end by a third party.

### Phase 4 — Stakeholder review of v1

- **Mode:** Coach.
- **Steps:**
  1. Share with stakeholder: Claude Design project URL (view-only share), screenshots, and a short "what I want feedback on" note.
  2. For mobile prototypes: offer Expo Go preview — hand off the Claude Design bundle to Claude Code, implement quickly in a scratch Expo project, share the Expo Go QR.
  3. Collect feedback: freeform text in email / Slack / meeting notes / verbal recording.
  4. Stakeholder may approve v1 (unusual on first pass) or request changes.
- **Output:** feedback captured (raw, not yet processed).
- **Exit criterion:** stakeholder responded.

### Phase 5 — Iterate (v2, v3, ..., vN)

- **Mode:** Coach + Executor (looped).
- **Skill:** `mockup-factory` in `iterate` mode.
- **Command:** `/mm-mockup iterate --feedback "<notes>"`.
- **Steps (per iteration):**
  1. Paste feedback into skill; skill decodes into actionable change list.
  2. User approves / edits / rejects each change.
  3. Skill creates `v<N+1>-<date>/`, composes updated prompt (includes "Changes from v<N>" section).
  4. User returns to the same Claude Design project, pastes change list, iterates.
  5. Export new handoff bundle + screenshots.
  6. Return to Phase 4 (stakeholder review of v<N+1>).
- **Output:** one new `v<N+1>-<date>/` per loop.
- **Exit criterion:** stakeholder says "this is the one; let's freeze".
- **Typical iteration count:** 2–5 loops. If approaching 8+ without convergence, pause: the scope or the stakeholder alignment is off; revisit memory/05 / memory/14 / memory/00.

### Phase 6 — Freeze

- **Mode:** Auditor + Executor.
- **Skill:** `mockup-factory` in `freeze` mode.
- **Command:** `/mm-mockup freeze`.
- **Steps:**
  1. Confirm which v<N> is being frozen.
  2. Record stakeholder sign-off (source, date, form) in `v<N>-<date>/feedback.md §Final approval`.
  3. Copy v<N> contents to `docs/design/mockups/final/`.
  4. Consolidate into memory/14:
     - New tokens from the frozen design (if any differ from memory/14) → per-token user approval → write.
     - Components discovered in mockup but not yet in memory/14 §Installed components → add as "to install in MVP".
     - Custom components (non-shadcn/RNR) → add to memory/14 §Custom components with reason.
     - Patterns reused across screens → add to memory/14 §Patterns.
     - Confirmed likes / anti-patterns → append to memory/14 §What I like / §What I don't like.
     - Append changelog entry to memory/14.
  5. Write decision entry in `memory/07-decisions-log.md`.
  6. Update `docs/design/mockups/README.md`: mark v<N> as FROZEN with date.
- **Output:** `final/` exists, memory/14 consolidated, decision logged.
- **Exit criterion:** design is formally frozen; MVP can start from it.

### Phase 7 — Exit Prototype (phase-gate-reviewer)

- **Mode:** Auditor.
- **Skill:** `phase-gate-reviewer`.
- **Command:** `/mm-gate MVP`.
- **Steps:**
  1. `phase-gate-reviewer` checks Prototype exit criteria:
     - `docs/design/mockups/final/` exists.
     - `memory/14 §Changelog` has a recent "Design frozen at v<N>" entry.
     - Stakeholder approval recorded.
     - No open blockers on memory/08 that depend on design resolution.
  2. On approval, `memory/02 §Phase` updates to `MVP`.
  3. Entry appended to `memory/13`: "Prototype → MVP on YYYY-MM-DD" with the v<N> reference.
- **Output:** project officially in MVP phase.
- **Exit criterion:** phase field reads `MVP`.

### Phase 8 — Handoff to implementation-planner

- **Mode:** Executor.
- **Skill:** `implementation-planner`.
- **Command:** `/mm-plan <first MVP slice>`.
- **Steps:**
  1. Planner reads `docs/design/mockups/final/` + memory/14 (now fully consolidated) + memory/06 (MVP slices).
  2. Produces the MVP implementation plan that uses exactly the components, tokens, and layouts the stakeholder approved.
  3. No "what does this screen look like?" ambiguity; it's all in `final/`.
- **Output:** first MVP plan in `.cursor/plans/`.
- **Exit criterion:** MVP build starts on frozen design foundations.

### Phase 9 (optional) — Deploy preview for ongoing stakeholder access

- **Mode:** Executor.
- **Steps:**
  - Web: deploy the Claude Code implementation to Vercel preview URL → share with stakeholder.
  - Mobile: EAS Update on a `preview` channel → share QR for Expo Go.
  - This is optional. Useful if the stakeholder wants ongoing visibility during MVP build.

### Phase 10 — Close

- **Mode:** Executor.
- **Skill:** `memory-updater`.
- **Steps:**
  1. Append session summary to `memory/11-session-summary.md`.
  2. Flag cross-project lesson candidate: "This project's Prototype phase took N iterations over M days. For future UI-heavy projects, budget similar time or longer." Candidate for promotion to `~/.mastermind/global/` via `continuous-learner`.

## Artefacts produced

- `docs/design/mockups/` with per-iteration folders + `final/`.
- `docs/design/mockups/README.md` index.
- Updates to `memory/14-design-system.md` (tokens, components, patterns, changelog).
- Entries in `memory/07-decisions-log.md` and `memory/13-phase-history.md`.

## Exit criteria (workflow complete)

- [ ] `docs/design/mockups/final/` exists and was stakeholder-approved.
- [ ] `memory/14` is canonical (no open decisions on tokens / components / patterns).
- [ ] Project phase is `MVP`.
- [ ] `implementation-planner` has been invoked on at least the first MVP slice.

## Invocation

```
/mm-mockup create   → /mm-mockup iterate (loop) → /mm-mockup freeze → /mm-gate MVP → /mm-plan
```

## Anti-patterns

- **Skipping Phase 4 (stakeholder review).** The whole value of the phase is external validation. "I think v1 is fine" from the author alone doesn't justify freeze.
- **Creating a new Claude Design project per iteration.** Iterate within the same project; the tool's history is part of your design record.
- **Freezing with open memory/14 decisions.** If there's ambiguity about any token, pattern, or component, resolve it before freeze. Ambiguity compounds in MVP.
- **Committing the mockup's JSX/HTML/RN code to `src/`.** The mockup is a validation artefact. Production code comes from `implementation-planner` + Claude Code reading `final/` + memory/14.
- **Running this for a non-UI project.** Skip the phase with `--skip-reason "no UI"` at the gate.
- **Running this in parallel with prototype-designer.** They're complementary but sequential: mockup-factory in Prototype phase; prototype-designer during MVP / Iteration for individual features.
- **More than 8 iterations.** Signal the scope or stakeholder alignment is wrong. Pause and audit memory/05 / memory/06 / memory/14 / memory/00.
