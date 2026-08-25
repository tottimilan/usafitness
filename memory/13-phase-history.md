# Phase History — [PROJECT NAME]

> **Append-only log of phase transitions.** Every time the project moves from one phase to another (Idea → Discovery → Definition → Prototype → MVP → Iteration → Launch), add a new entry at the top of the *Transitions* section.
>
> This file is the timeline of the project's strategic posture. Consumed by `phase-gate-reviewer` to verify entry/exit criteria and by `project-deep-audit` to understand where the project has been.
>
> **Never** delete an entry. Supersede in place when a transition was reversed (e.g. reverted from Iteration back to Definition after a pivot).

---

## Current phase

**Phase:** MVP
**Since:** 2026-06-24 (corregido el 2026-08-25 — ver la transición del 2026-08-25)
**Confidence:** High (verificado con evidencia en el primer /mm-gate, no elegido)
**Next expected phase:** Iteration

---

## Phase definitions (canonical — do not edit per project)

> The table below is **generated** from `phase-criteria.json` (the single source of truth) by `scripts/render-phase-criteria.ps1` / `.sh`. Do not edit the rows by hand — edit `phase-criteria.json` and re-render. Entry/exit criteria for each phase also live in `phase-criteria.json` and are consumed by the `phase-gate-reviewer` skill and `scripts/phase-gate-check`.

<!-- BEGIN generated:phase-definitions (source: phase-criteria.json — do not edit by hand) -->
| Phase | Purpose | Typical artifacts produced |
|---|---|---|
| **Idea** | The thing is a sentence or a paragraph | `memory/00-project-brief.md` skeleton |
| **Discovery** | Validate problem + user + market | `docs/product/executive-summary.md`, `docs/product/personas.md`, `docs/product/competitive-analysis.md`, `memory/08-known-risks.md` |
| **Definition** | Lock the MVP scope | `docs/product/prd.md`, `docs/features/<epic>.md`, `docs/architecture/system-map.md`, first ADRs |
| **Prototype** *(UI projects only)* | Iterative full-app design before committing to MVP build. v1 → feedback → v2 → … → freeze. Validates experience with stakeholders/users on a navigable artifact. | `docs/design/mockups/v1-…/`, `v2-…/`, `final/`, updated `memory/14-design-system.md` (tokens, patterns, installed components frozen) |
| **MVP** | Build and ship the MVP | Code in `main`, `docs/flows/*.md`, `docs/testing/strategy.md`, feature-map MVP rows all `Shipped` |
| **Iteration** | Learn from users, improve | Updated `memory/08-known-risks.md` with real-world risks, pivots logged in `memory/07-decisions-log.md`, new slices shipped |
| **Launch** | Public release, scale | SLA/SLO docs, `docs/security/*` hardened, observability deployed, `docs/adr/` coverage complete |
<!-- END generated:phase-definitions -->

Transitions between phases require explicit approval via `phase-gate-reviewer`. Skipping phases is possible but must be logged as a decision.

**Prototype is the only optional canonical phase.** UI-heavy projects are strongly recommended to go through it; non-UI projects (backend-only services, CLIs, libraries, SDKs) may skip directly `Definition → MVP` with a mandatory `--skip-reason "no UI"` justification recorded in this file.

---

## Transitions

> Newest first. Each transition = one entry. Use the template below.

### 2026-08-25 — Corrección de registro: Iteration → MVP (la fase declarada era falsa)

