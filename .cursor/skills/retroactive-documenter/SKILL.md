---
name: retroactive-documenter
description: Reads an existing codebase (code + git log + README + docs + dependency files) and proposes content to populate an otherwise-empty memory/ skeleton. Use immediately after scripts/onboard-existing-project installs the MASTERMIND shell, before the first /mm-gate. Produces draft entries for memory/00-project-brief, memory/02-current-state, memory/03-architecture, memory/04-data-model, memory/06-feature-map, and memory/08-known-risks based on observed reality (files, commits, lockfiles, README, tests). Presents each draft one by one for approve/edit/skip. Writes to memory/ only with explicit user approval per file. Never hallucinates data that is not grounded in the codebase. Different from project-deep-audit: the audit produces strategic analysis (12 angles, Hard Truth); this skill extracts facts from the existing repo to seed the memory skeleton.
---

# Retroactive Documenter

## Goal

Turn an existing codebase into a populated `memory/` without asking the user to fill it from scratch. The skill reads what is actually in the repo (package.json, src tree, git log, README, tests, CI config) and proposes factual content for each affected memory file. It does not invent, does not pad, and never writes without user approval entry by entry.

This is the bridge between "the project exists" and "the project has MASTERMIND memory". It runs once per onboarding.

## When to use

**Always:**
- Right after `scripts/onboard-existing-project` has installed the MASTERMIND shell into an existing project.
- As part of workflow `06-onboard-existing-project` (phase 5).
- When an old project's `memory/` skeleton is still placeholder-heavy and you want a fact-based first pass.
- When the user explicitly says *"populate memory from the code"*, *"bring memory up to date from the repo"*, *"mm-onboard"*, *"retroactive audit"*.

**Trigger keywords:** "onboard", "retroactive", "populate memory", "from the code", "fill memory", "ingest existing repo".

**Do NOT use for:**
- Brand-new projects — those use `/mm-bootstrap` and `project-deep-audit`.
- Strategic analysis — use `project-deep-audit` for 12-angle reviews and Hard Truth.
- Weekly recaps — use `memory-updater` for session-level updates.
- Projects where `memory/00-project-brief.md` is already filled with real content; there is nothing to retroactively seed.

## Prerequisites

Read:

