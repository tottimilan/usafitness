# Loop de secciones — 27-ago-2026 (tarde)

**Encargo del dueño:** «analiza en profundidad de nuevo todas las secciones, ver si necesitamos más… si todo okey perfecto, pero me gusta hacer loops».
**Método:** un agente analista recorrió las 26 piezas del inventario cerrado (6 de gen 2, 3 candidatas, 3 estrellas y 8 con condición de ronda 2, 4 landings) contra la información nueva del día: reseñas enlazables a Google (verificado: el formulario exige Place ID, tenemos CID en 7/8), libertad de orden por tienda, la gramática de formas de la marca, cinco plantillas en vez de tres, los hallazgos de la gira de referencias, el vídeo-tour que la central obliga a grabar (ANEXO) y la GUÍA (FAQ de dependientes; Amanda Gil ≠ nutricionista). Cada afirmación sobre el código está marcada [V] por el agente tras leer el fichero.
**Estado:** propuesta. Los cambios de hoja se aplican a las fichas cuando el dueño responda las 6 preguntas del final.

---

## Veredicto

El inventario aguanta en su estructura (ninguna de las 26 piezas se cae y ninguna hoja pierde su P/N), pero NO aguanta tal como está escrito: cuatro hojas cambian de fondo con la información nueva (Reseñas pasa de «se queda + enlace» a máquina con campo, evento y decisión de vacío; el slot de vídeo deja de ser «pediremos vídeos» y pasa a ser el vídeo-tour del ANEXO con dos casas posibles; FAQ y Equipo cambian de fuente y de credencial por la GUÍA; /muestrario cambia de tamaño con 5 plantillas), falta UNA pieza de sistema que nadie ha escrito (la prioridad por tienda que gobierna el orden, hoy un array libre a mano) y sobran en v1 dos cosas que se cuelan como secciones (Novedades sin proceso, Social como sección en vez de periferia). Además, la gramática de formas no añade secciones pero sí resuelve tres de las trece decisiones pendientes en contra de lo que proponía «Cartel».

## Cambios de hoja (11)

### Reseñas + «déjanos la tuya» (gen 2)
**Qué cambia:** La hoja se reescribe. Hoy la sección es un tabulador con el texto «Reseña de Google» y CERO enlaces [V: src/components/Reviews.astro no tiene ningún href] y el esquema no guarda Place ID [V: src/data/stores.ts solo valida CID en googleMapsLink/googleMapsEmbed]. Con el permiso del dueño la pieza pasa a tener DOS salidas: (a) «ver todas en Google» → ya posible hoy en 7/8 con `googleMapsLink` por CID [V]; (b) «escribe tu reseña» → exige el enlace oficial que Google da en el perfil (Business Profile → Read Reviews → Get more reviews) [V: support.google.com/business/answer/16816815] o, como alternativa técnica, la URL writereview?placeid= con Place ID «ChIJ…» [P: no está documentada en ninguna página oficial que haya podido abrir; la nota de memoria del 27-ago la da por verificada]. Además: nuevo evento `pedir_resena{seccion}` (hoy la máquina no emite nada y no podría demostrarse en el informe), y la nota agregada solo con `gbp{nota,total,leidoEl}`, nunca en structured data (Landing.astro:66 ya omite aggregateRating a propósito, y Google confirma que las reseñas controladas por la entidad, incluidos widgets de Google, son inelegibles [V: developers.google.com/search/docs/appearance/structured-data/review-snippet]).

**Por qué:** Es el mayor agujero medido (5 de 8 a cero: marineda, lasrosas, grancasa, vigo, lagoh [V: stores.json]) y la única pieza cuyo efecto se ve en un sitio ajeno (la ficha). Sin enlace no hay máquina; sin evento no hay prueba de que la máquina funcione; sin Place ID/enlace oficial el enlace no se puede construir desde el CID que sí tenemos.

