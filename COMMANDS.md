# COMMANDS.md — Quick reference for `/mm-*`

> **What this is.** A fast, operational reference for the **17 slash commands** in this project. Designed to stay open and answer the question *"which command do I run now?"* in 5 seconds.
>
> **What this is NOT.** This is not the deep system documentation — for that, open [`OPERATING-GUIDE.md`](OPERATING-GUIDE.md). This is not the skill catalog — those live in `.cursor/skills/` and `.claude/skills/`.

---

## How to invoke the commands

### In Claude Code (native)

```text
/mm-bootstrap                    (no arguments)
/mm-ship auth-mvp                (with argument)
/mm-gate Discovery               (with argument)
```

### In Cursor (by reference)

Cursor does not yet execute `/mm-*` natively the same way Claude Code does. Invoke them by reference instead:

> *"Run the command `.claude/commands/mm-ship.md` with argument `auth-mvp`."*

The agent reads the file and follows the script. Same end result.

---

## Summary table (all 17 at a glance)

| Command                                            | What it does                                               | When to use                                                      | Typical argument                |
| -------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| [`/mm-bootstrap`](.claude/commands/mm-bootstrap.md) | Empty clone → Discovery phase complete                     | First day of a brand-new project                                 | One-sentence idea               |
| [`/mm-doubt`](.claude/commands/mm-doubt.md)         | Force the Question & Doubt Protocol                        | Agent moving too fast; heavy decision imminent; you feel unsure  | Specific topic (optional)       |
| [`/mm-audit`](.claude/commands/mm-audit.md)         | 12-angle deep audit                                        | Onboarding, resuming after a pause, before a big phase change    | Angle to emphasize (optional)   |
| [`/mm-plan`](.claude/commands/mm-plan.md)           | Bite-sized TDD plan for one slice                          | Any feature/change touching > 1 file                             | Slice slug or description       |
| [`/mm-ship`](.claude/commands/mm-ship.md)           | Full epic: breakdown → review → merge                       | An approved epic is ready to build                               | Epic slug                       |
| [`/mm-bug`](.claude/commands/mm-bug.md)             | Bug → reproduce → surgical fix → regression test            | Any bug, failing test, incident                                  | Description / ID / link         |
| [`/mm-next`](.claude/commands/mm-next.md)           | Tells you the next task to work on                         | Start of a session, to re-enter context fast                     | "details" or empty              |
| [`/mm-review`](.claude/commands/mm-review.md)       | Code review (+ security when applicable) of the branch     | Before merging, after any large slice                            | Branch / PR (optional)          |
| [`/mm-gate`](.claude/commands/mm-gate.md)           | Phase advance with hard verification                       | End of a phase (Idea/Discovery/Definition/MVP/Iteration/Launch)  | Target phase                    |
| [`/mm-retro`](.claude/commands/mm-retro.md)         | 20–40 min weekly retrospective                             | Once a week during MVP/Iteration/Launch                          | Period (optional)               |
| [`/mm-learn`](.claude/commands/mm-learn.md)         | Promote lessons to the cross-project global memory         | End of phase, notable post-mortem, weekly retro                  | Time window (optional)          |
| [`/mm-onboard`](.claude/commands/mm-onboard.md)     | Integrate an existing project (not born from MASTERMIND) into the system | After `scripts/onboard-existing-project` installs the shell      | Hints like `audit-focus:monetization` (optional) |
| [`/mm-design`](.claude/commands/mm-design.md)       | Prototype a SINGLE feature via Claude Design (during MVP / Iteration)    | Between `product-requirements`/`flow-analyzer` and `implementation-planner` | Feature + optional `fidelity:wireframe\|hi-fi`, `audience:stakeholder\|user-test\|handoff` |
| [`/mm-mockup`](.claude/commands/mm-mockup.md)       | FULL-APP iterative mockup (v1 → vN → freeze), Prototype phase            | After Definition exit, before MVP entry                          | Mode: `create` \| `iterate --feedback "..."` \| `freeze` \| `status` |
| [`/mm-premortem`](.claude/commands/mm-premortem.md) | Klein/Kahneman premortem: "this already failed — narrate why"           | Before high-cost / irreversible decisions (launch, pricing, vendor lock-in, pivot, destructive migration) | Decision / plan to stress-test |
| [`/mm-template-audit`](.claude/commands/mm-template-audit.md) | Meta-audit: template counts/criteria/mirror/visibility match reality | Before a release, in CI, after adding/removing a component, during `/mm-retro` | `deep` (optional) |
| [`/mm-qa`](.claude/commands/mm-qa.md) | Holistic system QA: size, overlap, cruft, gaps, harness re-audit (composes template-audit + skill lint) | Before a release, periodically / in `/mm-retro`, "is the system healthy & right-sized?" | `deep` (optional) |

