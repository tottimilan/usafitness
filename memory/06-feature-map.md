# Feature Map — USAFitness Landing Pages

**Última actualización:** 2026-08-24 (28 commits en la sesión)

> El proyecto es la **migración de las webs WordPress a un sistema propio de plantillas y secciones**, más un segundo ancla futuro de campañas SEM/Meta. Ver `memory/01-product-vision.md`.

## Leyenda
- Estado: Planned | In progress | Shipped | Paused | Killed
- Prioridad: P0 | P1 | P2 | P3
- 🔒 = bloqueado por un dato que solo puede aportar el usuario

---

## Estado por tienda (7)

| Tienda | Motor | Datos legales | Fotos | Reseñas | Ficha Google |
|---|---|---|---|---|---|
| Vigo | ✅ Astro | ✅ NM10 SHOP | ✅ | ✅ propias | ✅ |
| Alcobendas | ✅ Astro | 🔒 faltan | ✅ | ✅ propias | ✅ |
| GranCasa | ✅ Astro | ✅ USA GOVE | 🔒 faltan | 🔒 sin ficha | 🔒 sin dar de alta |
| El Arcángel | ⛔ WordPress | ✅ USA GOVE | ✅ | ✅ propias | ✅ |
| Villanueva | ⛔ WordPress | 🔒 faltan | ✅ | ⚠ duplicadas | ⚠ place_id sintético |
| Marineda | ⛔ WordPress | 🔒 faltan | ✅ | ⚠ duplicadas | ⚠ place_id sintético |
| Las Rosas | ⛔ WordPress | 🔒 faltan | ✅ | ⚠ duplicadas | ⚠ place_id sintético |

**El Arcángel es la migración más cercana:** lo tiene todo menos apuntar el DNS.

---

## Shipped

| Feature | Notas |
|---|---|
| Plantilla base con 12 secciones | Hero, Promotions, Location, Gallery, Reviews, Products, Brands, Schedule, Social, Footer, WhatsAppFloat, CookieConsent |
| Enrutado por dominio (`middleware.ts`) | Verificado en producción: la cabecera `Host` sobrevive a Cloudflare+Railway |
| SEO por dominio | canonical, `noindex` en hosts no canónicos, sitemap y robots dinámicos |
| Páginas legales por tienda | 4 documentos; `noindex` automático si falta `company` |
| GDPR: banner + Consent Mode v2 | Montado, **inactivo**: acoplado a `ga4Id`, que no tiene ninguna tienda |
| **Secciones opcionales** (`828ec40`) | WhatsApp, reseñas y galería se omiten si falta el dato |
| **Vocabulario de tokens** (`2f9ec56`) | 49 tokens; 46 literales retirados de los componentes. 0 cambio visual |
| **Paleta oficial de marca** (`aac2478`) | `#0055B8` / `#98989A` / `#E1251B` + cian. 0 fallos de contraste |
| **Diagonal como capacidad** (`50f3b88`) | Tokens + 4 utilidades CSS, inertes |
| **Plantilla 2 "angular"** (`d9833ef`) | `?plantilla=2`, bloqueada en dominios canónicos. 0 componentes tocados |
| Fotos reales (`de6946e`) | 19 recuperadas de los WordPress, convertidas a `.webp` |
| Cloudflare: bots de IA desbloqueados (`987f78a`) | 7 zonas verificadas |
| **Viewport inicial: 814 KB → 162 KB** (`7b21007`) | Logo vectorial real 277→23 KB; fondo de hero 537→139 KB en WebP, con el punto de compresión medido **a través del overlay** |
| **Datos estructurados corregidos** (`550844d`) | `@type: Store`, `addressLocality` y `addressRegion` reales, y **fuera el `aggregateRating` autoservido** |

---

## Roadmap

### Ahora — sin dependencias, alto impacto