**Evidencia:** Google prohíbe incentivos y «require or pressure users to leave ratings or write reviews while on the premises» [V: support.google.com/contributionpolicy/answer/7400114] → la máquina es un enlace y un QR pasivo; el «guion de 8 palabras para el dependiente» de memory/15 se redacta como invitación, y ni la Tarjeta que vuelve ni el regalo de la guía pueden condicionarse a reseñar. Los Place ID pueden cambiar y Google recomienda refrescarlos a los 12 meses [V: developers.google.com/maps/documentation/places/web-service/place-id] → entra en el Semáforo NAP anual.

### Caso cero reseñas (5 de 8) y Grancasa sin ficha
**Qué cambia:** La información nueva resuelve la mitad legal de la decisión 7 (sí se puede enlazar) y deja solo la comercial. Propuesta de defecto: con <3 reseñas la sección NO se pinta y la píldora «déjanos tu reseña» se muda a Hoy en tienda (la solución de D2); «Sé el primero en contarlo» solo como opción por tienda. Grancasa: sin ficha no hay destino ni para la píldora; el alta de su ficha (Q13c, pendiente) es prerrequisito de toda la P4, no un dato más.

**Por qué:** La demo del prospecto se genera con datos de la ficha oficial (sin reseñas propias): una sección que anuncia el vacío en la primera impresión de venta va contra el norte §2.1. Y en la web viva, la píldora en Hoy en tienda mantiene la máquina funcionando sin admitir nada.

**Evidencia:** 5/8 sin reseñas y 1/8 sin ficha [V: stores.json]; direcciones-sintesis.json decisión 7 y tratamiento D2 «Reseñas» [V].

### Galería + slot de vídeo (gen 2)
**Qué cambia:** El vídeo deja de ser «pedirás más vídeos a las tiendas» y pasa a ser el VÍDEO-TOUR obligatorio del ANEXO (centro comercial → trayecto → cartel → interior → productos), que la central edita y publica. Consecuencia: la hoja necesita puerta (OK central para alojar o enlazar), mecanismo (si vive en la cuenta de la central = tercero → fachada clic-para-cargar como el mapa + declaración en cookies; si se autoaloja = tope de peso y duración) y una decisión de casa: el tramo «trayecto hasta la puerta» sirve a P1 (Hoy en tienda), no a P4 (galería). Propuesta: el vídeo es una pieza con dos anclas posibles y cada plantilla elige dónde lo pone.

**Por qué:** Es el único contenido audiovisual garantizado por contrato para las 50 tiendas, y resuelve el problema de flota (fotos mediocres) mejor que cualquier tratamiento CSS. Pero grancasa ya va a 932 KB [V: memory/02] y su vídeo de 2,25 MB se sirve sin enlazar: el vídeo solo entra como póster + clic.

**Evidencia:** docs/brand/gramatica-de-formas.md §5 (ANEXO Integración Digital, leído por el agente anterior) [P]; presupuesto de 900 KB y estado de grancasa [V: memory/02-current-state.md].

### FAQ local (candidata aprobada)
**Qué cambia:** Cambia la fuente del contenido: la GUÍA TIENDAS trae un capítulo de FAQ respondidas por dependientes = contenido de marca ya escrito y ya sancionado por la central. La hoja pasa de «contenido de marca a redactar» a «selección de 4-6 de la GUÍA + 1-2 datos por tienda (parking, planta)». Alivia la decisión 9 (quién escribe) en esta pieza. Condición: si la central no autoriza citar la GUÍA, vuelve al estado anterior.

**Por qué:** Reduce el camino crítico real (texto de marca) y da procedencia al copy (R6: nada genérico en zona noble).

**Evidencia:** docs/brand/gramatica-de-formas.md §5 [P, fuente secundaria leída]; inventario A candidata FAQ [V].

