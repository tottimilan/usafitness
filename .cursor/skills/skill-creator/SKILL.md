---
name: skill-creator
description: Creates new skills, edits existing ones, and audits the skills directory for compliance with the Agent Skills specification (agentskills.io) and the MASTERMIND Master Template conventions. Use when adding a new skill, refactoring an existing SKILL.md, splitting a large skill into referenced files, optimizing a skill's description for trigger accuracy, or running a stocktake on the skill library. Ensures frontmatter validity (name ≤ 64 chars and kebab-case, description ≤ 1024 chars with "what + when" content), body size below 500 lines / ~5000 tokens, and the canonical 9-section layout used across this repository. Writes new skills under .cursor/skills/<skill-name>/SKILL.md with optional references/, scripts/, and assets/ subdirectories.
---

# Skill Creator

Meta-skill. Loaded when building, refactoring, or auditing other skills in this repository.

## Goal

Every skill in `.cursor/skills/` should:

1. Be **discoverable** via a precise `description` (the primary trigger mechanism).
2. Be **cheap to load** (<500 lines / ~5000 tokens for the main `SKILL.md`).
3. Follow the **MASTERMIND 9-section template** so skills are predictable and composable.
4. **Reference external files** in `references/`, `scripts/`, or `assets/` when the content would exceed the soft limit.
5. **Declare its interactions** with other skills explicitly.

Without a meta-skill, the skill library drifts: formats diverge, descriptions become unfireable, and duplicates creep in. This skill prevents that.

## When to use

**Always:**
- Creating a new skill for this template.
- Editing an existing `SKILL.md` (even small changes benefit from the compliance checks).
- Splitting a skill whose body grew past the soft limit.
- The user says *"this pattern is repeated, let's turn it into a skill"*.
- Auditing the skill library ("stocktake") on a quarterly basis or before a release.

**Trigger keywords:** "create a skill", "new skill", "edit skill", "refactor skill", "audit skills", "SKILL.md", "skill template", "optimize description", "skill spec", "agentskills.io".

**Do NOT use for:**
- Running (invoking) an existing skill — that is the agent's default behavior.
- Editing non-skill files under `.cursor/`.
- Creating Cursor rules (`.mdc` files in `.cursor/rules/`) — those are a different artifact.

## Prerequisites

Read:

