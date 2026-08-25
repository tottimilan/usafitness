# Testing Status — USAFitness Landing Pages

**Last updated:** 2026-08-25 · **Commit:** `7252c54`

> Este fichero llegó a existir como copia byte-idéntica del homónimo de la plantilla MASTERMIND (describía Pester y skill-quality-evaluator, no este proyecto). Reescrito con el estado real; a partir de aquí describe lo que hay.

## Estado: 60 tests en dos suites + CI

```bash
npm run build && npm test
```

`npm test` → `node --test tests/*.test.mjs` (hoy: `tests/smoke.test.mjs`). **Cero dependencias**: `node:test` y `node:assert` vienen con Node.

### Por qué contra el build de producción y no contra `astro dev`

Vite bloquea la cabecera `Host` y responde 403 a cualquier host que no sea el suyo. Un test contra `astro dev` daría el mismo error antes y después de cualquier cambio: verde permanente que no comprueba nada.

### Por qué `node:http` y no `fetch`

`Host` es *forbidden header name* en la especificación de fetch: **undici la descarta en silencio**. Con `fetch`, todas las peticiones llegaban al host genérico y la suite parecía verificar el enrutado por dominio sin verificar absolutamente nada. Es el falso verde exacto que este fichero existe para evitar.

## `tests/smoke.test.mjs` — qué RESPONDEN los 7 dominios (45 tests)

| Bloque | Afirma |
|---|---|
| Cada dominio sirve su tienda | 200 en su propio dominio · canonical al dominio propio · `index, follow` · el nombre de la tienda aparece · **ningún dominio ajeno se filtra en el HTML** |
| Hosts no canónicos | un host desconocido (p. ej. el de Railway) va a `noindex` · `www.` resuelve igual que el dominio pelado |
| Sitemap | XML bien formado · incluye su propia home · **no lista ninguna otra tienda** · sin `company`, las legales no se envían a Google |
| Las 4 páginas legales | responden 200 en los 7 dominios · `robots` correcto según haya datos legales o no · razón social presente · ningún `undefined` publicado · NIF en el aviso legal (LSSI art. 10) |
| Aislamiento entre sociedades | **el NIF de una sociedad no puede aparecer en el dominio de otra** |
| Cero terceros pre-consentimiento | sin referencias reales a `fonts.googleapis.com` ni `fonts.gstatic.com` · sin `<iframe>` · sin `googletagmanager` mientras no haya `ga4Id` |
| 404 y rutas nuevas | una URL inexistente da **404 de verdad** en los 7 (antes: 302 a la home) · el 404 lleva la marca de SU tienda y no nombra a ninguna otra · una ruta anidada también 404 · la barra final se corrige con 301 · los estáticos no pasan por el reescrito de dominios |
| Indexación por host | las páginas legales tampoco se indexan fuera del dominio de su tienda · el 404 nunca se indexa |

## `tests/datos.test.mjs` — qué RECHAZA el esquema (15 tests)

No comprueba los datos: comprueba **la guarda**. Cada test rompe una tienda por un sitio distinto y exige que el esquema falle. Un esquema al que nunca se le ha visto rechazar nada podría estar aceptándolo todo.

Cubre: clave con typo · teléfono que no se puede marcar · horario que el parser no entiende · NIF imposible · `company` a medias · dominio repetido · la misma persona firmando en dos tiendas · sección inventada · `ga4Id` que no lo es · ruta de imagen sin barra inicial · que los 43 ficheros declarados existan · **que el propio verificador esté en el repositorio** (`.gitignore` se lo tragó una vez).

Lee `src/data/*.ts` directamente — Node ejecuta TypeScript desde la v23.6 — así que prueba el módulo real, no una copia de sus reglas.

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
- **Accesibilidad y contraste.** Se mide a mano → tarea **3.9**.

## Validación de la suite de datos

Se mutó la regla de indexación por host (`Base.astro`) → 2 fallos. Se devolvió el soft-404 → 7 fallos. Se borró una foto declarada → el build cae nombrando fichero y sitio. Restaurado todo → 60/60.

## Siguiente refuerzo previsto

**3.9 — accesibilidad como criterio de aceptación**, no como auditoría única. Hoy no hay ni una regla de `:focus-visible` y `prefers-reduced-motion` está vacío. Es lo único que queda con una comprobación posible en build (contraste calculado, tamaño de área táctil).
