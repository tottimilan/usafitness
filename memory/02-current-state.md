# Current State — USAFitness Landing Pages

> One-page summary of where the project is right now. Kept concise.

**Last updated:** 2026-06-26
**Phase:** Iteration

## What exists today
- 5 store landings live, each on its own custom domain: villanueva, marineda, lasrosas, alcobendas, vigo (`src/data/stores.json`).
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

## The gap that defines the next stage
What ships today is **one template with twelve fixed sections in a fixed order** (`src/pages/[...slug].astro`). Only content varies per store, plus four minor toggles (`social`, `galleryFeatured`, `heroText`, `googleSiteVerification`); `Products` and `Brands` receive no props at all and are identical everywhere.

The product goal (`memory/01-product-vision.md`) is a **catalogue of templates + a library of composable sections**, from which each store picks a style and the sections it wants. **That system does not exist yet.** Reaching it is new construction, not iteration on what is there.

**Phase tension to resolve at the gate:** the *deployed product* is in Iteration; the *template system* is closer to Definition. Flagged for `/mm-gate` (Phase 7).

## What is next
- Build toward the vision: template system → section library → Products section (in that order; the Products section is explicitly deferred by the user until the section work starts).
- Fix per-store data debt: real legal `company` data for the 4 pending stores, duplicated reviews, WhatsApp numbers pointing at landlines.
- Process: finish onboarding (audit → /mm-gate → /mm-retro).
