# Architecture — USAFitness Landing Pages

> Astro SSR multi-tenant landing generator. One template renders N stores, each isolated to its own domain via middleware. Content is file-based (JSON + TS); no database.

## Stack justification
- **Astro ^6.1.5 (SSR, `output: 'server'`)** — content-first, ships ~0 client JS (strong SEO / Core Web Vitals for marketing pages) while still allowing per-request logic (host→store routing) via middleware.
- **`@astrojs/node` ^10.0.4 (standalone)** — self-contained Node server for Railway (`node dist/server/entry.mjs`). SSR is required because per-domain routing needs middleware; static export caused 500s (git `388d3df`, `6c850d3`).
- **`@astrojs/sitemap` ^3.7.2** — dependency present; the live sitemap is additionally hand-rolled per-domain in `src/pages/sitemap.xml.ts`.
- **Pure HTML/CSS + TypeScript** — no UI framework, no DB, no auth; product is static-ish marketing content parameterized per store.

## High-level diagram
```text
Request (Host header)
        │
        ▼
src/middleware.ts ── host→slug map (domainToSlug)
        │  rewrite:  / → /<slug>,  /aviso-legal → /<slug>/aviso-legal
        ▼
src/pages/[...slug].astro        (store landing)
src/pages/[slug]/[doc].astro     (legal pages)
src/pages/sitemap.xml.ts | robots.txt.ts   (per-domain)
        │ reads
        ▼
src/data/stores.json  (5 stores — all content)
src/data/legal.ts     (4 legal templates)
        │ renders
        ▼
src/layouts/Landing.astro  (SEO meta + Schema.org LocalBusiness)
src/components/*.astro      (Hero, Gallery, Reviews, …)
```

## Services and boundaries
- **Single service**: one Astro Node server. No microservices, workers, or queues.
- **Multi-tenancy boundary** = HTTP `Host` header → slug map (`src/middleware.ts`). Each domain only sees its own store's content + canonical URLs; stores never mix.
- **Content boundary**: `src/data/stores.json` is the single source of truth for store data; `src/data/legal.ts` for legal templates. Editing content = editing these files + photos in `public/photos/<slug>/`.

## Data flow
1. Request arrives with a `Host` header (a store's custom domain).
2. Middleware resolves `host → slug`; rewrites `/` → `/<slug>` and clean legal paths → `/<slug>/<doc>`.
3. Page route reads the matching store object from `stores.json`, renders `Landing.astro` (SEO meta + Schema.org `LocalBusiness`) + components.
4. `sitemap.xml.ts` / `robots.txt.ts` compute per-domain output from the same data.
5. Client: GA4 fires only after opt-in consent (Consent Mode v2).

## External dependencies
- Runtime libs: `astro`, `@astrojs/node`, `@astrojs/sitemap` (`package.json`).
- Third-party services: Google Analytics 4, Google Maps (embeds), Google Search Console, WhatsApp (click-to-chat), social platforms. All client-side or link-out; none server-integrated, no server-side API keys.
- Hosting: Railway (build `npm run build`, start `node dist/server/entry.mjs`).

## Non-functional requirements
- SEO is the primary NFR (Schema.org, per-domain canonical/sitemap, localized content, Core Web Vitals via ~0 JS). _Explicit targets TBD._
- Performance / latency budgets: _TBD — not inferable from code._
- Availability / SLA: _TBD — single Railway service, no documented SLO._
- Security: no auth/PII storage; GDPR consent gates analytics. Full review pending (memory/08).

## Key ADRs
_None written yet._ Candidates surfaced by code: (1) SSR over static export for domain routing; (2) file-based content (`stores.json`) over CMS/DB; (3) per-store `noindex` when legal data is absent. _To be authored under `docs/adr/` by architecture-mapper / project-deep-audit._
