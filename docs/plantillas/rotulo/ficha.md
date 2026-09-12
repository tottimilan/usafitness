# Ficha de «Rótulo» — el registro de cada pieza, con su Loop A

**Abierta:** 2026-09-06. Una entrada por sección construida, con su hoja de objetivos, lo que se leyó en la captura antes de compararla con el objetivo, el veredicto y los defectos nombrados. Sin esto, «no me convence» sería una opinión en vez de un registro.

**Estado de la plantilla:** andamio. `TEMPLATES.rotulo` existe con la etiqueta «Rótulo (en obras)» y las secciones `hero · socio · schedule · social` únicamente para poder VER cada pieza en su sitio mientras se construye — la metodología exige una captura por sección y sin plantilla que la hospede no hay nada que capturar. La narrativa de verdad (hero de cartel, oferta, hoy en tienda, zona móvil) llega en su rodaja. Ninguna tienda la declara.

---

## Hazte socio — ✅ PASA en la segunda vuelta (2026-09-06)

**Hoja de objetivos** (`docs/plantillas/secciones-f1/ficha.md`, hoja 1): P3 «¿qué gano yo?» · N3 → N1 · evento `interes_socio` · contenido de marca, digna en Lagoh por construcción · dato bloqueado: los beneficios completos, hasta que la central los mande por escrito.

### Vuelta 1 — NO PASA

**Test de primera mirada** (escrito antes de comparar con el objetivo):

> Un bloque azul intenso. «Hazte socio en caja» en blanco y grande. Debajo, tres líneas: el alta es en tienda, tarda dos minutos, no hay que rellenar nada. Luego una lista con filete: «Precio de socio», «Descuento funcionario»… y el aviso de cookies tapa el resto.

**Defecto que la tumba, nombrado:** la conversión queda bajo el pliegue en la primera visita. El botón estaba a 639 px del inicio de una sección de 796; con la cabecera de 70 px y el aviso de cookies abierto, el área útil son unos 540. La pregunta del checklist —«¿su N es lo más visible tras el contenido?»— se responde que no.

**Defectos menores anotados:** el título repetía «caja» y el párrafo lo repetía otra vez; el botón decía «Cómo llegar a USAFITNESS C.C LAGOH», dos líneas de marca donde tiene que ir el sitio.

### Vuelta 2 — PASA

**Qué cambió:** la acción sube justo detrás de la frase de fricción (178 px del inicio, no 639); la entrada baja de tres líneas a dos y deja de repetir «caja»; menos aire entre bloques; y el botón usa el rótulo curado.

**Medido a 375 px reales con Lagoh** (marco propio de 375: el panel escalaba la ventana a 533 y las medidas no valían):

| | Vuelta 1 | Vuelta 2 |
|---|---|---|
| Alto de la sección | 796 px | **693 px** |
| Botón, desde el inicio | 639 px | **178 px** |
| Fallos de contraste sobre el azul | — | **0 de 12 textos** |
| Desborde horizontal | 0 | 0 |

**Escritorio (1180 px):** 538 px de alto, ventajas en dos columnas de 534, sin desbordes.

**Checklist:** su N es lo primero que se ve tras la frase que quita la fricción ✅ · defendible en una frase («te dice qué ganas y cómo llegar, en la misma pantalla») ✅ · digna con los datos de Lagoh, porque no usa ninguno ✅.

### Lo que se decidió y por qué

- **Ni una cifra.** Las promos que hoy publican las ocho webs dicen «Hasta 10%», «Hasta 15%», «Hasta 20%» y «Cupón 5 € desde 49,90 €». Ninguna tiene documento de la central detrás y ya hubo que retirar un «Hasta 20% dto.» de los metadatos por eso mismo. Las cuatro ventajas están, sin cuantificar, y hay un test que impide que vuelvan a colarse.
- **Sin formulario.** R8 lo prohíbe en las tiendas sin bloque legal completo, y además la fricción real de hacerse socio es cero: se pide en caja. La conversión es una visita.
- **Filetes en vez de tarjetas.** Cuatro cajas con icono serían el trío de columnas que el catálogo de patrones dio por pasado de moda, y obligarían a inventar cuatro iconos para cuatro ideas que no son objetos.

### Lo que sigue pendiente en esta pieza

- **Las cifras**, cuando la central mande el documento. Entran con fecha y la sección se vuelve bastante más convincente de lo que es hoy: eso hay que decirlo, porque sin ellas «un precio distinto en tu compra» es tibio.
- **El evento `interes_socio`** no está instrumentado. Hoy un clic en el botón emite `contacto_maps` con `seccion: 'socio'`, que ya distingue el origen; el evento propio llega con la medición de F2.
- **`/socio` como página propia** no existe: la URL literal que se imprime es solo el dominio.
- **La voz de Rótulo** —plano azul a sangre, titular en Expanded con una palabra en cursiva— llega con la hoja CSS de la plantilla. Lo que hay aquí es la sección con la cara de siempre.

---

## Por qué en tienda — ✅ PASA en la segunda vuelta (2026-09-06)

**Hoja de objetivos** (hoja 5): P5 «¿me asesoran?» y cierre de P2 «¿y por qué no online?» · N2, contacto con intención · **exenta de evento propio, declarado**: su efecto se mide en el contacto que provoca, y un evento de scroll aquí sería decorativo.

### Vuelta 1 — NO PASA

**Test de primera mirada:**

> «Por qué venir a la tienda» en azul y en dos líneas. Debajo, tres afirmaciones también en azul y en negrita, separadas por filetes: te lo llevas hoy, te asesora una persona —con una frase entrecomillada de Nieves Rodríguez en Google— y te haces socio al momento.

