# Rótulo — desglose en rodajas (breakdown)

**Fecha:** 2026-09-06 · **Epic:** plantilla «Rótulo», la primera del método y la demo pre-construida por defecto · **Fase:** F1 abierta → F3 con esta plantilla.
**Fuentes de verdad:** diseño y arreglos en `docs/plantillas/cinco/plantillas.md` (§Rótulo) y `docs/plantillas/cinco/espacio-de-diseno.md`; las ocho decisiones delegadas por el dueño el 6-sep en `docs/product/decisiones-2026-09-06-ocho-preguntas.md`; capa 0 ya construida (PR #23: `resolveSections` filtra contra `SECTION_IDS`, presupuesto con tope duro de 120 KB, `usaFuenteBase` en `presupuesto.ts`).
**Regla de reparto:** una rodaja = un PR de ≤ ~8 ficheros, con sus tests, que deja `main` desplegable. Lo no visual va bajo TDD con mutación; lo visual pasa Loop A (sección) y Loop B (plantilla) con capturas antes de la puerta del dueño (`docs/metodologia/creacion-de-webs.md` §4).

---

## Mapa de rodajas

| # | Rodaja | Tipo | Depende de | Plan detallado |
|---|---|---|---|---|
| 1a | `datos-rotulo` — campos de tienda y mecánica de orden | código, TDD | capa 0 | `.cursor/plans/2026-09-06-rotulo-1a-datos.md` |
| 1b | `fuentes-rotulo` — las dos fuentes autoalojadas y el contrato de plantilla | código, TDD | capa 0 | `.cursor/plans/2026-09-06-rotulo-1b-fuentes.md` |
| 1c | `ofertas` — modelo de datos de la oferta del mes (propia > central > nada, fecha-fin) | código, TDD | 1a | se planifica al cerrar 1a (`/mm-plan ofertas`) |
| 1d | `hoy-y-festivos` — `franjaDeHoy` con zona horaria de Madrid y el calendario por centro comercial que decide cuándo callar | código, TDD | 1a | se planifica al cerrar 1a (`/mm-plan hoy-y-festivos`) |
| 2 | `secciones-gen-2` — Hazte socio, Empieza aquí, Por qué en tienda, FAQ; variantes `hoy` (horario+dónde), `puertas` (productos+marcas), `dato` (reseñas con enlaces), `tira` (galería 4:5) | visual, Loop A por pieza | 1a | se planifica al cerrar 1a (`/mm-plan secciones-gen-2`) |
| 3 | `plantilla-rotulo` — hoja CSS, hero, periferia, tests de humo, Loop B, ficha | visual, Loop B | 1a, 1b, 2 | se planifica al cerrar 2 (`/mm-plan plantilla-rotulo`) |
| 4 | `demo-pre-construida` — `scripts/nueva-tienda.mjs` genera la home de un prospecto con Rótulo desde el directorio de la central | código + proceso comercial | 3 | fuera de esta tanda; hoy el script no existe |

**Por qué este orden.** 1a y 1b son independientes entre sí y se pueden ejecutar en paralelo (worktrees): no comparten ficheros salvo `tests/datos.test.mjs`, donde cada una añade su `describe`. Ninguna de las dos cambia un píxel de las 8 webs vivas (0/8 tiendas declaran `template`). La rodaja 2 necesita los campos de 1a (`prioridad`, `placeId`, `fotoInterior`, `franjaDeHoy`) y es la que produce las piezas nuevas que cualquier plantilla de las cinco hospedará; se construye y se juzga sección a sección. La 3 es la plantilla propiamente dicha y solo tiene sentido cuando las secciones ya pasaron Loop A. La 1c entra antes del Loop B para que la demo de Marineda enseñe el rojo, el cupón y `/oferta` con una oferta real (arreglo aceptado en la síntesis de las cinco).

---

## Rodaja 1a — `datos-rotulo`

**Objetivo.** Que `stores.json` pueda decir lo que Rótulo necesita saber de una tienda, con el esquema que lo valida, los avisos que degradan y las funciones puras que lo convierten en dato de página.

**Entra:**
- `rotulo` (texto corto del cartel; regla en las decisiones del 6-sep) con caída a `location` recortada en la coma, y la función `rotuloDe(store)`.
- `prioridad: 'visita' | 'oferta' | 'socio' | 'asesoramiento'` y `Template.zonaMovil = { posicion, defecto, mapa }`; `resolveSections(template, store)` hace el intercambio de UN bloque y cae al defecto con aviso si el bloque elegido no tiene dato; `prioridad` y `sections` a la vez es error.
- `placeId` (`ChIJ…`, 27 caracteres) verificado en build: el CID que lleva dentro debe ser el de `googleMapsLink`; prohibido con `sin-ficha-gbp`; `enlaceResena(store)` como única función que construye `https://search.google.com/local/writereview?placeid=…` (caída a «Ver en Google» por CID; `null` sin ficha); `scripts/place-id.mjs --verificar|--escribir`; los 7 valores medidos en `stores.json`.
- `fotoInterior` (ruta que debe estar en `galleryImages`): la foto que la banda de papel puede duotonar; sin ella, plano cian.
- `franjaDeHoy(schedule, fecha)` en `horario.ts` con `Intl.DateTimeFormat` y `timeZone: 'Europe/Madrid'` (el servidor va en UTC): devuelve `{ opens, closes } | null`. Solo la franja; nada de «abierto ahora» (R3).
- Registro de eventos: fila `pedir_resena {seccion}` en `docs/medicion/guia-alta.md` §3.4 y clasificación en `ConversionTracking` (un `href` a `search.google.com/local/writereview`).

**Ficheros:** `src/data/stores.ts`, `src/data/stores.json`, `src/data/templates.ts`, `src/data/horario.ts`, `src/data/resenas.ts` (nuevo), `scripts/place-id.mjs` (nuevo), `src/components/ConversionTracking.astro`, `tests/datos.test.mjs`, `docs/medicion/guia-alta.md`.

**Criterios de éxito (observables):**
- [ ] `npm run build` verde y sigue diciendo «stores.json válido — 8 tiendas»; ninguna web viva cambia (`npm test` verde sin tocar los tests de las canónicas).
- [ ] `node --test tests/datos.test.mjs` con los describes nuevos en verde, y cada test nuevo muere con su mutación anotada en el commit.
- [ ] `stores.json` lleva `rotulo` en 8/8 y `placeId` en 7/8; `scripts/place-id.mjs --verificar` sale con 0.
- [ ] `avisosDeDatos()` lista «sin placeId» solo para grancasa y «prioridad sin dato» cuando toque.

## Rodaja 1b — `fuentes-rotulo`

**Objetivo.** Las dos fuentes de Rótulo generadas de forma reproducible, medidas y bajo el tope, con el contrato de plantilla ampliado.

**Entra:** `scripts/fuentes-rotulo.py` (fontTools desde `google/fonts` a commit fijo: instancia Archivo wdth 125 / wght 900 → subset de `src/data/fuentes/glifos-rotulo.txt`; Allura subset de `src/data/fuentes/palabras-script.txt`); `public/fonts/archivo-expanded-black-rotulo.woff2` (5.124 B medidos) y `public/fonts/rotulo-script.woff2` (Allura, 4.520 B medidos); `public/fonts/LICENCIAS.md`; `usaFuenteBase?: boolean` y `modo?: 'claro' | 'auto'` en `interface Template`; cabecera de `presupuesto.ts` con la fila medida de Rótulo; tests: los ficheros existen y pesan ≤ 6 KB, el test de fuentes de humo recorre todas las plantillas, y cada carácter del rótulo de las 8 tiendas está en la lista de glifos.

**Ficheros:** `scripts/fuentes-rotulo.py` (nuevo), `src/data/fuentes/glifos-rotulo.txt` y `palabras-script.txt` (nuevos), `public/fonts/*.woff2` (2 nuevos), `public/fonts/LICENCIAS.md` (nuevo), `src/data/templates.ts`, `src/data/presupuesto.ts`, `tests/datos.test.mjs`, `tests/smoke.test.mjs`.

**Criterios de éxito:** ficheros generados dos veces dan los mismos bytes; tests verdes; `npm run build` sigue sin tocar el tope (la plantilla aún no existe, así que las fuentes no se cuentan hasta la rodaja 3, pero ya están en disco y probadas).

## Rodaja 1c — `ofertas`

Modelo de datos aprobado el 27-ago (memory/04): dos niveles con precedencia propia > central, `fechaFin` obligatoria, despublicación automática por fecha en SSR, procedencia. Sin oferta viva, ni la sección ni un píxel rojo. Se planifica al cerrar 1a.

## Rodaja 1d — `hoy-y-festivos`

`franjaDeHoy(schedule, fecha)` en `horario.ts`, calculada con la zona horaria de Madrid porque el servidor va en tiempo universal, y `src/data/festivos/<centro>.json` con las fechas en que ese centro comercial abre distinto o no abre. Las dos van juntas a propósito: la franja sola miente el día de fiesta.

**Por qué el centro y no la comunidad autónoma** (decisión del 6-sep, con la ley leída): la Ley 1/2004 da plena libertad de días y horas a los locales de menos de 300 m² que no pertenecen a un gran grupo, y nuestras tiendas lo son. Los calendarios autonómicos de apertura en domingos y festivos no les aplican; lo que decide si el cliente llega a la puerta es si abre el centro. El calendario laboral solo sirve para marcar los catorce días del año por los que hay que preguntar.

**Degradación, que es lo que R3 exige:** en un día marcado sin horario confirmado se imprime «Hoy es festivo: consulta el horario del centro», nunca una cuenta atrás. Sin fichero para ese centro, solo la franja del día. **Con esto el minutero «cierra en X» puede volver**, acotado a los días no marcados, que son unos 350 al año.

## Rodaja 2 — `secciones-gen-2`

Cuatro secciones nuevas (`socio`, `empieza`, `porque`, `faq`) en `SECTION_IDS` + registro + componente, y cuatro variantes de secciones existentes (`schedule:hoy`, `products:puertas`, `reviews:dato`, `gallery:tira`). Cada pieza con su hoja P/N/evento (las cinco de `docs/plantillas/secciones-f1/ficha.md` más las que faltan, en `docs/plantillas/rotulo/ficha.md`), captura 375 y 1440 con Lagoh y Marineda, test de primera mirada escrito antes de comparar, pasa/no pasa. La variante `tira` cambia el test «la galería no recorta ninguna foto» para que aplique solo a la galería clásica: decisión del dueño (memory/12, pregunta 7) con nota en memory/07.

## Rodaja 3 — `plantilla-rotulo`

`src/data/plantilla-rotulo-css.ts`, `TEMPLATES.rotulo` (tokens con `--font-family` de sistema, `usaFuenteBase:false`, `modo:'auto'`, `fonts`, `periferia`, `sections` con `zonaMovil`), variante `rotulo` del hero (rótulo con tamaño por tienda en SSR a partir de la tabla de avances medida, k = 0,927 em; línea «Hoy 10:00–22:00 · C.C. Lagoh · Sevilla»; dos botones que degradan; línea de cifras del catálogo; banda de papel con `fotoInterior`), periferia `logotipo-en-color` / `pie-rotulo` / `barra-2-acciones`, bloque de humo «La plantilla Rótulo es OTRA web, no otra piel» (marcas, CTAs, sin `animation-timeline`, sin fuga, sin `inter-latin`, R9 en el preview), Loop B con 4 capturas y aviso de cookies abierto, prueba de muerte en miniatura contra Energía, ficha completa. Puerta: el dueño.

---

## Lo que NO entra en esta tanda

`/oferta`, `/socio`, `/guia` y `/mostrador` (landings de F2), Nuestro equipo y Las verdades (voz de Recorrido), Novedades y el Muro (servicio mensual), el vídeo-tour como celda (puerta de la central; el campo `videoTour` entra en 1a solo como esquema si la decisión del 6-sep lo fija), la capa de festivos con estado en vivo (R3: hasta que exista el calendario por centro).
