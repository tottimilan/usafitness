# Proceso comercial — cómo se vende, se entrega y se retiene

**Fecha:** 2026-08-27 · **Origen:** la revisión adversarial del sistema documental encontró su agujero central: el norte declara que *vender es lo más importante* y ningún documento decía CÓMO se vende. Este documento cierra ese agujero.
**Precedencia:** en el **ciclo de venta** manda este documento; en el **catálogo y precios**, `memory/15-catalogo-servicios.md`; en el qué-manda-sobre-todo, `docs/product/norte.md`.

---

## 0. Qué gobierna

Norte §2: lo más importante es **vender esto a más tiendas** con un producto defendible. Este proceso convierte esa frase en pasos con dueño, artefacto y criterio. Regla de cifras (norte §3): en conversación comercial, los datos direccionales se dicen en lenguaje defendible — *«la mitad de la gente que llega busca tu horario»* — nunca con decimales de estudios de 2016-2018.

## 1. El pitch (qué se dice y con qué se demuestra)

Tres piezas, todas comprobables por el franquiciado en su móvil:

1. **«La central no publica tus ofertas online — tu web puede ser el canal de promociones DE TU TIENDA.»** (Verificado: la sección de ofertas del ecommerce central está vacía. Formulado para sobrevivir si la central cambia: el valor es que sea SU canal.)
2. **«El programa de socio no está explicado en ningún sitio — en TU web sí, y trae gente a TU caja.»** (Verificado: cero menciones en usafitness.es.)
3. **«Tu página oficial en usafitness.es tiene tu dirección y un fijo. La nuestra tiene tu WhatsApp, tus fotos, tus reseñas, tu oferta — y te digo cada mes cuánta gente te trajo.»** (Verificado sobre las 58 fichas del directorio central.)

## 2. La demo pre-construida (el arma que ya tenemos y no usábamos)

El directorio central publica nombre, dirección, horario y teléfono de las 58 tiendas. Con `scripts/nueva-tienda.mjs` (plan de alta automatizada), **la landing del prospecto se genera ANTES de la conversación**, con sus datos reales, en URL de preview `noindex`. El pitch deja de ser «te haré una web»: es **«tu web ya existe — mírala»**. Coste marginal ~0 una vez exista el script (Paso 2 de memory/15 §5).

## 3. La auditoría gratuita (la puerta de entrada)

Como la define memory/15 §6.1 y sigue plenamente viva: una página con capturas y cero opiniones — su teléfono en la web frente al de su ficha, su horario del domingo frente al real, sus fotos, sus reseñas y la fecha de la última. Se abre por donde duele y **él lo comprueba en su móvil en diez segundos**. No es una promesa: es un fallo suyo que otro vio antes.

## 4. El cierre (sesión de 45 minutos, con fecha)

Sin cambios sobre memory/15 §6.2-6.3: NIF y datos legales **dictados por teléfono** (el email tiene 57% de no-respuesta medida), firma electrónica de contrato marco + **art. 28 RGPD** + **mandato SEPA**, verificación del móvil de WhatsApp con llamada, invitación de gestor a la ficha de Google. Si no se firma el SEPA en esa llamada, la tienda no se da de alta. **El precio se cierra en una frase** — pero QUÉ frase está **aplazado por el dueño (27-ago)**: «lo decidiremos más adelante, cuando tengamos todo, con desglose y análisis completo». El 490 € + 59 €/mes de memory/15 es la propuesta-ancla que alimentará ese análisis (§9), no un precio vigente.

## 5. El alta (entrega)

Plan automatizado (`.cursor/plans/2026-08-26-alta-de-tienda-automatizada.md`) con dos verificaciones finales obligatorias: `npm run flota` (que el dominio sirva LO NUESTRO — el hueco por el que se coló Lagoh) y el checklist de la sesión de alta. Objetivo: ≤3 h por tienda en la tienda 20.

## 6. El informe mensual y la renovación