**Defecto que la tumba:** el titular y las tres afirmaciones eran todos azules y en negrita. Se leían como cuatro cosas del mismo rango, y la jerarquía que hace legible la sección desaparecía. Es el trío de columnas que el diseño quería evitar, puesto en vertical.

**Menor:** el título ocupaba dos líneas de tamaño grande para decir lo que las tres afirmaciones ya dicen.

### Vuelta 2 — PASA

**Qué cambió:** el título pasa a **etiqueta** —pequeña, en mayúsculas, gris— para que el azul sea de las afirmaciones y de nadie más; y sube el contraste de tamaño entre la primera y las otras dos.

| Medido a 375 px, Villanueva | Vuelta 1 | Vuelta 2 |
|---|---|---|
| Alto de la sección | 662 px | **568 px** |
| Botón, desde el inicio | 561 px | **467 px** |
| Fallos de contraste | — | **0 de 10 textos** |
| Desborde | 0 | 0 |

Con eso la sección entera cabe sobre el aviso de cookies en la primera visita.

**Segunda mirada:** una etiqueta gris pequeña; tres afirmaciones azules de tamaños distintos separadas por filetes, la primera manda; la segunda con una frase entrecomillada firmada por Nieves Rodríguez en Google; y al final, «Pregúntanos por WhatsApp».

### La decisión que sostiene la sección

**La afirmación del medio la firma otro.** Decir «te asesora una persona» es una afirmación nuestra, así que al lado va una frase literal de una reseña de esa tienda. Y elegirla tiene una trampa que solo se ve con los datos delante: la reseña de El Arcángel **empieza hablando de la variedad de producto** y el elogio al trato viene después. Coger la primera frase por sistema habría publicado una cita que no sostiene la afirmación de al lado. `citas.ts` elige la frase más corta, **completa** y que hable del trato — nunca recorta, porque es texto firmado con nombre y apellidos que la tienda republica.

Las tres tiendas con reseñas tienen cita; las cinco sin ellas dicen el hecho operativo, que es verdad en las ocho. Nada se inventa.

**No se nombra a ningún competidor.** Nombrarlo le hace publicidad, invita a ir a mirar y pone al visitante a comparar precios, que es el terreno donde una tienda de barrio no gana. Hay un test que lo impide.

### Lagoh y escritorio, ya vistos (2026-09-06, misma sesión)

**Lagoh (sin reseñas, sin WhatsApp), 375 px:** 590 px de alto, el hecho operativo en lugar de la cita y «Llámanos y te lo contamos». Entra entera sobre el aviso de cookies. ✅

**Escritorio 1180 px:** 563 px, sin desbordes, líneas de 449-471 px (medida de lectura correcta), afirmación principal a 32 px. **Pero se lee ESTRECHA**: tres bloques cortos alineados a la izquierda dentro de un contenedor de 1200, con la mitad derecha vacía. No está roto y no llega a defecto que la tumbe —ninguna tienda usa esta plantilla—, pero está lejos de lo que el diseño de Rótulo pide para escritorio: «afirmaciones | cita» a dos columnas, con la cita sacada a la derecha.

**Decisión:** no se arregla aquí. Escribir ahora una maqueta de escritorio que la hoja de la plantilla va a sustituir sería trabajo tirado; queda como defecto nombrado para el Loop B, con el arreglo ya escrito (dos columnas, la cita a la derecha).

### Pendiente en esta pieza
- **Los expertos con nombre del brand book** (Gouveia, Gil) siguen sin usar: es una puerta del dueño abierta desde el 27-ago.

---

## Preguntas de tienda — ✅ PASA en la segunda vuelta (2026-09-06)

**Hoja de objetivos:** P1/P4 y SEO local con las preguntas literales · sin evento propio · 4-6 preguntas, primero las que dependen de dato de tienda · **pregunta sin dato: se omite entera**.

### El hallazgo que cambió la decisión antes de escribir una línea

Antes de construirla se investigaron tres frentes. Uno devolvió algo que nadie esperaba: **el resultado enriquecido de FAQ de Google dejó de mostrarse el 7 de mayo de 2026** y Google **retiró su documentación el 15 de junio de 2026** `[V, developers.google.com/search/updates]`. No queda ningún tipo de sitio elegible: ni administración, ni sanidad, ni nadie. Nuestra suposición de partida —que seguía vigente la restricción de agosto de 2023— era falsa.

Y `QAPage` no es el sustituto: su documentación **prohíbe literalmente nuestro caso**, «an FAQ page written by the site itself with no way for users to submit alternative answers», y añade «don't use QAPage markup for FAQ pages».

**Decisión: cero datos estructurados.** Y el motivo que hay que decir bien es **la futilidad, no el miedo**: nuestro texto es visible y una acción manual por datos estructurados no toca el ranking. Simplemente no serviría de nada. El porqué, con fecha y fuente, vive en el comentario de `Faq.astro`, y hay un test que falla si alguien lo reintroduce **o si borra la explicación**.

### Las cuatro preguntas, y por qué son esas

| Pregunta | De dónde sale | Tiendas |
|---|---|---|
| ¿Abrís los domingos? | `parseHorario`, con dos redacciones según si el domingo es igual al resto | 5 de 8 |
| ¿Hay que pedir cita? | Banco de textos de marca, ya sancionado | 8 de 8 |
| ¿Qué marcas tenéis? | Los ocho logos que las ocho webs ya publican | 8 de 8 |
| ¿Cómo me hago socio? | Las cuatro ventajas del banco, sin una sola cifra | 8 de 8 |

