---
name: premortem
description: Klein/Kahneman premortem for high-cost or irreversible decisions. Forces the frame "this already failed 6 months from now, narrate why" — empirically ~30% better at surfacing failure causes than forward-risk framing. Use before public launches, pricing changes already communicated, vendor lock-in, partnerships, pivots, destructive data migrations, strategic hires. Spawns 5–7 parallel sub-agents (one per failure reason); each produces failure story + underlying assumption + early-warning signs. Synthesizes Most Likely Failure / Most Dangerous Failure / Hidden Assumption / Revised Plan / Pre-Launch Checklist into docs/premortems/<date>-<slug>.md and updates memory/07, memory/08, memory/12. Trigger keywords "premortem", "premortem this", "stress test this plan", "before launching", "go/no-go", "what could kill this", "future-proof this", "poke holes in this". Do NOT use for exploratory brainstorming (doubt-surfacer) or already-irreversible decisions.
---

# Premortem

## Goal

Apply the Klein/Kahneman premortem method to high-cost or irreversible decisions before they are committed. The agent is forced into the psychological frame "**it is 6 months from now, this has already failed**" and works backward to identify the specific causes of death. This produces dramatically better failure-mode identification than the standard "what could go wrong?" framing — Wharton and Cornell research on prospective hindsight reports a ~30% improvement in causal accuracy (the Klein/Kahneman result documented in Harvard Business Review).

The skill counters two well-known agent failure modes:

- **LLM agreeableness bias.** Claude defaults to optimistic, hedged responses when asked "is this a good plan?". The frame "explain how it died" disables that bias.
- **Generic risk-listing.** When asked for risks, models tend to produce a flat list of cautious bullets. The narrative frame ("write the story of how it failed") produces specific, mechanistically grounded scenarios.

## When to use

**Use when ALL three conditions hold:**

1. A concrete plan, launch, decision, or commitment exists (not a vague exploration).
2. The cost of being wrong is high — measured in months to undo, public reputation, vendor lock-in, or irrecoverable data.
3. The decision is still reversible. Once committed and irreversible, the premortem is theater.

**Trigger cases (genuinely high-ROI):**

- Public product launch with reputational stakes (Product Hunt, Show HN, press release).
- Pricing change already communicated to users (irreversible socially even if reversible technically).
- Production data migration or destructive schema change.
- Stack/vendor decision with lock-in (database, auth provider, payments processor).
- Strategic hire (first employee, co-founder, freelancer with > $10k commit).
- Exclusive partnership or non-compete clause.
- Pivot of product positioning or target market.
- Discontinuing a feature used by real users.
- Public roadmap commitment (announced launch dates).
- Business model change (B2C → B2B, freemium → paid, one-shot → subscription).

**Trigger keywords:** "premortem", "premortem this", "run a premortem", "stress test this plan", "before launching", "go/no-go", "what could kill this", "future-proof this", "poke holes in this".

**Do NOT use for:**

- Mid-implementation. The "it failed" frame is destructive once you are already coding — use `bug-investigator` instead.
- Decisions reversible in < 1 day. Cost of premortem > cost of try-and-rollback.
- Exploratory brainstorming or early discovery. Use `doubt-surfacer`.
- Decisions already taken and irreversible. There is nothing to revise — use a post-mortem framework instead.
- Code review feedback. Use `code-reviewer`.
- Pure technical decisions with quantitative comparison data (benchmarks, SLAs). Use `research-first`.

## Prerequisites

Read, in this order:

1. `CLAUDE.md`
2. `memory/00-project-brief.md`
3. `memory/02-current-state.md`
4. `memory/07-decisions-log.md`
5. `memory/08-known-risks.md`
6. `memory/12-open-doubts-and-questions.md`
7. The plan, document, or description of the decision being premortemed (provided by user as a path or in chat).

## Process

### Step 1 — Confirm context (3 items)

Before any failure analysis, confirm three things in one short paragraph at the top of the chat:

