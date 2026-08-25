# Testing Status — USAFitness Landing Pages

**Last updated:** 2026-08-24 · **Commit:** `c9626f8`

> Este fichero llegó a existir como copia byte-idéntica del homónimo de la plantilla MASTERMIND (describía Pester y skill-quality-evaluator, no este proyecto). Reescrito con el estado real; a partir de aquí describe lo que hay.

## Estado: 34 tests de humo + CI

```bash
npm run build && npm test
```

`npm test` → `node --test tests/*.test.mjs` (hoy: `tests/smoke.test.mjs`). **Cero dependencias**: `node:test` y `node:assert` vienen con Node.

### Por qué contra el build de producción y no contra `astro dev`

Vite bloquea la cabecera `Host` y responde 403 a cualquier host que no sea el suyo. Un test contra `astro dev` daría el mismo error antes y después de cualquier cambio: verde permanente que no comprueba nada.

### Por qué `node:http` y no `fetch`

`Host` es *forbidden header name* en la especificación de fetch: **undici la descarta en silencio**. Con `fetch`, todas las peticiones llegaban al host genérico y la suite parecía verificar el enrutado por dominio sin verificar absolutamente nada. Es el falso verde exacto que este fichero existe para evitar.

## Qué cubre (7 dominios × cada bloque)

| Bloque | Afirma |
|---|---|
| Cada dominio sirve su tienda | 200 en su propio dominio · canonical al dominio propio · `index, follow` · el nombre de la tienda aparece · **ningún dominio ajeno se filtra en el HTML** |
| Hosts no canónicos | un host desconocido (p. ej. el de Railway) va a `noindex` · `www.` resuelve igual que el dominio pelado |
| Sitemap | XML bien formado · incluye su propia home · **no lista ninguna otra tienda** · sin `company`, las legales no se envían a Google |
| Las 4 páginas legales | responden 200 en los 7 dominios · `robots` correcto según haya datos legales o no · razón social presente · ningún `undefined` publicado · NIF en el aviso legal (LSSI art. 10) |
| Aislamiento entre sociedades | **el NIF de una sociedad no puede aparecer en el dominio de otra** |
| Cero terceros pre-consentimiento | sin referencias reales a `fonts.googleapis.com` ni `fonts.gstatic.com` · sin `<iframe>` · sin `googletagmanager` mientras no haya `ga4Id` |
| Integridad de datos | dominios y slugs únicos · **ninguna reseña firmada por la misma persona en dos tiendas** · el horario de cada tienda parsea a `openingHoursSpecification` |

## Validación de la propia suite

Se **mutó a propósito**: reintroducir Google Fonts → **7 fallos**; revertir → **34/34**. Un test que no se ha visto fallar no es un test.

Encontró dos fallos reales que nadie sabía que existían:
1. `src/pages/index.astro` seguía cargando Google Fonts después de "haber autoalojado la tipografía".
2. Una aserción propia coincidía con un **comentario del CSS** que nombraba `fonts.googleapis.com` y viajaba al bundle. Corregida para exigir referencias reales (`href`/`src`/`url()`).

## CI

`.github/workflows/ci.yml` — en cada push a `main`, cada PR y bajo demanda: `npm ci` → `npm run build` → los 34 tests. `npm ci` y no `npm install`, para que el CI verifique exactamente las versiones que va a desplegar Railway.

## Qué NO cubre (honesto)

- **Render visual.** Nada comprueba que la página se vea bien. Un CSS que rompa la maqueta pasa los 34 tests.
- **JavaScript de cliente.** El aviso de cookies, la fachada del mapa y `ConversionTracking` no se ejecutan: se verifica que el marcado esté, no que funcione al pulsarlo.
- **GA4 de extremo a extremo.** No se podrá hasta que exista un `ga4Id` real.
- **Que las imágenes existan.** Una ruta mal escrita en `stores.json` sigue dando una imagen rota sin error → tarea **3.7** del roadmap.
- **Accesibilidad y contraste.** Se mide a mano → tarea **3.9**.

## Siguiente refuerzo previsto

**3.2 — esquema Zod sobre `stores.json`**: mueve una clase entera de fallos de «error silencioso en producción» a «el build no compila». **El primer build estricto fallará en cadena** (4 tiendas sin `company`, `place_id` sintéticos): es el objetivo, no un problema.
