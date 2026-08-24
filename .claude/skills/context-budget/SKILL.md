---
name: context-budget
description: Active management of the agent's own context window so output quality does not degrade across long sessions, with zero dependencies. Codifies when to compact (summarize the session and drop raw history at roughly 70% of the usable window), how to clear stale tool results (large file reads, long command output, superseded search results) once their facts are captured, and the rule that anything important is persisted to memory/ or docs/ BEFORE compacting so nothing of value lives only in chat. Use whenever a session is long or multi-step, after large tool outputs accumulate, before starting a new sub-task in an already-long session, or when the user says "compact", "context is getting full", "summarize and continue", "manage context", "context budget". Markdown on disk stays the source of truth; the live context is a disposable working set.
---

# Context Budget

## Goal

Keep the agent effective deep into a long session. As a context window fills with raw tool output and old reasoning, models degrade (recall drops, instructions get lost, cost rises). This skill manages the **live context as a disposable working set** over the canonical Markdown on disk: capture what matters into `memory/`/`docs/`, then shed the raw bulk.

The discipline is the operational form of two kernel principles: *Continuity over cleverness* (nothing important lives only in chat) and *Context Discipline* (`CLAUDE.md §4`).

## When to use

**Proactively:**
- Any session expected to exceed a dozen substantial tool calls or that has ingested several large files/outputs.
- Before starting a new sub-task inside an already-long session (compact the finished sub-task first).
- When you notice yourself re-reading things already in context, or losing track of earlier instructions.

**On request / trigger keywords:** "compact", "context is full", "summarize and continue", "manage context", "context budget", "free up context".

**Do NOT use for:**
- Short, single-purpose sessions — compaction overhead is not worth it.
- Avoiding writing to `memory/` — compaction is *not* a substitute for persistence; persist first, then compact.

## Core thresholds (heuristics, not hard limits)

- **~70% of the usable window -> compact.** Don't wait for the hard limit; quality degrades well before 100%, and a forced truncation loses the most recent (often most relevant) context.
- **Single tool result > ~10% of the window -> clear it after extracting facts.** A 2,000-line file read or a long log dump should not ride along for the rest of the session once you've taken what you need.
- **Effective window is per-model.** Note the active model's *effective* working window (often smaller than the advertised max) in `memory/02-current-state.md` guidance and budget against that, not the headline number.

## Process

### Step 1 — Persist before you prune
Before discarding anything, write the durable facts to disk: decisions -> `memory/07-decisions-log.md`, state -> `memory/02-current-state.md`, open questions -> `memory/12-open-doubts-and-questions.md`, session progress -> `memory/11-session-summary.md` (via `memory-updater`). **If it isn't on disk, it isn't safe to drop.**

### Step 2 — Compact the narrative
Replace the older turn-by-turn history with a tight summary: the goal, decisions made, what's done, what's pending, and the exact next action. Keep file paths, identifiers, commands, and acceptance criteria verbatim — those are expensive to reconstruct. Drop exploratory dead-ends and superseded reasoning.

### Step 3 — Clear stale tool results
Once their facts are captured, release the bulk: full file contents already summarized, long command/test output whose verdict you've recorded, search results already acted on, screenshots already described. Keep a one-line pointer ("read `src/auth/session.ts` lines 40-120 — handles refresh") instead of the raw payload.

### Step 4 — Keep the guardrails resident
Never compact away: the active task's acceptance criteria, safety constraints, the Question & Doubt Protocol obligations, and any unresolved user instruction. Shedding context must never shed a requirement or a guardrail.

### Step 5 — Resume from disk
After compacting, continue from the on-disk state. If a dropped detail is needed again, re-read it from the file (cheap, deterministic) rather than fearing its loss — that is exactly why Step 1 persisted it.

## Outputs

- An updated `memory/11-session-summary.md` (and any other touched `memory/` file) reflecting state *before* pruning.
- A compacted live context: summary + pointers in place of raw bulk.
- No new files unless a long-lived note warrants one under `docs/`.

## Interactions with other skills

- **Pairs with:** `memory-updater` (the persistence mechanism Step 1 relies on) — invoke it before compacting.
- **Reinforces:** the markdown-first norm in `.cursor/rules/05-claude-mcp-integration.mdc` (disk is canonical; live context is disposable).
- **Relevant during:** any long `implementation-planner` execution, `parallel-executor` coordination, or `project-deep-audit` (all ingest large context).

## Completion checklist

- [ ] Durable facts written to `memory/`/`docs/` before any pruning.
- [ ] Narrative compacted to goal + decisions + done + pending + next action.
- [ ] Stale large tool results replaced with one-line pointers.
- [ ] Acceptance criteria, safety, and open instructions kept resident.
- [ ] Session resumes from on-disk state, not from memory of dropped context.

## Anti-patterns

- **NEVER:** Compact before persisting. Summarizing away an un-recorded decision loses it permanently.
- **NEVER:** Drop the active task's acceptance criteria or a safety constraint to save tokens.
- **NEVER:** Paraphrase file paths, identifiers, or commands when compacting — copy them verbatim.
- **NEVER:** Treat compaction as optional in a session that has clearly degraded ("it's still answering"). Degradation is silent until it isn't.
- **NEVER:** Use a semantic index to "remember everything" instead of compacting — the index is an optional accelerator, not a license to let the live context sprawl (see rule 05).
- When Code Intelligence MCP is available, use graph queries to avoid loading large code files into context in the first place — prevention > compaction.
