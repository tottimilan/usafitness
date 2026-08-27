# Ficha — Secciones F1 (la primera tanda del método)

**Fecha:** 2026-08-27 · **Fase:** F1 abierta (F0 cerrada con norte aprobado).
**Estado:** hojas de objetivos escritas → siguiente puerta: **artefacto de referencias confirmado por el dueño** (metodología §3). Nada de esta ficha se construye antes de esa confirmación.
**Evidencia citada:** `docs/product/investigacion-conversion-2026-08.md` · jerarquías P/N: `docs/metodologia/creacion-de-webs.md` §2 · eventos: registro único en `docs/medicion/guia-alta.md` §3.4.

---

## Hoja 1 — «Hazte socio» (la estrella) — LISTA-SALVO-DATO

```
PIEZA: sección Hazte socio
PREGUNTA: P3 — ¿qué gano yo?
CONVERSIÓN: N3 → N1 (interés de socio que convierte a visita: el alta es EN tienda)
EVENTO: interes_socio
EVIDENCIA: el programa de socio no está publicado en ningún sitio del
  ecosistema USA Fitness [V] — contenido único. El alta en tienda es
  «rápida y fácil» (dueño, 27-ago): la fricción real es CERO, solo hay
  que contarlo.
QUÉ PASA EN LA TIENDA CON PEORES DATOS: contenido de marca, idéntico en
  todas — digna en lagoh por construcción.
DATO BLOQUEADO: los beneficios completos (dueño: «cuando me los den»).
  Hasta entonces, versión sin cifras: «hazte socio en 2 minutos en caja»
  + los 4 beneficios ya sancionados en las promos actuales, SIN el
  «hasta» inventado (R2: cifras solo por escrito).
CÓMO SE VENDE AL FRANQUICIADO: «la única página del ecosistema que
  explica qué gana tu socio, y te mide cuánta gente lo pide».
```

## Hoja 2 — «Productos y marcas»

```
PIEZA: sección Productos y marcas reales
PREGUNTA: P2 — ¿qué tienen? (la mitad «cuánto cuesta» NO se responde:
  precios ocultos por decisión del dueño; se responde con oferta y socio)
CONVERSIÓN: N1 (dar razón concreta para ir HOY: «lo tienes sin esperar envío»)
EVENTO: ver_productos
EVIDENCIA: catálogo real extraído [V]: 137 categorías, 52 marcas;
  Quamtrax+Amix = ~40% del catálogo → se priorizan. Se construye sobre
  CATEGORÍAS+MARCAS (refresco anual), nunca espejo de 1.683 fichas (regla
  escrita). Fotos de producto CONDICIONADAS a cesión de Grupo Corelam
  (riesgo memory/08; plan B: kits de prensa de fabricantes → fotos propias
  → versión solo-categorías).
QUÉ PASA EN LA TIENDA CON PEORES DATOS: contenido de marca compartido —
  digna en lagoh por construcción.
CÓMO SE VENDE AL FRANQUICIADO: «tu web enseña lo que hay en TU estantería
  hoy, con las marcas que la gente busca por nombre».
```

## Hoja 3 — «Oferta del mes»

```
PIEZA: sección/banda Oferta del mes (+ cupón «enséñalo en caja»)
PREGUNTA: «¿por qué hoy?» (urgencia legítima, con fecha-fin)
CONVERSIÓN: N4 → N1
EVENTO: ver_oferta con parámetro origen (central/propia)
EVIDENCIA: la central produce ofertas y NO las publica online [V] — el
  operador tiene acceso al canal (dueño, 27-ago): contenido ya producido,
  publicable a coste ~0. GNC publica promos por tienda [V]; el cupón
  canjeable en caja es el puente online→tienda sin datos personales
  (veredicto ✅ en investigación §3). Modelo de datos: dos niveles con
  precedencia propia>central, fecha-fin obligatoria, despublicación
  automática, procedencia por escrito (memory/04).
QUÉ PASA EN LA TIENDA CON PEORES DATOS: sin oferta cargada, la sección
  NO se pinta (visible() por dato, como galería/reseñas hoy). Jamás una
  oferta caducada: antes vacío que mentira.
CÓMO SE VENDE AL FRANQUICIADO: «la campaña del mes puesta en tu web sin
  que muevas un dedo — y si un mes quieres la tuya, la tuya manda».
```

## Hoja 4 — «Hoy en tienda»

