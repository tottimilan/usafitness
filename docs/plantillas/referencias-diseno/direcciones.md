# Tres direcciones de plantilla — síntesis y puerta del dueño

**Fecha:** 2026-08-27 · **Estado:** ✋ **EN LA PUERTA DEL DUEÑO** (metodología §3: capturas → artefacto → confirmación → construcción).
**Artefacto entregado:** las tres direcciones **renderizadas** con los datos y la foto reales de Lagoh, no descritas en prosa.
**Detalle completo por dirección** (sistema, tratamiento pieza por pieza, procedencia, peor tienda, críticas): `direcciones-sintesis.json`.

---

## Cómo se produjo

Cuatro direcciones diseñadas en paralelo sobre las referencias capturadas (`notas-capturas.md`), y cada una sometida a **dos críticas independientes**: la del dueño —con sus dos rechazos literales delante— y la del sistema —trazabilidad a hojas P/N, reglas R1-R9, peor tienda, puertas cerradas, viabilidad técnica y YMYL—. 13 agentes, cero caídos. Después, una síntesis que aplica los hallazgos «mata» y «grave» en vez de enumerarlos.

## El resultado en una línea

**Se construye «Cartel» primero, pero lo primero que se toca no es el diseño: es una capa 0 invisible sin la cual cualquier dirección se publicaría con las secciones viejas y la pintura nueva.**

## Las tres que quedan

| | Tesis | Cómo trata la foto mediocre | Para quién |
|---|---|---|---|
| **D1 «Cartel»** ⭐ | El tipo es el cartel y la foto es papel | La renuncia: si no hay apaisada usable, tinta plana y el rótulo crece | Franquiciado de tráfico peatonal, Instagram activo, nunca producirá fotos buenas |
| **D2 «Escaparate»** | Nada sangra: campo gris con rectángulos enmarcados y **una** caja encendida por pantalla | La enmarca y le pone cartela: una foto con pie es documentación | El clásico que quiere «una tienda seria online» |
| **D3 «Portada»** | El sitio noble no es para la imagen, es para lo que se dice en el mostrador | La asciende a lámina con passe-partout y pie fechado | Boutique. La casa natural de Equipo, /guia y Las verdades |

**«Cartel» cambia de nombre a propósito:** «Energía» es la plantilla que el dueño ya rechazó, y arrastrar el nombre arrastra la comparación.

**D2 entra con prueba de muerte fijada.** Compartía demasiado ADN con D1 (radio 0, titular 800, cejilla mono, foto oscurecida con texto encima, marquesina, paleta azul/rojo/blanco/negro — el juego de tokens de la plantilla rechazada). La amputación —cero superficies a sangre, cero movimiento— es cirugía de escritorio. En el primer Loop A se renderizan las dos con datos de Lagoh, se capturan a 375px y se ponen las miniaturas juntas: **si a un metro no se distingue cuál es cuál, D2 muere** y sus tres ideas propias (la cartela bajo la foto, el presupuesto de un solo rojo, «Apártamelo» como etiqueta de balda) se mudan a «Cartel».

## D4 no es una dirección

Retirada como cuarta opción, por dos motivos y ninguno de gusto:

1. **Cero capturas propias** de webs que vivan en negro con esa polaridad — el listado de premios devuelve nombres de estudios, no de sitios. Construir una dirección sobre material no visto es el error de siempre con mejor coartada.
2. **Lo dice nuestro propio código:** `templates.ts` tiene escrito que los tokens solos no pueden cambiar composición, tipografía ni movimiento, «y eso es exactamente lo que el ojo usa para decidir si dos webs son distintas». Una plantilla que solo invierte colores es, por definición escrita por nosotros, un cambio de pintura.

**Lo que sí se queda es la capa nocturna como infraestructura:** campo `modo: 'claro'|'oscuro'|'auto'` en `Template`, todo en CSS en el head, sin JS ni interruptor. `'claro'` no emite un byte, así que las 8 tiendas vivas no cambian un píxel. La declaran «Cartel» y «Portada»; «Escaparate» no, porque su sistema son paneles blancos encendidos contra campo gris y en oscuro esa relación se invierte y deja de significar nada. Cambian superficies, tinta, **elevación** (una sombra sobre negro no existe: `--shadow-*` a `none` y filete de luz de 1px arriba) y peso tipográfico. **No** cambian orden, jerarquía, primer viewport, rojo de oferta, tratamiento de foto ni eventos.

## Lo verificado en el código (no razonado)

