# Current State — USAFitness Landing Pages

> One-page summary of where the project is right now. Kept concise.

**Last updated:** 2026-08-24
**Phase:** Iteration

## What exists today

**This project is a MIGRATION IN PROGRESS, not a finished product.** Verified live 2026-08-24 by checking each domain's HTML:

| Store | Domain | Engine today | Legal `company` |
|---|---|---|---|
| Vigo | usafitnessvigo.com | ✅ **Astro** | ✅ NM10 SHOP S.L. |
| Alcobendas | usafitnessalcobendas.com | ✅ **Astro** | ❌ |
| GranCasa (Zaragoza) | usafitnessgrancasa.com | 🆕 ready, awaiting DNS | ✅ USA GOVE S.L. |
| El Arcángel (Córdoba) | usafitnesselarcangel.com | ⛔ WordPress 7.1 | ✅ USA GOVE S.L. |
| Villanueva | usafitnessvillanueva.com | ⛔ WordPress 7.1 | ❌ |
| Marineda | usafitnessmarineda.com | ⛔ WordPress 7.1 | ❌ |
| Las Rosas | usafitnesslasrosas.com | ⛔ WordPress 7.1 | ❌ |

**Since then (same day):** two more stores were added — **GranCasa** (Zaragoza, brand new, no WordPress, waiting only on DNS) and **El Arcángel** (Córdoba, still on WordPress). Total: **7 stores**.

Real photos for every pending store were recovered from their WordPress sites and converted to `.webp` (commit `de6946e`); `scripts/generate-placeholders.js` was deleted in `bf9aa8f` because it would overwrite real brand logos if run.

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

Guardado a petición del usuario (2026-08-24). Las fotos ya no bloquean; quedan estos tres:

1. **Embeds de Google Maps sospechosos.** Villanueva, Marineda y Las Rosas usan `place_id` construidos a mano (p. ej. `0x5e5a3f8c1a2d4e6f`) con coordenadas redondeadas. Pueden no resolver a la ficha real del negocio. Sustituir por el embed verificado del Google Business Profile de cada tienda.
2. **Reseñas duplicadas entre empresas distintas.** Texto y autora idénticos reutilizados en Villanueva/Marineda/Las Rosas; una copia menciona "la dependienta que está los domingos" en una tienda cuyo horario es de lunes a sábado. Hay que conseguir reseñas propias de cada tienda.
3. **Datos legales (`company`) ausentes** en las tres (y en Gran Casa). Sin ellos las 4 páginas legales van en `noindex`. Requisito LSSI art. 10; el dato lo aporta el dueño de cada tienda.

**Pendiente de confirmación del usuario:** si los números de WhatsApp de Villanueva, Marineda, Las Rosas y Alcobendas (que son fijos) están dados de alta en WhatsApp Business. Si no lo están, ahora la sección se puede ocultar sin tocar código.

**Mejora menor detectada 2026-08-24:** el `sitemap.xml` incluye las 4 páginas legales aunque estén en `noindex` cuando la tienda no tiene `company`. Conviene excluirlas del sitemap en ese caso.

## The gap that defines the next stage
What ships today is **one template with twelve fixed sections in a fixed order** (`src/pages/[...slug].astro`). Only content varies per store, plus four minor toggles (`social`, `galleryFeatured`, `heroText`, `googleSiteVerification`); `Products` and `Brands` receive no props at all and are identical everywhere.

The product goal (`memory/01-product-vision.md`) is a **catalogue of templates + a library of composable sections**, from which each store picks a style and the sections it wants. **That system does not exist yet.** Reaching it is new construction, not iteration on what is there.

**Phase tension to resolve at the gate:** the *deployed product* is in Iteration; the *template system* is closer to Definition. Flagged for `/mm-gate` (Phase 7).

## What is next

**Roadmap completo y priorizado en `memory/06-feature-map.md`.**

Siguiente tarea sin dependencias: **optimizar los 812 KB del viewport inicial** (logo de 276 KB con el vectorial real ya disponible en `docs/brand/fuentes/`, y fondo de hero de 536 KB que es el LCP de las 7 tiendas). Afecta a todas a la vez y el rendimiento es el producto.

Después: los arreglos de SEO estructurado (`addressLocality` recibiendo copy publicitario, `@type` genérico, `addressRegion` duplicando el país) y meter el centro comercial en el contenido.

Decisión pendiente antes de tocar: qué hacer con el `aggregateRating` autoservido, que es riesgo de acción manual de Google en 7 dominios.

Luego el bloque grande: registro de plantillas → orden de secciones como dato → variantes de sección.
