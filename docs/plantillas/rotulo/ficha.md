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
