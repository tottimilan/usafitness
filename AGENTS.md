# AGENTS.md

This file is read by OpenAI Codex, Cursor agents, Claude Desktop, and any agent that supports the `AGENTS.md` convention.

**The canonical contract is [`CLAUDE.md`](CLAUDE.md)** — read it first and follow it in full. This file only restates the minimum so non-Cursor agents don't miss it. To avoid drift, concepts are defined once in `CLAUDE.md`, not duplicated here.

## Required startup context

Before any task, read in order: `CLAUDE.md` → `memory/00-project-brief.md` → `memory/02-current-state.md` → `memory/07-decisions-log.md` → `memory/11-session-summary.md` → `memory/12-open-doubts-and-questions.md`. For larger tasks also read `memory/03-architecture.md` / `05-user-flows.md` / `04-data-model.md` as relevant.

## Non-negotiables (full text in `CLAUDE.md`)

- **Golden Rule:** Doubts & Questions first → Clarity → Documents & Code after. Apply the Question & Doubt Protocol before any significant output instead of guessing.
- **Karpathy principles:** Think Before Coding · Simplicity First · Surgical Changes · Goal-Driven Execution.
- **Safety:** never commit secrets or `.env*`; never run destructive commands (`rm -rf`, `DROP`, `--force`, prod deploys) without explicit in-chat confirmation; never change auth/payments/schema without a plan + test + approval; never add dependencies without justifying the trade-off.
- **Output:** be direct, state assumptions, prefer small reversible steps, update `memory/` after meaningful work.