```
PIEZA: sección Hoy en tienda (horario del día + dónde exactamente + cómo llegar)
PREGUNTA: P1 — ¿está abierto y cómo llego? (~la mitad de quien llega [P])
CONVERSIÓN: N1 (la reina)
EVENTO: ver_horario (en informes: «intención de visita») + contacto_maps
EVIDENCIA: horario/cómo-llegar/dirección es lo más buscado al llegar a la
  web de una tienda física [P, Google/Ipsos]. R3 rebajada aplica: horario
  de HOY como dato estructurado SIEMPRE; el badge «abierto ahora» solo
  cuando existan calendarios de festivos por centro (memory/07).
  Incluye el dato que nadie da: DÓNDE dentro del centro comercial
  (planta, zona, al lado de qué) — está en el anexo de marca y en el
  conocimiento del franquiciado, no en Google.
QUÉ PASA EN LA TIENDA CON PEORES DATOS: horario existe en las 8 [V].
  El «dónde exacto dentro del centro» es opcional: sin dato, la sección
  muestra dirección + mapa como hoy.
CÓMO SE VENDE AL FRANQUICIADO: «el que te busca desde el sofá sabe en
  10 segundos si le da tiempo a llegar — y le llevamos hasta tu puerta,
  no hasta el aparcamiento del centro».
```

### Ampliación tras la gira de referencias (27-ago) — «cierra en X», la urgencia honesta

Prozis muestra un contador en marcha con el texto «tu pedido aún se puede enviar hoy»: la urgencia no es inventada, es **la hora de corte real** del almacén. Nosotros tenemos el hecho equivalente y mejor — **la hora a la que cierra ESTA tienda, hoy** — y con él «Hoy en tienda» deja de ser un dato pasivo y se convierte en llamada a la acción («Abierto — cierra en 2 h 15 min»).

**Viabilidad verificada en el código, no supuesta:**

- `parseHorario` (src/data/horario.ts) ya devuelve `{dayOfWeek[], opens, closes}` estructurado: el cálculo sale de datos que ya existen, sin campo nuevo y sin trabajo del franquiciado.
- El esquema de `stores.json` **exige** que el horario parsee (`refine(... .length > 0)`), así que el dato está garantizado en las 8 tiendas y en toda alta futura. Degrada solo, sin `visible()` extra.
- Todas las páginas son SSR por petición (`prerender = false`, sin `Cache-Control` en el HTML): el valor se calcula fresco en cada carga. Nada que invalidar.

**⚠️ Trampa encontrada y anotada antes de construir:** no hay zona horaria configurada en el proyecto ni en el despliegue, así que el servidor de Railway corre en **UTC**. Calcular la hora con `new Date().getHours()` haría que la web dijera «cerrado» con la tienda abierta durante las horas de desfase, **en las 8 tiendas a la vez y solo en producción**. La implementación usa obligatoriamente `Intl.DateTimeFormat` con `timeZone: 'Europe/Madrid'` (sin dependencias). Se añade prueba con hora fijada que falle si alguien vuelve a la hora del sistema.

**Límite honesto:** esto dice cuándo cierra según el horario escrito, no si hoy es festivo del centro comercial. Se redacta como dato de horario («cierra a las 22:00 · quedan 2 h 15 min»), nunca como promesa de estado («abierto ahora») — es exactamente la R3 rebajada que ya estaba decidida, ahora con su forma visual.

## Hoja 5 — «Por qué en tienda»

```
PIEZA: sección Por qué en tienda (asesoramiento · inmediatez · tocar
  producto · socio al momento)
PREGUNTA: P5 (¿me asesoran?) + el cierre de P2 («¿y no en Amazon?»)
CONVERSIÓN: N2 (contacto con intención: «pregúntanos por WhatsApp»)
EVENTO: exenta declarada — sección informativa; su efecto se mide en el
  contacto que provoca (contacto_whatsapp con sección de origen), no con
  un evento de scroll decorativo (decisión de la revisión adversarial).
EVIDENCIA: el diferencial real contra el online es asesoramiento presencial
  + inmediatez + socio en caja (P9 del análisis); Naturhouse construyó una
  red nacional sobre el gancho «servicio gratuito en tienda» [P]. Los
  expertos CON NOMBRE del brand book (Julián Andre Gouveia, Amanda Gil)
  son activo E-E-A-T sin usar — pendiente de confirmar con el dueño si
  pueden aparecer.
QUÉ PASA EN LA TIENDA CON PEORES DATOS: contenido de marca — digna por
  construcción. La variante con «tu asesor se llama X» exige dato por
  tienda y es mejora posterior.
CÓMO SE VENDE AL FRANQUICIADO: «le damos al que compara contigo online
  las tres razones por las que entra por tu puerta».
```

---

## Estado de puertas

| Puerta | Estado |
|---|---|
| Hojas de objetivos | ✅ escritas |
| Artefacto de referencias | ✅ **CONFIRMADO por el dueño (27-ago):** «me gusta el análisis y estas secciones» — las 5 entran |
| Inventario COMPLETO (secciones + landings + estrategias de servicio) | **→ nueva puerta pedida por el dueño ANTES del diseño**: «primero ver qué secciones nos faltaban, y qué landings… ya nos meteremos en diseño» |
| Construcción (Loop A) | bloqueada hasta confirmar el inventario completo |

**Pendiente del artefacto que el dueño NO respondió:** ¿pueden aparecer los expertos del brand book (Julián Andre Gouveia, Amanda Gil) en «Por qué en tienda»? — no urge (la v1 no los necesita).
