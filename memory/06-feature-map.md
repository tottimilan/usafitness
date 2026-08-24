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

**The product vision (`memory/01-product-vision.md`) is not built yet.** Everything "Shipped" above is *one* template. The items below are new construction, not polish.

| Feature | Status | Priority | Notes |
|---|---|---|---|
| **Template system** — multiple selectable templates, differing both visually (colour, type, imagery) and structurally (landing style/shape) | Planned | P0 (vision) | Today `[...slug].astro` hardcodes one template with a fixed section order |
| **Section library** — sections become optional and composable per store, chosen from a catalogue | In progress | P0 (vision) | **Partially delivered `828ec40`:** WhatsApp, Reviews and Gallery now omit themselves when the data is absent (Social already did). Still fixed: the *order* of sections, and Products/Promotions/Brands remain hardcoded and identical for every store |
| **Per-store configuration** of chosen template + chosen sections | Planned | P0 (vision) | Operator-configured in files. No panel/DB/auth needed — the choice is a commercial process |
| **Products section** — show the products a store carries | Planned | P1 | User: deferred until the section-library work starts. `Products`/`Brands` stay shared across stores |
| Complete legal `company` data for the 4 pending stores | Planned | P1 | Only Vigo (NM10 SHOP S.L.) has real data; the other 4 ship `noindex` legal pages |
| Resolve duplicated reviews across stores | Planned | P1 | Identical review text + author reused across Villanueva/Marineda/Las Rosas; one contradicts its store's own schedule |
| Verify WhatsApp numbers | Planned | P1 | 4 of 5 stores point WhatsApp at a landline; only Vigo has a separate mobile. Needs owner confirmation |
| _Further strategic backlog_ | Planned | — | _TBD — /mm-audit_ |

## Killed / deferred
_None recorded._ (Brand-slider dots were removed in git `94d0f19` — a visual tweak, not a killed feature.)
