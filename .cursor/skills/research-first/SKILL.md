---
name: research-first
description: Forces verification of external knowledge (libraries, frameworks, APIs, SDKs, cloud services, product benchmarks) before writing code, picking a stack, or making a technical decision. Use before importing or upgrading any dependency, before recommending a tool, before writing SDK-specific code, before picking between competing services, and whenever the agent's training data may be stale. Runs Context7 (MCP) for first-party docs, falls back to web search for recent blog posts, release notes, and community benchmarks, then writes a findings note under docs/architecture/research/<topic>.md and updates memory/07-decisions-log.md if the research settled a technical decision. Encoded as a rigid skill because guessing from training data is the single largest source of code hallucinations.
---

# Research First

## Goal

Make **"verify before you write"** the default behavior. Most hallucinations in LLM-generated code — wrong API signatures, deprecated config flags, imaginary package names — happen because the model guessed from training data instead of checking current sources. This skill converts that guess into a structured research step and writes down what was found so the next session does not re-research the same thing.

It also enforces the project's "best-for-vibecoding" stack policy: no stack, library, or service is picked on intuition; it is picked from evidence.

## When to use

**Always:**
- Before importing or upgrading any external library, framework, or SDK.
- Before writing code that calls a third-party API or CLI.
- Before recommending a tool, service, or hosting provider.
- Before picking between competing options (Postgres vs. MySQL, Clerk vs. Auth.js, Vercel vs. Railway, etc.).
- Before updating a dependency to a major version.
- Whenever the agent's training data could reasonably be stale (> 6 months old for fast-moving ecosystems).

**Trigger keywords:** "which library", "which service", "should we use", "how do I use", "API for", "latest version", "compare", "benchmark", "alternatives to", "best way to", "is X deprecated".