> **Pattern:** all share the `mm-` prefix (MASTERMIND) to group them visually and avoid clashes with Claude's native commands.

---

## Each command explained

### 1. `/mm-bootstrap` — Start a project from scratch

- **Wraps:** workflow [`01-new-project-bootstrap`](.claude/workflows/01-new-project-bootstrap.md).
- **When:** you have just cloned the MASTERMIND template for a new idea and want to go from empty repo to Discovery-phase-complete in a single guided flow.
- **Do NOT use if:** `memory/00-project-brief.md` already has real content; jump directly to `/mm-audit` or `/mm-doubt`.
- **Duration:** 60–120 minutes.
- **Produces:** brief, doubts log, full 12-angle audit, transition to Discovery, first commit.
- **Argument:** one sentence describing the idea (optional; if missing, the agent asks).

### 2. `/mm-doubt` — Force the Question & Doubt Protocol

- **Wraps:** skill [`doubt-surfacer`](.claude/skills/doubt-surfacer/SKILL.md).
- **When:** you sense the agent is about to produce something without thinking it through; a heavy decision is ahead; the last output felt suspiciously fluid; you are entering a new phase.
- **Does:** lists all technical / product / UX / risk doubts and generates 8–20 high-quality questions grouped by category. Blocks any other output until you respond.
- **Project golden rule:** *Doubts and questions first → Clarity → Documents and code after.* Skipping this rule means the agent has failed the protocol.
- **Argument:** a specific topic (optional). Without one, the skill sweeps the whole current context.

### 3. `/mm-audit` — Deep multi-angle audit

- **Wraps:** skill [`project-deep-audit`](.claude/skills/project-deep-audit/SKILL.md).
- **When:** onboarding to an existing repo; returning to the project after a long pause; you want to "tear apart" the project before a big decision; you are about to change phase and need maximum awareness.
- **Does:** examines the project from 12 explicit angles (first-principles, JTBD, Porter, Blue Ocean, risks, scenarios, pivots, metrics, competitors, UX, business model, technical dependencies) and delivers executive summary, top 10 risks, top 10 actions, and a final **Hard Truth** paragraph without softening.
- **Recommended prerequisite:** run `/mm-doubt` first if target user, monetization, non-negotiables, and success metric are not yet clear.
- **Argument:** angle to emphasize (optional, e.g. "risks", "competitive", "pivots").

### 4. `/mm-plan` — Detailed TDD plan for a slice

- **Wraps:** skill [`implementation-planner`](.claude/skills/implementation-planner/SKILL.md).
- **When:** you are about to touch more than one or two files; the work touches sensitive areas (auth, payments, schema); you want a reviewable plan before coding.
- **Do NOT use if:** it is a trivial one-liner with obvious success criteria. Go direct.
- **Does:** scope + success criteria, file map, bite-sized tasks with red-green-commit TDD rhythm, self-review, handoff with 5 execution options (A–E). Saves to `.cursor/plans/YYYY-MM-DD-<slug>.md`.
- **Argument:** slice slug (e.g. `slice-3-auth-mvp`) or a free-form description.
- **Ends by asking:** *"Which option do we execute: A, B, C, D, or E?"*

