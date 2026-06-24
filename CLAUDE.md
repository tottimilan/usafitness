# CLAUDE.md — Project Operating System Kernel (MASTERMIND 2.0)

> This is the kernel of the project. It is short on purpose. High signal, no noise.
> It applies to both **Cursor** and **Claude Desktop** (and any other agent reading this repo).

---

## Mission

Build high-quality, maintainable, and secure software with the minimum number of unnecessary iterations.
The repository structure is the real intelligence. Questions and doubts surface clarity. Every change must be traceable to a clear need.

---

## Mental Model

- **Structure over prompts.** The `memory/`, `docs/`, `.cursor/` and `.claude/` folders are the brain. A prompt is just a query over that brain.
- **Continuity over cleverness.** Nothing important lives only in chat. If it matters, it lives in `memory/` and is versioned in Git.
- **Clarity before code.** Doubts and questions always come before implementation.
- **Surgical over sweeping.** Smallest change that meets the goal.

---

## Core Execution Rules (Non-Negotiable)

### 1. Karpathy Principles (always active)

Full text in `.cursor/rules/01-karpathy-principles.mdc`. Summary:

1. **Think Before Coding** — State assumptions. If uncertain, ask. Present trade-offs. Don't pick silently.
2. **Simplicity First** — Minimum code that solves the problem. No speculative abstractions.
3. **Surgical Changes** — Touch only what you must. Every changed line traces directly to the user request.
4. **Goal-Driven Execution** — Define success criteria. Loop until verified.

### 2. Question & Doubt Protocol (critical for this user)

Before proposing any change, document, or implementation:

- Always list **all current doubts** (technical, business, UX, risk, assumptions).
- Generate **8–20 high-quality questions** for the user, grouped by category.
- Present doubts + questions **before** any final output.
- Update `memory/12-open-doubts-and-questions.md`.
- End with: *"Do you have any doubts, observations, or additional notes before we continue?"*

This rule is at the same level as the Karpathy principles. It is never optional.

### 3. Self-Review Protocol (before any substantive output)

Before delivering any non-trivial document, plan, code change, or analysis, perform a 30-second self-critique on three axes:

1. **Assumptions that could be false.** Which assumption is the output most dependent on, and how would the output change if it were wrong?
2. **Weakest part of the output.** Which section is least rigorous, most speculative, or most likely to be wrong? Name it.
3. **Risk not mentioned.** What risk, edge case, or constraint was omitted, and why?

Write the self-critique as 2–5 bullets at the bottom of the output **only when the skill does not already enforce an equivalent step**. Skills that satisfy this requirement automatically: `implementation-planner` Step 4 (Self-review), `code-reviewer` (Categorize findings + Verdict), `project-deep-audit` (Hard Truth), `research-first` (Caveats + Open questions), `flow-analyzer` (Error paths + Edge cases), `security-review` (Accepted risks + Compensating controls).

Never produce a numeric quality score. Self-critique is qualitative — numeric scores become performative.

### 4. Context Discipline

- **Invoke skills** instead of inlining their process into the prompt. Skills load on demand (progressive disclosure) and keep the system prompt lean.
- Use **Context7 MCP** for any library or API behavior — never restate it from training data.
- Keep chat responses scannable: short paragraphs, explicit headers, fenced code for anything literal (paths, commands, schema).
- Prefer **referencing** an existing file (`memory/…`, `docs/…`) over rewriting its content.
- When answering inside a session with many long tool outputs, summarize older content compactly before continuing rather than carrying the raw output forward.

### 5. Command Recommendation Protocol

At the end of any non-trivial output, recommend the next `/mm-*` command when one fits naturally. The agent assigns a **confidence level** to the recommendation and formats accordingly. This makes the system operable for new users and prevents drift between sessions.

**HIGH — one command clearly applies.** Use when the current output has a single natural next step (e.g. a plan is ready → execute it; a review verdict is Ready → merge; a phase gate passed → the per-phase handoff command).

```markdown
---
**Next recommended command:** `/mm-<name> [args]`
**Why:** <1–2 sentences tying the recommendation to what was just produced>
**Go ahead:** type `go` and I'll proceed as if you ran it, or run it yourself.
**Skip if:** <one condition under which you'd ignore this>
```

**MEDIUM — two or more commands are plausible.** Use when the output opens several reasonable next steps and the agent should not decide for the user.

