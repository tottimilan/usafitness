---
name: continuous-learner
description: Scans recent session summaries, decisions, risks, and bug post-mortems for candidate cross-project lessons and promotes the qualifying ones to ~/.mastermind/global/ (lessons.md, patterns.md, pitfalls.md, stacks.md, vendors.md). Use at the end of a phase, at the weekly retrospective, after a post-mortem worth generalizing, or when the user says "promote lessons", "update global memory", "learn from this week", "mm-learn". Applies the canonical 3-part test (project-agnostic, evidence-backed, actionable) to every candidate. Strips project-specific nouns before writing. Drafts entries in the canonical format per target file. Always presents drafts to the user for explicit approval before writing. Commits each promotion as a dedicated commit in the global memory repo.
---

# Continuous Learner

## Goal

Close the loop between **project-specific learning** and **cross-project memory**. Each project generates lessons, patterns, pitfalls, stack outcomes, and vendor verdicts; without an explicit promotion mechanism, that knowledge stays trapped per project and gets re-discovered in the next one.

This skill is the promoter. It reads recent per-project material, identifies which items generalize, applies the 3-part test defined in `.cursor/rules/05-claude-mcp-integration.mdc §Cross-project Memory Protocol`, strips project-specific nouns, drafts entries in the canonical format of each target file, and — on user approval — writes and commits them in `~/.mastermind/global/`.

The skill is intentionally conservative: most project findings do **not** qualify. Running it regularly keeps the global memory small, signal-dense, and authoritative, rather than a dumping ground.

## When to use

**Always:**
- During the weekly retrospective (phase 5 of `05-weekly-retrospective`).
- At the end of a phase, as part of `04-phase-gate-transition` (phase 6 optional step).
- After publishing a post-mortem under `docs/bugs/` that mentions cross-project relevance.
- When the user explicitly asks: *"promote lessons"*, *"update global memory"*, *"what did I learn"*.

**Trigger keywords:** "promote lessons", "global memory", "cross-project learn", "mm-learn", "update global", "learn from this".