### 5. `/mm-ship` — Complete pipeline for an epic

- **Wraps:** workflow [`02-feature-lifecycle`](.claude/workflows/02-feature-lifecycle.md).
- **When:** an epic is approved (`docs/features/<epic>.md` exists) and you are in MVP or Iteration phase. You want to go from epic → merged with tests and review.
- **Do NOT use if:** you are still in Definition (no approved PRD) or the epic is not scoped (run `/mm-plan` per epic first).
- **Does:** breakdown → planner per slice → approval-gatekeeper when touching sensitive areas → execution (subagent-dispatcher by default, parallel-executor when slices are independent) → code-reviewer → security-review when applicable → merge → memory-updater.
- **Argument:** epic slug (e.g. `auth-mvp`, `billing-v1`).

### 6. `/mm-bug` — Bug triage with a surgical fix

- **Wraps:** workflow [`03-bug-triage`](.claude/workflows/03-bug-triage.md).
- **When:** a bug report arrives, a test breaks, a production incident happens, you see unexpected behavior.
- **Hard rule:** **no fix is proposed without reproducing the bug** (locally or via a failing automated test). If Phase 2 cannot reproduce, the bug is logged as "Unreproducible" in `memory/08-known-risks.md` with an evidence-gathering plan and stops.
- **Does:** intake + severity classification → reproduce → isolate → root-cause diagnosis → surgical fix with regression test → review → merge → post-mortem at `docs/bugs/YYYY-MM-DD-<slug>.md` → optional `/mm-learn`.
- **Argument:** bug description, ticket ID, failing test name, or link.
- **Escalation:** if investigation exceeds 1 day without a root cause, the "bug" is probably something bigger (architectural audit).

### 7. `/mm-next` — What do I do now?

- **Wraps:** `task-master-ai` when installed, or reading the latest plan in `.cursor/plans/`.
- **When:** you open a new session and need to re-enter context quickly without re-reading all of `memory/`.
- **Does:** shows current phase, how the last session ended, next pending task, files to touch, first step, blockers (open doubts affecting this task), and recommended mode (Coach / Executor / Auditor).
- **It does NOT execute anything.** It only prepares context. To execute, follow up with `/mm-plan` or `/mm-ship` or a direct prompt.
- **Argument:** `details` to show the full task, `context` to show dependencies.

### 8. `/mm-review` — Code and security review

- **Wraps:** skills [`code-reviewer`](.claude/skills/code-reviewer/SKILL.md) + [`security-review`](.claude/skills/security-review/SKILL.md) when touching trust boundaries.
- **When:** before merging to `main`; after a large slice; when someone hands you a PR to review.
- **Does:** walks 11 categories (plan compliance, scope, correctness, tests, architecture fit, quality, performance, readability, simplicity, docs, git hygiene). Categorizes findings as Critical / Important / Suggestion. Acknowledges 2–3 specific strengths. Issues a verdict: **Ready to merge** / **Ready with fixes** / **Not ready**.
- **Triggers security-review in parallel** when the diff touches: `auth/`, `session/`, `token/`, `permissions/`, `rbac/`, `rls/`, payments, webhooks, migrations/backfills/deletes, public APIs, third-party integrations, file uploads, cryptographic code.
- **It does NOT fix anything inline.** It finds; the author (or a subsequent `/mm-plan`) fixes.
- **Argument:** branch, PR number, or file range. Without argument: current branch vs `origin/main`.

### 9. `/mm-gate` — Phase transition

- **Wraps:** workflow [`04-phase-gate-transition`](.claude/workflows/04-phase-gate-transition.md).
- **When:** you believe you have completed the exit criteria of the current phase (Idea / Discovery / Definition / MVP / Iteration) and want to advance to the next.
- **Does:** dry-run with `scripts/phase-gate-check.ps1` → reports PASS/GAPS/BLOCK → remediation if gaps exist → invokes `phase-gate-reviewer` → presents the transition entry to the user → waits for `approve`/`adjust`/`block` → writes to `memory/13-phase-history.md`, `memory/02-current-state.md`, and `memory/07-decisions-log.md` → hands off to the next natural workflow.
- **Hard rule:** **never advance a phase by editing `memory/02-current-state.md` by hand**. The workflow runs end-to-end, always.
- **Argument (required):** one of `Discovery`, `Definition`, `MVP`, `Iteration`, `Launch`.

