---
name: project-deep-audit
description: Performs a deep multi-angle audit of a SaaS, app, or product project to build maximum awareness before any implementation. Use when the user asks to analyze, understand, audit, map, review, or "desgarrar" a project; when onboarding to an existing codebase; when revisiting a project after a long pause; or at the start of any new project before producing a PRD or architecture. Examines the project from 12 explicit angles (first-principles, JTBD, Porter, Blue Ocean, risks, scenarios, pivots, metrics, competitors, UX, business model, technical dependencies), produces or updates the canonical documents in docs/product, docs/architecture, docs/features, docs/flows, docs/security, and memory/08-known-risks, and finishes with an executive summary, top 10 risks, top 10 actions, and a "hard truth" paragraph. Always runs the doubt-surfacer skill first so the audit is grounded in the user's answers.
---

# Project Deep Audit

## Goal

Build **maximum awareness** of the project — product, users, market, architecture, flows, risks, gaps — before anyone proposes changes or writes code. This is the entry skill of the Discovery phase and the foundation on which `product-requirements`, `architecture-mapper`, and `implementation-planner` depend.

The audit is deliberately multi-angle: the same project examined by a senior product strategist, a senior architect, a VC investor, a pragmatic end user, and a devil's advocate. Single-angle audits miss everything important.

## When to use

**Always:**
- Starting a new project, right after `doubt-surfacer`.
- Onboarding to an existing codebase.
- Coming back to a project after > 4 weeks of pause.
- Before entering a new phase that changes direction (pre-pivot, pre-scale, pre-launch).
- When the user asks to "audit", "map", "understand", "review", "analyze", or "desgarrar" the project.

**Trigger keywords:** "audit", "analyze", "understand", "map", "review", "deep dive", "desgarrar", "x-ray", "break down", "onboarding", "take stock".

**Do NOT use for:**
- Small or narrow questions (use `research-first` or `doubt-surfacer` directly).
- Ongoing execution where the audit already exists and is recent.
- Pure code review of a single PR (use `code-reviewer`).

## Prerequisites

Run `doubt-surfacer` first. The audit must not proceed until the agent has at least a rough set of user answers on: product definition, target user, monetization intent, phase, and non-negotiables. A blind audit produces generic findings.

Then read:

1. `CLAUDE.md`
2. `memory/00-project-brief.md`
3. `memory/01-product-vision.md`
4. `memory/02-current-state.md`
5. `memory/07-decisions-log.md`
6. `memory/08-known-risks.md`
7. `memory/12-open-doubts-and-questions.md`

**Also read the cross-project memory** (if it exists — see `.cursor/rules/05-claude-mcp-integration.mdc §Cross-project Memory Protocol`):

- `~/.mastermind/global/lessons.md`
- `~/.mastermind/global/pitfalls.md`
- `~/.mastermind/global/patterns.md`

If any entry there is relevant to the current idea, surface it **before Step 1** under a "Cross-project signals" heading. Never assume a cross-project lesson applies to this project without the user confirming it fits the context. If the folder does not exist, skip silently.

For existing codebases, also explore the repository directly: `package.json` / `pyproject.toml`, route files, service boundaries, DB schema/migrations, auth layer, integrations, tests, CI config.

## Process

### Step 1 — Confirm the scope

State in one sentence what you understood the project to be, which phase it is in, and what angle the audit will emphasize (full audit, vs. audit focused on risks, vs. audit focused on pivots, etc.). Wait for confirmation **only if** the scope is ambiguous. If the user just said "audit the project", default to a full audit.

### Step 2 — Multi-angle analysis (12 mandatory angles)

Walk through each angle below. For each, write 2–6 bullet points directly into the corresponding file under `docs/` or `memory/` (not all in chat).

