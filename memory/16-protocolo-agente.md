# Protocolo del agente — cómo decido, cómo me autoevalúo, cómo cierro

**Creado:** 2026-08-27, a petición del dueño: *«quiero ver mapas de cómo tomas tú las decisiones, cómo tú mismo te autoevalúas»*. Este fichero es parte de la memoria cargada por sesión: una sesión nueva DEBE leerlo antes de trabajar en nada visual, de conversión o de estrategia.

---

## 1. El mapa de decisión (qué proceso uso según la tarea)

```
¿La tarea es visual o de conversión (plantilla, sección, mecanismo, copy)?
├─ SÍ → docs/metodologia/creacion-de-webs.md ES el proceso. Sin excepción:
│        hoja de objetivos → evidencia → referencias en ARTEFACTO
│        → CONFIRMACIÓN DEL DUEÑO → construir → Loop A/B con capturas
│        → mi veredicto escrito → su veredicto.
│        PROHIBIDO: construir desde el inventario de secciones existente
│        (el error de angular y energia, cometido dos veces).
│
├─ ¿Es código no visual (datos, build, tests, infra)?
│  → TDD: test rojo → implementar → verde → MUTACIÓN (cada test nuevo
│    se valida matándolo; si la mutación sobrevive, el test es decorativo).
│    Con build de por medio: la mutación solo cuenta si el build pasó
│    (aprendido: un build roto deja tests corriendo contra dist viejo).
│
├─ ¿Es una decisión de diseño técnico con alternativas?
│  → Workflow: propuestas independientes → panel de jueces con lentes
│    distintas → refutación adversarial ANTES de implementar.
│    Y verificar la premisa central EMPÍRICAMENTE (merge=union se cayó
│    porque solo estaba verificada en local).
│
├─ ¿Es material COMERCIAL (pitch, auditoría de prospecto, informe al
│  franquiciado, propuesta de precio)?
│  → Mismas reglas de evidencia que el dato externo (ningún número sin
│    fuente o medición; promesas solo medibles — investigación §5: «nunca
│    en promesa comercial») + CONFIRMACIÓN DEL DUEÑO antes de que llegue
│    a un franquiciado. Precedente: el catálogo v1 se escribió sobre
│    premisa equivocada sin puerta previa.
│
├─ ¿Es un dato externo (librería, API, precio, panel, catálogo)?
│  → Investigar con fuentes ANTES de afirmar. Confianza marcada
│    verificado/probable/sin-verificar. Un número sin fuente no entra
│    en un documento. usafitness.es me lo dijeron DOS veces antes de ir.
│
└─ ¿Es estado del mundo (dominios, DNS, despliegues)?
   → Medir contra el mundo real, nunca contra memoria ni caché local
     (la caché DNS de esta máquina me hizo diagnosticar mal Lagoh).
```

## 2. El mapa de autoevaluación (cómo sé si algo está bien)

| Capa | Pregunta | Instrumento | Umbral |
|---|---|---|---|
| Suelo | ¿Nada roto? | tests + `test:armado` (0 skipped) + mutaciones | verde, y cada test nuevo mata su mutación |
| Forma | ¿Se VE bien? | **captura real** escritorio+móvil, mejor y peor tienda | checklist Loop A/B; «verificar propiedades no es ver» |
| Fondo | ¿Sirve al objetivo? | hoja de objetivos (P + N + evento) | defendible en una frase o no se entrega |
| Negocio | ¿Convierte / se vende? | eventos GA4 (Loop C) + veredicto del dueño | el dueño es el filtro final y sus rechazos son datos |

**Señales de que estoy fallando** (autodetección, aprendidas de esta sesión): estoy reestilizando en vez de diseñar desde objetivos · llevo >1 h sin actualizar nada de `memory/` en trabajo sustantivo · afirmo algo del mundo sin haberlo medido hoy · un test pasa «por construcción» porque los datos solo tienen un valor · no puedo defender una pieza en una frase.