Villanueva, Marineda y GranCasa se quedan en tres, que es el mínimo. Ninguna baja de ahí.

**Lo que se quedó fuera y por qué:** «¿Dónde estáis dentro del centro?» sería la más útil y hoy es imposible — `streetAddress` empieza literalmente por `mall` en las ocho, así que la respuesta sería repetir el nombre del centro. Esto **corrige un arreglo que el propio diseño daba por bueno** (`plantillas.md:674` prometía responderla con `mall` + dirección). Parking, medios de pago, envíos y devoluciones: cero de ocho, y el dato no es nuestro. Nada de nutrición: es alegación de salud sobre un alimento. Nada de precios.

### Vuelta 1 — NO PASA

**Test de primera mirada:**

> «PREGUNTAS DE TIENDA» en gris pequeño. Cuatro preguntas en azul separadas por filetes, cada una con un «+» a la derecha. Todas cerradas.

**Defecto:** dos de las cuatro preguntas se partían en dos líneas y la retícula quedaba desigual (filas de 50 y de 72 px, con el «+» centrado en bloques de distinta altura).

### Vuelta 2 — PASA

Las dos preguntas largas se acortan, y las cortas resultan ser **mejores preguntas**: «¿Hay que pedir cita?» y «¿Cómo me hago socio?» son como las teclearía una persona, que es justo lo que una FAQ local necesita.

| Medido a 375 px, Lagoh | Vuelta 1 | Vuelta 2 |
|---|---|---|
| Alto cerrada | 378 px | **335 px** |
| Alturas de pregunta | 50, 72, 50, 72 | **50, 50, 50, 50** |
| Alto con las cuatro abiertas | — | 1.080 px |
| Fallos de contraste | — | **0 de 9 textos** |

### Dos cosas que cazaron mis propios tests

1. **El primer test era ingenuo:** buscaba la palabra «FAQPage» en el fichero y la encontraba… en el comentario que explica por qué no se usa. Un test que prohíbe su propia documentación. Ahora mira **lo que se sirve** y, además, exige que la explicación siga estando.
2. **Un fallo de verdad:** la FAQ nombraba ocho marcas por escrito y el andamio de la plantilla **no incluía los logos**, así que esa página nombraba marcas que no enseñaba. Se añadió `brands` al andamio. La regla queda fijada: la FAQ no nombra ninguna marca que no esté ya en la misma página.

### Pendiente en esta pieza

- **Riesgo anotado en memory/08:** `parseHorario` pierde el sábado si una línea nombra sábado Y domingo. Ninguna tienda lo escribe así hoy, pero la pregunta del domingo depende de ese parser.
- **Sin ver en escritorio**, como la anterior. Queda para el Loop B.
- La sección **no tiene la voz de Rótulo** todavía.

---

## Empieza aquí — ✅ PASA en la segunda vuelta (2026-09-11)

**Hoja de objetivos** (ficha de ronda 2, estrella 1): P6 «no sé por dónde empezar, y me da vergüenza preguntar» · N2, un WhatsApp precalificado → N1 · evento `punto_de_partida{ruta}` **pendiente de F2** · peor tienda: contenido de marca, digna por construcción · **dato bloqueado: el árbol de rutas se redacta con el equipo y lo firma el dueño**.

### Lo que se decidió antes de escribir una línea, y hay que revisar

El diseño traía cuatro etiquetas escritas: «GANAR MÚSCULO», «ENERGÍA Y RESISTENCIA», «CONTROL DE PESO», «EMPIEZO DE CERO». **Dos no sobrevivieron a la decisión 6 del 6-sep** y van construidas en su versión segura, a la espera de tu firma:

| Diseño | Construido | Por qué |
|---|---|---|
| ENERGÍA Y RESISTENCIA | **ENTRENO DE RESISTENCIA** | Autocontrol calificó «máxima energía» y «máximo rendimiento» de declaraciones no autorizadas `[P]`. Una modalidad de entrenamiento es un hecho sobre la persona; «energía» es un efecto sobre el cuerpo. |
| CONTROL DE PESO | **CUIDAR LA ALIMENTACIÓN** | No es una etiqueta desafortunada: «control de peso» es **literalmente** una de las categorías de declaración de salud que el Reglamento 1924/2006 nombra (art. 13.1.c). Encima de una lista de complementos, la declaración la hacemos nosotros. |

**La pérdida hay que decirla:** quien entra buscando perder peso ya no encuentra su ruta. Es coherente con el resto del sistema —el consejo se da en el mostrador— pero es una pérdida real, no un tecnicismo. **Es una de las preguntas abiertas.**

**La forma que hace segura la sección**, y que un test sostiene: la etiqueta nombra el objetivo de LA PERSONA; las líneas de debajo listan SURTIDO —categorías reales del catálogo extraído— **sin un solo conector causal**. Nunca «proteínas para ganar músculo»: «GANAR MÚSCULO» arriba, «Proteínas» abajo, y la relación la hace quien lee, que es lo que hace igualmente al entrar por la puerta.

**Sin cifras.** Los contadores del catálogo son tentadores y no cuadran: siete de esas puertas suman 2.588 sobre un catálogo de 1.683 porque «Mujer» y «Nutrición» engloban a las otras. Las cifras son de «Productos y marcas», con puertas disjuntas.

