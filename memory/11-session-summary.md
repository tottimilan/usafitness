# Session Summary — [PROJECT NAME]

> **Append-mode log.** Each meaningful session appends a new section at the top (newest first).
> Previous sessions are preserved below. Never delete. When this file exceeds ~20 sessions, archive the oldest to `docs/archive/sessions-YYYY-QN.md` in a single move-commit.
>
> **Conventions**
> - Newest session goes immediately under the `## Latest session

**Date:** 2026-08-24
**Who worked:** User + Claude Opus 5
**Duration:** sesión larga (onboarding + trabajo de producto)

### What was done
- **Onboarding MASTERMIND (workflow 06):** fase confirmada `Iteration`, seed retroactivo de 6 ficheros de memoria, y sync de la plantilla (64 ficheros) preservando README, `02-tech-stack.mdc` y las entradas propias del `.gitignore`.
- **Corrección grave de encuadre:** el seed inicial describía USAFitness como cadena de **gimnasios**. Son **tiendas de suplementación deportiva**. Causa raíz: se extrajeron campos de `stores.json` con `grep` en vez de leer el fichero. Corregido en `ac6c9e2`.
- **Descubrimiento del estado real:** solo 2 de los dominios servían este proyecto Astro; el resto seguía en **WordPress 7.1**. El proyecto es una **migración de WordPress a sistema propio**, no un producto terminado.
- **Visión registrada:** el objetivo es un **sistema de plantillas + librería de secciones** (no una landing por tienda a medida), y un **segundo ancla** futuro: campañas SEM/Meta geolocalizadas, con destino "plataforma de gestión" pero por etapas.
- **Código:** secciones opcionales (WhatsApp, reseñas, galería) y `aggregateRating` solo con reseñas reales.
- **Contenido:** 2 tiendas nuevas (GranCasa y El Arcángel → 7 en total), fotos reales recuperadas de los WordPress y convertidas a `.webp`, `hero` roto de Alcobendas arreglado, y datos legales de USA GOVE S.L. en dos tiendas.
- **Auditoría de repo (7 agentes):** MASTERMIND confirmado bien actualizado; se eliminó `generate-placeholders.js` (habría destruido los 8 logos reales si alguien lo ejecutaba), 833 KB de huérfanos, una foto duplicada en Las Rosas y el sitemap dejó de publicar páginas `noindex`.

### Decisions taken
_Link: `memory/07-decisions-log.md` — 5 entradas del 2026-08-24._

### New or mitigated risks
_Link: `memory/08-known-risks.md`._
- **Mitigados:** imágenes placeholder (riesgos 0 y 0b), cerrados tras recuperar las fotos reales.
- **Abiertos y relevantes:** WhatsApp apuntando a fijos en 4 tiendas (sin confirmar), reseñas duplicadas entre empresas distintas, `place_id` sintéticos en 3 mapas, `aggregateRating` autoservido (riesgo de acción manual de Google), y cero tests/CI.

### Current state
_Link: `memory/02-current-state.md` — tabla de 7 tiendas con motor real y datos legales._

### Segunda mitad de la sesión (tras el onboarding)
- **Identidad de marca**: el cliente facilitó el brand book. Paleta oficial aplicada a las 7 tiendas (`#0055B8` / `#98989A` / `#E1251B` + cian). Ni un color de la web coincidía con la marca; el rojo estaba ausente del producto entero.
- **Rendimiento**: viewport inicial de 814 KB → 162 KB. Logo vectorial real extraído del PDF de marca (277→23 KB) y fondo de hero recomprimido midiendo la diferencia *a través del overlay* (537→139 KB).
- **SEO estructurado**: `@type: Store`, `addressLocality` y `addressRegion` reales, y retirada del `aggregateRating` autoservido — Google declara esas páginas inelegibles para las estrellas, así que no daba nada y solo cargaba riesgo.
- **Sistema de plantillas COMPLETO**: registro de plantillas y secciones, orden como dato, y variantes de sección. Los tres ejes que definió el usuario.
- **Cookies**: aviso desacoplado de GA4, consentimiento revocable y señal en ambos sentidos.
- **Contenido**: dos tiendas nuevas (GranCasa y El Arcángel → 7), fotos reales recuperadas de los WordPress, datos legales de USA GOVE en dos tiendas.
- **Seguridad**: los originales de marca estaban en `public/` y eran descargables desde los 7 dominios. Movidos fuera.
- **Cloudflare**: desbloqueados los bots de IA en las 7 zonas (bloqueaba `Google-Extended`, o sea los AI Overviews).

