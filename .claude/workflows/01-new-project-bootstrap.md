---
name: new-project-bootstrap
description: Take a brand-new project clone of MASTERMIND 2.0 from empty to "Discovery complete". Produces the initial brief, surfaces doubts, runs the deep audit, updates memory, and lands at the entry of Definition phase with everything in place to start a PRD.
triggers: ["new project", "bootstrap", "onboarding", "just cloned the template", "kick off project"]
estimated_duration: "60-120 minutes of focused work"
applicable_phases: [Idea, Discovery]
---

# Workflow 01 — New Project Bootstrap

## Purpose

A deterministic path from "I just cloned MASTERMIND 2.0 for a new idea" to "I have enough clarity to write a PRD". The workflow combines rule-reading, Question Protocol, and deep audit into a single ordered recipe so nothing important gets skipped in the excitement of starting.

The output is a project that has:

- Its `memory/` skeleton filled in with real data (not placeholders).
- Its `docs/product/` populated from a multi-angle audit.
- Its `memory/08-known-risks.md` with Top 10 risks.
- Its phase advanced from `Idea` to `Discovery`.

## Preconditions

- The repository is a fresh clone of MASTERMIND 2.0 (or equivalent state).
- `memory/02-current-state.md` shows phase `Idea` (or unresolved placeholder).
- The user has a rough idea in mind (a sentence or two is enough).
- Optional: `~/.mastermind/global/` exists. If so, the audit will consume it.

## Phases

### Phase 1 — Orientation (Coach mode)

- **Skill:** _(no skill; just reading)_
- **Mode:** Coach
- **Input:** the cloned repo.
- **Steps:**
  1. Read `CLAUDE.md`.
  2. Read `.cursor/rules/00-project-operating-system.mdc`, `01-karpathy-principles.mdc`, `06-execution-modes.mdc`.
  3. Skim `README.md` §Skill Interaction Graph and §Execution in System 2.
  4. If `~/.mastermind/global/` exists, read `lessons.md`, `pitfalls.md`, `patterns.md`. Note relevant items for the current idea.
- **Output:** a 2–3 sentence summary of the idea in natural language, plus "Cross-project signals" if any.
- **Exit criterion:** the agent can state the idea back in its own words and name any prior-project lessons that apply.

### Phase 2 — Rough brief (Coach mode)

- **Skill:** _(direct edit, no dedicated skill)_
- **Mode:** Coach
- **Input:** the user's description of the idea.
- **Steps:**
  1. Open `memory/00-project-brief.md`.
  2. Fill in what is known: name, type, target user, problem, value proposition. Leave the unknowns explicit as `_TBD_` rather than inventing.
  3. Commit: `docs(memory): draft initial project brief`.
- **Output:** a first-pass `memory/00-project-brief.md`.
- **Exit criterion:** every heading has content (a real answer or explicit `_TBD_`).

### Phase 3 — Surface doubts (Coach mode)

- **Skill:** `doubt-surfacer`
- **Mode:** Coach
- **Input:** the rough brief.
- **Steps:**
  1. Invoke `doubt-surfacer`.
  2. Receive 8–20 questions from the agent.
  3. Answer them, discuss trade-offs, iterate.
  4. The skill updates `memory/12-open-doubts-and-questions.md` with all Q/A.
- **Output:** `memory/12-open-doubts-and-questions.md` populated.
- **Exit criterion:** the user has responded to all "must answer before Discovery" questions; remaining items are explicitly marked as "Deferred" with a reason.

### Phase 4 — Deep audit (Coach → transition to partial Executor for file writes)

- **Skill:** `project-deep-audit`
- **Mode:** Coach (writes happen with user confirmation per section)
- **Input:** brief + doubt register + cross-project signals.
- **Steps:**
  1. Invoke `project-deep-audit`.
  2. The skill walks the 12 mandatory angles, writing findings to `docs/product/*.md`, `docs/architecture/system-map.md` (rough draft), `docs/features/feature-inventory.md` (initial), `docs/security/security-risk-map.md` (initial).
  3. The user reviews and approves each artifact.
  4. Top 10 risks land in `memory/08-known-risks.md`.
  5. The Hard Truth section of `docs/product/executive-summary.md` is read aloud and discussed.
- **Output:** complete set of Discovery artifacts.
- **Exit criterion:** `scripts/phase-gate-check.ps1 -NextPhase Discovery` reports **PASS**.

### Phase 5 — Phase transition (Auditor mode)

