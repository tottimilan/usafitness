# Workflows

Workflows are **ordered recipes** that chain skills, rules, and scripts into end-to-end operations. They are the highest-level abstraction in MASTERMIND 2.0: when you invoke a workflow, it dictates which mode the agent is in, which skills run, which artifacts are produced, and how the session closes.

Each workflow is a single markdown file with a consistent structure. They are consumed by both **Claude Code** (as part of the agent's loaded context) and **Cursor** (the agent reads them on demand).

## Currently available

| # | File | Purpose | Typical duration | Applicable phases |
|---|---|---|---|---|
| 01 | [`01-new-project-bootstrap.md`](01-new-project-bootstrap.md) | Empty clone → Discovery-complete. Brief, doubts, audit, phase transition. | 60–120 min | Idea, Discovery |
| 02 | [`02-feature-lifecycle.md`](02-feature-lifecycle.md) | Approved epic → merged, tested, reviewed feature. Chains breakdown + plan + dispatch + review + merge. | Hours to days | MVP, Iteration |
| 03 | [`03-bug-triage.md`](03-bug-triage.md) | Bug report → reproduced → surgical fix → regression test → merge → post-mortem → optional lesson promotion. | 30 min to hours | MVP, Iteration, Launch |
| 04 | [`04-phase-gate-transition.md`](04-phase-gate-transition.md) | Ceremony to move the project from phase N to phase N+1. Wraps `phase-gate-reviewer`. | 30–60 min (plus remediation) | Idea → Launch |
| 05 | [`05-weekly-retrospective.md`](05-weekly-retrospective.md) | Weekly review of work, risks, drift, flaky tests, and lessons. Keeps memory alive. | 20–40 min | MVP, Iteration, Launch |
| 06 | [`06-onboard-existing-project.md`](06-onboard-existing-project.md) | Install MASTERMIND shell into an existing project + retroactive memory seed + strategic audit + phase confirmation. | 45–90 min | Any (matches whatever phase the project is really in) |
| 07 | [`07-full-app-prototyping.md`](07-full-app-prototyping.md) | Iterative full-app mockup (v1 → vN → freeze) between Definition and MVP. UI projects only; non-UI projects skip the Prototype phase. | 1–3 weeks (iteration-driven) | Prototype |

## Workflow file format

All workflows share this shape:

```markdown
---
name: <kebab-case name>
description: <one-line summary>
triggers: ["keyword", "keyword"]
estimated_duration: "<range>"
applicable_phases: [Idea, Discovery, ...]
---

# Workflow NN — <Human name>

## Purpose
## Preconditions
## Phases (ordered sequence of steps)
### Phase N — <name>
- Skill: <name or "(script / manual)">
- Mode: Coach | Executor | Auditor
- Input: ...
- Steps: ...
- Exit criterion: ...
## Artifacts produced
## Exit criteria (workflow complete)
## Invocation (natural language + optional slash command)
## Anti-patterns
```

## How to invoke

**Natural language:**

> *"Run `.claude/workflows/02-feature-lifecycle.md` for epic `auth-mvp`."*

**Slash command** (when a `/mm-*` command wraps the workflow — see `.claude/commands/`):

> `/mm-ship auth-mvp`

Both paths end up loading the workflow file and running its phases.

## Workflow vs. skill

- **Skills** are atomic capabilities (single responsibility, reusable, invoked one at a time).
- **Workflows** are compositions of skills with explicit sequencing, exit criteria, and handoffs.

A skill knows *how to do one thing well*. A workflow knows *which skills to run in which order, and what "done" looks like* for the whole operation.

## Authoring a new workflow

1. Pick a recurring operation that has been done manually at least three times.
2. Draft the phases with Skill + Mode + Input + Steps + Exit criterion.
3. Identify preconditions (phase? approved artifacts? branch state?).
4. Write anti-patterns observed during the manual runs.
5. Ship it in this folder as `NN-<slug>.md` (increment NN).
6. Add a row to the table above.
7. Optionally wrap it with a slash command under `.claude/commands/`.
8. Log the addition in `memory/07-decisions-log.md`.
9. Mention the new workflow in `README.md` top-level if it's meant to be a primary entry point.

## Anti-patterns (for authoring workflows)

- **NEVER:** Write a workflow that is just a single skill with a wrapper. That is a slash command, not a workflow.
- **NEVER:** Make a workflow so rigid it cannot skip irrelevant phases. Mark optional phases explicitly as "conditional".
- **NEVER:** Duplicate skill content into a workflow. Workflows reference skills; they do not copy their processes.
- **NEVER:** Forget the "Exit criteria (workflow complete)" checklist. Without exit criteria, the workflow cannot end cleanly.
- **NEVER:** Write workflows for operations that happen < 3 times per year. Lower frequency → just run the skills manually.
