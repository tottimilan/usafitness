---
name: test-strategist
description: Designs the testing strategy for a feature, slice, or entire project — what to test, at which level (unit, integration, end-to-end, smoke), what to mock, what to leave alone — aligned with the testing policy and the current project phase. Use after flow-analyzer has produced the test matrix, after implementation-planner has defined the TDD steps, or when the user asks for a "test plan", "test strategy", "coverage", "testing approach", "what should we test". Produces docs/testing/strategy.md per feature or per release, maps every test in the matrix to a concrete tool and owner, and updates memory/09-testing-status.md with coverage snapshot and gaps. Complements but does not replace the step-level TDD enforced by implementation-planner: that skill tests the WHAT; this skill tests the WHOLE.
---

# Test Strategist

## Goal

Decide **what to test, at which level, with what tooling, and why** — before tests are written. The plan-level TDD that `implementation-planner` enforces is tactical; this skill is strategic. It ensures:

- Critical flows have explicit end-to-end coverage.
- The pyramid ratio matches the current project phase (mature product vs MVP vs prototype).
- Mandatory areas (auth, payments, migrations, public APIs) are never missed.
- External services are never hit in tests.
- Coverage gaps are visible, tracked, and prioritized — not hidden behind a misleading percentage.

## When to use

**Always:**
- After `flow-analyzer` has produced a test matrix for a critical flow.
- After `implementation-planner` has written a plan: strategize the surrounding coverage beyond the plan's TDD tests.
- Before a release, as a coverage gate.
- When the user asks for "test plan", "test strategy", "coverage", "what should we test", "testing approach".

**Trigger keywords:** "test strategy", "test plan", "coverage", "E2E", "integration tests", "smoke tests", "mock strategy", "what should we test", "QA plan".