1. **What is being premortemed?** One sentence describing the plan, launch, or decision.
2. **Who does it affect?** The audience, customer, team, or stakeholder.
3. **What does success look like?** The outcome the user is hoping for, in observable terms. Failure is the inverse.

If any of the three is missing, ask one focused question for the most-missing piece. Do not ask three questions at once. Iterate until the threshold is met. Most contexts can be reconstructed from the prerequisites + a single follow-up.

### Step 2 — Set the premortem frame explicitly

Open the analysis with this exact frame, stated in chat to the user:

> "It is 6 months from now. [The plan / launch / decision] has failed. We are looking back to understand why."

This single sentence is the active ingredient. Without it, the analysis collapses into polite forward-risk listing. State it; do not skip it.

### Step 3 — Generate 5–7 failure reasons (raw)

Internally generate failure reasons grounded in the actual details of the plan. Each reason must be:

- **Specific to this plan.** A reason that could apply to any plan is useless.
- **Mechanistically plausible.** Name the chain of events, not just the outcome.
- **Independent.** Avoid reasons that are restatements of each other.

**Hardcoded cap: 5–7 failure reasons.** If more emerge, group by theme so the cap is respected — granularity is recovered during the per-reason deep-dive in Step 4. If fewer than 5 emerge, do not pad — write what is real and proceed.

Output the bare list in chat (one line per reason) so the user can object before the more expensive Step 4.

### Step 4 — Parallel sub-agent fan-out (one per failure reason)

Dispatch one sub-agent per failure reason in **parallel**. Per `.cursor/rules/07-subagent-orchestration.mdc §Model selection per role`:

- **Sub-agent model:** cheap fast model (e.g. `claude-4.5-sonnet-thinking` or `composer-2`). The deep-dives are mechanical; capable models are wasted here.
- **Orchestrator model:** most capable available (Opus-class) for Step 5 synthesis only.

**Sub-agent prompt template:**

```
You are an investigator in a premortem analysis.

THE PLAN:
---
<full context: what, who, success criteria, plus the plan/document being premortemed>
---

PREMORTEM FRAME: It is 6 months from now. This plan has failed.

YOUR ASSIGNED FAILURE: <the specific failure reason from Step 3>

Produce, in ≤ 300 words total:

1. FAILURE STORY (2–3 paragraphs): how this specific failure played out. Use details from
   the plan. Name specific moments where things went wrong and why.

2. UNDERLYING ASSUMPTION (1 sentence): the one thing the user was taking for granted
   that made this failure possible.

3. EARLY WARNING SIGNS (1–2 bullets): concrete, observable signals the user could watch
   for that would indicate this failure mode is starting to play out. Must be observable
   or measurable, not vague feelings.

Be direct. Do not hedge. Do not sugarcoat.
```

Sub-agents must run in **parallel**, not sequentially. Sequential dispatch lets earlier outputs contaminate later ones, which defeats the independence the method depends on.

### Step 5 — Synthesize

After all sub-agents complete, the orchestrator (most capable model available) reads every deep-dive and produces the **Premortem Report**:

1. **The Most Likely Failure** — which scenario is most probable given the plan's specifics? Why? This is what the user should focus on first.
2. **The Most Dangerous Failure** — which scenario, even if less likely, would cause the most damage? This is what to insure against.
3. **The Hidden Assumption** — across all deep-dives, the single biggest assumption the user was making that they probably did not realize was an assumption. This is often where the real value lives.
4. **The Revised Plan** — concrete changes, mapped one-to-one to failure scenarios. No vague "consider X" — every revision must be actionable this week. Example: *"test pricing at $47 with 20 people before committing publicly to $297"* not *"consider your pricing"*.
5. **The Pre-Launch Checklist** — 3–5 specific things to verify, test, or put in place before executing. Each item must prevent or detect one of the failure modes identified.

## Outputs

