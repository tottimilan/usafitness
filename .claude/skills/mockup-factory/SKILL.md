---
name: mockup-factory
description: Produce a full-app iterative navigable mockup before MVP build starts. Platform-aware via memory/14 §Platform: web (Next.js + shadcn/ui + browser preview) or mobile (Expo + react-native-reusables + NativeWind + Expo Go preview). Three modes — `create` (v1 from memory/05 flows + memory/06 features + memory/14 tokens), `iterate` (stakeholder feedback → v2/v3/.../vN), `freeze` (consolidate design-final into memory/14, log transition in memory/13). Working skill of the canonical `Prototype` phase between Definition and MVP. Differs from `prototype-designer`, which prototypes ONE feature inside MVP/Iteration; mockup-factory prototypes the ENTIRE product before any MVP code exists. Use when entering Prototype via `/mm-gate Prototype`, or when the user says "mockup the full app", "design the whole product", "mm-mockup create", "iterate on the mockup", "freeze the design". Requires design system installed (scripts/install-shadcn-mcp), memory/14 + 05 + 06 populated, and Claude Design access.
---

# Mockup Factory

## Goal

Make the activity of "iteratively designing the entire product before writing a line of MVP code" **predictable, trackable, and reversible**. Claude Design alone gives you a canvas; this skill gives you a **disciplined loop** that persists every iteration, captures stakeholder feedback explicitly, and ends with a formal freeze + handoff that updates the project's canonical memory so the MVP build starts on solid, frozen design foundations.

Why this matters: design decisions made at this stage (which components, which layouts, which gestures, which navigation pattern) compound across every MVP screen. A mockup that has been stress-tested through 2–5 iterations with real stakeholders costs 2 weeks of time but saves 6+ weeks of implementation rework downstream. Without structure, iteration degrades into "eternally tweaking without knowing when to stop" — freeze gives closure.

## When to use

**Use when:**
- Project has just exited Definition gate (PRD, flows, feature-map, and memory/14 §Platform + identity + tokens all filled).
- Project has UI that matters to the user experience (web app, mobile app, marketing site, dashboard — anything where the visual layer IS a large part of the value).
- You want stakeholder-visible validation before committing engineering resources to MVP implementation.
- The user explicitly invokes `/mm-mockup create`, or says "mockup the full app", "let's design the whole product", "I want to see this before building", "iterate on the mockup", "freeze the design".