**Sin la ruta «Mujer».** Es un tercio del catálogo (557 de 1.683) y la única que el diseño quiere con voz propia: la de Amanda Gil. Esa puerta —título documentado y permiso de imagen— sigue cerrada, y una ruta «MUJER» que prometa voz y entregue una lista de estantería es peor que no tenerla.

**La de regalo SE AÑADE, no sustituye.** El diseño decía que entre el 15-nov y el 6-ene el cuarto botón pasa a «VENGO A REGALAR». Se añade como quinto: «Empiezo de cero» es la única ruta que responde literalmente la pregunta que da nombre a la sección, y quitarla en Navidad —seis semanas de tráfico de gente que no sabe de esto— es quitarla cuando más falta hace.

### Vuelta 1 — NO PASA

**Test de primera mirada** (escrito antes de comparar con el objetivo):

> «¿A qué vienes?» en azul, una línea gris que ocupa dos renglones, y cuatro cajas con borde azul de 2 px, cada una con un rótulo en mayúsculas y tres palabras en gris debajo. Al pulsar una, se pone azul entera y debajo sale un panel gris con tres estanterías, el formato y el botón.

**Defecto que la tumba:** las tres líneas del panel partían en dos renglones **las tres**, y una de ellas —«Creatina — monohidrato y kre-alkalina»— por el guion de «kre-alkalina», que se confunde con el guion largo de la propia lista. El cartel de la ruta, que es lo único nuevo que el panel aporta, quedaba ilegible.

**Menor:** la entrada «Elige una y te decimos qué mirar en la tienda» dejaba «tienda.» huérfana en un segundo renglón.

### Vuelta 2 — PASA

**Qué cambió:** el nombre de la estantería pasa a su **propia línea** y la descripción va debajo, más pequeña y en gris. Cuesta exactamente el mismo alto y deja de depender de que quepan 36 caracteres —en Android, con Roboto, no caben—. Y la entrada se acorta a una línea.

| Medido a 375 px, Lagoh | Vuelta 1 | Vuelta 2 |
|---|---|---|
| Alto cerrada | 480 px | **456 px** |
| Alto con una ruta abierta | 829 px | **796 px** |
| Líneas del panel partidas solas | 3 de 3 | **0 de 3** |
| Entrada | 2 renglones | **1 renglón** |
| Altura de los cuatro botones | 64, 64, 64, 64 | 64, 64, 64, 64 |
| Fallos de contraste | — | **0 de 46 textos** |
| Desborde horizontal | 0 | 0 |
| Del botón pulsado a la acción | — | **268 px** |

**Villanueva (con WhatsApp), 375 px:** 761 px con una ruta abierta, un `wa.me` por ruta y cada uno con su frase dentro.

**Navidad**, forzando el 20-dic en una compilación desechada: cinco rutas, 868 px abierta. Se revirtió y hoy se sirven cuatro.

### Un tercer defecto, en el mensaje que es la conversión

El WhatsApp decía **«Hola, os escribo desde la web de VILLANUEVA»**: el rótulo está hecho para un cartel, no para una frase, y dentro del texto salía gritado. Se quita el nombre de la tienda entero —el mensaje ya va a su número y a ningún otro— y se queda «**desde vuestra web**», que es la única atribución que el franquiciado va a ver sin abrir un informe. Hay un test que impide que el rótulo vuelva a colarse.

### Escritorio — arreglado a medias, y dicho

A 1180 px los cuatro botones medían **1.140 px de ancho** para llevar dos palabras cada uno: cuatro bandas vacías que no parecen botones. Se acota la lista a 560 px y la sección queda en 775 px.

Lo que sigue faltando es lo mismo que en «Por qué en tienda»: **las dos columnas de verdad**. Queda como defecto nombrado para el **Loop B de Rótulo**, para las dos a la vez y con el mismo criterio, porque la hoja de la plantilla va a sustituir cualquier maqueta de escritorio que se escriba ahora.

### Decisiones de forma, con su motivo

- **Sección, jamás una ventana.** Transparent Labs sirve este mismo patrón como interstitial; R7 lo prohíbe.
- **Un toque, no tres.** El asesor de tres toques (6-8 rutas, dos ejes) es de «Recorrido» y «Tablero», donde la ruta ES la columna vertebral. Aquí es una sección entre otras, y tres toques serían tres oportunidades de abandonar.
- **Radios, y no `<details>`.** La FAQ de esta misma página ya es un acordeón de `<details>`: dos seguidos se leen como la misma cosa dos veces. Y esto no es una lista de preguntas, es una elección.
- **Los radios se recortan, no se esconden.** Con `display:none` salen del tabulador y la sección deja de existir con teclado. Hay un test que mira el **CSS servido**, no el fuente.

### Pendiente en esta pieza

- **Las dos etiquetas de zona ámbar** esperan tu firma, y con ellas la ruta que hoy no existe (peso).
- **`punto_de_partida{ruta}`** no está instrumentado (F2), como `interes_socio` y `ver_productos`. Mientras tanto, la ruta viaja **dentro del mensaje de WhatsApp**, que es donde el franquiciado la lee sin abrir nada.
- **La ruta «Mujer»**, bloqueada por el título de Amanda.
- La sección **no tiene la voz de Rótulo** todavía: plano cian, «EMPIEZA *aquí*» con la palabra en script y el corte en espejo llegan con la hoja de la plantilla.

---

## Variante `schedule:hoy` — «Hoy en tienda» — ✅ PASA en la segunda vuelta (2026-09-11)

