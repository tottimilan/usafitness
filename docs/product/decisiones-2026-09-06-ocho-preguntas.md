# Las ocho preguntas que el dueño delegó — respondidas con evidencia (2026-09-06)

**Encargo literal del dueño:** *«quiero que las analices tú, busques en internet, en lo que tenemos en estadísticas de webs, en cómo se hace una buena web etc. y te respondas tú por favor».*

**Método:** una investigadora por pregunta con obligación de fuente primaria y de medir lo que se pueda medir; siete de las nueve tandas terminaron antes de agotarse el modelo. Las dos que cayeron —rótulos curados y festivos— las he resuelto yo: la primera con las mediciones que sí llegaron (los 58 rótulos ya estaban medidos con la tabla de avances real), la segunda con lectura directa de la ley y de las órdenes autonómicas. **Ninguna de las ocho quedó sin respuesta.**

**Cómo leer las marcas:** `[V]` fuente abierta y leída (URL o fichero:línea) · `[medido]` medición propia con el comando dicho · `[P]` probable, no comprobado. **Confianza** es mía, no del panel: `alta` = la decisión no cambia aunque aparezca evidencia nueva razonable; `media` = depende de un píxel o de una respuesta que llegará.

---

## 1. Rótulo como demo por defecto — **SÍ, y Esquina solo cuando llegue la foto** · confianza alta

**Decisión.** La demo pre-construida de los 58 prospectos se genera siempre con Rótulo, a partir del directorio de la central y de la ficha de Google, sin pedir nada al franquiciado. Esquina es la **segunda** demo y se genera cuando el prospecto manda una foto de su fachada, que se le pide **al final de la primera llamada**, después de enseñarle la primera. La alternativa —Esquina por defecto con la foto como precondición— queda descartada.

**Por qué, con los números que lo deciden.** El directorio central publica 58 fichas y **0 de 58 traen una foto de tienda utilizable** (una sola miniatura de 126×74 px), 0/58 WhatsApp o Instagram propios, 48/58 teléfono, 29/58 horario `[medido, rastreo de las 58 URLs el 6-sep]`. Esquina depende de una fachada que en el momento de generar la demo no existe para ningún prospecto; Rótulo depende del nombre de la tienda, que es el único dato personalizante que tenemos de los 58. Y el nombre es exactamente lo que convierte: el cuerpo personalizado sube la respuesta un 32,7 % sobre 12 millones de correos de prospección `[V, Backlinko/Pitchbox 2019]`, el material referido a uno mismo se recuerda mejor `[V, meta-análisis Symons & Johnson 1997]` y la primera impresión visual se forma en unos 50 ms `[P, Lindgaard 2006: título y revista verificados, resultados no leídos en la fuente primaria]`. Rótulo pone ese nombre a 58-98 px en el primer viewport. El fallback de Esquina sin foto pone «USA Fitness» y una diagonal: eso es marca, no «mi tienda», y es el estado más pobre del sistema justo en la pantalla que decide la segunda reunión.

Pedir la foto antes del primer contacto tiene coste medido: **57 % de no respuesta** cuando se pide material por escrito (nuestro propio dato, memory/15), y solo **8 de 58 fichas publican un móvil** al que escribir por WhatsApp sin llamar antes `[medido]`. La petición pequeña funciona **después** de haber dado algo, no bloqueando la entrada.

**Cuando la foto existe, Esquina gana** y por eso no se descarta: los visitantes miran las fotos reales del negocio e ignoran las decorativas `[V, NN/g]`. Con una condición de calidad: lado largo ≥900 px y puerta reconocible. Lagoh, con sus 382×510, no la pasaría.

**Lo que cambia:** `nueva-tienda.mjs investigar` genera siempre `/preview/<slug>` con `template:'rotulo'` y `preview:true` (noindex, fuera del sitemap, caduca a 30 días); `PLANTILLA_POR_DEFECTO` sigue siendo `clasica` en producción hasta que Rótulo pase el Loop B. La foto de fachada es precondición **solo** de Esquina, nunca del alta. Y se corrige `servicios-y-automatizacion` donde dice que la demo puede usar fotos genéricas de marca: contradice la metodología y no se hace.

