# Known Risks — USAFitness Landing Pages

> Code-/repo-derived risks only (empirically visible). Strategic, market and monetization risks + the prioritized Top 10 are added by `/mm-audit` (Phase 6).

## Legend
- Impact: Low | Medium | High | Critical
- Likelihood: Low | Medium | High
- Status: Open | Mitigated | Accepted | Closed

## Technical risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 0 | ~~Placeholder images block the 3 pending migrations~~ | Medium | **RESUELTO 2026-08-24** | Fotos reales recuperadas de los WordPress de cada tienda, convertidas a .webp y colocadas. 6 por tienda. Verificado en navegador: 0 imágenes rotas | Closed |
| 0b | ~~Alcobendas hero placeholder rompe el og:image en producción~~ | Medium | **RESUELTO 2026-08-24** | hero.webp generado desde su foto real; og:image verificado | Closed |
| 1 | ~~No automated tests and no CI~~ | High | **MITIGADO 2026-08-24** (`c9626f8`) | 34 tests de humo contra el build de producción con la cabecera `Host` falseada por dominio + GitHub Actions en cada push y PR. Cubren: enrutado por dominio, aislamiento entre tiendas, canonical/robots, sitemap sin páginas noindex, las 4 legales, fuga de NIF entre sociedades, cero terceros pre-consentimiento y parseo del horario a Schema.org. Validados por mutación. **No cubren** render visual ni JS de cliente | Mitigated |
| 2 | ~~`stores.json` sin validación de esquema~~ | Medium | **RESUELTO 2026-08-25** (`fbd52d0`, `e50de48`) | Esquema Zod estricto (`strictObject`: una clave con typo no compila) + verificador de assets, ambos en `astro:config:setup`, o sea **antes** de compilar. El aviso del roadmap no se cumplió: el primer build estricto pasó a la primera. Los datos incompletos son AVISOS (21 hoy, con el slug delante) porque dependen del franquiciado; lo que rompe render o publica un dato falso es ERROR. 15 tests rompen los datos a propósito y exigen que falle | Closed |
| 3 | No error monitoring / observability — prod errors (cf. past 500s, git `388d3df`) are invisible until a user reports them | Medium | Medium | Error tracking (e.g. Sentry) + uptime monitor | Open |
| 7 | **10 vulnerabilidades de dependencias** (8 high, 1 moderate, 1 low) | Medium | Low | **TRIADO 2026-08-25** (`85ec55e`) → `docs/security/triaje-npm-audit-2026-08.md`. **1 mitigado y aplicado**: `@astrojs/node` 10.0.4→10.0.6 cierra el *cache poisoning* con `if-match` malformado, el único alcanzable desde internet (500→412, con test). **9 aceptados** con el comando que demuestra la no-alcanzabilidad: o el código no viaja a `dist/server` (js-yaml, postcss, svgo, nanoid), o la feature que lo dispara no existe (`define:vars` retirado, islas, server islands, `/_actions`, `astro:assets`, `prerender=true`), o es dev-only (vite, esbuild). Tripwire `npm audit --audit-level=critical` en CI. **Reevaluar cuando** cambie `package-lock.json` o se adopte alguna de esas features | Accepted |
| 4 | Caret ranges on `astro`/adapter deps — minor bumps could break on redeploy | Low | Low | `package-lock.json` committed (mitigates if `npm ci`); verify Railway uses it | Open |

