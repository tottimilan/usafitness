---
name: prototype-designer
description: Platform-aware bridge from MASTERMIND memory to Claude Design (claude.ai/design) for interactive prototyping. Use when the user asks to "prototype this", "design this feature", "mock it up", or invokes "mm-design"; always use between product-requirements/flow-analyzer and implementation-planner for any UI feature. Branches between web (shadcn/ui + Tailwind) and mobile (react-native-reusables + NativeWind + Expo) based on memory/14-design-system.md §Platform. Consumes memory/05-user-flows, memory/06-feature-map, memory/14-design-system; composes a platform-tuned Claude Design prompt; guides the round-trip (open Claude Design, link repo, iterate, export); saves the bundle under docs/design/prototypes/<feature>/; extracts decisions back into memory/14. Requires the design system installed via scripts/install-shadcn-mcp and a Claude subscription with Claude Design access.
---

# Prototype Designer

## Goal

Make the round-trip **spec → interactive prototype → decisions recorded → ready-to-implement plan** predictable, grounded, and compact. Claude Design is a great tool, but used without context it produces beautiful generic IA output that doesn't match your other projects. This skill forces the context in — your memory, your tokens, your shadcn components — so the prototype is production-relevant from the first frame.

## When to use

**Always:**
- Right after `product-requirements` + `flow-analyzer` have produced a feature spec and user flow, and before `implementation-planner` locks the build plan.
- When the user asks to "prototype", "mock up", "design", or invokes `/mm-design`.
- For features where visual feedback from a stakeholder is faster than a text spec.
- When a feature touches multiple screens and the team benefits from seeing the journey, not just per-screen mocks.

**Trigger keywords:** "prototype", "prototipo", "mockup", "mock up", "design", "diseña", "let's sketch", "claude design", "mm-design".

**Do NOT use for:**
- Static components in isolation (`<Button variant="destructive">`). The shadcn MCP already handles that directly.
- Production-level fidelity. The output is a prototype; implementation lives in `implementation-planner` + Claude Code.
- Brand design, logo, marketing imagery. Use a designer or a specialized tool.
- Re-skinning the entire app at once. That's a design system project, not a feature prototype.

## Prerequisites

Read:

1. `CLAUDE.md` (kernel)
2. `.cursor/rules/08-design-system.mdc` (DS conventions)
3. `memory/05-user-flows.md` — which flow are we prototyping?
4. `memory/06-feature-map.md` — what's the feature status, priority, dependencies?
5. `memory/14-design-system.md` — tokens, installed components, likes/anti-patterns, patterns we reuse
6. `~/.mastermind/global/design-patterns.md` (if exists) — cross-project visual lessons

**Code context efficiency (for design decisions):** When the feature touches existing code (e.g. to decide layout based on current components or flows), use Code Intelligence MCP graph queries first for relevant symbols and call paths instead of broad reads. Keeps context tight during prototyping.

Check the environment:

- `components.json` exists → the design system is initialized.
- `.cursor/mcp.json` or `.mcp.json` references the shadcn MCP server → agents have live registry access.
- If either is missing, STOP and tell the user to run `scripts/install-shadcn-mcp.ps1` (or `.sh`) first.
- Access to Claude Design: the user's Claude plan (Pro/Max/Team/Enterprise) must have it enabled. If the user says they don't, fall back to a text-based spec and skip Claude Design; still produce the handoff to `implementation-planner`.

### Platform detection (mandatory first move)

Read `memory/14-design-system.md §Platform`. The skill branches on this field:

- `Platform: web` → web track (shadcn/ui + Tailwind + browser preview).
- `Platform: mobile` → mobile track (react-native-reusables / RNR + NativeWind + Expo + Expo Go on-device preview).
- `Platform: cross` → ask the user which surface this specific prototype is for (a single feature is usually web OR mobile, even in cross projects). Default to whichever surface the user is actively working on this session.
- Field missing → STOP. Tell the user to fill `memory/14-design-system.md §Platform` first. A wrong assumption compounds into a wrong prototype.

## Process

### Step 1 — Identify the prototype target

Ask the user (or infer from recent chat context):

- Which feature / flow are we prototyping? (name it, pick the row in `memory/06-feature-map.md`)
- Fidelity: **wireframe** (low-fi, focus on layout + content) or **hi-fi** (tokens applied, interactive)?
- Scope: single screen, multi-screen flow, or full-feature journey?
- Audience: stakeholder review, user testing, or handoff to Claude Code?