## 3. Reglas con el dueño

- Sus **rechazos son especificación**, no ruido: se desgranan punto a punto (ver `docs/product/metodo-plantillas-y-conversion.md` §1) y cada punto produce un cambio de método, no una disculpa.
- **No re-preguntar lo respondido** (me lo señaló): las respuestas vivas están en `memory/12` y en los docs. Antes de preguntar, buscar.
- Si necesito **skills, MCPs, accesos o material** que no tengo, decírselo explícitamente en el momento — no rodearlo en silencio.
- Las referencias visuales se le presentan en **artefacto** y su confirmación es puerta (metodología §3).
- **Puertas y bloqueos:** lo bloqueado en el dueño vive en memory/02 §Bloqueado **con fecha**. Mientras una puerta espera: solo se avanza trabajo no dependiente (backlog A de memory/06); se le recuerda **una vez por sesión, nunca más**; una puerta con **>3 sesiones vencida se ESCALA** como pregunta explícita de replanificación — no se rodea en silencio (error §5.5) ni se espera en silencio.
- Idioma: español siempre; sin prisa: se cierra por criterio, no por calendario.

## 3-bis. Niveles de autonomía

| Nivel | Qué |
|---|---|
| **APLICO sin preguntar** | código no visual bajo TDD · correcciones de datos con fuente [V] · drift docs↔realidad verificado · eventos ya en el registro de guia-alta §3.4 |
| **PROPONGO y espero** | todo lo visual (puerta existente) · cambios de esquema de datos · eventos nuevos · cambios a reglas R · cualquier cosa que un franquiciado vería |
| **PREGUNTO siempre** | precios · legal · contenido de marca · todo lo abierto en memory/12 |

## 4. La pauta de cierre (su queja: «se te olvida actualizar la memoria muchísimo»)

Toda sesión sustantiva, ANTES del mensaje final:

1. `memory/11-session-summary.md` — append del bloque de sesión.
2. `memory/12-open-doubts-and-questions.md` — preguntas vivas actualizadas (cerradas las respondidas, añadidas las nuevas).
3. Si cambió: `memory/02` (estado, **incluida la tabla F0-F5**), `memory/06` (roadmap/backlog), `memory/07` (decisiones), `memory/08` (riesgos).
4. Memoria personal del agente (`~/.claude/projects/...usafitness.../memory/`) si hubo feedback sobre CÓMO trabajar.

Si el mensaje final sale sin esto hecho, el protocolo se ha incumplido — es exactamente la «sensación de divagación» que el dueño describió.

## 5. Errores propios catalogados (para no repetirlos)

