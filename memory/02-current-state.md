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

## Las 8 tiendas — verificado en vivo con `npm run flota` (2026-08-26)

| Tienda | Dominio | Sirve | Notas |
|---|---|---|---|
| Marineda | usafitnessmarineda.com | ✅ Astro | sin reseñas, sin legales |
| Alcobendas | usafitnessalcobendas.com | ✅ Astro | sin legales |
| GranCasa | usafitnessgrancasa.com | ✅ Astro | sin ficha Google (la crea el dueño), vídeo 2,25MB servido sin enlazar |
| Vigo | usafitnessvigo.com | ✅ Astro | única con móvil WhatsApp real |
| El Arcángel | usafitnesselarcangel.com | ✅ Astro | completa salvo WhatsApp |
| Villanueva | usafitnessvillanueva.com | ⛔ WordPress | ni siquiera en Cloudflare (NS phdns22.es) |
| Las Rosas | usafitnesslasrosas.com | 🔴 **DNS caído** | NS repuntados, zona sin activar; clientes avisados, **arreglo previsto hoy 27** |
| Lagoh | usafitnesslagoh.com | 🔴 **DNS caído** | código desplegado y listo; mismo arreglo pendiente |

**Herramienta:** `npm run flota` pregunta a resolvedores públicos (nunca al local — su caché mintió una vez) y distingue sin-dns / otro-sistema / enrutado-roto / servida.

## Salud técnica

- **181 tests** en dos suites, **0 skipped** con `npm run test:armado`; CI en cada push; cada test nuevo validado por mutación.
- **Fase 3 del roadmap:** cerradas 3.1, 3.2, 3.4-3.7, 3.9 y **3.8** (imágenes responsive: flota de 8.916→4.436 KB, −50% verificado en producción; presupuesto de 900 KB/página móvil que ROMPE el build). Quedan 3.3 (aplazada a propósito) y 3.10 (partir `stores.json` — diseño hecho y refutado: **`merge=union` NO funciona en GitHub**, verificado; la palanca real es índice ordenado; requisito previo `.gitattributes text eol=lf`).
- **Galería:** cada foto con su proporción real (nada se recorta), foto del hero ya no se repite, verticales nunca destacadas.
- **Medición:** código listo (Consent Mode v2, 3 eventos), `ga4Id` a **0 de 8**. Guía completa de altas en `docs/medicion/guia-alta.md` (monitor primero — hubo un día con dos dominios caídos que nadie detectó). **Sin GA4 no hay Loop C ni pitch comercial.**
- **Escala:** ~58 tiendas reales (56 operativas listadas en usafitness.es, verificado). Plan de alta automatizada diseñado (`.cursor/plans/2026-08-26-alta-de-tienda-automatizada.md`), pendiente de ejecutar; el directorio CMS de la central es seed data gratis.

## Bloqueado en el dueño 🔒

1. DNS de Las Rosas y Lagoh (bloqueado 26-ago; dueño: arreglo previsto 27-ago). 2. Beneficios del programa de socio («cuando me los den», 27-ago, SIN fecha — bloquea SOLO la sección socio de F1). 3. Altas de GSC/monitor/GA4 con la guía (desde 26-ago). 4. Datos legales de 5 tiendas (desde 24-ago). 5. Restricciones de la central (desde 26-ago). — Respondidas 27-ago (memory/12): precios ocultos · ofertas dos niveles · norte aprobado · los 8 son PILOTOS sin pago · precio del servicio aplazado a análisis completo.

## Plan de método — estado