**Queda abierto:** si el corte del rótulo por el borde derecho gusta. Eso se decide en la captura, no aquí.

---

## 2. Los rótulos curados — **los escribo yo con una regla, tú confirmas la lista** · confianza alta

**Decisión.** El operador no inventa: aplica una regla determinista sobre el nombre del directorio, y el resultado se te entrega como lista para que la confirmes de un vistazo. La regla: quitar «USAfitness», «C.C.», «Carrefour», «Westfield» y la ciudad; una palabra por línea; máximo dos líneas; si una palabra supera las 8 letras se admite un **salto de línea explícito** declarado en el propio campo (`TORRE|CÁRDENAS`).

**Por qué se puede decidir sin verte.** Porque está medido, no estimado. Descargué Archivo instanciada a wdth 125 / wght 900 y leí su tabla de avances: **la media de las mayúsculas es 0,927 em** (mínimo I 0,395, máximo W 1,230) `[medido, fontTools sobre el woff2 de Google]`; la ficha estimaba 0,92. Con esa tabla y el suelo de 58 px que fijó tu propia crítica, sobre los 58 nombres del directorio: **40 de 58 caben estrictos, 52 de 58 con un corte de hasta 3 caracteres, y 6 son imposibles sin salto explícito** (TORRECÁRDENAS, FINESTRELLES, FUENLABRADA, LÓPEZ DE HOYOS, EL FERIAL PARLA, LUZ DEL TAJO) `[medido]`.

Las ocho de casa, a 58 px sobre 375 px de ancho:

| Rótulo | Ancho | Corte |
|---|---|---|
| GRAN VÍA · EL ZOCO · LAS ROSAS · LAGOH | 222-277 px | entra entero |
| MARINEDA | 419 px | 0,8 caracteres |
| EL ARCÁNGEL | 432 px | 1,1 |
| GRANCASA | 443 px | 1,2 |
| VILLANUEVA | 499 px | 2,5 |
| ALCOBENDAS | 537 px | 3,0 |

**Lo que cambia:** el build comprueba el rótulo con la tabla real y revienta si pide más de dos líneas; avisa si la línea más ancha se pasa de tres caracteres. La lista de los 58 se entrega en `docs/plantillas/rotulo/rotulos-58.md` y sustituye a la pregunta «¿confirmas los ocho?» de la síntesis. Tú confirmas una tabla; no escribes 58 nombres.

**Queda abierto:** Villanueva. El directorio y otras tres fuentes apuntan a La Pasada, no a El Zoco, y nuestro `stores.json` dice El Zoco. Mientras no lo aclares, el rótulo es **VILLANUEVA**, que es el nombre que no puede estar equivocado.

---

## 3. Una sola prioridad por tienda — **sí, basta una** · confianza alta

**Decisión.** Un campo `prioridad` con cuatro valores (visita, oferta, socio, asesoramiento) que intercambia **un** bloque en un hueco fijo, idéntico en las cinco plantillas. Sin más grados de libertad. `store.sections` se queda como válvula del operador, nunca del franquiciado, y con un validador que impida sacar el horario del primer scroll.

**Por qué.** La evidencia sobre «una sola llamada principal» habla del visitante y la resuelve la plantilla, no la tienda: Google y AnswerLab, sobre 119 sesiones de usabilidad de una hora, observaron que las tareas se completaban mejor con las llamadas primarias en el cuerpo y las secundarias bajo el pliegue `[V]`; NN/g pide fijar la jerarquía antes de diseñar y no pasar de dos elementos dominantes `[V]`. Eso ya lo fijan R1-R3. La prioridad solo decide **lo segundo** que se ve.

Sobre la sobrecarga de elección, la evidencia es matizada y conviene decirlo: el meta-análisis grande da un efecto medio prácticamente nulo `[V, Scheibehenne 2010, 50 experimentos, N=5.036]`, y el que sí lo encuentra explica cuándo `[V, Chernev 2015, 99 observaciones, N=7.202]`: preferencia poco articulada, tarea con muchos atributos, prisa. Cuatro opciones nombradas por objetivo de negocio están lejos de ese régimen; un array de 14 a 27 bloques por plantilla cae de lleno. Lo que de verdad decide el resultado no es el número de opciones sino **el valor por defecto**: el consentimiento efectivo pasa del 42 % al 82 % solo por cambiar la forma de la pregunta `[V, Johnson & Goldstein, Science 2003]`, y la gente casi nunca usa la personalización que se le ofrece `[V, Nielsen]`. Por eso el defecto lo pone la plantilla y la prioridad es el único opt-out.

