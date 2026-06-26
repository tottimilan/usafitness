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

## What is next
- Code-visible: fill real legal `company` data for the 4 placeholder stores; continue onboarding new stores via the README workflow.
- Process: complete this onboarding (audit → /mm-gate Iteration → /mm-retro).
- Strategic backlog: _TBD — /mm-audit._
