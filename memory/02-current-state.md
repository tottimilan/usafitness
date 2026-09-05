# Current State — USAFitness Landing Pages

**Phase:** MVP

**Última actualización:** 2026-08-27 · Reescrito completo (el anterior describía 7 tiendas y tareas ya cerradas).

> `**Phase:**` arriba, en inglés y en su propia línea, no es un descuido de idioma:
> `scripts/phase-gate-check` lo lee con `^\*\*Phase:\*\*`. No traducirlo ni moverlo.

---

## Qué es esto en una frase (el norte completo: `docs/product/norte.md`)

Producto que se vende **tienda a tienda** a ~50 franquiciados USA Fitness: una web por tienda que convierte búsqueda local en visitas físicas, con mejoras medibles que justifican pagarla. **Lo más importante del proyecto es venderlo a más tiendas** (dueño, 2026-08-27) — todo lo técnico es instrumento.

## El giro del 2026-08-26/27 — leer antes de tocar nada visual

Dos plantillas (`angular`, `energia`) **rechazadas por el dueño** por el mismo defecto: reestilizar su esqueleto original en vez de diseñar desde objetivos. Consecuencia: existe un **sistema documental nuevo que gobierna toda creación**:

- `docs/product/norte.md` — qué es el proyecto y qué manda.
- `docs/metodologia/creacion-de-webs.md` — CÓMO se crea cualquier web/sección/plantilla/mecanismo (hoja de objetivos → evidencia → referencias en artefacto → **confirmación del dueño** → loops A/B/C con capturas).
- `docs/product/metodo-plantillas-y-conversion.md` — el desglose de los rechazos y el plan por fases F0-F5.
- `docs/product/investigacion-conversion-2026-08.md` — 61 hallazgos con fuentes (41 verificados) que sostienen las decisiones.
- `memory/16-protocolo-agente.md` — cómo decide y se autoevalúa el agente. **Sesión nueva: leerlo.**

**PR #17 SÍ está mezclado en main** (c1596f2, 26-ago 23:40 — verificado contra origin/main; este fichero decía lo contrario y la revisión lo cazó). `energia` vive en la producción compartida de los 8 dominios **sin adoptantes** (`template` ausente en las 8: nadie la ve). **Decisión (27-ago, delegada por el dueño «lo que tú consideres»): SE QUEDA en main sin ofrecerse** — revertirla removería main sin beneficio, nadie la ve sin adoptantes, y su infraestructura la reutiliza F3. Registrada en memory/07. Su infraestructura (hoja CSS por plantilla, tipografía autoalojada, periferia) es válida y queda.

## Las 8 tiendas — ✅ **FLOTA COMPLETA**, verificado en vivo con `npm run flota` (2026-08-27)

**Las 8 sirven nuestra web. No queda ninguna en WordPress** (dueño, 27-ago, confirmado midiendo). Villanueva migrada; Las Rosas y Lagoh con el DNS ya resuelto. Es la primera vez que la flota está entera en nuestro sistema.

| Tienda | Dominio | Sirve | Notas |
|---|---|---|---|
| Marineda | usafitnessmarineda.com | ✅ | sin reseñas, sin legales |
| Alcobendas | usafitnessalcobendas.com | ✅ | sin legales |
| GranCasa | usafitnessgrancasa.com | ✅ | sin ficha Google (la crea el dueño), vídeo 2,25MB servido sin enlazar, **la página más pesada: 932 KB reales** |
| Vigo | usafitnessvigo.com | ✅ | única con móvil WhatsApp real |
| El Arcángel | usafitnesselarcangel.com | ✅ | completa salvo WhatsApp |
| Villanueva | usafitnessvillanueva.com | ✅ | migrada desde WordPress |
| Las Rosas | usafitnesslasrosas.com | ✅ | DNS resuelto |
| Lagoh | usafitnesslagoh.com | ✅ | 3 fotos verticales de 382px (por debajo de nuestra variante menor: se amplían) |