- **Decided by:** User + Claude Opus 5 (el usuario aprobó la corrección explícitamente)
- **Trigger:** Primer `/mm-gate` del proyecto. Resuelve además la confirmación retroactiva
  que quedó pendiente el 2026-06-24 (*"Confidence at entry: Medium … confirm with /mm-gate
  after retroactive audit"*; *"Link to gate review: pending first /mm-gate run"*). Llevaba
  2 meses y 58 commits sin hacerse.
- **Esto NO es un avance de fase.** Es una corrección hacia atrás. El gate Iteration → Launch
  se ejecutó y salió **BLOCK** con 0 de 4 criterios de entrada cumplidos; al verificar la
  entrada en Iteration se descubrió que tampoco se había alcanzado nunca.

- **Hallazgo — 3 de los 4 `entry_criteria` de Iteration no se cumplían el 2026-06-24 y
  siguen sin cumplirse el 2026-08-25:**

  | Criterio | Evidencia (2026-08-25) |
  |---|---|
  | First user sessions logged | `ga4Id` en **0 de 7** tiendas. `curl` a los 4 dominios que ya sirven Astro: cero peticiones a `googletagmanager`. Inversión perversa: los 3 que siguen en WordPress **sí** miden (Las Rosas sirve `GTM-MR7678J5`), así que hoy migrar una tienda le *quita* la única medición que tenía. |
  | Observability in place | `package.json` tiene 2 dependencias (`astro`, `@astrojs/node`), ninguna de observabilidad. Sin endpoint de salud. `memory/08` Technical #3 sigue Open: *"prod errors are invisible until a user reports them"*. |
  | Zero Critical/High security findings open | Nunca se ejecutó `security-review`: el criterio se dio por cumplido por **ausencia de hallazgos, no de problemas**. `npm audit` devuelve hoy 10 vulnerabilidades, **8 High**, sin un solo triaje escrito. |
  | All P0 features shipped | **No evaluable.** No existe `docs/product/prd.md` ni frontera de MVP escrita. Sustantivamente la misión (migrar WordPress → sistema propio) va por **4 de 7**. |

- **Conclusión:** el proyecto no *transitó* a Iteration, fue **colocado** ahí durante el
  onboarding. La entrada del 2026-06-24 se conserva íntegra; esta la supersede en cuanto al
  registro de fase, no la borra.

- **Nota justa:** los 3 `exit_criteria` de Iteration **sí** se cumplen hoy (`memory/08` con
  riesgos reales y 7 cerrados citando commit, `memory/07` con 19 decisiones, 58 commits de
  slices nuevas). Cumplir la salida de una fase en la que no se entró legítimamente no
  valida la entrada en la siguiente.

- **Deuda de fases anteriores, registrada explícitamente:**
  - `docs/adr/` no existía hasta hoy. Cobertura: 1 ADR (este gate) sobre ~13 decisiones
    identificables. `Definition` exit *"first ADRs accepted"* y `MVP` entry *"Architecture
    ADRs accepted"* siguen incumplidos.
  - `expected_artifact_paths` que nunca existieron: `docs/product/prd.md`,
    `docs/architecture/system-map.md`, `docs/testing/strategy.md`, `docs/flows/`, `docs/features/`.

- **Condiciones de salida de MVP hacia Iteration (el próximo gate):**
  1. `ga4Id` relleno en las 4 tiendas que sirven Astro, verificado con `curl … | grep googletagmanager`.
  2. Monitor de uptime externo sobre los 7 dominios **emitiendo avisos**, no solo dado de alta.
  3. Triaje escrito de las 8 vulnerabilidades High, con las aceptadas en `memory/08` como *Accepted* y justificadas.
  4. Frontera de P0 declarada en `memory/06-feature-map.md` — hoy no existe, y sin ella "All P0 shipped" es inevaluable para siempre.

- **Confidence at entry:** High — corregido contra evidencia verificable, no por criterio.
- **Success metric for this phase:** 7/7 dominios sirviendo el sistema propio, con medición viva y datos legales completos en las 7 sociedades.
- **Link to gate review:** [`docs/adr/0001-phase-gate-iteration-launch.md`](../docs/adr/0001-phase-gate-iteration-launch.md)

### 2026-06-24 - Onboarded existing project into MASTERMIND at phase Iteration
- **Decided by:** User + <Model>
- **Trigger:** Existing codebase incorporated into MASTERMIND 2.0 via scripts/onboard-existing-project.
- **Entry criteria met:**
  - [x] Code exists in the repo (phase >= Idea was already the case).
  - [x] MASTERMIND shell installed (rules, skills, workflows, commands, hooks, scripts, memory skeleton).
  - [ ] Retroactive documentation of memory/ is the next step (run retroactive-documenter skill or /mm-audit on the codebase).
- **Artifacts promoted:** none yet; onboarding installs the shell, retroactive audit populates memory/.
- **Confidence at entry:** Medium (phase picked by user during onboarding; confirm with /mm-gate after retroactive audit).
- **Expected duration in new phase:** depends on where the project actually is.
- **Success metric for this phase:** to be set once memory/00-project-brief.md is filled.
- **Link to gate review:** ejecutado el 2026-08-25 → resultado: la fase elegida aquí era incorrecta. **Superseded** por la transición del 2026-08-25 (fase corregida a MVP). Esta entrada se conserva como registro de lo que se decidió entonces y con qué confianza.

### Transition template

```markdown
### YYYY-MM-DD — <Previous phase> → <New phase>
- **Decided by:** User + <Model>
- **Trigger:** <what prompted the transition>
- **Entry criteria met:**
  - [x] <criterion>
  - [x] <criterion>
- **Artifacts promoted:**
  - <path> — <summary>
- **Blockers waived (if any):**
  - <blocker> — <reason approved to skip>
- **Confidence at entry:** Low | Medium | High
- **Expected duration in new phase:** <weeks>
- **Success metric for this phase:** <what will tell us the phase is done>
- **Link to gate review:** `docs/adr/XXXX-phase-gate-<slug>.md` (or in-chat transcript reference)
```

### Entries

### 2026-05-03 — Template taxonomy change: canonical phases 6 → 7 (added `Prototype`)
- **Decided by:** Template author
- **Trigger:** Recognized that iterative full-app design (v1 → v2 → … → freeze) is a first-class activity for UI-heavy projects that was previously hidden inside Definition. Making it explicit gives it a gate, trackable duration, and stakeholder-friendly signal.
- **Entry criteria met:**
  - [x] User interview confirmed: "I always iterate 2–5 times on design before starting MVP build."
  - [x] Option 1 (formal phase) chosen over Option 3 (sub-step of Definition) because iteration duration measured in days/weeks merits its own phase.
- **Artifacts promoted:**
  - `.cursor/skills/mockup-factory/SKILL.md` — new skill with 3 modes (create / iterate / freeze)
  - `.claude/commands/mm-mockup.md` — new slash command
  - `.claude/workflows/07-full-app-prototyping.md` — new workflow
  - `phase-gate-reviewer` — updated for Definition→Prototype and Prototype→MVP transitions + skip rule for non-UI projects
- **Blockers waived:** none.
- **Confidence at entry:** High.
- **Expected duration in new phase (typical project):** 1–3 weeks.
- **Success metric for this phase:** stakeholder-approved mockup + frozen tokens/components in memory/14 before MVP build starts.
- **Link to gate review:** `memory/07-decisions-log.md#2026-05-03-added-prototype-phase`

_(This entry is the taxonomy change itself. Normal per-project transitions begin below.)_

_No per-project transitions yet. The project starts at `Idea` by default when the template is cloned. The first transition (`Idea → Discovery`) is logged when the user kicks off `doubt-surfacer` + `project-deep-audit` for the first time._

---

## Reverted / superseded transitions

> Transitions that were later reversed (pivot back, scope rollback, etc.). Kept as history.

_None yet._

---

## Maintenance

- `phase-gate-reviewer` writes here when a gate is approved.
- `memory-updater` writes here when a session crosses a phase boundary, even without formal gate review.
- On a clone of the template, leave the "Current phase" as `Idea` and let the first transition populate this file.