### Nuestro equipo + Ruta «Mujer» con Amanda Gil (ronda 2)
**Qué cambia:** El gate duro cambia de forma: Amanda Gil es CAFAD/TAFAD/entrenadora, NO nutricionista. Ya no se trata de «verificar si tiene título de nutrición» sino de titularla por lo que es (entrenadora / graduada en CAFD, con documento) y de que TODO lo que firme sea de entrenamiento y objetivo, nunca de nutrición. La ruta Mujer se reescribe con voz de entrenamiento (categorías por objetivo) y la Serie del experto reparte: nutrición → Gouveia o firma de marca; entrenamiento → Amanda. Equipo mantiene los tres escalones de D3 (retrato+credencial / solo texto / «te atiende el equipo de tienda»).

**Por qué:** Publicar consejo nutricional firmado por una entrenadora en 50 webs bajo el CIF de cada franquiciado es exactamente el riesgo YMYL/intrusismo que ronda 2 quería evitar; la aclaración lo desactiva si se aplica al reparto de firmas, no solo a la etiqueta.

**Evidencia:** gramatica-de-formas.md §5 (GUÍA cap. Expertos) [P]; ronda2-innovacion.md puertas 2 y 4 [V].

### /guia — el imán invertido (estrella ronda 2)
**Qué cambia:** Sube de «jugada nuestra» a «cumplir una promesa impresa por la central en nombre de la marca» (la GUÍA termina literalmente con «regalo: orientación gratuita en tienda»). Eso cambia el marco de la decisión 6: la promesa ya existe para todas las tiendas, la hizo la central; el flag `orientacion` pasa de opt-in a opt-out razonable. Puertas que siguen: OK central para alojar el PDF; capa de cita solo con móvil verificado (hoy 1/8).

**Por qué:** La conversión más fuerte del sistema (N6) deja de depender de que cada franquiciado acepte una idea nuestra: acepta o rechaza cumplir lo que su marca ya promete.

**Evidencia:** gramatica-de-formas.md §5 [P]; ronda2 ficha /guia [V].

### Hoy en tienda (gen 2, fusión schedule+location)
**Qué cambia:** Gana tres inquilinos condicionales sin cambiar de P/N: «cierra en X» (Prozis; viable, con la trampa UTC → Intl Europe/Madrid ya anotada), la píldora «déjanos tu reseña» cuando la sección de reseñas no se pinta, y el póster del tramo «trayecto» del vídeo-tour. Y necesita una variante para las 11 tiendas a pie de calle: el esquema exige `mall` [V: stores.ts] y el texto asume «planta y zona dentro del centro».

**Por qué:** Es la pieza P1/N1, la reina; concentra lo que el visitante busca y ahora también lo que la máquina de reseñas necesita cuando no hay reseñas.

**Evidencia:** notas-capturas.md Prozis/Alphalete [V]; secciones-f1/ficha.md hoja 4 y ampliación [V]; 11 pie de calle en memory/11 [V].

### /muestrario (global) y la demo del prospecto
**Qué cambia:** Con 5 plantillas el entregable «hecho cuando un franquiciado distingue y elige sin ayuda» se endurece, y la decisión 8 cambia de pregunta: ya no es «cuántas se enseñan» sino «cuántas se enseñan a ESTE prospecto». Propuesta: el muestrario muestra la MISMA tienda (la del prospecto, con seed data) en las 5, pero la conversación de venta recomienda 2 según perfil (tráfico peatonal/Instagram → Cartel; boutique/asesoramiento → Portada…). Y la demo del prospecto deja de listarse como landing aparte: es la home con seed data de `nueva-tienda.mjs`.

**Por qué:** Enseñar 5 sin criterio es el mismo error que 3 ofertas apiladas (MyProtein): nada se lee. Y la autocrítica de la síntesis ya avisó: si al verlas enteras se parecen por debajo de la paleta, hacen falta menos plantillas, no más.

**Evidencia:** notas-capturas.md MyProtein [V]; direcciones.md autocrítica [V]; proceso-comercial.md §2 [V].

