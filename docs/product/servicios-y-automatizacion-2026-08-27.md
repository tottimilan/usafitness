# Servicios y automatización — el mapa completo (27-ago-2026)

**Encargo del dueño:** «analiza todas las estrategias y puntos de servicio que le puedo ofrecer a USA Fitness, así como la automatización de dichos».
**Método:** un agente analista recorrió `memory/15` (catálogo con su corrección de cabecera: modelo tienda a tienda, precios aplazados, los 8 son pilotos sin pago), `proceso-comercial.md`, la investigación de conversión, el inventario y la ronda 2, los riesgos, y el ANEXO y la GUÍA de la central. Filtro que no se negocia: **«desatendible 10 días laborables»**. Sin precios. Los descartes de memory/15 §3 no se reabren salvo argumento nuevo.
**Estado:** propuesta; sustituye la lectura de memory/15 §2 como mapa vivo. Los precios los decide el dueño con el desglose prometido.

---

## La tesis

El catálogo no vende webs: vende ser la única fuente coherente de la verdad de cada tienda (NAP, horario real, festivos del centro, oferta viva, ficha de Google) y una web que convierte búsqueda local en visita, con un informe mensual que lo demuestra. Tras el giro de método y la ronda 2, el mapa se ordena en CINCO capas que comparten una sola maquinaria: (1) la puerta de venta (auditoría gratuita + demo pre-construida), que es gratis para el prospecto y casi gratis para el operador porque la producen el Semáforo NAP y `nueva-tienda.mjs`; (2) el alta única, que es la restricción real del negocio (51 altas × 4-6 h hoy) y donde se activan por flag todas las piezas de ronda 2 (Apártamelo, /guia, verdades, placa, QR); (3) la Base mensual, que es el envase: guardia de flota, Semáforo NAP, informe, y la campaña del mes distribuida 1→N con despublicación por fecha; (4) los módulos que crecen con el contenido de MARCA, no con la tienda (serie del experto, novedades de marca, ficha gestionada, reseñas en lote); (5) los encargos por pieza (/oferta propia, sección nueva, fotos con guion, migración). El filtro «desatendible 10 días laborables» se cumple casi siempre POR CONSTRUCCIÓN gracias a tres mecanismos comunes — despublicación por fecha (antes vacío que mentira), fusible evergreen del contenido de flota, y degradación segura de toda sección sin dato — y solo en dos sitios se cumple POR CONTRATO (los 2 cambios/mes a 5 días laborables y el lote semanal de reseñas, cubiertos por las 4 semanas de blackout escritas). El vídeo-tour que la central ya obliga a grabar, el informe como pieza de retención con «peticiones» dentro, la señal de demanda por tienda (`punto_de_partida`) y el kit físico de tienda son los cuatro activos nuevos que memory/15 no tenía y que cuestan cero horas recurrentes. A la central, en el modelo b, no se le vende: se le pide que bendiga y se le regala lo que le hace quedar bien (sus ofertas publicadas en N webs, su guía cumplida, su vídeo-tour alojado, el panel de coherencia de su marca).

## El mapa, servicio por servicio

### puerta de venta (gratis, previa al alta)

#### Auditoría gratuita de la tienda (puerta de entrada)  ·  `ya-catalogado`

**Qué es:** Una página con capturas y cero opiniones: su teléfono en usafitness.es frente al de su ficha, su horario de domingo en Google frente al real, fotos y reseñas de su ficha (cuántas, fecha de la última), si su dominio existe y qué sirve. Se abre por donde duele y él lo comprueba en su móvil en 10 segundos (memory/15 §6.1, proceso-comercial §3).

**Valor para el franquiciado, en una frase:** «Tu ficha de Google dice que cierras los domingos y tu web que abres: llevas meses mandando gente a una persiana bajada — y esto lo he visto yo antes que tú.»

**Cómo se demuestra:** El propio franquiciado abre Google Maps y usafitness.es en su móvil delante del operador; las discrepancias medidas hoy: teléfono de Marineda ≠ ficha, 4 tiendas con horarios distintos web/Google, 2 cerradas en domingo en Google estando abiertas (memory/15 §2 Semáforo).

**Automatización:** semiautomatico · 0 recurrente · 0,25 h por prospecto (hoy 1-2 h a mano) · desatendible 10 días: sí
- Cómo: El mismo diff del Semáforo NAP (`verificar-nap.ts`) ejecutado contra el expediente que produce `nueva-tienda.mjs investigar` (ficha resuelta por CID, directorio central como seed). Salida HTML de una página con las capturas; el operador solo elige la frase de apertura.
- Qué hay que construir: Modo `--auditoria` sobre el expediente del alta: reutiliza el extractor de ficha (`src/build/ficha-google.ts`, plan de alta C1-C4) y el comparador del Semáforo; plantilla HTML de 1 página. ~1 día una vez existan los dos.

**Depende de:** Semáforo NAP v1 (paso 1) · nueva-tienda.mjs investigar (paso 2) · Directorio central de 58 fichas como seed [V]

**Riesgos:** El extractor de ficha ya falló en silencio (coordenadas de Marruecos para La Vaguada, plan de alta): toda auditoría automatizada lleva la regla «no resuelto» en vez de coincidencia parcial, y CP≠provincia se rechaza. Una auditoría con un dato falso destruye la venta y la credibilidad.

### puerta de venta (gratis)

#### Demo pre-construida del prospecto  ·  `ya-catalogado`

**Qué es:** La landing del prospecto generada ANTES de la conversación con sus datos reales (nombre, dirección, horario, fijo del directorio central [V]), en URL de preview noindex. El pitch pasa de «te haré una web» a «tu web ya existe — mírala» (proceso-comercial §2).

**Valor para el franquiciado, en una frase:** «No te vendo una promesa: esta ya es tu web, con tu horario y tu centro; solo falta tu foto y tu WhatsApp.»

**Cómo se demuestra:** URL noindex abierta en su móvil durante la llamada; comparada al lado de su página oficial en usafitness.es (dirección + fijo + iframe, sin WhatsApp ni fotos ni reseñas, verificado sobre las 58).

**Automatización:** automatico · 0 · ~0,1 h por prospecto (ejecutar y mirar) · desatendible 10 días: sí
- Cómo: `nueva-tienda.mjs investigar <nombre>` → entrada validada por el esquema Zod → build → ruta `/preview/<slug>` noindex con plantilla por defecto y fotos genéricas de marca marcadas como provisionales.
- Qué hay que construir: El plan de alta automatizada tal cual (`.cursor/plans/2026-08-26-alta-de-tienda-automatizada.md`, 6 tareas) + un flag `preview: true` que fuerza noindex y excluye del sitemap (el test de «sitemap sin noindex» ya existe). La demo es el subproducto del paso `investigar` sin `aplicar`.