Y hay un dato de casa que lo cierra: las ocho tiendas ya producen **seis perfiles distintos** solo por omisión de dato `[medido]`. La variación ya existe sin tocar nada.

**Lo que cambia, y es un arreglo real:** hoy en Rótulo la zona móvil está en el puesto 5 y dos de los cuatro valores no harían nada. Pasa al **puesto 2**, justo bajo el hero, con Oferta como ocupante por defecto. Y `prioridad` junto con `sections` pasa a ser error de build: dos fuentes de orden es una de más. Con esto se cierra también la pregunta 8 de la síntesis, y la respuesta es que **socio no es especial**: es el mismo intercambio en el mismo hueco.

**Riesgo que asumo por escrito:** con los datos de hoy, «oferta» no haría nada en 8 de 8 tiendas porque no hay ninguna oferta viva. Por eso la caída al defecto con aviso no es un extra, es obligatoria, y en la sesión de alta solo se ofrecen los valores que esa tienda puede sostener.

---

## 4. Calendario de festivos — **por centro comercial, y la ley importa menos de lo que parecía** · confianza alta

**Decisión.** La unidad es el **centro comercial**, no la tienda ni la comunidad autónoma. El fichero es `src/data/festivos/<centro>.json` con las fechas en que el centro abre distinto o no abre, cada una con su fuente y su fecha de lectura. Lo rellena el operador una vez al año con lo que publica el propio centro, y lo confirma el franquiciado en la sesión de alta.

**Por qué la ley importa menos de lo que parecía, que es el hallazgo de esta pregunta.** La Ley 1/2004 de Horarios Comerciales, artículo 5, da **plena libertad para determinar los días y las horas** a los establecimientos de menos de 300 m² de superficie útil de exposición y venta que no pertenezcan a grupos de distribución sin consideración de pyme `[V, BOE-A-2004-21421]`. Nuestras tiendas son pequeñas y cada franquiciado es una sociedad independiente (USA GOVE S.L., NM10 SHOP S.L., leídas en `stores.json`). Es decir: **los calendarios autonómicos de apertura en domingos y festivos no les aplican**. Galicia autoriza 10 días en 2026, Andalucía 16, Aragón los suyos, Madrid tiene libertad horaria `[V, DOG 1-oct-2025; Junta de Andalucía; comercio.gob.es]` — y nada de eso decide si abre una tienda de 60 m². Lo que decide de verdad es **si abre el centro comercial**, porque si el centro está cerrado el cliente no llega a la puerta.

Eso también significa que **el calendario laboral no sirve para lo que parecía**. Sí sirve para una cosa barata y valiosa: marcar los días candidatos. La API de Nager.Date devuelve las 31 entradas de España para 2026 con su código de comunidad autónoma, es MIT y la instancia pública es gratuita `[V, probada: 9 nacionales más las autonómicas con ES-MD, ES-GA, ES-AR, ES-AN]`. Con eso el operador sabe qué 14 días del año tiene que preguntar por cada centro, en vez de mirar 365.

**Lo que cambia, y desbloquea algo que estaba parado.** El minutero «cierra en 2 h 15 min» se retiró entero. Con esto puede volver, pero acotado: se imprime **solo en días que no estén marcados**, que son unos 350 al año. En un día marcado sin horario confirmado, la página escribe «Hoy es festivo: consulta el horario del centro» y **nunca** una cuenta atrás ni un «abierto ahora». Sin fichero de festivos para ese centro, se imprime solo la franja del día, como ahora. La degradación es la de R3, ahora con datos.

**Coste:** unos 15 minutos por centro y año para leer el calendario del centro y teclearlo, más el aviso automático que dice qué centros tienen el fichero caducado. Para ocho tiendas, dos horas al año. Los seis centros que comparten tiendas se rellenan una vez.

