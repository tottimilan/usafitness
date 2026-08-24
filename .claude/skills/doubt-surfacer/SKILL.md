---
name: doubt-surfacer
description: Enforces the Question & Doubt Protocol before any important output. Use whenever the agent is about to produce a final document (PRD, architecture, flows, plan, decision record, significant code diff) or when the user asks a non-trivial question involving design choices, scope, stack, or direction. Surfaces implicit assumptions, lists technical/product/UX/risk/business doubts, asks 8–20 high-quality questions grouped by category, updates memory/12-open-doubts-and-questions.md, and closes by inviting the user to share additional observations. Never skipped when entering a new phase or starting a new project.
---

# Doubt Surfacer

## Goal

Turn implicit assumptions into explicit clarity **before** any meaningful output. This skill is the enforcement mechanism for the Golden Rule defined in `CLAUDE.md`:

> **Doubts and Questions First → Clarity → Documents and Code after.**

Its job is to make the agent name what it is silently assuming, list what it does not know, and force the user to confront questions they had not yet formulated — so that later work stands on solid ground instead of sand.

## When to use

**Always run this skill when:**
- Starting a new project (before `project-deep-audit`).
- Entering a new phase (Discovery → Definition → MVP → Iteration → Launch).
- Producing any document under `memory/` or `docs/` for the first time.
- Proposing an architecture, stack, or dependency decision.
- Changing auth, payments, or data schema.
- The user request is ambiguous, high-stakes, or touches more than one module.

**Trigger keywords:** "analyze", "design", "plan", "propose", "start", "let's think about", "help me decide", "which is better", "how should I", "review", "audit", "desgarrar".

**Do NOT use for:**
- Trivial edits (typo fixes, obvious renames, single-line comments).
- Pure execution of an already-approved plan.
- Repeating the protocol inside the same session if nothing new has emerged.

## Prerequisites

**First check work context:**
- If `.template-meta/README.md` exists at workspace root → this is template development. Read from `.template-meta/memory/` instead of public `memory/`. Never pollute public memory with template-author doubts.

Read, in this order:

1. `CLAUDE.md`
2. For normal projects: `memory/00-project-brief.md`, `memory/02-current-state.md`, `memory/07-decisions-log.md`, `memory/12-open-doubts-and-questions.md`
3. For template author work: `.template-meta/memory/02-current-state.md`, `07-decisions-log.md`, `11-session-summary.md`, `12-open-doubts-and-questions.md` (current state — do not re-ask already-answered questions)

Additionally, if relevant to the task:
- `memory/03-architecture.md` — for architecture or stack questions.
- `memory/05-user-flows.md` — for UX or flow questions.
- `memory/08-known-risks.md` — for risk-related questions.

## Process

### Step 1 — Surface assumptions (internal pass)

Privately enumerate:
- What you are assuming about the user, the product, the end users, the stack, the market, the constraints, and the definition of success.
- What you would need to verify to reduce risk.

Do not skip this step even if the assumptions feel obvious. Obvious assumptions are the first to be wrong.

### Step 2 — List current doubts (visible to user)

Produce a bullet list of all current doubts grouped by the following categories. Omit any category that truly does not apply.

- **Technical** — architecture, stack, dependencies, performance, scale.
- **Product / Value proposition** — the "why", differentiation, positioning.
- **Users / Jobs-to-be-Done** — who, what, when, pain, current alternatives.
- **Business model / Monetization** — pricing, unit economics, acquisition.
- **UX / Critical flows / Edge cases** — what breaks when the happy path fails.
- **Risks** — technical, legal, regulatory, operational, ethical.
- **Assumptions that might be wrong** — anything caught in Step 1 that could derail the plan if false.

Each doubt must be **actionable** — it should translate into either a verification step the agent can perform or a question to the user.

### Step 3 — Generate 8 to 20 high-quality questions

Requirements per question:

- **Specific, not generic.** Bad: *"What is your target user?"*. Good: *"Is the primary user a solo freelancer, a 5-person agency, or an in-house marketing team? If more than one, which one ships first?"*
- **Consequential.** The answer must change direction, not just wording.
- **Grouped by the same categories** used in Step 2.
- **Numbered continuously** (Q1, Q2, …) for later reference.

Format each question:

```markdown
### Q<N> — <Category>
- **Question:** …
- **Why it matters:** …
- **What a good answer looks like:** …   (optional but encouraged)
```

If fewer than 8 truly meaningful questions emerge, keep the lower count — do not pad. But first double-check whether this context actually warranted running the skill.

### Step 4 — Present before any output

In the chat, present — **before any deliverable** — in this exact order:

1. "Assumptions I'm making"
2. "What I still don't know"
3. "Questions for you" (numbered, grouped by category)
4. A closing line: *"I'll wait for your answers before proposing <the deliverable>."*

Do **not** preemptively produce the deliverable. If the user already answered some questions in previous turns, acknowledge it and list only the still-open ones.

### Step 5 — Update `memory/12-open-doubts-and-questions.md`

Append (never delete) using the canonical format:

```markdown
### Q<N> — <Category>
- **Question:** …
- **Why it matters:** …
- **Status:** Pending | Answered | Deferred
- **User response:** …
- **Impact on project:** …
- **Asked on:** YYYY-MM-DD
```

Move fully answered entries from "Active questions" to "Recently Resolved Doubts" in the same file. Never delete history.

### Step 6 — Close with an invitation

End with literally this line (or equivalent in the user's language if the project is Spanish-speaking):

> Do you have any doubts, observations, or additional notes before we continue?

This surfaces things the user was holding silently and is the difference between a transactional chat and a true thinking partner.

## Outputs

- **Chat:** Assumptions + Open doubts + Numbered questions + Closing invitation.
- **Disk:** `memory/12-open-doubts-and-questions.md` updated with all new questions.
- **No code changes. No other memory files touched.**

## Interactions with other skills

- **Runs before:** `project-deep-audit`, `product-requirements`, `architecture-mapper`, `flow-analyzer`, `implementation-planner`, `research-first`, and any skill that produces a final document.
- **Invokes (lightly):** `memory-updater` — only to persist the `memory/12-*` update, never the full memory refresh.
- **Never chained with:** the reproduce phase of `bug-investigator` (bugs have their own protocol — see that skill).

## Completion checklist

- [ ] Assumptions listed explicitly.
- [ ] Doubts grouped by category, each actionable.
- [ ] At least 8 meaningful questions (or a justified lower count).
- [ ] Each question specific and consequential, with "Why it matters".
- [ ] Questions presented **before** any deliverable.
- [ ] `memory/12-open-doubts-and-questions.md` updated.
- [ ] Closing invitation delivered.

## Anti-patterns

- **Avoid:** Listing 20 generic questions to hit a quota ("What are your goals?", "Who are your users?", "What's your budget?").
- **Avoid:** Producing the document first and tacking questions at the end.
- **Avoid:** Asking the user things that could be answered by reading `memory/` or the codebase.
- **Avoid:** Skipping the skill because "the task seems clear" — if it truly is, apply judgment; default is to run.
- **Avoid:** Re-asking questions already marked "Answered" in `memory/12-*`.
- **Avoid:** Padding with fluff questions to reach 8 when the context genuinely has fewer.