- `CLAUDE.md` — to know the kernel's Golden Rule (every new skill must respect it).
- `.cursor/rules/00-project-operating-system.mdc` — operating contract.
- `.cursor/rules/01-karpathy-principles.mdc` — behavioral guidelines that every skill must satisfy.
- Two or three existing skills in `.cursor/skills/` as **style reference** (e.g. `doubt-surfacer`, `memory-updater`).
- The Agent Skills specification summary below (authoritative source: [agentskills.io/specification](https://agentskills.io/specification)).

## Process

### Step 1 — Frontmatter compliance (non-negotiable)

Every `SKILL.md` must begin with valid YAML frontmatter:

```yaml
---
name: <lowercase-with-hyphens>
description: <1–1024 chars, what + when, with trigger keywords>
---
```

**`name` constraints (hard rules from the spec):**
- ≤ 64 characters.
- Only lowercase letters, numbers, and hyphens.
- No leading or trailing hyphen.
- Must NOT contain the reserved tokens `anthropic` or `claude`.
- Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`

**`description` constraints:**
- 1 to 1024 characters. Non-empty.
- Must describe **what** the skill does AND **when** to use it.
- Should include concrete **trigger keywords** that users actually say.
- Sweet spot: 50–200 words / 300–800 characters.

**Optional fields (use only if needed):**
- `license` — license name or bundled file reference.
- `compatibility` — environment requirements (≤ 500 chars).
- `metadata` — arbitrary key-value.
- `allowed-tools` — pre-approved tools, space-separated (experimental).

### Step 2 — MASTERMIND 9-section body template

Every skill body follows this layout, in this exact order:

1. **Title (H1)** — human-readable skill name.
2. **Goal** — 2–4 sentences: what problem it solves, why it exists.
3. **When to use** — "Always" list + "Do NOT use for" list + "Trigger keywords" line.
4. **Prerequisites** — files to read, other skills that must have run first.
5. **Process** — numbered steps, each with a clear action and verifiable checkpoint.
6. **Outputs** — files created/updated (exact paths) and in-chat output.
7. **Interactions with other skills** — Invoked by / Invokes / Pairs with.
8. **Completion checklist** — verifiable "done" criteria (supports Karpathy #4).
9. **Anti-patterns** — what NOT to do. Known failure modes.

Sections may be adapted (renamed, merged) only with a documented reason. Keep titles in English for portability across skills and projects.

### Step 3 — Size budget & progressive disclosure

- **Target:** < 300 lines for the main `SKILL.md`.
- **Hard cap:** 500 lines / ~5000 tokens.
- **If longer:** split into referenced files inside the skill directory:
  - `references/<topic>.md` — reference material loaded only when needed.
  - `scripts/<name>.<ext>` — executable code; the agent runs it via shell and receives output, the script itself never enters context.
  - `assets/<name>` — templates, fixtures, examples.
- **Always cross-reference** from `SKILL.md`:
  > *For detailed handling of X, see `references/<file>.md`.*

### Step 4 — Description optimization (trigger accuracy)

The `description` is how agents decide whether to activate the skill. It is the single most consequential field.

Rules:
- Include the 3–6 strongest **trigger keywords** users actually say (e.g. "bug", "reproduce", "fix" → `bug-investigator`).
- State the **preconditions** (*"use whenever X matches"*, not *"this is useful for X"*).
- Declare **what the skill writes to disk** when relevant — agents use this to decide activation based on the output they need.
- Avoid marketing words ("powerful", "advanced", "best-in-class") — models ignore them and they eat characters.
- The description should read cleanly if the user pasted it back as a request.

### Step 5 — Declare interactions

A skill that does not declare interactions becomes orphan. Always list:

- **Invoked by** — users, other skills, specific phases.
- **Invokes** — other skills this one calls (e.g. `memory-updater` at the end).
- **Pairs with** — skills run in the same workflow but not sequentially (e.g. `security-review` + `code-reviewer`).

If a new skill has no declared interactions, it is probably either too narrow (merge into an existing one) or too broad (split).

### Step 6 — Validate

Before committing a new or edited skill, run this checklist:

- [ ] Frontmatter parses as valid YAML (delimiters `---` on line 1 and after metadata).
- [ ] `name` matches `^[a-z0-9]+(-[a-z0-9]+)*$`, is ≤ 64 chars, and does not contain `anthropic` or `claude`.
- [ ] `description` is ≤ 1024 chars, non-empty, describes both *what* and *when*.
- [ ] Body is ≤ 500 lines.
- [ ] All 9 sections present (or a documented reason for omission).
- [ ] Interactions declared.
- [ ] At least one anti-pattern listed.
- [ ] No overlap >60% with an existing skill (if there is, refactor instead of creating).

Manual validation (when a validator is not available):

```powershell
# PowerShell
Select-String -Path .cursor/skills/<skill>/SKILL.md -Pattern '^(name|description):'
(Get-Content .cursor/skills/<skill>/SKILL.md).Count
```

### Step 7 — Sync the Claude mirror

`.cursor/skills/` is the **canonical source**. `.claude/skills/` is a generated mirror for Claude Code / Claude Desktop. After creating, editing, renaming, or deleting a skill, run:

```powershell
pwsh -File scripts/sync-skills.ps1        # Windows / cross-platform PowerShell
```

```bash
bash scripts/sync-skills.sh                # Unix / macOS
```

To verify drift without writing, use the `-Check` / `--check` flag (exits 1 on drift):

```powershell
pwsh -File scripts/sync-skills.ps1 -Check
```

Commit the source skill and the mirror update **in the same commit**. Never commit one without the other.

### Step 8 — Register the change

- The filesystem **is** the registry — no separate catalog file to maintain.
- **Record the change** in `memory/07-decisions-log.md` whenever the skill library gains, loses, or significantly restructures a skill:

```markdown
### YYYY-MM-DD — Added skill `<skill-name>`
- **Decision:** …
- **Reason:** Recurring pattern observed in N sessions.
- **Alternatives considered:** Extending existing skill `<X>` (rejected because …).
- **Consequences:** New entry in `.cursor/skills/<skill-name>/`. Updated interactions in `<callers>`.
- **Files affected:** `.cursor/skills/<skill-name>/SKILL.md`, `<others>`.
```

### Step 9 — Update interacting skills

If the new skill is invoked by existing ones, **update those skills' "Interactions" sections** so the graph stays consistent. A skill that claims to invoke another must be reciprocal in the other skill's "Invoked by" list.

After updating peer skills, run the sync script again so the mirror reflects all edits.

## Outputs

- A new or edited `SKILL.md` under `.cursor/skills/<skill-name>/SKILL.md`.
- Optional `references/*.md`, `scripts/*`, or `assets/*` in the same directory.
- An entry in `memory/07-decisions-log.md` when the library structure changed.
- Edits to peer skills when interactions need reciprocation.

## Interactions with other skills

- **Invoked by:** user (*"create a new skill"*), the agent itself when it detects a recurring pattern worth formalizing, the maintainer during stocktakes.
- **Invokes:** `memory-updater` — to log structural changes in `memory/07-decisions-log.md`.
- **Pairs with:** `code-reviewer` — skills are code-like artifacts; review before merging.
- **Pairs with:** `skill-quality-evaluator` — runs static analysis on every new or edited skill; reports findings + score before commit. Use as the structural complement to `code-reviewer`'s semantic review.

## Known skills in this repo (System 1 + System 2)

These 26 skills form the canonical set. A new skill must not overlap > 60% with any of them (see anti-patterns):

**System 1 — Analysis & Documentation (15):**
- Foundation: `doubt-surfacer`, `memory-updater`, `skill-creator` (this one)
- Discovery: `project-deep-audit`, `product-requirements`, `flow-analyzer`, `research-first`
- Design: `architecture-mapper`, `feature-breakdown`
- Execution: `implementation-planner`, `test-strategist`
- Quality: `bug-investigator`, `code-reviewer`, `security-review`, `premortem`

**System 2 — Execution (9):**
- `phase-gate-reviewer` — validates Idea → Discovery → Definition → Prototype → MVP → Iteration → Launch transitions (Prototype optional for non-UI projects).
- `approval-gatekeeper` — enforces Human-in-the-Loop for sensitive actions.
- `subagent-dispatcher` — drives plan execution task-by-task within one workspace, fresh subagent per task, two-stage review (spec then code quality).
- `parallel-executor` — coordinates parallel execution across Git worktrees, independence analysis, runtime isolation decisions, merge order planning.
- `continuous-learner` — promotes qualifying lessons to `~/.mastermind/global/` (lessons / patterns / pitfalls / stacks / vendors); applies the 3-part test; per-entry user approval.
- `retroactive-documenter` — seeds `memory/` from an existing codebase (code + git log + README + lockfiles). Used during onboarding of projects not born from MASTERMIND. Per-file approval.
- `skill-quality-evaluator` — static-analysis lint for SKILL.md files (frontmatter, 9-section template, line budget, anti-patterns); produces a per-skill score + findings.
- `eval-harness` — converts confirmed `bug-investigator` post-mortems into deterministic regression cases and reads `dispatch-log.jsonl` for a lightweight dispatch eval (success/blocked rates, cost/latency by role and model). Zero new runtime deps.
- `context-budget` — active management of the agent's own context window (persist to `memory/` first, compact at ~70%, clear stale tool results, keep guardrails resident). Markdown on disk stays canonical.

**System 1 — Design & prototyping (2):**
- `prototype-designer` — bridges MASTERMIND memory (flows, features, design tokens) to Claude Design for interactive prototyping on top of the project's design system install. Platform-aware (web: shadcn/ui; mobile: RNR). Single-feature scope. Precedes `implementation-planner` within MVP / Iteration phases.
- `mockup-factory` — full-app iterative prototyping. 3 modes: `create v1` / `iterate vN+1 from feedback` / `freeze into final`. Platform-aware (web + Vercel preview; mobile + Expo Go). Invoked during the dedicated **Prototype phase** (between Definition and MVP). Outputs to `docs/design/mockups/` with per-iteration folders + `final/`; consolidates decisions into memory/14 on freeze; recommends `/mm-gate MVP`. Different from `prototype-designer`: that's single-feature during build; this is whole-product before build.

Total: **26 skills** (17 System 1 + 9 System 2). System 2 covers execution, orchestration, learning, onboarding, skill QA, evals, and context discipline.

Propose a new skill only if its purpose is not covered by the above list. Overlap > 60% with an existing skill = refactor the existing, do not duplicate.

## Adjacent artifacts (not skills, but governed by similar rules)

- **Workflows** live in `.claude/workflows/*.md`. They compose skills into end-to-end recipes. See `.claude/workflows/README.md` for the format. Authoring rules: propose a workflow only when an operation repeats ≥ 3 times; never duplicate skill content into a workflow.
- **Slash commands** live in `.claude/commands/mm-*.md`. They wrap a single skill or a single workflow with pre-loaded context. See `.claude/commands/README.md`. Authoring rules: `mm-` prefix, max 3 arguments, short body, no policy hiding.

When creating a workflow or a command, log the addition in `memory/07-decisions-log.md` the same way skill additions are logged.

## Completion checklist

- [ ] Frontmatter valid per the Agent Skills spec.
- [ ] 9 sections present and ordered.
- [ ] Body ≤ 500 lines; overflow split into `references/`, `scripts/`, or `assets/`.
- [ ] Description optimized for trigger accuracy (what + when + keywords).
- [ ] Interactions declared and reciprocated in peer skills.
- [ ] Anti-patterns listed.
- [ ] `.claude/skills/` mirror synced via `scripts/sync-skills.ps1` (or `.sh`).
- [ ] `-Check` / `--check` confirms zero drift.
- [ ] `memory/07-decisions-log.md` updated when the library structure changed.

## Anti-patterns

- **Avoid:** Copy-pasting a `SKILL.md` from another project without adapting the description to this codebase's vocabulary and workflows.
- **Avoid:** Writing a 1500-line `SKILL.md` with every possible case inline. Split or it will not be loaded.
- **Avoid:** Vague descriptions like *"helps with coding tasks"* — agents will not trigger them.
- **Avoid:** Skipping the "Do NOT use for" list — triggers get abused without negative examples.
- **Avoid:** Adding a new skill that overlaps >60% with an existing one. Refactor the existing one.
- **Avoid:** Editing past skills without recording the change in `memory/07-decisions-log.md`.
- **Avoid:** Using marketing words in the description. Models ignore them and you waste characters.
- **Avoid:** Forgetting to update peer skills' "Invoked by" list when adding a new invoker.
- **Avoid:** Editing files inside `.claude/skills/` directly. That folder is generated — edit `.cursor/skills/` and run the sync script.
- **Avoid:** Committing only one side of the pair (source without mirror, or mirror without source). The repo must be internally consistent at every commit.