**Hoja de objetivos** (hoja 4 + su ampliación): **P1** —¿está abierto?, ¿a qué hora?, ¿dónde?—, que es el 54 % de por qué alguien busca una tienda · N1, la visita · sin evento propio: su efecto se mide en `contacto_maps` y `contacto_llamada` con `seccion: 'schedule'`.

**Qué cambia respecto a la sección clásica:** el dato de HOY manda y la semana pasa a un `<details>` cerrado; se dice DÓNDE (centro + lo que la dirección añada); y los dos canales dejan de ser tarjetas con icono para ser una fila de texto bajo un solo botón.

### La decisión cara: un día no cubierto NO se convierte en «cerrado»

Tres de las ocho tiendas —Villanueva, Marineda y GranCasa— no declaran el domingo. Escribir «Hoy cerrado» quedaría estupendo y **no se hace**, porque el semáforo NAP de agosto midió que **dos tiendas figuraban cerradas los domingos en Google estando abiertas**. La ausencia de una línea ya ha significado «se nos olvidó» en este mismo proyecto, y deducir de ahí un cierre manda a su casa a alguien que iba a ir.

Se dice la verdad sobre nosotros —«Hoy no figura en nuestro horario»— y se ofrece el teléfono. Una duda convertida en llamada es mejor que una certeza inventada. **El festivo del centro sí se afirma**, porque ahí el cierre lo escribió alguien en un calendario: es un dato positivo, no una ausencia.

### Vuelta 1 — NO PASA

**Test de primera mirada** (escrito antes de comparar con el objetivo):

> «HOY EN TIENDA» en gris pequeño. Debajo, en azul y grande, «Hoy, de 10:00 a 22:00.». El centro en negrita y la calle en gris. Un botón azul «Cómo llegar», «WhatsApp» subrayado a su lado, y «Llamar al 986 916 804» solo en la línea de abajo.

**Defecto que la tumba: P1 contestado a medias.** A las 23:30 la sección decía «Hoy, de 10:00 a 22:00.» y se quedaba tan ancha. Quien pregunta «¿está abierto?» tenía que hacer la cuenta él, que es justo lo que esta sección existe para evitar. Comprobado ejecutando el estado a las 08:00, 12:00, 21:30 y 23:30: las cuatro devolvían exactamente la misma frase.

**Menor:** las tres acciones a tres pesos y dos alturas — a 375 px la fila partía por el medio y dejaba «Llamar» suelto debajo.

### Vuelta 2 — PASA

**La asimetría que lo arregla gratis.** Sin calendario del centro no se puede afirmar que la tienda esté ABIERTA ahora: un festivo podría haberla cerrado. Pero sí lo contrario, porque **un festivo solo puede cerrar más, nunca abrir de más**. Así que fuera de la franja se dice «Ya hemos cerrado por hoy» o «Todavía no hemos abierto» con calendario o sin él, y dentro se calla salvo que haya calendario.

Y el botón pasa a su propia línea, con los dos enlaces de contacto en la suya.

| Medido a 375 px, Villanueva | Vuelta 1 | Vuelta 2 |
|---|---|---|
| Responde «¿está abierto ahora?» | ❌ nunca | **✅ fuera de horario, siempre** |
| Acciones | 3 pesos en 2 filas partidas | **botón + fila de contacto** |
| Alto con la semana plegada | — | 376 px |
| Alto con la semana abierta | — | 442 px |
| Fallos de contraste | — | **0 de 10 textos** |
| Desborde horizontal | 0 | 0 |

**Escritorio (1180 px):** 408 px, sin desbordes. Mismo defecto ya nombrado en «Por qué en tienda» y «Empieza aquí» —todo a la izquierda, mitad derecha vacía— y **aplazado al mismo Loop B**, porque la hoja de Rótulo va a sustituir cualquier maqueta de escritorio que se escriba ahora.

### Una frase nuestra que era falsa, corregida de paso

`faq.ts` decía que `streetAddress` «empieza literalmente por `mall` en las 8, así que la respuesta sería el propio nombre del centro otra vez». Medido: empieza por `mall` en las ocho, sí, pero **lo que sigue es una calle de verdad en 5**, y Vigo trae «(Planta 0)». La decisión de la FAQ no cambia —la PLANTA falta en 7 de 8 y con una sola tienda no se monta una pregunta—, pero el motivo estaba mal escrito y ahora dice lo que se midió.

### Pendiente en esta pieza

- **El minutero no lo ve nadie todavía**: exige calendario del centro vigente y `festivos.json` nace vacío a propósito. Es correcto, no una carencia.
- **La fusión con el mapa** que pide el diseño de Rótulo (fachada de clic-para-cargar dentro de la propia sección) es de la rodaja 3: aquí la variante hace «horario + dónde», que es lo que el desglose contrata.
- La sección **no tiene la voz de Rótulo** todavía.

---

## Variante `reviews:dato` + la píldora de reseña — ✅ PASA en la segunda vuelta (2026-09-11)

**Hoja de objetivos:** P4 «¿es de fiar?» → N1 · y la otra mitad, la **máquina de reseñas**: `pedir_resena{seccion}`, que el registro de medición tenía dado de alta sin nada que lo emitiera.

**Qué cambia:** las reseñas dejan de ser un carrusel de pestañas con JavaScript y se leen todas a la vez, con filete, como una lista de voces. Umbral de **tres**: con menos, la sección no se pinta.

### La pieza tiene dos mitades, y la segunda vive en otra sección