| # | Angle | Writes to |
|---|---|---|
| 1 | First principles — what's the irreducible problem being solved | `docs/product/product-map.md` |
| 2 | Jobs-to-be-Done — user goals, forces of progress, emotional drivers | `docs/product/product-map.md` |
| 3 | Porter's Five Forces — competitive pressure, substitutes, entry barriers | `docs/product/competitive-analysis.md` |
| 4 | Blue Ocean — uncontested value, what to reduce/raise/create/eliminate | `docs/product/competitive-analysis.md` |
| 5 | Business model — revenue streams, unit economics, moat | `docs/product/business-model.md` |
| 6 | Target user & segments — specific personas, not generic demographics | `docs/product/personas.md` |
| 7 | Technical architecture — services, data flow, dependencies | `docs/architecture/system-map.md` |
| 8 | Feature inventory — everything the product does or promises to do | `docs/features/feature-inventory.md` |
| 9 | Critical user flows — happy paths, error paths, edge cases | `docs/flows/user-flows.md` |
| 10 | Risks — technical, business, legal, operational | `memory/08-known-risks.md` |
| 11 | Security surface — auth, secrets, data exposure, payments | `docs/security/security-risk-map.md` |
| 12 | Scenarios & pivots — best case, worst case, 3 credible pivots | `docs/product/scenarios-and-pivots.md` |

For each angle, apply three lenses in order: **Senior strategist** (what makes this work commercially), **Senior architect** (what makes this work technically), **Devil's advocate** (what would kill this).

### Per-angle methodology — First Principles + 5 Whys

Required for **angles 1 (First principles)** and **7 (Technical architecture)**. Recommended for **angles 5 (Business model)** and **10 (Risks)**. Adapted from Trail of Bits `audit-context-building`.

For each angle in scope:

1. **State the system as you currently understand it** in 1-3 sentences. No hedging, no caveats — your honest current model.
2. **First principles pass** — what's the irreducible problem this system solves? Strip every implementation detail and write the problem in 1 sentence as if explaining to someone who has never seen software. If the irreducible problem isn't crisp, the rest of the audit will be vague.
3. **5 Whys** — ask "why?" five times in sequence:
   - Why does the system work the way it does today? (mechanism)
   - Why was it built that way and not another way? (history / constraint)
   - Why is the original constraint still valid? (or: when did it stop being valid?)
   - Why hasn't anyone changed it? (organizational / cost / risk)
   - Why might that need to change in the next 6-12 months? (forward pressure)
4. **Output** — 5 bullets per angle, each one a finding tagged "current model | irreducible problem | why-N | forward pressure". Add to the angle's destination file under a "## First-principles trace" subsection.

This methodology is intentionally slower than scanning. Use it only when the angle is high-stakes (architecture decisions, pivots, risks). For inventory-style angles (8 Feature inventory, 11 Security surface), a scan + table is sufficient.

