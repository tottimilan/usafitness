# Ronda 2 — el loop atrevido

**Fecha:** 2026-08-27 · **Origen:** pedido del dueño tras aprobar el inventario: *«innova, sé bold, objetivos nuevos, algo interactivo — vamos más allá»* + su pista: *«aprovechar mucho lo de nuestro equipo, puede abrir nuevos caminos»*.
**Método:** 5 exploradores con briefs opuestos (herramientas interactivas · equipo-como-plataforma · tienda viva · puentes físico-digital · el hereje que ataca el propio inventario) → 25 propuestas → filtro adversarial que deduplicó 3 clústers grandes y mató lo gimmick. **Estado: ✅ APROBADA ÍNTEGRA por el dueño (27-ago)** — «me gusta, buen trabajo, lo apruebo, y me gustan los nuevos objetivos también». Las 3 estrellas + las 8 con su condición entran; P6-P8 y N6-N8 pasan al sistema; las muertas siguen muertas.

---

## Las tres estrellas (nota 9)

### ⭐ 1. «Empieza aquí» — el asesor de 3 toques, firmado por el equipo
Selector de 3 pasos (¿para qué entrenas? · ¿empiezas o llevas tiempo? · ¿preferencias?) → una de 6-8 **rutas** escritas UNA vez a nivel de marca sobre las 137 categorías reales. Sin productos, sin precios, sin promesas de salud. El resultado sale «revisado por el equipo» y viaja en el `wa.me` prellenado: **el franquiciado recibe el lead con el diagnóstico hecho**. Cero datos captados (todo vive en el navegador del visitante). JS inline ~3 KB, árboles como dato validado por Zod en build.
**Crea P6** — *«no sé por dónde empezar (y me da vergüenza preguntar)»* — la fricción real del principiante que ninguna P1-P5 cubría. Y de regalo: el evento `punto_de_partida{ruta}` es **la señal de demanda por tienda que ni la central tiene**.
**Tesis:** 16 de 18 reseñas reales elogian el asesoramiento y ninguna web del sector lo publica. Esta pieza ES el primer minuto de esa asesoría.

### ⭐ 2. `/guia` — el imán invertido (el lead magnet oficial, por fin en uso)
La marca imprime en su guía de nutrición: *«Te regalamos una ORIENTACIÓN EN TIENDA GRATUITA — RESERVA TU CITA AQUÍ»* — y ninguna web lo cumple. La jugada fina del filtro: **invertir el imán** — la guía se regala por VISITA (vale-pantalla canjeable al presentarse), no por email. Eso desactiva los dos riesgos que mataban las variantes con cita (la cita sin contestar; el móvil verificado que hoy tiene 1 tienda) y **funciona HOY en todas**. La capa «propón tu franja» (generada en SSR con `parseHorario` — imposible ofrecer franja con la tienda cerrada) se añade solo donde haya móvil verificado + compromiso del franquiciado.
**Crea N6 orientación** (`vale_orientacion` universal + `pedir_cita{origen}` como capa) — **la conversión más fuerte del sistema: una visita con intención declarada.**

### ⭐ 3. «Apártamelo» — reserva por WhatsApp
Botón en Oferta y Novedades: *«Apártamelo — lo recojo hoy»* → `wa.me` prellenado con el producto. **Click&collect real con un href**: sin ecommerce, sin pago online, sin stock, sin backend — la reserva vive en el WhatsApp del franquiciado. Gate por móvil verificado (argumento de la sesión de alta, no promesa de hoy).
**Crea N7 reserva** (`pedir_reserva{seccion,producto}`) — la intención más alta por debajo de la compra, y el informe pasa a decir «X pedidos apartados este mes».

## Entran (notas 7-9)

