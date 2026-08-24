---
name: bug-investigator
description: Systematic 4-phase debugging process — reproduce, isolate, diagnose root cause, fix surgically with a regression test — for any bug, test failure, production incident, or unexpected behavior. Use before proposing any fix when encountering a bug report, flaky test, stack trace, failing CI run, unexpected output, performance regression, or when the user says "fix this", "why is this broken", "debug", "investigate", "this should work but doesn't". Never patches symptoms without a confirmed root cause. Every fix ships with a failing-then-green regression test. Produces a short post-mortem note at docs/bugs/<date>-<slug>.md for non-trivial bugs, and updates memory/07-decisions-log.md and memory/08-known-risks.md when the bug surfaced a systemic risk.
---

# Bug Investigator

## Goal

Turn "something is broken" into "we know exactly what is broken, why, what we are going to change, and we have a test that will catch it next time". The skill enforces four phases in strict order: **Reproduce → Isolate → Diagnose → Surgical fix with regression test**.

Fixing a bug without reproducing it is guessing. Fixing a bug without a root cause is superstition. Shipping a fix without a regression test is inviting the bug back.

## When to use

**Always:**
- A bug report arrives (user-submitted or observed in production).
- A test fails in CI (not just locally).
- A test is flaky (same test, same commit, different outcomes).
- A performance regression is observed.
- The user says "fix this", "why is this broken", "debug", "investigate", "this should work", "why does it do X".

**Trigger keywords:** "bug", "broken", "fix", "debug", "investigate", "root cause", "regression", "flaky test", "crash", "error", "stack trace", "why does it".

**Do NOT use for:**
- Known-bad code the team has already decided to rewrite (that is a refactor, planned via `implementation-planner`).
- Feature gaps mistaken for bugs (that is `product-requirements` or `feature-breakdown`).
- Design choices the user dislikes ("not a bug, a decision" — document in `memory/07-decisions-log.md`).

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/01-karpathy-principles.mdc` (especially Surgical Changes)
3. `memory/02-current-state.md`
4. `memory/08-known-risks.md` (the bug may be a known risk materializing)
5. `memory/09-testing-status.md`
6. Any relevant `docs/flows/<slug>.md` if the bug occurs inside a flow.
7. `memory/04-data-model.md` if the bug involves data.

For stack-related bugs, run `research-first` on the library or service involved — the bug might be a known issue upstream.

**Code exploration (token efficiency):**
- When isolating or diagnosing, prefer Code Intelligence MCP queries (symbols, call paths, impact) if available over repeated full file reads or broad greps.
- This helps a lot in Claude-heavy debugging sessions with sub-agents.

## Process

### Phase 1 — Reproduce

**Non-negotiable rule:** No fix is proposed until the bug has been reproduced **locally** or captured in a failing automated test.

Steps:

1. **Collect the evidence.** Stack trace, logs, timestamps, user ID, environment, commit SHA, browser/OS, reproduction steps as reported.
2. **Write the reproduction recipe** in the post-mortem draft:
   ```markdown
   ## Reproduction
   - Environment: <local | staging | prod>
   - Commit: <sha>
   - Steps:
     1. …
     2. …
   - Expected: …
   - Actual: …
   ```
3. **Reproduce locally** — run the exact steps. If unable, try:
   - Copy production data subset (scrubbed) into a local DB.
   - Replicate the request with the same auth token, same locale, same feature flags.
   - Capture a HAR / network log from the reporter if a UI bug.
4. **If reproduction is impossible**, stop. Do **not** fix. Either:
   - Ask the reporter for more evidence (via the user).
   - Add instrumentation (logs, traces) behind a feature flag, ship it, wait.
   - Declare the bug "unreproducible" in `memory/08-known-risks.md` with status `Open / Investigating`.

### Phase 2 — Isolate

Narrow the bug to the smallest reproducible case. Techniques:

- **Binary search in git history** (`git bisect`) to find the commit that introduced the bug.
- **Remove inputs** — what is the minimal payload that triggers the bug?
- **Strip layers** — does the bug exist in the service alone, or only through the API? In the DB query, or only through the ORM?
- **Vary one dimension at a time** — user role, tenant, region, browser, time of day.
- **Check the boundary** — bugs love boundaries: auth vs anon, first-tenant vs N-tenant, first-item vs empty list, DST switch, page 1 vs page 10000.

Write the isolated repro in the post-mortem:

```markdown
## Isolated repro
- Minimal input: <payload or steps>
- Where it breaks: <file:line or module>
- Where it does NOT break: <the nearest case that works>
```

### Phase 3 — Diagnose root cause

Never stop at the first broken thing you find. Ask "why" until you reach a cause you can fix. Root cause categories (tag the bug with at least one):

- **State** — unexpected data or stale cache.
- **Timing / concurrency** — race, order of events, retry policy.
- **Dependency** — external service behavior, library version, API change.
- **Configuration** — env var, feature flag, infra setting.
- **Assumption** — the code assumed X; X is false in this environment.
- **Contract** — interface mismatch between components.
- **Missing edge case** — logic never considered this input.

Write in the post-mortem:

```markdown
## Root cause

**Category:** <State | Timing | Dependency | Config | Assumption | Contract | Missing edge case>

**Explanation:**
<2–5 sentences. No hand-waving. Name the specific condition, the specific code path, the specific value.>