Source: pattern adapted from [trailofbits/skills `audit-context-building`](https://github.com/trailofbits/skills/tree/main/audit-context-building). See `research/03-trail-of-bits-skills.md` for evaluation context.

### Step 3 — Synthesize the executive summary

Write a 300–500 word executive summary in `docs/product/executive-summary.md`. Structure:

- What the product is (two sentences, no fluff).
- Who it serves and why now.
- How it makes money.
- The single strongest differentiator.
- The single weakest link.
- Current phase and confidence level (Low / Medium / High).

### Step 4 — Top 10 risks

Promote the ten most consequential risks from Step 2 (angle 10) into the canonical table in `memory/08-known-risks.md`. For each: Impact × Likelihood × Mitigation × Status. Never produce "top 10 risks" without mitigations — that is a vibe, not analysis.

### Step 5 — Top 10 recommended actions

Write in `docs/product/top-10-actions.md`, ordered by leverage:

```markdown
### Action <N> — <Title>
- **Why:** <link to which risk, gap, or opportunity it addresses>
- **Expected impact:** <Low / Medium / High>
- **Effort:** <S / M / L>
- **Owner:** <person or role>
- **Dependencies:** <what must happen first>
- **Success signal:** <how we know it worked>
```

### Step 6 — The hard truth

End the audit with a single section in the executive summary titled **"Hard Truth"** — 3–6 sentences stating the thing the project does not want to hear but needs to. Examples:

- *"The monetization model assumes a willingness to pay that is not validated by any data in memory/. Any roadmap built on it is fragile."*
- *"The architecture diagram shows three services but the repo has one monolith; the audit must either update the diagram or plan the split — pick one."*

The Hard Truth is non-negotiable. An audit without one is flattery.

### Step 7 — Invoke `memory-updater`

Close by running `memory-updater` to persist:

- Updated `memory/02-current-state.md` (new phase confidence).
- New entry in `memory/07-decisions-log.md` recording the audit itself.
- Refreshed `memory/08-known-risks.md`.
- Flag any cross-project lesson candidates.

### Step 8 — Closing invitation

Finish the chat response with the Audit summary, then emit a **MEDIUM** Command Recommendation (two or more plausible next steps):

```markdown
"Audit complete. The most important thing I learned is: <one line>. The hardest truth is: <one line>.

---
**Possible next commands (pick one):**
a) `/mm-doubt` — if the Hard Truth deserves a fresh Question Protocol pass before anything else.
b) `/mm-plan <first-epic-slug>` — if the Hard Truth is acknowledged and you're ready to draft the PRD/plan via `product-requirements`.
c) `/mm-audit <angle>` — if one of the 12 angles needs deeper investigation before moving on.
**Which?** reply `a`, `b`, or `c`."
```

## Outputs

- `docs/product/executive-summary.md` (with the Hard Truth section).
- `docs/product/product-map.md`
- `docs/product/competitive-analysis.md`
- `docs/product/business-model.md`
- `docs/product/personas.md`
- `docs/product/scenarios-and-pivots.md`
- `docs/product/top-10-actions.md`
- `docs/architecture/system-map.md`
- `docs/features/feature-inventory.md`
- `docs/flows/user-flows.md` (high-level only; detailed flows belong to `flow-analyzer`).
- `docs/security/security-risk-map.md`
- Updated `memory/02-current-state.md`, `memory/07-decisions-log.md`, `memory/08-known-risks.md`.

## Interactions with other skills

- **Runs after:** `doubt-surfacer` (mandatory).
- **Runs before:** `product-requirements`, `architecture-mapper`, `flow-analyzer`, `implementation-planner`, and (optionally, at end of Discovery phase) `phase-gate-reviewer`.
- **Invokes at close:** `memory-updater`. If a lesson surfaced that qualifies for cross-project memory, hand off the candidate to `continuous-learner` (not `memory-updater` — that skill only flags).
- **Pairs with:** `research-first` — use it during the audit for any claim about a library, API, market, or competitor the agent is unsure about.

## Completion checklist

- [ ] `doubt-surfacer` ran and produced answers (or the audit is scoped around explicit unknowns).
- [ ] All 12 angles have at least 2 bullet points in their destination file.
- [ ] Executive summary written (300–500 words).
- [ ] Top 10 risks in `memory/08-known-risks.md` with Impact × Likelihood × Mitigation × Status.
- [ ] Top 10 actions written with Effort, Impact, Owner, Dependencies, Success signal.
- [ ] A genuine **Hard Truth** paragraph exists (not a watered-down "consider X").
- [ ] `memory-updater` ran.
- [ ] Closing invitation given to the user.

## Anti-patterns

- **Avoid:** Running the audit before `doubt-surfacer`. The output will be generic.
- **Avoid:** Skipping angles because they "don't apply". If one truly doesn't apply, name it explicitly ("Angle 4 Blue Ocean not applicable because the product is in a purely commoditized category; here is why"). Do not silently omit.
- **Avoid:** A "Hard Truth" that is actually a soft suggestion. If the auditor has nothing uncomfortable to say, either they missed something or the project is in denial. Push harder.
- **Avoid:** Producing the audit entirely in chat instead of files. The audit must survive the session.
- **Avoid:** Copying the same bullet list under "Risks" and "Actions". Risks are problems; actions are solutions. They are not the same column.
- **Avoid:** Listing 40 risks and 40 actions. The exercise is to find the top 10 of each — the constraint is the value.
- **Avoid:** Asking the user "which angle should I start with?" — this is an audit, not a workshop. Walk through all 12.
