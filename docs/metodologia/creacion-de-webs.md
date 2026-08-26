# Metodología de creación — webs, secciones, plantillas y estrategias

**Fecha:** 2026-08-27 · **Estado:** operativa. Toda pieza visual o de conversión de este proyecto se crea siguiendo esto.
**Por qué existe:** dos plantillas rechazadas por el mismo defecto de proceso (`docs/product/metodo-plantillas-y-conversion.md` lo desgrana). El norte que esta metodología sirve: `docs/product/norte.md`.

---

## 0. El principio

**Objetivos → evidencia → referencias confirmadas → construcción → verse → medirse.** En ese orden, siempre. Construir antes de tener los tres primeros es el error que ya cometimos dos veces; queda prohibido por método, no por memoria.

---

## 1. La hoja de objetivos (se escribe ANTES de cualquier pieza)

Plantilla obligatoria. Sin hoja no hay brief, sin brief no hay construcción.

```
PIEZA: (sección / plantilla / mecanismo)
PREGUNTA DEL VISITANTE QUE RESPONDE: (de la jerarquía §2)
CONVERSIÓN A LA QUE SIRVE: (nivel 1-5, §2)
EVENTO QUE EMITE: (GA4, nombre concreto)
EVIDENCIA QUE LA JUSTIFICA: (dato con fuente, de docs/product/investigacion-*)
QUÉ PASA EN LA TIENDA CON PEORES DATOS: (hoy: lagoh — 2 fotos malas,
  sin reseñas, sin WhatsApp. Si la pieza muere ahí, se rediseña o se hace condicional)
CÓMO SE VENDE AL FRANQUICIADO EN UNA FRASE:
```

**Ejemplo canónico, rellenado** (la primera hoja real del sistema):

```
PIEZA: sección «Hazte socio»
PREGUNTA: P3 — ¿qué gano yo?
CONVERSIÓN: N3 → N1
EVENTO: interes_socio
EVIDENCIA: el programa de socio no está publicado en ningún sitio del
  ecosistema USA Fitness [V] — esta sección es contenido único
PEOR TIENDA: contenido de marca, idéntico en todas — no depende de datos
  de tienda; digna en lagoh por construcción
FRASE: «la única página del ecosistema que explica qué gana tu socio,
  y te mide cuánta gente lo pide»
```

## 2. Jerarquías canónicas (v1 — pendiente de corrección del dueño)

**Preguntas del visitante**, por frecuencia medida (fuentes en la investigación):
P1 ¿está abierto y cómo llego? (54%/53% de lo más buscado) · P2 ¿qué tienen y cuánto cuesta? · P3 ¿qué gano yo? (socio) · P4 ¿es de fiar? (reseñas: solo el 4% no las lee) · P5 ¿me asesoran?

**Conversiones**, por valor para el franquiciado:
N1 visita a tienda (`contacto_maps`, `ver_horario`) · N2 contacto con intención (`contacto_whatsapp`, `contacto_llamada`) · N3 intención de socio (`interes_socio`) · N4 oferta vista (`ver_oferta`) · N5 seguir en Instagram.

**Evidencia por posición:** P1 [P, Google/Ipsos] · P2-P5 [hipótesis razonada — Loop C valida el orden con datos propios: eventos por sección y queries de GSC].
**Regla de uso de v1:** mientras el dueño no las corrija, valen para HOJAS y ARTEFACTOS (trabajo reversible), **no** para construir (Loop A en adelante). Su corrección marca v2 con fecha.
**Precios (decisión del dueño, 27-ago):** la mitad «cuánto cuesta» de P2 **no se responde con tarifas** en v1 — precios no visibles; campo opcional oculto en el esquema (memory/04). Se responde con oferta del mes + ventajas de socio. Ninguna hoja intenta responderla con precios.
**Nota de proxy en N1:** `ver_horario` es proxy débil de visita (incluye a quien descubre que está CERRADO): en el informe se llama «intención de visita» y se contrasta con `contacto_maps` — el mismo estándar que «intención de llamada» (memory/06 F1). Añadido `ver_productos` a N1.

**Regla:** toda sección declara su P y su N. Sección sin P ni N: no existe. Nombres exactos, parámetros y estado de TODOS los eventos: **registro único en `docs/medicion/guia-alta.md` §3.4**.

## 3. Fase de referencias — con el dueño como puerta

*(Instrucción directa del dueño, 2026-08-27: investigar «gits, páginas destacadas que votan mejores páginas, diseños, CodePen, efectos, estilos, mejores patrones, modas de UI/UX» y presentárselo ANTES de crear.)*

1. **Pool de fuentes** por tanda de creación: Awwwards / CSS Design Awards / Godly / Land-book (curación votada) · CodePen / GitHub (efectos e implementación) · webs reales del sector (GNC, Anytime Fitness por-club, cadenas españolas) · tendencias UI/UX del año con fuente.
2. **Yo navego y CAPTURO** (panel del navegador abierto = mis ojos; sin captura no cuenta como visto).
3. **Entregable: un ARTEFACTO visual** — página con las referencias capturadas, anotadas: qué elemento mola, de dónde sale, por qué sirve a NUESTRO objetivo (su P y su N de la hoja), y qué efectos/patrones propongo adoptar con su coste (peso, soporte, accesibilidad).
4. **Puerta: confirmación del dueño sobre el artefacto.** Sin su OK no se construye. Ahí me dice qué le gusta, qué no, y añade referencias suyas.
5. **Si necesito skills, herramientas o accesos extra** para investigar o construir (una skill nueva, un MCP, material de marca, fotos), **lo digo en ese momento** — no lo rodeo en silencio.
6. Cada elemento adoptado queda en la **ficha de la plantilla** con su procedencia. Trazabilidad auditable: el dueño puede preguntar «¿de dónde salió esto?» de cualquier pieza y la respuesta está escrita.

