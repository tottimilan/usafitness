# Método de plantillas y conversión — la reflexión y el plan

**Fecha:** 2026-08-26 · **Origen:** dos rechazos consecutivos del dueño del proyecto (plantillas `angular` y `energia`) y su diagnóstico del proceso, no solo del resultado.
**Estado:** completo. La evidencia externa de §5/§6 vive en `docs/product/investigacion-conversion-2026-08.md` (61 hallazgos, 41 verificados); la metodología operativa extraída de aquí vive en `docs/metodologia/creacion-de-webs.md`; el norte que gobierna ambos, en `docs/product/norte.md`.

---

## 0. Por qué existe este documento

No existe porque una plantilla saliera fea. Existe porque salieron feas **dos**, por el **mismo motivo**, después de que el motivo se me señalara la primera vez. Eso no es un bug: es un engranaje mal elegido. Este documento desmonta el engranaje, lo describe con honestidad, y monta el nuevo — con el método que pediste: científico, con objetivos primero, con loops internos medibles, y sin prisa.

La frase que gobierna todo lo que sigue la escribiste tú: *«empezamos por lo que buscamos, objetivos, qué queremos resolver para los clientes, en qué queremos destacarles, qué problemas queremos resolver al entrar en la web, qué tipo de clientes con qué acciones puedan venir. Creo que se hace así un negocio, ¿no?»* — Sí. Así se hace. Y así no lo estaba haciendo.

---

## 1. Tu opinión, desgranada

Frase a frase, sin pasar nada por alto, y con la conclusión operativa de cada una. Esto es lo que pediste ver: que la crítica se convierta en mecanismo, no en disculpa.