- `docs/premortems/YYYY-MM-DD-<slug>.md` — the full report. Top section is the synthesis (5.1–5.5). Below it, one `## Failure N — <title>` section per sub-agent deep-dive (story + assumption + early-warning signs). Footer with timestamp and what was premortemed.
- Append to `memory/07-decisions-log.md` as `### YYYY-MM-DD — Premortem: <slug>` with link to the doc, the Most Likely Failure (1 line), and the Hidden Assumption (1 line).
- Identified risks promoted to `memory/08-known-risks.md` per the canonical Impact × Likelihood × Mitigation × Status table. One row per failure reason that survived synthesis.
- Broken assumptions promoted to `memory/12-open-doubts-and-questions.md` as new "Pending" entries — one per assumption that the user has not validated.

In chat, present a concise summary (≤ 3 sentences): the Most Likely Failure, the Hidden Assumption, the single most important revision. The full report lives on disk.

## Interactions with other skills

- **Runs after:** `doubt-surfacer` (when topic is fuzzy and needs scope clarification first), `implementation-planner` (when premortem-ing a plan).
- **Pairs with:** `approval-gatekeeper` — for High-impact + irreversible actions in Iteration/Launch phases, premortem can be offered as an optional pre-step before the Approval Request.
- **Invoked by:** `02-feature-lifecycle` Phase 3.5 (optional, plans > 2 days or touching auth/payments/schema), `04-phase-gate-transition` Phase 1 (Definition→MVP and MVP→Launch transitions only).
- **Invokes at close:** `memory-updater` to persist the decisions-log entry, the risks promotion, and the open-doubts promotion.
- **Differs from `doubt-surfacer`:** doubt-surfacer is "what don't we know?" (exploratory). Premortem is "this already failed, narrate why" (decision near, cost high). The two are not interchangeable.
- **Differs from `project-deep-audit`:** project-deep-audit examines a project from 12 angles to build awareness. Premortem stress-tests one specific decision under the prospective-hindsight frame.

## Completion checklist

- [ ] 3 context items confirmed (what / who / success).
- [ ] Premortem frame stated explicitly in chat ("It is 6 months from now…").
- [ ] 5–7 failure reasons generated (cap respected; not padded if fewer are real).
- [ ] One sub-agent dispatched in parallel per failure reason.
- [ ] Synthesis produced with all 5 sections (Most Likely / Most Dangerous / Hidden Assumption / Revised Plan / Pre-Launch Checklist).
- [ ] Report saved to `docs/premortems/YYYY-MM-DD-<slug>.md`.
- [ ] `memory/07-decisions-log.md` updated with the premortem entry.
- [ ] Surviving risks promoted to `memory/08-known-risks.md`.
- [ ] Broken assumptions promoted to `memory/12-open-doubts-and-questions.md`.
- [ ] Concise chat summary delivered (≤ 3 sentences).

## Anti-patterns

- **NEVER:** Skip Step 2's explicit frame. The frame is the active ingredient — without it, the analysis defaults to polite risk listing.
- **NEVER:** Run sub-agents sequentially. Sequential dispatch contaminates independence.
- **NEVER:** Pad to 7 reasons when only 4 are real. Forced reasons dilute the report.
- **NEVER:** Use the most capable model for the deep-dives. Cheap is correct here; capable is correct only for synthesis.
- **NEVER:** Output vague revisions ("consider your pricing"). Revisions must be specific, dated, actionable.
- **NEVER:** Run premortem mid-implementation. The frame is destructive there — use `bug-investigator` instead.
- **NEVER:** Run premortem on already-irreversible decisions. There is nothing to revise. Use a post-mortem framework instead.
- **NEVER:** Re-run premortem when `doubt-surfacer` would do. Premortem is for "decision near, cost high"; doubt-surfacer is for "still exploring, scope unclear".
- **NEVER:** Promote a failure-mode risk to `memory/08` without an explicit Impact × Likelihood × Mitigation. A risk without a mitigation is a vibe.