| Pieza | Nota | Qué es | Condición |
|---|---|---|---|
| **Las verdades del mostrador** | 9 | El pacto anti-venta: «te decimos qué NO necesitas» — categoría-de-uno en un sector construido sobre vender botes. `<details>` nativo, CERO JS. **Crea P7** (¿me vais a vender lo que no necesito?) y da respuesta al padre/madre (tarjeta de menores) | La central y cada franquiciado lo FIRMAN o no se muestra — cada compromiso es exigible en 50 mostradores |
| **La tarjeta que vuelve** | 8 | Cupón de próxima visita anclado a economía real (el bote se acaba en 30-45 días) y canje físico contable por código de tienda. **Crea N8 retorno** — la primera métrica que une clic con caja | Fraude acotado dimensionando el beneficio como cortesía |
| **La serie del experto** | 8 | UNA pieza mensual de flota → tres salidas (canal WhatsApp + consejo del mes + oferta), con **fusible evergreen** si el mes viene vacío. Repara el punto ciego del canal ya aprobado: sin plan de contenido, muere en 3 semanas | Disciplina mensual del operador, confesada |
| **La placa de la tienda** | 8 | Cifras verificables calculadas en SSR que envejecen solas (años abierta, marcas, socios) — confianza sin mantenimiento | Omisión automática en tiendas jóvenes |
| **`/mostrador`** | 8 | El marco nuevo: la web como herramienta DURANTE la venta en tienda (pantalla-pase, catálogo del asesor). noindex, sin GA4 — objetivo interno | Piloto en 2 tiendas; éxito se evalúa preguntando |
| **Ruta «Mujer», con Amanda Gil** | 8 | **557 de 1.683 productos** son de la categoría Mujer y la web ni la menciona. Cada experto abre un público — la materialización literal de «el equipo abre caminos» | ⚠️ **Verificar credenciales de Amanda ANTES de titularla** (título regulado — intrusismo) + permiso de imagen |
| **QR del escaparate** | 7 | El escaparate vende de noche: QR → `/oferta` con `utm_source` propio. Brilla en las 11 tiendas a pie de calle | El vinilo dice la oferta, no «visita nuestra web» |
| **El muro que no se pudre** | 7 | Fotos de la tienda con **contrato de degradación** (diseñada para el olvido humano) | Solo dentro del servicio mensual pagado |

## Recortadas y fusionadas (la honestidad del filtro)

- Los clústers **asesor** (5 propuestas) y **guía** (5) quedaron en UNA pieza cada uno — la mejor versión con los mejores órganos de las demás.
- **Mi Pase** (localStorage) baja de producto a **infraestructura** compartida de las estrellas.
- **/regalo** (P8, el que viene a regalar): insight real, sobre-construcción — queda como **ruta estacional** del recomendador en nov-ene.
- **El consultorio** del experto: v1 solo el compositor `wa.me`; el archivo publicado, como módulo de pago futuro.

## Muertas, con el porqué

- **La calculadora de proteína** — re-proponía un **descarte documentado nuestro** (memory/06: consejo dietético personalizado, riesgo con menores) y firmarla con Amanda lo agravaba. El filtro citó el descarte. Así se usa una memoria.
- **El reto del mes con racha** — comportamiento de app impuesto a una landing local: gimmick con calendario.

## Objetivos nuevos validados (entran al sistema con puerta)

| Nuevo | Qué | Evento |
|---|---|---|
| **P6** | «no sé por dónde empezar» | `punto_de_partida{ruta}` |
| **P7** | «¿me vais a vender lo que no necesito?» | `verdad_abierta{cual}` |
| **P8** | «vengo a regalar» (estacional, ruta del recomendador) | espera a demostrar demanda |
| **N6** | orientación — la visita con intención declarada | `vale_orientacion` · `pedir_cita{origen}` |
| **N7** | reserva de producto | `pedir_reserva{seccion,producto}` |
| **N8** | retorno anclado a caja | `cupon_vuelta{origen}` |

## Puertas comunes antes de construir NADA de esto

1. **OK escrito de la central** para: distribuir la guía PDF + imagen/credenciales del equipo (un solo viaje). Todo lo firmado degrada a firma-de-marca-sin-foto si esa puerta no se abre.
2. **Verificación de credenciales de Amanda Gil** con documento (título regulado).
3. Todo evento nuevo pasa por el **registro de guia-alta §3.4** con puerta del dueño.
4. Todo contenido de nutrición pasa la política YMYL (Reglamento UE 1924/2006; jamás «nutricionista» sin título; nada dirigido a menores).
