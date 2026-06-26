# Feature Map — USAFitness Landing Pages

> All features below are live on `main` and deployed. Single contributor; no active feature branch, so nothing is "In progress" in code.

## Legend
- Status: Planned | In progress | Shipped | Paused | Killed
- Priority: P0 | P1 | P2 | P3

## MVP scope
| Feature | Status | Priority | Owner | Notes |
|---|---|---|---|---|
| Multi-store landing template (Hero, Brands, Products, Promotions, Gallery, Reviews, Schedule, Location, Social, WhatsApp, Footer) | Shipped | P0 | — | Driven by `stores.json`; one template renders all stores |
| Domain-based routing middleware (host→slug, per-store isolation) | Shipped | P0 | — | `src/middleware.ts`; each store at root of its own domain |
| Per-store legal pages (4 doc types, clean URLs) | Shipped | P0 | — | `noindex` + "en actualización" when `company` data absent |
| SEO core (Schema.org `LocalBusiness`, OG/Twitter, per-domain canonical) | Shipped | P0 | — | `Landing.astro` |
| GDPR cookie consent + GA4 + Consent Mode v2 (opt-in) | Shipped | P0 | — | `CookieConsent.astro` (git `c849751`) |
| Dynamic per-domain `sitemap.xml` + `robots.txt` | Shipped | P1 | — | Each domain exposes only its own URLs |
| Local-SEO polish (per-store Search Console verify, `noindex` non-canonical hosts, localized hero/alt) | Shipped | P1 | — | git `261ed32`, `150adf4` |
| Reviews section (tabbed, avatars, star ratings) | Shipped | P1 | — | Self-hosted avatars recommended |
| Gallery (optional featured layout) | Shipped | P1 | — | `galleryFeatured` flag |
| Location / Google Maps embed | Shipped | P1 | — | Per-store embed + link |
| Schedule → Schema `OpeningHoursSpecification` | Shipped | P1 | — | Parsed from free-text schedule |
| Floating WhatsApp contact | Shipped | P1 | — | `WhatsAppFloat.astro` |
| Social section + Instagram header icon | Shipped | P2 | — | IG/FB/TikTok/YouTube; renders only if `social` present |
| Auto-scrolling brand slider (CSS) | Shipped | P2 | — | git `420dc75` |

## Post-MVP backlog
| Feature | Status | Priority | Notes |
|---|---|---|---|
| Complete legal `company` data for the 4 placeholder stores | Planned | P1 | Code-derived: only 1/5 stores indexable legally today |
| _Strategic backlog_ | Planned | — | _TBD — populated by /mm-audit (Phase 6)_ |

## Killed / deferred
_None recorded._ (Brand-slider dots were removed in git `94d0f19` — a visual tweak, not a killed feature.)