El recurrente se sostiene sobre **prueba de valor mensual**: informe de una página con llamadas, WhatsApps, rutas a tienda — y desde F2, ofertas vistas (con origen central/propia) e interés de socio. Reglas: se activa por tienda **solo con art. 28 firmado y `company` completo**; reporta **«mínimos medidos», nunca totales** (GA4 solo cuenta a quien acepta cookies — riesgo de sesgo registrado en memory/08; GSC y Cloudflare Analytics son el suelo para estimar el infraconteo). Sin GA4 de alta no hay informe, y sin informe la cuota es una cuota sin prueba de vida: por eso la medición es requisito comercial, no tarea técnica.

## 7. Los 8 actuales — son PILOTOS, no clientes de pago (respondido 27-ago)

**Dato del dueño, literal:** *«los primeros 8 los he hecho yo para verificar la viabilidad de esto, solo les he realizado la web, no les ofrezco otros servicios por ahora»*. Cierra la suposición «some may be pilots» abierta desde el 24-ago. Consecuencias:

1. **No hay ingresos recurrentes hoy.** Todo cálculo de ingresos parte de cero clientes de pago; los 8 son inversión en prueba de viabilidad.
2. **Su función comercial es ser el ESCAPARATE**: 8 webs vivas, con datos reales y (cuando GA4 viva) resultados medibles — la prueba que se enseña a la tienda 9. La migración a la plantilla del método (F3) es inversión en ese escaparate, no una decisión gratis/cobrado.
3. **El primer informe mensual a los 8** sigue siendo hito: no de retención, sino de EVIDENCIA — el primer «mira lo que la web trajo» real del pitch.
4. **Protocolo de incidente cliente-caído** sigue haciendo falta igual (Las Rosas y Lagoh, 26-27 ago): un piloto con la web caída es un escaparate roto y un embajador perdido.
5. **La conversión de pilotos a clientes de pago** se decidirá con el precio (§9) — decisión del dueño, aplazada: «cuando tengamos todo, ya decidiré precio».

## 8. El backlink de la central

Cada una de las 58 fichas del directorio central debería enlazar a la landing de su tienda. **Dueño: el operador.** Momento: la misma conversación en que proponga el servicio a la central. Alcance: las 8 ya servidas de inmediato; cada alta nueva, al entregarse.

## 9. Evidencia de pricing (la deuda reconocida de memory/15)

memory/15 §8 lo admite: el precio es la parte peor fundamentada — anclas de mercado, no medición. Acciones: **una conversación con un franquiciado actual sobre facturación y margen** (vale más que toda la columna de precios) + mini-comparativa de anclas por tienda comparable. Resultado a memory/15 con su marca [V]/[P].

## 10. Reconciliación con memory/15 §5-§6 (qué sigue vivo tras el giro)

| Pieza de memory/15 | Estado tras el giro | Encaje en el plan F |
|---|---|---|
| Semana 0 (experimento GBP) | **Vivo** | Paralelo, no bloquea |
| Paso 1 — Semáforo NAP | **Vivo** — sigue siendo la auditoría que abre conversaciones (§3) | F0-F1, paralelo |
| Paso 2 — `nueva-tienda.mjs` | **Vivo y ascendido**: además de alta, genera la demo de §2 | F1 |
| Paso 3 — `/muestrario` | **Vivo pero condicionado**: sin plantillas del método no hay qué enseñar — angular y energia están rechazadas | **F3b** (entregable propio: «hecho cuando un franquiciado distingue y elige sin ayuda») |
| Paso 4 — `informe.mjs` | **Vivo**, con los eventos nuevos (registro canónico: `docs/medicion/guia-alta.md` §3.4) | F2/F5 |
| Paso 5 — 5 secciones | **Sustituido en parte**: las secciones ahora se derivan de la metodología (hoja de objetivos), no de aquella lista | F1 |
| Paso 6 — GBP API | **Vivo**, tras Semana 0 | Post-F2 |
| §6 primera venta (auditoría → 45 min → precio) | **Vivo entero** — es §3-§4 de este documento | Transversal |

**Regla final:** el ciclo de venta lo gobierna este documento; el catálogo y sus precios, memory/15; las fases de producto, metodo §8 con su estado en memory/02.
