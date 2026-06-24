---
description: Prototype a feature via Claude Design on top of the project's shadcn/ui install. Wraps the prototype-designer skill. Reads memory/05-user-flows, memory/06-feature-map, and memory/14-design-system; composes a structured prompt for Claude Design; guides the round-trip; captures the handoff bundle under docs/design/prototypes/; extracts decisions into memory/14; recommends implementation-planner as the next step.
---

# /mm-design

Arguments: $ARGUMENTS (optional — feature name or shorthand, e.g. "notification-center", "checkout-flow wireframe", "settings hi-fi")

Execute the `prototype-designer` skill on the current project.

Preconditions to verify first:

1. `components.json` exists at the repo root. If not, STOP and instruct:
   *"Run `scripts/install-shadcn-mcp.ps1` (or `.sh`) first — shadcn/ui is the MASTERMIND default design system and must be initialized before prototyping."*
2. `.cursor/mcp.json` (or `.mcp.json`) references the shadcn MCP server. If not, same instruction.
3. `memory/14-design-system.md` exists and has at least the Project identity section filled. If it's fully placeholders, tell the user the prototype will be generic-IA-flavored and offer to run a quick Q&A to fill the basics (primary color, personality adjectives, likes/dislikes) before continuing.
4. The current project has at least one filled `memory/05-user-flows.md` row and `memory/06-feature-map.md` row for the feature in question. If not, recommend running `product-requirements` + `flow-analyzer` first.

Then:

- Invoke `prototype-designer` with the feature name from `$ARGUMENTS` (or ask the user to pick from `memory/06-feature-map.md`).
- Follow its 8-step process: identify target → compose prompt → guide Claude Design session → capture handoff → extract decisions → recommend next step → close with memory-updater → emit HIGH recommendation pointing to `/mm-plan`.
- Honor the Question & Doubt Protocol: if anything about fidelity, scope, or audience is ambiguous, run `/mm-doubt` inline and wait.
- Never bypass the per-entry approval when updating `memory/14-design-system.md`.

Arguments parsing (optional):

- `fidelity:wireframe` or `fidelity:hi-fi` — sets fidelity up front (skips that question).
- `audience:stakeholder|user-test|handoff` — sets audience.
- `skip-memory-update` — captures the handoff but does NOT propose changes to memory/14 (use when you just want a sketch and don't trust the output to echo preferences). The skill will warn this weakens future prototyping.

If no arguments: ask the user the minimum set (feature, fidelity, audience) and proceed.