**Do NOT use for:**
- Writing a single test (that is direct implementation).
- Interpreting a flaky test (use `bug-investigator`).
- Deciding whether a bug fix needs a regression test (that is `bug-investigator`'s responsibility).

## Prerequisites

Read:

1. `.cursor/rules/03-testing-policy.mdc` (universal principles + adaptive pyramid)
2. `.cursor/rules/02-tech-stack.mdc` (testing tools chosen)
3. `memory/02-current-state.md` (phase — drives pyramid ratio)
4. `memory/03-architecture.md` (service boundaries → where integration tests live)
5. `memory/05-user-flows.md` (critical flows → E2E candidates)
6. `memory/09-testing-status.md` (current coverage snapshot)
7. `docs/features/<epic>/breakdown.md` (slices in scope)
8. `docs/flows/<slug>.md` (test matrices already produced)
9. The current implementation plan at `.cursor/plans/<latest>.md`

## Process

### Step 1 — Determine phase ratio

From `memory/02-current-state.md`, read the current phase. Apply the pyramid from `.cursor/rules/03-testing-policy.mdc`:

| Phase | Unit | Integration | E2E / Smoke |
|---|---|---|---|
| Production / maturing product | 70% | 20% | 10% |
| Active MVP / vibecoding phase | 30% | 20% | 50% |
| Prototype / spike | 0% | 0% | 100% smoke |

State the chosen ratio at the top of `docs/testing/strategy.md` with a justification. Changing phase is a decision — record it in `memory/07-decisions-log.md` via `memory-updater`.

### Step 2 — Consolidate test cases

Aggregate tests from all active sources:

- Test matrices from `docs/flows/*.md`.
- TDD tests from `.cursor/plans/*.md`.
- Mandatory coverage rules from the testing policy (auth, payments, migrations, public APIs, critical flows).
- Edge cases from every `flow-analyzer` output.

Deduplicate. A single test case should not appear in two different levels unnecessarily (if it is covered by E2E, do not repeat at integration).

### Step 3 — Assign level per test case

For each test case, decide the level:

- **Unit** — a single function or module, no I/O, no external deps.
- **Integration** — real boundaries between modules or the real DB (in a test DB), with mocked external services.
- **End-to-end (E2E)** — the system as a black box from the user's perspective (Playwright MCP for UI, HTTP clients for API).
- **Smoke** — a minimal E2E run at every deploy, fails the deploy if broken.
- **Contract** — for public APIs or webhook consumers, verifying the shape the outside world expects.
- **Performance** — targets from `memory/03-architecture.md` NFR section. Only when the NFR is explicit.

Rule of thumb: choose the **highest level that still runs fast**. Unit tests are cheap but weak; E2E tests are expensive but truthful. The pyramid ratio is how we balance them.

### Step 4 — Decide the mock strategy

For every external dependency that appears in the test surface, choose a strategy:

- **Stub (in-process fake)** — for libraries where we control the calls.
- **Mock server (e.g. MSW, nock, Prism)** — for HTTP APIs.
- **Recorded fixtures (e.g. VCR, polly)** — for stable third-party responses.
- **Sandbox environment** — when the provider offers one (Stripe test keys, Supabase local).
- **Contract test** — against the provider's OpenAPI / published schema.

Never hit real production APIs in tests. The testing policy is strict on this.

Write the mock inventory as a table in `docs/testing/strategy.md`:

| Dependency | Strategy | Fixture location | Refresh cadence |
|---|---|---|---|
| Stripe checkout | Sandbox (test keys) | env `STRIPE_TEST_*` | Manual — before release |
| SendGrid | MSW | `tests/fixtures/sendgrid/*.json` | When SDK upgrades |
| OpenAI | Recorded fixtures + small live canary | `tests/fixtures/openai/*.json` | Monthly |

### Step 5 — Gap analysis

Compare planned coverage against:

1. **Mandatory coverage areas** from the testing policy.
2. **Critical flows** listed in `memory/05-user-flows.md`.
3. **Sensitive slices** marked in `docs/features/*/breakdown.md`.

For each gap, write in `docs/testing/strategy.md`:

- **Gap:** <area>
- **Risk if we ship without it:** Low | Medium | High
- **Cost to close:** S / M / L
- **Plan:** Close now | Close next release | Accept risk (with rationale)

Gaps marked "Accept risk" must be logged in `memory/08-known-risks.md`.

### Step 6 — Test data policy

Write a short section on how test data is produced:

- **Unit / integration:** factories (e.g. fishery, factory_bot). One factory per entity.
- **E2E:** seeded users and tenants created by a setup script; cleanup after each test.
- **Production-like volume:** only in dedicated performance runs, not in functional tests.
- **PII:** never real user data. Synthetic only.

### Step 7 — Flake policy

State explicitly:

- Flaky tests are **broken**, not "occasionally failing".
- A flaky test is quarantined by tag (e.g. `flaky`) and has a same-day ticket.
- A test that fails in CI but passes locally is quarantined immediately until reproduced.
- CI must be green to merge — retries are limited (e.g. one retry on the same run for known-flaky markers only).

### Step 8 — Observability and owners

For every level of the pyramid, assign:

- **Where tests live** (path in repo).
- **Who owns them** (role, not name — "backend engineer on the feature slice").
- **Where they run** (local, PR, nightly, pre-deploy).
- **What happens when they fail** (block PR, alert channel, rollback).

### Step 9 — Update `memory/09-testing-status.md`

Refresh the snapshot:

```markdown
**Last updated:** YYYY-MM-DD
**Phase ratio applied:** 30/20/50 (MVP)

## Coverage snapshot
- Unit: <count> tests, <coverage % if measured>
- Integration: <count>
- E2E: <count>
- Smoke: <count>

## Gaps (linked to docs/testing/strategy.md §Gap analysis)
- …

## Flaky tests
- <test id> — quarantined on YYYY-MM-DD, ticket <link>

## Recent failures worth remembering
- <short post-mortem or link>
```

### Step 10 — Invoke `memory-updater`

Persist:

- `docs/testing/strategy.md` created or refreshed.
- `memory/09-testing-status.md` refreshed.
- `memory/08-known-risks.md` updated for any accepted-risk gaps.
- `memory/07-decisions-log.md` updated if the phase ratio changed.

### Step 11 — Closing

Summarize the strategy, then emit a **MEDIUM** Command Recommendation:

```markdown
"Test strategy updated. Phase ratio: <X/Y/Z>. Mandatory coverage areas: <K/K>. Open gaps: <N> (<S/M/L severity mix>).

---
**Possible next commands (pick one):**
a) `/mm-plan <test-coverage-slug>` — if the highest-severity gap needs a plan now.
b) Accept risk in `memory/08-known-risks.md` — if the gap is cheaper to accept than to close right now.
c) `/mm-review` of the mock strategy — if the mock decisions need a second look before coding.
**Which?** reply `a`, `b`, or `c`."
```

## Outputs

- `docs/testing/strategy.md` — per feature / per release.
- Updated `memory/09-testing-status.md` snapshot.
- Updated `memory/08-known-risks.md` (for accepted-risk gaps).
- Optional `memory/07-decisions-log.md` entry (phase change, accepted gaps).

## Interactions with other skills

- **Runs after:** `flow-analyzer` (consumes its test matrices), `implementation-planner` (complements its plan-level TDD), `feature-breakdown` (uses slice list).
- **Runs before:** `code-reviewer` (supplies coverage criteria), `security-review` (security tests align with strategy).
- **Invokes:** `memory-updater` at close; `research-first` when a new testing library is being considered.
- **Pairs with:** `bug-investigator` — every bug fix must produce a regression test whose level matches this strategy.

## Completion checklist

- [ ] Phase ratio stated and justified at top of the strategy doc.
- [ ] Test cases aggregated and deduplicated across flows, plans, mandatory areas.
- [ ] Level assigned to every test case (unit/integration/E2E/smoke/contract/performance).
- [ ] Mock strategy table complete — no real prod APIs in tests.
- [ ] Gap analysis produced with risk / cost / plan.
- [ ] Test data policy written.
- [ ] Flake policy enforced and documented.
- [ ] Observability and ownership defined per level.
- [ ] `memory/09-testing-status.md` refreshed.
- [ ] `memory-updater` ran.

## Anti-patterns

- **Avoid:** Chasing a coverage number (e.g. "95%"). Coverage is a hint, not a goal. The goal is: critical flows green, mandatory areas green, gaps visible.
- **Avoid:** Hitting real production APIs in tests. Always mock or sandbox.
- **Avoid:** Putting unit tests everywhere and skipping E2E on the critical flow. The ratio exists for a reason.
- **Avoid:** Accepting a flaky test because "it usually passes". Flaky = broken.
- **Avoid:** Writing one factory per test file. Factories are shared or they drift.
- **Avoid:** Including performance tests without an explicit NFR target from `memory/03-architecture.md`.
- **Avoid:** Leaving "accept risk" gaps without a `memory/08-known-risks.md` entry. Silent acceptance hides risk.
- **Avoid:** Re-testing the same assertion at multiple levels. Choose one level.
