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

## 2. Jerarquías canónicas (v1 — pendiente de corrección del dueño)

**Preguntas del visitante**, por frecuencia medida (fuentes en la investigación):
P1 ¿está abierto y cómo llego? (54%/53% de lo más buscado) · P2 ¿qué tienen y cuánto cuesta? · P3 ¿qué gano yo? (socio) · P4 ¿es de fiar? (reseñas: solo el 4% no las lee) · P5 ¿me asesoran?

**Conversiones**, por valor para el franquiciado:
N1 visita a tienda (`contacto_maps`, `ver_horario`) · N2 contacto con intención (`contacto_whatsapp`, `contacto_llamada`) · N3 intención de socio (`interes_socio`) · N4 oferta vista (`ver_oferta`) · N5 seguir en Instagram.

**Regla:** toda sección declara su P y su N. Sección sin P ni N: no existe.

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
→ checklist: ¿responde su P en <3 s de mirada? ¿su N es lo más visible tras
  el contenido? ¿defendible en una frase? ¿digna con datos de lagoh?
→ pasa / no pasa (defecto NOMBRADO si no pasa; nunca «no me convence» a secas)
```

### Loop B — plantilla
```
narrativa escrita + todas las secciones con Loop A pasado
→ render con datos reales de la MEJOR y la PEOR tienda
→ capturas completas (2 tiendas × escritorio + móvil = 4)
→ checklist: reglas R1-R6 del método · «¿un franquiciado la describiría como
  OTRA web al lado de la clásica?» · peso <900KB móvil · tests verdes (suelo,
  no techo)
→ MI veredicto escrito y defendible → SOLO después, el del dueño
```

### Loop C — negocio (requiere GA4 vivo)
```
pieza en producción → eventos acumulando → revisión mensual:
¿sube la conversión N1-N2? ¿qué sección emite y cuál es decorativa?
→ iterar o retirar CON DATOS
```

## 5. Reglas de diseño permanentes (R)

- **R1** Primer viewport: responde ≥2 preguntas P sin scroll e incluye una conversión N1-N2.
- **R2** Beneficios de socio: sección propia, estática, primera mitad de la página.
- **R3** Estado de apertura («abierto · cierra 22:00») visible desde el primer scroll.
- **R4** El movimiento nunca transporta información necesaria.
- **R5** Toda sección declara P + N + evento (la hoja de §1).
- **R6** Copy genérico prohibido en zona noble.
- **R7** *(de la investigación, con fuente Google)* Ningún pop-up que cubra contenido a la entrada en móvil — penalización de interstitials desde 2017. Formatos seguros: banner/barra <15% del viewport, cerrable; diferido a interacción.
- **R8** *(RGPD)* Nada de captura de datos personales en tiendas sin bloque `company` completo. La «intención de socio» v1 convierte a visita, no a formulario.
- **R9** Cero terceros pre-consentimiento (ya bajo test). WhatsApp = enlace `wa.me` con mensaje prellenado por tienda, 0 KB, sin scripts.

## 6. Pauta de cierre de sesión (memoria)

Toda sesión sustantiva termina, ANTES del mensaje final: `memory/11` (append) · `memory/12` (dudas vivas) · `memory/02/06/07/08` si cambió estado/roadmap/decisiones/riesgos. El protocolo completo del agente: `memory/16-protocolo-agente.md`.
