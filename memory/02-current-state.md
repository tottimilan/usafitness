# Current State — USAFitness Landing Pages

> One-page summary of where the project is right now. Kept concise.

**Last updated:** 2026-06-26
**Phase:** Iteration

## What exists today

**This project is a MIGRATION IN PROGRESS, not a finished 5-store product.** Verified live 2026-06-26 by checking each domain's HTML:

| Domain | Engine serving it today |
|---|---|
| usafitnessalcobendas.com | ✅ **This Astro project** |
| usafitnessvigo.com | ✅ **This Astro project** |
| usafitnessvillanueva.com | ⛔ still **WordPress 7.1** (old site) |
| usafitnessmarineda.com | ⛔ still **WordPress 7.1** (old site) |
| usafitnesslasrosas.com | ⛔ still **WordPress 7.1** (old site) |

So: **2 of 5 stores migrated**, 3 pending. `src/data/stores.json` holds entries for all 5, but the three un-migrated ones are drafts — which is exactly why their photos are placeholders (`scripts/generate-placeholders.js` hardcodes those same three slugs).

**The real photos for the 3 pending stores already exist** on their WordPress sites under `/wp-content/uploads/…` and can be pulled from there.

- Per-store landing sections (Astro): Hero, brand slider, Products, Promotions, Gallery, Reviews (tabbed), Schedule, Location/map, Social, floating WhatsApp, Footer (`src/components/`).
- Per-store landing sections: Hero, auto-scrolling brand slider, Products, Promotions, Gallery, Reviews (tabbed), Schedule, Location/map, Social, floating WhatsApp, Footer (`src/components/`).
- Domain→slug routing middleware; each store served at the root of its own domain; clean per-store legal URLs (`src/middleware.ts`).
- Dynamic per-domain `sitemap.xml` + `robots.txt` (each domain exposes only its own canonical URLs).
- SEO: Schema.org `LocalBusiness`, Open Graph/Twitter, per-domain canonical, per-store Search Console verification, `noindex` on non-canonical hosts, localized hero text & gallery alt per store.
- GDPR cookie consent banner + GA4 + Google Consent Mode v2 (per-store, opt-in).
- 4 legal document types per store (aviso-legal, política-de-privacidad, política-de-cookies, política-redes-sociales) via `src/data/legal.ts`.

## What is in progress
- MASTERMIND 2.x onboarding (this session): retroactive memory seed → strategic audit → phase gate → first retrospective.
- No application feature branches active (only `main`; single contributor).

## What is blocked
- Full legal indexing for 4 of 5 stores: only 1 store has a real `company` legal block in `stores.json`; the others ship `noindex` placeholder legal pages until real data is added. _Confirm priority in /mm-audit._

## Cola pendiente para migrar Villanueva, Marineda y Las Rosas

Guardado a petición del usuario (2026-06-26). Las fotos ya no bloquean; quedan estos tres:

1. **Embeds de Google Maps sospechosos.** Villanueva, Marineda y Las Rosas usan `place_id` construidos a mano (p. ej. `0x5e5a3f8c1a2d4e6f`) con coordenadas redondeadas. Pueden no resolver a la ficha real del negocio. Sustituir por el embed verificado del Google Business Profile de cada tienda.
2. **Reseñas duplicadas entre empresas distintas.** Texto y autora idénticos reutilizados en Villanueva/Marineda/Las Rosas; una copia menciona "la dependienta que está los domingos" en una tienda cuyo horario es de lunes a sábado. Hay que conseguir reseñas propias de cada tienda.
3. **Datos legales (`company`) ausentes** en las tres (y en Gran Casa). Sin ellos las 4 páginas legales van en `noindex`. Requisito LSSI art. 10; el dato lo aporta el dueño de cada tienda.

**Pendiente de confirmación del usuario:** si los números de WhatsApp de Villanueva, Marineda, Las Rosas y Alcobendas (que son fijos) están dados de alta en WhatsApp Business. Si no lo están, ahora la sección se puede ocultar sin tocar código.

**Mejora menor detectada 2026-06-26:** el `sitemap.xml` incluye las 4 páginas legales aunque estén en `noindex` cuando la tienda no tiene `company`. Conviene excluirlas del sitemap en ese caso.

## The gap that defines the next stage
What ships today is **one template with twelve fixed sections in a fixed order** (`src/pages/[...slug].astro`). Only content varies per store, plus four minor toggles (`social`, `galleryFeatured`, `heroText`, `googleSiteVerification`); `Products` and `Brands` receive no props at all and are identical everywhere.

The product goal (`memory/01-product-vision.md`) is a **catalogue of templates + a library of composable sections**, from which each store picks a style and the sections it wants. **That system does not exist yet.** Reaching it is new construction, not iteration on what is there.

**Phase tension to resolve at the gate:** the *deployed product* is in Iteration; the *template system* is closer to Definition. Flagged for `/mm-gate` (Phase 7).

## What is next
- Build toward the vision: template system → section library → Products section (in that order; the Products section is explicitly deferred by the user until the section work starts).
- Fix per-store data debt: real legal `company` data for the 4 pending stores, duplicated reviews, WhatsApp numbers pointing at landlines.
- Process: finish onboarding (audit → /mm-gate → /mm-retro).