### 10. `/mm-retro` — Weekly retrospective

- **Wraps:** workflow [`05-weekly-retrospective`](.claude/workflows/05-weekly-retrospective.md).
- **When:** once a week in MVP, Iteration, or Launch phases. Keeps memory alive and catches drift between code and documentation.
- **Does:** week in review (sessions, decisions, commits) → risk posture → drift check (skills sync, phase-gate, feature-map vs PRs, architecture vs code) → flaky tests and stuck PRs → lesson promotion → **Top 3 priorities for next week** (not 5, not 7, **three**).
- **Discipline:** 20–40 minutes. If it runs longer, the project is doing too many things at once.
- **Argument:** `period:<YYYY-MM-DD..YYYY-MM-DD>` (optional; default = last 7 days).

### 11. `/mm-mockup` — Full-app iterative mockup during Prototype phase

- **Wraps:** skill [`mockup-factory`](.cursor/skills/mockup-factory/SKILL.md) + workflow [`07-full-app-prototyping`](.claude/workflows/07-full-app-prototyping.md).
- **When:** in the dedicated Prototype phase (after Definition exit, before MVP). UI-heavy projects only; non-UI projects skip Prototype at the phase gate with `--skip-reason "no UI"`.
- **Prerequisites:** `memory/14 §Platform` set; `memory/14` identity + tokens filled; `memory/05-user-flows` populated; `memory/06-feature-map` has MVP slices; design system installed via `scripts/install-shadcn-mcp.ps1`; project phase is `Prototype` (run `/mm-gate Prototype` first if still in Definition).
- **Modes:** `create` (v1), `iterate --feedback "..."` (v2 / v3 / ... from stakeholder notes), `freeze` (declare final, consolidate memory/14, recommend `/mm-gate MVP`), `status` (report current state).
- **Output per iteration:** `docs/design/mockups/v<N>-<date>/` with prompt, Claude Design URL, handoff bundle, screenshots, feedback. On freeze: `docs/design/mockups/final/` + consolidated memory/14 + decision entry in memory/07.
- **Platform-aware:** web prompt uses shadcn/ui + Tailwind + browser preview; mobile prompt uses RNR + NativeWind + Expo + Expo Go on-device preview.
- **Different from `/mm-design`:** mm-design = single feature during build; mm-mockup = entire product before build.

### 12. `/mm-design` — Prototype a feature via Claude Design + shadcn

- **Wraps:** skill [`prototype-designer`](.cursor/skills/prototype-designer/SKILL.md).
- **When:** between spec (`product-requirements` / `flow-analyzer`) and implementation (`implementation-planner`). Especially for UI-heavy features; skip for pure backend / data pipelines.
- **Prerequisites:** design system installed via `scripts/install-shadcn-mcp.ps1` (platform-aware — works for Next.js web OR Expo mobile). `components.json` must exist. `memory/14-design-system.md §Platform` must be set (`web` / `mobile` / `cross`) — drives everything else.
- **Platform-aware:** reads `memory/14 §Platform` and branches. Web prompt to Claude Design emphasizes shadcn/ui + Tailwind + responsive browser patterns. Mobile prompt emphasizes React Native + NativeWind + Expo Router + tab bar at bottom + safe-area + touch targets ≥ 44pt iOS / 48dp Android — and includes Expo Go on-device preview in the workflow.
- **Does:** reads `memory/05-user-flows`, `memory/06-feature-map`, `memory/14-design-system`. Composes a platform-tuned prompt. Guides you to open `claude.ai/design`, link the repo, iterate. Captures the handoff bundle under `docs/design/prototypes/<feature>/`. Extracts decisions back into memory/14 with per-entry approval. Closes with a HIGH recommendation pointing to `/mm-plan`.
- **Arguments:** feature name (or picks from `memory/06-feature-map.md`). Optional hints: `fidelity:wireframe|hi-fi`, `audience:stakeholder|user-test|handoff`, `skip-memory-update` (not recommended).