| # | Lo que dijiste | Lo que significa | Lo que cambia |
|---|---|---|---|
| 1 | *«¿Tú la has visto?»* | Entregué diseño sin haber visto un píxel. Verifiqué estilos computados por JavaScript, que es como corregir un cuadro leyendo la lista de pigmentos. | **Regla dura:** nada visual se te enseña sin que yo lo haya visto en captura. Con tu panel abierto puedo capturar; ya está comprobado que funciona. |
| 2 | *«¿Cuando haces una plantilla les pones objetivos?»* | No. Puse **restricciones** (accesibilidad, peso, consentimiento — todas de ingeniería) y las confundí con objetivos. Una restricción dice qué no romper; un objetivo dice qué conseguir. | Cada plantilla nace de una **hoja de objetivos** (§3): qué pregunta del visitante responde cada viewport, qué conversión prioriza, cómo se mide. |
| 3 | *«Yo te comuniqué cuáles eran los puntos de conversión»* | Los tenía — como **eventos a medir** (`contacto_llamada`, `contacto_whatsapp`, `contacto_maps`). Nunca los convertí en **jerarquía de diseño**. Medir una conversión no es diseñarla. | La hoja de objetivos ordena las conversiones y cada sección declara a cuál sirve. Sección que no sirve a ninguna pregunta ni conversión: fuera o al fondo. |
| 4 | *«No veo claramente destacados los beneficios de ser socio. Pasan rápido»* | Puse la información que más vende **en una marquesina**: ilegible por diseño. El movimiento como decoración, compitiendo contra el contenido. | Los beneficios de socio pasan a ser **sección estrella estática** (§6). El movimiento, si existe, jamás transporta información que el visitante necesita leer. |
| 5 | *«"Llámanos Córdoba" es vago. Una persona al entrar buscará información»* | El primer viewport gritaba la ciudad — que el visitante **ya sabe** — en vez de responder algo que no sepa. Tipografía gigante diciendo nada. | El primer viewport responde preguntas reales: qué es, qué gano (socio), si está abierto, cómo llego. La estética sirve a esa respuesta, no al revés. |
| 6 | *«No veo ni productos, ni nuevas secciones ni nada»* | El catálogo de secciones es **cerrado** (9 ids) y mi propio análisis lo marcó como techo… y no lo levanté. Cero secciones nuevas en cinco conceptos. | El catálogo se **abre** (§6): secciones nuevas con contenido nuevo. Productos reales desde usafitness.es — que me dijiste dos veces dónde estaban y no fui. |
| 7 | *«Simplemente has seguido las líneas de mi página inicial. Es prácticamente clavada»* | Reestilicé tu esqueleto **dos veces**, después de que dijeras «NO TE BASES EN ELLA». El error fue estructural: mi brief a los diseñadores pedía «tratamiento por cada sección» de la lista existente — la jaula estaba en el encargo. | Los briefs de diseño parten de la hoja de objetivos, no del inventario de secciones. Las secciones **se derivan** de las preguntas del visitante; no se heredan. |
| 8 | *«Se ve como una web de 2010 […] ¿qué elementos investigaste y te encajaron?»* | La investigación fue **en texto**: agentes resumiendo patrones. Nadie miró una página — ni las de referencia ni la mía. Diseño de oídas. | Referencias visuales **con captura**: navego, capturo, y cada plantilla lleva su ficha de referencias — qué se tomó, de dónde, por qué (§7). Trazabilidad que puedas auditar. |
| 9 | *«¿Investigaste webs ganadoras de premios?»* | En texto, sí; con ojos, no. Y sin criterio de selección explícito. | Fase de referencias del plan (§8-F3): pool de webs concretas (premiadas + cadenas del sector), capturadas, y una decisión escrita por cada elemento adoptado o descartado. |
| 10 | *«Sácame estrategias palpables que podamos venderles: pop-ups, banners, formularios»* | Pediste **negocio** y entregué CSS. Ni un mecanismo de conversión nuevo: ni oferta gestionable, ni captación, ni urgencia. | §5: catálogo de mecanismos **analizado** (con su letra pequeña: SEO, RGPD, consentimiento) y §6 los convierte en secciones/piezas vendibles al franquiciado. |
| 11 | *«Loop interno tuyo medible en cada parte»* | Mi loop era: construir → tests verdes → entregar. Los tests miden que no se rompa nada — no miden si algo es bueno. | §4: loops con criterios **medibles y escritos antes de construir**, incluida la autoevaluación visual con checklist, y el veredicto defendible antes de enseñarte nada. |
| 12 | *«Intención detrás de cada creación que puedas defenderme y estés orgulloso»* | De Energía no podía defenderte el trazo hueco, ni la marquesina de promos, ni el orden. Eran gusto ajeno aplicado sin porqué. | Cada pieza lleva su **porqué escrito** en la ficha de la plantilla. Si no puedo defenderla en una frase, no se construye. |
| 13 | *«No hay ninguna prisa […] método científico»* | Yo optimizaba por entregar rápido en la misma sesión. Tú optimizas por hacerlo bien. Esa diferencia de función objetivo explica casi todo lo demás. | El plan (§8) es largo y por fases, cada una con su definición de hecho. Ninguna fase se cierra por cansancio ni por calendario: se cierra por criterio. |
| 14 | *«Se te olvida actualizar la memoria muchísimo, no sigues una pauta concreta, vas divagando»* | Cierto. Actualizo memoria cuando me acuerdo, no como pauta. Y sin pauta, la sensación exterior es divagación aunque haya hilo interior. | §9: pauta fija de cierre — toda sesión sustantiva termina actualizando `memory/` (11, 12, y los que toque) **antes** del mensaje final. Sin excepción. |
| 15 | *«Quizás no usaste la mejor estrategia y eso es lo bueno: ser conscientes y mejorar»* | La crítica es método, no enfado. Me lo dices para calibrar el tono de trabajo. | Este documento ES la respuesta en ese tono: análisis del fallo, no defensa. Y queda en memoria para que no haya una tercera vez. |

**La conclusión que las une todas:** las quince apuntan al mismo defecto raíz — **construí antes de pensar, y pensé en términos de código antes que de negocio**. El principio Karpathy nº 1 del kernel de este proyecto es literalmente «Think Before Coding». Lo incumplí con agravante: usé un sistema de análisis potente (workflows, jueces, refutación) para ejecutar más rápido **la estrategia equivocada**. Un buen motor con el mapa al revés solo te lleva antes al sitio equivocado.

---

## 2. Las preguntas adecuadas

Las que había que hacerse ANTES de la primera plantilla. Cada una con su respuesta o con el camino medible hacia ella. (Las respuestas con fuente externa se completan en §3/§5 con la investigación.)

### Sobre el visitante (la web se diseña para él)

- **P1. ¿Quién entra en la web de una tienda USA Fitness y desde dónde?** Hipótesis: mayoría móvil, llegando desde Google (búsqueda de marca o «suplementos + ciudad/centro comercial»), desde el perfil de Instagram de la tienda, y desde la ficha de Google Maps. → *Se contrasta con datos en cuanto GSC/GA4 estén vivos (guía ya entregada); mientras, con estudios de intención local con fuente.*
- **P2. ¿Qué viene a resolver?** Hipótesis ordenada: (1) ¿qué tienen y cuánto cuesta? (2) ¿qué gano yo — el programa de socio? (3) ¿está abierto ahora y dónde está exactamente dentro del centro? (4) ¿es de fiar? (5) ¿me pueden asesorar? → *Cada pregunta debe tener UNA sección que la responda, visible sin esfuerzo.*
- **P3. ¿Qué le haría volver o entrar a la tienda hoy?** Una oferta con fecha, el beneficio de cumpleaños, la inmediatez («lo tienes hoy, sin esperar el paquete»), el asesoramiento gratis.
- **P4. ¿Qué le hace irse?** Lentitud, no encontrar el horario, texto genérico que no dice nada, y —en móvil— cualquier cosa que tape el contenido.