## Business / product risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | 4 of 5 stores lack legal `company` data → legal pages `noindex`, weaker SEO/trust for those domains | Medium | High | Collect & fill legal data per store | Open |
| 2 | **WhatsApp CTA points at a landline in 4 of 5 stores** (`whatsapp` == `phone`; only Vigo has a separate mobile). If those numbers are not registered on WhatsApp Business, one of the three primary conversion paths is dead | High | Medium | Confirm with each owner; replace with a real mobile | Open — awaiting owner confirmation |
| 3 | ~~Duplicated reviews across legally independent stores~~ (las MISMAS TRES AUTORAS firmaban en Marineda, Las Rosas y Vigo; texto idéntico palabra por palabra; una mencionaba un domingo en una tienda que cierra los domingos) | Medium | **RESUELTO 2026-08-24** (`d13a1e1`) | Retiradas las 10 reseñas duplicadas. 4 tiendas se quedan a 0 reseñas y la sección no se renderiza — comportamiento correcto. Un test impide que vuelva a pasar. **Queda abierto conseguir reseñas propias reales** | Closed |
| 4 | Google Maps embeds for Villanueva/Marineda/Las Rosas use hand-built `place_id` values that look synthetic — may not resolve to the real business listing | Medium | Medium | Replace with verified embeds from each Google Business Profile | Open |
| 5 | ~~"Hasta 20% dto." publicado en el `metaDescription` de todas las tiendas~~ | Low | **RESUELTO 2026-08-24** (`d13a1e1`) | Promesa de descuento retirada de los metadatos. Si vuelve, debe venir de un campo con fecha de caducidad, no de texto fijo | Closed |
| 6 | **Ad-spend exposure (segundo ancla):** campañas SEM + Meta planificadas. Sin medición de conversión, el gasto no es atribuible ni optimizable | High | **PARCIAL 2026-08-24** (`2800b67`) | `ConversionTracking.astro` ya emite `contacto_llamada`, `contacto_whatsapp` y `contacto_maps` con la sección de origen, en fase de captura (`transport_type` retirado en el PR #1: no existe en gtag de GA4). **Está escrito pero no mide nada:** `ga4Id` sigue a 0 de 7. Se activa en cuanto el usuario cree las propiedades de GA4 | Open — código listo, falta el ID |
| 7 | Strategic / market risks not yet assessed | _TBD_ | _TBD_ | Run `/mm-audit` (Phase 6) | Open |

## Legal / regulatory risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | Reuse of Google reviews + author names/avatars without explicit consent — image-rights / privacy nuance | Medium | Low | Confirm reviews are genuine & permitted; self-host avatars | Open |
| 2 | Hand-entered legal data (NIF, razón social) — wrong data on an aviso legal is a compliance risk (`noindex` guards the empty case, not the wrong-data case) | Medium | Low | Verify legal data before indexing each store | Open |
| 3 | GDPR consent correctness | Medium | Low | **MITIGADO 2026-08-24** (`fb40b4e`, `7e31c45`): cero peticiones a terceros antes del consentimiento — fuentes autoalojadas, mapa como fachada con clic-para-cargar, GA4 no se carga sin `ga4Id`; consentimiento revocable desde el footer (RGPD art. 7.3) y la señal de Consent Mode v2 se emite en ambos sentidos. Tres tests lo verifican por dominio. **Sin verificar de extremo a extremo con GA4 real** — no se podrá hasta tener `ga4Id` | Mitigated |

## Operational risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | Single Railway service = single point of failure for all 5 store domains | High | Low | Monitoring + health checks; platform SLA | Open |
| 2 | No staging/preview — edit JSON → push → auto-deploy goes straight to all live stores | Medium | Medium | PR preview / staging env + build gate | Open |
| 3 | Bus factor = 1 (single contributor) | Medium | Medium | Documentation (this memory seed) + onboarding | Open |
| 6 | **La red de tests no cubre render visual ni JS de cliente.** Un CSS que rompa la maqueta pasa la suite entera. El aviso de cookies y `ConversionTracking` se verifican como **forma** del HTML, no como comportamiento: la revisión del PR #1 lo demostró con 4 mutaciones de comportamiento, todas en verde (cargar gtag sin consentir, aceptar sin medir, revocar sin borrar, conceder ads al rechazar). El flujo completo se verificó **a mano** en navegador ese mismo día | Medium | Medium | Verificación manual en navegador en cada cambio de la capa de consentimiento (se hace y se documenta en los commits). **Regla derivada de la revisión: no pegar ningún `ga4Id` real hasta tener un test de comportamiento en navegador** (I-2 del veredicto). Playwright sería dependencia nueva: decisión pendiente | Open — aceptado con condición |
| 4 | ~~**Imposible añadir una URL nueva**~~ | High | **RESUELTO 2026-08-25** (`24b0a17`) | El middleware reescribe ahora *cualquier* ruta bajo el slug de la tienda y decide el enrutador de Astro. Añadir una página = crear un `.astro` bajo `src/pages/[slug]/`. Además: 404 real (antes 7 soft-404 que Search Console no podía reportar) y `trailingSlash: 'never'` | Closed |
| 5 | **El sistema de plantillas no lo usa nadie.** `clasica` y `angular` existen y funcionan, pero ninguna tienda declara `template`. Un sistema de diferenciación que ninguna tienda usa no está validado: no sabemos si `angular` aguanta contenido real de una tienda concreta | Medium | Medium | Asignar `angular` a una tienda de verdad y mirarla en su dominio | Open |
