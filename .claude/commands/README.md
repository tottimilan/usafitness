# Slash commands

Custom slash commands for Claude Code (`.claude/commands/`). Each file is a short prompt that wraps a skill or a workflow, so invoking `/mm-<name>` in chat runs the correct pipeline without the user having to remember skill names, workflow paths, or argument structure.

**Claude power tip:** For heavy multi-agent work (audits, plans, feature lifecycle), configure an optional Code Intelligence MCP (tree-sitter: jCodeMunch, code-review-graph or similar). Agents query symbols/callers/impact first — massive token savings in Claude sessions. See CLAUDE.md §Code Context Layer. Guidance pre-seeded in workflows 02/05 and many skills. Adoption: add to your mcp config (see claude-side/mcp-config.json example); the layer is optional and degrades gracefully to raw reads.

**In Cursor**, Cursor does not yet support `/`-prefixed commands the same way Claude Code does. Use them by reference: *"Run the command `.claude/commands/mm-ship.md` with argument `auth-mvp`"* — Cursor's agent reads the file and executes it.

## Currently available

| Command | Wraps | One-line |
|---|---|---|
| [`/mm-bootstrap`](mm-bootstrap.md) | Workflow `01-new-project-bootstrap` | Empty clone → Discovery-complete |
| [`/mm-audit`](mm-audit.md) | Skill `project-deep-audit` | Multi-angle audit with Hard Truth |
| [`/mm-plan`](mm-plan.md) | Skill `implementation-planner` | TDD plan for a slice or task |
| [`/mm-premortem`](mm-premortem.md) | Skill `premortem` | Klein-method failure-narrative for irreversible/high-cost decisions |
| [`/mm-ship`](mm-ship.md) | Workflow `02-feature-lifecycle` | Epic → merged, reviewed feature |
| [`/mm-bug`](mm-bug.md) | Workflow `03-bug-triage` | Bug report → fix with regression test |
| [`/mm-doubt`](mm-doubt.md) | Skill `doubt-surfacer` | Force the Question & Doubt Protocol |
| [`/mm-next`](mm-next.md) | `task-master-ai` or plan file | Show the next task to work on |
| [`/mm-review`](mm-review.md) | Skills `code-reviewer` + `security-review` | Review current branch or specified diff |
| [`/mm-gate`](mm-gate.md) | Workflow `04-phase-gate-transition` | Advance the project phase |
| [`/mm-retro`](mm-retro.md) | Workflow `05-weekly-retrospective` | Weekly review with lesson promotion |
| [`/mm-onboard`](mm-onboard.md) | Workflow `06-onboard-existing-project` + skill `retroactive-documenter` | Integrate an existing project into MASTERMIND |
| [`/mm-design`](mm-design.md) | Skill `prototype-designer` | Prototype a single feature via Claude Design + shadcn/ui (during MVP / Iteration) |
| [`/mm-mockup`](mm-mockup.md) | Skill `mockup-factory` + workflow `07-full-app-prototyping` | Full-app iterative mockup (v1 → vN → freeze) during Prototype phase. Modes: create, iterate, feedback, freeze, status |
| [`/mm-template-audit`](mm-template-audit.md) | Script `template-audit` | Meta-audit: template counts/criteria/mirror/visibility match reality |
| [`/mm-qa`](mm-qa.md) | Composition (template-audit + skill lint + sweep) | Holistic system QA: size, overlap, cruft, gaps, harness re-audit |

All commands share the `mm-` prefix to group them visually and avoid collisions with upstream Claude commands.

## Command file format

```markdown
---
description: <one-line summary for discovery>
---

# /<command-name>

Arguments: $ARGUMENTS (describe expected format)

<natural-language instructions describing:
 - which skill or workflow to invoke
 - which context to load before starting
 - the exact sequence of steps
 - prerequisites and common failure modes>
```

Claude Code interprets `$ARGUMENTS` as the user's input after the command name (e.g. `/mm-ship auth-mvp` → `$ARGUMENTS = "auth-mvp"`).

## Authoring a new command

1. The command should wrap either **one skill** (shortcut), **one workflow** (pipeline), or **one specific MCP tool** (e.g. `task-master next`).
2. Name it `mm-<verb>.md` where `<verb>` is short and imperative.
3. Write the description as if it were a skill's description — it is the discovery mechanism.
4. Keep the body short; Claude loads it every time the command is used.
5. Add a row to the table above.
6. Log the addition in `memory/07-decisions-log.md`.

## Anti-patterns

- **NEVER:** Duplicate skill content into a command. Commands should invoke skills, not re-implement them.
- **NEVER:** Write a command that takes > 3 arguments. If it needs that many, it should be a workflow.
- **NEVER:** Use commands to hide a policy decision. A command should surface the decision to the user, not suppress it.
- **NEVER:** Write a command that runs > 1 skill without going through a workflow. Multi-skill pipelines belong in `.claude/workflows/`.