### Empieza aquí (estrella ronda 2)
**Qué cambia:** Aguanta; solo se fija por escrito lo que la gira validó: es SECCIÓN en el flujo, jamás interstitial (TransparentLabs lo sirve como interstitial = R7-prohibido), el copy pierde «diagnóstico» y «revisado por el equipo» (YMYL, corregido en D1), y con Amanda como entrenadora las rutas se escriben por OBJETIVO de entrenamiento, que es además el eje que Alphalete valida (navegar por algo que no es la categoría).

**Por qué:** La demanda del patrón está probada por un líder; el riesgo era la forma, no la idea.

**Evidencia:** notas-capturas.md TransparentLabs y Alphalete [V]; direcciones-sintesis D1 «Empieza aquí» [V].

### Novedades del mes (candidata aprobada)
**Qué cambia:** Se reclasifica: de sección de v1 a pieza del servicio mensual. No hay campo, no hay proceso y 0/8 tienen dato; D2 y D3 ya lo dicen («pieza del servicio mensual, no de la v1»). Sigue siendo la casa de «Apártamelo» cuando exista.

**Por qué:** Una sección que exige refresco mensual sin proceso viola la regla de admisión de memory/15 §Nivel 3 («si exige refresco más de una vez al año, no se construye» salvo servicio gestionado) y sería la primera en pudrirse.

**Evidencia:** direcciones-sintesis D2/D3 [V]; memory/15 Nivel 3 [V].

### Transversal: la gramática de formas sobre las secciones
**Qué cambia:** No añade ni quita secciones, pero asigna a cada una un motivo natural que las cinco plantillas pueden dosificar: cuña cian → hero (una por pantalla); círculo punteado + pin → Placa y Hoy en tienda (datos enmarcados, la web como panel informativo); chevrón cian/metal → Productos y marcas (el metal ES la estantería blanca de la tienda); rayado 45° → fondos de Oferta y Galería (nunca sobre texto); mayúsculas + UNA palabra en script → titulares de Hazte socio y Por qué en tienda (claims en inglés como en cartelería). Regla nueva para las hojas: la sección declara qué elemento de la gramática puede llevar, la plantilla decide si lo lleva.

**Por qué:** Es lo que permite que 5 plantillas sean distintas y a la vez USA Fitness; sin asignación por sección, cada plantilla lo aplicará como pintura y volvemos al rechazo.

**Evidencia:** docs/brand/gramatica-de-formas.md §1-3 [V, leído entero].

## Huecos: lo que falta y nadie había escrito (5)

