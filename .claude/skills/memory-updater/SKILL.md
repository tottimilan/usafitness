---
name: memory-updater
description: Updates only the memory/ files affected by the work just completed, keeping signal density high. Use after finishing analysis, implementation, debugging, refactoring, planning, or any session where new facts, decisions, risks, or state changes emerged. Writes in the canonical formats defined in CLAUDE.md, never deletes history (superseded entries move to Archive sections), and ensures memory survives across sessions and model changes. Always runs as the finishing step of every non-trivial session; also invoked by other skills (project-deep-audit, implementation-planner, bug-investigator, code-reviewer) as their closing action. Commits memory changes separately from code changes.
---

# Memory Updater

## Goal

Keep `memory/` accurate, compact, and evergreen. Every important event — decision, risk, state change, architectural move, resolved doubt — must leave a trace. **No trace means the next session forgets and the next model loses context.** This skill is the second pillar of continuity, together with `CLAUDE.md`.

It is also the primary defense against "AI amnesia": the pattern where the agent solves the same problem twice because it did not write down the first solution.

## When to use

**Always:**
- At the end of every non-trivial session.
- After any decision that affects direction (stack, architecture, scope, pivot, dependency addition, feature kill).
- After bug fixes that changed the understanding of the system.
- After answering or asking questions that update `memory/12-open-doubts-and-questions.md`.
- Automatically, as the finishing step of other skills (`project-deep-audit`, `implementation-planner`, `bug-investigator`, `code-reviewer`, etc.).

**Trigger keywords:** "update memory", "persist", "record this", "remember this", "session summary", "close session", "end of task", "log this decision".

**Do NOT use for:**
- Trivial edits with no decision and no state change (typos, comment fixes, formatting).
- Read-only operations.
- Repeatedly during the same session — run once at the end, not after every micro-step.

## Prerequisites

Before updating, **read the current state of every file you will touch**. Never update blindly — you risk overwriting concurrent edits or duplicating entries.

Also verify the current date (use the system date, never guess). Wrong timestamps corrupt the timeline.

## Process

### Step 1 — Determine scope (what actually needs updating)

Map the work just completed to the files that should change. Use this table:

| What happened | Files to touch |
|---|---|
| Session ended with meaningful work | **Always:** `02-current-state.md`, `11-session-summary.md` |
| A decision was made | Append to `07-decisions-log.md` |
| A new risk emerged, was mitigated, or closed | Update `08-known-risks.md` |
| Architecture changed | Update `03-architecture.md` + consider creating an ADR in `docs/adr/` |
| Data model changed | Update `04-data-model.md` + note the migration |
| A user flow was added, modified, or removed | Update `05-user-flows.md` + detailed version in `docs/flows/` |
| A feature moved status (Planned → In progress → Shipped / Paused / Killed) | Update `06-feature-map.md` |
| Tests were added, removed, started failing, became flaky | Update `09-testing-status.md` |
| A strategic (long-lived) question arose | Update `10-open-questions.md` |
| An AI-to-user question was asked, answered, or deferred | Update `12-open-doubts-and-questions.md` |
| The project's stack or non-negotiables changed | Update `00-project-brief.md` |
| The long-term vision was adjusted | Update `01-product-vision.md` |
| **A phase transition was decided** (Idea → Discovery → Definition → Prototype → MVP → Iteration → Launch) | Append to `13-phase-history.md` + update `02-current-state.md` phase field + append decision to `07-decisions-log.md` |

**Rule:** if a file does not need to change, do not touch it. Silent drift is worse than no update. Over-updating kills signal.

### Step 2 — Apply canonical formats

**Decisions** — append to `07-decisions-log.md`, never rewrite past entries:

```markdown
### YYYY-MM-DD — <Decision title>
- **Decision:** <one sentence>
- **Reason:** <why now, why this>
- **Alternatives considered:** <at least one named alternative>
- **Consequences:** <what this enables, what it blocks>
- **Files affected:** <paths>
- **Supersedes:** <link to prior decision if this replaces it>
```

**Risks** — update the table in `08-known-risks.md` in place:
- Impact ∈ {Low, Medium, High, Critical}
- Likelihood ∈ {Low, Medium, High}
- Status ∈ {Open, Mitigated, Accepted, Closed}

**Session summary** — `11-session-summary.md` (**append mode is the default**):

Procedure:

1. Open `memory/11-session-summary.md`.
2. Copy the current `## Latest session` block (from its heading marker down to the `---` separator) and prepend it as the new topmost entry under `## Previous sessions`.
3. Overwrite the `## Latest session` block with the new session using this template:

```markdown
## Latest session

**Date:** YYYY-MM-DD
**Who worked:** User + <Model>
**Duration:** ~<minutes>

### What was done
### Decisions taken
_Link: `memory/07-decisions-log.md` — date(s) YYYY-MM-DD._
### New or mitigated risks
_Link: `memory/08-known-risks.md`._
### Current state
_Link: `memory/02-current-state.md`._
### Top 3 next priorities
1.
2.
3.
### Lessons learned (candidates for cross-project Memory Graph)
```