**Depende de:** nueva-tienda.mjs · `mall` opcional en el esquema (11 tiendas a pie de calle bloqueadas, riesgo #8) · Plantilla del método (F3) para que la demo no enseñe lo rechazado

**Riesgos:** Mientras F3 no exista, la demo enseña la plantilla clásica que el dueño llamó «web de 2010»: una demo fea vende en contra. Y la demo publica datos de una sociedad que no es cliente: noindex + borrado a 30 días si no firma.

### alta única

#### Sesión de alta de 45 minutos  ·  `ya-catalogado`

**Qué es:** Una llamada con guion cerrado donde se hace de golpe todo lo que exige presencia del franquiciado: razón social/NIF/domicilio/email legal dictados y tecleados en directo; firma electrónica de contrato marco + art. 28 RGPD + mandato SEPA; verificación del móvil real de WhatsApp con llamada; invitación de gestor a la ficha de Google; elección de plano general y compromiso de las 6 fotos (o guion para el dependiente). Se añaden tras la ronda 2: enlace del canal de WhatsApp, año de apertura (placa), Place ID `ChIJ…`, flags de Apártamelo/verdades/cita.

**Valor para el franquiciado, en una frase:** «Esto te cuesta 45 minutos hoy y cero minutos a partir de mañana.»

**Cómo se demuestra:** Checklist firmado al final de la llamada con los 3 documentos y los campos rellenos; la tienda publica legales indexables ese mismo día (hoy 4-5 de 8 llevan meses en noindex por no dar el NIF: 57% de no-respuesta al email).

**Automatización:** manual · 0 recurrente · 0,75 h una vez · desatendible 10 días: sí
- Cómo: No se automatiza: es la única hora del negocio que compra el sí o el no del cliente el mismo día. Lo que se automatiza es su alrededor: la entrada validada en directo (el esquema Zod rechaza un NIF mal dictado al instante), la plantilla de firma precargada, y el checklist que genera el expediente.
- Qué hay que construir: Guion + checklist verificable (Markdown) · plantilla de firma con los 3 documentos por sociedad · formulario interno de alta que valida contra `EsquemaEmpresa` en vivo (1 día).

**Depende de:** Herramienta de firma electrónica (compra, no construcción) · Mandato SEPA

**Riesgos:** Si en la llamada no se firma el SEPA o no sale la invitación de gestor, la tienda NO se da de alta: media hora perdida es barata, una tienda a medias es una deuda permanente. La verificación de ficha por postal/vídeo la decide Google sin plazo: fuera del alcance por escrito.

#### Alta Express — web en su dominio  ·  `redefinido`

**Qué es:** Web con plantilla elegida del método, foto de hero propia, NAP coherente, 4 legales publicadas, GA4 + Search Console a nombre de su sociedad, sitemap, 404, eventos de conversión N1-N8 registrados, y las piezas de ronda 2 activadas por flag según sus datos (Apártamelo y cita solo con móvil verificado; verdades solo firmadas; placa solo si hay años). Cierra con `npm run flota` (que el dominio sirva LO NUESTRO — el hueco por el que se coló Lagoh).

**Valor para el franquiciado, en una frase:** «Quien busca “usafitness <tu centro>” aterriza hoy en el directorio del centro o en usafitness.es; mañana aterriza en tu web, con tu WhatsApp y tu oferta, y te digo cada mes cuánta gente te trajo.»

**Cómo se demuestra:** Dominio sirviendo la web (`npm run flota` verde), legales indexables, GA4 recibiendo eventos en tiempo real durante la llamada de entrega, primera aparición en GSC a las 2-4 semanas.

**Automatización:** semiautomatico · 0 recurrente · 4-6 h hoy → objetivo ≤3 h en la tienda 20 (150-250 h ahorradas sobre 51 altas) · desatendible 10 días: sí
- Cómo: `nueva-tienda.mjs aplicar <slug> --portada N`: entrada, fotos convertidas/nombradas/redimensionadas (sharp), QR generado, sitemap y 404 por construcción. Lo único que exige criterio humano medido en 8 altas: elegir el plano general mirando las fotos (por eso `aplicar` se niega sin `--portada`, C7).
- Qué hay que construir: El plan de alta (A9 del backlog) + enganchar `flota` al final + `mall` opcional + campo `placeId` en el esquema (verificado 27-ago: el formulario de reseña exige Place ID, no CID).

**Depende de:** Sesión de 45 min con datos completos · Plantilla del método (F3) · Altas GA4/GSC vía API para las 50 (guia-alta §3.5) · OK escrito de la central sobre dominio con marca (riesgo #1 de memory/15 §7)

**Riesgos:** La marca dentro de 8 dominios (`usafitnessvigo.com`…) es reclamable si el contrato de franquicia reserva el uso online al franquiciador; el disparador es el éxito. Conseguir el OK por escrito antes de la tienda 10 cuesta un email y es lo único que puede invalidar el negocio entero.

### alta única (incluida) · encargo para las 8 ya publicadas

#### Muestrario y elección de plantilla (/muestrario)  ·  `redefinido`

**Qué es:** Sesión de 20 min sobre `/muestrario` (noindex) con las 5 plantillas del método sobre datos ficticios; elige y se aplica el mismo día (`template` + `sections` en su entrada). Hoy NO se ofrece: angular y energia están rechazadas y `template` está a 0 de 8.

**Valor para el franquiciado, en una frase:** «Elige delante de mí cuál de las cinco es tu tienda; ninguna otra de la marca tendrá la misma.»

**Cómo se demuestra:** Dos tiendas de la misma ciudad con plantillas distintas vistas en el móvil; criterio de cierre de F3b: «un franquiciado distingue y elige sin ayuda».

**Automatización:** automatico · 0 · 0,3 h por elección · desatendible 10 días: sí
- Cómo: Ruta global con datos de mentira que renderiza cada plantilla; aplicar = un string en la entrada de la tienda. Cero recurrente.
- Qué hay que construir: F3 (las 5 plantillas bajo método, hoy en fase de diseño con direcciones Cartel/Escaparate/Portada) + la ruta `/muestrario` (1 día).

**Depende de:** F3 completa (Loop B pasado en la mejor y la peor tienda) · Aprobación del dueño de las direcciones de diseño

**Riesgos:** Estrena un sistema con 0 de 8 adoptantes: hasta que UNA tienda real lleve una plantilla del método en su dominio, no se sabe si aguanta contenido real (riesgo operativo #5).

### alta única (incluida) · encargo suelto

#### Alta de ficha de Google  ·  `ya-catalogado`

**Qué es:** Reclamar/verificar, categoría principal y secundarias, pin dentro del centro (no en el parking), horario real + festivos del centro como horarios especiales, atributos, 10 fotos, Productos, 5 Q&A sembradas, y Place ID recogido para la web (reseñas + mapa por ficha en vez de por dirección).

**Valor para el franquiciado, en una frase:** «Los cuatro factores que más pesan para salir en el mapa son de tu ficha y se ponen bien una sola vez.»

**Cómo se demuestra:** Captura antes/después de la ficha; los `place_id` sintéticos de Villanueva/Marineda/Las Rosas (riesgo #4) sustituidos por el real; posición en el local pack para «suplementos <centro>» a 60 días (dato, no promesa).

**Automatización:** semiautomatico · 0 recurrente · 3-4 h una vez · desatendible 10 días: sí
- Cómo: Checklist de 22 puntos; `holidays/<centro>.json` alimenta a la vez ficha y web; plantilla NAP derivada de `stores.json`. La verificación la decide Google.
- Qué hay que construir: Checklist + `holidays/<centro>.json` (esquema y primer centro, medio día). Sin API en esta fase.

**Depende de:** Invitación de gestor (Semana 0) · Tienda con ficha existente o creable (GranCasa: `sin-ficha-gbp` declarado — la crea el dueño)

**Riesgos:** La verificación puede encallar semanas sin que el operador pueda hacer nada: se vende el alta, nunca el plazo ni el resultado. Fabricar datos (CID del centro comercial en `FICHAS_PROHIBIDAS`) ya pasó una vez: lo no verificable sale vacío.

### alta única (incluido)

#### Kit físico de tienda: QR de reseñas (mostrador + bolsa) + QR del escaparate  ·  `redefinido`

**Qué es:** Enlace corto verificado a `writereview?placeid=` + expositor de mostrador + tarjeta de bolsa + bloque «déjanos tu reseña» en la web (HTML puro) + guion de 8 palabras para el dependiente que cumple la política de Google. Y, de la ronda 2, el QR del escaparate: vinilo con QR → `/oferta?utm_source=qr` — el escaparate vende de noche, brilla en las 11 tiendas a pie de calle.

**Valor para el franquiciado, en una frase:** «El 47% no entra en un negocio con menos de 20 reseñas y 5 de las 8 tiendas están a cero: esto es la máquina que las trae, y sigue funcionando aunque yo no esté.»

**Cómo se demuestra:** Contador de reseñas nuevas por mes en el informe (Semáforo lo lee de la ficha); `utm_source=qr` en GA4 separa las visitas del escaparate; 5/8 tiendas hoy sin reseñas es la línea base.

**Automatización:** automatico · 0 exactamente · desatendible 10 días: sí
- Cómo: Generador de QR en build desde `placeId` y desde la URL de `/oferta` con utm → SVG para imprenta; el bloque web se pinta solo si hay `placeId`. El vinilo NO dice la oferta concreta (caducaría con cada campaña): dice la promesa fija («escanea: la oferta de este mes / hazte socio») y la oferta vive en la web con fecha-fin.
- Qué hay que construir: Campo `placeId` en el esquema + generador SVG (medio día). Imprenta: compra, no construcción.

**Depende de:** placeId por tienda (Place ID Finder, ~1 min en el alta) · Ficha verificada

**Riesgos:** Cualquier incentivo, tablet de mostrador o filtro de contentos es review gating prohibido (descarte 13): solo el enlace y la frase. Si la ronda 2 mantiene «el vinilo dice LA oferta», el vinilo se convierte en un consumible mensual: se recomienda el vinilo evergreen y, si acaso, un cartel A4 de la campaña como encargo.

### alta única (opcional)

#### Entidad para IA (Bing Places, Apple Business Connect, Facebook, Foursquare)  ·  `ya-catalogado`

**Qué es:** Alta con NAP idéntico en las 4 fuentes que los asistentes de IA consultan según distintas fuentes, + reapuntar la ficha del directorio del centro comercial al dominio propio.

**Valor para el franquiciado, en una frase:** «Cuando alguien le pregunte a su asistente dónde comprar creatina cerca, que tu tienda exista con tu horario correcto en todas las fuentes de las que tira.»

**Cómo se demuestra:** Captura de las 4 fichas creadas con el mismo NAP; el Semáforo NAP las incluye desde entonces en su diff. Se vende el alta, nunca el resultado: los datos de adopción son de EE. UU.

**Automatización:** semiautomatico · 0 · 1-1,5 h una vez · desatendible 10 días: sí
- Cómo: Procedimiento de 5 pasos + plantilla NAP derivada de `stores.json` (sin código). El Semáforo vigila la coherencia después.
- Qué hay que construir: Nada de código; el exportador NAP es una vista del JSON (1 h).

**Depende de:** Alta Express hecha · Datos legales completos

**Riesgos:** Coste oculto que lo hace menos gratis de lo que parece: a partir de aquí cada cambio de teléfono se propaga a 5 sitios, no a 2 — hay que contarlo en los 2 cambios/mes de la Base.

### alta única (incluida la versión guion) · encargo la versión presencial

#### Paquete de fotos con guion para el dependiente  ·  `nuevo`

**Qué es:** Guion de 8 planos que el dependiente hace con su móvil en 15 minutos (plano general desde la puerta, mostrador, estantería de marca fuerte, nevera, detalle de producto, equipo, escaparate de noche, señalética del centro), con reglas de luz y orientación (horizontal siempre para el hero), y el pipeline que convierte, nombra, redimensiona y detecta duplicadas por SHA-256 (ya existe `repitenElHero()`). Sustituye al «paquete de fotos por horas» de memory/15.

**Valor para el franquiciado, en una frase:** «Con quince minutos de tu dependiente y su móvil, tu web deja de tener la misma foto que otras seis tiendas.»

**Cómo se demuestra:** Galería con fotos propias, sin recortes ni deformaciones (filas justificadas, PR #24); Lagoh (3 fotos verticales de 382 px, la peor) como caso de prueba: si el guion la salva, salva a todas.

**Automatización:** semiautomatico · 0 recurrente · 0,3 h por tanda de fotos · desatendible 10 días: sí
- Cómo: Recepción por formulario/email (nunca WhatsApp) → conversión automática con sharp → `medir-imagenes.ts` y `verificar-assets.ts` ya en build → elección humana del plano general (la única decisión de criterio).
- Qué hay que construir: El guion (A4 del backlog: las reglas de curación nunca se escribieron) + la tarea 5 del plan de alta (sharp). 1 día.

**Depende de:** Plan de alta (conversión) · Reglas de curación escritas (A4)

**Riesgos:** El guion depende de que el franquiciado lo haga: el mismo patrón de no-respuesta del NIF. Por eso el plano general se pide y se elige DENTRO de la sesión de 45 min, no después.

### alta única (activación) · gate central

#### Vídeo-tour de la tienda alojado (el que la central ya obliga a grabar)  ·  `nuevo`

**Qué es:** El ANEXO de Integración Digital obliga a cada franquiciado a grabar un vídeo-tour (4K, 60 fps, ≥20 clips: centro → trayecto → cartel → interior → productos) que la central edita y publica en su cuenta (gramática §5). Se aloja una versión recomprimida en la web de la tienda: slot de vídeo en la galería y el trayecto hasta la puerta en «Hoy en tienda», con póster estático y clic-para-reproducir (nunca autoplay, nunca YouTube: cero terceros).

**Valor para el franquiciado, en una frase:** «El vídeo que ya grabaste para la central también trabaja en TU web: el cliente ve cómo llegar a tu puerta antes de salir de casa.»

**Cómo se demuestra:** Evento `ver_video` (a registrar en guia-alta §3.4) y el vídeo de GranCasa que hoy se sirve sin enlazar (2,25 MB, A6) como primer caso: pasa de peso muerto a pieza.

**Automatización:** automatico · 0 · 0,3 h una vez · desatendible 10 días: sí
- Cómo: Pipeline en el alta: recomprimir a 720p/H.264 ≤3-4 MB, extraer póster WebP, colocar en `public/video/<slug>/`; el presupuesto de 900 KB cuenta el póster y NO el vídeo porque solo se descarga al clic. Una vez, cero recurrente.
- Qué hay que construir: Componente `Video.astro` con póster y `preload="none"` (medio día) + paso de ffmpeg en el pipeline de alta (medio día) + evento nuevo en el registro.

**Depende de:** OK escrito de la central para alojar (mismo viaje que el PDF de la guía e imagen del equipo) · Que la central entregue el fichero editado a la tienda (pregunta abierta) · Registro de evento `ver_video`

**Riesgos:** Un 4K/60 fps servido tal cual rompe el presupuesto y la experiencia móvil; el fichero editado es propiedad de la central (imagen de terceros, música con licencia): sin su OK escrito no se aloja. Si el vídeo muestra precios o promociones caducadas, miente para siempre: se revisa en el alta y se retira por fecha si lleva oferta.

#### /guia — el imán invertido (vale de orientación en tienda)  ·  `redefinido`

**Qué es:** La guía de nutrición de la marca promete «orientación en tienda gratuita — reserva tu cita» y ninguna web lo cumple (gramática §5). Se invierte el imán: la guía (PDF recomprimido, noindex) se regala por VISITA con un vale-pantalla canjeable al presentarse — cero datos captados, funciona HOY en las 8. La capa «propón tu franja» (generada en SSR con `parseHorario`: imposible ofrecer franja con la tienda cerrada) solo donde haya móvil verificado + compromiso del franquiciado.

**Valor para el franquiciado, en una frase:** «La promesa que tu marca imprime en su guía, cumplida solo por tu tienda — y cada vale es una visita con intención declarada.»

**Cómo se demuestra:** `vale_orientacion` (universal) y `pedir_cita{origen}` (capa) en el informe; el vale enseñado en el mostrador.

**Automatización:** automatico · 0 · desatendible 10 días: sí
- Cómo: Landing estática + vale con código de tienda y fecha; la capa de cita es un `wa.me` prellenado con la franja elegida — sin calendario, sin backend, sin confirmación nuestra. Cero recurrente.
- Qué hay que construir: Landing `/guia` + componente vale + capa de franja (1-2 días bajo método) + eventos N6 en el registro.

**Depende de:** OK escrito de la central para alojar el PDF (mismo viaje) · Móvil verificado para la capa de cita (hoy solo Vigo)

**Riesgos:** Una «cita» que el franquiciado no contesta es peor que ninguna: por eso la capa de cita es argumento de la sesión de alta, no promesa de hoy, y el vale sin cita es lo universal.

### alta única (activación automática)

#### Placa de la tienda  ·  `nuevo`

**Qué es:** Cifras verificables calculadas en SSR desde datos ya existentes y que envejecen solas: años abierta (desde `apertura`), marcas en estantería (del catálogo), reseñas y nota (de la ficha). Omisión automática en tiendas jóvenes o sin dato (ronda 2, P4).

**Valor para el franquiciado, en una frase:** «Números verificables en vez de adjetivos — y se actualizan solos cada año sin que nadie toque nada.»

**Cómo se demuestra:** La placa cambia de «11 años» a «12 años» el día del aniversario sin despliegue; en Lagoh (joven) no se pinta.

**Automatización:** automatico · 0 · desatendible 10 días: sí
- Cómo: Campo `apertura` (fecha) recogido en la sesión de alta; el resto derivado. Cálculo en SSR, ninguna tarea.
- Qué hay que construir: Campo en el esquema + componente (medio día).

**Depende de:** Año de apertura dictado en el alta

**Riesgos:** Una cifra sin fuente («socios») no entra: R2 (lección del «Hasta 20% dto.» retirado). Solo lo que se deriva de un dato con origen.

### alta única · infraestructura de las 5 plantillas

#### Capa nocturna (esquema oscuro por preferencia del sistema)  ·  `nuevo`

**Qué es:** La D4 retirada como dirección y convertida en capa de infraestructura: cada plantilla define tokens claro/oscuro y respeta `prefers-color-scheme`; el dueño ya dijo «está bien tener ambas». No es una plantilla más: es que las 5 se vean bien de noche, cuando el escaparate y el QR trabajan.

**Valor para el franquiciado, en una frase:** «Tu web se ve moderna a las 11 de la noche en un móvil en modo oscuro — que es cuando tu cliente la mira desde el sofá.»

**Cómo se demuestra:** Capturas 375 px claro/oscuro de la mejor y la peor tienda en cada plantilla (Loop B) sin romper el tope de 120 KB de fuentes+CSS (`presupuesto.ts`).

**Automatización:** automatico · 0 · desatendible 10 días: sí
- Cómo: Tokens CSS por plantilla; cero JS; cero mantenimiento por tienda.
- Qué hay que construir: Dentro de F3: pares de tokens y pasada de contraste; no es trabajo aparte si se hace desde el principio.

**Depende de:** F3 (las 5 plantillas)

**Riesgos:** Fotos mediocres con luz mala se ven PEOR sobre fondo oscuro; la base de marca es blanca y luminosa (gramática): la capa nocturna debe seguir siendo «blanco que se apaga», no una web negra. Duplica el trabajo de verificación visual (8 capturas por plantilla en vez de 4).

### encargo (por horas) · variante del Alta Express

#### Migración desde WordPress  ·  `ya-catalogado`

**Qué es:** Rescatar fotos y textos del WordPress anterior, redirecciones 301 de las URLs antiguas que tengan tráfico en GSC, cambio de DNS y comprobación de que el dominio sirve lo nuestro (Villanueva sigue entera en su hosting anterior, B3).

**Valor para el franquiciado, en una frase:** «No pierdes ni una foto ni una posición; el día del cambio nadie llega a una página rota.»

**Cómo se demuestra:** `npm run flota` verde en el dominio + 0 URLs antiguas en 404 en GSC a 30 días.

**Automatización:** semiautomatico · 0 · 1-2 h una vez · desatendible 10 días: sí
- Cómo: Extracción de fotos automatizable (ya se hizo 8 veces); las 301 se derivan del sitemap antiguo; el DNS es panel externo del franquiciado.
- Qué hay que construir: Mapa de redirecciones como dato de la tienda (`redirects[]`) resuelto en el middleware (medio día).

**Depende de:** Acceso al hosting/DNS antiguo · Plan de alta

**Riesgos:** El día del cambio de DNS es cuando un dominio se apaga sin que nadie lo vea (Las Rosas, Lagoh, riesgo #10): el monitor externo debe estar dado de alta ANTES de la migración, no después.

### base mensual

#### Base mensual (guardia de flota + Semáforo NAP + informe + 2 cambios/mes)  ·  `ya-catalogado`

**Qué es:** Guardia técnica como coste de flota (no por tienda), SSL, uptime externo (StatusCake fuera de Railway y Cloudflare + cron DNS propio), backups, aviso de caducidad de dominio a 60 días, 2 cambios de contenido al mes con plazo declarado de 5 días laborables por formulario/email, Semáforo NAP mensual, informe de 1 página. Y desde el giro: la campaña del mes de la central distribuida (ver servicio propio) y la re-verificación trimestral de los 2 huecos de la central (`prices-drop`, «socio»).

**Valor para el franquiciado, en una frase:** «Cuando el centro cambie el horario de Navidad tendrás a quién escribir, y si tu web se cae a las 4 de la mañana me entero yo antes que tu cliente.»

**Cómo se demuestra:** El informe mensual (prueba de vida) + el histórico del monitor (uptime por dominio) + el Semáforo en verde. Sin informe, la cuota es una cuota sin prueba de vida.

**Automatización:** automatico · 0,55 h (0,13 servicio + 0,30 interlocución + 0,12 admin) + 3-6 h/mes fijas de flota · desatendible 10 días: sí
- Cómo: Monitor externo + `vigilancia-dns.yml` (cron diario) + `npm run flota`; Semáforo en CI; informe en cron mensual. Lo único humano: los 2 cambios/mes (0,13 h) y la interlocución (0,30 h).
- Qué hay que construir: Monitor (compra, B4) · cron DNS (30 líneas, guia-alta §1.9) · cola de peticiones con acuse automático y plazo (formulario → issue/email; 1 día). Todo lo demás está o está planificado.

**Depende de:** Monitor externo dado de alta (riesgo #10, hoy nadie vigila) · GA4/GSC de alta (informe) · Mandato SEPA (cobro sin acción mensual del cliente)

**Riesgos:** Es la única capa donde el filtro de 10 días se cumple POR CONTRATO y no por construcción: los 5 días laborables de los cambios se rompen en una ausencia de 10 → las 4 semanas de blackout anual y el acuse automático «recibido, plazo X» son parte del producto, no letra pequeña. Y la interlocución (0,30 h) es la única partida que jamás automatiza; si la media real es 0,45 el techo baja de 90 a 75 tiendas (autocrítica de memory/15).

### base mensual (componente) · motor transversal

#### Semáforo NAP (dentro de la Base; motor de la auditoría)  ·  `redefinido`

**Qué es:** Diff mensual `stores.json` ↔ ficha de Google ↔ directorio del centro comercial ↔ usafitness.es: teléfono, dirección, horario, festivos, categoría, URL, y desde el giro también «¿el dominio sirve lo nuestro?» (flota), `placeId` presente, y las 4 fuentes de Entidad IA si se contrató. Rojo/ámbar/verde con el diff exacto. Se vende como «te aviso», nunca como «te lo arreglo en X horas».

**Valor para el franquiciado, en una frase:** «El 80% de la gente desconfía cuando el teléfono no coincide entre sitios — yo soy el único que mira los cinco sitios a la vez cada mes.»

**Cómo se demuestra:** El bloque Semáforo del informe con el diff literal; hoy el teléfono de Marineda ≠ su ficha y 2 tiendas figuran cerradas en domingo estando abiertas.

**Automatización:** automatico · 0,03 h · desatendible 10 días: sí
- Cómo: v1 contra snapshot revisado a mano (funciona hoy, sin API ni permisos); v2 lee la ficha por Business Profile API si la Semana 0 sale bien. Corre en CI y falla el build en rojo cuando la discrepancia es nuestra.
- Qué hay que construir: `src/build/verificar-nap.ts` calcado de `verificar-assets.ts` (medio día). El fetcher permanente del directorio del centro NO (descarte 14: scraping ajeno que falla en silencio): revisión manual anual dentro del alta.

**Depende de:** Snapshot inicial por tienda (se hace en el alta) · Business Profile API solo para v2

**Riesgos:** Un Semáforo que da verde por no poder leer una fuente es peor que ninguno: cada fuente ilegible se marca «sin dato», nunca verde.

### base mensual (componente)

#### Informe mensual de 1 página (la pieza de retención)  ·  `redefinido`

**Qué es:** Impresiones y consultas (GSC), intención de llamada, WhatsApps, «cómo llegar», intención de visita (`ver_horario`, contrastado con `contacto_maps`), ofertas vistas con origen central/propia, interés de socio, y los nuevos de ronda 2: puntos de partida por ruta, vales de orientación, apartados pedidos, cupones de vuelta, altas al canal; reseñas nuevas; Semáforo; y dos párrafos escritos a mano «esto hice / esto haré». Redefinido como pieza de RETENCIÓN: lleva dentro las «peticiones» (fotos que envejecen, canjes en caja, festivos de octubre) para que el franquiciado reaccione cuando le conviene a él. Y para los 8 pilotos es EVIDENCIA de venta antes que retención.

**Valor para el franquiciado, en una frase:** «Cada mes sabes cuánta gente te trajo la web — mínimos medidos, no humo — y qué voy a hacer el mes que viene.»

**Cómo se demuestra:** El propio informe; regla de redacción «mínimos medidos, nunca totales» (sesgo de consentimiento, memory/08 #11) con GSC y Cloudflare Analytics como suelo del infraconteo.

**Automatización:** semiautomatico · 0,10 h · desatendible 10 días: sí
- Cómo: `scripts/informe.mjs` (GSC Search Analytics + GA4 Data API → HTML) en cron mensual el día 1-3; las 20-58 tiendas en lote una tarde; los dos párrafos son lo único humano (0,10 h). Tiene periodicidad pero no urgencia: si sale el día 3 nadie lo nota.
- Qué hay que construir: `informe.mjs` (2-3 días) + plantilla HTML de 1 página + sección «peticiones» derivada de metadatos (edad de fotos, festivos del año siguiente sin cargar). Requisito duro previo: `ga4Id` pegados (hoy 0/8; la fontanería de Consent Mode ya está bajo test).

**Depende de:** GA4 + GSC de alta por tienda (bloqueado en el dueño desde el 26-ago) · art. 28 firmado + `company` completo (se activa por tienda solo con eso) · Registro único de eventos guia-alta §3.4

**Riesgos:** Un informe que un mes dice «nada nuevo» tres veces seguidas es una baja anunciada: por eso la campaña del mes y la serie del experto existen — dan al informe algo que contar aunque la tienda no haya hecho nada. El sesgo de consentimiento hace que dos tiendas no sean comparables sin normalizar (Loop C).

### base mensual o módulo — decisión de tarificación pendiente del dueño

#### Campaña del mes gestionada (oferta central distribuida 1→N + override propio)  ·  `redefinido`

**Qué es:** La central produce ofertas y NO las publica online [V]; el operador tiene acceso al canal (dato del dueño, 27-ago). Una pieza de oferta se carga UNA vez a nivel de flota (texto, imagen recomprimida, fecha-fin obligatoria) y cada tienda opta (in/out); la oferta propia de una tienda pisa a la central (precedencia propia>central). Banner inline o barra pegajosa <15% del viewport (formatos seguros para Google [V]), cupón «enséñalo en caja» sin datos personales, despublicación automática por fecha. Modelo Anytime Fitness/GNC por club [V].

**Valor para el franquiciado, en una frase:** «La central no publica sus ofertas online: tu web es el canal de promociones DE TU TIENDA, cada mes, sin que tú hagas nada.»

**Cómo se demuestra:** `ver_oferta{origen}` en el informe; la sección de ofertas del ecommerce central vacía (verificable en su móvil); el cupón enseñado en caja como prueba física.

**Automatización:** automatico · 1-2 h/mes de flota ÷ N (a 20 tiendas ~0,08 h; a 58 ~0,03 h) · desatendible 10 días: sí
- Cómo: Fichero `campanas/<yyyy-mm>.json` de flota validado por Zod (fecha-fin obligatoria) → cada tienda `oferta: 'central' | 'propia' | false` → SSR decide qué pinta HOY; caducada = no se pinta (antes vacío que mentira). El operador carga 1 pieza al mes; si no la carga, la sección desaparece sola.
- Qué hay que construir: Esquema de oferta con fecha-fin + resolución en SSR por fecha (la maquinaria de despublicación, 1 día) + sección «Oferta del mes» de F1 (ya con hoja de objetivos) + landing `/oferta` que redirige a home sin oferta viva.

**Depende de:** Acceso continuado al canal de ofertas de la central · Sección Oferta F1 construida bajo método · Registro de `ver_oferta{origen}`

**Riesgos:** El foso es la INACCIÓN de la central: si mañana publica sus ofertas, el argumento sobrevive solo como «el canal de TU tienda» (riesgo #13). Una oferta con precio choca con «precios no visibles»: la oferta se expresa en ventaja (2×1, regalo, % socio) o se despublica. Y una oferta central que un franquiciado no quiere honrar en caja es un cliente enfadado en su mostrador: por eso el opt-in es por tienda y por campaña.

### base mensual (componente) · carga anual

#### Calendario de festivos del centro (`holidays/<centro>.json`) y estado «abierto ahora / cierra en X»  ·  `redefinido`

**Qué es:** Los festivos y horarios especiales de cada centro comercial cargados con un año de antelación (en octubre), que alimentan A LA VEZ el horario de la web, el estado en vivo de «Hoy en tienda» (R3, condicionado) y los horarios especiales de la ficha de Google. Compartido entre tiendas del mismo centro. Degradación segura: sin calendario → solo el horario del día, sin badge.

**Valor para el franquiciado, en una frase:** «El domingo de Navidad tu web y tu Google dicen lo mismo que tu persiana — que hoy no pasa en 4 de 8 tiendas.»

**Cómo se demuestra:** `ver_horario` y el Semáforo en verde en diciembre; la comparación web/ficha/directorio del centro en fechas señaladas.

**Automatización:** semiautomatico · ~1 h/centro/año ≈ 0,08 h/mes, compartida entre tiendas del mismo centro · desatendible 10 días: sí
- Cómo: Un JSON por centro (47 centros para 58 tiendas), revisado a mano una vez al año desde el calendario que publica cada centro; `parseHorario` ya existe; el badge se calcula en cliente sin terceros. El informe de septiembre lleva la «petición» de cargar octubre.
- Qué hay que construir: Esquema `holidays/<centro>.json` + resolución en `horario.ts` + badge condicionado (1 día). El scraping permanente de directorios está descartado (14).

**Depende de:** Horario v2 con excepciones en el esquema · Fecha de carga: octubre, o diciembre arruina 20 Navidades a la vez

**Riesgos:** El día que el badge miente, alguien se desplaza a una persiana bajada (descarte razonado de memory/06 §5): por eso el badge no existe sin calendario cargado. Los centros a pie de calle (11) no tienen «centro»: su calendario es el de la tienda.

### módulo mensual

#### Ficha de Google gestionada  ·  `ya-catalogado`

**Qué es:** 2-4 publicaciones/mes distribuidas desde la misma pieza de flota (campaña + consejo del experto) con fechas escalonadas, fotos, Q&A, Productos, festivos cargados con un año de antelación, y revisión mensual de ediciones de terceros dentro del informe (no como alerta).

**Valor para el franquiciado, en una frase:** «Tu ficha de Google, la que sale en el mapa, viva todos los meses con lo mismo que tu web — sin que abras el panel jamás.»

**Cómo se demuestra:** Historial de publicaciones en la ficha + el bloque «ediciones de terceros» del informe + `contacto_maps` y llamadas desde ficha (GBP Insights).

**Automatización:** automatico · 0,20 h con API · 0,55 h a mano · desatendible 10 días: sí
- Cómo: Solo con API: cliente OAuth contra Business Profile API con token de grupo de agencia + el distribuidor 1→N con escalonado de fechas. Sin API: a mano o con herramienta comprada (0,55 h) — y entonces el módulo casi no se vende.
- Qué hay que construir: Nada antes de la Semana 0 (8 emails pidiendo invitación de gestor; si llegan ≥5 se construye contra la API en ~2 semanas; si ≤3 no existe).

**Depende de:** Semana 0 (≥5 invitaciones de 8) · Aprobación del proyecto GCP para la API · Distribuidor 1→N · holidays/<centro>.json

**Riesgos:** Un solo proyecto GCP gestionando 58 fichas de 58 sociedades: una suspensión apaga 58 empresas a la vez. Y el argumento «las publicaciones caducan a los 7 días» es FALSO desde 2021 — corregido, no volver a usarlo.

### módulo mensual (lineal, con tramos)

#### Respuesta a reseñas — lote semanal con tope  ·  `ya-catalogado`

**Qué es:** Borrador generado, revisión y edición humana una a una, publicación en lote UNA vez por semana, aviso al franquiciado solo cuando la reseña describe un incidente que solo él resuelve. Tope de volumen escrito por tramos; 4 semanas de blackout al año.

**Valor para el franquiciado, en una frase:** «Cada reseña contestada con nombre y sin plantilla — la mitad de la gente descarta al que contesta en serie — y tú solo te enteras de las que te tocan a ti.»

**Cómo se demuestra:** Ratio reseñas respondidas/recibidas en el informe; capturas de respuestas.

**Automatización:** semiautomatico · 0,33 h con 8 reseñas/mes (2,5 min/reseña reales); crece con las reseñas, no con las tiendas · desatendible 10 días: sí
- Cómo: Pub/Sub `NEW_REVIEW` → cola de borradores → pantalla de aprobación (no una aplicación) → `reviews.updateReply`. Automatizar el ENVÍO destruye el producto.
- Qué hay que construir: Solo tras Semana 0 y paso 5: cola + pantalla (dentro de las 2 semanas de GBP API).

**Depende de:** GBP API · Contar las reseñas reales de las 8 fichas (una tarde, no está medido)

**Riesgos:** Es el servicio que rompe el techo primero, y no por tiendas sino por reseñas: si el resto del catálogo funciona y pasan de 8 a 20/mes, 17 tiendas suscritas pasan de 5,7 a 14 h/mes sin un euro más. El tope por tramos es lo que impide que el éxito mate al proveedor. Pasa el filtro de 10 días POR CONTRATO (blackout), no por construcción.

### módulo mensual (contenido de flota 1→N)

#### Serie del experto — contenido de marca gestionado (canal de WhatsApp + consejo del mes + novedades de marca)  ·  `nuevo`

**Qué es:** UNA pieza mensual a nivel de flota, revisada con la política YMYL (Reglamento UE 1924/2006; jamás «nutricionista» sin título; nada a menores), con tres salidas: el texto+imagen para el Canal de WhatsApp de cada tienda, el «consejo del mes» en la web, y la novedad de marca del mes (3-4 productos del catálogo de usafitness.es [V] con foto recomprimida ≤40 KB). Fusible evergreen: si el mes viene vacío, la web muestra la pieza perenne y el canal no manda nada. Repara el punto ciego del canal de WhatsApp aprobado: sin plan de contenido muere en 3 semanas.

**Valor para el franquiciado, en una frase:** «Tu canal de WhatsApp y tu web tienen algo nuevo cada mes firmado por el equipo de la marca, y a ti te llega listo para reenviar.»

**Cómo se demuestra:** `unirse_canal` (evento nuevo) y la pieza publicada; el número de suscriptores del canal lo ve el franquiciado en su WhatsApp.

**Automatización:** semiautomatico · 3 h/mes de flota ÷ N (a 20 tiendas 0,15 h; a 58 0,05 h) + 0 por tienda · desatendible 10 días: sí
- Cómo: Fichero `flota/piezas/<yyyy-mm>.json` (misma maquinaria que la campaña) con `vigencia` y `evergreen: true/false`; el distribuidor lo pinta en N webs y genera el texto del canal que se envía a los franquiciados el día 1 (o se publica si tenemos acceso al canal). Buffer de 1 mes escrito por adelantado.
- Qué hay que construir: Distribuidor 1→N (esquema de pieza + resolución por fecha + salida «texto para canal»; 1-2 días encima de la maquinaria de oferta) + bloque «Únete al canal» con el enlace por tienda (medio día).

**Depende de:** Enlace del canal de WhatsApp por tienda (lo crea el franquiciado, se recoge en el alta) · OK de la central: imagen/credenciales del equipo (si la pieza va firmada con foto) · Título de Amanda Gil documentado (si firma la ruta Mujer) · Quién publica en el canal — pregunta abierta

**Riesgos:** Traslada el cuello de botella de horas-por-tienda a DISCIPLINA del operador: una sola fecha al mes. Si falla, el fusible evita mentir pero el informe dice «nada nuevo» (churn). Y el canal es unidireccional: no abre DMs de precio y stock como Instagram — esa es la razón por la que entra donde Instagram no (descarte 2).

### módulo mensual (opt-in del franquiciado) · fallback automático a novedades de marca

#### Novedades del mes por tienda (dato del franquiciado, con fallback)  ·  `redefinido`

**Qué es:** «Lo nuevo en la estantería»: 3-4 productos que acaban de llegar, con foto móvil + nombre que envía el franquiciado por formulario. Si no envía nada, la sección muestra las novedades de marca de la serie del experto (nunca vacía, nunca vieja: cada novedad lleva fecha y caduca a 45 días).

**Valor para el franquiciado, en una frase:** «Si me mandas una foto de lo que llegó, tu web lo enseña mañana; si no, enseña lo nuevo de la marca — pero nunca lo del mes pasado.»

**Cómo se demuestra:** `ver_productos{novedades}` y, con Apártamelo activo, `pedir_reserva{seccion:novedades}`.

**Automatización:** automatico · 0 si no manda nada · 0,1 h si manda (procesar foto) · desatendible 10 días: sí
- Cómo: Misma maquinaria de despublicación por fecha; la foto pasa por el pipeline de imágenes; la entrada del franquiciado consume 1 de sus 2 cambios/mes (o no, según decida el dueño).
- Qué hay que construir: Nada nuevo si existen distribuidor + despublicación: es un tipo de pieza más.

**Depende de:** Distribuidor 1→N · Pipeline de fotos

**Riesgos:** Es exactamente el patrón que enterró el «kit de Instagram» (Las Rosas 460 días sin publicar): por eso NO se vende como compromiso del franquiciado ni se mide «piezas entregadas vs publicadas» — se vende el fallback y el opt-in es un regalo, no una obligación cuyo incumplimiento demuestra el informe.

### módulo mensual (solo dentro del servicio pagado)

#### El muro que no se pudre (fotos con contrato de degradación)  ·  `redefinido`

**Qué es:** Cada foto lleva fecha; a partir de N meses la galería la degrada (deja de ser destacada, luego sale) y el informe pide «3 fotos nuevas» cuando quedan pocas frescas. Diseñada para el olvido humano: la web no envejece aunque nadie haga nada.

**Valor para el franquiciado, en una frase:** «Tu web nunca enseña la estantería de hace dos años; y cuando toque, te lo pido yo con un mes de margen.»

**Cómo se demuestra:** Edad media de las fotos publicadas en el informe; cero fotos de más de X meses en producción.

**Automatización:** automatico · ~0,05 h (procesar las fotos que lleguen) · desatendible 10 días: sí
- Cómo: Metadato `fecha` por foto (del EXIF o del alta) → `galeria.ts` ordena y filtra por edad en build; la «petición» sale sola en el informe.
- Qué hay que construir: Campo de fecha en las rutas de galería + regla en `galeria.ts` (medio día).

**Depende de:** Pipeline de fotos con guion · Informe con sección «peticiones»

**Riesgos:** Una tienda que no manda fotos acaba con galería mínima: degradación visible pero honesta; hay que fijar el suelo (nunca menos de 3 fotos) para que la sección no muera en la peor tienda.

### módulo de flota (contenido de marca escrito una vez, revisado trimestralmente)

#### Rutas del asesor como contenido gestionado («Empieza aquí», ruta Mujer, ruta /regalo estacional)  ·  `nuevo`

**Qué es:** Los 6-8 árboles de «Empieza aquí» (3 toques → ruta sobre las 137 categorías reales, sin productos ni precios ni promesas de salud), la ruta «Mujer» (557 de 1.683 productos son de esa categoría y la web ni la menciona [V]) firmada por Amanda Gil solo con título verificado, y la ruta /regalo activada por fecha en nov-ene. Todo vive en el navegador del visitante; el resultado viaja en el `wa.me` prellenado.

**Valor para el franquiciado, en una frase:** «Tu WhatsApp te llega con el diagnóstico del cliente ya hecho — y la señal de qué busca la gente en TU tienda, que ni la central tiene.»

**Cómo se demuestra:** `punto_de_partida{ruta}` por tienda en el informe (la señal de demanda); `contacto_whatsapp{origen:empieza_aqui}`.

**Automatización:** automatico · 0 por tienda · ~2 h/trimestre de flota · desatendible 10 días: sí
- Cómo: Árboles como dato validado por Zod en build, JS inline ~3 KB; la ruta estacional se enciende/apaga por fecha con la misma maquinaria de despublicación; revisión trimestral a nivel de flota, cero por tienda.
- Qué hay que construir: Sección interactiva (F2/F3 bajo método) + esquema de rutas + registro de eventos P6/P8.

**Depende de:** Puerta del dueño sobre el contenido de las rutas (redactadas CON el equipo) · Título de Amanda documentado + permiso de imagen (gate duro de la ruta Mujer) · YMYL: solo categorías y lenguaje de objetivo

**Riesgos:** Intrusismo (título regulado) y consejo dietético: la calculadora de proteína murió por eso; una ruta que recomiende dosis o dieta la mata igual. Si cae la puerta de la central, la firma degrada a marca sin foto — la pieza sigue viva.

### alta única (activación por flag)

#### Apártamelo — reserva por WhatsApp  ·  `redefinido`

**Qué es:** Botón en Oferta y Novedades: «Apártamelo — lo recojo hoy» → `wa.me` prellenado con el producto. Click&collect real con un href: sin ecommerce, sin pago, sin stock, sin backend. Gate por móvil verificado; sin él no se pinta.

**Valor para el franquiciado, en una frase:** «Tu web pasa de folleto a canal de pedidos: X apartados este mes, todos en tu WhatsApp.»

**Cómo se demuestra:** `pedir_reserva{seccion,producto}` en el informe + los mensajes en el WhatsApp del franquiciado.

**Automatización:** automatico · 0 · desatendible 10 días: sí
- Cómo: Flag en la entrada de la tienda; el mensaje prellenado se compone en SSR desde la pieza (oferta/novedad) vigente. Cero recurrente.
- Qué hay que construir: Componente + flag + evento (medio día dentro de F2).

**Depende de:** Móvil real de WhatsApp verificado en la sesión de alta (hoy 1 de 8; 4 fijos) · Oferta/novedad viva

**Riesgos:** Si la tienda no tiene el producto, la promesa la rompe el franquiciado en su propio WhatsApp, no nosotros: el botón dice «apártamelo», nunca «reservado». No compite con el ecommerce de la central: no hay pago ni envío.

#### Pre-alta de socio → WhatsApp del franquiciado  ·  `ya-catalogado`

**Qué es:** Desde «Hazte socio»: botón «quiero ser socio» → `wa.me` prellenado («Hola, quiero hacerme socio en <tienda>») — el lead llega al WhatsApp del franquiciado, sin formulario ni base de datos nuestra. Versión v1 de N3 que convierte a visita, no a formulario (R8).

**Valor para el franquiciado, en una frase:** «El programa de socio no está explicado en ningún sitio — en tu web sí, y el que lo quiere te escribe a ti.»

**Cómo se demuestra:** `interes_socio` + `contacto_whatsapp{origen:socio}` en el informe; cero menciones al programa en usafitness.es [V] como prueba del hueco.

**Automatización:** automatico · 0 · desatendible 10 días: sí
- Cómo: Flag + `wa.me`; sin datos personales tocados por nosotros. Cero recurrente.
- Qué hay que construir: Nada aparte de la sección «Hazte socio» de F1 (lista salvo dato: beneficios completos del socio, bloqueado en la central).

**Depende de:** Móvil real de WhatsApp · Beneficios del socio por escrito (sin ellos, versión sin cifras: «alta en 2 minutos en caja»)

**Riesgos:** El formulario clásico (con datos) queda para fase posterior y solo con `company` completo: convierte al franquiciado en responsable del tratamiento (AEPD). El hueco del socio es foso por inacción de la central (riesgo #13).

### alta única (activación) · opcional

#### La tarjeta que vuelve (cupón de próxima visita, N8)  ·  `redefinido`

**Qué es:** Cupón de próxima visita anclado a economía real (el bote se acaba en 30-45 días), con fecha de validez y código de tienda, canje físico contable en caja. La primera métrica que une clic con caja — si el franquiciado cuenta canjes.

**Valor para el franquiciado, en una frase:** «El cliente que ya te compró, de vuelta antes de que se le acabe el bote — y dimensionado como cortesía, no como descuento que te duela.»

**Cómo se demuestra:** `cupon_vuelta{origen}` en el informe + el número de canjes que el franquiciado reporte (campo opcional en la respuesta al informe).

**Automatización:** automatico · 0 · desatendible 10 días: sí
- Cómo: Cupón generado en SSR con validez por fecha (misma maquinaria de despublicación); el beneficio lo define el franquiciado en el alta.
- Qué hay que construir: Componente cupón + flag (medio día).

**Depende de:** Beneficio definido por el franquiciado como cortesía (anti-fraude) · Voluntad de contar canjes en caja (pregunta abierta)

**Riesgos:** Sin conteo en caja, N8 es solo un clic más: la métrica «clic→caja» depende del 57% de no-respuesta del franquiciado. Se vende el cupón; el cierre del bucle se ofrece, no se promete.

### alta única (activación por firma)

#### Las verdades del mostrador (pacto anti-venta firmado)  ·  `redefinido`

**Qué es:** «Te decimos qué NO necesitas»: 5-7 compromisos en `<details>` nativo, cero JS. Solo se muestra si la central Y el franquiciado lo firman — cada compromiso es exigible en 50 mostradores. Responde P7 y a la tarjeta de menores.

**Valor para el franquiciado, en una frase:** «La única tienda del sector que te dice qué no comprar — y eso es lo que te diferencia de Amazon.»

**Cómo se demuestra:** `verdad_abierta{cual}` en el informe; el flag `verdadesFirmadas` por tienda.

**Automatización:** automatico · 0 · desatendible 10 días: sí
- Cómo: Contenido de marca escrito una vez; flag por tienda recogido en la sesión de alta. Cero recurrente.
- Qué hay que construir: Componente + flag (medio día).

**Depende de:** Firma de la central sobre el texto · Firma del franquiciado en el alta

**Riesgos:** Un compromiso publicado e incumplido en el mostrador es una reseña negativa con prueba: por eso no se muestra sin firma. Es la pieza más dependiente de la central de toda la ronda 2.

### encargo / piloto en 2 tiendas

#### /mostrador — la web como herramienta durante la venta (pantalla-pase, catálogo del asesor)  ·  `redefinido`

**Qué es:** Ruta noindex, sin GA4, pensada para la tablet o el móvil del dependiente: alta de socio en 2 minutos explicada, rutas del asesor para enseñar al cliente, oferta vigente y cupón para escanear, verdades del mostrador. Objetivo interno; el éxito se evalúa preguntando.

**Valor para el franquiciado, en una frase:** «Tu dependiente enseña en la pantalla lo mismo que tu web promete — y el cliente sale con el vale en su móvil.»

**Cómo se demuestra:** No se mide (sin GA4 a propósito): 2 tiendas piloto y una conversación al mes con el dependiente.

**Automatización:** automatico · 0 · 0,3 h/mes de conversación en el piloto · desatendible 10 días: sí
- Cómo: Deriva de los mismos datos y piezas que la home; una ruta más bajo `src/pages/[slug]/`. Cero recurrente.
- Qué hay que construir: La ruta (1 día) cuando existan las piezas que reutiliza.

**Depende de:** Rutas del asesor, oferta, /guia construidas · 2 tiendas piloto voluntarias

**Riesgos:** Es la pieza con menos evidencia: una hipótesis sobre el comportamiento del dependiente. Si nadie la abre en 3 meses, se retira sin coste.

### encargo por pieza · o consume 1 de los 2 cambios/mes (decisión del dueño pendiente)

#### /oferta propia con cupón «enséñalo en caja» (landing de promoción con caducidad)  ·  `redefinido`

**Qué es:** Landing `/oferta` de la tienda con su oferta propia (pisa a la central), cupón visual, fecha-fin obligatoria en el esquema, despublicación automática y redirección a home sin oferta viva. Destino de la bio de Instagram, del QR del escaparate y del canal de WhatsApp. Fusiona la «landing de promoción» de memory/15 y la «oferta flash» de la investigación.

**Valor para el franquiciado, en una frase:** «Tu promoción del fin de semana, en una página con tu cupón, que se apaga sola el lunes — y sabes cuánta gente la vio.»

**Cómo se demuestra:** `ver_oferta{origen:propia}` y `utm_source` por canal en el informe; cupones en caja.

**Automatización:** automatico · 0 recurrente · 0,3 h por pieza · desatendible 10 días: sí
- Cómo: Es una pieza más de la maquinaria de oferta con `origen: propia` y `tienda: <slug>`; el operador la carga (5 días laborables declarados) y se despublica sola: un entregable que caduca sin tocarlo no persigue a nadie en agosto.
- Qué hay que construir: Nada aparte de la maquinaria de oferta/despublicación; la landing `/oferta` es de F1.

**Depende de:** Maquinaria de oferta con fecha-fin · Cola de peticiones con plazo

**Riesgos:** Una oferta propia con precio choca con «precios no visibles»: se expresa en ventaja. El franquiciado que pide una oferta «para hoy» pide el descarte 6 (aviso el mismo día): el plazo declarado se defiende o el negocio no llega a la tienda 15.

### encargo por pieza

#### Sección nueva a la carta (FAQ local, Por qué en tienda, Centro, Aviso con fecha-fin)  ·  `ya-catalogado`

**Qué es:** Secciones del registro `SECTION_IDS` que una tienda añade como string en su array: FAQ local (4-6 preguntas reales: parking, devoluciones, Bizum, encargos — fuente directa: las FAQ de la guía de la central [V]), «centro» (planta, local, parking, transporte — se rellena copiando del directorio sin que el franquiciado conteste), «aviso» con fecha-fin obligatoria. Regla de admisión: si exige refresco más de una vez al año, no se construye.

**Valor para el franquiciado, en una frase:** «Las preguntas que te hacen por teléfono cada semana, respondidas antes de que llamen — y la gente las busca literalmente en Google.»

**Cómo se demuestra:** Queries de GSC que contienen la pregunta literal; secciones visibles en su dominio.

**Automatización:** automatico · 0 · 0,2 h por activación · desatendible 10 días: sí
- Cómo: Componentes construidos una vez (capa 0 ya garantiza que una sección nueva no se cae en silencio: `resolveSections` corregido en PR #23); añadir = un string. El aviso se despublica por fecha.
- Qué hay que construir: Los componentes bajo método (F1/F2); media semana para todos.

**Depende de:** F1 bajo método · Datos de 1-2 campos por tienda (parking) recogidos en el alta

**Riesgos:** Contenido local replicado a 58 dominios es scaled content abuse (descarte 11): la FAQ es de marca con 1-2 datos locales, no páginas de ciudad.

### alta única (enlace) · el contenido es la serie del experto

#### Canal de WhatsApp de la tienda (bloque «Únete al canal»)  ·  `ya-catalogado`

**Qué es:** Bloque en la web con el enlace al Canal de WhatsApp de la tienda (difusión unidireccional): unirse lo hace el usuario en SU WhatsApp — no captamos ni un dato (la joya RGPD del inventario §C). 91% de uso de WhatsApp en España [V].

**Valor para el franquiciado, en una frase:** «Tu propia lista de difusión sin ley de protección de datos que gestionar: la gente se apunta sola y tú mandas la novedad cuando quieras — o la que yo te preparo cada mes.»

**Cómo se demuestra:** `unirse_canal` (evento nuevo a registrar) y el contador de suscriptores que ve el franquiciado.

**Automatización:** automatico · 0 (el contenido va en la serie del experto) · desatendible 10 días: sí
- Cómo: Campo `whatsappChannel` en el esquema; el bloque se pinta solo si existe.
- Qué hay que construir: Campo + bloque (medio día) + evento.

**Depende de:** El franquiciado crea el canal (2 minutos en su móvil) — se hace en la sesión de alta

**Riesgos:** Un canal sin contenido en 3 semanas parece abandonado: por eso no se vende sin la serie del experto o sin el compromiso explícito del franquiciado de publicar él.

### central (se pide, no se vende)

#### Backlink por tienda desde el directorio de la central + bendición  ·  `ya-catalogado`

**Qué es:** Cada una de las 58 fichas CMS de usafitness.es (`/contentido/-usafitness-{slug}`) enlaza a la landing de su tienda; y un correo/mención de la central a los franquiciados presentando el servicio como compatible con el ANEXO de Integración Digital. Modelo b: la central bendice y abre la puerta, no contrata.

**Valor para el franquiciado, en una frase:** «Tu página oficial en la web de la marca apunta a TU web — y la marca sabe que existe.»

**Cómo se demuestra:** 58 enlaces salientes verificables; GSC muestra el referral.

**Automatización:** manual · 0 · 2-3 h una vez para toda la red · desatendible 10 días: sí
- Cómo: Una conversación del operador con la central (canal directo, riesgo op. #9); lista de 58 URLs → 58 destinos generada desde `stores.json`.
- Qué hay que construir: Nada: un CSV exportado del JSON.

**Depende de:** Relación con la central · Que la landing exista (las 8 hoy; cada alta al entregarse)

**Riesgos:** Una sola relación abre o cierra el acceso a las 58 tiendas y está mezclada con una amistad (riesgo #9, aceptado). Pedir demasiado en un viaje quema el favor: un solo viaje con la lista completa (ver para_la_central).

### central (regalo estratégico, no venta)

#### Panel de coherencia de la marca + señal de demanda agregada (para la central)  ·  `nuevo`

**Qué es:** El Semáforo NAP agregado de las tiendas servidas («N versiones distintas del teléfono y horario de TU marca», ya medido) y la señal de demanda anónima por región desde `punto_de_partida{ruta}` y `ver_oferta{campaña}` — datos que la central no tiene porque no publica ofertas ni programa de socio. Entregado gratis como informe trimestral: es lo que hace que la central bendiga y lo que convierte al operador en el departamento digital de facto sin depender de que compre.

**Valor para el franquiciado, en una frase:** (indirecto) «La marca ve que tu tienda es de las que tienen los datos bien y de las que la gente busca.»

**Cómo se demuestra:** El informe agregado (Semáforo + rutas por zona); las discrepancias hoy medidas en 8 tiendas extrapoladas a 58.

**Automatización:** automatico · 0 · 1 h/trimestre de flota · desatendible 10 días: sí
- Cómo: Agregación del mismo `informe.mjs` sin identificadores personales (los eventos ya no llevan datos personales); trimestral, en lote.
- Qué hay que construir: Una plantilla más de `informe.mjs` (medio día) cuando existan ≥10 tiendas.

**Depende de:** informe.mjs · ≥10 tiendas para que la agregación diga algo · Conflicto de interés declarado por escrito entre tiendas de la misma ciudad

**Riesgos:** Quien recibe datos agregados puede querer comprarlos centralizado — y quien compra centralizado interioriza o saca a concurso (riesgo #3 de memory/15 §7). La defensa sigue siendo dominios y GA4/GSC a nombre de cada franquiciado, motor a nombre del operador. Y con 3 tiendas en Madrid, enseñar demanda por zona a la central puede pisar a un cliente: solo por región, nunca por tienda.

## Lo nuevo que memory/15 no tenía

- Vídeo-tour alojado en la web de la tienda (el que la central ya obliga a grabar; gate: OK central; póster + clic-para-reproducir; evento `ver_video` a registrar) — hoy GranCasa ya sirve uno de 2,25 MB sin enlazar (A6)
- El informe mensual como pieza de RETENCIÓN con «peticiones» dentro (fotos que envejecen, canjes en caja, festivos de octubre) y como EVIDENCIA de venta para los 8 pilotos — memory/15 lo trata solo como prueba de vida
- Serie del experto / contenido de marca gestionado 1→N (canal de WhatsApp + consejo del mes + novedades de marca) con fusible evergreen — el módulo que da al informe algo que contar aunque la tienda no haga nada
- Rutas del asesor como contenido de flota (Empieza aquí, ruta Mujer con gate de título, /regalo estacional por fecha) y la señal de demanda por tienda `punto_de_partida{ruta}` que ni la central tiene
- Paquete de fotos con guion de 8 planos para el dependiente + reglas de curación (A4) — sustituye al «paquete de fotos por horas»
- Placa de la tienda (cifras SSR que envejecen solas; campo `apertura` en el alta)
- Capa nocturna como infraestructura de las 5 plantillas (D4 retirada como dirección)
- Kit físico de tienda unificado: QR de reseñas (mostrador + bolsa) + QR del escaparate evergreen con utm — y el campo `placeId` que exige el formulario de reseña (verificado 27-ago: CID no sirve)
- Calendario de festivos del centro como servicio con fecha de carga (octubre) que alimenta web, badge «abierto/cierra en X» y horarios especiales de la ficha a la vez
- Novedades del mes por tienda con FALLBACK automático a novedades de marca (evita el patrón que enterró el kit de Instagram)
- Muro que no se pudre (fotos con fecha y degradación automática) dentro del servicio pagado
- /mostrador como piloto en 2 tiendas (objetivo interno, sin GA4)
- Panel de coherencia de marca + señal de demanda agregada por región como regalo estratégico a la central (modelo b: bendice, no compra)
- Cola de peticiones con acuse automático y plazo declarado (formulario/email → issue) como pieza del producto, no como letra pequeña: es lo que hace el filtro de 10 días habitable
- Demo pre-construida con caducidad (noindex + borrado a 30 días si no firma) como subproducto de `nueva-tienda.mjs investigar`

## Descartes confirmados

- Google Ads y Meta Ads en cualquier nivel (2,5 h/tienda/mes irreducibles; prerrequisitos al 0%; gasta dinero ajeno a diario; suma cero entre 3 tiendas de Madrid) — memory/15 §3.1, sin argumento nuevo
- Instagram en sus tres versiones (gestión, kit, réplica) — Las Rosas 460 días sin publicar, GranCasa 2 seguidores; abre DMs de stock y precio en fin de semana. El Canal de WhatsApp entra precisamente porque es unidireccional y no captamos datos
- Respuesta a reseñas con SLA de 48 h — sobrevive solo el lote semanal con tope y blackout
- Pack «tú no tocas nada» a cuota plana con módulo lineal dentro (78 h/mes a 58 tiendas)
- Cambios de contenido ilimitados o «razonables»; avisos operativos del mismo día («hoy cerramos a las 18:00»)
- WhatsApp como canal de soporte del operador (sin bandeja, cola ni horario): peticiones por formulario/email con plazo declarado
- Guardia técnica cobrada por tienda (es coste de flota: vigilar 58 cuesta lo mismo que 7)
- Recogida de datos legales por email/formulario (57% de no-respuesta medida) y cobro por transferencia mensual (SEPA o no hay servicio)
- Contenido local por plantilla replicado a 58 dominios, blog de nutrición, páginas de ciudad (scaled content abuse; AI Overview 92% en informacional)
- Avatares, actores de IA y testimonios sintéticos; petición de reseñas por SMS/WhatsApp, tablet de mostrador, incentivos y cualquier review gating
- Fetcher permanente del directorio del centro comercial (scraping ajeno que falla en silencio) — revisión manual anual dentro del alta
- CMS o panel para que el franquiciado edite (devuelve al cliente el trabajo que constituye el producto); tercera plantilla FUERA del método (las 5 de F3 sí, bajo método)
- El argumento «las publicaciones de Google caducan a los 7 días» (falso desde 2021)
- Inventario local en Merchant Center hasta tener respuesta sobre TPV común (pregunta a la central)
- Venta online/carrito (canal de la central), chat en vivo de terceros, app/puntos digitales (inventario §D)
- Suscripción por email a novedades y aviso de cumpleaños: APLAZADOS, no muertos — RGPD pleno (franquiciado responsable, capa AEPD, doble opt-in) y solo con `company` completo (hoy 3 de 8); el canal de WhatsApp los sustituye mientras
- Pop-up de entrada e interstitials en móvil (R7, penalización Google 2017 vigente [V]); exit-intent en v1 (no existe cursor en móvil)
- Calculadora de proteína y reto del mes con racha (ronda 2: consejo dietético con menores; gimmick con calendario)
- NUEVO descarte de este mapa: vinilo de escaparate que dice LA oferta concreta como pieza recurrente (se convierte en consumible mensual que persigue al operador) — el vinilo es evergreen y la oferta vive en /oferta con fecha-fin; el cartel A4 de campaña, si acaso, como encargo
- NUEVO descarte: novedades por tienda como COMPROMISO del franquiciado medido en el informe («entregadas vs publicadas») — mismo patrón que enterró el kit de Instagram; solo como opt-in con fallback automático a novedades de marca
- NUEVO descarte: vídeo-tour en autoplay, en 4K tal cual o alojado en YouTube/Vimeo (rompe presupuesto y cero terceros); solo póster + clic + recomprimido en origen propio
- NUEVO descarte: cita online con calendario/confirmación (backend + promesa que el franquiciado no contesta) — la «cita» es un `wa.me` con franja propuesta desde el horario real, y solo con móvil verificado

## La maquinaria común (automatización transversal)
Diez piezas de maquinaria sirven a todo el catálogo; ninguna es «de un servicio». (1) `nueva-tienda.mjs` (plan de alta: investigar → expediente → aplicar, con extractor de ficha anclado a la estructura nombre+dirección+coords+CID y rechazo por CP≠provincia): produce la demo pre-construida, la auditoría gratuita, el Alta Express, la plantilla NAP de la Entidad IA, el QR (con `placeId`), la placa (`apertura`) y cierra con `npm run flota`. Es la pieza central del modelo b: baja el alta de 4-6 h a ≤3 h, o sea 150-250 h sobre 51 tiendas — más que cualquier optimización del recurrente. (2) Semáforo NAP (`verificar-nap.ts` en CI, v1 contra snapshot manual): es la auditoría que abre conversaciones, el componente de la Base, el QA de la ficha gestionada y de la Entidad IA, y agregado, el panel de coherencia para la central. 0,03 h/tienda. (3) DESPUBLICACIÓN POR FECHA: un solo mecanismo — `fechaFin` obligatoria en el esquema y resolución en SSR de «qué está vigente HOY» — hace que caduquen solos la campaña central, la oferta propia, /oferta, el cupón de vuelta, el vale de orientación, la ruta /regalo, la sección aviso, las novedades (45 días) y las fotos del muro. Es lo que convierte «desatendible 10 días» de promesa en propiedad: si el operador desaparece, la web deja de decir cosas antes de decir mentiras. (4) DISTRIBUIDOR 1→N de contenido de marca: `flota/piezas/<yyyy-mm>.json` (tipo: oferta | consejo | novedad | ruta | verdad | faq) con vigencia y `evergreen`; cada tienda opta/pisa por campo; el mismo fichero pinta N webs, genera el texto para el canal de WhatsApp y, con API, las publicaciones de la ficha con fechas escalonadas. Convierte servicios que serían 0,5 h/tienda en 2-3 h/mes de flota ÷ N (a 20 tiendas 0,1-0,15 h; a 58, 0,03-0,05 h). (5) `informe.mjs` (GSC + GA4 Data API → HTML de 1 página, cron mensual, en lote): prueba de vida de la Base, pieza de retención con «peticiones» automáticas (edad de fotos, festivos sin cargar, canjes), evidencia para los 8 pilotos y, agregado, el regalo trimestral a la central. 0,10 h/tienda, de los que 0,08 son los dos párrafos a mano. (6) Registro único de eventos (guia-alta §3.4) + Consent Mode v2 bajo test: cada pieza declara su evento (R5), así el informe crece sin código nuevo por servicio; regla «mínimos medidos». (7) Guardia de flota: monitor externo fuera de Railway y Cloudflare + `vigilancia-dns.yml` diario + `npm run flota` tras cada alta/migración: 3-6 h/mes fijas para toda la red, nunca por tienda. (8) `holidays/<centro>.json`: un fichero por centro alimenta horario web, badge condicionado y horarios especiales de la ficha; carga anual en octubre avisada por el propio informe. (9) Puertas de build ya existentes (Zod strictObject, `verificar-assets`, `presupuesto.ts` con tope duro de 120 KB y aviso a 900 KB, `resolveSections` corregido en capa 0): la calidad no cuesta horas porque un dato falso o una sección caída no compila. (10) Cola de peticiones con acuse automático y plazo (formulario/email → issue): la interfaz con el cliente que hace habitable la ausencia — «recibido, plazo X días laborables» sin que nadie esté delante. Efecto en horas: el mix de memory/15 (0,75 h/tienda) sube a ~0,85-0,90 si la tienda contrata además campaña + serie del experto, pero el ingreso por tienda sube más que las horas porque casi todo lo nuevo es contenido de flota dividido por N; la única partida que no baja nunca es la interlocución (0,30 h), y por eso la cola de peticiones y el informe con «peticiones» dentro son las dos herramientas que la contienen.

## Orden de construcción (cada paso vende antes de construir el siguiente)

1. Semana 0 (coste: 8 emails + 1 viaje a la central). Pedir a las 8 tiendas la invitación de gestor a su ficha y contar cuántas llegan en 14 días (≥5 → existe la Ficha gestionada contra API; ≤3 → no existe). En paralelo, UN solo viaje a la central con la lista completa (ver para_la_central). Decide 40-60 h de trabajo y no cuesta código. VENDE: nada aún; evita construir para un usuario imaginario.
2. Paso 1 — Semáforo NAP v1 + campo `placeId` (medio día + medio día). Calcado de `verificar-assets.ts`, contra snapshot manual, en CI. VENDE el mismo día: la auditoría gratuita que abre todas las conversaciones y el QR de reseñas correcto (el formulario exige Place ID).
3. Paso 2 — `nueva-tienda.mjs` investigar/aplicar + pipeline de fotos con guion + `mall` opcional + `flota` al final (2-3 días + 1 día). VENDE: la demo pre-construida («tu web ya existe») y el Alta Express a ≤3 h; desbloquea las 11 tiendas a pie de calle. Es el paso con más horas ahorradas del plan entero (150-250 h).
4. Paso 3 — Altas GA4/GSC/monitor por el dueño (guía existente; vía API para las 50) + `informe.mjs` (2-3 días). VENDE: la Base cobrable — sin informe la cuota no tiene prueba de vida — y el primer «mira lo que la web trajo» real a los 8 pilotos, que es la evidencia del pitch a la tienda 9.
5. Paso 4 — Maquinaria de despublicación por fecha + esquema de oferta (central/propia) + sección Oferta del mes y `/oferta` de F1 bajo método (1 día de maquinaria + Loop A de la sección). VENDE: la campaña del mes gestionada (el hueco verificado de la central), la oferta propia por pieza, el cupón en caja y el QR del escaparate; y el informe pasa a tener algo que contar cada mes.
6. Paso 5 — Distribuidor 1→N (esquema de pieza de flota + salida «texto para canal») + bloque «Únete al canal» + novedades con fallback (1-2 días encima del paso 4). VENDE: la serie del experto (contenido gestionado mensual), el canal de WhatsApp con plan de contenido, y prepara las publicaciones de ficha por API sin escribir GBP todavía.
7. Paso 6 — F3: las 5 plantillas bajo método con capa nocturna de infraestructura + `/muestrario` (la fase de diseño abierta hoy; 1 día el muestrario). VENDE: «elige delante de mí» a la tienda 9 y la re-plantilla a los 8 pilotos; sube la tasa de cierre. Hasta aquí la demo enseña la clásica y vende en contra: por eso el muestrario no se ofrece antes.
8. Paso 7 — Activaciones de ronda 2 por flag, en este orden por evidencia y puerta: Placa (sin puerta) → Pre-alta socio y Apártamelo (móvil verificado) → Empieza aquí (rutas con puerta del dueño) → /guia vale (OK central PDF) → Verdades (firmas) → Tarjeta que vuelve → ruta Mujer (título documentado). Cada una es medio día y cero recurrente. VENDE: el argumento «tu web pasa de folleto a canal de pedidos/visitas con intención» y la diferenciación entre tiendas.
9. Paso 8 — `holidays/<centro>.json` + horario v2 + badge condicionado, CARGADO EN OCTUBRE (1 día + 1 h/centro). VENDE: «tu web y tu Google dicen lo mismo que tu persiana en Navidad»; alimenta la ficha gestionada.
10. Paso 9 — Vídeo-tour (componente + ffmpeg en el pipeline, 1 día) cuando llegue el OK y el fichero de la central; primer caso GranCasa (A6). VENDE: el slot de vídeo de la galería y «cómo llegar a tu puerta en vídeo».
11. Paso 10 — Solo si la Semana 0 salió bien: cliente GBP API + Pub/Sub + cola de aprobación (2 semanas). VENDE: Ficha gestionada a 0,20 h y Reseñas en lote con tope. Nunca antes del paso 5.
12. Paso 11 — /mostrador piloto en 2 tiendas (1 día) y panel agregado para la central (medio día) cuando haya ≥10 tiendas. VENDE: nada directo; retiene al dependiente como aliado y mantiene la bendición de la central.

## Para la central (modelo b: bendice, no compra)
En el modelo b la central no compra ni paga: BENDICE y abre la puerta. Lo que se le puede «vender» es, por tanto, lo que la hace quedar bien sin costarle nada, y se le pide a cambio lo que solo ella puede dar. QUÉ SE LE OFRECE (gratis, como regalo estratégico): (a) sus ofertas — que ya produce y no publica online [V] — publicadas en las N webs de tienda con fecha-fin, sin canibalizar su ecommerce (el distribuidor 1→N las toma de su canal interno al que el operador ya tiene acceso); (b) su propia guía lead magnet CUMPLIDA: la «orientación en tienda gratuita» que imprime y ninguna web honra, convertida en /guia con vale; (c) el vídeo-tour que obliga a grabar, trabajando también en la web de cada tienda; (d) un informe trimestral de coherencia de su marca (N versiones del teléfono y horario, ya medido en 8) y una señal de demanda anónima por región (`punto_de_partida{ruta}`, `ver_oferta{campaña}`) que hoy no tiene — solo por región, nunca por tienda, para no pisar a clientes de la misma ciudad; (e) compatibilidad explícita con su ANEXO de Integración Digital: la web de tienda enlaza a sus redes oficiales, no compite con ellas. QUÉ SE LE PIDE, en UN solo viaje y por escrito (cada ida quema el favor; la relación es una sola y está mezclada con una amistad, riesgo op. #9): (1) que el franquiciado puede tener dominio y web propios con la marca — antes de la tienda 10; es la única pregunta que puede invalidar el negocio entero (memory/15 §7.1); (2) backlink desde cada una de las 58 fichas del directorio a su landing; (3) OK para alojar el PDF de la guía (noindex, recomprimido) y la imagen/credenciales del equipo (Gouveia, Gil — con la cautela: Amanda es CAFAD/TAFAD/entrenadora, no nutricionista [V]); (4) el fichero editado del vídeo-tour por tienda y OK para alojarlo; (5) los beneficios completos del programa de socio por escrito y con fecha (sin ellos, la sección estrella publica la versión sin cifras); (6) su firma en «Las verdades del mostrador»; (7) la pregunta del TPV común obligatorio (si sí, Merchant Center local se integra una vez para las 58; si no, muere); (8) un correo suyo a los franquiciados presentando el servicio como compatible con el ANEXO — la bendición literal; (9) cesión de fotos/textos del catálogo de usafitness.es (Grupo Corelam, B88404306) o confirmación de que las fotos son de los fabricantes (riesgo #12). QUÉ NO SE LE OFRECE: el Pack Red como contrato centralizado (descartado por el dueño y por el riesgo #3: quien compra centralizado interioriza o saca a concurso); si algún día la central quiere pagar, la única versión que sobrevive deja dominios y GA4/GSC a nombre de cada franquiciado y el motor a nombre del operador. RIESGO QUE CONSTA: los huecos 1-2 (ofertas, socio) son fosos por inacción de la central y pueden cerrarse mañana; el argumento ya está formulado para sobrevivir («el canal DE TU tienda») y se re-verifica trimestralmente (2 URLs).

## Preguntas al dueño (no respondidas en memory/12)

1. Oferta propia: cuando un franquiciado pide su propia oferta que pisa a la central, ¿consume 1 de sus 2 cambios/mes de la Base, o entra como pieza aparte («campaña del mes gestionada»)? Decide cómo se empaqueta el servicio más vendible del mapa (pendiente en memory/15 §9 desde el 27-ago).
2. Canal de WhatsApp: ¿quién publica en el canal de cada tienda — el franquiciado, reenviando la pieza mensual que le mandamos, o el operador con acceso administrador al canal? Decide si la serie del experto se vende como «te lo entrego» (0 h por tienda) o «te lo publico» (0,1 h por tienda y un compromiso de fecha).
3. Vídeo-tour: ¿alguna de las 8 tiendas tiene ya el vídeo editado por la central en su poder? ¿Lo pides en el mismo viaje que el PDF de la guía y la imagen del equipo, o es un viaje aparte? (El de GranCasa que servimos sin enlazar, 2,25 MB, ¿es ese vídeo o una grabación propia?)
4. Tarjeta que vuelve / cupón en caja: ¿estarías dispuesto a pedir a los franquiciados UN número al mes (canjes en caja) como respuesta al informe? Sin ese número, N8 y el cupón «enséñalo en caja» miden clics, no caja — y con el 57% de no-respuesta medido, hay que decidir si se promete el cierre del bucle o solo se ofrece.
5. TPV: ¿sabes si la red tiene un TPV común obligatorio? Es la pregunta que memory/15 dejó para la central (§3.17): si sí, el inventario local en Google se integra una vez para las 58 y es el mayor desbloqueo del catálogo; si no, no se vuelve a mencionar.
6. Dominio y marca: sigue abierta desde el 26-ago la restricción de la central sobre qué puede publicar cada tienda — ¿la llevas al viaje único a la central, y aceptas que hasta tener el «sí» por escrito la tienda 10 no se da de alta? Es el único riesgo que invalida el negocio entero, y cuesta un email.

## Autocrítica del análisis

- El supuesto del que más depende todo: que el filtro «desatendible 10 días» se cumple POR CONSTRUCCIÓN. Es verdad para lo que caduca solo y para el contenido de flota con fusible, pero hay dos sitios donde solo se cumple POR CONTRATO — los 2 cambios/mes a 5 días laborables y el lote semanal de reseñas — y un tercero que no se cumple de ninguna forma: la percepción. Diez días sin respuesta a 20 tiendas, aunque nada se rompa, es un problema de confianza; el acuse automático con plazo lo mitiga, no lo elimina. He marcado `true` en esos servicios apoyándome en las 4 semanas de blackout escritas; si el dueño no quiere escribir eso en el contrato, esos dos servicios dejan de pasar el filtro.
- La parte más débil: las horas de los servicios nuevos (serie del experto 3 h/mes de flota, campaña 1-2 h, festivos 1 h/centro/año, informe 0,10) son estimaciones sin una sola medición — nadie ha producido nunca una pieza de flota ni un informe en este proyecto. Y todas las horas por tienda tratan la interlocución (0,30 h) como constante: cada servicio nuevo añade cosas que explicar, así que es probable que suba con el número de servicios contratados, no solo con la antigüedad. Si la media real es 0,45, el techo baja de 90 a 75 tiendas antes de que ningún módulo nuevo lo toque.
- El valor de las piezas de ronda 2 (Apártamelo, tarjeta que vuelve, verdades, /mostrador) es hipótesis razonada hasta que Loop C tenga datos: he escrito «valor para el franquiciado» en una frase vendible, pero ninguna de esas frases tiene aún un número detrás. La única evidencia sólida del mapa sigue siendo la de memory/15 (NAP, reseñas, hueco de ofertas y socio) — lo nuevo se apoya en ella, no la amplía.
- Riesgo que el mapa nombra pero no resuelve: casi todo el valor nuevo depende de UN viaje a la central con nueve peticiones (dominio, backlink, PDF, imagen, vídeo, beneficios, firma, TPV, bendición). Si ese viaje sale mal o se aplaza, la ronda 2 degrada a versiones sin firma ni foto (siguen vivas) pero la pregunta del dominio con marca no tiene degradación: un «no» ahí invalida la capa de alta única entera, y el mapa no tiene plan B para eso salvo diversificar fuera de la marca (gimnasios, fisios en los mismos centros), que no está en el encargo.
- No he abierto ninguna URL externa en este análisis: toda la evidencia hereda la marca [V]/[P] de los documentos del repo, y no he añadido ninguna cifra nueva. Eso significa que no he re-verificado hoy los dos huecos de la central (`prices-drop` vacío, cero menciones a «socio»), que son fosos por inacción y pueden haberse cerrado desde el 27-ago; la re-verificación trimestral que el propio norte exige sigue pendiente de hacerse por primera vez.
- Omisión consciente: no he puesto precios (aplazados por el dueño) ni he tocado los descartes de memory/15 §3 salvo con argumentos nuevos (vinilo con oferta concreta, novedades como compromiso, vídeo en autoplay, cita con calendario). Sí he dejado fuera un análisis de margen por servicio, que es lo que el dueño dijo que haría «con desglose y análisis completo»: este mapa es el insumo de horas para ese análisis, no el análisis.