**Queda abierto:** si algún centro no publica su calendario, la fecha se pregunta al franquiciado. Es puerta externa, pero pequeña y anual.

---

## 5. Place ID de Google — **un solo campo, derivado de lo que ya tenemos y verificado en el build** · confianza alta

**Decisión.** Un campo `placeId` por tienda, obligatorio en toda tienda con ficha y prohibido en la que declara no tenerla. El enlace de reseña se construye en un solo sitio. No se añade un segundo campo para el enlace corto del panel.

**Por qué, y aquí hay dos hallazgos.** El primero: **el Place ID se puede sacar de lo que ya está en el repositorio**. El HTML del embed por CID que ya guardamos trae dentro el identificador de la ficha, y la codificación se verificó contra el ejemplo oficial de Google y contra las siete tiendas: 7 de 7 coinciden `[medido]`. Ya están los siete valores. El segundo: **el enlace corto `g.page/r/…/review` que da el panel de Google no usa Place ID**, es el CID reempaquetado — se comprobó fabricando uno desde el CID de Villanueva y viendo que resuelve a la ficha de Villanueva `[medido]`. Guardarlo sería guardar el mismo dato dos veces con un formato que Google no documenta.

Google dice que los Place ID pueden cambiar y recomienda refrescarlos si pasan de doce meses `[V, documentación oficial]`. Por eso el build **comprueba** que el identificador guardado lleva dentro el mismo CID que el enlace: pegar el Place ID del centro comercial o de otra tienda deja de ser un enlace falso publicado y pasa a ser un error de compilación. Es la misma familia de guardas que ya evitó que enlazáramos la ficha del centro GranCasa.

**GranCasa:** sin ficha no se pinta ni la sección de reseñas ni la píldora ni un «sé el primero». No se anuncia el vacío. Crear su ficha es trabajo del franquiciado con su cuenta, unos 20-30 minutos más la verificación de Google, que puede tardar hasta cinco días laborables o dos semanas si va por carta `[V, soporte de Google]`.

**Un límite que digo yo:** la URL del formulario de reseña no aparece hoy en ninguna página viva de Google, solo en su ayuda archivada de 2019-2020. El endpoint responde `[medido, 6-sep]`, pero si Google la retira, el enlace cae automáticamente a «Ver en Google» por CID y el cambio es una línea. También: la política de Google prohíbe incentivar reseñas y presionar en el local, así que la píldora y el código QR son pasivos y el guion del dependiente es una invitación, nunca una condición.

---

## 6. Texto de marca — **lo escribe el operador desde un banco cerrado; la central firma una vez** · confianza alta

**Decisión.** Un fichero `docs/brand/textos-de-marca.md` con una fila por frase (texto, idioma, sección, tipo, procedencia, si contiene alegación, estado). Lo redacta el operador, lo revisa él mismo con una lista de siete preguntas, y la central firma **una vez** la versión completa del banco, no frase a frase. Ningún abogado mientras ninguna fila contenga una alegación de salud. La palabra en cursiva va **en español** en todos los titulares propios y en inglés solo dentro de los claims que ya cuelgan en la pared.

**Por qué importa y no es burocracia.** El Reglamento 1924/2006 **sí aplica** a la web de una tienda que no vende online: cubre las declaraciones en cualquier comunicación comercial, y el Tribunal de Justicia de la UE lee «comunicación comercial» con una definición tan amplia que incluye correo dirigido a médicos `[V, art. 1.2 y C-19/15]`. El responsable es el franquiciado, porque la web se publica bajo su CIF. Las sanciones son suyas: de 5.001 a 20.000 € las graves `[V, Ley 17/2011 arts. 44 y 52]`.