**Do NOT use for:**
- Per-project project-specific decisions. Those belong in `memory/07-decisions-log.md` and stay there.
- Emotional or opinion-based retrospectives. Lessons must be actionable.
- Every session. The skill reads a window (default 7 days) and is not a per-task reflex.
- Writing to the global memory without user approval. The user approves each promotion individually.

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/05-claude-mcp-integration.mdc` (the Cross-project Memory Protocol is the canonical source of rules)
3. `~/.mastermind/global/README.md` (to know the target files and formats)
4. `memory/11-session-summary.md` (the input — sessions in the window)
5. `memory/07-decisions-log.md` (decisions in the window)
6. `memory/08-known-risks.md` (risks moved or closed in the window)
7. `docs/bugs/*.md` (post-mortems recent enough to have cross-project value)

If `~/.mastermind/global/` does not exist, stop and instruct the user to initialize it (the bootstrap was done in System 2 Sub-phase 2.1; see `.cursor/rules/05-claude-mcp-integration.mdc §Cross-project Memory Protocol`).

## Process

### Step 1 — Define the window

Default: last 7 days. Override via argument (e.g. "last 30 days", "since 2026-04-01", "since last gate"). State the window at the top of the output.

### Step 2 — Collect candidate material

Scan within the window:

- **Session summaries** — every `### Lessons learned (candidates for cross-project Memory Graph)` bullet inside `memory/11-session-summary.md` entries.
- **Decisions log** — entries in `memory/07-decisions-log.md` that include a reusable insight (e.g. "chose X over Y because reason Z generalizes").
- **Risks** — closed or mitigated risks whose cause is pattern-level, not project-specific.
- **Post-mortems** — `docs/bugs/YYYY-MM-DD-*.md` with a "Lessons learned" section referencing things beyond this project.

Emit the raw candidates list in chat (title + source path). This is not yet the promotion list.

### Step 3 — Classify each candidate

For each candidate, decide the **target file**:

| Candidate shape | Target file |
|---|---|
| "This worked / failed because X" | `~/.mastermind/global/lessons.md` |
| "This pattern solves Y; conditions Z apply" | `~/.mastermind/global/patterns.md` |
| "This failure mode appears repeatedly" | `~/.mastermind/global/pitfalls.md` |
| "This stack choice had outcome W after 3 months" | `~/.mastermind/global/stacks.md` |
| "This vendor performed as …" | `~/.mastermind/global/vendors.md` |

Candidates that fit more than one file go to the primary one; add a cross-reference link from the others.

### Step 4 — Apply the 3-part test

Each candidate must pass **all three** gates. Fail any → do not promote, log the reason.

1. **Project-agnostic.** Strip project-specific nouns. Does the lesson still read as useful and true? Example: replace "Project Acme's Supabase auth" with "Supabase auth in a B2C SaaS with social logins".
2. **Evidence-backed.** Is there at least one concrete reference (post-mortem, decision entry, retrospective) that the lesson derives from? Citation is mandatory.
3. **Actionable.** Does the lesson change a future decision? "Users care about X" is not actionable. "When pricing multi-tenant, default to per-seat unless usage is strongly bimodal" is actionable.

Produce a structured table in the output:

```markdown
| Candidate | Target file | Project-agnostic | Evidence | Actionable | Verdict |
|---|---|---|---|---|---|
| "Supabase RLS needs auth + anon tests" | pitfalls.md | yes | docs/bugs/2026-04-10-rls-miss.md | yes | PROMOTE |
| "This dashboard is nice" | (none) | no | - | no | SKIP |
```

### Step 5 — Draft the entries

For each `PROMOTE` candidate, draft the entry in the canonical format of the target file (see templates in `~/.mastermind/global/<file>.md`). Use neutral references — never client names, project names, PII, or confidential identifiers.

Example draft for `pitfalls.md`:

```markdown
### Supabase RLS policies must be tested with both authenticated and anonymous keys
- **Symptom:** dashboards query "correctly" during local dev but leak or over-block in production under different auth contexts.
- **Trigger:** RLS policy written + tested only with service-role or only with anon key.
- **Cost:** hours of incident response + potential data exposure to ex-users or cross-tenant.
- **Evidence:** 1 post-mortem (project A, 2026-04-10); observed in 2 other projects per retrospective notes.
- **Prevention:** CI step runs each RLS-governed query against at least three key types: authenticated user in-tenant, authenticated user cross-tenant (must deny), anon (must deny or return public subset).
- **Recovery:** if exposure happened, treat as incident — notify affected, rotate any tokens present in leaked rows.
- **Seen in N projects:** 3
```

### Step 6 — Present drafts to the user

Show **all drafts together** in chat, each one clearly labelled with its target file and citation links. Ask the user to respond per draft:

- `approve` — write as drafted.
- `edit` — user provides changes, skill re-drafts.
- `skip` — not promoted; log reason.

Do not batch-approve silently. Approval is per-entry.

### Step 7 — Write and commit (on approval)

For each approved draft:

1. Append to the correct section of the target file in `~/.mastermind/global/`.
2. **Active** entries go at the top of the Active section (newest first). Superseded entries stay where they are, marked superseded.
3. Commit in the global memory repo with a structured message:

```
lesson: <short title>

Evidence: <path or short citation>
Seen-in: <count or descriptor>
Promoted-from: <project name (local, not public) or "current">
```

Message types: `lesson:`, `pattern:`, `pitfall:`, `stack:`, `vendor:`.

### Step 8 — Log the promotion in the project

Back in the project repo:

1. Append a one-line note to `memory/07-decisions-log.md`:
   ```markdown
   ### YYYY-MM-DD — Promoted N cross-project lesson(s)
   - **Decision:** Promoted <count> entries to ~/.mastermind/global/<file>.md.
   - **Reason:** End of <week / phase / post-mortem>. Candidates qualified under the 3-part test.
   - **Alternatives considered:** Keep local only — rejected because <reason>.
   - **Files affected:** ~/.mastermind/global/<files>.
   ```
2. Invoke `memory-updater` for a session summary entry.

### Step 9 — Close

In chat, emit a short summary:

```
Scanned window: <window>
Candidates: <N>
Promoted: <M>  (lessons=a, patterns=b, pitfalls=c, stacks=d, vendors=e)
Skipped: <N-M>  (reasons listed above)
Written to: ~/.mastermind/global/<files>
Commits: <hash> in global memory repo.
```

## Outputs

- Entries appended to files under `~/.mastermind/global/` (only on approved promotions).
- Commits in the global memory repo, one per promotion.
- Entry in the project's `memory/07-decisions-log.md`.
- Optional session summary entry in `memory/11-session-summary.md`.

## Interactions with other skills

- **Invoked by:** workflow `05-weekly-retrospective` (phase 5), workflow `04-phase-gate-transition` (phase 6), user explicitly via `/mm-learn`, `bug-investigator` at the end of a notable post-mortem, workflow `02-feature-lifecycle` phase 7 (optional).
- **Invokes:** `memory-updater` after the promotion loop to log the project-side record.
- **Pairs with:** `project-deep-audit` — the audit consumes `~/.mastermind/global/` at the start of new projects. Without a continuous-learner feeding it, the audit's "Cross-project signals" section stays empty forever.

## Completion checklist

- [ ] Window stated at the top of the output.
- [ ] Raw candidates listed with sources.
- [ ] Each candidate classified by target file.
- [ ] 3-part test applied visibly (table with verdicts).
- [ ] Drafts presented in the canonical format of each target file.
- [ ] User approval captured per-entry (not batch).
- [ ] Approved entries written to the correct file + section.
- [ ] Each promotion is a dedicated commit with the structured message.
- [ ] Project decisions log updated.
- [ ] Closing summary emitted.

## Anti-patterns

- **NEVER:** Promote an item without user approval.
- **NEVER:** Leave project-specific nouns in a promoted entry.
- **NEVER:** Promote emotional reflections ("this was frustrating"). Lessons are actionable, not expressive.
- **NEVER:** Batch-approve drafts. One at a time, explicitly.
- **NEVER:** Dump rejected candidates without a reason. "SKIP — not generalizable" is a valid reason; silence is not.
- **NEVER:** Store secrets, client names, PII, or confidential identifiers in `~/.mastermind/global/`. The Privacy section of the Cross-project Memory Protocol is binding.
- **NEVER:** Overwrite a superseded entry. Mark superseded, append new.
- **NEVER:** Promote a lesson seen only once in one project. "Seen in 1" is anecdote; wait for corroboration or log it as tentative.