## 4. Los tres loops (autoevaluación medible)

### Loop A — sección
```
hoja de objetivos → referencia confirmada → construir
→ CAPTURA propia (escritorio + móvil 375)
→ checklist: test de primera mirada — ESCRIBIR qué se lee en la captura ANTES
  de compararla con el objetivo (el resultado va a la ficha; así la opinión se
  vuelve registro contrastable) · ¿su N es lo más visible tras el contenido?
  · ¿defendible en una frase? · ¿digna con datos de lagoh?
→ pasa / no pasa (defecto NOMBRADO si no pasa; nunca «no me convence» a secas)
```

### Loop B — plantilla
```
narrativa escrita + todas las secciones con Loop A pasado
→ render con datos reales de la MEJOR y la PEOR tienda
→ capturas completas (2 tiendas × escritorio + móvil = 4)
→ checklist: reglas R1-R9 (§5), una a una · «¿un franquiciado la describiría como
  OTRA web al lado de la clásica?» · peso <900KB móvil · tests verdes (suelo,
  no techo)
→ MI veredicto escrito y defendible → SOLO después, el del dueño
```

**Escalada (los loops tienen salida):** 2.ª vuelta fallida de la misma pieza →
se vuelve a la fase de referencias (no se parchea sobre lo construido); 3.ª →
la pieza se replantea desde la hoja de objetivos o se descarta, y la decisión
queda en la ficha. Los defectos nombrados se acumulan por escrito: la vuelta N
no puede repetir el defecto de la N-1.

### Loop C — negocio (requiere GA4 vivo)
```
pieza en producción → eventos acumulando → revisión mensual:
¿sube la conversión N1-N2? ¿qué sección emite y cuál es decorativa?
→ iterar o retirar CON DATOS
```

## 5. Reglas de diseño permanentes (R)

- **R1** Primer viewport: responde ≥2 preguntas P sin scroll e incluye una conversión N1-N2.
- **R2** Beneficios de socio: sección propia, estática, primera mitad de la página. **Y son dato con origen documentado y fecha** — el mismo estándar de procedencia que la forma. Sin documento escrito de la central, la sección publica la versión sin cifras («hazte socio en tienda: alta en 2 minutos en caja» — contenido único igualmente); las cifras entran cuando lleguen por escrito. Cifras sin fuente: nunca (lección Fase 0.2, el «Hasta 20% dto.» retirado).
- **R3** Horario de HOY visible desde el primer scroll (dato estructurado). El estado en vivo («abierto · cierra 22:00») queda **CONDICIONADO**: solo con horario v2 + `holidays/<centro>.json` cargado con un año de antelación, y degradación segura (sin calendario de festivos → solo el horario del día, sin estado). Reconcilia el descarte razonado de memory/06 §5 — el día que el badge miente, alguien se desplaza a una persiana bajada.
- **R4** El movimiento nunca transporta información necesaria.
- **R5** Toda sección declara P + N + evento (la hoja de §1).
- **R6** Copy genérico prohibido en zona noble.
- **R7** *(de la investigación, con fuente Google)* Ningún pop-up que cubra contenido a la entrada en móvil — penalización de interstitials desde 2017. Formatos seguros: banner/barra <15% del viewport, cerrable; diferido a interacción.
- **R8** *(RGPD)* Nada de captura de datos personales en tiendas sin bloque `company` completo. La «intención de socio» v1 convierte a visita, no a formulario.
- **R9** Cero terceros pre-consentimiento (ya bajo test). WhatsApp = enlace `wa.me` con mensaje prellenado por tienda, 0 KB, sin scripts.

## 6. Pauta de cierre de sesión (memoria)

**Pauta canónica: `memory/16` §4** (una sola copia; aquí solo el puntero).

## 7. Cuando llega una orden de construcción

El caso más probable — «crea la sección X» con la puerta sin pasar o el dato bloqueado — tiene playbook:

1. **Una orden de construir NO salta ninguna puerta.** La respuesta correcta a «crea la sección X» es entregar hoja de objetivos + evidencia + artefacto de referencias, y **parar en la puerta del dueño**.
2. **Si el contenido está bloqueado en un tercero** (beneficios de socio, condiciones VIP): se avanza todo lo no bloqueado — hoja, referencias, estructura, evento — y la pieza queda en estado **«lista-salvo-dato»**, nombrando el dato exacto y a quién se le pidió.
3. **Prohibido construir con placeholder que pueda llegar a publicarse.**

**Dónde vive cada artefacto** (la trazabilidad prometida es auditable o no es):

| Artefacto | Ubicación canónica |
|---|---|
| Hoja de objetivos y ficha de plantilla | `docs/plantillas/<plantilla>/ficha.md` (la hoja de cada sección es una sección de la ficha) |
| Artefacto de referencias | `docs/plantillas/<plantilla>/referencias/` + publicado como Artifact para el dueño |
| Capturas de loops | `docs/plantillas/<plantilla>/capturas/<fecha>-<pieza>/` |
| Veredicto de Loop B | apartado final de la ficha, fechado |
