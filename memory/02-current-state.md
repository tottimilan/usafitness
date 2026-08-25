# Current State — USAFitness Landing Pages

**Phase:** MVP

**Última actualización:** 2026-08-25 (52 commits) · fase corregida desde `Iteration` en el primer `/mm-gate` — ver [`docs/adr/0001`](../docs/adr/0001-phase-gate-iteration-launch.md) y la transición del 2026-08-25 en `memory/13`. No fue un retroceso del proyecto: la etiqueta llevaba dos meses siendo falsa.

> `**Phase:**` arriba, en inglés y en su propia línea, no es un descuido de idioma:
> `scripts/phase-gate-check` lo lee con `^\*\*Phase:\*\*`. Al reescribir este
> fichero se puso `**Fase:**` en una línea compartida y el gate devolvió BLOCK
> — no porque el proyecto estuviera bloqueado, sino porque no encontraba la fase.

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
| Marineda | usafitnessmarineda.com | ✅ Astro | 🔒 faltan | ✅ | ⛔ 0 | ⚠ embed hecho a mano |
| Las Rosas | usafitnesslasrosas.com | ⛔ WordPress | 🔒 faltan | ✅ | ⛔ 0 | ⚠ place_id sintético |

**Verificado en vivo el 2026-08-25** (curl a los 7): sirven Astro **Marineda, Alcobendas, GranCasa y Vigo** — 4 de 7. Siguen en WordPress Villanueva, Las Rosas y El Arcángel. Marineda migró desde la última revisión de este fichero.

**El Arcángel es la migración más cercana:** tiene todo menos apuntar el DNS.

⚠️ **Marineda y Alcobendas están vivas, indexables (`index, follow`) y sin datos legales.** Su `/aviso-legal` responde 200 con "Estamos actualizando la información legal de esta tienda", cero razón social y cero NIF. Son dos sociedades reales publicando un sitio comercial sin identificar al prestador (LSSI art. 10). El `noindex` de la página legal impide que Google indexe un documento vacío; no cubre la obligación.

⚠️ **Migrar a Astro hoy quita la única medición que había.** Los 3 dominios que siguen en WordPress llevan GTM; los 4 en Astro no llevan nada (`ga4Id` sigue a 0 de 7).

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

**Red de seguridad** — 60 tests en dos suites (`npm test`) + CI en cada push, todos validados por mutación:
- `smoke` — qué responden los 7 dominios por HTTP.
- `datos` — qué **rechaza** el esquema de `stores.json`, rompiéndolo a propósito.

**El build valida antes de compilar** — esquema Zod estricto (`strictObject`: una clave con typo no compila) + verificador de assets (los 43 ficheros declarados, incluidos logo, tipografía y favicons). Corre en `astro:config:setup`, así que un dato roto cae en la máquina de quien lo escribió, no al arrancar los 7 dominios ya desplegados.

**Se pueden añadir URLs** — el middleware reescribe cualquier ruta bajo el slug de la tienda; añadir una página es crear un `.astro` bajo `src/pages/[slug]/`. Con 404 real (antes había 7 soft-404) y `trailingSlash: 'never'`.

**Un solo `<head>`** — `Base.astro`. Estaba escrito a mano cuatro veces y ya había producido dos fallos vivos: las páginas legales se publicaban `index, follow` en cualquier host, y seguían con el azul anterior al manual de marca.

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

**Fase 3.9 — accesibilidad WCAG 2.2 AA como criterio de aceptación.** Hoy no hay **ni una** regla de `:focus-visible` en todo el proyecto, el bloque de `prefers-reduced-motion` está vacío, y el contraste del hero no se ha verificado sobre cada foto real (solo sobre una).

También sin dependencias: **3.8** imágenes responsive + presupuesto de peso en build, **3.3** `locals.store`, **3.10** partir `stores.json`.

**El bloqueante duro ya no existe.** Se podía cerrar la Fase 3 entera, pero conviene parar aquí: lo que de verdad mueve la aguja ahora es la Fase 2 (terminar migraciones) y la Fase 4 (contenido diferenciado), y ambas dependen de datos del franquiciado.
