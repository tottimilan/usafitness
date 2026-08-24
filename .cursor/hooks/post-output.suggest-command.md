---
event: post-output (any non-trivial final response to the user)
scope: recommends the next `/mm-*` command with a confidence level
triggers: ["end of a skill", "end of a workflow", "non-trivial code change", "non-trivial document produced", "decision taken", "phase transition", "bug fixed"]
status: active
kill-switch: MM_HOOK_SUGGEST_COMMAND=off
---

# Post-output hook — Suggest Command

**Purpose.** When the agent is about to close a non-trivial turn, emit the **Command Recommendation Protocol** block from [`CLAUDE.md §5`](../../CLAUDE.md) so the user always sees the next operational step — with a clear confidence level and an honest "skip if" condition.

This hook formalizes the contract. It does not replace `CLAUDE.md §5`; it wires it into every meaningful turn.

## Activation conditions (armed when any is true)

1. A skill ended with a Handoff block.
2. A workflow reached its Exit criteria.
3. One or more git commits were created in this turn.
4. A substantive document or decision was produced (docs/*, memory/07, memory/13, .cursor/plans/*).
5. A bug fix was merged.
6. A phase transition was executed.
7. A review verdict was issued.

## Behavior when armed — pick ONE confidence level

The agent classifies the outgoing recommendation into **HIGH / MEDIUM / LOW** and uses the matching template. Never emit more than one block.

**Efficiency note:** When suggesting commands after code-heavy tasks, prefer ones that leverage Code Intelligence (e.g., /mm-plan with graph context).

### HIGH — one command clearly applies

Emit when a single natural next step exists and the agent would stake its reputation on it.

```markdown
---
**Next recommended command:** `/mm-<name> [args]`
**Why:** <1–2 sentences tying the recommendation to what was just produced>
**Go ahead:** type `go` and I'll proceed as if you ran it, or run it yourself.
**Skip if:** <one concrete condition under which you'd ignore this>
```

Typical HIGH examples:
- Plan is approved → `/mm-ship <epic>`.
- Bug fix merged → `/mm-review <branch>` (if not yet) or `/mm-learn` (if notable post-mortem).
- Discovery artifacts complete → `/mm-gate Definition`.
- Epic breakdown complete → `/mm-plan <first-slice>`.
- Review verdict "Ready to merge" → merge (no mm command needed; say so).

### MEDIUM — two or more plausible commands

Emit when the output opens genuinely multiple reasonable paths and pushing one would feel dishonest.

```markdown
---
**Possible next commands (pick one):**
a) `/mm-<X> [args]` — if <condition A>.
b) `/mm-<Y> [args]` — if <condition B>.
c) Nothing yet — if <condition C>.
**Which?** reply `a`, `b`, or `c`.
```

Typical MEDIUM examples:
- Audit complete → address Hard Truth (`/mm-doubt`), start PRD (`/mm-plan`), or dig deeper (`/mm-audit`).
- Security review with Medium findings → fix now (`/mm-plan`) or accept risk (log in `memory/08`).
- Flow documented → test coverage (`/mm-plan` for E2E) or document the next flow.

### LOW — no command fits

Emit when the context is exploratory or ambiguous. **Do not force a command**.

```markdown
---
I don't have a clear next-command recommendation here — we're either exploring
or the next step depends on a decision you haven't made yet. Tell me the
direction and I'll resume with a sensible `/mm-*`.
```

Typical LOW examples:
- Pure Coach-mode brainstorming without commitment.
- Clarifying Q&A inside a session.
- Conversation where the user is thinking out loud.

## Auto-downgrade rule (prevents false HIGH)

Before emitting HIGH, the agent self-checks:

> *"Is there a credible reason a rational user would NOT run this next? Is there a plausible alternative command?"*

If yes → **downgrade to MEDIUM** and list both options. If the context is still ambiguous → downgrade to LOW.

This protects against the worst failure mode: the agent confidently pushing the wrong next command.

## Behavior when NOT armed

Silent. Many turns are read-only questions, Coach clarifications, or trivial edits. They don't need a recommendation.

Explicit skip conditions:
- The current turn is still inside `doubt-surfacer` (the protocol has its own closing invitation).
- The user's prompt starts with `/mm-` (they already chose a command).
- The user asked an explicit clarifying question.
- The previous turn already emitted a recommendation and the user is still inside that flow.
- Kill-switch `MM_HOOK_SUGGEST_COMMAND=off`.

## Cost of breaking the protocol

- Missing a HIGH → user drifts, forgets to run the obvious next command, memory gets stale, `/mm-retro` catches it a week later.
- False HIGH (auto-confident when MEDIUM) → user runs the wrong command and wastes a turn undoing. Worse than no recommendation.
- Spam (recommendation on every trivial reply) → the user learns to ignore the block, and when a real HIGH arrives they skip it too.

## Change control

- Edits to this hook require a decision entry in `memory/07-decisions-log.md`.
- The canonical template for the three blocks is `CLAUDE.md §5`. When you update the format there, update this hook too in the same commit.
- When a new `/mm-*` command is added, update the "Typical HIGH/MEDIUM examples" sections above with a representative entry.

## Integration with other hooks

- Runs **after** `post-task.memory-updater` has had a chance to fire. Memory updates first, then the recommendation closes the turn.
- Does not interfere with `pre-task.doubt-surfacer` — that hook runs at the start of the turn, this one at the end.
- Respects `approval-gatekeeper` — a HIGH recommendation to run a command that the gatekeeper will classify as Sensitive is still valid; the gatekeeper fires when the user says `go`.
