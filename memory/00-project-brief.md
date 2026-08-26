# Project Brief — USAFitness Landing Pages

> A **system of templates and reusable sections** for building distinctive, heavily SEO-optimized websites for USAFitness **sports-supplement retail stores** in Spain. Each store picks a style and the sections it wants; each site lives on its own domain.
>
> **Vision vs. today:** the template/section system is the goal (`memory/01-product-vision.md`). Today the code has one fixed template — see `memory/02-current-state.md`.

## Product
- Name: USAFitness Landing Pages (package `usafitness-landings`)
- Type: Multi-store landing-page **system** — a template catalogue + section library, configured per store by the operator. Not SaaS, not self-serve: no accounts, no admin panel, no database.
- **Two distinct users — do not conflate:**
  - **(a) The store owner** = decides. Shown several proposals (templates + sections) and picks the style and sections for their store. Never touches a panel; the operator configures it. Stores are operated by **independent companies**, each with its own CIF. **One company may operate several stores** — confirmed 2026-08-24: `USA GOVE S.L.` (CIF B22465587) owns **both** El Arcángel (Córdoba) and GranCasa (Zaragoza). So the `company` block is per-store but the same company legitimately repeats across stores; never assume one store = one company, and never assume two stores = two companies.
  - **(b) The end visitor** = a person looking to buy sports-nutrition supplements near them — searches locally, checks the store, then goes in person.
- Core problem: each independent store needs a professional, locally-ranked, GDPR-compliant web presence on its own domain, visually distinct from its sibling stores, without bespoke development for each one.
- **FRANCHISE MODEL — confirmed 2026-08-24** by `docs/brand/fuentes/ANEXO Integracion Digital USAFITNESS.pdf`, which addresses store owners literally as *"cada franquiciado"*. The "independent companies with their own CIF" are **franchisees** of the USAFitness brand. The annex also states that, for data-protection reasons, **each franchisee must create and own their own social accounts** — which explains why `social` is per-store data and must never be centralised.
- **Brand assets the sites are not using** (all in `docs/brand/fuentes/`):
  - **Lead magnet**: a free nutrition guide (`GUIA TIENDAS USAFITNESS.pdf`, 11 pages) closing with *"Te regalamos una **Orientación en tienda gratuita** — RESERVA TU CITA AQUÍ"*. That is a far stronger conversion offer than the current "Llámanos", and it drives people **into the store**, which is the declared goal.
  - **Named experts**: Julián Andre Gouveia (multiple IFBB titles) and Amanda Gil (CAFAD/TAFAD, certified trainer, sports-nutrition specialist). Sports nutrition is **YMYL** content for Google: identified authors with real credentials are a first-order E-E-A-T asset, and no site mentions them.
  - **Official campaign banners** "Landing Comunidad" in desktop/tablet/mobile — designed for a community landing that does not exist yet.
- **The brand itself treats the shopping centre as an asset.** The digital-integration annex instructs franchisees to film *"Toma general del centro comercial, asegurándote de que se vea claramente su nombre"*. This independently confirms the user's local-SEO intuition — it is brand policy, not just a hunch.
- **Origin (user, 2026-08-24): these sites were previously built in WordPress.** This project is the purpose-built replacement — a template/section system instead of a WordPress install per store. Migration is therefore a first-class activity: see `memory/02-current-state.md` for which domains have moved over and which still serve WordPress. The old WordPress sites are also the source of real content (photos) for the stores not yet migrated.
- What the stores actually sell (verbatim from `stores.json` metaDescription): "nutrición deportiva y suplementos — proteínas, creatinas, aminoácidos y **asesoramiento personalizado**. Hasta 20% dto."
- Physical footprint: **all 5 stores sit inside shopping centres** (C.C. El Zoco Villanueva, C.C. Marineda City A Coruña, C.C. Las Rosas Madrid, C.C. Carrefour Alcobendas, C.C. Gran Vía Vigo). Retail hours (10:00–22:00; some open Sundays).
- Unique value proposition (service side): add a store by editing one JSON object + dropping photos → a full localized, Schema.org-tagged, legally-compliant landing on that store's own domain. _Strategic differentiator vs. a plain Google Business Profile: TBD — /mm-audit._

## Business logic
- Revenue model: **out of scope for this project.** The operator is compensated through a separate arrangement with the owner. Explicitly declared not relevant to the work here (user, 2026-08-24) — do not build roadmap or risk analysis around monetization.
- User roles: Visitor (public, no auth). No authenticated app roles exist, and none are planned. Content and per-store configuration are edited in-repo by the operator.
- Core actions (visitor): view store landing → **contact via WhatsApp, call by phone, or get directions** (the three are equally primary, per owner). Read reviews, check schedule, view gallery, consult legal pages. **No online transactions — confirmed not on the roadmap.**
- Key integrations: Google Analytics 4 (+ Consent Mode v2), Google Maps embeds, Google Search Console (per-store verification), WhatsApp click-to-chat, Instagram (Vigo only so far).
- Non-negotiable constraints: GDPR opt-in consent; per-store legal accuracy (a store without real `company` data ships `noindex` rather than publishing wrong legal data). _Full list TBD — /mm-audit._