### Sobre el franquiciado (él paga la web)

- **P5. ¿Qué le demuestra que la web trabaja para él?** Llamadas, WhatsApps y rutas de Maps **contadas** (ya instrumentado), y a futuro: altas de socio atribuibles y canjes de oferta. La web debe generar eventos que se le puedan enseñar en un informe simple.
- **P6. ¿Qué puede mantener él y qué no?** Nada que exija tocar código. Todo lo gestionable (oferta del mes, banner de campaña) debe ser un dato en su ficha, cambiable por el operador en minutos. A escala 50, cada minuto por tienda son horas.
- **P7. ¿Qué se le puede VENDER encima de la web?** El catálogo de servicios (memory/15) crece con mecanismos de conversión de §5: campaña mensual gestionada, página de oferta flash, informe de conversiones. La plantilla es la puerta; el recurrente es el negocio.

### Sobre el negocio (la tesis de la web)

- **P8. ¿Cuál es LA tesis de estas landings?** Propongo esta, corrígela: **«La web de la tienda convierte la intención que ya existe (alguien buscando suplementos cerca) en visita física, y da al franquiciado razones medibles para pagarla.»** No competimos con el ecommerce de la central ni con Amazon: convertimos cercanía + inmediatez + asesoramiento + programa de socio presencial.
- **P9. ¿Qué diferencia a la tienda física del online?** Lo tienes HOY sin envío ni mínimos; te asesora una persona; el programa de socio se activa en el momento; puedes ver/tocar el producto. **Ninguna de estas cuatro cosas estaba dicha en ninguna plantilla.** Son el corazón del copy nuevo.
- **P10. ¿Qué NO debe hacer la web?** Vender online (canal de la central), prometer precios que la tienda no controla, publicar promesas legales sin datos del responsable (5 de 8 tiendas siguen sin `company`).

---

## 3. Los objetivos, escritos — la hoja que faltaba

Cada plantilla y cada sección se diseñan contra esto. Versión 1, para tu corrección:

**Jerarquía de conversión** (de más a menos valor para el franquiciado):

1. **Visita a tienda** — proxy medible: `contacto_maps` + (nuevo) `ver_horario`. La conversión reina: el negocio es presencial.
2. **Contacto con intención** — `contacto_whatsapp` / `contacto_llamada`. Vale más que la visita a ciegas porque trae la pregunta hecha.
3. **Intención de socio** — (nuevo) `interes_socio`: clic en «Quiero ser socio» → pantalla/sección que explica que el alta es en tienda, al momento. Sin formulario en v1 (sin fricción RGPD, ver §5).
4. **Canje de oferta** — (nuevo) `ver_oferta` sobre la oferta del mes gestionable.
5. **Seguimiento** — clic a Instagram. La menor: saca al visitante de la web.

**Reglas de diseño que se derivan (medibles, van al loop de §4):**

- **R1.** El primer viewport responde al menos DOS de las preguntas de P2 sin scroll y contiene UNA conversión de nivel 1-2. *(Medible en captura: checklist.)*
- **R2.** Los beneficios de socio son sección propia, estática, en la primera mitad de la página. *(Posición medible en % de scroll.)*
- **R3.** Horario con estado («abierto ahora · cierra a las 22:00») visible desde el primer scroll o anclado. *(Medible.)*
- **R4.** El movimiento nunca transporta información necesaria; solo ambienta. *(Auditable: lista de textos en elementos animados = solo decorativos.)*
- **R5.** Cada sección declara en su ficha: pregunta que responde (P2) + conversión a la que sirve (1-5) + evento que emite. Sección sin las tres cosas: no se construye.
- **R6.** Texto genérico prohibido en zona noble: el párrafo mad-lib actual («encontrarás asesoramiento personalizado y la mejor nutrición…») no puede ocupar el primer viewport de ninguna plantilla nueva.

---

## 4. El método y los loops internos medibles

El engranaje nuevo. Tres loops anidados, cada uno con criterio de salida escrito ANTES de construir.