Never delete prior sessions. When the file exceeds ~20 sessions, move the oldest into `docs/archive/sessions-YYYY-QN.md` in a single `docs(memory): archive older sessions` commit.

**Current state** — `02-current-state.md`, replace in place (it's a one-page snapshot):

```markdown
**Last updated:** YYYY-MM-DD
**Phase:** Idea | Discovery | Definition | Prototype | MVP | Iteration | Launch

## What exists today
## What is in progress
## What is blocked
## What is next
```

**Feature map** — `06-feature-map.md`: update the status column only. Do not delete killed features; move them to the "Killed / deferred" table with date and reason.

### Step 3 — Never delete, always move

When an entry becomes stale:
- Mark it **superseded** with a link to the new decision.
- Move it to an "Archive" or "Resolved" section in the same file.
- Preserve the original timestamp.

History is signal for future decisions. Deleting the record of a failed approach is how the same mistake gets repeated.

### Step 4 — Verify no drift with code

Before committing memory updates, do a 60-second sanity check:

- Does `03-architecture.md` still match the actual directory structure and service list?
- Does `06-feature-map.md` match what is shipped in `main`?
- Does `09-testing-status.md` match the current CI state?
- Do the stack entries in `00-project-brief.md` match what `package.json` / `pyproject.toml` actually says?

If drift is found, resolve it in the same update — either the code is out of date (open a tracking task) or the memory is out of date (fix it now).

### Step 5 — Commit as its own change

Use a dedicated commit, never bundled with code:

```
docs(memory): update after <short description of the work>
```

This keeps `memory/` diffs reviewable independently. The only acceptable bundling is when a small code change and its memory note are tightly coupled and together fit in one atomic commit.

### Step 6 — Surface cross-project lessons

If a lesson applies beyond this project, flag it explicitly in the chat:

> **Lesson candidate for cross-project Memory Graph:** <lesson>

Keep the lesson short, context-free, and actionable (e.g. *"Supabase RLS policies must be tested with authenticated AND anonymous keys; CI should cover both"*).

**Do not promote the lesson from here.** Promotion to `~/.mastermind/global/` is the job of the [`continuous-learner`](../continuous-learner/SKILL.md) skill (or the `/mm-learn` command), which applies the 3-part test and asks the user to approve each entry before writing. This keeps the global memory small and signal-dense. The `memory-updater` only flags candidates; the `continuous-learner` decides.

## Outputs

- Updated `memory/*.md` files — only those that needed changes.
- A single `docs(memory): …` commit.
- Optional: a flagged lesson candidate for the cross-project Memory Graph.
- **No direct code changes.**

## Interactions with other skills

- **Invoked as the finishing step by:** `project-deep-audit`, `product-requirements`, `architecture-mapper`, `feature-breakdown`, `flow-analyzer`, `implementation-planner`, `test-strategist`, `security-review`, `bug-investigator`, `code-reviewer`, `research-first`, `phase-gate-reviewer`, `approval-gatekeeper`, `retroactive-documenter`, `prototype-designer`, `mockup-factory`.
- **Writes to `memory/14-design-system.md`** when the caller is `prototype-designer` or `mockup-factory` or when design tokens / installed components / patterns changed during the session. Per-entry approval pattern (same as `continuous-learner`). During `mockup-factory` freeze mode specifically, multiple sections of memory/14 get consolidated (§Tokens, §Installed components, §Custom components, §Patterns, §What I like, §What I don't like, §Changelog) — each proposed write is approved individually, never batched.
- **Invoked in limited scope by:** `doubt-surfacer` — but only to persist `memory/12-*`, never the full sweep.
- **Invokes:** none.
- **Pairs with:** `code-reviewer` — memory updates should be reviewed alongside code in the same PR.

## Completion checklist

- [ ] Scope determined (only affected files selected).
- [ ] Canonical formats used for decisions, risks, session summary.
- [ ] No historical entries deleted; superseded entries moved to Archive / Resolved sections.
- [ ] Drift check between memory and code performed and resolved.
- [ ] Timestamp is the real current date (not a placeholder or guessed value).
- [ ] Dedicated `docs(memory): …` commit created.
- [ ] Cross-project lessons flagged if any.

## Anti-patterns

- **Avoid:** Updating every memory file by reflex "just in case". Signal dies, agents learn to ignore the folder.
- **Avoid:** Rewriting past decisions in place instead of superseding them. History is a feature, not noise.
- **Avoid:** Bundling memory changes with a 1000-line code diff — the memory note is invisible in the review.
- **Avoid:** Saying "memory updated" in chat without actually running the update.
- **Avoid:** Copy-pasting the session summary into the decisions log — they have different formats on purpose.
- **Avoid:** Skipping the drift check — drifted memory is worse than no memory because it lies with confidence.
- **Avoid:** Using placeholder dates (`YYYY-MM-DD`) in committed entries. Always the real date.
