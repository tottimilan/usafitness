---
name: code-reviewer
description: Reviews any implementation, refactor, or AI-generated code change against the approved plan and the project's standards, categorizes issues by severity (Critical / Important / Suggestion), and delivers a clear merge verdict. Use before merging any PR, after implementation-planner or bug-investigator produces code, when the user asks for "review", "check", "audit this PR", "is this ready to merge", "lgtm", or when AI-generated code needs a second pass before commit. Different from security-review: this skill checks scope, quality, architecture, tests, Karpathy compliance, and readiness; security-review checks auth/permissions/secrets/payments specifically. Produces an in-chat review with issues by severity and a ready-to-merge decision. Updates memory when the review surfaces cross-project lessons.
---

# Code Reviewer

## Goal

Apply a **senior-engineer review pass** to any code change before it is merged. The skill must answer three questions with evidence:

1. Does the change **match the plan and the requirements**?
2. Does it **meet the project's quality and safety standards**?
3. **Is it ready to merge** — yes, no, or yes-with-fixes?

The review is honest. Critical issues block merge. Important issues should block until addressed. Suggestions are improvements that may ship later. No rubber stamps.

## When to use

**Always:**
- Before merging any non-trivial PR.
- After `implementation-planner` execution completes a slice.
- After `bug-investigator` produces a fix.
- When the user asks: "review", "check this", "audit this PR", "is this ready to merge", "lgtm?".
- When AI-generated code is about to be committed without human inspection.

**Trigger keywords:** "review", "code review", "PR review", "check this", "audit", "lgtm", "ready to merge", "look over", "sanity check".