| Hallazgo | Estado |
|---|---|
| **`SECTION_IDS` son 9 ids cerrados y `resolveSections` descarta en silencio lo desconocido** — «Hazte socio», «Empieza aquí» u «Oferta» no existen como concepto: escribirlas hoy no daría error, simplemente no aparecerían | 🔴 bloqueante — es la capa 0 |
| **El trinquete de 900 KB mide SOLO imágenes.** Grancasa a 878 KB (22 KB de margen); ni fuentes ni CSS cuentan. Inter (48 KB) se precarga siempre en `Base.astro:106`. Grancasa real ronda el mega estando en verde | 🟠 corrige el presupuesto |
| **«Cierra en X» es viable hoy:** `parseHorario` da el horario estructurado, el esquema lo exige en 8/8 y toda alta futura, y las páginas son SSR por petición. **Trampa:** el servidor corre en UTC → obligatorio `Intl` con `Europe/Madrid` + prueba con hora fijada | 🟢 viable, con trampa |
| **Contraste medido:** el rojo de marca da 4,19:1 sobre papel claro y **no pasa como texto pequeño**; el cian da **6,70:1 sobre tinta oscura** y sí pasa — la prueba numérica de que en modo oscuro recuperamos un color de marca hoy prohibido | 🟢 dato de sistema |
| **Las 4 fotos de Lagoh son verticales, de 382px de ancho** (por debajo de nuestra variante más pequeña: ya se amplían) y dos son el mismo fichero. No tiene «tres fotos»: tiene tres fotos verticales pequeñas | 🟠 dato de flota |
| **La propuesta de D1 se saltaba su propia paleta:** ponía los índices numéricos en «Gris obra», que su propia hoja declara «nunca texto de lectura» (2,36:1 medido) | ✅ corregido al renderizar |

## Las cinco decisiones que bloquean

1. **Los siete campos nuevos de ficha** (`rotulo`, `desde`, `zonaInterior`, `gbp`, `movilVerificado`, `orientacion`, `canalWhatsapp`) y **quién los rellena en el alta**. Sin ellos hay seis piezas que no se pintan en ninguna de las 8.
2. **El rótulo del hero:** nombre corto curado por tienda (≤14 car.) o `location`. Las 8 empiezan por «USAFITNESS» y llegan a 30 caracteres: a tamaño cartel las ocho portadas empiezan igual, justo en el primer viewport.
3. **El modelo de ofertas, ¿antes o después de la primera plantilla?** Está decidido pero no construido, y por eso ninguna dirección pinta oferta en ninguna tienda.
4. **Quién escribe el texto de marca y quién revisa las alegaciones.** Ocho líneas de puerta, ocho rutas, cinco preguntas, cuatro afirmaciones de socio. Es el camino crítico real y no lo presupuestó ninguna propuesta.
5. **Con cero reseñas (5 de 8), ¿la sección se da la vuelta o no se pinta?** Decisión comercial, no de diseño: dar la vuelta corrige el mayor agujero medido pero admite en público que la tienda no tiene reseñas, y eso se ve en la demo del prospecto. En Grancasa ni siquiera hay ficha de Google.

Las otras ocho (rojo como tinta del rótulo · un solo rojo por página · vale de orientación solo donde lo firmen · cuántas direcciones en /muestrario · firmas de «las verdades» · si la plantilla cambia también la letra del texto · los 44 logos que faltan · el mapa deja de venderse como novedad) están en el JSON y pueden esperar al primer bucle.

## Autocrítica

- **Lo más flojo:** el dueño ha visto **tres primeros viewports**, no tres webs. El resto sigue siendo prosa, y las dos plantillas anteriores se rechazaron por entregar sin mirar.
- **El supuesto que sostiene todo, y que puede ser falso:** que el franquiciado decide porque las plantillas se ven distintas. Puede que decida por precio, por confianza en el operador, o porque su página oficial es tan pobre que cualquier cosa gana. La única señal a favor es que el dueño rechazó dos veces con la palabra «clavada» — pero es el operador, no el franquiciado que paga.
- **Ninguna cifra de peso tipográfico está medida.** Se dice en vez de escribir un número que suene bien. Con Grancasa a 22 KB del tope, es ahí donde revienta.
- **La puerta a D4 se cerró sin ir a mirar webs oscuras.** La conclusión parece correcta, pero el método es el que se critica.
- **De fondo:** las tres comparten catálogo de piezas y eventos; solo las separa forma, orden y voz. Si al verlas enteras siguen pareciéndose por debajo de la paleta, la conclusión honesta no será retocar colores: será que no hacen falta tres plantillas, sino una muy buena y un muestrario más sincero.