- **Skill:** `phase-gate-reviewer`
- **Mode:** Auditor
- **Input:** memory + docs from Phases 1–4.
- **Steps:**
  1. Invoke `phase-gate-reviewer` with target `Discovery`.
  2. Review the draft transition entry the skill proposes.
  3. Confirm or request remediation.
  4. On confirm, the skill updates `memory/13-phase-history.md` and `memory/02-current-state.md`.
- **Output:** phase officially advanced to `Discovery`.
- **Exit criterion:** `memory/02-current-state.md` Phase field now reads `Discovery`; `memory/13-phase-history.md` has the transition entry at the top.

### Phase 5.5 — Design system bootstrap (optional but strongly recommended for apps with UI)

- **Skill:** _(script `scripts/install-shadcn-mcp.ps1` / `.sh`)_ + manual fill of `memory/14-design-system.md`.
- **Mode:** Executor.
- **Input:** the just-bootstrapped project; memory/00-project-brief.md with the product personality already described.
- **Steps:**
  1. Decide: does this project ship a UI (web app, dashboard, marketing site, product)? If no (e.g. pure CLI, worker, library), SKIP this phase.
  2. Run `scripts/install-shadcn-mcp.ps1` (PowerShell) or `scripts/install-shadcn-mcp.sh` (bash). It runs `npx shadcn@latest init`, registers the shadcn MCP server in `.cursor/mcp.json` and `.mcp.json`, and installs the official `shadcn/ui` Skill.
  3. Reload Cursor / restart Claude Code. Sanity: shadcn MCP green dot in Cursor settings; `/mcp` shows `shadcn Connected` in Claude Code.
  4. Open `memory/14-design-system.md`. Fill at minimum: Project identity (name, 3-5 personality adjectives, reference products), and Tokens (primary color, display/sans fonts, radius). Empty placeholders produce generic-IA prototypes later on.
  5. In chat: *"Add button, card, input, dialog, and badge from shadcn"* — use the MCP to install a baseline so `components.json` has real entries.
- **Output:** shadcn installed, MCP active, Skill loaded, memory/14 has the project's visual identity seeded.
- **Exit criterion:** `components.json` exists; `.cursor/mcp.json` / `.mcp.json` reference shadcn; memory/14 has the identity section filled (not placeholders).

### Phase 6 — Close and handoff (memory-updater)

- **Skill:** `memory-updater`
- **Mode:** Executor (writes only)
- **Steps:**
  1. Append a session entry to `memory/11-session-summary.md` (append mode).
  2. Log the bootstrap as a decision in `memory/07-decisions-log.md`.
  3. Flag any cross-project lesson candidates.
  4. Emit the Handoff block proposing the next workflow (typically `02-feature-lifecycle` after a PRD round).
- **Output:** project ready for next workflow.
- **Exit criterion:** session summary persisted, decision logged.

## Artifacts produced

- `memory/00-project-brief.md` with real content.
- `memory/08-known-risks.md` with Top 10.
- `memory/12-open-doubts-and-questions.md` populated.
- `memory/13-phase-history.md` with the first transition (`Idea → Discovery`).
- `docs/product/executive-summary.md` (with Hard Truth).
- `docs/product/product-map.md`, `docs/product/competitive-analysis.md`, `docs/product/business-model.md`, `docs/product/personas.md`, `docs/product/scenarios-and-pivots.md`, `docs/product/top-10-actions.md`.
- `docs/architecture/system-map.md` (rough initial), `docs/features/feature-inventory.md`, `docs/flows/user-flows.md` (high-level).
- `docs/security/security-risk-map.md`.

## Exit criteria (workflow complete)

- [ ] `scripts/phase-gate-check.ps1 -NextPhase Discovery` returns PASS.
- [ ] Phase is `Discovery`, `memory/13-phase-history.md` has the transition logged.
- [ ] Hard Truth section exists and was discussed with the user.
- [ ] Every `_TBD_` left in `memory/00-project-brief.md` is either deliberate or linked to an Open question in `memory/12-*`.

## Invocation

In Cursor chat or Claude Desktop:

> *"Run the workflow `.claude/workflows/01-new-project-bootstrap.md`. My idea is: <one or two sentences>."*

Or with the slash command:

> `/mm-bootstrap <idea in one sentence>`

## Anti-patterns

- **NEVER:** Skip Phase 3 (doubt-surfacer) because "the idea is simple". All ideas have hidden assumptions; that is the point.
- **NEVER:** Fill `memory/00-project-brief.md` with invented values to make the audit look prettier. Explicit `_TBD_` beats false signal.
- **NEVER:** Advance to `Discovery` without running `phase-gate-reviewer`. The transition must be logged explicitly.
- **NEVER:** Bypass Hard Truth. Removing the uncomfortable paragraph is the #1 way to waste the whole audit.