**Evidence:**
- Log excerpt: …
- Query result: …
- Bisect commit: <sha>
```

If the root cause lies in an external dependency, tag it clearly. The fix may be a workaround rather than a real fix — note that.

### Phase 4 — Surgical fix with regression test

Surgical fix rules (Karpathy #3 applies at maximum strictness):

1. **Write the regression test FIRST.** The test must fail on the broken commit and pass on the fix. If the test passes on the broken commit, it is not testing the bug.
2. **Choose the smallest fix** that makes the regression test pass without breaking other tests.
3. **Do NOT refactor in the same PR.** If the bug exposes deeper rot, open a follow-up ticket and note it in `memory/10-open-questions.md`.
4. **Do NOT expand scope.** No "while I'm here I also fixed X" — open a separate PR.

The regression test lives at the **level matched by `test-strategist`'s strategy** — usually integration or E2E for anything that touches real data or flows, unit for pure logic bugs.

Commit pattern:

```
fix(<scope>): <imperative summary of the fix>

Root cause: <category> — <one-line>.
Reproduces with test: <test path>.
See docs/bugs/<date>-<slug>.md for the full post-mortem.
```

### Phase 5 — Post-mortem note (for non-trivial bugs)

Write `docs/bugs/YYYY-MM-DD-<slug>.md` with this full structure:

```markdown
# Bug <date> — <short title>

**Severity:** Low | Medium | High | Critical
**Status:** Investigating | Fixed | Workaround in place | Will not fix
**Reporter:** <user, monitor, CI>
**Detected on:** YYYY-MM-DD (environment)
**Resolved on:** YYYY-MM-DD

## Reproduction
(from Phase 1)

## Isolated repro
(from Phase 2)

## Root cause
(from Phase 3)

## Fix
- PR: <link or branch>
- Files changed: <paths>
- Regression test: <path>

## Blast radius
- Affected users / tenants: <count or range>
- Time window: <start> – <end>

## Post-fix checks
- [ ] Regression test lands on `main` and runs green on CI.
- [ ] Monitoring or alert added for recurrence (if applicable).
- [ ] Related docs / memory files updated.

## Lessons learned (candidate for cross-project Memory Graph)
- …
```

Trivial bugs (single-character typo, obvious one-liner) may skip the post-mortem if the commit message captures root cause + fix.

### Phase 6 — Update memory

Invoke `memory-updater` to persist:

- `memory/09-testing-status.md` — new regression test registered.
- `memory/08-known-risks.md` — if the root cause is a systemic risk.
- `memory/07-decisions-log.md` — if the fix implies a decision (e.g. "chose to handle null tenant by rejecting request rather than defaulting").
- `memory/10-open-questions.md` — if the bug exposed a deeper rot that is out of scope for this fix.

### Phase 7 — Closing

Summarize the fix, then emit a **HIGH** Command Recommendation (after a bug fix the next steps are almost always review + optional lesson promotion):

```markdown
"Bug <slug> fixed. Root cause: <category> — <one line>. Regression test: <path>. Post-mortem: <path or 'trivial, none'>.

---
**Next recommended command:** `/mm-review <fix-branch>`
**Why:** a fix benefits from a dedicated review that checks no scope creep and that the regression test actually fails on the broken commit.
**Go ahead:** type `go` and I'll run `code-reviewer` (+ `security-review` if the bug touched trust boundaries).
**Also consider:** `/mm-learn` if the post-mortem surfaced a cross-project lesson candidate.
**Skip if:** this was a trivial typo-class fix and the commit message already captured root cause + test path."
```

## Outputs

- Fix PR with commit message including root cause category.
- Regression test at the level chosen by `test-strategist`.
- `docs/bugs/YYYY-MM-DD-<slug>.md` — post-mortem for non-trivial bugs.
- Updated `memory/09-testing-status.md`.
- Optional updates to `memory/08-known-risks.md`, `memory/07-decisions-log.md`, `memory/10-open-questions.md`.

## Interactions with other skills

- **Runs after:** a bug report, a CI failure, a production incident.
- **Runs before:** `code-reviewer` (the fix is reviewed), `memory-updater` at close.
- **Invokes:** `research-first` when the bug implicates an external dependency.
- **Pairs with:** `flow-analyzer` — if the bug lives inside a flow, update the flow spec (error path) with the newly discovered case.

## Completion checklist

- [ ] Bug reproduced locally or in a failing automated test before any fix.
- [ ] Isolated repro documented (minimal input + where it breaks).
- [ ] Root cause diagnosed and tagged with a category.
- [ ] Regression test written first, fails on broken commit, passes on fix.
- [ ] Smallest possible fix applied; no drive-by refactors.
- [ ] Commit message includes root cause and regression test path.
- [ ] Post-mortem written for non-trivial bugs.
- [ ] `memory-updater` ran.
- [ ] Related flow's error-path section updated if applicable.

## Anti-patterns

- **Avoid:** Proposing a fix before reproducing the bug. That is guessing, not debugging.
- **Avoid:** "Root cause: <the broken line>". The broken line is the symptom. Keep asking "why" until the answer is one you can fix.
- **Avoid:** Shipping a fix without a regression test. The bug will return.
- **Avoid:** Writing a regression test that passes on the broken commit. Run it first against the bad code; if it passes, it is not a regression test.
- **Avoid:** Drive-by refactors in the fix PR. File a separate ticket.
- **Avoid:** "Will not fix" without logging the risk in `memory/08-known-risks.md`.
- **Avoid:** Skipping the post-mortem for a bug that took > 2 hours to find. That time is the lesson — capture it.
- **Avoid:** Treating a flaky test as a flaky test. Flaky = broken. Quarantine + investigate.