Seis de las ocho tiendas no llegan a tres reseñas. Poner ahí el «escribe la tuya» sería abrir un hueco para anunciar que está vacío. La píldora va a **«Hoy en tienda»**, que es la sección que ve todo el mundo y la que lee alguien que ya conoce la tienda. Va **la última** de esa sección: es una invitación, no la acción que paga el franquiciado.

Y es pasiva a propósito — la política de contribuciones de Google prohíbe incentivar reseñas.

**GranCasa no tiene ficha de Google: no se pinta ni la sección ni la píldora, y su HTML no nombra la palabra «reseña».** Nunca se anuncia el vacío.

### Vuelta 1 — NO PASA

**Test de primera mirada:**

> «LO QUE DICEN EN GOOGLE» en gris pequeño. Debajo, separadas por filetes, las reseñas completas entre comillas, con el nombre y cinco estrellas amarillas.

**Defecto que la tumba, y es de accesibilidad:** las estrellas dan **1,85 de contraste** sobre blanco y el mínimo para texto son 4,5. Tres fallos en la auditoría. Es la lección del manual de marca otra vez: `--color-stars` está pensado para un cartel, no para un glifo de 14 px.

Y al mirar el dato apareció algo mejor: **las ocho reseñas de la flota son de cinco estrellas**. Lógico, las elegimos nosotros. Así que pintar cinco glifos idénticos en todas no informa de nada y sugiere una distribución que no existe. **Se quitan**, que arregla las dos cosas a la vez. El campo sigue en `stores.json`: el día que entre una que no sea de cinco, se vuelve a decidir con ese caso delante.

**Menor:** la reseña de 369 caracteres abría la sección con once líneas seguidas de una sola persona.

### Vuelta 2 — PASA

Sin estrellas, y **de la más corta a la más larga**. No se recorta ninguna —es texto firmado con nombre y apellidos que la tienda republica, la misma regla que `citas.ts`— pero sí se ordena: con la larga arriba el ojo no entra.

| Medido a 375 px | Vuelta 1 | Vuelta 2 |
|---|---|---|
| Fallos de contraste (Alcobendas) | **3 de 11** | **0 de 11** |
| Alto (El Arcángel, 3 reseñas) | — | 635 px |
| Orden de longitudes | 369 · 161 · 184 | **90 · 107 · 161** |
| Desborde | 0 | 0 |

**La píldora, en Lagoh:** 396 px la sección entera, con el botón de visita primero, el contacto después y la invitación al final.

### Pendiente en esta pieza

- **El alto sigue siendo grande** en Alcobendas (883 px) por la reseña de 369 caracteres. No se recorta y no se descarta: es la voz de un cliente y es el contenido más valioso de la página. Queda dicho, no escondido.
- Si algún día entra una reseña que no sea de cinco estrellas, **hay que volver a decidir** si se pintan.
- La sección **no tiene la voz de Rótulo** todavía.

---

## Variante `gallery:tira` — ✅ PASA (2026-09-11)

**Hoja de objetivos:** P4 «¿cómo es por dentro?» → N1 · sin evento propio · **la única pieza de la casa que recorta fotos**, y con decisión escrita del dueño (memory/12, pregunta 7: «lo decidiste para Rótulo»).

**Qué es:** una tira horizontal con celda fija de 4:5 y `object-fit: cover`, cortada por el borde derecho. El corte es lo que dice «hay más» sin un contador ni una flecha.

### Lo que cuesta el recorte, medido antes de enseñarlo

Todo el rediseño de la galería de agosto existe porque recortar rompía las fotos de Lagoh (44 % del alto cortado). Así que aquí el número va delante:

| Celda | Recorte medio | Peor foto | Fotos con >25 % cortado |
|---|---|---|---|
| **4:5 (la del diseño)** | 28 % | **55 %** | **20 de 32** |
| 1:1 | 29 % | 44 % | 11 de 32 |
| 4:3 | 25 % | 58 % | 15 de 32 |

**Ninguna forma de celda gana**, y el motivo es estructural: la flota está partida casi a la mitad —17 apaisadas y 15 verticales—, que es exactamente lo que obligó a abandonar la celda fija en agosto. Con 4:5, las cuatro fotos de Alcobendas pierden el 55 % del ancho.

**Se construye con el 4:5 del diseño igualmente**, y el motivo es que al MIRARLO el recorte no duele: son fotos de interior, con estanterías que se repiten de lado a lado, así que lo que se pierde son los bordes y el centro aguanta. La tabla queda escrita para que la decisión se pueda revisar con el número delante en vez de con una impresión.

**Riesgo que no se puede cerrar desde aquí:** sin punto de foco por foto (`object-position`), el recorte centrado corta por donde caiga. En interiores da igual; el día que entre un retrato, no. El campo no existe y está en la misma pregunta abierta.

### El fallo que destapó una mutación

Al matar la variante para comprobar el test, **el test no cayó**. Investigado: mi mutación había quitado la declaración de `energia`, no la de Rótulo, porque las dos plantillas tenían la misma línea y sustituí la primera.

Y eso destapó algo peor que la mutación mal hecha: **`energia` declaraba `variant: 'tira'` desde antes y no hacía nada.** Su tira la construye entera su propia hoja CSS sobre el marcado clásico, con `display:contents`. Era una etiqueta decorativa — hasta que `tira` pasó a ser una variante de marcado de verdad, y entonces energía empezó a recibir celdas que su hoja no estiliza y su galería se quedó sin CSS.

Arreglado: energía deja de declarar la variante, con el motivo escrito en la plantilla, y hay **dos tests** que lo fijan — que energía conserva sus filas, y que Rótulo es la única que pide la tira de marcado.

### Medido a 375 px