**Do NOT use when:**
- **Single-feature prototyping** — use `prototype-designer` / `/mm-design` instead. Mockup-factory is for the entire product; prototype-designer is for one feature inside an already-built product.
- **Non-UI projects** — backend services, CLIs, libraries, SDKs, internal tools where the stakeholder is the developer themselves. Skip the Prototype phase entirely with `--skip-reason "no UI"`.
- **During active MVP build** — once you're in MVP, you're implementing. If an MVP iteration reveals a design flaw, iterate the specific feature via prototype-designer; don't restart a full-app mockup.
- **Proof-of-concept that will be thrown away** — mockup-factory produces artefacts that persist (memory updates, docs/design/ entries). If you just want a quick sketch, use Claude Design's chat directly without this skill.
- **As a substitute for user research** — the mockup validates experience, not problem. If you haven't validated the problem exists, go back to Discovery.

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/00-project-operating-system.mdc`
3. `.cursor/rules/06-execution-modes.mdc` (Coach mode dominates this skill)
4. `.cursor/rules/08-design-system.mdc` (platform-aware design policies)
5. `memory/00-project-brief.md` (product identity, audience)
6. `memory/05-user-flows.md` (every flow must exist as a prototype screen)
7. `memory/06-feature-map.md` (MVP slice features = the mockup's scope)
8. `memory/14-design-system.md` (**the central input**; §Platform drives the whole skill; §Tokens, §Patterns, §Likes, §Anti-patterns constrain Claude Design output)
9. `memory/07-decisions-log.md` (check for prior design decisions that must be honored)

Verify environment:

- `memory/14 §Platform` is one of `web` / `mobile` / `cross`. If missing or `_TBD_`, STOP and tell the user to set it first (it drives every subsequent step).
- `components.json` exists at project root (design system initialized). If not, STOP and recommend `scripts/install-shadcn-mcp.ps1 -Apply`.
- User has Claude Design access (`claude.ai/design` reachable, plan is Pro/Max/Team/Enterprise).
- Project is currently in `Prototype` phase (check `memory/02-current-state.md §Phase`). If not yet there, either run `/mm-gate Prototype` first, or proceed with a warning (user may be exploring early).
- For mobile: `expo` package installed and Expo Go available on the stakeholder's device for preview. If neither, warn the user that mobile preview will be limited to Claude Design's canvas (which is acceptable but not native-fidelity).

## Process

The skill has three modes. The user invokes one at a time.

---

### Mode 1: `create` — produce v1 from scratch

**Trigger:** `/mm-mockup create [scope-hint]`, or "mockup the full app", "design the whole product", "create the first version".

**Steps:**

1. **Scope confirmation.** Confirm with the user:
   - Which MVP features are in the mockup? (Default: all shipped MVP slices from `memory/06`.)
   - Which flows are in? (Default: all flows in `memory/05`.)
   - Any explicit out-of-scope? (Post-MVP backlog features generally stay out.)
   - Fidelity: wireframe (low-fi, layout-only, great for early alignment) or hi-fi (tokens applied, closer to final).
   - Audience for v1: just you, or a specific stakeholder you'll share with?

2. **Initialize mockup directory.**
   - Create `docs/design/mockups/` if missing.
   - Create `docs/design/mockups/v1-YYYY-MM-DD/` with placeholder files: `prompt.md`, `claude-design-url.txt`, `handoff-bundle/` (empty), `screenshots/` (empty), `feedback.md` (placeholder).
   - Create `docs/design/mockups/README.md` if missing: an index documenting each iteration, its date, its status, and a pointer to `final/` when frozen.

3. **Compose the platform-tuned Claude Design prompt.** Read memory/14 §Platform and pick the skeleton:

   **Web skeleton:**
   ```
   Build a fully navigable web app prototype for <project name>.
   Platform: web (responsive, <breakpoints from memory/14>).
   
   Flows (all of them must be clickable, including empty states and error states):
     <numbered list from memory/05>
   
   MVP features to cover:
     <list from memory/06 with status = MVP>
   
   Design system (non-negotiable; strict):
     - Tokens: primary <color>, radius <value>, fonts <display + sans>, dark mode <policy>.
     - Components: shadcn/ui — <list from memory/14 §Installed components>. 
       If a needed component is missing, note it in the output; don't invent.
     - Patterns we reuse: <from memory/14 §Patterns, filter Platform = web or cross>.
     - Likes: <from memory/14 §What I like>.
     - Anti-patterns — DO NOT: <from memory/14 §What I don't like>.
     - References (match the feel of): <URLs from memory/14 §References>.
   
   Fidelity: <wireframe | hi-fi>.
   Deliverable: fully navigable web prototype I can click through; export as handoff bundle for Claude Code.
   ```

   **Mobile skeleton:**
   ```
   Build a fully navigable MOBILE APP prototype for <project name>.
   Platform: mobile — iOS + Android. THIS IS NOT A RESPONSIVE WEBSITE. Native app chrome.
   Framework: Expo + React Native + Expo Router (file-system routing, tab group + stacks).
   
   Flows (all clickable, including empty states, loading states, error states):
     <numbered list from memory/05, framed as mobile screens not routes>
   
   MVP features to cover:
     <list from memory/06 with status = MVP>
   
   Design system (non-negotiable; strict):
     - Tokens: primary <color>, radius <value>, fonts <display + sans>, dark mode <policy>.
     - Components: react-native-reusables (RNR) — <list from memory/14 §Installed components>. 
       Use RNR's mobile variants; not web shadcn.
     - Styling: NativeWind v4 (Tailwind for React Native). No inline styles.
     - Layout: mobile-first (iPhone 13 width baseline, 390pt). Tab bar at bottom (4 tabs max if used). NEVER a top nav.
     - Safe-area: every screen wrapped in SafeAreaView from react-native-safe-area-context.
     - Touch targets: ≥ 44pt iOS / 48dp Android.
     - Navigation: Expo Router — tab group for primary nav, stack groups for sub-flows. No modals > 2 deep.
     - Gestures: haptics on primary CTAs (subtle); never on destructive actions.
     - iOS/Android differences: minimize; use a single component that adapts via props or safe-area context rather than Platform.OS branching everywhere.
     - Mobile-specific from memory/14 §Mobile-specific: <safe-area policy, orientation, tab bar pattern, gestures, preview pipeline>.
     - Patterns we reuse: <from memory/14 §Patterns, filter Platform = mobile or cross>.
     - Likes: <from memory/14 §What I like>.
     - Anti-patterns — DO NOT: <from memory/14 §What I don't like (especially mobile: no alert(), no modal-stacking 3+ deep, no Platform.OS branching everywhere, no legacy Animated API, no AsyncStorage for tokens)>.
     - References (match the feel of): <URLs from memory/14 §References, filter mobile apps>.
   
   Fidelity: <wireframe | hi-fi>.
   Deliverable: fully navigable mobile app prototype; export as handoff bundle for Claude Code — which will implement with Expo Router, NativeWind, Reanimated 3, SafeAreaView wrapping, expo-secure-store, and touch targets ≥ 44pt/48dp, following the conventions in .cursor/templates/CLAUDE.md.mobile.md.
   ```

   **Cross:** ask which surface to prototype first (web or mobile); running both in one Claude Design project is not recommended — the mental model diverges.

4. **Write the prompt to `v1-<date>/prompt.md`.** Save verbatim for reproducibility.

5. **Guide the user through Claude Design.**
   - Open `claude.ai/design` → create new project named `<project-name> / Full App Mockup v1`.
   - Link the GitHub repo (Claude Design reads `components.json`, `tailwind.config.*`, and `DESIGN.md` if present).
   - **Pro tip:** run `pwsh -File scripts/export-design-md.ps1 -Apply` before linking — DESIGN.md gives Claude Design far more context than the raw repo.
   - Paste the prompt from Step 4.
   - Iterate within Claude Design's canvas until v1 is reasonably complete.
   - Paste the Claude Design project URL into `v1-<date>/claude-design-url.txt`.
   - Export → **Hand off to Claude Code** → save the bundle URL / folder into `v1-<date>/handoff-bundle/`.
   - Take screenshots of key flows; save under `v1-<date>/screenshots/`.

6. **Update index.**
   - Append to `docs/design/mockups/README.md`: "v1 created YYYY-MM-DD, status: awaiting feedback, URL: <Claude Design URL>, scope: <summary>".

7. **Close v1 creation.**
   - Invoke `memory-updater` to append a session entry to `memory/11-session-summary.md`: "Full-app mockup v1 produced for <project>. Scope: <features>. Status: awaiting stakeholder feedback."
   - Closing HIGH recommendation:
     ```
     **Next recommended command:** share v1 with stakeholder(s) + run `/mm-mockup iterate --feedback "<their notes>"` when you get responses.
     **Why:** v1 is an opening hypothesis, not a final. Every feedback cycle sharpens it.
     **Skip if:** v1 feels right on first pass (unusual; be skeptical).
     ```

---

### Mode 2: `iterate` — produce v(N+1) from stakeholder feedback

**Trigger:** `/mm-mockup iterate --feedback "<freeform feedback text>"`, or "iterate on the mockup", "apply this feedback", "v2 please".

**Steps:**

1. **Determine the current version.** Look at `docs/design/mockups/` — the highest `v<N>-<date>/` folder is the current iteration.

2. **Record the feedback.** Append to `v<N>-<date>/feedback.md`:
   ```markdown
   ### YYYY-MM-DD — feedback from <source>
   
   <verbatim feedback text the user provided>
   
   **Decoded intent (drafted by skill, confirm with user):**
   - <bullet: interpreted change request>
   - <bullet: interpreted change request>
   - …
   ```

3. **Draft change list.** From the feedback, produce an actionable change list. Examples:
   - "Increase CTA size throughout" → token change: button padding up, font-weight up.
   - "The onboarding feels too long" → structural: collapse 4 steps into 2.
   - "Dark mode needed" → add dark variants to tokens + ask Claude Design to produce dark screens alongside light.
   - "I don't like the blue" → token change: revisit primary color.

   Present the change list to the user. Get explicit `approve` / `edit` / `abort` before proceeding.

4. **Initialize the new version directory.** Create `docs/design/mockups/v<N+1>-YYYY-MM-DD/` with the same structure (prompt.md, claude-design-url.txt, handoff-bundle/, screenshots/, feedback.md placeholder).

5. **Compose the v(N+1) prompt.** Take the v1 prompt as base + append "Changes from v<N>:" section listing the approved change items. Save to `v<N+1>-<date>/prompt.md`.

6. **Guide the user back to Claude Design.**
   - In the same Claude Design project (don't create a new one per iteration — use Claude Design's "Save what we have and try a completely different approach" feature if needed, or iterate linearly), paste the change list + updated prompt.
   - Export the updated handoff bundle to `v<N+1>-<date>/handoff-bundle/`.
   - New screenshots in `v<N+1>-<date>/screenshots/`.

7. **Update index.** Append to `docs/design/mockups/README.md`: "v<N+1> produced YYYY-MM-DD from v<N> + feedback. Key changes: <summary>. Status: awaiting feedback."

8. **Close.**
   - `memory-updater` append session summary.
   - Closing MEDIUM recommendation:
     ```
     **Next:** share v<N+1> with the stakeholder; if they approve, run `/mm-mockup freeze` to close the phase. If more feedback, run `/mm-mockup iterate` again.
     **Why:** iteration count is a signal. 2–5 is normal. More than 8 suggests scope confusion — pause and revisit memory/05 / memory/14.
     ```

---

### Mode 3: `freeze` — declare the current version design-final

**Trigger:** `/mm-mockup freeze`, or "freeze the design", "approve this version", "this is the final mockup".

**Steps:**

1. **Confirm which version is being frozen.** Usually the highest existing `v<N>-<date>/`. Ask the user to confirm explicitly — freeze is a one-way gate (can be un-frozen via explicit decision log entry, but that's a pivot, not a routine action).

2. **Stakeholder sign-off check.** Ask: "Did the stakeholder(s) sign off on v<N>? In what form? (Slack message, email, verbal in meeting)." Record the sign-off in `docs/design/mockups/v<N>-<date>/feedback.md` under a "Final approval" heading.

3. **Copy to `final/`.**
   - Create `docs/design/mockups/final/` (delete if it exists — freeze supersedes).
   - Copy the contents of `v<N>-<date>/` into `final/`.
   - Create `final/README.md`: "Design frozen from v<N> (originally produced YYYY-MM-DD, approved YYYY-MM-DD by <stakeholder>)."

4. **Consolidate decisions back into memory/14.** For each of the following, update if the frozen mockup diverged from what was in memory/14 before:
   - **Tokens:** any color, typography, spacing, radius, motion values that the mockup uses but weren't in memory/14 §Tokens → propose the update to the user one by one; on approve, write to memory/14.
   - **Components:** any shadcn/RNR component the mockup uses that wasn't in memory/14 §Installed components → add rows flagged "to install in MVP build".
   - **Custom components:** any component in the mockup that isn't from shadcn/RNR → add row to memory/14 §Custom components with reason, composition, stability.
   - **Patterns:** any composition reused across multiple screens → add to memory/14 §Patterns.
   - **Likes confirmed / anti-patterns confirmed:** if iterations crystallized preferences, append to memory/14 §What I like / §What I don't like.
   - **Changelog:** append entry:
     ```markdown
     ### YYYY-MM-DD — Full-app mockup frozen at v<N>
     - Before: memory/14 had <partial content>.
     - After: design tokens and components locked based on stakeholder-approved v<N>.
     - Reason: exiting Prototype phase; MVP build starts on these foundations.
     - Files affected: memory/14-design-system.md, docs/design/mockups/final/**.
     - Linked decision: memory/07-decisions-log.md#<slug>
     ```

5. **Write decision entry in memory/07-decisions-log.md.** Template:
   ```markdown
   ### YYYY-MM-DD — Design frozen: full-app mockup v<N> approved
   - Decision: Freeze the full-app mockup at v<N> (produced YYYY-MM-DD, approved YYYY-MM-DD by <stakeholder>).
   - Reason: Prototype phase exit criterion reached. MVP build begins on these foundations.
   - Iterations: v1 → v2 → … → v<N>. Feedback themes: <summary 2–3 lines>.
   - Alternatives considered during iteration: <themes that were tried and rejected>.
   - Consequences: memory/14 tokens / patterns / components locked; MVP implementation-planner reads from memory/14 and docs/design/mockups/final/ for component and layout decisions.
   - Files affected: memory/14, docs/design/mockups/final/**, memory/13 (transition entry to MVP).
   ```

6. **Update memory/13-phase-history.md.** If the project isn't already at Prototype phase, the freeze is premature — warn and ask the user to run `/mm-gate Prototype` first. Otherwise, do NOT auto-transition to MVP here. Emit a recommendation for `/mm-gate MVP` as the next step; `phase-gate-reviewer` will validate entry criteria (frozen mockup present, memory/14 up to date) and write the transition entry.

7. **Update `docs/design/mockups/README.md`.**
   - Mark v<N> as "FROZEN (final) on YYYY-MM-DD".
   - Add bolded reference to `final/`.

8. **Close.**
   - `memory-updater`.
   - Closing HIGH recommendation:
     ```
     **Next recommended command:** `/mm-gate MVP`.
     **Why:** design is frozen; memory/14 is canonical; `implementation-planner` has the inputs it needs. Further delay is wasted context.
     **Go ahead:** type `go` and I'll run phase-gate-reviewer for the Prototype → MVP transition.
     **Skip if:** there's any pending non-design work in the Prototype phase (security review of auth flow, for example) that should happen before MVP gate.
     ```

---

### Mode 4: `status` — report current iteration state

**Trigger:** `/mm-mockup status`, or "where are we on the mockup", "what's the mockup status".

**Steps:**

1. Scan `docs/design/mockups/` → count versions, find highest.
2. Check if `final/` exists → if yes, report "FROZEN at v<N>".
3. If not frozen, report:
   - Current version: v<N> (produced YYYY-MM-DD).
   - Time since v<N> produced: <days>.
   - Last feedback recorded: yes/no (and date).
   - Project phase: <from memory/02>.
   - Recommendation: if v<N> has feedback but no v<N+1>, run `/mm-mockup iterate`; if v<N> has approval, run `/mm-mockup freeze`; if v<N> has neither for > 5 days, gently prompt the user to check in with the stakeholder.

## Outputs

Per iteration (any mode except `status`):

- `docs/design/mockups/v<N>-<date>/prompt.md` — the prompt sent to Claude Design.
- `docs/design/mockups/v<N>-<date>/claude-design-url.txt` — project URL for future iteration.
- `docs/design/mockups/v<N>-<date>/handoff-bundle/` — Claude Design export.
- `docs/design/mockups/v<N>-<date>/screenshots/` — captures for async sharing.
- `docs/design/mockups/v<N>-<date>/feedback.md` — stakeholder feedback + decoded intent.
- `docs/design/mockups/README.md` — index of all iterations.

Per freeze:

- `docs/design/mockups/final/` — canonical approved version.
- Updates to `memory/14-design-system.md` (tokens, components, patterns, changelog).
- Entry in `memory/07-decisions-log.md`.
- Updated `memory/11-session-summary.md`.

## Interactions with other skills

- **Invoked by:** user via `/mm-mockup`; workflow `07-full-app-prototyping` (phases 4–9); or naturally when entering Prototype phase.
- **Reads from:** `memory/05-user-flows`, `memory/06-feature-map`, `memory/14-design-system`, `memory/00-project-brief`, `memory/02-current-state`, `memory/07-decisions-log`.
- **Writes to:** `docs/design/mockups/**`, `memory/14`, `memory/07`, `memory/13` (indirectly via `phase-gate-reviewer`), `memory/11`.
- **Feeds into:** `phase-gate-reviewer` (for the `Prototype → MVP` gate check) → `implementation-planner` (which consumes memory/14 + docs/design/mockups/final/ to produce the MVP plan).
- **Closes with:** `memory-updater`.
- **Companion (not substitute):** `prototype-designer` — same universe, different scope (single feature vs full app).

## Completion checklist

After each mode run, verify:

### For `create`:
- [ ] memory/14 §Platform was read; prompt skeleton matched it.
- [ ] `v1-<date>/` exists with prompt.md, claude-design-url.txt, handoff-bundle/, screenshots/, feedback.md placeholder.
- [ ] `docs/design/mockups/README.md` index updated.
- [ ] memory-updater appended session entry.
- [ ] Closing HIGH recommendation emitted.

### For `iterate`:
- [ ] Feedback recorded verbatim in feedback.md of previous version.
- [ ] Change list drafted, user approved per-item.
- [ ] `v<N+1>-<date>/` exists with full structure.
- [ ] Index updated.
- [ ] User guided back to Claude Design (same project, not new one).
- [ ] memory-updater ran.

### For `freeze`:
- [ ] Stakeholder sign-off recorded in feedback.md.
- [ ] `final/` exists with copied content.
- [ ] memory/14 §Tokens, §Installed components, §Patterns, §Custom components, §Likes, §Anti-patterns, §Changelog all reviewed and updated (per-item approval).
- [ ] Decision entry written in memory/07-decisions-log.md.
- [ ] Index marked FROZEN.
- [ ] memory-updater ran.
- [ ] HIGH recommendation to `/mm-gate MVP` emitted.

## Anti-patterns

- **NEVER:** Start Mode 1 (`create`) without reading memory/14 §Platform first. Web and mobile prompts are fundamentally different; wrong prompt → wrong output.
- **NEVER:** Treat v1 as final. If the user says "this is perfect, let's freeze", ask "have you shared it with anyone else for feedback?" and push gently. V1 seeming perfect is usually a signal of insufficient exposure.
- **NEVER:** Create a new Claude Design project per iteration. Iterate within the same project; Claude Design's history keeps previous versions accessible.
- **NEVER:** Commit the mockup's HTML/JSX/React Native code to `src/` of the real project. The mockup is a validation artefact, not production code. Production comes from `implementation-planner` + Claude Code reading `final/` + memory/14.
- **NEVER:** Skip the freeze step. "Informal freeze" (user moves on without running `freeze`) means memory/14 is not consolidated, `implementation-planner` has stale inputs, and MVP builds on drift.
- **NEVER:** Batch-approve the memory/14 updates during freeze. Every token, every component, every pattern is a decision worth logging consciously. It takes 10 extra minutes and saves weeks of later re-work.
- **NEVER:** Run this skill for a backend-only project or CLI. Tell the user to skip the Prototype phase with `--skip-reason "no UI"` and go straight to MVP.
- **NEVER:** Iterate > 8 times without pausing. Iteration count is a signal. 2–5 is healthy. 8+ means the problem is upstream (scope unclear, memory/05 incomplete, stakeholder misaligned). Pause and audit.
- **NEVER:** Freeze without stakeholder sign-off recorded. "I think it's fine" from yourself alone is not sign-off — the whole point of mockup-factory is external validation.
- **NEVER:** Overwrite `final/` without a new freeze. If the frozen design needs to change, that's a decision (log in memory/07), not a silent edit. Typically means the project is pivoting back to Prototype phase from MVP — a bigger signal.
