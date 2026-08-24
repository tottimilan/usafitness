# Decisions Log — USAFitness Landing Pages

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

### 2026-08-24 — Las secciones sin datos no se renderizan (germen del sistema de secciones)
- **Decision:** `whatsapp`, `reviews[]` y `galleryImages[]` pasan a opcionales; si faltan, su sección no se emite. `aggregateRating` solo se declara si hay reseñas reales.
- **Reason:** el alta de GranCasa (sin WhatsApp ni reseñas) reventaba con `undefined.replace()` y habría publicado `"ratingValue":"NaN"`. Es además el primer paso real hacia el sistema de secciones de `memory/01`.
- **Alternatives considered:** rellenar con datos falsos — rechazado: publicaría reseñas inventadas en la web de una empresa real.
- **Consequences:** una tienda puede darse de alta con datos parciales. Sigue fijo el ORDEN de las secciones y siguen hardcodeados `Products`, `Promotions` y `Brands`.
- **Files affected:** `src/components/WhatsAppFloat.astro`, `src/components/Schedule.astro`, `src/layouts/Landing.astro`, `src/pages/[...slug].astro`. Commit `828ec40`.

### 2026-08-24 — Sync desde la plantilla MASTERMIND con 3 preservaciones
- **Decision:** sincronizados 64 ficheros desde `MASTERMIND TEMPLATE 2.0`, preservando `README.md`, `.cursor/rules/02-tech-stack.mdc` y las entradas propias de `.gitignore` (`.astro/`, `*.code-workspace`).
- **Reason:** el whitelist del sync incluye ficheros que aquí son del proyecto, no de la plantilla. El README documenta `stores.json` y el despliegue.
- **Alternatives considered:** sync completo sin preservar — rechazado: habría sustituido la documentación del proyecto por la de la plantilla.
- **Consequences:** el dry-run devolverá **exit 1 para siempre** con esos 3 ficheros. Es lo correcto, no un fallo. `template-audit` reporta un COUNT_MISMATCH (9 vs 10 reglas) que es falso positivo por `usafitness-project.mdc`.
- **Files affected:** 64 ficheros de `.cursor/`, `.claude/`, `scripts/` y documentos raíz. Commit `f079ecf`.

### 2026-08-24 — Excepción de stack: el sistema de diseño de la plantilla NO aplica
- **Decision:** en este repositorio no se usan `prototype-designer`, `mockup-factory`, `/mm-design`, `/mm-mockup` ni `scripts/install-shadcn-mcp.ps1`, y las reglas de `08-design-system.mdc` se ignoran.
- **Reason:** la plantilla asume React + Tailwind + shadcn/ui. Esto es Astro con HTML/CSS puro. `install-shadcn-mcp` termina en `exit 2` aquí, y las skills se disparan con palabras españolas ("diseña", "prototipo") que en un proyecto de landings son frases normales.
- **Alternatives considered:** adoptar shadcn — rechazado: exigiría React y destruiría el ~0 JS que sostiene el SEO.
- **Consequences:** el sistema de diseño real queda documentado en `memory/14-design-system.md` (custom properties de `src/styles/global.css`).
- **Files affected:** `.cursor/rules/usafitness-project.mdc`, `memory/14-design-system.md`.

### 2026-08-24 — Destino B (plataforma de campañas), pero por etapas
- **Decision:** el proyecto acabará gestionando campañas SEM/Meta desde aquí, pero primero secciones y landings optimizadas, después medición, y la plataforma al final.
- **Reason:** decisión explícita del usuario. Ver `memory/01-product-vision.md`.
- **Consequences:** "sin panel, sin BD, sin auth" pasa a ser temporal, no permanente. La configuración por tienda debe ser **dato estructurado**, no condicionales dispersos, para poder migrar a una fila de BD.
- **Files affected:** `memory/01-product-vision.md`.

### 2026-08-24 — Retroactive memory seeding via retroactive-documenter
- **Decision:** Seeded `memory/00, 02, 03, 04, 06, 08` from observed codebase facts during MASTERMIND onboarding (phase Iteration), one commit per approved file.
- **Reason:** Onboarding an existing, previously-undocumented project; populate memory from code reality instead of leaving placeholders, so `/mm-audit` and `/mm-gate` have a factual base.
- **Alternatives considered:** Leave the skeleton intact and fill manually — rejected: slower, inconsistent, and loses code provenance.
- **Consequences:** `memory/` now reflects code reality at commit `77ccd78`. Strategic layer (personas, monetization, UVP, non-negotiables, prioritized Top-10 risks, Hard Truth) still pending via `/mm-audit` (Phase 6); phase confirmation pending via `/mm-gate` (Phase 7).
- **Files affected:** `memory/00-project-brief.md`, `memory/02-current-state.md`, `memory/03-architecture.md`, `memory/04-data-model.md`, `memory/06-feature-map.md`, `memory/08-known-risks.md`, `memory/13-phase-history.md`.
- **Supersedes:** —