| | |
|---|---|
| Alto de la sección (Alcobendas, 4 fotos) | 415 px |
| Celda | 213 × 266 px (4:5 exacto) |
| Tira: visible / total | 328 / 913 px → **asoma la siguiente, cortada** |
| Desborde de página | 0 |
| Imagen servida | variante de 600 px en celda de 213 → nítida a 3× |

### Un susto que no era

`naturalWidth` devolvía 270 px para un fichero de 600. No es un fallo: el navegador **corrige por densidad** el tamaño intrínseco cuando la imagen se elige por `srcset` con descriptor `w`. Los ficheros en disco son 400/600/900 correctos, comprobado con `sharp`. Anotado porque medir nitidez con `naturalWidth` engaña.

### Pendiente en esta pieza

- **La forma de celda es revisable** con la tabla de arriba: 1:1 baja de 20 a 11 las fotos con más de un cuarto cortado.
- **El `object-position` por foto** no existe como campo.
- La sección **no tiene la voz de Rótulo** todavía (papel duotono, cartelas).

---

## Variante `products:puertas` — ✅ PASA en la segunda vuelta (2026-09-11)

**Hoja de objetivos** (hoja 2 y su ampliación): P2 «¿qué tienen?» → N1. Es la respuesta literal a la queja del dueño sobre la web de siempre: «no veo ni productos».

### El diseño pedía una cifra por puerta. No se puede, y está medido

La tesis era «la cifra real, verificable»: «Proteínas — 199». Se verificó bajando los **conjuntos completos de fichas** de cada categoría del catálogo de la central, no solo los contadores impresos. El catálogo **no es una partición en ningún nivel**:

- **Un bote está en tres puertas a la vez.** AMIX CGT-3 declara en su ficha Aminoácidos, Creatina y Pre-entrenos, y sale en los tres listados. No es un error de archivo: el producto es las tres cosas.
- Creatina ∩ Pre-entrenos = 10 fichas, el 16 % de Creatina.
- Las ocho hijas de Nutrición suman 1.435 y su unión son 1.282.

El conjunto máximo con solape **cero** son cuatro puertas que cubren el 32 % del catálogo y dejan fuera aminoácidos y pre-entrenos. Y fundirlas tampoco vale: «Creatina y pre-entrenos — 133» sería correcto, pero **ninguna página imprime ese 133**, así que nadie puede comprobarlo con un clic — y la comprobabilidad era la tesis entera.

**Decisión: las puertas van sin número.** Es un resultado, no una renuncia: evita el error de agosto, cuando siete puertas sumaban 2.588 sobre un catálogo de 1.683.

### Una cifra que llevábamos repitiendo y era falsa

**«Mujer — 557 referencias, un tercio del catálogo» no existe.** La ruta de mujer hace un 301 a la de control de peso: ese 557 es **Control de Peso** —barritas, L-carnitina, termogénicos, salsas— y no tiene que ver con una ruta de mujer. La categoría Mujer real tiene 100 fichas y ninguna URL navegable.

El número estaba **bien copiado y mal etiquetado**, que es la peor forma de estar mal. Iba camino de imprimirse en ocho webs como cifra verificable. Corregido en `rutas.ts`, que era donde vivía.

### Lo que ninguna frase puede decir

**798 de las 1.687 fichas (47 %) llevan hoy «Fuera de stock»** en la web de la central, y desde fuera no se distingue si eso significa «no está en la estantería» o «no se envía hoy». Así que nada puede decir «en tienda», «disponibles» ni «en stock». Hay un test que lo impide.

### Vuelta 1 — NO PASA

**Test de primera mirada:**

> «LO QUE HAY EN LA ESTANTERÍA» en gris pequeño. Siete filas con filete: el nombre de la estantería en azul y debajo, en gris, tres cosas que hay dentro. Al final, un número grande y un pie explicando qué cuenta.

**Defecto que la tumba: la sección se contradecía sola.** El titular decía «la estantería» y el pie del número aclaraba «no es un recuento de la estantería». Dos ámbitos bajo un mismo rótulo, que es justo lo que el diseño prohíbe: *las cifras de la tienda y las de la cadena nunca comparten rótulo*.

### Vuelta 2 — PASA

El número lleva **su propio rótulo**, «CATÁLOGO USA FITNESS», encima. El titular gobierna las puertas y el bloque de cifra se identifica como dato de cadena.

| Medido a 375 px, Lagoh | |
|---|---|
| Alto de la sección | 755 px |
| Filas | **70 px las siete, exactas** |
| Fallos de contraste | **0 de 18 textos** |
| Números en las filas | **0** |
| Desborde | 0 |

### La cifra caduca sola

Cinco de las ocho cifras de agosto se habían movido quince días después (el catálogo 1.683→1.687, Proteínas 199→203, Aminoácidos 156→**155**, que bajó). Una cifra escrita a mano sin caducidad es una cifra falsa con retardo, así que **el componente la retira solo** pasados 120 días del extracto: ni cifra huérfana ni pie sin cifra.

### Lo que queda sin saber, y hay que preguntar

1. **Qué significa «Fuera de stock»** en la web de la central. Decide si la cifra honesta es 1.687 o la mitad.
2. **Cuál de las cinco «Creatina» es la suya.** La página de creatina sirve 63 fichas, pero otro nodo tiene Monohidrato con 32 que no aparecen ahí y son creatina de libro. Si la buena es 95, la puerta enseña dos tercios.
3. **153 fichas no cuelgan de ninguna de las dos ramas** y 108 no se alcanzan navegando.