| Fase | Criterio de cierre | Cumplido | Qué falta | Fecha |
|---|---|---|---|---|
| F0 | Norte+jerarquías aprobados; catálogo extraído | ✅ **CERRADA** | — («okey al norte y jerarquías», con cláusula de revisión; catálogo en docs/product/catalogo-usafitness-2026-08.json: 137 categorías, 52 marcas, 8/8 nuestras) | 27-ago |
| **F1** | 5 secciones nuevas pasan Loop A (socio «lista-salvo-dato») | **ABIERTA** | ✅ hojas · ✅ referencias confirmadas por el dueño («las 5 entran») · → ✅ inventario COMPLETO presentado en artefacto (docs/product/inventario-completo.md): 9 secciones→6 por fusión + 3 candidatas, /oferta y /socio nuevas, canal de WhatsApp como estrategia estrella (cero RGPD) · ✅ inventario APROBADO (A2 dentro, Equipo elevado) · ✅ RONDA 2 bold entregada en artefacto (docs/product/ronda2-innovacion.md): 3 estrellas (Empieza-aquí P6 · /guia N6 · Apártamelo N7) + 8 con condición + objetivos nuevos P6-P8/N6-N8 · ✅ RONDA 2 APROBADA ÍNTEGRA → **INVENTARIO GEN 2 CERRADO** · hojas de ronda 2 escritas (docs/plantillas/ronda2/ficha.md) · jerarquías ampliadas a P1-P8/N1-N8 · **FASE DISEÑO ABIERTA**: pool de referencias curada y verificada (docs/plantillas/referencias-diseno/pool.md — 4 direcciones D1-D4, 12 referencias comprobadas vivas) · **GIRA DE REFERENCIAS CERRADA 27-ago** (12/12, `docs/plantillas/referencias-diseno/notas-capturas.md`): NOCCO tipo-sobre-foto **verificado a 375px — su foto es MALA (radiador, pared desnuda, luz plana) y es el mejor hero de las doce** · Bulk oferta-como-hero · TransparentLabs valida Empieza-aquí pero como interstitial = R7-prohibido → lo adoptamos como sección · Prozis contador anclado a hecho operativo → «cierra en X» · Alphalete línea-por-categoría + bloque de portada dedicado a su local FÍSICO · MyProtein como prueba en contra (3 ofertas apiladas). **Y DIRECCIONES DE DISEÑO ENTREGADAS**: `direcciones.md` + `direcciones-sintesis.json` (13 agentes: 4 diseñan, 8 critican con la voz del dueño y la del sistema, 1 sintetiza). **Artefacto en la puerta del dueño con las tres RENDERIZADAS** (datos y foto reales de Lagoh, no prosa): D1 «Cartel» recomendada · D2 «Escaparate» con prueba de muerte fijada · D3 «Portada» · **D4 retirada como dirección → capa nocturna de infraestructura**. Falta: su OK + pasada 375px de Bulk/Crown/Momentous. **CAPA 0 CONSTRUIDA mientras espera** (PR #23, `feat/capa-0-vocabulario-y-peso`): `resolveSections` filtraba contra ORDEN_BASE en vez de SECTION_IDS → toda sección nueva se habría caído en silencio (el fallo del rechazo, en el código); tolerancia repartida (errata de cliente se ignora, id inventado en plantilla rompe el build); `src/data/presupuesto.ts` nuevo con tope duro de 120 KB para fuentes+CSS (lo nuestro) y aviso con desglose para el peso total (grancasa 932 KB, dato del franquiciado); Inter deja de precargarse a ciegas — `fuentesDeLaPagina` decide qué se precarga Y qué se cuenta, una sola implementación. 189 tests verdes. Puertas externas ronda 2: OK central (PDF+imagen equipo) y título de Amanda documentado | 27-ago |
| F2-F5 | ver metodo §8 | sin abrir | — | — |

Beneficios de socio: reclasificados como dato de F1 (sección socio «lista-salvo-dato»), NO bloquean F0.
**Arbitraje:** mientras F0 espere al dueño, el trabajo por defecto es el backlog A de memory/06 §0-bis en su orden; las F-fases prevalecen en cuanto su bloqueo se levante. El trabajo de esquema derivado de las respuestas del dueño (ofertas dos niveles, precio oculto) pertenece a F1.

## Siguiente trabajo del agente (por el plan F0-F5 del método)

**F0:** dueño corrige norte/jerarquías + entrega beneficios socio. **F1:** secciones nuevas con contenido real (socio, productos desde usafitness.es —1.683 productos, fotos descargables—, oferta del mes, «hoy en tienda», «por qué en tienda»). **F2:** mecanismos aprobados (§3 de la investigación). **F3:** plantilla 1 rehecha con método completo, empezando por el **artefacto de referencias** para su confirmación. Backlog vivo completo: `memory/06` §0-bis.
