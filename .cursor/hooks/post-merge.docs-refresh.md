---
event: post-merge (to main)
scope: merges that touch architecture, data model, flows, or MCP config
triggers: ["merge commit to main", "files changed: src/*, schema, infra, mcp.json", "architecture decision accepted"]
status: active
kill-switch: MM_HOOK_DOCS_REFRESH=off
---

# Post-merge hook — Docs Refresh

**Purpose.** When a merge to `main` lands that touched architecture, data model, user flows, or MCP configuration, propose refreshing the corresponding docs. Drift between shipped code and memory/docs is silent and expensive; this hook keeps them in sync without requiring the human to remember.

The hook **proposes** refreshes; it does not silently rewrite. The user approves each refresh.

## Activation conditions

At the moment a merge to `main` completes (either locally via `git merge` or after pulling a merged PR), evaluate the diff `git diff <main-before>..<main-after>`:

1. **Architecture touched?** (e.g. new service folder, changed `docker-compose.yml`, changed infra-as-code, new/removed top-level dependency) → refresh `docs/architecture/system-map.md` + `memory/03-architecture.md`.
2. **Data model touched?** (migrations, schema files, new/removed entities) → refresh `memory/04-data-model.md`.
3. **User flow touched?** (files under critical flow paths named in `memory/05-user-flows.md`) → refresh the matching `docs/flows/<slug>.md` error-path section.
4. **MCP config touched?** (`.cursor/mcp.json` or `claude-side/mcp-config.json` changed) → refresh `.cursor/rules/05-claude-mcp-integration.mdc` "MCP servers used by this project" section.

If none of the above matches, the hook is silent.

## Behavior when armed

1. In chat, emit a one-block proposal:
   ```markdown
   ## Post-merge refresh proposal
   The merge <sha range> touched:
   - <area>: <files>
   Recommended refresh:
   - <skill> on <target doc>
   ```
2. Offer the user three choices: `refresh` (invoke the relevant skill now), `later` (log a task in `memory/10-open-questions.md`), or `not needed` (log a one-line justification).
3. Do not refresh without an explicit choice.

## Behavior when NOT armed

Silent.

## Exceptions

- Merge of `docs(memory): …` commits — those ARE the refresh; no recursive hook.
- Merge of pure doc commits — silent (they do not change runtime).
- Kill switch `MM_HOOK_DOCS_REFRESH=off`.

## Logging

When the hook fires and the user picks `refresh` or `later`, the invoked skill (or `memory-updater`) logs normally.

## Change control

Edits logged in `memory/07-decisions-log.md`.