## Tech stack (actual)
- Frontend: Astro ^6.1.5 (SSR), pure HTML/CSS, ~0 client JS (except reviews tabs + cookie consent). TypeScript; path alias `@`→`/src`.
- Backend: Astro server output via `@astrojs/node` ^10.0.4 (standalone). `src/middleware.ts` maps domain→slug.
- Database: None. Content in `src/data/stores.json` (5 stores) + `src/data/legal.ts` (legal templates).
- Auth: None. Payments: None (by design — see above).
- Hosting: Railway (Node standalone, `node dist/server/entry.mjs`), one custom domain per store, auto-deploy on push to GitHub.
- Testing: None (no test files, no CI).
- Observability / Analytics: Google Analytics 4 with Consent Mode v2 (opt-in). No error monitoring / APM.

## Non-negotiables
- Legal accuracy per store: no real `company` data ⇒ legal pages go `noindex` instead of publishing incorrect data. Currently **only 1 of 5 stores (Vigo — NM10 SHOP S.L.) has real legal data**.
- GDPR-compliant opt-in analytics.
- _Others TBD — /mm-audit._

---

**Correction note (2026-08-24):** an earlier version of this file wrongly described USAFitness as a chain of **gyms**. That was an unverified inference from the brand name; the repo never said it. `src/data/stores.json` states plainly in every store that these are **tiendas de suplementación / nutrición deportiva** (supplement retail). Corrected after user pushback. Root cause: fields were extracted with `grep` instead of reading the file.

---

## Posición del proveedor frente a la marca (2026-08-26)

Dato que faltaba y que cambia el análisis de riesgo entero:

- **El desarrollador fue el empleado responsable de la parte digital de USAFitness.**
  Se fue, pero sigue colaborando.
- **Conoce personalmente a los dueños de la marca. Son amigos.**
- Las 8 tiendas hechas **vinieron a él**, no las captó: llegaron por su papel
  anterior dentro de la empresa.
- **Va a proponer el servicio a la central** y a pedir permiso para dirigirse a
  las 58 tiendas.

### Qué corrige esto

El riesgo que se había escrito era *«si la central decide centralizar el
servicio digital, te quedas sin negocio»*, tratando a la central como
competidor potencial. **Es el marco equivocado.** La central no es un rival: es
el canal, y hay acceso directo a quien decide.

### Cuál es el riesgo REAL, que no es menor sino distinto

1. **Una sola relación abre —o cierra— el acceso a las 58.** La concentración
   sigue ahí; cambia el mecanismo. No es que la central compita: es que si esa
   relación se enfría, se pierde el canal entero de golpe. Y encima está mezclada
   con una amistad, así que romperla cuesta dos cosas a la vez.

2. **El permiso de la central abre la PUERTA, no la venta.** Son 58 sociedades
   independientes, cada una con su CIF y su decisión. Que la central bendiga el
   servicio no hace que ninguna pague. Confundir «permiso» con «contrato» es el
   error de planificación más caro posible aquí.

3. **La reunión con la central es un punto único de fallo.** Una conversación
   fija el techo del negocio para años. Merece prepararse como tal.

4. **Hay una bifurcación que conviene decidir ANTES de esa reunión**, porque si
   se decide dentro se decide mal:
   - **(a) La central contrata el servicio** para su red. Un cliente, un precio,
     mucho menos trabajo comercial y administrativo — y mucho menos ingreso.
     Y toda la facturación depende de un solo cliente.
   - **(b) La central bendice y cada franquiciado contrata.** 58 clientes
     potenciales, ingreso muy superior, pero 58 ventas, 58 facturas, 58
     interlocutores. Y el trabajo administrativo que nadie cuenta.
   - Son negocios distintos, no dos precios del mismo negocio.

5. **Zona a aclarar por escrito, sin suspicacia:** parte del trabajo digital
   existente se hizo siendo empleado. Antes de escalar conviene que esté claro
   qué es de quién — el sistema de plantillas, el código, los dominios, las
   cuentas. Entre amigos es más fácil dejarlo sin hablar, y por eso mismo es
   donde luego duele.

### Lo que hay a favor, y es mucho

- **Ocho pruebas vivas**, no una propuesta en PowerPoint.
- **Datos medidos sobre la propia red de la marca**, no argumentos genéricos:
  una tienda 460 días sin publicar y otra con 80 publicaciones; 4 tiendas con
  horarios distintos en la web y en Google, dos figurando cerradas los domingos;
  GranCasa sin ficha de Google y marcada «PRÓXIMAMENTE» pese a estar abierta;
  `geo` con hasta 1.871 m de error; un teléfono que no coincide con su ficha.
- **Nadie más puede enseñar eso** de su red, porque nadie más la ha medido.