### 13. `/mm-onboard` — Bring an existing project into MASTERMIND

- **Wraps:** workflow [`06-onboard-existing-project`](.claude/workflows/06-onboard-existing-project.md) + skill [`retroactive-documenter`](.claude/skills/retroactive-documenter/SKILL.md).
- **When:** you have a project that was NOT born from this template (may have code, commits, README, maybe prior `.cursor/rules/`) and you want to bring it into the MASTERMIND system.
- **Prerequisite:** run `scripts/onboard-existing-project.ps1` (or `.sh`) first from the terminal. That installs the MASTERMIND shell. Only then invoke `/mm-onboard` in chat — it orchestrates the in-IDE phases 5–8 of the workflow.
- **Does:** retroactively seeds `memory/` from the codebase (code + git log + README + lockfiles + tests) with `retroactive-documenter`, then strategic audit via `/mm-audit`, then phase confirmation via `/mm-gate`, then optional first `/mm-retro`.
- **Per-file approval:** every draft entry written to `memory/` is approved one at a time (approve/edit/skip). No auto-write.
- **Flags what it cannot infer:** strategy, personas, monetization — those come from the audit, not from the code.
- **Argument:** optional hints like `audit-focus:monetization` or `skip-retro`.

### 14. `/mm-learn` — Promote lessons to global memory

- **Wraps:** skill [`continuous-learner`](.claude/skills/continuous-learner/SKILL.md).
- **When:** end of a phase, weekly retro, after a post-mortem worth generalizing.
- **Does:** scans `memory/11-session-summary.md`, `memory/07-decisions-log.md`, `memory/08-known-risks.md`, and `docs/bugs/` within the requested window → classifies candidates by target file (`lessons.md` / `patterns.md` / `pitfalls.md` / `stacks.md` / `vendors.md`) → applies the **3-part test** (project-agnostic + evidence-backed + actionable) → presents each candidate one by one for `approve`/`edit`/`skip` → writes to `~/.mastermind/global/` with commits of the form `lesson:`, `pattern:`, `pitfall:`, `stack:`, `vendor:`.
- **Privacy:** strips client names, domain specifics, tokens. Nothing sensitive ever reaches global memory.
- **Prerequisite:** `~/.mastermind/global/` must exist (see `.cursor/rules/05-claude-mcp-integration.mdc §Cross-project Memory Protocol`). Bootstrap it with `scripts/init-global-memory.ps1` (or `.sh`).
- **Argument:** time window (optional, e.g. `last 30 days`, `since 2026-04-01`, `since last gate`).

### 15. `/mm-premortem` — Stress-test a high-cost decision before committing

- **Wraps:** skill [`premortem`](.claude/skills/premortem/SKILL.md).
- **When:** before a high-cost or irreversible decision — public launch, pricing change already communicated, vendor lock-in, partnership, pivot, destructive data migration, strategic hire. Also wired into `02-feature-lifecycle` (Phase 3.5) and `04-phase-gate-transition` (Definition→MVP, MVP→Launch).
- **Does:** imposes the prospective-hindsight frame ("it's 6 months later and this failed — narrate why"), fans out 5–7 parallel sub-agents (one per failure reason), and synthesizes **Most Likely Failure / Most Dangerous Failure / Hidden Assumption / Revised Plan / Pre-Launch Checklist** into `docs/premortems/<date>-<slug>.md`. Updates `memory/07`, `memory/08`, `memory/12`.
- **Different from `/mm-doubt`:** doubt-surfacer asks "what don't we know?"; premortem assumes failure already happened and reverse-engineers the cause (~30% better at surfacing failure modes per Klein/Kahneman).
- **Do NOT use for:** exploratory brainstorming (use `/mm-doubt`) or decisions that are already irreversible.
- **Argument:** the decision or plan to stress-test.