**Do NOT use for:**
- Pure business logic that does not depend on external behavior.
- Code that uses only the language's standard library.
- Trivial queries the agent genuinely already knows with high confidence (arithmetic, simple shell commands). Keep judgment here — default toward running the skill when in doubt.

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/02-tech-stack.mdc` (the project's stack and constraints)
3. `.cursor/rules/05-claude-mcp-integration.mdc` (MCPs available, especially Context7)
4. `memory/03-architecture.md` (what is already decided)
5. `memory/07-decisions-log.md` (have we already settled this? If yes, skip — do not re-research)
6. Any existing `docs/architecture/research/*.md` — previous research on the same topic should be updated in place, not duplicated.

**Also check the cross-project memory** (if it exists — see `.cursor/rules/05-claude-mcp-integration.mdc §Cross-project Memory Protocol`) **before running any external search**:

- `~/.mastermind/global/vendors.md` — if the vendor has a prior verdict across projects (good/avoid/with-caveats), surface it. A "Avoid" verdict does **not** veto — it reframes the research question as *"has anything changed since the verdict?"*.
- `~/.mastermind/global/stacks.md` — if the stack decision has been made on other projects with recorded outcomes, reference them.

**Code context efficiency:** When research touches how the current project uses a library or pattern (e.g. "how do we currently call Stripe here?"), prefer Code Intelligence MCP graph queries for symbols and call sites over broad file reads. This keeps token usage low during deep research sessions.

If the folder does not exist, skip silently. Never treat cross-project memory as veto — it is prior evidence, not law for this project.

## Process

### Step 1 — Frame the question

Write the research question explicitly, in one sentence. Good:

> *"Does Supabase RLS support per-column policies in Postgres 16, and if so, what is the current syntax and any known production caveats?"*

Bad:

> *"Research Supabase RLS."*

A vague question produces a vague answer. If the question is fuzzy, sharpen it with `doubt-surfacer` first.

### Step 2 — Define success criteria

State in the same note what "answered" looks like. For example:

- A cited version number and release date.
- A canonical code example from first-party docs.
- At least one independent source (blog, release notes, GitHub issue) confirming the behavior.
- Any known caveats, open issues, or breaking changes in the last 6 months.

### Step 3 — Source priority

Research in this strict order. Stop as soon as success criteria are met.

1. **Context7 MCP** — first-party documentation. This is the primary source because it is always current and indexes upstream docs directly. Query with the library/framework name plus the specific topic.
2. **Official release notes / changelog** — from the project's GitHub or website, for version-sensitive questions.
3. **Official GitHub issues / discussions** — for known bugs, workarounds, or pending features.
4. **Independent blog posts or benchmarks published in the last 6 months** — only via explicit web search, never from cached memory. State the publish date for every source.
5. **Community forums (Reddit, Discord, Stack Overflow)** — last resort, and only for sanity-checking anecdotal experience.

**Never cite:** the agent's training data alone ("I know that X..."), outdated Stack Overflow answers without date verification, or marketing pages without corroboration.

### Step 4 — Produce findings note

Write (or update) `docs/architecture/research/<topic-slug>.md` with this structure:

```markdown
# Research: <Question>

**Date:** YYYY-MM-DD
**Researcher:** User + <Model>
**Status:** Answered | Open | Superseded
**Decision-impact:** Which decision in `memory/07-decisions-log.md` this research informs (or will inform).

## Question

One-sentence restatement.

## TL;DR

The answer in 2–4 bullets with version numbers and dates.

## Evidence

### Source 1 — <title>
- URL:
- Publish date:
- Key quote / fact:
- Relevance:

### Source 2 — <title>
- URL:
- Publish date:
- Key quote / fact:
- Relevance:

(Minimum 2 sources for any non-trivial claim. One source is an anecdote, not evidence.)

## Caveats and known limitations

- <e.g. "Breaking change in v7 — migration required for existing users">
- <e.g. "Pricing changed on 2026-02-01; old free-tier limits no longer apply">

## Open questions

- <things the research could not fully resolve>

## Recommendation

If applicable, a named recommendation with rationale. If the research feeds an upcoming decision, phrase as:

> "Recommendation: <option A>. Rationale: <key evidence>. Risks: <named>. Next step: update `memory/07-decisions-log.md` after user approval."
```

### Step 5 — Verify against the project's constraints

Check the recommendation against `.cursor/rules/02-tech-stack.mdc`:

- Does the licensing fit (MIT/Apache acceptable; GPL flagged explicitly)?
- Does it satisfy any data-residency or compliance constraints?
- Does it fit the "best-for-vibecoding" criteria (speed of iteration, ecosystem maturity, AI-tooling support, deployment friction, cost)?

If any constraint is violated, downgrade the recommendation or propose an alternative.

### Step 6 — Log the decision if one is made

If the research settled a decision, append to `memory/07-decisions-log.md` using the canonical format (see `memory-updater` skill). Cross-reference the research note:

```markdown
### YYYY-MM-DD — <Decision title>
- **Decision:** Use <option A>.
- **Reason:** See `docs/architecture/research/<topic>.md` §Recommendation.
- **Alternatives considered:** <option B, C>.
- **Consequences:** …
- **Files affected:** `package.json`, `.cursor/rules/02-tech-stack.mdc`, `memory/03-architecture.md`.
```

If the research did **not** settle a decision (open questions remain), leave the decisions log untouched and update `memory/10-open-questions.md` instead.

### Step 7 — Invoke `memory-updater`

Persist:

- New or updated file under `docs/architecture/research/`.
- Decisions log entry (if any).
- Open questions entry (if any).

### Step 8 — Closing

Return to the caller (usually another skill or the user). Emit a **HIGH** Command Recommendation when `research-first` was invoked standalone; when it was invoked from inside another skill, just hand the TL;DR back and let the caller continue.

```markdown
"Research on <topic> complete. TL;DR: <2 bullets>. Full note at `docs/architecture/research/<slug>.md`.

---
**Next recommended command:** `/mm-plan <original-task-slug>`
**Why:** the research gates whatever code/architecture decision was blocked; the plan can now use the verified API signatures and caveats.
**Go ahead:** type `go` to resume the original task with the research findings baked in.
**Skip if:** the research revealed a blocker that needs a new decision first (run `/mm-doubt <topic>`)."
```

## Outputs

- `docs/architecture/research/<topic-slug>.md` — findings note with evidence, caveats, recommendation.
- New entry in `memory/07-decisions-log.md` **only** when a decision was made.
- New entry in `memory/10-open-questions.md` when the research surfaced strategic questions.

## Interactions with other skills

- **Invoked by:** `project-deep-audit` (for any claim about a library/competitor), `product-requirements` (for tool choices affecting scope), `architecture-mapper` (for every stack pick), `implementation-planner` (before using a library in code), `feature-breakdown` (if a feature depends on an external service), `bug-investigator` (when the bug hypothesis depends on library behavior).
- **Invokes:** `memory-updater` at close.
- **Pairs with:** `architecture-mapper` — research feeds architectural decisions with evidence.

## Completion checklist

- [ ] Research question written in one sentence.
- [ ] Success criteria stated before research started.
- [ ] Sources consulted in priority order (Context7 first).
- [ ] Findings note saved at `docs/architecture/research/<slug>.md`.
- [ ] At least 2 sources cited for any non-trivial claim, each with URL and publish date.
- [ ] Caveats and open questions listed.
- [ ] Constraint check against `.cursor/rules/02-tech-stack.mdc` done.
- [ ] Decision logged in `memory/07-decisions-log.md` if one was reached.
- [ ] `memory-updater` ran.

## Anti-patterns

- **Avoid:** Writing "According to the latest docs..." without citing a URL and date. That is a guess dressed as research.
- **Avoid:** Using a single source for a non-trivial claim. One source is an anecdote.
- **Avoid:** Citing a blog post from 2023 for a fast-moving ecosystem. State the publish date and assess freshness.
- **Avoid:** Writing "TL;DR" as a vague summary. The TL;DR must contain version numbers, dates, and the direct answer to the question.
- **Avoid:** Skipping Context7 and jumping to web search. Context7 is faster, first-party, and current.
- **Avoid:** Duplicating research notes. Update the existing file if one already covers the topic; mark superseded if obsolete.
- **Avoid:** Logging a decision in `memory/07-decisions-log.md` when the user has not approved it. Research produces recommendations; users produce decisions.