**Herramienta:** `npm run flota` pregunta a resolvedores públicos (nunca al local — su caché mintió una vez) y distingue sin-dns / otro-sistema / enrutado-roto / servida.

## Salud técnica

- **181 tests** en dos suites, **0 skipped** con `npm run test:armado`; CI en cada push; cada test nuevo validado por mutación.
- **Fase 3 del roadmap:** cerradas 3.1, 3.2, 3.4-3.7, 3.9 y **3.8** (imágenes responsive: flota de 8.916→4.436 KB, −50% verificado en producción; presupuesto de 900 KB/página móvil que ROMPE el build). Quedan 3.3 (aplazada a propósito) y 3.10 (partir `stores.json` — diseño hecho y refutado: **`merge=union` NO funciona en GitHub**, verificado; la palanca real es índice ordenado; requisito previo `.gitattributes text eol=lf`).
- **Galería:** cada foto con su proporción real (nada se recorta), foto del hero ya no se repite, verticales nunca destacadas. **Y desde el 27-ago, FILAS JUSTIFICADAS** (PR #24): el reparto multicolumna anterior dejaba huecos medidos de 402 px en villanueva y marineda y **972 px en grancasa** — el dueño lo vio en una captura. `galeria.ts` afirmaba que el multicolumna eliminaba los huecos «estructuralmente»: era falso, los mudaba al fondo de la columna corta. Ahora cada fila llena el ancho exacto con `flex-grow:ratio` + `flex-basis:0`, que da el mismo alto a todas las fotos de una fila mezclen lo que mezclen; el corte de filas se decide por programación dinámica, no por el equilibrado del navegador. Verificado renderizado en las 8: hueco 0, escalón 0, cero fotos deformadas.
- **Medición:** código listo (Consent Mode v2, 3 eventos), `ga4Id` a **0 de 8**. Guía completa de altas en `docs/medicion/guia-alta.md` (monitor primero — hubo un día con dos dominios caídos que nadie detectó). **Sin GA4 no hay Loop C ni pitch comercial.**
- **Escala:** ~58 tiendas reales (56 operativas listadas en usafitness.es, verificado). Plan de alta automatizada diseñado (`.cursor/plans/2026-08-26-alta-de-tienda-automatizada.md`), pendiente de ejecutar; el directorio CMS de la central es seed data gratis.

## Bloqueado en el dueño 🔒

1. ~~DNS de Las Rosas y Lagoh~~ ✅ **RESUELTO 27-ago — flota completa, 8/8 en nuestro sistema.** 2. Beneficios del programa de socio («cuando me los den», 27-ago, SIN fecha — bloquea SOLO la sección socio de F1). 3. Altas de GSC/monitor/GA4 con la guía (desde 26-ago). 4. Datos legales de 5 tiendas (desde 24-ago). 5. Restricciones de la central (desde 26-ago). — Respondidas 27-ago (memory/12): precios ocultos · ofertas dos niveles · norte aprobado · los 8 son PILOTOS sin pago · precio del servicio aplazado a análisis completo.

## Plan de método — estado

| Fase | Criterio de cierre | Cumplido | Qué falta | Fecha |
|---|---|---|---|---|
| F0 | Norte+jerarquías aprobados; catálogo extraído | ✅ **CERRADA** | — («okey al norte y jerarquías», con cláusula de revisión; catálogo en docs/product/catalogo-usafitness-2026-08.json: 137 categorías, 52 marcas, 8/8 nuestras) | 27-ago |
| **F1** | 5 secciones nuevas pasan Loop A (socio «lista-salvo-dato») | **ABIERTA** | ✅ hojas · ✅ referencias confirmadas por el dueño («las 5 entran») · → ✅ inventario COMPLETO presentado en artefacto (docs/product/inventario-completo.md): 9 secciones→6 por fusión + 3 candidatas, /oferta y /socio nuevas, canal de WhatsApp como estrategia estrella (cero RGPD) · ✅ inventario APROBADO (A2 dentro, Equipo elevado) · ✅ RONDA 2 bold entregada en artefacto (docs/product/ronda2-innovacion.md): 3 estrellas (Empieza-aquí P6 · /guia N6 · Apártamelo N7) + 8 con condición + objetivos nuevos P6-P8/N6-N8 · ✅ RONDA 2 APROBADA ÍNTEGRA → **INVENTARIO GEN 2 CERRADO** · hojas de ronda 2 escritas (docs/plantillas/ronda2/ficha.md) · jerarquías ampliadas a P1-P8/N1-N8 · **FASE DISEÑO ABIERTA**: pool de referencias curada y verificada (docs/plantillas/referencias-diseno/pool.md — 4 direcciones D1-D4, 12 referencias comprobadas vivas) · **GIRA DE REFERENCIAS CERRADA 27-ago** (12/12, `docs/plantillas/referencias-diseno/notas-capturas.md`): NOCCO tipo-sobre-foto **verificado a 375px — su foto es MALA (radiador, pared desnuda, luz plana) y es el mejor hero de las doce** · Bulk oferta-como-hero · TransparentLabs valida Empieza-aquí pero como interstitial = R7-prohibido → lo adoptamos como sección · Prozis contador anclado a hecho operativo → «cierra en X» · Alphalete línea-por-categoría + bloque de portada dedicado a su local FÍSICO · MyProtein como prueba en contra (3 ofertas apiladas). **Y DIRECCIONES DE DISEÑO ENTREGADAS**: `direcciones.md` + `direcciones-sintesis.json` (13 agentes: 4 diseñan, 8 critican con la voz del dueño y la del sistema, 1 sintetiza). **Artefacto en la puerta del dueño con las tres RENDERIZADAS** (datos y foto reales de Lagoh, no prosa): D1 «Cartel» recomendada · D2 «Escaparate» con prueba de muerte fijada · D3 «Portada» · **D4 retirada como dirección → capa nocturna de infraestructura**. Falta: su OK + pasada 375px de Bulk/Crown/Momentous. **CAPA 0 CONSTRUIDA mientras espera** (PR #23, `feat/capa-0-vocabulario-y-peso`): `resolveSections` filtraba contra ORDEN_BASE en vez de SECTION_IDS → toda sección nueva se habría caído en silencio (el fallo del rechazo, en el código); tolerancia repartida (errata de cliente se ignora, id inventado en plantilla rompe el build); `src/data/presupuesto.ts` nuevo con tope duro de 120 KB para fuentes+CSS (lo nuestro) y aviso con desglose para el peso total (grancasa 932 KB, dato del franquiciado); Inter deja de precargarse a ciegas — `fuentesDeLaPagina` decide qué se precarga Y qué se cuenta, una sola implementación. 189 tests verdes. Puertas externas ronda 2: OK central (PDF+imagen equipo) y título de Amanda documentado | 27-ago |
| F2-F5 | ver metodo §8 | sin abrir | — | — |

Beneficios de socio: reclasificados como dato de F1 (sección socio «lista-salvo-dato»), NO bloquean F0.
**Arbitraje:** mientras F0 espere al dueño, el trabajo por defecto es el backlog A de memory/06 §0-bis en su orden; las F-fases prevalecen en cuanto su bloqueo se levante. El trabajo de esquema derivado de las respuestas del dueño (ofertas dos niveles, precio oculto) pertenece a F1.

## Sesión 27-ago (tarde) — el loop grande pedido por el dueño

**Encargo literal:** re-analizar TODAS las secciones («me gusta hacer loops»); investigar webs bonitas que gusten (premios, tendencias, efectos, scroll infinito, GitHub, X); **5 plantillas totalmente distintas** con identidad USA Fitness; fijarse en el **brand book: patrón claro de formas/triángulos**; reseñas: son de Google y SE PUEDE enlazar a Google; **no todas las tiendas siguen el mismo orden/prioridades**; **dos artefactos**: uno GUÍA que junte todos los anteriores, otro con las 5 plantillas; y el mapa de **servicios + automatización**. Autonomía concedida, sin prisa.

**Hecho ya:** `docs/brand/gramatica-de-formas.md` (cuña diagonal cian, chevrón cian/metal, rayado 45°, círculos punteados, pin, script + mayúsculas, base blanca — VISTO en brand book, banners y render de tienda; ninguna plantilla previa lo usaba).

**Verificado antes del loop (no de memoria):**
- `Reviews.astro` no enlaza a Google y el esquema no guarda `placeId`. Las 7 tiendas con ficha SÍ tienen **CID** (en `googleMapsLink` y `googleMapsEmbed`); Grancasa ninguno. El formulario «escribe tu reseña» (`search.google.com/local/writereview?placeid=`) **exige Place ID `ChIJ…`, no CID** → campo nuevo `placeId`, una vez por tienda en el alta (Place ID Finder, ~1 min).
- Animaciones ligadas al scroll en CSS (`animation-timeline: scroll()/view()`): **Safari iOS 26.0+** (sept-2025; hilo aparte en 26.4; arreglos en 26.5), Firefox 158, Chrome 115; ~85 % global; **no Baseline → siempre con fallback**. Fuentes: caniuse, webkit.org.
- El ANEXO de la central obliga a un **vídeo-tour** por tienda (activo para la galería, puerta: OK central). La GUÍA confirma **Amanda Gil = CAFAD/TAFAD/entrenadora, NO nutricionista**.
- Lección de sesión: **bash expande las comillas invertidas dentro de `node -e "…"`** — esta misma nota salió corrupta por eso. Contenido con backticks va por heredoc con delimitador entrecomillado o por Python, nunca inline.

**Loop de secciones TERMINADO** → `docs/product/loop-secciones-2026-08-27.md`: la estructura aguanta (26/26), 4 hojas cambian (Reseñas→máquina con `placeId`; vídeo→vídeo-tour del ANEXO; FAQ/Equipo→fuente GUÍA; /guia→promesa de la central), falta la pieza `prioridad` por tienda, sobran Social-como-sección y Novedades-en-v1, 6 campos nuevos, D3 resuelta en NO por la marca (rojo no es tinta de rótulo). 6 preguntas nuevas en memory/12.

**Investigación TERMINADA** (11 agentes, 0 caídos) → `docs/plantillas/referencias-diseno/catalogo-patrones-2026.md` (37 patrones, 7 familias, 14 invariantes; hipótesis de 5 combinaciones: Cartel · Diagonal · Panel · Lámina · Franja — la última avisada como la más cercana a la rechazada Energía) y `docs/product/servicios-y-automatizacion-2026-08-27.md` (35 servicios en 5 capas, 15 nuevos, 22 descartes confirmados, 12 pasos de construcción, 6 preguntas). **En curso:** workflow `cinco-plantillas-usafitness` (espacio → 5 diseñadores → 10 críticos → prueba de la miniatura → síntesis).

~~**En curso:** workflow `investigacion-diseno-secciones-servicios`~~ (8 frentes de investigación + loop de secciones + servicios/automatización + síntesis de patrones) → después workflow de 5 plantillas → docs + 2 artefactos + memoria.

## Siguiente trabajo del agente (por el plan F0-F5 del método)

**F0:** dueño corrige norte/jerarquías + entrega beneficios socio. **F1:** secciones nuevas con contenido real (socio, productos desde usafitness.es —1.683 productos, fotos descargables—, oferta del mes, «hoy en tienda», «por qué en tienda»). **F2:** mecanismos aprobados (§3 de la investigación). **F3:** plantilla 1 rehecha con método completo, empezando por el **artefacto de referencias** para su confirmación. Backlog vivo completo: `memory/06` §0-bis.