El principio que hace innecesario al abogado es de una línea: **los beneficios se predican de la tienda —hoy, en caja, en persona— y jamás de un alimento**. Una frase sobre la persona, lejos de un producto, no es una declaración; la misma idea pegada a un complemento sí lo es. Autocontrol calificó «máxima energía» y «máximo rendimiento» de declaraciones no autorizadas `[P, resolución de oct-2023 leída en un boletín secundario, no en la base original]`. Eso convierte en zona ámbar tres textos que ya habíamos escrito: la ruta «ENERGÍA Y RESISTENCIA», la ruta «CONTROL DE PESO» —que el reglamento nombra literalmente como categoría de declaración de salud— y la línea «proteínas, creatina, ganadores» si promete el efecto. Se reescriben como formato y surtido: la etiqueta nombra el objetivo de la persona, la línea de abajo lista categorías **sin conector causal**.

**Idioma:** lo decidió la marca en la pared. En el render de tienda hay cuatro claims en inglés, todos de cinco a siete palabras y todos con exactamente una palabra en cursiva. Se usan esos y no se inventa ninguno nuevo. Los titulares propios van en español, que es donde está el cliente.

**Un error que corrijo de paso:** nuestra propia gramática de marca transcribió «YOUR Journey IS OUR GOAL!» y el cartel dice «YOUR Success IS OUR GOAL!». Se corrige, y se añade «TODAY IS THE DAY TO GET RIGHT», que también está en la pared.

**Coste:** 26 frases para toda la flota, tres o cuatro horas una sola vez, y una revisión anual de una hora.

---

## 7. Vídeo-tour — **fichero propio, nunca YouTube** · confianza alta

**Decisión.** El vídeo se aloja en el dominio de cada tienda como vídeo nativo con póster y sin precarga: la fachada la pone el navegador, cero JavaScript y cero terceros. Tope duro en el build de 30 segundos y 4 MiB, sin pista de audio por defecto. Nunca un embed de YouTube, ni siquiera la versión sin cookies.

**Por qué, con la medición delante.** Un embed de YouTube cuesta, **antes de que nadie pulse play**, unas 16 peticiones y cerca de un megabyte contra seis servidores distintos, dos de ellos de DoubleClick, y la respuesta ya envía cookie `[medido]`. Eso es más que la página entera de GranCasa, que es la más pesada que tenemos. La versión «nocookie» no manda esa cookie pero descarga los mismos scripts, unos 756 KB `[medido]`. Y la fachada ligera que suele recomendarse carga la miniatura desde un servidor de Google y hace preconexión a DoubleClick al pasar el ratón: la dirección IP del visitante viaja antes del clic `[V, código de la librería]`, que es exactamente lo que R9 prohíbe.

En cambio, la Agencia Española de Protección de Datos dice que si una web ofrece contenidos audiovisuales, estos son parte del servicio solicitado por el usuario y quedan exceptuados de pedir consentimiento `[V, guía de mayo de 2024]`. Un vídeo del propio dominio no instala nada y no hay nada que declarar.

**Cabe.** El clip que ya servimos en GranCasa sin enlazarlo mide 2,15 MiB para 12,9 segundos `[medido, con un lector de cajas MP4 propio]`: un tour de veinte a treinta segundos entra en el tope con calidad de WhatsApp, que es la que el franquiciado ya acepta. Servirlo cuesta unos veinte céntimos por cada mil reproducciones `[V, precio de Railway]`.

**Y el fichero existe.** El anexo de la central promete al franquiciado el vídeo «listo para compartir» `[V]`, así que no dependemos de que nos lo den a nosotros. El canal de YouTube de la central, por cierto, no sube nada desde junio de 2019 y no tiene ningún tour de tienda `[V]`: incrustar YouTube sería incrustar nada.

**Queda abierto, y es tuyo:** qué es exactamente el clip de GranCasa, si el montaje de la central o una grabación del franquiciado, y si lleva música de biblioteca de redes sociales — porque esas licencias suelen cubrir solo el uso dentro de esas redes `[P]`. Por eso el audio se quita por defecto. Se resuelve abriendo el fichero.

---

## 8. Tipografía en Android — **fuente del sistema, no se compra nada, pero la pila estaba mal escrita** · confianza alta

**Decisión.** Se acepta la fuente del sistema para el cuerpo de Rótulo y no se compra ni se aloja ninguna cara de texto. Pero la pila que teníamos escrita se corrige: `'Helvetica Neue', Roboto, 'Segoe UI', Arial, sans-serif`, sin `-apple-system` delante y con Segoe UI **antes** de Arial. Pesos permitidos: 300, 400 y 700. Prohibidos el 500 y el 600.

