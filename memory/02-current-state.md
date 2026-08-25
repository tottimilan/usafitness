# Current State — USAFitness Landing Pages

**Última actualización:** 2026-08-24 (41 commits) · **Fase:** Iteration

> Reescrito limpio: el fichero había acumulado secciones duplicadas y contradictorias de tanta edición incremental. El roadmap completo vive en `memory/06-feature-map.md`.

---

## Qué es esto en una frase

Sistema de plantillas y secciones que genera una landing por **tienda física de suplementación deportiva USAFitness**, cada una en su dominio. Es la **migración de las webs anteriores en WordPress** a sistema propio, y está a medias.

---

## Las 7 tiendas

| Tienda | Dominio | Motor | Legales | Fotos | Reseñas | Ficha Google |
|---|---|---|---|---|---|---|
| Vigo | usafitnessvigo.com | ✅ Astro | ✅ NM10 SHOP | ✅ | ⛔ 0 | ✅ |
| Alcobendas | usafitnessalcobendas.com | ✅ Astro | 🔒 faltan | ✅ | ✅ 3 | ✅ |
| GranCasa | usafitnessgrancasa.com | ✅ Astro | ✅ USA GOVE | 🔒 faltan | ⛔ 0 | 🔒 sin dar de alta |
| El Arcángel | usafitnesselarcangel.com | ⛔ WordPress | ✅ USA GOVE | ✅ | ✅ 3 | ✅ |
| Villanueva | usafitnessvillanueva.com | ⛔ WordPress | 🔒 faltan | ✅ | ✅ 2 | ⚠ place_id sintético |
| Marineda | usafitnessmarineda.com | ⛔ WordPress | 🔒 faltan | ✅ | ⛔ 0 | ⚠ place_id sintético |
| Las Rosas | usafitnesslasrosas.com | ⛔ WordPress | 🔒 faltan | ✅ | ⛔ 0 | ⚠ place_id sintético |

**El Arcángel es la migración más cercana:** tiene todo menos apuntar el DNS.

Las reseñas a 0 son **deliberadas**: se borraron 10 firmadas por las mismas tres personas en varias empresas distintas. La sección no se renderiza sin datos, que es el comportamiento correcto.

---

## Lo que se construyó y funciona

**Sistema de plantillas completo** — los tres ejes que definió el usuario:
- `src/data/templates.ts` — catálogo (`clasica`, `angular`). Una plantilla declara tokens, orden de secciones y variantes. Sin código.
- `src/sections/registry.ts` — qué componente es cada sección, qué props necesita y cuándo tiene datos (`visible()`).
- Resolución: sin nada declarado → `clasica` + orden base. Con `template` → su orden. Con `sections` → manda ese array.
- **Ninguna tienda declara `template` todavía: el sistema funciona y no lo usa nadie.**
- Vista previa con `?plantilla=angular`, bloqueada en dominios canónicos.

**No componibles a propósito:** Header, Footer, WhatsAppFloat y CookieConsent. Un error de configuración no puede dejar una landing sin aviso de cookies ni enlaces legales.

**Identidad de marca aplicada** — paleta oficial del brand book: `#0055B8` / `#98989A` / `#E1251B` + cian `#00A7E1`. 49 tokens en `global.css`; los componentes no declaran color, radio ni sombra propios.

**Rendimiento** — viewport inicial de 814 KB → 162 KB. Logo vectorial real (277→23 KB) y hero por tienda como `<img fetchpriority="high">`.

**Cumplimiento** — cero terceros antes del consentimiento: fuentes autoalojadas, mapa como fachada con clic-para-cargar, aviso de cookies revocable desde el footer.

**Red de seguridad** — 34 tests de humo (`npm test`) + CI en cada push. Validados por mutación.

**Medición lista y esperando** — `ConversionTracking.astro` emite `contacto_llamada`, `contacto_whatsapp` y `contacto_maps` con la sección de origen. Se activa solo con rellenar `ga4Id`.

---

## Bloqueado esperando datos del usuario 🔒

1. **Datos legales** de Villanueva, Marineda, Las Rosas y Alcobendas → 16 páginas legales en `noindex`.
2. **DNS de El Arcángel** → es la migración más cercana.
3. **Fotos y ficha de Google de GranCasa** → sin galería y con mapa por dirección, no por ficha.
4. **`place_id` reales** de Villanueva, Marineda y Las Rosas.
5. **Reseñas propias** para las 4 tiendas que se quedaron a 0.
6. **WhatsApp en fijo** en 4 tiendas: el usuario dice que debe funcionar, **no se ha podido verificar** (`wa.me` responde igual a un número inventado que a uno real).
7. **Contradicción de dirección en Villanueva**: el JSON dice C.C. El Zoco; una fuente externa apunta a C.C. La Pasada. Una llamada lo resuelve.

## En curso por el usuario ahora mismo

Fase 1 de medición: Search Console en los 7 dominios (TXT en DNS), Cloudflare Web Analytics, y propiedades de GA4 para las 3 tiendas en Astro. Guía publicada como artifact.

**Lo que devuelve:** los IDs `G-…` → se meten en `stores.json` y arranca todo.

---

## Siguiente tarea sin dependencias

**Fase 3.2 — esquema de validación de `stores.json`** (`astro/zod`, ya viene con Astro).

Aviso honesto del roadmap: **el primer build estricto fallará en cadena** — 4 tiendas sin `company`, `place_id` sintéticos, campos inexistentes. Eso es el objetivo: convertir errores silenciosos en errores de build. Hay que reservar sesión para arreglar datos.

Después: 3.4 `404.astro` (hoy hay soft-404 en los 7) y 3.5 registro de páginas + middleware para rutas anidadas.

**Bloqueante duro conocido:** hoy es **imposible añadir una URL nueva**. `middleware.ts` solo conoce `/` y las 4 legales, y compara solo el primer segmento; todo lo demás cae en el catch-all y redirige a la home. Nada de la arquitectura de contenido puede existir hasta arreglarlo.