| Pieza | Sirve a | Por qué falta | Coste |
|---|---|---|---|
| **La PRIORIDAD por tienda (pieza de sistema, no sección)** | Sirve a todas las P/N: decide cuál va primera tras Hoy en tienda | Hoy el orden por tienda es `store.sections`, un array crudo escrito a mano que puede poner Social primero o dejar fuera Hoy en tienda [V: templates.ts resolveSections + stores.ts]. Con ~20 piezas y 5 plantillas, decidir el orden a mano en 50 altas no escala y no tiene regla. Nada en el inventario dice CÓMO se decide qué es estrella en una tienda y qué sobra en otra; solo dice que se puede. | Bajo: un campo `prioridad` (enum de 4 valores) + una regla en resolveSections que mueve UN bloque a la zona móvil de la plantilla; el array sigue como válvula de escape del operador. Una pregunta en la sesión de alta. |
| **Evento `pedir_resena{seccion}` en el registro §3.4** | P4 / máquina de reseñas | El registro único tiene 14 eventos y ninguno mide el clic a «escribe tu reseña» [V: docs/medicion/guia-alta.md §3.4]. La hoja de Reseñas declara «sin evento propio» porque antes no había enlace; ahora sí lo hay y el informe mensual promete «reseñas nuevas» sin poder atribuirlas a la web. | Mínimo: una fila en el registro + data-attr en el enlace (mismo mecanismo que contacto_maps). |
| **Hoja propia del vídeo-tour** | P1 (trayecto) y P4 (ver el sitio real) → N1 | Está solo como «slot de vídeo» dentro de Galería. El ANEXO lo convierte en activo por tienda con dueño (la central), formato (4K 60fps, ≥20 clips) y publicación en cuenta ajena: necesita puerta, mecanismo de fachada, tope de peso y decisión de casa. Sin hoja, cada plantilla lo tratará distinto y el peso se disparará justo en grancasa. | Una hoja + campo `videoTour` + reutilizar la fachada del mapa. Puerta externa: OK central (cabe en el mismo viaje que el PDF y las imágenes del equipo). |
| **Variante «pie de calle» de Hoy en tienda y del esquema** | P1 / N1 en 11 de las 58 tiendas | El esquema exige `mall` [V: stores.ts] y la hoja 4 habla de «planta y zona dentro del centro». El QR del escaparate (ronda 2) apunta justo a esas 11 tiendas, y ninguna pieza del inventario contempla que no haya centro comercial. | Bajo: `mall` opcional con `tipoLocal`, texto alterno (calle, referencia visual, parking) en Hoy en tienda. |
| **Camino explícito «tienda sin ficha de Google»** | P1 y P4 (mapa, reseñas, placa) | Grancasa lo demuestra: sin ficha no hay mapa, ni botón de ruta, ni destino para la petición de reseña, ni nota. El inventario trata la ficha como dato; en realidad es prerrequisito del servicio. Falta la frase en el inventario y en el proceso comercial: «sin ficha verificada no se da de alta la P4; el alta de ficha es paso 0 de la sesión». | Cero código (el esquema ya declara `sin-ficha-gbp`); una línea en el inventario y en el guion de alta. |

## Sobrantes en v1 (5)

- **Social como SECCIÓN del cuerpo** — N5 es la conversión menor y las tres direcciones la reducen a una banda de 96 px o menos [V: direcciones-sintesis]. Como sección ocupa un hueco de orden en cada plantilla y en cada decisión por tienda; como periferia (pie) cumple lo mismo con cero decisiones. Y en grancasa además hereda la petición de reseña, que es trabajo de periferia. Propuesta: baja a periferia; el evento N5 se mantiene.
- **Novedades del mes en la v1** — Sin campo, sin proceso y 0/8 con dato; exige refresco mensual. Se queda en el catálogo como pieza del servicio mensual (donde ya la ponen D2 y D3), no en el inventario de secciones base.
- **La Placa como sustituta de Reseñas** — El inventario y una propuesta la usaban como tapagujeros del hueco de reseñas; D3 ya lo mató («con cero datos propios no puede ocupar el hueco de Reseñas»). Con cifras solo de cadena (52 marcas, 1.683 referencias) es dato de marca rotulado como tal, no prueba social de la tienda. Se queda, pero sin ese papel.
- **«Demo del prospecto» como landing propia en el mapa B** — No es una landing: es la home generada por `nueva-tienda.mjs` con seed data en URL noindex. Listarla aparte duplica una pieza y confunde el mapa de landings.
- **La cifra «137 categorías» como interfaz** — Ya retirada en la ampliación de la hoja 2 (8-12 puertas con volumen); el inventario A todavía la nombra como base de Productos y marcas. Se corrige el texto para que no reaparezca en ninguna plantilla.

## Campos nuevos del esquema (6)