```markdown
---
**Possible next commands (pick one):**
a) `/mm-<X> [args]` — if <condition A>.
b) `/mm-<Y> [args]` — if <condition B>.
c) Nothing yet — if <condition C, e.g. "you want to keep exploring">.
**Which?** reply `a`, `b`, or `c`.
```

**LOW — no command fits, or context is ambiguous.** Use in pure Coach exploration, clarifying questions, or when forcing a command would be dishonest.

```markdown
---
I don't have a clear next-command recommendation here — we're either exploring
or the next step depends on a decision you haven't made yet. Tell me the
direction and I'll resume with a sensible `/mm-*`.
```

**Rules that prevent abuse:**
- **Never auto-execute.** The agent never runs a command without the user's `go` or the user running it themselves. Recommendations are recommendations.
- **Never spam.** Skip the block for trivial answers, clarifying questions, and pure Coach conversations that are still in discovery.
- **Never downgrade HIGH to auto-skip.** If HIGH fits, show it — even if the user will probably ignore it once.
- **Always name the cost of skipping.** The "Skip if" line must be honest, not a formality.
- **The protocol does not replace doubt-surfacer.** If the context needs the Question Protocol, run that first; the command recommendation comes after.

Full rule including when the agent should auto-downgrade HIGH → MEDIUM lives at `.cursor/hooks/post-output.suggest-command.md`.

### 6. General Rules

- Every non-trivial task → use **Plan Mode** first (Cursor) or an explicit written plan (Claude).
- For recurring operations, prefer invoking a **workflow** (`.claude/workflows/`) or a **slash command** (`.claude/commands/mm-*`) instead of chaining skills manually. `/mm-ship`, `/mm-bug`, `/mm-gate`, `/mm-retro` are the most used.
- Every important session → update `memory/11-session-summary.md` (append mode — see `memory-updater`) and `memory/12-open-doubts-and-questions.md`.
- For deep analysis, strategy, or high-stakes decisions → prefer **Claude Opus** (via Claude Desktop or an MCP bridge).
- Use **Context7** automatically whenever code uses an external library or API.
- Use **Playwright MCP** only for real browser verification of critical flows, with a very specific prompt.
- Never commit secrets. `.env*` files are gitignored by default.
- For the skill interaction map (who calls whom), see `OPERATING-GUIDE.md §7.2` (the canonical coordination graph).

---

## Memory Architecture (the brain — full map in `OPERATING-GUIDE.md`)

- `CLAUDE.md` (this file) → **kernel**. `memory/` → long-term project intelligence (15 files `00`–`14`; `11` append-mode, `13` phase history). `docs/` → source of truth (product, architecture, flows, testing, security, ADRs).
- `.cursor/rules/*.mdc` → instructions. Always-on: `00`, `01`, `04` (safety), `06` (modes). The rest (`02`, `03`, `05`, `07`, `08`) load on demand via `globs`/`description`.
- `.cursor/skills/*/SKILL.md` → **canonical** reusable playbooks (26: 17 System 1 + 9 System 2), loaded on demand. `.claude/skills/` is a generated mirror — never edit directly; run `scripts/sync-skills` after editing source.
- `.claude/workflows/*.md` (7 recipes) · `.claude/commands/mm-*.md` (17 slash commands) → ergonomics. See their `README.md`.
- `.template-meta/` → **gitignored** author-only working dir (template's own memory/plans). Ignore if you cloned MASTERMIND for a project.
- `scripts/` → automation (sync-skills, phase-gate-check, render-phase-criteria, worktree-spawn/cleanup, log-dispatch, template-audit, init-global-memory, install-*, sync-from-template, onboard-existing-project, export-design-md). Each is self-documented in its header; the operator cheatsheet lives in `OPERATING-GUIDE.md`.
- `.cursor/hooks/` + `.claude/hooks/` → behavioral hook instruction files (kill-switches via `MM_HOOK_*`). Optional local `CLAUDE.md` in risky modules overrides this kernel for that subtree.

---

## Model Routing

Use the cheapest model that fits: **Opus-class** for deep analysis/strategy/long-form; **daily coding** on a fast capable model (GPT-5.5 / Sonnet/Opus by task); **Context7 MCP** for library/API verification; **Playwright MCP** for UI verification. Per-role routing for subagents: `.cursor/rules/07-subagent-orchestration.mdc`.

---

## Golden Rule

**Doubts and Questions first → Clarity → Documents and Code after.**

If this rule is ever skipped, the agent has failed the protocol.
