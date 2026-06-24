---
name: approval-gatekeeper
description: Enforces the Human-in-the-Loop policy from .cursor/rules/04-safety-and-git.mdc. Use before any action that might touch authentication, authorization, payments, database schema, production deploys, long-running background jobs, destructive commands, new external dependencies, or any change estimated to take more than four hours. Classifies the action by sensitivity, applies the policy, and returns either AUTO_APPROVE, REQUIRE_HUMAN_APPROVAL, or BLOCK. Never lets a sensitive action proceed without explicit written approval from the user. Logs every approval decision to memory/07-decisions-log.md when the action proceeds.
---

# Approval Gatekeeper

## Goal

Stop the agent from executing **sensitive actions** without explicit human confirmation, while letting routine work flow without friction. This skill is the operational arm of the safety rules defined in `.cursor/rules/04-safety-and-git.mdc`. It turns policy into a decision the agent can run before every potentially risky step.

The goal is not to block the agent — it is to surface the cost/risk of a specific action and give the human a deliberate choice.

## When to use

**Always invoke the gatekeeper before:**
- Changes to authentication, session handling, RBAC / RLS / permissions.
- Changes to payment logic, billing, refunds, subscription state.
- Database schema changes, migrations, destructive queries.
- Production deploys, infra changes, DNS changes, CDN purges.
- Long-running background jobs (emails, webhooks, crawls).
- Installing a new external dependency.
- Destructive shell commands (`rm -rf`, `DROP`, `--force`).
- Any task whose estimated effort exceeds 4 hours.
- Any change touching files outside the scope of the current plan.

**Trigger keywords that should invoke it:** "migrate", "deploy", "drop", "delete production", "add dependency", "npm install", "pip install", "rm -rf", "force", "reset", "truncate", "wipe", "backfill".

**Do NOT use for:**
- Pure doc edits or memory updates.
- Code changes strictly within the approved plan and non-sensitive areas.
- Reading operations.
- Automatic skills-to-skills invocations that are part of a documented workflow.

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/04-safety-and-git.mdc` (canonical safety rules)
3. `.cursor/rules/06-execution-modes.mdc` (transitions need approvals too)
4. `.cursor/rules/07-subagent-orchestration.mdc` (subagent dispatches may be sensitive)
5. `memory/02-current-state.md` (what phase we are in — Launch has stricter policy than Discovery)
6. `memory/08-known-risks.md` (existing risks that this action might touch)
7. The current plan if any under `.cursor/plans/` — a pre-approved plan grants auto-approval for its scope.

## Process

### Step 1 — Identify the action

State in one sentence what the action is. Be specific:

- **Action:** "Run `ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false` on the production database."
- **Initiated by:** user / automated workflow / subagent
- **Scope:** file paths, services, systems affected
- **Reversibility:** instant revert / rollback migration / destructive

### Step 2 — Classify the action

Use this table. When an action falls under multiple categories, the **highest** category wins.

| Category | Examples | Default decision |
|---|---|---|
| **Trivial** | Doc edit, comment fix, log line, typo | AUTO_APPROVE |
| **Routine** | Bug fix within plan, small feature slice within plan, ≤ 2 files | AUTO_APPROVE (if inside approved plan) |
| **Moderate** | New component, refactor of 3–8 files, adding a UI route, adding a non-critical test | AUTO_APPROVE with summary + confirmation prompt |
| **Sensitive** | Auth, RBAC, payments, data mutations, new dependency, CI change | REQUIRE_HUMAN_APPROVAL |
| **High-impact** | Schema migration, production deploy, DNS, infra as code, destructive command | REQUIRE_HUMAN_APPROVAL + verification step |
| **Forbidden by policy** | Deleting user data without dry-run, commits directly to `main`, force-push shared branches, committing secrets | BLOCK |

### Step 3 — Apply phase-specific multipliers

Strictness scales with phase:

- **Idea / Discovery:** relaxed. Most actions auto-approve because there is little to break.
- **Definition:** normal.
- **MVP:** normal to strict. Migrations and auth changes must have a plan.
- **Iteration:** strict. Any change touching shipped flows needs approval.
- **Launch:** strictest. Default = REQUIRE_HUMAN_APPROVAL for anything touching production paths.

If the phase is unclear, default to the stricter side.

### Step 4 — Emit the decision

Always emit exactly one of these three outcomes, with reasoning:

```markdown
## Gatekeeper Decision

**Action:** <one sentence>
**Category:** <from Step 2>
**Phase:** <current phase>
**Decision:** AUTO_APPROVE | REQUIRE_HUMAN_APPROVAL | BLOCK

**Reasoning:** <1–3 sentences>

