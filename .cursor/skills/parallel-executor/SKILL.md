---
name: parallel-executor
description: Coordinates parallel execution of independent tasks across multiple Git worktrees (local) or Cursor Cloud Agents (when configured). Use when an approved plan or a feature breakdown contains 2+ tasks that are genuinely independent (no shared files, no shared state, no sequential dependency), when the user asks to "run in parallel", "parallelize", "use worktrees", "dispatch in parallel", or when the critical path of the breakdown has parallelizable branches. Decides split strategy, spawns worktrees via scripts/worktree-spawn, coordinates subagent-dispatcher inside each worktree, plans merge order, handles runtime isolation only when truly needed (Docker Compose per worktree), and finishes with cleanup via scripts/worktree-cleanup. Complements subagent-dispatcher (which runs within one workspace); parallel-executor runs across workspaces.
---

# Parallel Executor

## Goal

Run independent tasks at the same time and pick up the wall-clock wins, without introducing the classical parallel coding failure modes (merge conflicts, runtime collisions, orphan worktrees eating disk). This skill is the operational arm of `.cursor/rules/07-subagent-orchestration.mdc §Parallel execution with Git worktrees`.

Its responsibility is **strategic**: decide what to parallelize, how to split, in what order to merge. The mechanical parts (creating worktrees, installing deps, cleaning up) delegate to `scripts/worktree-spawn.ps1|.sh` and `scripts/worktree-cleanup.ps1|.sh`.

## When to use

**Always:**
- A `feature-breakdown` output marks ≥ 2 slices as independent and shippable in parallel.
- An `implementation-planner` plan has ≥ 3 tasks touching non-overlapping files/services.
- `/best-of-n` runs where multiple models attempt the same task for comparison.
- Bulk migrations across many files (divide-and-conquer).
- The user says: *"in parallel"*, *"parallelize"*, *"worktrees"*, *"fan out"*, *"dispatch multiple agents"*.

**Trigger keywords:** "parallel", "worktrees", "in parallel", "fan out", "dispatch", "multiple agents", "best-of-n", "multitask".

**Do NOT use for:**
- Tasks with declared or suspected shared-state coupling (stay sequential).
- A single task that just takes long (does not decompose into independent sub-tasks).
- Work still in Discovery / Definition phase (nothing to execute in parallel yet).
- Projects without a `main` branch or with unclear base commit (baseline too unstable).
- First project onboarding before the user is comfortable with sequential execution.

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/04-safety-and-git.mdc` (branching and PR policy)
3. `.cursor/rules/07-subagent-orchestration.mdc` (the full parallel execution policy)
4. `docs/features/<epic>/breakdown.md` for the feature being executed (if dispatched from a breakdown).
5. `.cursor/plans/` for the plans being executed.
6. `memory/03-architecture.md` to identify service boundaries.
7. Current worktree state: run `git worktree list` mentally before proposing new ones.

## Process

### Step 1 — Independence analysis

For each candidate task, answer three yes/no questions:

1. **Does task B need an artifact task A produces?** (code, type, migration, endpoint, env var). If yes → sequential.
2. **Do task A and task B edit the same files?** If yes → sequential.
3. **Do they share runtime state?** (DB rows, Redis keys, external webhooks, same port). If yes → *either* sequential *or* requires runtime isolation (see Step 4).

Answer "yes" to all three = fully parallelizable. Answer "yes" to one of them = not parallelizable as-is; either refactor, or run sequential.

Emit the independence matrix as a short table before spawning anything:

```markdown
| Task | Independent from | Reason / shared resource |
|---|---|---|
| T1 add email-login | T2, T3 | different files, different routes |
| T2 stripe webhook | T1, T3 | different files, different routes |
| T3 profile page refactor | T1, T2 | different files |
```

### Step 2 — Choose the split strategy

- **Sequential pipeline** (default). Use when at least one pair of tasks is coupled. Hand off to `subagent-dispatcher` directly with the ordered list.
- **Parallel worktrees (2–3 concurrent).** Use when ≥ 2 tasks are fully independent. Each worktree runs its own dispatcher internally.
- **`/best-of-n`** (2–4 agents, same task, different models). Use for one **critical** task where quality matters more than cost (e.g. a tricky algorithm, a sensitive refactor).
- **Cloud agents.** Use when > 4 concurrent agents would be needed, or when runs should continue without the user's laptop active. Document the activation in `memory/07-decisions-log.md`.

State the chosen strategy and the reason in one paragraph.

### Step 3 — Spawn worktrees (parallel path)

For each parallel task, run:

```powershell
pwsh -File scripts/worktree-spawn.ps1 -Slug <slug> -Type <feat|fix|chore|refactor|docs|test|perf|exp> -InstallDeps
```

```bash
bash scripts/worktree-spawn.sh <slug> --type <type> --install-deps
```

Conventions (enforced by the scripts — do not override ad-hoc):

- Slug kebab-case, feature-named, not agent-named.
- Worktree path: `../<repo>-worktrees/<slug>/`.
- Branch: `<type>/<slug>`.
- All worktrees forked from the same base commit (default `origin/main`).
- Max 3–4 concurrent local worktrees. Above that, go cloud.

### Step 4 — Decide runtime isolation

Runtime isolation is **opt-in**, not default. Introduce it only when concrete conflict appears.

Decision flow:

```
Do any of the parallel tasks need to run a dev server, DB migration, or background worker locally? ─── no ──▶ No Docker. Proceed.
     │
     yes
     ▼
