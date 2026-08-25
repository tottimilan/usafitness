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


### 2026-08-24 — Sin `aggregateRating` autoservido, y sin automatizar reseñas de Google
- **Decision:** se retira el `aggregateRating` que la propia web se atribuía a sí misma, y se descarta traer automáticamente las reseñas y la nota de Google.
- **Reason:** Google es explícito en dos puntos. Uno: las valoraciones que un sitio se da a sí mismo (*self-serving*) hacen la página **inelegible para las estrellas** — el marcado no daba nada y sí cargaba riesgo de acción manual. Dos: *"Don't aggregate reviews or ratings from other websites"*. Además la Places API solo devuelve 5 reseñas y sus condiciones prohíben cachearlas.
- **Alternatives considered:** (a) mantenerlo — rechazado, es exactamente lo que la documentación desaconseja; (b) scrapear Google — rechazado, incumple los términos y rompería en cualquier cambio de maquetación; (c) Places API — rechazado por el límite de 5 y la prohibición de caché.
- **Consequences:** las estrellas no van a salir en los resultados de Google por esta vía. La palanca real es la **ficha de Google Business**, que sí las muestra en el mapa y en el panel de la derecha. Las reseñas en la web quedan como prueba social, no como marcado.
- **Files affected:** `src/layouts/Landing.astro`, `src/components/Reviews.astro`.

### 2026-08-24 — Los colores del manual de marca se miden antes de adoptarlos
- **Decision:** la paleta oficial del brand book se aplica, pero **cada color se mide contra WCAG 2.2 AA antes de asignarlo a un token de texto**. Dos colores del manual se rechazaron para texto.
- **Reason:** aplicar el gris corporativo `#98989A` a `--color-text-light` dio **2.63:1** sobre blanco (el mínimo es 4.5:1). El cian sobre texto daba 2.9:1. Detectado midiendo la luminancia relativa en el navegador **después** de aplicarlo, no antes.
- **Alternatives considered:** confiar en el manual — rechazado: un manual de marca está pensado para impresión y rotulación, no para texto de 13 px en pantalla.
- **Consequences:** `--color-text-light` es `#6E6E70` (4.65:1), una variante más oscura del gris de marca. La identidad se respeta; la legibilidad manda. **Regla general: color de manual ≠ color de interfaz. Medir siempre.**
- **Files affected:** `src/styles/global.css`, `memory/14-design-system.md`.

### 2026-08-24 — Header, Footer, cookies y WhatsApp NO son componibles
- **Decision:** el sistema de secciones permite reordenar y quitar secciones de contenido, pero Header, Footer, `WhatsAppFloat` y `CookieConsent` quedan fuera del registro y se renderizan siempre.
- **Reason:** un error de configuración en un array de secciones no puede dejar una landing sin aviso de cookies ni sin enlaces legales. Son obligaciones legales, no decisiones de diseño.
- **Alternatives considered:** meterlas en el registro con una marca `obligatoria: true` — rechazado: sigue siendo un sitio donde un typo las apaga. Si no están en el registro, no hay typo posible.
- **Consequences:** una plantilla no puede mover el footer ni prescindir del aviso. Es el límite deliberado del sistema.
- **Files affected:** `src/sections/registry.ts`, `src/pages/[...slug].astro`.

### 2026-08-24 — Cero terceros antes del consentimiento
- **Decision:** ninguna petición sale a un dominio de terceros hasta que el usuario consiente. Tipografía autoalojada, mapa como fachada con clic-para-cargar, GA4 solo con `ga4Id`.
- **Reason:** cargar Google Fonts o un iframe de Maps **es** una transferencia de la IP del visitante a Google antes de que consienta. El aviso de cookies no cubre lo que ya se ha cargado al pintar la página.
- **Alternatives considered:** dejar las fuentes de Google porque "solo es una fuente" — rechazado: es el mismo tratamiento de datos, y además cuesta rendimiento.
- **Consequences:** el mapa exige un clic más. A cambio, la página no carga nada de terceros de salida y el consentimiento es revocable desde el footer.
- **Files affected:** `src/styles/global.css`, `src/components/Location.astro`, `src/components/CookieConsent.astro`, `public/fonts/`.

### 2026-08-24 — Los tests corren contra el build de producción y con `node:http`
- **Decision:** la suite levanta `dist/server/entry.mjs` y hace las peticiones con `node:http`. No contra `astro dev` y no con `fetch`.
- **Reason:** dos falsos verdes reales, encontrados al construirla. (1) Vite bloquea la cabecera `Host` y devuelve 403 — un test contra dev daría el mismo error antes y después de cualquier cambio. (2) `Host` es *forbidden header name* en la especificación de fetch: undici la descarta en silencio, así que **todas** las peticiones llegaban al host genérico y el test parecía comprobar el enrutado por dominio sin comprobar nada.
- **Alternatives considered:** Playwright — rechazado por ahora: pesa mucho para lo que hace falta, que es verificar respuestas HTTP, no render.
- **Consequences:** `npm test` exige `npm run build` antes. La suite se validó **por mutación**: se reintrodujo Google Fonts a propósito → 7 fallos; se revirtió → 34/34.
- **Files affected:** `tests/smoke.test.mjs`, `.github/workflows/ci.yml`, `package.json`. Commit `c9626f8`.

### 2026-08-24 — Roadmap definitivo de 8 fases
- **Decision:** el catálogo de secciones, la arquitectura de URLs y el catálogo comercial quedan fijados en `memory/06-feature-map.md`, con una lista explícita de **lo que NO se va a hacer**.
- **Reason:** el usuario pidió dejar de preguntar y analizar. El orden no es por dificultad, es por dependencia: sin medición no se puede demostrar nada; sin rutas anidadas no puede existir ninguna página nueva.
- **Consequences:** `memory/06-feature-map.md` deja de ser un mapa de funcionalidades y pasa a ser el roadmap operativo. Lo descartado se documenta con el motivo, para no volver a discutirlo.
- **Files affected:** `memory/06-feature-map.md`. Commit `aee0e44`.