If any of those is unclear, use `doubt-surfacer` and stop here. Do NOT guess.

### Step 2 — Compose the Claude Design prompt (platform-specific)

Produce a prompt in the shape Claude Design rewards (**goal + layout + content + audience + constraints**), tuned by Platform. Use the skeleton that matches memory/14 §Platform:

#### Web track prompt skeleton

```markdown
### Claude Design prompt for: <feature name> (WEB)

**Platform:** web app (responsive). Browser targets from memory/14.
**Goal:** <1–2 sentences from memory/05-user-flows / memory/06-feature-map>
**Screens / routes:** <numbered list from memory/05-user-flows — think in terms of URL routes>
**Primary actions per screen:** <bullet list>
**Content examples:** <realistic sample text/data; pull from memory/03-architecture entities>
**Audience:** <who uses this; from memory/00-project-brief>

**Design constraints (from memory/14-design-system):**
- Tokens: primary <color>, radius <value>, fonts <display + sans>, dark mode <yes/no>.
- Components: shadcn/ui — use <Button>, <Card>, <Dialog>, <Tabs>, <Sheet>, <Form>, etc. Full list: <memory/14 §Installed components>.
- Layout: Tailwind grid/flex. Breakpoints: sm/md/lg/xl. Mobile-first.
- Navigation: standard web patterns (header, footer, sidebar, breadcrumbs where appropriate).
- Patterns we reuse: <memory/14 §Patterns filtered by Platform = web or both>
- Likes: <memory/14 §What I like>
- Anti-patterns — DO NOT: <memory/14 §What I don't like>

**References (make it feel like):** <URLs from memory/14 §References>

**Fidelity:** <wireframe | hi-fi>

**Deliverable:** interactive web prototype I can click through; export as handoff bundle for Claude Code.
```

#### Mobile track prompt skeleton

```markdown
### Claude Design prompt for: <feature name> (MOBILE — Expo + React Native)

**Platform:** MOBILE APP (iOS + Android). This is NOT a responsive website. Do not generate browser-chrome. Generate a native app prototype.
**Framework:** Expo + React Native. Navigation: Expo Router (file-based, tab/stack groups).
**Goal:** <1–2 sentences from memory/05-user-flows / memory/06-feature-map>
**Screens / flow:** <numbered list; think mobile screens, not URL routes>
**Primary actions per screen:** <bullet list>
**Content examples:** <realistic sample text/data from memory/03-architecture>
**Audience:** <from memory/00-project-brief>

**Design constraints (from memory/14-design-system):**
- Tokens: primary <color>, radius <value>, fonts <display + sans>, dark mode <yes/no / system-follows>.
- Components: react-native-reusables (RNR) — use <Button>, <Card>, <Dialog>, <Sheet>, <Form>, etc. (RNR's mobile-tuned variants). Full list: <memory/14 §Installed components>.
- Styling: NativeWind (Tailwind for RN). No inline styles. No StyleSheet unless NativeWind cannot express it.
- Layout: mobile-first (iPhone 13 width baseline). Tab bar at bottom (if applicable), not top nav. Safe-area on every screen.
- Navigation: Expo Router patterns. Tab bar with 4 tabs max. Stack groups per tab.
- Touch targets: ≥ 44pt iOS / 48dp Android.
- Platform differences: iOS + Android subtle divergences (swipe-back gesture, back button). Don't over-branch.
- Haptics: on primary CTAs (subtle); never on destructive (avoid false positives).
- Mobile-specific from memory/14 §Mobile-specific: <safe-area strategy, orientation, tab bar pattern, gestures>.
- Patterns we reuse: <memory/14 §Patterns filtered by Platform = mobile or both>
- Likes: <memory/14 §What I like>
- Anti-patterns — DO NOT: <memory/14 §What I don't like (mobile ones especially: no alert(), no modal-stacking 3+ deep, no Platform.OS branching everywhere, no legacy Animated API)>

**References (make it feel like):** <URLs from memory/14 §References>

**Fidelity:** <wireframe | hi-fi>

**Deliverable:** interactive mobile app prototype; preview on device via Expo Go (or dev client if custom native modules). Export as handoff bundle for Claude Code — Claude Code will implement with Expo Router, NativeWind, Reanimated 3, SafeAreaView wrapping, following `.cursor/templates/CLAUDE.md.mobile.md` conventions.
```