---

# Rodaja 3 — la plantilla

## El cartel (hero `rotulo`) — ✅ PASA en la segunda vuelta (2026-09-12)

**Hoja de objetivos:** R1 —el primer viewport responde P1 sin scroll— y la tesis de la plantilla: **el tipo ES la imagen**. Lo primero que se ve no es una foto sino el nombre del sitio ocupando la pantalla.

### El tamaño de letra sale de la fuente, no de un `vw` a ojo

`scripts/avances-rotulo.py` extrae la tabla de avances del woff2 **que se sirve** —no de la familia de Google— y `rotulo.ts` la usa para calcular en SSR el tamaño de cada tienda. Sin esto haría falta JavaScript en el cliente y un salto de maquetación justo encima del titular más grande de la página.

**Una palabra por línea, y manda la más ancha.** Medir la cadena entera daba 440 px para «LAS ROSAS» cuando de verdad mide 271, porque el cartel las apila.

| Tienda | Rótulo | Líneas | px | Ancho | Corte |
|---|---|---|---|---|---|
| lagoh | LAGOH | LAGOH | 71 | 339 | — |
| lasrosas | LAS ROSAS | LAS / ROSAS | 73 | 341 | — |
| vigo | GRAN VÍA | GRAN / VÍA | 87 | 341 | — |
| marineda | MARINEDA | MARINEDA | 58 | 419 | 1,5 |
| arcangel | EL ARCÁNGEL | EL / ARCÁNGEL | 58 | 432 | 1,6 |
| grancasa | GRANCASA | GRANCASA | 58 | 443 | 1,8 |
| **villanueva** | VILLANUEVA | VILLANUEVA | 58 | 499 | **3,1** |
| **alcobendas** | ALCOBENDAS | ALCOBENDAS | 58 | 537 | **3,6** |

El diseño acepta entre 1,5 y 3 caracteres cortados. **Los dos últimos se pasan**, y son exactamente los dos que la rodaja 1a había señalado como casos límite. Es una de las preguntas abiertas del dueño, y ahora tiene los números en vez de una impresión. Los ocho quedan congelados en un test: si cambian, se ve.

### Vuelta 1 — NO PASA, por tres cosas

**Test de primera mirada:**

> Un plano cian de borde a borde con el logo en negro arriba. Debajo, el nombre en letras azules anchísimas que ocupan casi todo el ancho. Una línea con «Hoy, de 10:00 a 22:00 · C.C. Lagoh» y dos botones. El plano acaba en diagonal.

**1. El logotipo salía dos veces** en la primera pantalla: el de la cabecera clásica y el del plano, a quince píxeles de distancia.

**2. El rótulo empujaba la página entera a lo ancho.** El plano usa `align-items: flex-start`, así que el `h1` crecía hasta el texto y el `overflow: hidden` no tenía nada que recortar. **Cinco de las ocho tiendas se podían desplazar en horizontal** y el cartel salía cortado también por la izquierda.

**3. El texto del plano fallaba el contraste, y el comentario decía lo contrario.**

| Sobre el cian de marca | Contraste | |
|---|---|---|
| azul de marca (lo que puse) | **2,55** | ✖ ni para texto grande |
| blanco | 2,76 | ✖ |
| **negro** | **7,61** | ✔ |

Cinco de los seis textos del cartel suspendían. Y la hoja llevaba escrito de mi puño que «el texto del plano va en TINTA… y ahí sí cumple»: falso, y no medido. Es la lección del manual de marca por tercera vez — sus colores están pensados para rotular, no para texto.

El negro además **ya estaba en el plano**: el logotipo va en negro dentro del cian por diseño, así que el texto no añade un color, usa el que ya hay.

### Vuelta 2 — PASA

| Medido a 375 px, Alcobendas | Vuelta 1 | Vuelta 2 |
|---|---|---|
| Fallos de contraste | **5 de 6** | **0 de 6** |
| Desborde de página | 5 tiendas con scroll horizontal | **360 px sobre 375** |
| Logotipos en la primera pantalla | 2 | **1** |
| Alto del cartel | — | 420 px |
| Fuente usada | — | ArchivoExpandedBlack, 58 px |

### Lo que el cartel NO lleva, aunque el diseño lo pedía

**La línea de cifras del catálogo** («PROTEÍNAS 199 · CREATINA 62 · MUJER 557»). Las tres son impublicables: las categorías del catálogo no son disjuntas y el 557 de «Mujer» resultó ser Control de Peso. Ver `puertas.ts`.

### Una guarda nueva que sale de aquí

El contraste del plano **se calcula ahora desde los tokens de la propia hoja**, en un test puro: si alguien vuelve a poner el azul, se pone rojo sin abrir un navegador. Validado matándolo.

El desbordamiento, en cambio, **solo tiene guarda de mecanismo** —que las dos líneas de CSS sigan ahí— y está dicho en el propio test: el resultado solo se ve en un navegador, y está medido aquí.

### Pendiente en esta pieza

- **La periferia completa**: `pie-rotulo` y la `barra-2-acciones` fija. Hecho solo el `sin-logo` de la cabecera, que era el que fallaba la primera mirada.
- **La banda de papel** con `fotoInterior` en duotono, que el diseño pone bajo el plano.
- **La palabra en script** del titular, que es la otra mitad de la voz.
- **El Loop B con las cuatro capturas** y la prueba de muerte en miniatura contra Energía.
- **Escritorio sin mirar**: el panel del navegador no da una captura fiable a este tamaño (error 17), así que lo medido vale y lo visto no.