**Do NOT use for:**
- Work-in-progress explorations not intended to merge.
- Security-only review (delegate to `security-review`).
- Visual / design review of rendered UI (that is manual, not this skill).

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/01-karpathy-principles.mdc` (the behavioral yardstick)
3. `.cursor/rules/02-tech-stack.mdc` (conventions in effect)
4. `.cursor/rules/03-testing-policy.mdc` (coverage expectations)
5. `.cursor/rules/04-safety-and-git.mdc` (commit and PR rules)
6. The **plan** the change claims to implement: `.cursor/plans/<file>.md` (if any).
7. The **slice** or **epic** the change belongs to: `docs/features/<epic>/breakdown.md`, `docs/features/<epic>.md`.
8. Relevant `docs/flows/<slug>.md` for flow-touching code.
9. The diff being reviewed — read every changed line, not just filenames.

**Code context efficiency:** If a Code Intelligence MCP is available, use it to get precise context around the changed code (callers, impact, related symbols) instead of loading unnecessary files. This keeps reviews token-efficient especially in Claude sessions.

If a non-trivial change has **no plan** referenced, that is itself a Critical issue. Either the plan exists and is missing, or the change skipped `implementation-planner` and the review should flag the process gap before looking at code.

## Process

### Step 1 — Frame the review

At the top of the review (in chat), restate:

```markdown
## Reviewing
- Change: <branch or PR>
- Plan / slice: <link or "none — flag process gap">
- Requirements: <link to docs/features/*.md>
- Git range: <base..head>
- Reviewer: <Model> (AI first-pass; human sign-off required for Critical/Important)
```

### Step 2 — Walk the plan, not the diff

Open the plan first. For each task in the plan, check:

- Is it implemented?
- Did it match its acceptance criteria?
- Is the failing-then-green test from the plan actually in the diff?

Only after the plan coverage check, walk the diff file by file.

### Step 3 — Review categories (in order)

For each category below, write a short paragraph with findings. If a category has no issues, say so explicitly — that is a positive finding, not empty space.

1. **Plan compliance** — every plan task implemented? Any extra changes not in the plan?
2. **Scope discipline** — Karpathy #3. Did anything outside the task get touched? Name the file and line.
3. **Correctness** — does the code do what the acceptance criteria say? Are edge cases from `flow-analyzer`'s matrix handled?
4. **Tests** — do tests match the level in `test-strategist`'s strategy? Do they actually assert the bug / behavior, or are they smoke?
5. **Architecture fit** — boundaries, service responsibilities, naming consistent with `memory/03-architecture.md`. New third-party added? Where is the `research-first` note?
6. **Quality** — duplication, dead code introduced by this PR, error handling, logging, type safety.
7. **Performance** — any obvious N+1, missing index, expensive synchronous call in a hot path.
8. **Readability** — names, comments, structure. One-sentence rule: would a new hire understand the intent?
9. **Simplicity (YAGNI)** — abstractions that were not requested? Speculative flexibility? If yes, flag.
10. **Documentation** — `memory/` and `docs/` updates present? Was `memory-updater` called?
11. **Git hygiene** — commits small and focused, Conventional Commit messages, no secrets in diff, branch name matches `04-safety-and-git.mdc`.
12. **Blast radius (adapted from Trail of Bits `differential-review`)** — if this change ships and a regression appears, what else breaks? Map the dependency graph for the changed lines:

    - **Direct callers** — every function, route, job, or test that imports / invokes the changed code. List them or flag if too many to enumerate (signal of high blast radius).
    - **Persisted state touched** — DB columns written, cache keys invalidated, files in storage, queue messages emitted. Each is a new failure surface.
    - **External integrations affected** — third-party APIs called with new parameters, webhooks emitted with new payload shapes, SDK upgrades that change wire format.
    - **Data already in production** — does the change require migration of existing rows / files / cache entries? If yes, the change is implicitly a 2-step deploy (migration first, then code).
    - **Reversibility** — can this change be reverted with a single `git revert` in <5 minutes if it breaks production? If no, what's the rollback procedure?

    Write the blast radius as 3-6 bullets. A change with one-bullet blast radius is low-risk; six bullets is "open follow-up issue, schedule monitoring".

    Source: pattern adapted from [trailofbits/skills `differential-review`](https://github.com/trailofbits/skills/tree/main/differential-review). See `research/03-trail-of-bits-skills.md` for evaluation context.

### Step 4 — Categorize every issue by severity

Use these three levels — no invented middle ground:

- **Critical** — blocks merge. Examples: tests fail, schema change without migration, plan task missing, secret in diff, auth/payments break, Karpathy #3 violated in a risky area.
- **Important** — should block merge, but may be deferred with an explicit follow-up ticket. Examples: missing edge-case test, scope drift in non-risky area, inconsistent naming.
- **Suggestion** — improvement, not required. Examples: refactor opportunity, alternative phrasing, minor cleanup.

For each issue, write:

```markdown
- **[Severity] <file>:<line> — <Title>**
  - What's wrong: <specific observation, not vague feedback>
  - Why it matters: <impact on product / team / future work>
  - How to fix: <concrete change, or "refactor into X and drop Y">
```

### Step 5 — Acknowledge the good

List at least 2–3 things the change does well. Not flattery — specific, genuine strengths (e.g. "The regression test reproduces the bug before the fix, as required"). This keeps the review calibrated and makes Critical findings more credible.

### Step 6 — Verdict

End the review with a single verdict:

- **Ready to merge** — zero Critical, zero Important, only Suggestions.
- **Ready to merge with fixes** — no Critical, Important exist with explicit short-term fixes listed.
- **Not ready to merge** — at least one Critical issue. Merge blocked until addressed.

Write:

```markdown
## Verdict

**Status:** Ready to merge | Ready to merge with fixes | Not ready to merge

**Reasoning (1–2 sentences):** …

**Blocking issues (if any):**
- …

**Recommended next step:** …
```

### Step 7 — Cross-project lessons

If the review surfaced a recurrent pattern (e.g. "the third time we forgot to invalidate the cache after write"), flag it as a candidate for the cross-project Memory Graph via `memory-updater`.

### Step 8 — Invoke `memory-updater`

Persist:

- `memory/07-decisions-log.md` — if the review approved a non-obvious trade-off.
- `memory/08-known-risks.md` — if the review identified a risk worth tracking.
- Cross-project lesson candidate (optional).

No code changes are written by this skill. The skill reviews — the fix is a separate action.

### Step 9 — Closing

Deliver the review in the 11-category format, then emit a Command Recommendation whose confidence level depends on the verdict:

**If verdict = "Not ready" (at least one Critical)** → **HIGH**:
```markdown
"Review complete. Verdict: Not ready. <N> Critical, <M> Important, <K> Suggestions.

---
**Next recommended command:** `/mm-plan fix-<main-critical-slug>`
**Why:** Critical issues block merge; the plan will sequence fixes with TDD for the blocker.
**Go ahead:** type `go` and I'll proceed to `implementation-planner` scoped to the blocker.
**Skip if:** you prefer to dispatch each blocker via `/mm-bug` individually (e.g. when they are regressions)."
```

**If verdict = "Ready with fixes" (Important only)** → **MEDIUM**:
```markdown
"Review complete. Verdict: Ready with fixes. 0 Critical, <M> Important, <K> Suggestions.

---
**Possible next commands (pick one):**
a) `/mm-plan fix-minor-issues` — if you want to close the Important findings before merging.
b) Merge now + open follow-up tickets — if the Important findings can be tracked for later.
c) `/mm-review <same-branch>` after the author fixes them — if you prefer a re-review loop.
**Which?** reply `a`, `b`, or `c`."
```

**If verdict = "Ready to merge" (clean or Suggestions only)** → **HIGH**:
```markdown
"Review complete. Verdict: Ready to merge. 0 Critical, 0 Important, <K> Suggestions.

---
**Next recommended command:** merge the PR (no `/mm-*` needed — `memory-updater` runs automatically after merge).
**Why:** nothing blocks; Suggestions can go into a backlog ticket.
**Skip if:** you want to apply Suggestions before merging."
```

## Outputs

- In-chat review with the 11 categories and the verdict.
- Optional entries in `memory/07-decisions-log.md` and `memory/08-known-risks.md`.
- Optional cross-project lesson candidate.
- **No code writes.** Fixes are a separate step.

## Interactions with other skills

- **Runs after:** `implementation-planner` execution, `bug-investigator` fixes, or any significant diff.
- **Runs before:** merge, `security-review` (if the change touches auth/payments/data exposure), `memory-updater` at close.
- **Invokes:** `memory-updater`; optionally `research-first` when the review uncovers an un-verified dependency.
- **Pairs with:** `security-review` — always run both on sensitive changes; neither replaces the other.

## Completion checklist

- [ ] Plan compliance checked before diff walk.
- [ ] All 11 categories reviewed (or explicitly noted as not applicable).
- [ ] Every issue has a file:line reference, root reason, and fix suggestion.
- [ ] Severity assigned for each issue (Critical / Important / Suggestion).
- [ ] At least 2–3 specific strengths acknowledged.
- [ ] Verdict given (Ready / Ready with fixes / Not ready).
- [ ] Cross-project lesson flagged if applicable.
- [ ] `memory-updater` ran.

## Anti-patterns

- **Avoid:** "LGTM" as a review. Either it is ready or it is not, and the reasoning must be explicit.
- **Avoid:** Vague feedback ("could be cleaner"). Every finding has file:line + why + fix.
- **Avoid:** Marking everything Critical. When everything is Critical, the author cannot prioritize.
- **Avoid:** Reviewing the diff without reading the plan. Context-free review misses scope creep.
- **Avoid:** Fixing code inline during review. The review finds; the author (or a subsequent skill) fixes.
- **Avoid:** Skipping the strengths section. It costs 60 seconds and makes the review more credible.
- **Avoid:** A verdict without blocking-issues list. Readers must know exactly what to address.
- **Avoid:** Passing merge on a change that has no plan reference. That is a process gap, worth flagging.