#### Cross track

If memory/14 §Platform = `cross`, ASK the user which surface the current prototype is for. Don't try to do both in one Claude Design project — the mental model is cleaner when you prototype web and mobile separately, even if they share tokens.

---

Present the drafted prompt to the user. Get `approve` / `edit <changes>` / `abort` before proceeding.

### Step 3 — Guide the Claude Design session (platform-specific preview)

Instruct the user:

1. Open `claude.ai/design`.
2. Create a new project named `<project-name> / <feature>`.
3. Import → link this GitHub repo. Claude Design reads `components.json` + `tailwind.config.*` + (if present) `DESIGN.md` to infer tokens and components.
   - **Pro tip**: run `pwsh -File scripts/export-design-md.ps1 -Apply` first if DESIGN.md doesn't exist or is stale. The portable DESIGN.md gives Claude Design far more context than just reading the repo.
4. Paste the prompt from Step 2.
5. Iterate:
   - Use **chat** for structural changes ("split this into 2 screens", "add an empty state").
   - Use **inline comments** for local tweaks ("soften this shadow", "use our Primary Button here").
   - If a direction goes sideways: *"Save what we have and try a completely different approach"* → Claude Design keeps both.

#### Mobile-specific: preview on device (Expo Go)

For `Platform: mobile` prototypes, Claude Design alone shows a web preview — which is useful but not native-fidelity. After the prototype is stable in Claude Design:

6a. Export the handoff bundle (URL).
6b. In a separate terminal: clone/navigate to a scratch Expo project (or use a dedicated `mockup/` branch per workflow `07-full-app-prototyping` once it exists).
6c. Ask Claude Code to implement the bundle in that Expo project: `claude code "Implement the Claude Design handoff at <URL> into this Expo project. Honor .cursor/templates/CLAUDE.md.mobile.md conventions."`
6d. Run `npx expo start` and preview on real device with Expo Go. Iterate with the stakeholder on real hardware.
6e. Feed device-observed issues (on a 5.5" phone vs the canvas) back to Claude Design or Claude Code.

#### Web-specific: preview in browser

For `Platform: web`: Claude Design's canvas is already a faithful browser preview. When you export the handoff bundle, Claude Code implements into your actual Next.js / Vite project. Preview via `npm run dev`.

---

Do NOT automate the Claude Design session itself — it's a web UI, not a scriptable API (yet). The skill's job is to drive the loop, not click for the user.

6. When the prototype is stable, export: **Export → Hand off to Claude Code** → copy the URL of the handoff bundle.

### Step 4 — Capture the handoff

Once the user returns with the bundle URL (or a downloaded zip):

1. Create `docs/design/prototypes/<feature>/` if missing.
2. Write `docs/design/prototypes/<feature>/README.md` with:
   - Feature name + link to `memory/06-feature-map.md` row.
   - Claude Design project URL (for returning to iterate).
   - Handoff bundle URL or path.
   - Date and the prompt used (for reproducibility).
   - Screenshots (optional; the user uploads them if useful).
3. If the bundle was downloaded as a folder, place it under `docs/design/prototypes/<feature>/bundle/`.

Never commit the prototype's HTML/JSX to `src/`. It's reference material, not production code.

### Step 5 — Extract decisions to memory/14

Scan the prototype and the conversation for:

- **New tokens used** — did we land on a specific radius, font, shadow? Propose an update to `memory/14-design-system.md §Tokens` with before/after.
- **Components discovered** — did the prototype introduce a shadcn component we haven't installed yet (e.g. `Command`, `Sheet`)? Add a row to `memory/14 §Installed components` with status "to install during implementation".
- **Patterns emerged** — does this feature use a composition we'll reuse? Name it and add a row to `memory/14 §Patterns we use repeatedly`.
- **Visual likes confirmed** — if something in the prototype crystallized a preference, append to `§What I like`.
- **Anti-patterns confirmed** — if an iteration was rejected, note it under `§What I don't like` with context.

Present each proposed update to the user one by one (approve / edit / skip), the same per-entry approval pattern as `continuous-learner` and `retroactive-documenter`.

### Step 6 — Handoff to implementation-planner

Emit a HIGH Command Recommendation pointing to `implementation-planner`. The planner will:

- Read the prototype bundle from `docs/design/prototypes/<feature>/`.
- Combine with `memory/06-feature-map.md` and the current `src/` layout.
- Produce an implementation plan that reuses the prototype's component choices and design intent — because both sit on the same shadcn foundation.

### Step 7 — Close + memory updater

- Invoke `memory-updater` to append a session entry to `memory/11-session-summary.md` summarizing: feature prototyped, fidelity, decisions captured, components discovered.
- Add a decision entry in `memory/07-decisions-log.md` if any token or pattern changed:
  ```markdown
  ### YYYY-MM-DD - Prototyped <feature> via Claude Design
  - Decision: <what was decided about tokens / components / patterns>
  - Reason: emerged during prototyping; validates or refines memory/14.
  - Alternatives considered: <ones that were rejected in the session>
  - Consequences: memory/14 updated; implementation-planner consumes the bundle next.
  - Files affected: memory/14-design-system.md, docs/design/prototypes/<feature>/**
  ```

### Step 8 — Closing recommendation

```markdown
"Prototype for <feature> captured. <N> decisions logged to memory/14, <K> components queued for install, bundle saved under docs/design/prototypes/<feature>/.

---
**Next recommended command:** `/mm-plan <feature>`
**Why:** the prototype + the updated memory/14 + the existing shadcn foundation give implementation-planner everything it needs to produce a code plan that matches the design intent. Delay is wasted context.
**Go ahead:** type `go` and I'll invoke implementation-planner now.
**Skip if:** you want to present the prototype to a stakeholder first, or you're not yet ready to commit to implementation."
```

## Outputs

- `docs/design/prototypes/<feature>/README.md` with prompt, URLs, date.
- `docs/design/prototypes/<feature>/bundle/` (optional; if downloaded locally).
- Updates to `memory/14-design-system.md` (approved per entry).
- Optional entry in `memory/07-decisions-log.md`.
- Session entry appended to `memory/11-session-summary.md`.

## Interactions with other skills

- **Invoked by:** user via `/mm-design`; workflow `02-feature-lifecycle` (phase "prototype"); or natural language.
- **Consumes outputs of:** `product-requirements`, `flow-analyzer`, `feature-breakdown`.
- **Feeds into:** `implementation-planner` (the next step).
- **Closes with:** `memory-updater`.
- **Independent of:** the shadcn MCP's own skill — that one handles discovering and installing components; this one handles the *whole* prototyping cycle.

## Completion checklist

- [ ] Target feature identified; fidelity and scope explicit.
- [ ] `components.json` and shadcn MCP verified present (else stopped and redirected user).
- [ ] Prompt for Claude Design composed, approved by user.
- [ ] User opened Claude Design, linked repo, iterated to stable prototype.
- [ ] Handoff bundle captured under `docs/design/prototypes/<feature>/`.
- [ ] Per-entry update of `memory/14-design-system.md`; user approved each.
- [ ] Decision logged to `memory/07-decisions-log.md` if tokens/patterns changed.
- [ ] `memory-updater` ran.
- [ ] Closing HIGH recommendation emitted pointing to `implementation-planner`.

## Anti-patterns

- **NEVER:** Skip memory/14 and dump a generic prompt to Claude Design. The output will be visually off-brand and useless in 2 weeks.
- **NEVER:** Ignore memory/14 §Platform. If it's `mobile`, the prompt MUST say "MOBILE APP, not a responsive website", or Claude Design defaults to web aesthetics. If it's `web`, mentioning Expo / React Native in the prompt confuses the output. Platform field drives everything.
- **NEVER:** Commit the prototype's HTML/JSX to `src/`. It's an artifact, not code. Claude Code (via `implementation-planner`) produces the real implementation using the project's shadcn + conventions.
- **NEVER:** Batch-approve memory/14 updates. Each entry is a small decision that may echo into other projects via `continuous-learner`; treat it with the respect that implies.
- **NEVER:** Auto-install components that appeared in the prototype without the user confirming. Installation is `implementation-planner`'s move, not this skill's.
- **NEVER:** Run this skill if `components.json` is missing. Tell the user to run `scripts/install-shadcn-mcp` first and stop. Prototyping on top of an uninitialized DS is the "generic IA aesthetic" trap.
- **NEVER:** Replace the user's judgement. If Claude Design produces something cleaner than what's in memory/14, surface the delta and let the user decide — do not silently "upgrade" the system.