| Campo | Para qué | Quién lo rellena | Sin él |
|---|---|---|---|
| `placeId (ChIJ…) o reviewLink (enlace oficial «Escribir reseña» del perfil)` | Construir el enlace directo al formulario de reseña; el CID que ya tenemos solo lleva a la ficha | El operador en la sesión de alta: desde el perfil de Google (Read Reviews → Get more reviews, exige acceso de gestor, que ya se pide en el alta) o con el Place ID Finder (~1 min). Se refresca en el Semáforo NAP anual (Google recomienda refrescar Place IDs a los 12 meses) | La máquina funciona a medias: el visitante llega a la ficha y tiene que buscar el botón; grancasa sigue sin nada hasta tener ficha |
| `gbp {nota, total, leidoEl} (ya propuesto; se confirma y acota)` | Pintar la nota y el número de personas en display (Huel) con fecha de lectura; jamás en structured data | El operador, leído de la ficha en el alta y en la revisión mensual | La sección publica solo citas con sus estrellas reales, o no se pinta |
| `videoTour {origen: 'central'|'propio', url|fichero, poster, duracion}` | El vídeo-tour del ANEXO como celda de galería o póster de trayecto en Hoy en tienda, con fachada si es tercero | La central lo produce y publica; el operador lo enlaza en el alta o cuando exista | Galería sin vídeo y Hoy en tienda sin trayecto; la página no cambia de alto |
| `prioridad: 'visita'|'oferta'|'socio'|'asesoramiento'` | Decidir qué bloque va primero en la zona móvil de la plantilla sin editar arrays a mano | El franquiciado, con UNA pregunta en la sesión de alta («¿qué quieres que vea primero quien te busca?»); el operador lo teclea | Manda el orden por defecto de la plantilla — que es lo que pasa hoy en 8/8 |
| `resenasVacias: 'ocultar'|'pedir' (defecto 'ocultar')` | Resolver por tienda la decisión 7: con <3 reseñas, ocultar la sección y mover la píldora, o publicar «Sé el primero» | El operador, tras acordarlo con el franquiciado; la demo del prospecto siempre 'ocultar' | Se aplica 'ocultar': nunca se anuncia el vacío por accidente |
| `tipoLocal: 'centro'|'calle' (y `mall` pasa a opcional)` | Dar de alta las 11 tiendas a pie de calle y cambiar el texto de Hoy en tienda (planta/zona → calle/referencia/parking) | El operador desde el directorio de la central (dato ya público) | El esquema rechaza la tienda entera: hoy `mall` es obligatorio y esas 11 no se pueden ni dar de alta |

## Libertad por tienda — las tres capas

Tres capas, y hoy solo existen la primera y una versión sin reglas de la tercera. (1) FIJO en todas las tiendas y plantillas: la periferia (header/rótulo, barra de acción, aviso de cookies, legales, pie con Social) y las reglas R1-R3 — el primer viewport responde P1 con N1/N2 (nadie puede bajar Hoy en tienda bajo el pliegue), el horario de hoy visible desde el primer scroll, Hazte socio en la primera mitad. (2) LA PLANTILLA decide la narrativa: el orden por defecto, qué piezas opcionales HOSPEDA (Portada hospeda Equipo y Verdades; Cartel no las lleva) y con qué variante y motivo de la gramática. Una tienda no puede añadir una sección que su plantilla no hospeda: eso es cambiar de plantilla. (3) LA TIENDA decide por dos vías, ninguna de ellas un array a mano: por DATO, con omisión automática (sin reseñas no hay Reseñas, sin oferta viva no hay rojo, sin móvil verificado no hay Apártamelo ni cita, sin firma no hay Verdades, sin `desde` no hay placa) — esto ya existe como `visible()` y hace que la misma plantilla se vea distinta en Vigo (móvil verificado: asesor + reserva encendidos) que en Lagoh (3 fotos, 0 reseñas, sin WhatsApp: socio y productos suben solas); y por PRIORIDAD declarada, una sola elección en el alta que mueve UN bloque (Oferta, Socio, Empieza aquí o Productos) al primer hueco de la zona móvil que la plantilla reserva tras Hoy en tienda. Con eso «estrella en una tienda y sobra en otra» tiene regla: es estrella lo que la tienda tiene dato para sostener y ha elegido; sobra lo que no tiene dato, y se quita solo. `store.sections` se queda como válvula de escape del operador (nunca del franquiciado), y el muestrario enseña plantillas como narrativas de perfil, no como pieles. Lo que NO se decide por tienda: la periferia, el primer viewport, el presupuesto de rojo, el tratamiento de foto y los eventos.

## Decisiones pendientes del dueño que cambian con esto