Can each task use the per-worktree PORT_OFFSET and isolated env (.worktree-env) to avoid collisions? ─── yes ──▶ Use env-level isolation only. Proceed.
     │
     no
     ▼
Introduce Docker Compose project per worktree:
   docker compose -p <slug> up    # namespaces networks, volumes, service names
```

Document the decision in the task context for each dispatched subagent so it knows which DB URL / port to target.

### Step 5 — Dispatch inside each worktree

Per worktree, two options:

- **Nested `subagent-dispatcher`** — the recommended path when the task is multi-step. Run the dispatcher inside the worktree; it orchestrates implementer + reviewers locally.
- **Direct executor** — for a one-shot task that does not need multi-task orchestration, run a single dispatched subagent directly inside the worktree.

Pass each dispatched subagent:
- Its slug and worktree path.
- The per-worktree `.worktree-env` (sourced for port/DB).
- The task spec.
- Conventions (same as in `subagent-dispatcher`).

**Code context efficiency:** Curate any code context using Code Intelligence MCP graph queries (only the symbols and dependencies relevant to that parallel task). Do not ship large code sections to worktrees.

### Step 6 — Plan merge order before spawning

Decide merge order **before** work starts. Criteria:

- Tasks that block others merge first (rare but it happens when the "independent" analysis missed a dependency).
- Tasks with schema / migration changes merge before tasks that depend on the new shape.
- Tasks with feature flags can merge in any order because flags decouple runtime behavior.

Record the merge order in a short block in the chat and, if non-trivial, in `memory/07-decisions-log.md`.

### Step 7 — Monitor and rebase awareness

While parallel work is running:

- **Do not rebase worktrees onto each other.** Let them finish on their base.
- If the base (`main`) moves during parallel work (e.g. a separate hotfix landed), rebase each worktree once it is ready for PR, not during the work itself.
- If a conflict is detected between two worktrees' expected merge paths (e.g. both modified the same file despite the Step 1 analysis), pause both, re-run the analysis, and consider merging the first one and then rebasing the second.

### Step 8 — Merge + cleanup

For each finished worktree:

1. Open the PR (from the worktree branch).
2. Run `code-reviewer` on the PR. Run `security-review` if touching sensitive areas.
3. Merge (squash for features, merge-commit for release branches).
4. After merge, run:
   ```powershell
   pwsh -File scripts/worktree-cleanup.ps1 -Slug <slug>
   ```
   or let the sweep handle it:
   ```powershell
   pwsh -File scripts/worktree-cleanup.ps1   # removes all merged worktrees
   ```
5. Prune any leftover metadata (`git worktree prune`).

### Step 9 — Final roll-up and memory

When all parallel tracks have merged:

- Run `code-reviewer` on the combined diff against `origin/main` to catch emergent issues across tracks.
- If any track introduced new docs (flows, ADRs, risk entries), cross-verify they are consistent across tracks.
- Invoke `memory-updater` to persist:
  - Session summary entry mentioning the parallel run, tracks, and outcomes.
  - `memory/07-decisions-log.md` entry for the parallel strategy chosen (useful learning for next time).
  - `memory/06-feature-map.md` statuses to `Shipped` for each merged slice.

### Step 10 — Closing handoff

Emit the standard Handoff block (per rule 06) with a **MEDIUM** Command Recommendation since multiple next steps are plausible when parallel tracks land:

```markdown
"Parallel run complete. <N> worktrees merged, <K> PRs closed. Cross-track review: <status>.