### Loop A — de sección (el más interno)

```
objetivo escrito (R5: pregunta + conversión + evento)
→ referencia visual elegida y capturada (de dónde viene la forma)
→ construcción
→ CAPTURA propia (escritorio + móvil 375px)
→ checklist contra su objetivo:
    · ¿responde su pregunta en <3 segundos de mirada?
    · ¿el CTA es lo más visible tras el contenido?
    · ¿defendible en una frase? (si no sé defenderla, no pasa)
→ pasa / no pasa → si no pasa, vuelta con el defecto NOMBRADO
```

### Loop B — de plantilla

```
hoja de objetivos (§3) + narrativa escrita (el recorrido como historia)
→ todas las secciones pasadas por Loop A
→ render con datos reales de DOS tiendas: la de mejores datos (vigo/grancasa)
  y la de peores (lagoh: 2 fotos malas, sin reseñas, sin WhatsApp)
→ capturas completas de ambas, escritorio y móvil
→ checklist de plantilla:
    · R1–R6 de §3, una a una
    · ¿puesta al lado de la clásica, un franquiciado la describiría como
      OTRA web? (el criterio con el que tumbaste angular)
    · peso < 900KB móvil, LCP del primer viewport, accesibilidad AA (ya en tests)
    · con los datos de lagoh, ¿sigue digna? (una plantilla que solo funciona
      con datos buenos no sirve para 50 tiendas)
→ MI veredicto escrito y defendible → SOLO ENTONCES, el tuyo
```

### Loop C — de negocio (el más externo, con datos reales)

```
mecanismo/sección en producción → eventos GA4 acumulando
→ revisión mensual: ¿la conversión reina sube? ¿qué sección genera eventos
  y cuál es decorativa? → iterar/retirar con datos, no con gustos
```

*Este loop se activa cuando GA4 esté vivo (guía entregada, altas en tu mano). Hasta entonces, A y B funcionan solos.*

**Cambio de rol de los tests:** siguen siendo el suelo (que nada se rompa) pero dejan de ser el techo. «Tests verdes» ya no es criterio de entrega de nada visual; es prerequisito para empezar el checklist.

---

## 5. Mecanismos de conversión, analizados

*(La evidencia con fuentes y los veredictos por mecanismo están en `docs/product/investigacion-conversion-2026-08.md` §3. Aquí queda el marco que los condiciona:)*

Lo que pediste — pop-ups, banners, formularios — analizado como profesional y no como lista de deseos. Adelanto la letra pequeña que condiciona TODO el catálogo:

1. **Google penaliza los interstitials intrusivos en móvil** (desde 2017). Un pop-up que cubre el contenido al aterrizar desde Google puede costar posicionamiento — que es justo el tráfico que queremos. Consecuencia de diseño: los formatos seguros son **banner/barra que no cubre el contenido, slide-in parcial, y pop-up diferido a interacción** (no al aterrizar). El «pop-up promocional» se hace, pero se hace bien.
2. **RGPD:** un formulario de captación convierte a cada franquiciado (sociedad independiente) en responsable de esos datos — y 5 de 8 tiendas aún no publican ni sus datos legales. Consecuencia: **v1 sin captura de datos personales**; la «intención de socio» se convierte en visita a tienda («te haces socio en 2 minutos en caja»), no en un email que nos hace responsables. Formularios: fase posterior, solo para tiendas con `company` completo.
3. **Consent Mode propio:** cero terceros pre-consentimiento (bajo test). Todo mecanismo se construye en casa — nada de widgets de chat de terceros, contadores externos, etc.

Con ese marco, el catálogo a analizar (veredicto por pieza cuando lleguen las fuentes): barra de oferta del mes (gestionable por dato en la ficha) · banner de campaña · pop-up diferido de beneficios socio · aviso «abierto ahora / cierra pronto» · click-to-call/WhatsApp persistente (ya existe, se rediseña) · cupón enseñable en caja (sin datos personales) · página de oferta flash por tienda.

## 6. Las secciones que faltan

*(El catálogo real está medido: 1.683 productos, 133 categorías, fotos descargables — `investigacion-conversion-2026-08.md` §1. Candidatas, cada una con su R5:)*