**What I will do next:**
- If AUTO_APPROVE → proceed, log at close.
- If REQUIRE_HUMAN_APPROVAL → present plan, wait for user 'approve' / 'confirm' / 'go'.
- If BLOCK → stop, surface the policy that blocks this action.
```

### Step 5 — If REQUIRE_HUMAN_APPROVAL: present the approval request

> **Optional premortem hook:** when the action's category is **High-impact** AND its reversibility is **Destructive — cannot undo** AND the project phase is `Iteration` or `Launch`, suggest running `/mm-premortem` against the action before presenting the Approval Request below. Wait for the user's `yes` / `skip` reply. Premortem is never auto-run — only offered. If the user accepts, the premortem's Hidden Assumption and Most Likely Failure are pasted into the **Risks if approved** section of the request.

Structure the request so the user can decide in 30 seconds:

```markdown
## Approval Request

**Doing:** <action in one sentence>

**Why:** <link to plan / slice / bug / decision>

**How (briefly):**
- <step 1>
- <step 2>

**Reversibility:** <Instant | Rollback migration | Destructive — cannot undo>

**What will change:**
- Files: <paths>
- Services: <names>
- Data: <entities, approximate row counts if relevant>

**Tests run:** <yes / no / planned>

**Alternatives considered:** <named, or "none other")

**Risks if approved:** <top 3>
**Risks if skipped:** <top 3>

**Approval needed from you. Reply with `approve`, `adjust`, or `block`.**
```

Wait for the user's reply. Do not proceed on silence.

### Step 6 — If BLOCK: stop and redirect

Name the policy that blocks the action. Do not rephrase the request in a way that tries to bypass the policy. Examples:

> *"Blocked by `.cursor/rules/04-safety-and-git.mdc §Safety Rules #2` — commits to `main` are not allowed. Create a `feat/<slug>` branch and open a PR instead."*

Offer a lawful path forward.

### Step 7 — Log the decision (on AUTO_APPROVE or on approved REQUIRE)

Add an entry to `memory/07-decisions-log.md`:

```markdown
### YYYY-MM-DD — Gate: <short action name>
- **Decision:** AUTO_APPROVE | APPROVED BY USER | APPROVED WITH CONDITIONS
- **Category:** <from Step 2>
- **Scope:** <files / services>
- **Reversibility:** <from Step 5>
- **Conditions (if any):** <what the user required>
- **Risks accepted:** <named>
```

BLOCK decisions are logged too (they are signals of policy friction to revisit later).

### Step 8 — Invoke `memory-updater` at close

When the action runs and finishes, standard closing procedure applies. `memory-updater` captures the session state.

## Outputs

- In-chat decision block (always) + approval request block (when needed).
- Entry in `memory/07-decisions-log.md` for every decision made (including BLOCK).
- **No code changes made by this skill.** It only gates; the actual execution is done by the caller (usually `implementation-planner` or `bug-investigator`).

## Interactions with other skills

- **Invoked by:** `implementation-planner` (before executing a plan step classified as sensitive), `bug-investigator` (before applying a schema migration as part of a fix), `architecture-mapper` (before adding a new third-party dependency), `phase-gate-reviewer` (gates are a class of approvals).
- **Invokes:** `memory-updater` to persist the decision.
- **Pairs with:** `security-review` — high-impact actions often need both a gate and a security review in the same PR.

## Completion checklist

- [ ] Action stated in one sentence.
- [ ] Classified per the table in Step 2.
- [ ] Phase multiplier applied.
- [ ] Decision emitted (exactly one of the three outcomes).
- [ ] If REQUIRE_HUMAN_APPROVAL: approval request presented with full context.
- [ ] If BLOCK: blocking policy named, lawful path proposed.
- [ ] Decision logged in `memory/07-decisions-log.md`.

## Anti-patterns

- **NEVER:** Downgrade a Sensitive action to AUTO_APPROVE because the user "usually approves this". Every sensitive action gets its explicit approval moment.
- **NEVER:** Batch multiple sensitive actions into one approval. Approve one, run it, verify, approve the next.
- **NEVER:** Reclassify a BLOCK as REQUIRE_HUMAN_APPROVAL because the user pressed harder. BLOCK means policy forbids; negotiate the policy in `memory/07-decisions-log.md`, not the specific action.
- **NEVER:** Skip logging an AUTO_APPROVE on a sensitive area because "it's small". Small changes to sensitive areas still deserve a paper trail.
- **NEVER:** Silently proceed on user silence. Silence = not approved.
- **NEVER:** Present an approval request with only the happy-case and no risks. Balance is the point.
- **NEVER:** Fire-and-forget on a destructive command. Destructive commands require verification after execution.