### 16. `/mm-template-audit` — Keep the template honest about itself

- **Wraps:** `scripts/template-audit.ps1` / `.sh` (no skill; it is template-maintenance tooling).
- **When:** before a release / version bump, in CI, after adding or removing any rule / skill / workflow / command / memory file, and as part of `/mm-retro`.
- **Does:** generates a component manifest (real counts) and checks four things — (1) declared counts in `OPERATING-GUIDE §15` match reality, (2) `memory/13 §Phase definitions` is in sync with `phase-criteria.json`, (3) `.cursor/skills` ↔ `.claude/skills` mirror parity, (4) every command/skill is documented (no invisible capabilities). Exits non-zero on any Critical finding.
- **Fix paths it points to:** `scripts/sync-skills` (mirror), `scripts/render-phase-criteria` (criteria), or a doc edit (counts/visibility).
- **It does NOT auto-fix.** It reports; you (or a follow-up edit) fix.
- **Argument:** `deep` to also compare every `SKILL.md` byte-for-byte against its mirror.

### 17. `/mm-qa` — Holistic system health check (right-size, no cruft, no gaps)

- **Wraps:** composition (no new logic) of `scripts/template-audit` + `skill-quality-evaluator` (`eval --all`) + a light overlap/placeholder/always-on-budget sweep + the harness re-audit reflection.
- **When:** before a release/version bump, periodically (monthly or inside `/mm-retro`), after adding/removing any component, or when you ask "is MASTERMIND still healthy, the right size, and free of morraña?".
- **Does:** runs the structural meta-audit; lints every skill for size/triggers; flags >60% overlaps (e.g. `mockup-factory`↔`prototype-designer`), empty placeholder dirs, and always-on context growth; then applies the "does the current base model already do this?" prune lens — never touching safety, the Question & Doubt Protocol, or evaluators.
- **Different from `/mm-template-audit`:** template-audit is the machine gate (counts/criteria/mirror, CI exit code); `/mm-qa` is the human-facing holistic review that wraps it and adds size/overlap/cruft judgment.
- **It does NOT auto-fix.** It reports findings by severity with remediation paths.
- **Argument:** `deep` to also run the deep mirror content compare.

---

## Decision tree "I don't know which one to use"

```
Is this an existing project you want to bring into MASTERMIND?
└── Yes → run scripts/onboard-existing-project.ps1 first, then /mm-onboard

Are you starting a project from scratch?
└── Yes → /mm-bootstrap

Do you need to prototype a UI feature visually before coding?
└── Yes → /mm-design  (run scripts/install-shadcn-mcp first if shadcn isn't initialized)

Do you have a bug, failing test, or incident?
└── Yes → /mm-bug

Are you about to produce an important document / decision / piece of code and you're unsure?
└── Yes → /mm-doubt (always first)

Just opened a session and don't remember where you were?
└── Yes → /mm-next

Want to understand a project deeply before touching it?
└── Yes → /mm-audit

Have a concrete slice or task and want a TDD plan?
└── Yes → /mm-plan <slug>

Have an approved epic ready to build?
└── Yes → /mm-ship <epic-slug>

Finished a branch and want a review before merging?
└── Yes → /mm-review

Think you've completed the current phase?
└── Yes → /mm-gate <target-phase>

It's Friday / end of week?
└── Yes → /mm-retro

Just closed a phase or a notable post-mortem?
└── Yes → /mm-learn

About to make a high-cost or irreversible decision (launch, pricing, vendor, pivot, destructive migration)?
└── Yes → /mm-premortem
```

---

## Natural flow by phase