| # | Tarea | Prioridad | Por qué |
|---|---|---|---|
| 1 | ~~Optimizar los 812 KB~~ | — | ✅ Hecho en `7b21007`: 814 → 162 KB |
| 2 | ~~`addressLocality` con texto de marketing~~ | — | ✅ Hecho en `550844d` |
| 3 | ~~`@type: LocalBusiness` → `Store`~~ | — | ✅ Hecho en `550844d` |
| 4 | ~~`addressRegion: "España"`~~ | — | ✅ Hecho en `550844d` |
| 5 | **El centro comercial en el contenido** | P1 | Parcial: el `mall` ya es campo estructurado en las 7 y Villanueva estrena el C.C. El Zoco en su meta. Queda decidir si entra también en el hero, en los `alt` de galería y en la sección de ubicación. **El `<title>` ya lo lleva en 5 de 7 vía el `name`, y los títulos rozan los 60-70 caracteres: no cabe forzarlo ahí** |
| 6 | **Desacoplar el banner de cookies de `ga4Id`** | P1 | Hoy sin `ga4Id` no se renderiza el aviso de cookies. Son decisiones que deben ser independientes |
| 7 | **Sitemap: excluir legales `noindex`** | P2 | ✅ Ya hecho en `bf9aa8f` |

### Decisión pendiente antes de tocar

_Ninguna._

El `aggregateRating` **ya no era una disyuntiva**: Google declara que una página cuyas reseñas controla el propio negocio es *"ineligible for star review feature"*, así que el marcado no producía estrellas y solo cargaba riesgo. Retirado en `550844d`.

La idea de traer las reseñas automáticamente desde la API de Google **no arregla el SEO** — *"Don't aggregate reviews or ratings from other websites"* —, pero sigue siendo válida como mejora de contenido: acabaría con las reseñas duplicadas de Marineda/Las Rosas y evitaría editar JSON a mano. Coste: clave de API, cuota, reglas de caché de la licencia de Places y una dependencia externa en tiempo de ejecución que el proyecto hoy no tiene. **Sin decidir.**

### Siguiente bloque — sistema de plantillas

| # | Tarea | Prioridad |
|---|---|---|
| 7 | **Registro de plantillas**: `templates.ts` + `"template"` en `stores.json` | P0 (visión) |
| 8 | **Orden de secciones como dato**: la plantilla propone, la tienda ajusta | P0 (visión) |
| 9 | **Variantes de sección** (`{sección, variante}`) | P0 (visión) |
| 10 | Sección de **Productos** real | P1 — diferida por el usuario hasta que empiece el trabajo de secciones |

### Después — capa de medición (prerrequisito de las campañas)

| # | Tarea | Prioridad |
|---|---|---|
| 11 | `ga4Id` por tienda: **0 de 7** lo tienen, así que hoy no hay analítica ni banner de cookies | P0 antes de campañas |
| 12 | **Desacoplar el banner de cookies de `ga4Id`** | P1 |
| 13 | Eventos de conversión (WhatsApp, llamada, cómo llegar) | P0 antes de campañas |
| 14 | `googleSiteVerification`: **0 de 7**. Sin Search Console no hay informe que enseñar | P1 |

### Bloqueado por el usuario 🔒

| # | Qué falta | Efecto |
|---|---|---|
| 15 | Datos legales de **Villanueva, Marineda, Las Rosas y Alcobendas** | Sus 16 páginas legales siguen en `noindex` |
| 16 | Confirmar si los **WhatsApp en fijo** funcionan (esas mismas 4) | Si no, ocultar la sección es trivial desde `828ec40` |
| 17 | **DNS de El Arcángel** a Railway | Es la migración más cercana: ya tiene todo lo demás |
| 18 | Fotos y ficha de Google de **GranCasa** | Su galería no se renderiza y el mapa apunta a la dirección, no a la ficha |
| 19 | Decidir sobre las **reseñas duplicadas** entre Villanueva/Marineda/Las Rosas | Mismo texto y misma autora en tres empresas distintas |
| 20 | Sustituir los **`place_id` sintéticos** de esas tres | Sus mapas pueden no apuntar al negocio real |

---

## Killed / deferred

_Ninguna._ (Los puntos del brand-slider se quitaron en `94d0f19`: retoque visual, no feature.)