**Por qué. Aquí hay un fallo nuestro que la investigación cazó.** La pila anterior empezaba por `-apple-system`, que en iPhone pinta San Francisco y no Helvetica Neue: la frase «en iPhone la pila es la fuente del brand book» era falsa por culpa de nuestra propia pila. Y Arial iba antes que Segoe UI, cuando **Arial no tiene Light** y Segoe UI sí: en Windows, que es el 31 % de nuestras visitas, el Light + Bold del elemento 6 de la marca simplemente moría `[medido en la máquina del operador]`.

Sobre comprar Helvetica: en España el móvil es 68,6 % Android y 31,4 % iOS `[V, StatCounter ago-2026]`. Solo alrededor de una cuarta parte de las visitas vería la Helvetica de verdad aunque la compráramos, y esa cuarta parte **ya la ve gratis** porque Apple la instala con Light. Android trae Roboto con el rango completo de pesos y Windows trae Segoe UI Light y Bold, los dos a coste cero. La licencia web de Monotype se vende por dominio y por páginas vistas al mes con renovación anual: sería el único activo de pago del producto y escalaría con cada tienda nueva `[V, condiciones de MyFonts]`. Los clones libres de Helvetica no sirven para este papel porque no tienen Light `[medido]`.

**Detalles que van al plan:** todo dato numérico lleva cifras tabulares declaradas, porque Segoe UI Light no las trae por defecto `[medido]`. Y la aprobación se hace con tres capturas del mismo bloque: iPhone, Android y el Windows del operador. Si la cara de Segoe no te gusta, el plan B está medido: una fuente de respaldo de unos 20 KB que solo se descarga donde no hay Light.

---

## Lo que cambia en el sistema por estas ocho decisiones

**Campos nuevos de tienda:** `rotulo` (con salto de línea explícito permitido), `prioridad` (enum de cuatro), `placeId` (verificado contra el CID en el build), `fotoInterior`, `videoTour`, y el par `tipoLocal`/`mall` opcional para las once tiendas a pie de calle.

**Ficheros nuevos:** `src/data/festivos/<centro>.json`, `docs/brand/textos-de-marca.md`, `docs/plantillas/rotulo/rotulos-58.md`, `scripts/place-id.mjs`, `scripts/fuentes-rotulo.py`.

**Reglas nuevas:** el minutero vuelve, pero solo en días no marcados; los beneficios se predican de la tienda y nunca del alimento; el vídeo es siempre del propio dominio; la prioridad nunca toca el primer viewport ni la periferia.

**Puertas externas que siguen abiertas y que no puedo cerrar yo:** la firma de la central sobre qué puede publicar cada tienda, que sigue siendo el único riesgo capaz de invalidar el negocio; la ficha de Google de GranCasa; los beneficios del programa de socio por escrito; una foto de un cartel real para fijar los claims en inglés; y qué es el clip de vídeo de GranCasa.

## Autocrítica

- **El supuesto más frágil** es el de la pregunta 1: que una demo con datos pobres vende sin foto. Está apoyada en evidencia sobre personalización y en el coste medido de pedir material, pero **nadie ha enseñado todavía una demo de Rótulo a un prospecto**. Se mide con los tres primeros y, si se cae, Esquina sube a primera demo.
- **La parte más débil** es la de festivos. El razonamiento legal es sólido y la consecuencia —que manda el centro comercial— es correcta, pero no he comprobado que los centros de nuestras ocho tiendas publiquen su calendario: el sitio de Marineda City rechazó la conexión por un problema de certificado. Si no lo publican, el coste anual sube porque hay que preguntar al franquiciado.
- **Dos precedentes son de segunda mano:** la resolución de Autocontrol sobre «máxima energía» y el estudio de los 50 milisegundos. Ninguna decisión depende solo de ellos, pero conviene que conste.
- **Riesgo que no he cubierto:** todas estas decisiones son prosa. La única que cambia píxeles de verdad es la de tipografía, y su veredicto depende de una captura de Windows que aún no existe.