| Current phase        | Typical commands in order                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Idea**             | `/mm-bootstrap`                                                                                                        |
| **Discovery**        | `/mm-audit` · `/mm-doubt` · `/mm-gate Discovery`                                                                       |
| **Definition**       | `/mm-plan` per epic · `/mm-gate Definition`                                                                            |
| **MVP**              | `/mm-ship` per epic · `/mm-bug` when they appear · `/mm-review` · `/mm-gate MVP`                                       |
| **Iteration**        | `/mm-ship` for new slices · `/mm-retro` weekly · `/mm-learn` occasionally · `/mm-gate Iteration`                        |
| **Launch**           | Same as Iteration + `/mm-review` with a stricter security pass                                                         |

> **Cross-phase shortcuts** (any phase): `/mm-doubt`, `/mm-audit`, `/mm-bug`, `/mm-next`, `/mm-premortem` (before any high-cost/irreversible decision).

---

## Command Recommendation Protocol (how the agent suggests the next command)

At the end of any non-trivial output, the agent emits a recommendation with one of three **confidence levels**:

- **HIGH** → one command clearly applies. Format:
  ```
  **Next recommended command:** `/mm-<name> [args]`
  **Why:** …
  **Go ahead:** type `go` to proceed.
  **Skip if:** …
  ```
- **MEDIUM** → two or more commands plausible. The agent offers options (`a`/`b`/`c`) and asks you to pick.
- **LOW** → no command fits (pure exploration, clarifying Q&A). The agent does **not** push a command.

**Rules:** the agent never auto-executes — you type `go` or run the command yourself. If the agent ever emits HIGH without a valid "Skip if" reason, that is a protocol failure.

Full contract: [`CLAUDE.md §5`](CLAUDE.md) and [`.cursor/hooks/post-output.suggest-command.md`](.cursor/hooks/post-output.suggest-command.md). Kill-switch: `MM_HOOK_SUGGEST_COMMAND=off`.

---

## Golden rules for the commands

1. **Command ≠ skill ≠ workflow.** A command is a *shortcut* that loads context and fires a skill or a workflow. If you're unsure what it does under the hood, open the matching `.md` — they're intentionally short.
2. **The argument matters.** When a command requires an argument (e.g. `/mm-gate Discovery`), do not invoke it without one: it will ask and you lose a turn.
3. **Never skip `/mm-doubt`** before an important output. It's the project's master rule, at the same level as the Karpathy principles.
4. **Never advance a phase manually.** Only `/mm-gate` modifies `memory/02-current-state.md` and `memory/13-phase-history.md`. Editing by hand leaves the project inconsistent.
5. **`/mm-bug` proposes no fix without reproducing.** If Phase 2 (reproduce) fails, the bug is logged as Unreproducible and stops. No "fixing from the description".
6. **`/mm-review` does not fix.** It finds and decides. The fix is done by the author or a subsequent `/mm-plan`.
7. **`/mm-retro` runs 20–40 minutes.** If it overruns, there are too many open things — that itself is a finding.
8. **`/mm-learn` does not batch-approve.** Each lesson candidate is approved one by one. Even when you say "approve all", the command insists on walking through each.

---

## Anti-patterns (what NOT to do)

- **DO NOT** invoke `/mm-ship` while still in Discovery or Definition. The epic doesn't exist yet. Run `/mm-plan` per epic first.
- **DO NOT** invoke `/mm-plan` for a one-line fix with obvious success criteria. Process over-engineering.
- **DO NOT** invoke `/mm-audit` every time you want to "have a look". It's a 30–60 min operation with persistent artifacts. For quick questions, use normal chat.
- **DO NOT** use `/mm-gate` as a rubber stamp. If the dry-run reports GAPS and you ignore them, the phase stays dirty and `/mm-retro` will catch it next week.
- **DO NOT** fire `/mm-learn` without passing through `/mm-retro` earlier in the same week. You lose the evidence filter.

---

## Maintaining this file

When a new command is added under `.claude/commands/`, this file must be updated in the same commit. The canonical sources are:

- `.claude/commands/<command>.md` — the real command.
- `.claude/commands/README.md` — the master technical index.
- `OPERATING-GUIDE.md` — the full system view.
- **This file** — the fast, user-facing reference.

If a command is removed, drop it here too and log the decision in `memory/07-decisions-log.md`.