---
**Possible next commands (pick one):**
a) `/mm-review origin/main` — cross-track review over the combined diff to catch emergent inconsistencies.
b) `/mm-ship <next-epic>` — if this cycle is done and the next epic is queued.
c) `/mm-retro` — if the parallel sprint deserves a week-in-review before more work.
**Which?** reply `a`, `b`, or `c`."
```

## Best-of-N strategy (variant)

When the target is **quality, not speed**, use best-of-n:

1. Define **one task**, not many.
2. Pick 2–4 **different models** (e.g. Claude Opus, Sonnet, GPT-5-class, Composer). State the reason for each.
3. Spawn one worktree per model; each runs the same task spec.
4. After all finish, review the diffs **in parallel** and pick the strongest or merge ideas across them.
5. Cleanup the losing worktrees.

Warning: best-of-n multiplies token cost linearly. Use it for the 5% of tasks where quality matters most, not as a default.

## Outputs

- Multiple worktrees under `../<repo>-worktrees/` with one branch each.
- Per worktree: commits, a `.worktree-env` with the port offset, test runs.
- PRs opened (one per track) and, after review, merged into `main`.
- Updated `memory/06-feature-map.md`, `memory/07-decisions-log.md`, `memory/11-session-summary.md`.
- A final in-chat summary: which tracks ran, which merged, which were aborted, total wall-clock savings.

## Interactions with other skills

- **Invoked by:** `implementation-planner` (when a plan splits naturally), `feature-breakdown` (when slices are independent), user explicitly, workflow `02-feature-lifecycle`.
- **Invokes:** `subagent-dispatcher` inside each worktree; `approval-gatekeeper` before spawning if any task is sensitive; `code-reviewer` + `security-review` pre-merge per worktree; `memory-updater` at close.
- **Pairs with:** `subagent-dispatcher` (same workflow, different scope — dispatcher is within a workspace, parallel-executor is across workspaces).
- **Uses scripts:** `scripts/worktree-spawn.{ps1,sh}` and `scripts/worktree-cleanup.{ps1,sh}`.

## Completion checklist

- [ ] Independence analysis emitted (matrix) before any spawn.
- [ ] Split strategy stated with reason.
- [ ] Max 3–4 concurrent local worktrees respected (or cloud path chosen explicitly).
- [ ] Every worktree named by feature slug, not by agent.
- [ ] Runtime isolation decided (env-level or Docker-level) and documented.
- [ ] Merge order planned before work started.
- [ ] Each worktree merged via PR + `code-reviewer` (+ `security-review` if sensitive).
- [ ] All finished worktrees cleaned up via `scripts/worktree-cleanup`.
- [ ] `memory-updater` ran with full session summary.
- [ ] Handoff block emitted.

## Anti-patterns

- **NEVER:** Skip the independence analysis. Assumed independence is the #1 source of silent conflicts.
- **NEVER:** Spawn > 4 concurrent local worktrees on a laptop. Disk and CPU cannot sustain it.
- **NEVER:** Name a worktree or branch after an agent (`agent-3-tuesday`). Name it after the feature (`feat/auth-refactor`).
- **NEVER:** Rebase parallel worktrees onto each other mid-run. Let them finish on the shared base.
- **NEVER:** Merge without running `code-reviewer` (and `security-review` for sensitive changes) per worktree.
- **NEVER:** Leave worktrees alive > 1 day without a rationale logged in `memory/07-decisions-log.md`.
- **NEVER:** Introduce Docker Compose "just in case". Add it only when a concrete runtime collision appears.
- **NEVER:** Use `/best-of-n` as a default pattern. It is expensive — reserve for critical quality calls.
- **NEVER:** Forget to run `worktree-cleanup` after merge. Orphan worktrees eat disk and clutter `git worktree list`.
- **NEVER:** Dispatch multiple implementer subagents inside the same worktree. One worktree = one active workflow.