| Sección nueva | Pregunta (P2) | Conversión | Evento |
|---|---|---|---|
| **Hazte socio** (estrella) | «¿qué gano yo?» | 3 → 1 | `interes_socio` |
| **Productos y marcas reales** (con fotos/categorías de usafitness.es) | «¿qué tienen?» | 1 | `ver_productos` |
| **Oferta del mes** (dato gestionable por tienda) | «¿por qué hoy?» | 4 → 1 | `ver_oferta` |
| **Hoy en tienda** (horario con estado + cómo llegar + dónde exactamente en el centro) | «¿está abierto? ¿dónde?» | 1 | `ver_horario`, `contacto_maps` |
| **Por qué en tienda** (asesoramiento, inmediatez, tocar producto — P9) | «¿y no en Amazon?» | 2 | — |

## 7. Referencias visuales con trazabilidad

Proceso: pool de webs concretas (premiadas de la categoría + cadenas comparables) → las navego y **capturo** con el panel abierto → ficha por plantilla: elemento adoptado, de dónde, por qué sirve a NUESTRO objetivo (no porque sea bonito) → tú auditas la ficha antes de que se construya nada. La primera pool se propone al cierre de la investigación.

## 8. El plan por fases

Sin prisa, con definición de hecho por fase. Ninguna fase se cierra sin su criterio.

| Fase | Entregable | Hecho cuando… |
|---|---|---|
| **F0 Fundamentos** | Este documento corregido por ti + beneficios de socio reales (los pasas mañana) + catálogo de usafitness.es extraído | Tú apruebas §3 (objetivos) y las preguntas de §10 tienen respuesta |
| **F1 Contenido y datos** | Secciones nuevas de §6 con datos reales; campos nuevos en el esquema; copy que responde P2 (fuera el mad-lib) | Cada sección pasa Loop A con captura; render digno con datos de lagoh |
| **F2 Mecanismos** | Los aprobados de §5, con sus eventos | Cada mecanismo emite su evento y pasa la letra pequeña (SEO/RGPD/consent) |
| **F3 Plantilla 1 rediseñada** | Con método completo: objetivos → referencias capturadas → Loop B con las dos tiendas | Tu veredicto es «otra web», no «otra piel». Si no, vuelta con defectos nombrados |
| **F4 Catálogo de plantillas** | 3-4 plantillas distintas de verdad (incl. una oscura — dijiste «está bien tener ambas») + página muestrario para vender | Un franquiciado distingue y elige entre ellas sin ayuda |
| **F5 Medición e iteración** | Loop C activo con GA4 real | Primera revisión mensual con datos, primera decisión tomada por datos |

## 9. La pauta de memoria (tu queja 14)

Fija desde ya, sin depender de que me acuerde: **toda sesión sustantiva cierra actualizando `memory/` antes del mensaje final** — `11-session-summary` (append), `12-open-doubts` (preguntas vivas), y `06/07/08` cuando toque. Este documento queda referenciado desde `memory/06`. La sensación de divagación se combate con esto y con los loops: cada tramo de trabajo declara al empezar contra qué fase del plan va.

## 10. Preguntas para ti — solo las nuevas

Las que la investigación no puede responder (las ya respondidas no se repiten: socio sin doc y alta en tienda ✓, productos en usafitness.es ✓, oscura sí como opción ✓):

1. **Beneficios de socio completos** — dijiste que me los pasas mañana. Con eso se escribe la sección estrella.
2. **¿La central permite mostrar PRECIOS en las landings de tienda?** Reutilizar fotos y categorías de usafitness.es parece seguro (misma marca); publicar precios compromete a la tienda si difieren. ¿Enseñamos producto+marca sin precio, o con precio?
3. **La «oferta del mes»: ¿quién la decide?** ¿La central para todos, o cada franquiciado la suya? Cambia el modelo de datos y el servicio vendible.
4. **¿Existe alguna restricción de la central sobre qué puede publicar cada tienda** (campañas, descuentos propios)? Es la pregunta del contrato de franquicia que sigue abierta en memoria y aquí se vuelve práctica.
5. **Tesis de §P8 y jerarquía de §3:** ¿las corriges o las apruebas tal cual?

## 11. Autocrítica de este documento

- **Supuesto más frágil:** la jerarquía de conversión (§3) pone la visita física por encima del contacto. Si tus datos de tienda dicen que quien llama compra más que quien entra por probar, el orden 1-2 se invierte y varias decisiones de diseño con él.
- **Parte más débil:** §5 y §6 hasta que la investigación entregue fuentes — ahora mismo son mi análisis sin números externos. Se marca explícitamente y se completa antes de construir nada.
- **Riesgo omitido hasta ahora en todo el proyecto:** diseñar mecanismos de conversión sin poder medirlos (GA4 a 0 de 8) es volar a ciegas también en la dirección nueva. F5 depende de un alta que está en tu mano desde hace días; sin ella, el método científico se queda sin la mitad «medir».
