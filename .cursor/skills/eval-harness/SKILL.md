---
name: eval-harness
description: Closes the trace -> eval -> improve loop with zero new runtime dependencies. Converts confirmed bug-investigator post-mortems (docs/bugs/*.md) into permanent regression cases in the project's test suite, and reads the gitignored .mastermind/runtime/dispatch-log.jsonl to produce a lightweight subagent-dispatch eval view (success/blocked rates by role and model, wall-time and token-cost trends). Use after a non-trivial bug is fixed and its post-mortem is written, during the weekly retrospective, when the user asks to "turn this bug into a test", "build a regression case", "evaluate dispatches", "eval harness", "mm-eval", or when dispatch-log.jsonl has accumulated enough records to spot a pattern. Never invents flaky or network-dependent tests; every regression case must deterministically reproduce the original failure. Markdown registry stays the source of truth; the log is a disposable trace.
---

# Eval Harness

## Goal

Turn the artifacts the system already produces — **bug post-mortems** and the **dispatch log** — into a feedback loop that makes the project measurably harder to regress and the orchestration measurably cheaper, **without adding any runtime dependency**.

Two inputs, two outputs:

1. **Post-mortems (`docs/bugs/*.md`) -> regression cases.** Every confirmed root cause from `bug-investigator` becomes a permanent, deterministic test that fails on the old code and passes on the fix. Bugs that are not encoded as tests get re-introduced; this skill makes "fix it once" real.
2. **`dispatch-log.jsonl` -> eval view.** The best-effort trace emitted by `subagent-dispatcher` / `parallel-executor` (via `scripts/log-dispatch`) is aggregated into a small report: which roles/models succeed, which get `BLOCKED`, and how wall-time and token cost trend. This is the lightweight, dep-free substitute for a heavy tracing stack (Langfuse-class), per decision Q5.

## When to use

**Always:**
- Right after `bug-investigator` confirms a root cause and writes a post-mortem under `docs/bugs/` — encode the regression case before closing the bug.
- During the weekly retrospective (`05-weekly-retrospective`, Phase 4) to review dispatch quality and catch un-encoded bugs.

**On request / trigger keywords:** "turn this bug into a test", "regression case", "evaluate dispatches", "dispatch eval", "eval harness", "mm-eval", "trace to eval".

**Do NOT use for:**
- Writing new feature tests from scratch — that is `test-strategist`. This skill only encodes *failures that already happened*.
- Heavy observability / distributed tracing — out of scope by design (roadmap item, requires deps).
- Inventing tests with no reproduced failure behind them. No post-mortem, no regression case.

## Prerequisites

Read:

1. `CLAUDE.md` and `.cursor/rules/03-testing-policy.mdc` (the project's test conventions and runner).
2. The target post-mortem(s) under `docs/bugs/*.md` (input for the regression path).
3. `.mastermind/runtime/dispatch-log.jsonl` if it exists (input for the eval path; gitignored, may be absent — degrade gracefully).
4. `docs/evals/regression-index.md` if it exists (the registry this skill maintains).

If neither input exists (no post-mortems and no dispatch log), stop and say so — there is nothing to evaluate yet.

## Process

### Path A — Post-mortem -> regression case

#### Step A1 — Select the post-mortem
Identify the `docs/bugs/<date>-<slug>.md` to encode (newest unencoded by default, or the one named by the user). Read its **Root cause** and **Reproduction** sections. If the root cause is "unconfirmed", stop — `bug-investigator` must confirm it first.

#### Step A2 — Derive the minimal failing case
From the reproduction, define the smallest deterministic assertion that:
- **fails** against the pre-fix behavior (the bug), and
- **passes** against the fixed behavior.
No network, no clock, no randomness, no shared mutable state. If the bug was inherently non-deterministic (race, timing), encode the *invariant that was violated*, not the timing.

#### Step A3 — Write the test in the project's suite
Add the test to the real test suite per `03-testing-policy` (same framework, same folder convention). Name it after the bug: `regression_<slug>` / `<slug>.regression.test.*`. Add a one-line comment linking back to the post-mortem path. Do **not** create a parallel test framework.

#### Step A4 — Verify the case earns its keep
- Run the new test against the current (fixed) code -> must **pass**.
- Confirm it would have caught the bug: either temporarily revert the fix locally and watch it fail, or argue concretely why the assertion targets exactly the faulty path. State which you did.

#### Step A5 — Register it
Append a row to `docs/evals/regression-index.md` (create the file with a header if missing):

```markdown
| Date | Bug slug | Post-mortem | Test file::case | Reproduces |
|---|---|---|---|---|
| YYYY-MM-DD | <slug> | docs/bugs/<date>-<slug>.md | path::name | verified-by-revert / by-argument |
```

The index is the **Markdown source of truth** for what is covered; the test files are the executable form.

### Path B — Dispatch log -> eval view

#### Step B1 — Load the log
Read `.mastermind/runtime/dispatch-log.jsonl` (one JSON object per line; fields: `timestamp`, `dispatcher`, `role`, `model`, `input_hash`, `output_status`, `wall_time_ms`, `token_cost_estimate`). If absent or empty, report "no dispatch trace yet" and stop Path B.

#### Step B2 — Aggregate (read-only, no deps)
Compute over a stated window (default: all records, or last N days if asked):
- **Success rate by role** and **by model** = `DONE` / total. Flag any role+model under ~70%.
- **`BLOCKED` / `NEEDS_CONTEXT` clusters** — repeated `input_hash` or repeated role+model failures = a systemic prompt/decomposition problem, not bad luck.
- **Cost & latency** — median and p90 `wall_time_ms` and `token_cost_estimate` by role/model; call out outliers.

#### Step B3 — Report and recommend
Emit a compact table in chat + (on request) write `docs/evals/dispatch-eval-<date>.md`. For each finding, give **one** concrete action: re-route a role to a cheaper/stronger model, fix a recurring BLOCKED prompt, or split a task that keeps returning `NEEDS_CONTEXT`. Tie model-routing suggestions to `.cursor/rules/07-subagent-orchestration.mdc` (model-selection table).

#### Step B4 — Promote systemic findings
If a finding is project-agnostic and actionable (e.g. "model X is unreliable as reviewer"), hand it to `continuous-learner` as a candidate for `~/.mastermind/global/`. Do not promote directly.

## Outputs

- New regression test(s) in the project's test suite (Path A).
- Rows appended to `docs/evals/regression-index.md` (Path A registry — the source of truth).
- Optional `docs/evals/dispatch-eval-<date>.md` report (Path B).
- Candidate lessons handed to `continuous-learner` (never promoted directly).
- A `memory-updater` session entry; a `memory/07-decisions-log.md` note if a routing change was decided.

## Interactions with other skills

- **Invoked by:** `bug-investigator` (after a confirmed post-mortem), workflow `05-weekly-retrospective` (Phase 4), user via "mm-eval".
- **Reads from:** `subagent-dispatcher` / `parallel-executor` output via `scripts/log-dispatch` -> `dispatch-log.jsonl`.
- **Hands off to:** `continuous-learner` (systemic, generalizable findings), `memory-updater` (logging).
- **Defers to:** `test-strategist` for net-new feature tests; this skill only encodes reproduced failures.

## Completion checklist

- [ ] Each targeted post-mortem has a deterministic regression test in the real suite.
- [ ] Each new test passes on fixed code and is shown to catch the original bug.
- [ ] `docs/evals/regression-index.md` row added per encoded bug.
- [ ] Dispatch eval computed over a stated window (or "no trace yet" reported).
- [ ] Each eval finding carries exactly one concrete action.
- [ ] Systemic findings handed to `continuous-learner`, not promoted directly.
- [ ] `memory-updater` run; routing decisions logged.

## Anti-patterns

- **NEVER:** Encode a regression test that does not reproduce the documented failure. A green test that never could have caught the bug is worse than none.
- **NEVER:** Introduce network, clock, or randomness into a regression case. Deterministic or it does not go in.
- **NEVER:** Build a parallel test framework. Use the project's existing runner per `03-testing-policy`.
- **NEVER:** Treat `dispatch-log.jsonl` as authoritative or required. It is a best-effort, disposable trace; the eval degrades gracefully when it is absent.
- **NEVER:** Promote an eval finding to global memory directly — route it through `continuous-learner` and its 3-part test.
- **NEVER:** Over-read the log. A handful of dispatches is anecdote; wait for enough records before declaring a model "unreliable".