1. **Reestilizar el esqueleto original** en vez de diseñar desde objetivos — 2 veces (angular, energia).
2. **Entregar visual sin verlo** — energia entera; el dueño encontró en 10 s lo que mis estilos computados no podían ver. **REINCIDENCIA 27-ago, una capa más abajo:** la galería multicolumna. Verifiqué el MECANISMO (ninguna foto se recorta: cierto) y di por bueno el RESULTADO sin mirarlo, y encima lo dejé escrito en `galeria.ts` como resuelto «estructuralmente». Dejaba 402 px de hueco en villanueva y 972 en grancasa; el dueño lo vio en una captura. **La forma útil de la regla: verificar que se cumple la propiedad que buscabas no es verificar que el resultado se ve bien — son dos comprobaciones distintas y la segunda solo se hace mirando o midiendo el DOM renderizado.** Corolario del arreglo: al medirlo aparecieron otros dos fallos (la tira de Energía rota por un `flex-direction` heredado, y la destacada de `angular` encogida por un tope de altura) que ninguna prueba veía.
3. **Restricciones confundidas con objetivos** — accesibilidad/peso/consent no dicen qué conseguir.
4. **Información en movimiento** — los beneficios de socio en marquesina, ilegibles.
5. **No ir a la fuente señalada** — usafitness.es, dicho dos veces antes de que fuera.
6. **Premisa verificada solo en local** — merge=union; GitHub la tiró.
7. **Confiar en el resolvedor local** — diagnóstico falso de Lagoh por caché DNS.
8. **CRLF** — mordió 5+ veces (ediciones fallidas en silencio, un experimento casi inválido). En Windows, todo replace multilínea va por líneas o con Edit.
9. **Memoria por impulso y no por pauta** — resuelto con §4.
10. **Afirmar el estado de un PR sin `gh pr view`** — DOS veces en dos días: «PR #17 no se mezcla» (estaba mezclado) y «PR #18 listo para mezclar» (mezclado hacía horas; el commit siguiente quedó huérfano en la rama y las decisiones del dueño estuvieron un rato fuera de main). El estado de un PR es estado del mundo (§1, última rama): se mide en el momento de afirmarlo, no se recuerda. Regla concreta: antes de escribir «PR #N …» en cualquier mensaje o memoria → `gh pr view N --json state`.
11. **Argumento de venta escrito de memoria, no comprobado en el código** — 27-ago, gira de referencias: anoté como ventaja competitiva que «nuestras webs no tienen banner de cookies, y eso se ve como limpieza frente al sector». Falso: `CookieConsent.astro` fija `avisoCookies = true` y el aviso sale en las 8 tiendas. Lo cacé yo al ir a comprobarlo antes de ponerlo en el artefacto, pero iba camino de la puerta del dueño y de ahí al pitch comercial. **La ventaja real, comprobada, era mejor** (barra abajo que no tapa el hero frente a cinco modales del sector; aceptar y rechazar del mismo peso; rechazar impide algo porque no hay terceros por detrás; 145 KB de `gtag.js` que no se descargan sin consentimiento) — o sea que la verificación no solo evitó la mentira, mejoró el argumento. **Regla:** toda afirmación sobre lo que hace o no hace NUESTRO producto, si va a un documento que ve el dueño o un cliente, se lee primero en el código o en producción. Un argumento comercial es estado del mundo igual que el estado de un PR (§1, última rama). Si presume de una ausencia («no tenemos X», «cero Y»), la comprobación es obligatoria: las ausencias son justo lo que la memoria inventa mejor.
12. **El panel del navegador es COMPARTIDO con los subagentes** — 27-ago: mientras corría un workflow, un agente de investigación me llevó la pestaña a Decathlon a mitad de una medición y el diseñador de Tablero levantó su propio servidor en `127.0.0.1:8765` y lo renderizó en mi pestaña; mis iframes cargaron 404 de su servidor y el auditor de contraste devolvió basura con aspecto de resultado. **Regla:** mientras corra un workflow con agentes que navegan, no verificar en el panel; si hay que hacerlo, pestaña propia creada en segundo plano, `tabId` explícito en cada acción, y **comprobar `location.href` antes de medir** — el primer valor de cualquier auditoría es «¿es mi página?».
13. **Los especímenes de un artefacto también pasan la auditoría de contraste** — 27-ago: el gris de marca `#98989A` como texto pequeño (2,7:1) y una etiqueta blanca sobre la banda cian (2,8:1) se colaron en los cinco especímenes hasta que el medidor los cazó. Lo que se enseña al dueño es lo que se juzga: se audita igual que la página.
14. **Un topónimo inferido en vez de leído** — 6-sep: en el informe al dueño y en el encargo a una investigadora escribí «Villanueva de la Serena (Badajoz)»; `stores.json` dice Villanueva de la Cañada (Madrid, C.C. El Zoco). Mismo fallo de familia que el sector inferido del nombre de marca (memoria global): un dato que está en el repositorio se escribe copiándolo, nunca completándolo de memoria. Coste real: la investigación de festivos arrancó mirando la comunidad autónoma equivocada hasta el relanzamiento. **Regla:** antes de nombrar una tienda, su centro o su ciudad en un documento o en un prompt, `grep` en `stores.json`.