- D1 (siete campos nuevos): cambia — pasan a OCHO con `placeId` (o el enlace oficial de reseña) y `videoTour` como noveno condicional; `gbp{nota,total,leidoEl}` se confirma como la única vía para pintar una nota.
- D2 (rótulo ≤14 caracteres vs `location`): prácticamente resuelta por el dato — las 8 empiezan por «USAFITNESS» [V: stores.json]; `rotulo` con caída a `location`.
- D3 (rojo como tinta del rótulo del hero): la gramática de formas la resuelve en NO — el brand book usa el rojo solo en el logo y en un acento; el cian domina las superficies; «el rojo no es fondo» [V: gramatica-de-formas.md §1 y §3].
- D4 (un solo rojo por página = la oferta): reforzada por la marca (rojo = acento escaso) además de por MyProtein/Bulk.
- D6 (vale de /guia opt-in por tienda): cambia de marco — la promesa ya la imprime la central en la GUÍA en nombre de toda la marca; pasa a opt-out razonable, con el flag para quien no quiera honrarla.
- D7 (cero reseñas): resuelta la mitad legal (sí se puede enlazar a ficha y a formulario); queda la comercial, con propuesta de defecto (ocultar + píldora en Hoy en tienda).
- D8 (cuántas direcciones en /muestrario): cambia de pregunta con 5 plantillas — «cuántas a ESTE prospecto», recomendación de 2 por perfil.
- D9 (quién redacta el texto de marca): parcialmente resuelta — la GUÍA aporta FAQ respondidas por dependientes y el capítulo de expertos; sigue faltando quién sanciona alegaciones de salud.
- D11 (¿la plantilla cambia la letra del texto?): la gramática la acota — sí, pero dentro del sistema de 5 roles de una neo-grotesca libre; Big Shoulders/Barlow Condensed se alejan de la identidad y hay que saberlo al elegirlas.
- D13 (el mapa se queda como está): reforzada — el mismo `googleMapsLink` por CID es ahora también el enlace «ver reseñas en Google».
- Sin cambio: D5 (ofertas antes/después), D10 (firmas de las verdades, 0/8), D12 (44 logos).

## Preguntas al dueño (solo las no respondidas en memory/12)

1. El vídeo-tour del ANEXO: ¿la central te entrega el fichero editado o solo el enlace a su cuenta oficial? Decide si va autoalojado con tope de peso o como fachada de tercero declarada en cookies, y si cabe pedirlo en el mismo viaje que el PDF de la guía y las imágenes del equipo.
2. ¿Aceptas que el franquiciado elija UNA prioridad en el alta (visita / oferta / socio / asesoramiento) que mueve un solo bloque, en vez de un orden libre de secciones por tienda? Es la diferencia entre 50 altas con regla y 50 arrays a mano.
3. Para el enlace «escribe tu reseña»: ¿lo sacas tú del perfil de Google de cada tienda en la sesión de alta (Read Reviews → Get more reviews, requiere el acceso de gestor que ya pides) o prefieres que use el Place ID con la herramienta pública? La primera es la vía oficial documentada; la segunda es la habitual pero no la he encontrado en ninguna página oficial de Google.
4. El vale de orientación gratuita lo promete la propia GUÍA de la central en nombre de la marca: ¿lo publicamos por defecto en todas las tiendas con opción de quitarlo (opt-out), en vez de esperar a que cada franquiciado lo firme (opt-in)?
5. ¿Se puede citar la GUÍA TIENDAS literalmente en la web (sus FAQ respondidas por dependientes, el capítulo de expertos) o solo sirve como fuente interna? Es distinto del permiso de alojar el PDF que ya está pedido, y decide quién escribe la FAQ y las verdades.
6. Social: ¿aceptas que deje de ser una sección del cuerpo y baje al pie (periferia), y que Novedades pase a ser pieza del servicio mensual y no de la v1? Libera dos huecos de orden en las cinco plantillas sin perder ningún evento.