### Tercera parte — el roadmap y su ejecución (Fases 0, 1 y 3.1)

El usuario cortó las preguntas: *"lo que necesito que hagas es no hacerme caso a mi, sino analizar"*. Se hizo un análisis a fondo (secciones que faltan, servicios vendibles, arquitectura de contenido) y salió el **ROADMAP DEFINITIVO de 8 fases**, que sustituye a `memory/06-feature-map.md`. Incluye lo que **no** se va a hacer y por qué.

**Fase 0 — limpiar lastres (`d13a1e1`, `7e31c45`)**
- Retiradas las **10 reseñas duplicadas** entre empresas legalmente independientes. 4 tiendas se quedan a 0 y la sección desaparece: correcto.
- Retirada la promesa **"Hasta 20% dto."** de los metadatos de todas las tiendas.
- **Hero por tienda** como `<img fetchpriority="high">` en vez de `background-image` en CSS — el navegador ya no tiene que esperar al CSS para empezar a descargarlo.
- **Tipografía autoalojada** y **mapa como fachada**: cero peticiones a terceros antes del consentimiento.

**Fase 1 — medición (`2800b67`)**
- `ConversionTracking.astro`: un solo listener delegado en fase de captura que emite `contacto_llamada`, `contacto_whatsapp` y `contacto_maps` con la **sección de origen**. (Llevaba `transport_type: 'beacon'`, retirado después en el PR #1: no existe en gtag de GA4 y gtag ya usa `sendBeacon` solo.)
- **Está escrito y no mide nada todavía:** `ga4Id` sigue a 0 de 7. Se activa solo con rellenar el ID.
- Entregada al usuario una guía paso a paso (artifact) para Search Console × 7, Cloudflare Web Analytics y GA4. **Lo está haciendo él ahora.**

**Fase 3.1 — red de seguridad (`c9626f8`)**
- 34 tests de humo con `node:test`, cero dependencias, contra el **build de producción**.
- Suite **validada por mutación**: reintroducir Google Fonts a propósito → 7 fallos; revertir → 34/34. Un test que no falla cuando debe no es un test.
- Encontró dos fallos reales que no se sabía que existían: `src/pages/index.astro` seguía cargando Google Fonts, y una aserción propia coincidía con un comentario del CSS.
- CI en GitHub Actions en cada push y PR.

### Cuarta parte — Fase 3 casi entera (2026-08-25)

**3.2 — esquema de `stores.json` (`fbd52d0`).** `strictObject`: una clave con typo ya no compila. Corre en `astro:config:setup`, no solo al importar el módulo — si solo estuviera en el módulo, se ejecutaría al arrancar el servidor, o sea ya desplegado, tumbando los 7 dominios a la vez. El aviso del roadmap ("el primer build estricto va a fallar en cadena") **no se cumplió**: la línea se puso en error para lo que rompe render o publica un dato falso, y en aviso para lo que solo degrada. 21 avisos, ninguno bloqueante. De propina: el parser de horario salió a `src/data/horario.ts` para que el esquema valide con el MISMO código que emite el marcado, y desaparecieron los 12 `as any`.

**3.4 + 3.5 — 404 real y rutas anidadas (`24b0a17`).** El bloqueante duro del roadmap. El middleware solo conocía `/` y las 4 legales y comparaba solo el primer segmento: era **literalmente imposible añadir una URL**. Ahora reescribe cualquier ruta bajo el slug de la tienda. Y las URLs inexistentes dan 404 de verdad en vez de 302 a la home — 7 soft-404 que Search Console no podía reportar, justo ahora que se acaban de dar de alta los dominios.

**3.7 — verificador de assets (`e50de48`).** Las 39 rutas de `stores.json` **y** los 4 assets que el código referencia a mano. Ese segundo grupo no estaba en el enunciado y es el peor: si falta la tipografía no se ve un hueco, se ve otra letra.

**3.6 — un solo `<head>` (`61dd93e`).** Estaba escrito a mano cuatro veces. No era un riesgo teórico, ya había producido dos fallos vivos: las páginas legales se publicaban `index, follow` **en cualquier host** (comprobado: `preview.up.railway.app/vigo/aviso-legal` → indexable, compitiendo con el dominio del propio cliente), y seguían con `theme-color: #1B3A6B`, el azul anterior al manual de marca.

**Un fallo propio que atrapó el CI (`7252c54`).** `.gitignore` traía `build/` sin anclar — en git eso significa "cualquier carpeta llamada build a cualquier profundidad" — y se tragó `src/build/`, que es código fuente. El fichero existía en local, el build pasaba en local y los 59 tests pasaban en local. El CI cayó con "Cannot find module". Anclados los seis patrones de salida de build a la raíz, y añadido un test que importa el módulo para que un clon recién hecho falle si vuelve a pasar.

**Estado de la red:** 60 tests en dos suites. `smoke` comprueba qué RESPONDEN los 7 dominios; `datos` comprueba qué RECHAZA el esquema, rompiéndolo a propósito.

### Quinta parte — el primer `/mm-gate` del proyecto (2026-08-25)

**Veredicto: BLOCK.** 13 agentes, 6 dimensiones auditadas contra `phase-criteria.json`, un escéptico por dimensión. De 29 bloqueos propuestos, 6 refutados y 23 confirmados. Los 4 criterios de entrada a Launch fallan los 4: sin SLA/SLO escrito (`memory/03:52` dice literal `_TBD_`, y `memory/06:153` vende "Guardia técnica y SLA" como módulo mensual), sin runbook, sin un solo rollback probado en 80 commits, y sin ninguna revisión de cumplimiento.

**Y la fase declarada era falsa.** El gate resolvió de paso la confirmación retroactiva que llevaba pendiente desde el 2026-06-24. 3 de los 4 criterios de entrada de Iteration no se cumplían entonces y siguen sin cumplirse. El proyecto no transitó a Iteration: fue **colocado** ahí durante el onboarding. Corregido a **MVP** con aprobación explícita del usuario (`45666d9`).

**Dos correcciones al informe, verificadas a mano:**
1. La exposición legal viva eran **dos** tiendas, no una: Marineda **y** Alcobendas servían `index, follow` con un aviso legal que no identificaba a nadie.
2. **Marineda ya había migrado a Astro.** Son 4 de 7, no 3. `memory/02` estaba obsoleta.

**Un hallazgo que nadie buscaba:** los 3 dominios que siguen en WordPress llevan GTM; los 4 en Astro no llevan nada. Hoy migrar una tienda le **quita** la única medición que tenía. Eso reordena la prioridad de rellenar `ga4Id`.

**Donde no seguí la recomendación:** el informe proponía poner también la portada en `noindex` mientras faltaran datos legales. No se hizo. El `noindex` no cura la LSSI —la obligación nace de que el sitio esté público, no de que esté indexado— y destruiría el posicionamiento de dos tiendas vivas. En su lugar (`b29dcbb`) los documentos legales publican ahora los datos identificativos del establecimiento que sí constan, con una advertencia visible de qué falta. **Es reducción de daño, no cumplimiento**, y el código lo dice con esas palabras. Verificado en vivo tras el despliegue: ambos dominios ya lo sirven.

**Primer ADR del proyecto:** `docs/adr/0001-phase-gate-iteration-launch.md`. El directorio no existía, y su ausencia es a la vez uno de los huecos que el gate señala.

### Sexta parte — mapas rotos, la escala real, y el modelo de negocio (2026-08-26)

**Los mapas apuntaban a una dirección, no a la tienda (PR #4).** El usuario
reportó dos síntomas como uno y eran fallos independientes: el embed
geocodificaba un texto (`?q=<dirección>`), así que el pin caía sobre el centro
comercial; y el botón era un `/maps/search/`, que abre resultados, no una ficha.
Y un tercero que nadie buscaba: **cuatro `geo` con más de un kilómetro de
error** (marineda 1.871 m, vigo 1.340 m, villanueva 1.291 m, alcobendas
1.003 m), alimentando el Schema.org.

Arreglado con la forma canónica por CID, **verificando cada uno yo**: round-trip
del feature id hexadecimal a decimal (4/4), los 6 embeds devolviendo `spotlit` y
el nombre de la tienda, y las coordenadas sacadas del propio payload de Google.
GranCasa no tiene ficha y se declara así en vez de enlazar la del centro
comercial — hay lista negra en el esquema con ese CID, porque era la tentación
obvia y habría publicado la tarjeta de otro negocio.

**Accesibilidad (PR #3).** La auditoría encontró algo que no estaba en el
roadmap: **la burbuja de WhatsApp estaba tapada al 100% por el aviso de cookies
en móvil** — 0 de 324 píxeles alcanzables, y 132 de ellos caían sobre el botón
«Aceptar». Uno de los tres caminos de conversión, muerto en móvil, en la primera
visita de cualquiera; y quien lo intentaba daba un consentimiento que no quería
dar. Además `<main>` envolvía la página entera, header y footer incluidos.

**El consentimiento bajo test (PR #3).** El obstáculo era estructural: un
`<script is:inline>` no se puede importar, así que ningún test llegaba a la
lógica. La solución fue sacarla a `src/data/consentimiento.ts` e inyectar su
**código fuente** con `toString()`: una sola implementación, probada de verdad.
Cinco mutaciones que antes pasaban en verde ahora se ponen rojas.

**Instagram en las 8 tiendas (PR #5).** Cada handle verificado leyendo el
`og:title` real. Dije que Las Rosas no tenía cuenta y **sí la tenía**: el patrón
de la cadena lleva puntos (`usafitness_c.c.lasrosas`) y solo probé guiones
bajos. Peor: **mi método de verificación se rompió a mitad** y devolvía 200 sin
`og:title` tanto para perfiles reales como inexistentes. Se detectó porque el
control positivo también falló.

**Lagoh, la octava tienda (PR #6).** Existía con dominio y WordPress y no estaba
en el repo. Montada con todo lo verificable; su hero se amplía 1,75× porque su
WordPress solo guarda las fotos a 382px, y **no las he reescalado**: inventar
píxeles no añade nitidez.

**Y el hallazgo que reencuadra el proyecto entero: son 58 tiendas, no 7.**
Leído del directorio de `usafitness.es`. 47 en centro comercial y **11 a pie de
calle** — que el esquema no admite, porque exige `mall`. Y eso cierra la duda de
Villanueva: aparece **sin `C.C.`**, cuarta fuente independiente diciendo que
«C.C. El Zoco» está mal.

**El modelo de negocio, decidido.** Se vende a cada franquiciado; la central
avisa. El techo pasa a ser comercial: operar 58 tiendas cabe en 43,5 h/mes, pero
51 altas manuales son 25 meses. Y el muestrario de plantillas —que el usuario
pidió como material de venta— le da por fin un consumidor al sistema de
plantillas, que llevaba desde el 24 de agosto construido y sin usar por nadie.

### Séptima parte — el loop grande del dueño: secciones, patrones, marca, servicios y las cinco (2026-08-27 → 2026-09-06)

- **Flota 8/8 en nuestro sistema** (dueño: «no queda ninguna en WordPress»; medido con `npm run flota`). Galería con **filas justificadas** tras el hueco que el dueño vio en villanueva (PR #24). **Capa 0**: `resolveSections` ya no descarta en silencio secciones nuevas; presupuesto partido (120 KB duro para plantilla, 900 KB aviso para página).
- **Gramática de formas de la marca** (`docs/brand/gramatica-de-formas.md`): siete elementos vistos en brand book, banners y locales. Ninguna plantilla anterior los usaba — es la palanca de diferenciación.
- **Loop de secciones** (`docs/product/loop-secciones-2026-08-27.md`): la estructura aguanta; cuatro hojas cambian; falta la **prioridad por tienda**; `placeId` para el enlace de reseña (el formulario de Google exige Place ID, verificado).
- **Servicios y automatización** (`docs/product/servicios-y-automatizacion-2026-08-27.md`): 35 servicios en cinco capas, 15 nuevos, 22 descartes, orden de 12 pasos.
- **Catálogo de patrones 2026** (11 agentes, 292 ejemplos verificados, 37 patrones, 7 familias) y **espacio de diseño repartido en cinco** antes de diseñar (matriz 5×5).
- **Las cinco plantillas** (18 agentes: 5 diseñadores, 10 críticas, miniatura, síntesis): todas viven con arreglos, Estantería condicional; orden Rótulo → Esquina → Tablero → Estantería → Recorrido; minutero retirado hasta calendario de festivos (R3).
- **Dos artefactos publicados y auditados** (contraste claro/oscuro, 375/1340, fuentes, foto real de Lagoh): Guía https://claude.ai/code/artifact/977c7298-0a0d-499d-9910-00629cd60cd0 · Cinco https://claude.ai/code/artifact/fed66a91-62c8-4a22-b2eb-06051f0c9ad5. Vistos en píxeles: cabecera de la Guía, Esquina, Estantería y la cabecera de Tablero; Rótulo y Recorrido solo medidos (la ventana oculta agotaba las capturas).
- **PR #25** abierta con todo el bloque. Puerta: la confirmación del dueño sobre las cinco y sus 13 decisiones (memory/12).
- **Errores nuevos catalogados** (memory/16): #11 argumento comercial no comprobado en el código · #12 panel del navegador compartido con subagentes · #13 los especímenes también se auditan.

### Octava parte — las ocho preguntas delegadas y el plan de Rótulo (2026-09-06)

- El dueño **delegó** las ocho preguntas que le habían quedado abiertas: «analízalas tú, busca en internet, en lo que tenemos, en cómo se hace una buena web, y respóndete tú». Las ocho están respondidas en `docs/product/decisiones-2026-09-06-ocho-preguntas.md`.
- **El hallazgo que más cambia el sistema:** la Ley 1/2004 art. 5 da plena libertad de días y horas a los locales de menos de 300 m² que no pertenecen a un grupo de distribución grande. Nuestras tiendas lo son, así que los calendarios autonómicos de apertura no les aplican y **el festivo se decide por centro comercial**. Con eso el minutero «cierra en X», retirado el 27-ago, puede volver acotado a los días no marcados.
- **Verificado midiendo, no razonando:** el descodificador de Place ID acierta en 7 de 7 tiendas y rechaza un CID pelado y un Place ID de dirección; las dos fuentes de Rótulo generadas con fontTools desde un commit anclado pesan 5.124 y 4.520 bytes; el avance medio de las mayúsculas de Archivo expandida es 0,927 em, y con él 40 de 58 rótulos caben estrictos y 52 con corte de hasta tres caracteres; la cursiva del cartel real es fina, no de pincel (comparé el render de tienda con las cinco candidatas en una misma imagen).
- **Dos errores nuestros cazados por la investigación:** la pila tipográfica de Rótulo empezaba por `-apple-system`, que en iPhone pinta San Francisco y no Helvetica Neue, y ponía Arial antes que Segoe UI, matando el Light en el 31 % de visitas que son Windows. Y la gramática de marca transcribía mal un claim de pared: dice «YOUR Success IS OUR GOAL!», no «Journey».
- **Rótulo repartido en siete rodajas** con plan escrito para las dos primeras. Ninguna toca las ocho webs vivas. Nada construido: el dueño elige opción de ejecución.
- **Coste del método:** el workflow agotó el modelo dos veces (24 agentes caídos de 35 en la segunda vuelta). Las dos preguntas que quedaron sin investigar las cerré yo con lectura directa de la ley y de las órdenes autonómicas, que resultó ser mejor camino que el agente.

### Top 3 next priorities

Reordenadas el 2026-08-26 por el modelo de negocio decidido. La restricción ya
no es técnica, es **cuántas tiendas caben**:

1. **`scripts/nueva-tienda.mjs` — automatizar el alta.** Es LA pieza: cada hora
   que se recorte del alta es una tienda más al año. Montar Lagoh llevó una
   sesión entera y solo una decisión necesitó criterio humano (elegir el plano
   general mirando las fotos). Todo lo demás —sacar teléfono y dirección del
   WordPress, resolver la ficha de Google, verificar el Instagram con controles,
   convertir fotos, validar— es mecánico y está hecho ya a mano ocho veces.
2. **El muestrario `/muestrario`.** Material de venta y, de paso, el primer
   consumidor del sistema de plantillas. Un día de trabajo según el catálogo.
3. **Los `ga4Id`.** Siguen a 0 de 8 y el código lleva escrito desde `2800b67`.
   Sin medición no hay informe mensual, y sin informe mensual el catálogo
   entero pierde su envase.

Pendientes de datos del franquiciado, sin cambios: datos legales de 5 tiendas,
el teléfono de Marineda que no coincide con su ficha, los horarios de 4 tiendas
y la ficha de Google de GranCasa. Ver `docs/mapas/pendiente-franquiciados.md`.

Técnicas sin dependencias: el rediseño de la galería (las verticales se ven al
56%), 3.8 imágenes responsive, 3.3 `locals.store`, 3.10 partir `stores.json`.

### Lessons learned (candidates for cross-project Memory Graph)
- **`grep` es para localizar, nunca para concluir.** Extraer campos sueltos de un fichero de datos y no leer su contenido llevó a inferir el sector equivocado del nombre de marca, y contaminó toda la memoria hasta que el usuario lo corrigió.
- **Verificar el estado desplegado, no solo el repo.** El repositorio describía 5 tiendas "vivas"; comprobar cada dominio reveló que 3 seguían en WordPress. Un `curl` por dominio cambió el encuadre del proyecto entero.
- **Un script de andamiaje sin guardas es una mina.** `generate-placeholders.js` escribía sin comprobar existencia; meses después habría destruido activos reales.
- **Un test hay que verlo fallar.** Dos falsos verdes (`fetch` descarta la cabecera `Host`; `astro dev` devuelve 403 a cualquier `Host`) habrían dado una suite verde que no comprobaba nada. La mutación deliberada es la única prueba de que un test sirve.
- **Un manual de marca no es un sistema de diseño.** Sus colores están pensados para impresión y rotulación. Aplicar el gris corporativo a texto de 13 px dio 2.63:1 sobre el 4.5:1 exigido. Medir después de aplicar, siempre.
- **"Desacoplado" hay que comprobarlo, no declararlo.** Se dieron por separadas dos variables que seguían valiendo lo mismo (`avisoCookies = analitica`): funcionalmente idéntico a no haber hecho nada.
- **Un `git status` limpio no demuestra que el árbol esté completo.** Un fichero ignorado es invisible en `git status` Y en el repositorio. `build/` sin barra inicial se tragó `src/build/`; todo pasaba en local y el CI cayó con "Cannot find module". Los patrones de salida de build hay que anclarlos con `/`.
- **Duplicar el `<head>` no es un riesgo, es un fallo con retardo.** Dos de las cuatro copias ya habían derivado: una publicaba páginas legales de un cliente como indexables en el host de preview, la otra llevaba un color de marca retirado. Ninguna de las dos daba error en ningún sitio.
- **Un esquema que rechaza todo lo importante bloquea el despliegue de clientes vivos.** La línea útil no es "estricto" ni "laxo": error para lo que rompe render o publica un dato falso, aviso para lo que solo degrada y depende de terceros.


---

## Previous sessions

_None yet. Older sessions accumulate below as work progresses._
