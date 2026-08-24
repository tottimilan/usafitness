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

---

## Roadmap

### Ahora — sin dependencias, alto impacto

| # | Tarea | Prioridad | Por qué |
|---|---|---|---|
| 1 | **Optimizar los 812 KB del viewport inicial** | P0 | `usafitness.svg` son **276 KB para pintar 200×42 px** (es un PNG envuelto en SVG; ya tenemos el vectorial real en `docs/brand/fuentes/`). `hero-bg.jpg` son **536 KB** y es el elemento LCP de las 7 tiendas, además tapado por un overlay al 0.78. Afecta a todas las tiendas a la vez y el rendimiento **es** el producto |
| 2 | **`addressLocality` recibe texto de marketing** | P0 | Villanueva declara a Google que su localidad es *"el noroeste de Madrid"*, que no existe. El campo `location` es copy publicitario y entra en el marcado como dato postal, y además compone el `<title>`. Hace falta separar `location` (marketing) de `addressLocality` (postal) |
| 3 | **`@type: LocalBusiness` → `Store`** | P1 | Tipo genérico: un gimnasio emitiría el mismo JSON-LD. `Store` es el tipo canónico de retail. Cambio de una línea |
| 4 | **`addressRegion: "España"`** | P1 | Duplica el país (`addressCountry: "ES"` ya está) y nunca declara la provincia real. Señal local desperdiciada |
| 5 | **El centro comercial en el contenido** | P1 | El `<title>` es `{nombre} \| Nutrición Deportiva en {location}` y **no menciona el centro comercial** en ninguna de las 7, pese a tenerlo en `streetAddress`. La propia marca instruye a destacarlo (anexo de integración digital). Nadie busca "suplementos Zaragoza", busca "suplementos GranCasa" |

### Decisión pendiente antes de tocar

| # | Tema | Qué hay que decidir |
|---|---|---|
| 6 | **`aggregateRating` autoservido** | Las 7 tiendas declaran 5,0 con 3 valoraciones, calculado desde el propio JSON. Google **prohíbe** el marcado de valoraciones autoservidas y puede retirar los rich results de todo el dominio por acción manual. Quitarlo pierde las estrellas en resultados; dejarlo mantiene el riesgo ×7 dominios |

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
