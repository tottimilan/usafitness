# Decisions Log — [PROJECT NAME]

> _To be developed. Append-only. Never edit past decisions; add a new entry that supersedes them._

## Format

```
### YYYY-MM-DD — Decision title
- **Decision:**
- **Reason:**
- **Alternatives considered:**
- **Consequences:**
- **Files affected:**
- **Supersedes:** (optional link to previous decision)
```

## Entries

### 2026-06-26 — Retroactive memory seeding via retroactive-documenter
- **Decision:** Seeded `memory/00, 02, 03, 04, 06, 08` from observed codebase facts during MASTERMIND onboarding (phase Iteration), one commit per approved file.
- **Reason:** Onboarding an existing, previously-undocumented project; populate memory from code reality instead of leaving placeholders, so `/mm-audit` and `/mm-gate` have a factual base.
- **Alternatives considered:** Leave the skeleton intact and fill manually — rejected: slower, inconsistent, and loses code provenance.
- **Consequences:** `memory/` now reflects code reality at commit `77ccd78`. Strategic layer (personas, monetization, UVP, non-negotiables, prioritized Top-10 risks, Hard Truth) still pending via `/mm-audit` (Phase 6); phase confirmation pending via `/mm-gate` (Phase 7).
- **Files affected:** `memory/00-project-brief.md`, `memory/02-current-state.md`, `memory/03-architecture.md`, `memory/04-data-model.md`, `memory/06-feature-map.md`, `memory/08-known-risks.md`, `memory/13-phase-history.md`.
- **Supersedes:** —
