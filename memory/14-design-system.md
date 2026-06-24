# Design system — this project

> **What this file is.** The text source of truth for every visual and UI decision in this repository. It lives in `memory/` because it's read by agents and humans alike, evolves with the project, and survives restarts. Not a duplicate of Figma. Not a screenshot in Slack. The canonical record.
>
> **Default stacks per platform:**
> - **Web:** [shadcn/ui](https://ui.shadcn.com) (via official MCP + Skill) + Tailwind CSS + Radix primitives. Prototyping via [Claude Design](https://claude.ai/design).
> - **Mobile:** [react-native-reusables](https://reactnativereusables.com) (RNR, the mobile sibling of shadcn/ui, same author behind shadcn's Expo PR #7540) + NativeWind v4 + Expo + Reanimated 3. Prototyping via Claude Design (mobile mode) + Expo Go for on-device preview.
> - **Cross-platform:** both stacks live in the same repo with 80%+ component API overlap.
>
> **Portable export:** run `scripts/export-design-md` to emit a `DESIGN.md` in the project root (the cross-tool standard format that Claude Design, Stitch, Cursor, v0, and Claude Code all understand).

---

## Platform

- **Platform:** _TBD_  (one of: `web` / `mobile` / `cross`)
- **Target devices:** _TBD_  (e.g. "iOS 16+ iPhone + iPad; Android 8+ phones")  _(mobile/cross only)_
- **Browsers:** _TBD_  (e.g. "evergreen Chromium + Safari 16+; no IE")  _(web/cross only)_
- **Minimum screen widths:** _TBD_  (e.g. mobile 375pt, web 320px)

Platform drives which rules apply in `.cursor/rules/08-design-system.mdc` and which scaffold `scripts/install-shadcn-mcp` runs. Keep this field accurate — most tooling in MASTERMIND branches on it.

---

## Project identity

- **Name:** _TBD_
- **Personality (3–5 adjectives):** _TBD_  (e.g. "calm, trustworthy, dense, data-first, serif")
- **Target feel vs competitors:** _TBD_  (e.g. "closer to Linear than to Notion; avoid the Stripe-dashboard overload")
- **Dark mode:** _TBD_  (default / opt-in / system-follows / not supported)
- **Reference products I admire for this project:** _TBD_
  - _product A_ — _reason_
  - _product B_ — _reason_

---

## Tokens

> Edit these values and the whole UI follows. Derived from `globals.css` / `tailwind.config.ts` / `components.json` (web) or `global.css` / `tailwind.config.js` (mobile). Code wins; if anything here diverges, update the doc. Never the other way.

### Colors

| Token | Light | Dark | Notes |
|---|---|---|---|
| `primary` | _TBD_ | _TBD_ | Main brand color; buttons, links |
| `secondary` | _TBD_ | _TBD_ | Supporting actions |
| `accent` | _TBD_ | _TBD_ | Highlights, focus |
| `destructive` | _TBD_ | _TBD_ | Delete, error |
| `muted` | _TBD_ | _TBD_ | Backgrounds of inactive regions |
| `background` | _TBD_ | _TBD_ | Page / screen background |
| `foreground` | _TBD_ | _TBD_ | Default text |
| `border` | _TBD_ | _TBD_ | Dividers |

### Typography

- **Display font:** _TBD_  (e.g. "Fraunces, serif" on web; "Inter_600SemiBold" via expo-font on mobile)
- **Sans font:** _TBD_  (e.g. "Inter, system-ui" on web; "System" on mobile — iOS `SF Pro`, Android `Roboto`)
- **Mono font:** _TBD_
- **Scale:** _TBD_  (default shadcn-style is fine unless overridden)

### Spacing & geometry

- **Base unit:** _TBD_  (default: 4px; Tailwind's 1 = 4px; NativeWind follows)
- **Radius base:** _TBD_  (common choices: 0.25rem tight, 0.5rem default, 0.75rem soft, 1rem rounded)
- **Container max-width (web):** _TBD_
- **Touch target minimum (mobile):** _TBD_  (recommend 44pt iOS / 48dp Android)

### Motion

- **Default easing:** _TBD_  (e.g. `ease-in-out`, or `Easing.bezier(0.4, 0, 0.2, 1)` in RN Reanimated)
- **Default duration:** _TBD_  (150ms subtle / 300ms primary)
- **Reduced motion policy:** _TBD_  (respect `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled()`)

---

## Installed components

> Every component copied into the repo via `npx shadcn add` (web) or via RNR's CLI (mobile). When the agent adds one, append a row here. Drift between this table and `src/components/ui/` is a bug — `project-deep-audit` flags it.

| Component | Installed at | Source | Customizations? | Used where |
|---|---|---|---|---|
| _(empty until first install)_ | | | | |

---

## Custom components

> Not from shadcn/RNR. Live in `src/components/custom/`. Each one needs a reason.

| Component | Reason not standard | Composes | Stability |
|---|---|---|---|
| _(empty)_ | | | |

---

## Mobile-specific (only fill if Platform = `mobile` or `cross`)

> Skip this entire block if the project is web-only.

### Safe-area policy

- **Strategy:** _TBD_  (e.g. "SafeAreaView from react-native-safe-area-context on every screen; no raw top/bottom padding")
- **Edges handled:** _TBD_  (e.g. "top + bottom always; left/right when landscape matters")

### Platform differences (iOS ↔ Android)

- **Strategy:** _TBD_  (e.g. "Minimize `Platform.OS` branches; prefer shared components that adapt via props")
- **Known divergences:** _TBD_  (e.g. "iOS uses SF Symbols via react-native-sf-symbols; Android uses Material Symbols. Wrapped in `<AppIcon name='…' />`.")
- **Haptics:** _TBD_  (e.g. "expo-haptics on taps in primary actions; silent on destructive to avoid false positives")

### Orientation

- **Supported:** _TBD_  (portrait / landscape / both)
- **Locked?:** _TBD_

### Tab bar / navigation pattern

- **Primary pattern:** _TBD_  (e.g. "Bottom tab bar, 4 tabs max, Expo Router `(tabs)` group")
- **Rail or drawer on tablet?** _TBD_

### Gestures

- **Swipe-back policy:** _TBD_  (iOS default yes; Android "off" usually)
- **Bottom-sheet libraries used:** _TBD_  (e.g. `@gorhom/bottom-sheet`)

### Preview pipeline

- **Expo Go:** _TBD_  (yes / no — depends on whether you use custom native modules)
- **Dev client:** _TBD_  (required if you ship push notifications, custom native code, Turnstile WebView, etc.)
- **Tunnel / local network:** _TBD_  (stakeholder preview strategy)

---

## What I like (visual preferences)

> Your aesthetic axioms. Agents honor these when proposing designs in `prototype-designer` or Claude Design.

- _TBD_  (e.g. "Generous whitespace over dense grids.")
- _TBD_  (e.g. "Serif display for hero, sans for the rest.")
- _TBD_  (e.g. "Soft radius (0.75rem+) — never sharp corners.")
- _TBD_  (e.g. "One accent color max per screen.")
- _TBD_  (e.g. "Data tables compact, forms spacious.")

## What I don't like (anti-patterns)

> Equally important. Agents must not propose these.

- _TBD_  (e.g. "No neon gradients.")
- _TBD_  (e.g. "No more than 2 font weights per view.")
- _TBD_  (e.g. "No sticky headers on content pages.")
- _TBD_  (e.g. "No modal-stacking three deep.")
- _TBD_  (mobile-specific, e.g. "No `alert()` — always in-app toast or custom modal.")

---

## Patterns we use repeatedly

> Reusable compositions, not components. Named in prose so you can reference them in prompts.

| Pattern | Used for | Composition | Platforms | First used in |
|---|---|---|---|---|
| _(empty)_ | | | | |

Examples (delete if not applicable):
- **"Hero + three-column feature grid"** — marketing landings. `Card` × 3 inside a flex container with `gap-6`. Platform: web.
- **"Sidebar dashboard with stats row"** — app dashboards. `Sidebar` + `StatCard` × N. Platform: web.
- **"Onboarding carousel (3–5 slides)"** — first-launch intro. `FlatList` horizontal with pagination dots + skip + next. Platform: mobile.
- **"Bottom-sheet form"** — inline editing on mobile. `@gorhom/bottom-sheet` + shadcn/RNR Form inside. Platform: mobile.
- **"Tab bar + stack"** — primary app navigation on mobile. Expo Router `(tabs)` group + nested `(stack)` per tab. Platform: mobile.

---

## References / inspiration

> Links, not screenshots (those rot). Internal reference for prompts to Claude Design: *"make it feel like X"*.

- _URL — why it's a reference_
- _URL — why it's a reference_

## Changelog

> Append-only. One entry per visual decision that materially changes the look.

### YYYY-MM-DD — _what changed_
- Before: _brief_
- After: _brief_
- Reason: _brief_
- Files affected: _list_
- Linked decision: `memory/07-decisions-log.md#YYYY-MM-DD-title`

---

## Integration with tooling

- **shadcn MCP** installed at `.cursor/mcp.json` (+ `.mcp.json` for Claude Code). Status: _TBD_ (active / not yet).
- **shadcn Skill** (`npx skills add shadcn/ui`). Status: _TBD_.
- **Claude Design** project linked: _TBD_ (URL to the design project on `claude.ai/design`).
- **DESIGN.md export** (portable cross-tool format): run `pwsh -File scripts/export-design-md.ps1` to generate / regenerate. Status: _TBD_ (never exported / last exported YYYY-MM-DD).
- **MASTERMIND skills that write here:** `prototype-designer` (via `/mm-design`) + `memory-updater` at session close.

---

## Open questions about design (for next session)

- _TBD_

(empty is OK — it means you have no pending visual questions right now.)
