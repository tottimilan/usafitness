# Data Model — USAFitness Landing Pages

> No database. The "data model" is two version-controlled files: `src/data/stores.json` (all store content) and `src/data/legal.ts` (shared legal templates). Git is the migration history.

## Entities

### Store — `src/data/stores.json` → `stores[]` (5 instances)
Central entity; one object per store. Fields (full table in README):
`slug`, `name`, `domain`, `streetAddress`, `postalCode`, `geo{lat,lng}`, `title`, `subtitle`, `location`, `metaDescription`, `phone`, `phoneDisplay`, `whatsapp`, `googleMapsEmbed`, `googleMapsLink`, `schedule`, `heroImage`, `reviews[]`, `galleryImages[]`, `galleryFeatured?`, `social?`, `company?`.

### Review — embedded in `Store.reviews[]`
`{ text, author, avatar, stars }`. Empty `avatar` → render author's initial.

### Social — embedded in `Store.social?` (optional)
`{ instagram?, facebook?, tiktok?, youtube? }`. Absent → no social section / header IG icon.

### Company (legal owner) — embedded in `Store.company?` (optional)
`{ razonSocial, nif, direccionPostal, emailLegal, telefonoLegal, lastUpdated }`. Absent → legal pages show "en actualización" + `noindex`.

**The same company can legitimately appear in several stores** (e.g. `USA GOVE S.L.` / B22465587 owns both El Arcángel and GranCasa). The relationship is Company 1—N Store, embedded per store for isolation; duplication of the block across stores is expected, not a data error.

### LegalDoc — `src/data/legal.ts` → `LEGAL_DOCS[]` (4 types)
`aviso-legal`, `politica-de-privacidad`, `politica-de-cookies`, `politica-redes-sociales`. Shared templates, personalized per store from `Store.company` at render time.

## Relationships
- `Domain` 1—1 `Store` (via `domainToSlug` in middleware; `www.` alias included).
- `Store` 1—N `Review` (embedded array).
- `Store` 1—1 `Social` (optional, embedded).
- `Store` 1—1 `Company` (optional, embedded).
- `Store` N—N `LegalDoc`: every store renders all 4 docs, filled from its own `company`.

## Migrations policy
- No DB, no migrations. Schema change = edit the object shape + `legal.ts`; data change = edit `stores.json` + photos under `public/photos/<slug>/`, then push (Railway redeploys). **Git history is the migration log.**

## Indexes and constraints
- No DB indexes. Runtime lookups built at startup in `src/middleware.ts`: `domainToSlug` (Map: domain & `www.`+domain → slug) and `legalSlugs` (Set from `LEGAL_DOCS`).
- Constraints are conventional (README), not schema-enforced: `slug` and `domain` unique; required fields per README; missing `company` ⇒ `noindex` legal pages (guard against publishing wrong legal data).

## Data privacy / PII
- No user accounts, no DB, no stored visitor PII.
- PII as *content*: store legal-owner data (razón social, NIF, email, phone) in `company` — public by legal obligation. Review author names/avatars — README recommends self-hosting avatars (Google URLs expire).
- Visitor analytics: GA4 only after opt-in consent (Consent Mode v2); no first-party visitor storage.

## Ofertas y precios — decisiones del dueño, 2026-08-27 (implementar en F1)

**(a) OFERTAS, dos niveles.** Entidad `oferta-central` en dato compartido (shared) — la central las produce y el operador tiene acceso a su canal — más campo opcional `ofertaPropia` por tienda que la pisa. **Precedencia: propia > central > nada.** Ambas con `fechaFin` OBLIGATORIA en el esquema y despublicación automática (extiende la regla «caduca sola» de memory/15 Nivel 3). Campo de **procedencia**: quién autorizó el texto y cuándo — la oferta central se publica bajo el CIF de cada franquiciado, así que su texto se archiva POR ESCRITO (lección Fase 0.2, el «Hasta 20% dto.» sin fuente). El evento `ver_oferta` lleva parámetro `origen` (central/propia).

**(b) PRECIO.** Campo opcional a nivel producto/oferta, **OCULTO por defecto**, con flag de visibilidad por tienda («por si algún franquiciado sí los quiere»). Si una tienda lo activa, se reabre la pregunta de restricciones de la central (metodo §10.4).

**(c) Pendiente de tarificar en memory/15:** si el override de oferta propia consume los 2 cambios/mes de la Base o entra en «campaña del mes gestionada».