1. `CLAUDE.md` (kernel)
2. `.cursor/rules/00-project-operating-system.mdc`
3. `memory/` — confirm it is skeleton (placeholders). If not, stop and recommend `memory-updater` instead.
4. The target codebase:
   - Root: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Gemfile` — whichever applies.
   - Lockfiles: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `uv.lock`, etc.
   - `README.md`, `README.*` — read the whole thing.
   - Any existing `docs/` that the project brought with it.
   - Source tree at 1–2 levels of depth (do not recurse into `node_modules/`, `dist/`, `.next/`, `build/`).
   - Git: `git log --oneline -n 100`, `git log --pretty=format:"%an" | sort -u | head -5`, `git branch -a`.
   - CI config: `.github/workflows/*.yml`, `.gitlab-ci.yml`.
   - Test directory: `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`.

## Process

### Step 1 — Scan the repo and collect facts

Produce an internal fact list (do not present yet):

- **Stack**: from lockfiles and dependency names. Not guesses — cite the file and version.
- **Structure**: top-level folders, their purpose inferred from names (src, app, api, lib, tests, docs).
- **Entities**: schema files, migration files, Prisma schema, SQL, or ORM models.
- **Routes / features**: `app/**/route.ts`, `pages/**`, route handlers.
- **Tests**: count by level (unit, integration, e2e if detectable).
- **Commits**: last 100 short lines; infer recent feature names and bug fixes.
- **Contributors**: top N authors (count only; do not list names publicly unless the user agrees).
- **Deployment**: Vercel / Netlify / Railway / Fly.io / Cloudflare from config files.
- **Secrets surface**: `.env.example` contents (if any) reveal what the project depends on.

Keep this pass silent. You are collecting; you have not committed to anything yet.

### Step 2 — Draft per-file content

Produce drafts, one per file, in this order:

**`memory/00-project-brief.md`** draft — Name from `package.json.name` + README title. Type inferred from framework (Next.js web app / API / library / CLI). Tech stack with actual versions. Core problem and value proposition from README's first paragraphs (verbatim if clear, or clearly marked as *"quoted from README"*). User role from README or inferred from routes. Non-negotiables left as `_TBD_` (you do not know these).

**`memory/02-current-state.md`** draft — Phase left as whatever `onboard-existing-project` set it to (do not second-guess). *What exists today* = summary of main folders and their roles, recent commit themes. *What is in progress* = from recent branches or "WIP" commits. *What is blocked* = leave `_TBD_` unless the README or `TODO.md` says something. *What is next* = from README's "Roadmap" or open issues if findable.

**`memory/03-architecture.md`** draft — One-page view: stack (with versions), top-level layout diagram (ASCII), service boundaries (APIs, workers, DBs inferred from code), external deps list (from package.json dependencies). NFRs section left mostly `_TBD_` — you cannot infer latency budgets from code alone. Flag this explicitly.

**`memory/04-data-model.md`** draft — If Prisma schema / SQL migrations / ORM models exist: list entities and their relationships. If not (e.g. pure frontend project): say so and leave `_TBD_`.

**`memory/06-feature-map.md`** draft — MVP rows from shipped routes / features currently visible in source. Status `Shipped` for features visible in `main` branch code. `In progress` only if there is an active feature branch with recent commits. Leave "Post-MVP backlog" empty.

**`memory/08-known-risks.md`** draft — Risks that are **empirically visible** in the code:
- Missing test coverage in a route → Medium technical risk.
- Pinned dependency with a known CVE → High.
- Secrets in `.env.example` pointing to third-party services with no fallback → Medium.
- `// TODO:`, `// FIXME:`, `// HACK:` comments in critical paths → Low/Medium technical.

Do not invent risks. If the code gives you no signal, leave the section minimal with a note that `/mm-audit` is the right next step for strategic risks.

### Step 3 — Present drafts for approval, one by one

For each drafted file, present:

```markdown
### Draft: memory/<filename>.md

**Source of facts used:**
- package.json (line X): <fact>
- README.md §<section>: <quote>
- src/<path>: <observation>
- git log: <pattern>

**Proposed content:**

```markdown
<the draft content>
```

**Gaps left as `_TBD_`:**
- <field 1>
- <field 2>

**Your call:**
- Reply `approve` to write this to memory/<filename>.md.
- Reply `edit` and describe the change; I redraft.
- Reply `skip` to leave the file as skeleton (you will fill it later).
```

Per-entry approval. Never batch.

### Step 4 — On approval, write

For each `approve`:

- Overwrite the target memory file with the drafted content.
- Commit with message `docs(memory): retroactive seed for memory/<filename>`.

If the user says `edit`, re-draft and re-ask. Limit: 3 edit rounds per file; beyond that, say so honestly and suggest leaving as `_TBD_` for the user to fill directly.

### Step 5 — Flag what needs a real audit

After the seed pass, emit a short list of what retroactive documentation **could not** provide and recommend `/mm-audit`:

- Hard Truth about the product and its differentiator.
- Strategic risks (market, monetization, competitor dynamics).
- Personas beyond "the user of whatever routes exist".
- Business model and unit economics.
- 12-angle multi-perspective pass.

Say explicitly: *"I filled what the code can tell me. The next step is `/mm-audit` for everything the code cannot."*

### Step 6 — Close + memory updater

- Invoke `memory-updater` to append a session entry to `memory/11-session-summary.md` summarizing the retroactive seeding (how many files approved, how many skipped, any flagged gaps).
- Add a decision entry in `memory/07-decisions-log.md`:
  ```markdown
  ### YYYY-MM-DD - Retroactive memory seeding via retroactive-documenter
  - Decision: Seeded memory/<list> from observed codebase facts.
  - Reason: Onboarding existing project into MASTERMIND; avoids empty placeholders.
  - Alternatives: Leave skeleton intact and fill manually - rejected: slower, inconsistent.
  - Consequences: Memory now reflects code reality at <commit-sha>. Still pending: strategic audit via /mm-audit.
  - Files affected: memory/<list>.
  ```

### Step 7 — Closing

Emit a **HIGH** Command Recommendation:

```markdown
"Retroactive seeding complete. Seeded <N> files: <list>. Skipped <K>. Gaps flagged: <brief>.

---
**Next recommended command:** `/mm-audit`
**Why:** the code-derived seed covers facts; the strategic layer (users, monetization, risks, pivots, Hard Truth) is still empty. `project-deep-audit` fills it.
**Go ahead:** type `go` and I'll run `project-deep-audit` on the repo now that memory/ has a factual base.
**Skip if:** you want to review the seeded files before the audit, or the phase set during onboarding is already advanced enough that `/mm-gate` is the priority."
```

## Outputs

- Content written to one or more of: `memory/00-project-brief.md`, `memory/02-current-state.md`, `memory/03-architecture.md`, `memory/04-data-model.md`, `memory/06-feature-map.md`, `memory/08-known-risks.md`.
- One commit per approved file: `docs(memory): retroactive seed for memory/<filename>`.
- Entry in `memory/11-session-summary.md` and `memory/07-decisions-log.md`.

## Interactions with other skills

- **Invoked by:** workflow `06-onboard-existing-project` phase 5; user via `/mm-onboard`; or manually when the user says "populate memory from the code".
- **Invokes:** `memory-updater` at close. Recommends `/mm-audit` (which runs `project-deep-audit`) as the natural next step.
- **Pairs with:** `project-deep-audit` — this skill seeds facts; the audit adds strategy on top.

## Completion checklist

- [ ] Internal fact list assembled (not presented).
- [ ] Drafts produced for the applicable memory files only.
- [ ] Each draft cited its sources (no fact without provenance).
- [ ] Each draft presented one by one; approve/edit/skip respected.
- [ ] Files written only on approval; one commit per file.
- [ ] Gaps flagged with explicit `_TBD_` and a recommendation to run `/mm-audit`.
- [ ] `memory-updater` ran at close.
- [ ] Closing HIGH recommendation emitted (`/mm-audit`).

## Anti-patterns

- **NEVER:** Invent a target user, monetization, or Hard Truth. Those are strategic; they belong to `project-deep-audit`.
- **NEVER:** Write to memory without explicit `approve` from the user, per file.
- **NEVER:** Cite "the codebase says X" without naming a file and a line or section.
- **NEVER:** Batch-approve. Even when the user says "approve all", the skill insists on one-by-one so nothing sneaks past.
- **NEVER:** Skip the gap flagging. The value of the skill is partly in naming what it could NOT infer.
- **NEVER:** Exceed 3 edit rounds per file. Beyond that, the spec is unclear and the user should fill it manually.
- **NEVER:** Overwrite a memory file that already has non-placeholder content. If the user populated it before invoking the skill, skip it and note "already populated".
- **NEVER:** Run on a codebase without git history — the commit stream is key evidence. Warn and stop.
