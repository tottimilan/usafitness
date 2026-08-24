# CRÍTICO DE COMPLETITUD — lo que las 7 dimensiones han dejado fuera

## MÉTODO
He leído el código en lugar de razonar sobre los resúmenes: `src/layouts/Landing.astro`, los 13 componentes, `src/styles/global.css`, `src/sections/registry.ts`, `src/data/templates.ts`, `src/data/stores.json` volcado con Python, y el peso real de `public/`. Después he contrastado los 7 informes contra esa lectura buscando una sola cosa: qué es verificable en el repo o en el marco legal español y no aparece en ninguna de las ~90 propuestas. Cuando algo depende de un dato que no tengo, lo marco como pregunta y no como conclusión.

---

## DIEZ HALLAZGOS QUE NO ESTÁN EN NINGUNA DE LAS 7 DIMENSIONES

**1. El domingo no es un dato que falta: en 4 de 7 tiendas es un dato regulado, y encima subordinado a un tercero.** Volcado de `stores.json`: `vigo` (Pontevedra) y `arcangel` (Córdoba) publican `"De lunes a domingo: 10:00 a 22:00"`; `lasrosas` también; `marineda` (A Coruña) y `grancasa` (Zaragoza) `"De lunes a sábado"`; `villanueva` ni contempla sábado completo. Tres dimensiones han leído esto como "falta el domingo" y han propuesto un widget de "Abierto ahora". Ninguna ha visto dos cosas: (a) las 7 tiendas están **dentro de un centro comercial**, así que el horario real es la intersección del horario de la tienda con el del centro — el franquiciado no controla su propio calendario; (b) la apertura en domingo y festivo está regulada por comunidad autónoma y las 7 tiendas están en **cinco comunidades distintas** con cinco regímenes distintos (Madrid liberalizada; Galicia, Andalucía y Aragón con calendario anual de aperturas autorizadas, con exención habitual para establecimientos de reducida dimensión y para zonas de gran afluencia turística). Nadie ha comprobado bajo qué supuesto abre cada tienda. Un "Abierto ahora" calculado solo del horario regular mentirá el 25 de julio en Galicia, el 28 de febrero en Andalucía, el 2 de mayo en Madrid y durante las Fiestas del Pilar en Zaragoza — y mentirá justo en los días de mayor intención de búsqueda.

**2. `heroImage` es una prop muerta: las 7 tiendas comparten la misma foto de cabecera.** Verificado con grep sobre `src/`: `heroImage` aparece en `Hero.astro` solo en la línea 7 (interface) y la 12 (destructuring), y **no se usa ni una vez en el template ni en el `<style>`**. El `.hero-bg` tiene la ruta escrita a mano: `background-image: url('/hero-bg.jpg')` con `image-set()` a `/hero-bg.webp`. Es decir: `stores.json` guarda `/photos/vigo/hero.webp`, `registry.ts` la pasa como prop, `Landing.astro` la usa para el `og:image`… y el visitante ve la foto genérica en las 7 webs. Seis dimensiones se han quejado de que el contenido es idéntico entre dominios; ninguna ha encontrado que la única imagen a pantalla completa también lo es, por un bug de dos líneas. Y de propina: al ser un `background-image` de CSS, el elemento LCP se descubre tarde, no admite `fetchpriority` ni `preload`, y no hay ninguno en el `<head>`.

**3. Hay terceros cargándose hoy sin consentimiento y sin banner.** `Location.astro` incrusta `<iframe src={googleMapsEmbed}>` — petición a Google en cuanto el usuario baja. `Landing.astro` carga `fonts.googleapis.com` + `fonts.gstatic.com` con dos `preconnect`, o sea que la IP del visitante llega a Google **antes de pintar nada**. Y `CookieConsent.astro` tiene `const avisoCookies = analitica;` con `analitica = !!ga4Id`, y `ga4Id` está a 0 de 7: **hoy hay terceros y cero aviso de cookies**. El propio comentario del fichero dice "hoy eso no incumple — sin GA4 no se instala ninguna cookie", y esa afirmación es falsa mientras el iframe de Maps y las fuentes de Google estén ahí. Además el texto del banner ("cookies analíticas propias y de terceros") no describe ni al mapa ni a las fuentes. Dos dimensiones han avisado de que un futuro embed de YouTube tiene que ir detrás del consentimiento; ninguna se ha dado cuenta de que el embed ya está puesto.

**4. 8,5 MB de fotos sin una sola imagen responsive.** `du`: `public/photos` = 8,5 MB; la mayor, `lasrosas/tienda-3.webp` = 337 KB; `alcobendas` sigue en **JPG** (271, 252, 251 KB). `Gallery.astro` declara `width="400" height="300"` y sirve el original a pantalla completa: no hay `srcset`, ni `sizes`, ni `<picture>`, ni AVIF. En una rejilla de 400 px se están descargando imágenes de 300 KB. El presupuesto de 162 KB que menciona una dimensión es solo el *viewport inicial*; al hacer scroll, una tienda son ~1,5-2 MB. Esto importa exactamente en el escenario del negocio: 4G saturada dentro de un centro comercial de hormigón.

**5. Accesibilidad: no es que esté a medias, es que no existe como criterio.** Verificado: (a) `grep -rn "focus" src/` devuelve **solo** `.btn-outline` — cero reglas `:focus-visible` en todo el proyecto; (b) no hay enlace de salto al contenido; (c) `Footer.astro` mete un `<button data-uf-cookie-config>` como **hijo directo de un `<ul>`**, fuera de cualquier `<li>` — HTML inválido y navegación por lista rota; (d) las tres pestañas de `Reviews.astro` tienen el **mismo nombre accesible** ("Reseña de Google"), no tienen `id`, los paneles no tienen `aria-labelledby` ni `tabindex`, y el patrón de pestañas ARIA no responde a flechas: con teclado o lector de pantalla son tres botones idénticos e indistinguibles; (e) las estrellas son `{'★'.repeat(stars)}` en un `<p>`, que un lector lee carácter a carácter; (f) el bloque `@media (prefers-reduced-motion: no-preference)` de `global.css` está **vacío**, con un `@keyframes fadeIn` y varios `transform` activos; (g) `role="dialog"` en el banner de cookies sin ninguna gestión de foco; (h) aritmética del CTA principal: `.btn` da 47 px de alto, pero `.header-phone` lo sobreescribe a `padding: .5rem 1rem; font-size: .85rem` y en ≤480px a `.4rem/.8rem` con `font-size: .8rem` — **el botón "Llámanos", que es una de las tres conversiones declaradas del negocio, mide ~28-30 px de alto en el móvil**, el objetivo táctil más pequeño de la página.

**6. El sistema no tiene ninguna dimensión de idioma.** `Landing.astro` fija `<html lang="es">` y `og:locale content="es_ES"` como literales. Dos de las siete tiendas están en Galicia (Marineda/A Coruña, Vigo/Pontevedra). Corrección al encargo: **hoy no hay ninguna tienda en Cataluña**, así que el catalán no es un problema actual — pero sí es el que muerde el día que la franquicia abra allí, porque el Codi de consum català sí impone obligaciones lingüísticas a la información al consumidor, mientras que en Galicia la exposición práctica es menor. Lo relevante no es traducir hoy: es que la plantilla no tiene dónde poner un idioma, y el coste de abrir esa costura después de 7 dominios y 170 URLs es varias veces el de abrirla ahora.

**7. GranCasa: una tienda sin abrir con una landing que afirma que está abierta.** Volcado: `grancasa` tiene 0 fotos, 0 reseñas, `company` completo y `schedule: "De lunes a sábado: 10:00 a 22:00"`, mientras el propio franquiciador la marca como PRÓXIMAMENTE. Como el `visible()` del registry oculta galería y reseñas, la página resultante es un esqueleto que además **emite `openingHoursSpecification` en el JSON-LD para un local que no atiende a nadie**. `stores.json` no tiene ningún campo de estado: no existe "próxima apertura", ni "cerrada temporalmente", ni "traslado", ni "cerrada". En retail de franquicia esos cuatro estados ocurren; el modelo de datos no los contempla.

**8. La pregunta que no ha hecho nadie: ¿el contrato de franquicia permite esto?** Siete dominios contienen la marca registrada (`usafitnessvigo.com`, `usafitnessmarineda.com`…), usan el logotipo, y publicarían el PDF de marca, las fotos de dos expertos corporativos y ocho logotipos de terceros. El propio ANEXO de Integración Digital demuestra que la central **regula la presencia digital del franquiciado**. Es completamente habitual que un contrato de franquicia reserve al franquiciador el uso online de la marca y el registro de dominios que la incorporen. Si esa cláusula existe, no estamos ante una mejora pendiente: estamos ante un producto entero construido sobre un permiso que nadie ha comprobado, con siete dominios reclamables. Todas las dimensiones dan por hecho que el activo es del franquiciado.

**9. Nadie ha costeado el mantenimiento, solo la construcción.** Las ~90 propuestas están valoradas en esfuerzo de *build* (S/M/L/XL) y ninguna en **coste anual de conservación por dominio**. Una FAQ local, una agenda de eventos, un listado de marcas por tienda, una ficha de planta y parking, un video tour y una barra de promoción son, cada uno, un compromiso de revisión periódica multiplicado por 7 y ejecutado por una persona. Varias dimensiones nombran "una sección abandonada es peor que ninguna" en el apartado de riesgo, y ninguna convierte eso en un criterio que elimine propuestas antes de construirlas.

**10. El operador cobra a dos tiendas por competir entre sí.** Tres dominios en Madrid, y una dimensión propone descanibalizarlos reasignando `location` de "Madrid" a "San Blas-Canillejas". Eso es correcto técnicamente y es un **conflicto de interés no declarado**: quien decide qué zona se lleva la consulta genérica de la ciudad es el proveedor, pagado por las dos partes. Con la franquicia abriendo tiendas, la segunda tienda a 3 km de una existente es cuestión de tiempo. No hay ninguna regla escrita de arbitraje ni ninguna divulgación al cliente.

---

## PROPUESTAS

- **[servicio] Verificar el derecho contractual a dominio y web propios con la marca** (impacto alto, esfuerzo S)
  - **qué:** Leer la cláusula digital del contrato de franquicia de al menos una de las sociedades y pedir a la central una autorización por escrito (aunque sea un email) que cubra: uso de la marca en dominio y web, uso del logotipo, distribución del PDF de la guía, uso de nombre e imagen de los dos expertos, y uso de los logotipos de las 8 marcas de producto que ya se publican hoy en `Brands.astro`.
  - **por qué aquí:** Es la única propuesta de las ~90 que puede invalidar a todas las demás. Las 7 dimensiones asumen que las landings son un activo legítimo del franquiciado y discuten cómo mejorarlas; ninguna ha verificado el permiso. El ANEXO prueba que la central regula la presencia digital y llega al detalle de exigir quién debe ser titular de las cuentas de redes. Un franquiciador que regula eso muy probablemente regula también el dominio.
  - **requiere:** Nada técnico. Un PDF que ya tiene el franquiciado y una conversación con la central. Es la primera llamada, no la última.
  - **riesgo:** El riesgo de no hacerlo es un requerimiento de cese con 7 dominios registrados y un producto sin salida. El riesgo de hacerlo es abrir un melón que la central podría preferir gestionar ella — pero eso ya está latente, y es mejor negociarlo desde una web funcionando que descubrirlo por burofax.

- **[funcionalidad] Horario como intersección con el centro comercial + excepciones fechadas (`specialOpeningHoursSpecification`)** (impacto alto, esfuerzo M)
  - **qué:** Modelar tres cosas que hoy son un string de dos líneas: (1) el horario regular por día; (2) el **calendario de excepciones** con fecha, con horario especial o cierre, y con caducidad automática; (3) el horario del centro comercial como restricción, con enlace a su página oficial. El JSON-LD emite `openingHoursSpecification` **más** `specialOpeningHoursSpecification`, que es la propiedad que Google usa para festivos y que hoy no se emite.
  - **por qué aquí:** Tres dimensiones proponen "Abierto ahora" y ninguna nombra el problema real: las 7 tiendas están dentro de un centro comercial, así que el horario que importa lo fija un tercero, y los festivos difieren en cinco comunidades autónomas (25 de julio en Galicia, 28 de febrero en Andalucía, 2 de mayo en Madrid, Pilar en Zaragoza, más los dos locales de cada municipio). Un estado en vivo calculado del horario regular es un generador automático de mentiras varias veces al año, y falla justo en enero — el mes de máxima intención del sector y el más excepcional del calendario. Con excepciones fechadas, el "Abierto ahora" pasa de ser un riesgo a ser el argumento de venta que dicen las demás dimensiones.
  - **requiere:** Del franquiciado: horario real por día y el calendario del centro (que el centro publica). Y una respuesta que nadie ha pedido: **bajo qué supuesto abre en domingo** cada tienda de Galicia, Andalucía y Aragón — exención por superficie, zona de gran afluencia turística, o día del calendario anual autorizado. Sin esa respuesta no se publica "de lunes a domingo".
  - **riesgo:** Publicar apertura en domingo donde no está amparada es una infracción de horarios comerciales contra la sociedad franquiciada, no contra el operador, y además es una promesa que rompe al cliente que se desplaza. Segundo riesgo: un calendario de excepciones sin dueño se queda obsoleto y es peor que no tenerlo — la caducidad automática por fecha no es opcional.

- **[funcionalidad] Arreglar el hero: foto por tienda y LCP como `<img>` priorizado** (impacto alto, esfuerzo S)
  - **qué:** Usar la prop `heroImage` que ya llega y hoy se ignora, sustituyendo el `background-image` fijo por un `<img>` posicionado en absoluto con `fetchpriority="high"`, `decoding="async"`, `width`/`height` y `srcset`. Media hora de trabajo.
  - **por qué aquí:** Es simultáneamente el bug de diferenciación más barato del repo y la mejora de rendimiento más grande. Seis dimensiones piden contenido distinto entre dominios sin ver que la imagen a pantalla completa —lo primero y más grande que ve el usuario— es la misma en las 7 por un descuido de dos líneas. Y como hoy el LCP es un fondo CSS, el navegador no puede descubrirlo hasta parsear el CSS: en la conexión de un centro comercial eso son cientos de milisegundos regalados en la métrica que el operador vende.
  - **requiere:** Nada. Las fotos ya existen en `public/photos/{slug}/hero.webp` para 6 de 7 tiendas y ya están referenciadas en `stores.json`.
  - **riesgo:** El overlay `--hero-overlay` está calibrado sobre la foto genérica actual. Con siete fotos distintas, el contraste del texto sobre la imagen deja de ser predecible — hay que verificarlo tienda por tienda (ver la propuesta de accesibilidad), y en la plantilla `angular` el overlay baja a 0.62, con lo que el problema es mayor ahí.

- **[funcionalidad] Sacar a los terceros de delante del consentimiento: fachada de Maps y fuentes autoalojadas** (impacto alto, esfuerzo S)
  - **qué:** Dos cambios. (1) Sustituir el `<iframe>` de Google Maps por una fachada: imagen estática del mapa con el pin, botón "Ver mapa", y el iframe solo se inserta al pulsar. (2) Autoalojar Inter con subset latino y `font-display: swap`, eliminando los dos `preconnect` y la hoja de estilo externa. (3) Desacoplar de verdad `avisoCookies` de `analitica` en `CookieConsent.astro` y reescribir el texto del banner para que describa lo que realmente hay.
  - **por qué aquí:** Nadie ha mirado qué se está cargando hoy. El comentario del propio `CookieConsent.astro` afirma que sin GA4 no se instala ninguna cookie, y el mapa y las fuentes desmienten esa afirmación en las 7 webs. Además las dos cosas se arreglan con el mismo movimiento y **mejoran las tres cosas a la vez**: cumplimiento, rendimiento (dos handshakes TLS menos y una hoja de estilo bloqueante menos, que en 4G de centro comercial es la diferencia más notable de toda la lista) y robustez, porque los portales cautivos de wifi de centro comercial rompen precisamente las peticiones a terceros.
  - **requiere:** Nada externo. Los ficheros de Inter se descargan una vez y se sirven desde `public/`.
  - **riesgo:** La fachada del mapa cambia una interacción que hoy es pasiva por una que exige un clic; hay que medir si baja el uso de "cómo llegar", que es una de las tres conversiones declaradas. Mitigación: el botón "Abrir en Google Maps" de `Location.astro` sigue existiendo y es el que de verdad convierte en móvil.

- **[funcionalidad] Estado de la tienda como dato de primera clase** (impacto alto, esfuerzo S)
  - **qué:** Campo `estado` por tienda con cuatro valores: `proxima-apertura` (con fecha si la hay), `activa`, `cerrada-temporalmente` (con motivo y fecha de vuelta) y `cerrada` (con la tienda alternativa más cercana). El estado gobierna qué secciones se pintan, qué dice el hero, si se emite `openingHoursSpecification`, si la página entra en el sitemap y si va a `noindex`.
  - **por qué aquí:** GranCasa ya está en ese caso hoy: 0 fotos, 0 reseñas y un horario publicado con marcado estructurado para un local que el franquiciador anuncia como próxima apertura. Ninguna dimensión lo ha nombrado, aunque tres usan a GranCasa como ejemplo de datos incompletos. Y una preapertura bien modelada no es un problema, es un activo: "Abrimos en GranCasa el X" es contenido único, con marcado válido, que empieza a acumular autoridad antes de tener producto. Al otro extremo, el día que una franquicia cierre —y en retail cierran— la web tiene que decirlo o se convierte en una máquina de mandar clientes a una persiana bajada, con el daño de reseñas correspondiente.
  - **requiere:** Un dato del franquiciado y una regla en `registry.ts`, que es exactamente el sitio donde ya viven las guardas `visible()`.
  - **riesgo:** Bajo. El único cuidado es no dejar una tienda marcada `cerrada-temporalmente` indefinidamente: el estado necesita fecha de revisión.

- **[servicio] Protocolo de baja: propiedad de los activos y qué se lleva el franquiciado** (impacto alto, esfuerzo M)
  - **qué:** Documento de una página, firmado al alta, que fije: quién es el **titular registral** de cada dominio y quién paga la renovación; quién es propietario de la propiedad GA4 y de Search Console; quién es propietario de la ficha de Google Business (el franquiciado siempre; el operador es gestor); de quién son los derechos de las fotos que haga el operador; qué se entrega si el cliente se va (export del bloque de la tienda en JSON, fotos en original, textos legales, acceso a las propiedades) y en qué plazo; y qué sirve el dominio a partir de ese día.
  - **por qué aquí:** Ninguna de las 7 dimensiones ha escrito la palabra "baja". Todas diseñan el alta y la recurrencia. Y el diseño actual tiene una asimetría explosiva: el contenido, las fotos y los textos legales de 7 empresas independientes viven en **un repositorio y un servicio de Railway del operador**. Si el operador retiene el dominio, tiene un problema legal serio de marca ajena; si lo retiene el franquiciado y se va, se lleva un sitio que sigue usando la marca del franquiciador sin nadie manteniéndolo. Además hay una bomba de relojería silenciosa: si un dominio no se renueva, esa tienda pierde a la vez la web, el SEO acumulado y la coherencia NAP con la ficha de Google y con el directorio del centro. Nadie ha nombrado la renovación de dominios.
  - **requiere:** Nada técnico. Una plantilla y una conversación por cliente. Conviene ejecutarlo antes de invertir en contenido local, porque el contenido local es lo que hace doloroso perderlo.
  - **riesgo:** Hablar de la salida al principio de la relación incomoda comercialmente. Contrapeso honesto: un cliente que se siente atrapado se va igual, y peor. Y el escenario que este documento evita —un franquiciado que se va enfadado y reclama unos datos que están mezclados con los de otras seis empresas— es mucho más caro que la conversación incómoda.

- **[funcionalidad] Imágenes responsive y presupuesto de peso por página** (impacto alto, esfuerzo M)
  - **qué:** `srcset` + `sizes` con 3 anchos por foto, AVIF con respaldo WebP, reconvertir los JPG de Alcobendas, y un presupuesto explícito por página (por ejemplo 500 KB de imágenes en total, 150 KB en el viewport inicial) verificado en el build por el mismo script que ya se propone para comprobar que los ficheros existen.
  - **por qué aquí:** 8,5 MB en `public/photos`, hasta 337 KB por foto, y `Gallery.astro` sirviendo el original a una rejilla de 400 px. Una dimensión cita el presupuesto de 162 KB como si fuera el peso de la página, y es solo el viewport inicial. El escenario real del negocio es una persona con una barra de cobertura dentro de un centro comercial de hormigón, en 4G compartida con miles de personas o en una wifi con portal cautivo. Nadie ha propuesto ni una sola medida de imagen, aunque las imágenes son el 95% del peso.
  - **requiere:** Nada externo. Astro tiene `<Image>` y `<Picture>` con generación de variantes; también sirve un script de conversión una vez y `<picture>` a mano.
  - **riesgo:** Con `output: 'server'`, la optimización de imágenes en tiempo de petición consume CPU del mismo proceso que sirve las 7 webs. Es preferible generar las variantes en build o precomputarlas fuera y servirlas como estáticas.

- **[seccion] Accesibilidad WCAG 2.2 AA como criterio de aceptación de cada sección nueva** (impacto alto, esfuerzo M)
  - **qué:** Arreglar lo que hay y convertirlo en regla. Concreto y verificado: enlace de salto al contenido; reglas `:focus-visible` en el sistema de tokens (hoy hay cero en todo `src/`); sacar el `<button>` de dentro del `<ul>` en `Footer.astro`; rehacer las pestañas de `Reviews.astro` con nombres accesibles distintos (autor y fecha, no tres veces "Reseña de Google"), `id`+`aria-labelledby`, `tabindex` y navegación con flechas — o sustituirlas por tres citas apiladas y borrar el único script no esencial de la web; dar nombre accesible a las estrellas ("5 de 5"); llenar el bloque vacío de `prefers-reduced-motion`; subir el CTA "Llámanos" a 44 px de alto en móvil (hoy ~28-30 px); y verificar el contraste del texto del hero sobre cada una de las 7 fotos, no sobre la genérica. A partir de ahí, ninguna sección nueva entra en `registry.ts` sin pasar la lista.
  - **por qué aquí:** Es una dimensión entera que no ha tratado nadie, y en este negocio no es un tema de cumplimiento sino de conversión: el usuario típico está de pie en un pasillo, con una bolsa en una mano, con reflejo en la pantalla y el pulgar en el móvil. El botón más importante del negocio es el objetivo táctil más pequeño de la página. Sobre el marco legal, la posición honesta: la Ley 11/2023 traspone la Directiva europea de accesibilidad y es exigible desde el 28 de junio de 2025 para determinados servicios, con exención para microempresas prestadoras de servicios y con un ámbito centrado en el comercio electrónico — una landing sin transacción y operada por una sociedad pequeña probablemente hoy queda fuera. Lo que cambia el análisis es exactamente lo que proponen las otras dimensiones: el primer formulario, la primera reserva, el primer alta VIP. Conviene que lo confirme un asesor, no yo, y conviene construirlo antes de necesitarlo.
  - **requiere:** Nada externo. La norma técnica de referencia en España es la UNE-EN 301 549, que remite a WCAG 2.2 AA.
  - **riesgo:** El riesgo es tratarlo como una auditoría única. Sin criterio de aceptación por sección, con 20 secciones nuevas cada arreglo se deshace en tres meses. Y una advertencia sobre la tentación fácil: un widget de accesibilidad de terceros no arregla nada, mete JavaScript de terceros y añade un tratamiento de datos más.

- **[funcionalidad] Aviso operativo efímero por tienda, con caducidad obligatoria** (impacto alto, esfuerzo S)
  - **qué:** Un campo por tienda con texto corto, tipo (informativo/urgente) y **fecha de fin obligatoria**, que pinta una franja bajo el header: "Hoy cerramos a las 18:00 por inventario", "Estamos de reforma, seguimos atendiendo en la planta baja", "Abrimos el 6 de enero de 11:00 a 20:00".
  - **por qué aquí:** Todas las dimensiones han modelado el contenido de marketing (promociones, campañas, eventos) y ninguna el contenido operativo, que es el que un comerciante necesita de verdad y el que hoy resuelve llamando al operador. Es la pieza que más rápido convierte la web en algo vivo a ojos del franquiciado, la que mejor justifica una cuota recurrente, y la que menos cuesta. Además es el complemento natural de las excepciones de horario: lo que no cabe en un calendario cabe aquí.
  - **requiere:** Nada técnico. Sí requiere que el franquiciado tenga una vía de pedirlo — y ahí engancha con la ruta de contenido caliente que propone la dimensión de sistema.
  - **riesgo:** Sin fecha de fin obligatoria en el esquema, esto se convierte en el sitio donde se pudren los avisos de hace ocho meses. La caducidad no puede ser una convención: tiene que ser un campo requerido que oculte la franja sin intervención humana.

- **[funcionalidad] Modo degradado: la web sigue dando teléfono, dirección y horario aunque Railway caiga** (impacto medio, esfuerzo S)
  - **qué:** Una copia estática mínima por dominio (nombre, dirección, teléfono, horario, enlace a Maps y a WhatsApp) servida desde el borde de Cloudflare cuando el origen no responde, más un monitor de disponibilidad externo con aviso.
  - **por qué aquí:** `memory/08` ya declara "single Railway service = single point of failure for all 5 store domains" y ninguna de las 7 dimensiones lo ha convertido en propuesta más allá de "monitorización". La monitorización te dice que estás caído; no evita que un cliente que busca el teléfono desde dentro del centro comercial no lo encuentre. Y como los 7 dominios ya están detrás de Cloudflare y el contenido crítico son cinco datos de texto, el modo degradado es casi gratis. Es además el único argumento honesto de continuidad frente a un franquiciado que pregunta qué pasa si el proveedor desaparece.
  - **requiere:** Acceso a Cloudflare, que ya existe. Cero cambios en la aplicación.
  - **riesgo:** Una copia estática desactualizada que sirva un horario viejo durante una caída. Se evita generándola en cada despliegue desde el mismo `stores.json`, nunca a mano.

- **[funcionalidad] Presupuesto de mantenimiento por sección y regla de muerte** (impacto alto, esfuerzo S)
  - **qué:** Añadir a cada sección del catálogo dos atributos que hoy no tiene ninguna propuesta: **frecuencia de refresco** (nunca / anual / trimestral / mensual / semanal) y **quién aporta el dato**. Regla: si una sección exige refresco más de una vez al año y no está vendida como línea recurrente, no se construye. Si el dato lo aporta el franquiciado y el franquiciado no lo ha aportado, la sección no se pinta —cosa que `registry.ts` ya sabe hacer con `visible()`.
  - **por qué aquí:** Entre las 7 dimensiones hay del orden de 90 propuestas, valoradas todas en esfuerzo de construcción y ninguna en coste de conservación, para una persona y siete dominios. La aritmética de capacidad que hace la dimensión comercial para los servicios no se ha aplicado nunca al producto. Con este filtro, la agenda de eventos, la barra de promoción, el listado de gimnasios colaboradores y la ficha de parking del centro dejan de ser "impacto medio, esfuerzo S" y pasan a ser compromisos recurrentes que hay que cobrar o no adquirir.
  - **requiere:** Nada. Es una columna en la hoja de decisión y una línea en el registro de decisiones.
  - **riesgo:** Aplicado con dureza mata propuestas buenas. El contrapeso es que una sección viva mal mantenida ya está descrita como "peor que no tenerla" en cinco fichas distintas de las 7 dimensiones: aquí solo se está convirtiendo ese aviso repetido en un criterio que actúa antes de construir y no después.

- **[pagina] Muestrario: el catálogo visual de plantillas y secciones que el producto no tiene** (impacto medio, esfuerzo M)
  - **qué:** Un dominio o subruta interna, en `noindex`, que enseñe las plantillas disponibles y la librería de secciones con datos de ejemplo, para que el dueño de una tienda elija mirando en vez de imaginando. Y de paso, un "antes y después" con su propia tienda.
  - **por qué aquí:** `memory/00` define el producto como "el dueño de la tienda decide: se le muestran varias propuestas y elige estilo y secciones", y hoy la única forma de enseñar la plantilla `angular` es un parámetro `?plantilla=2` que solo funciona fuera del dominio canónico. Es decir: el artefacto central del modelo de venta no existe. Las 7 dimensiones proponen qué construir; ninguna propone cómo se vende ni cómo se decide. Y sin muestrario, cada decisión del cliente se toma por chat, que es exactamente donde se pierde.
  - **requiere:** Nada nuevo: `templates.ts` y `registry.ts` ya declaran todo lo necesario, y una tienda de mentira con datos ficticios evita usar datos reales de clientes.
  - **riesgo:** Que se convierta en un segundo producto que mantener. Debe generarse del mismo código que las webs reales, nunca ser una maqueta aparte que se desincroniza.

- **[servicio] Contrato marco de servicio: alcance, responsabilidad y quién responde de lo publicado** (impacto alto, esfuerzo M)
  - **qué:** Un contrato de prestación de servicios por sociedad, separado del contrato de encargado del tratamiento del art. 28 que ya proponen dos dimensiones. Debe fijar: qué incluye la cuota y qué no; tiempos de respuesta reales para una persona sola (incluidas vacaciones); que el franquiciado es el responsable del contenido comercial y de los datos legales que aporta y el operador de su publicación fiel; límite de responsabilidad; y la salida.
  - **por qué aquí:** La dimensión comercial construye un catálogo de cuatro cajones y módulos recurrentes sin ningún contrato debajo. Y hay una exposición concreta que nadie ha nombrado: el operador publica, en nombre de siete sociedades distintas, porcentajes de descuento, afirmaciones sobre horarios, textos legales y —si prosperan las propuestas de contenido— afirmaciones sobre nutrición. Si llega una reclamación de consumo por un "Hasta 20% dto." que una tienda no aplica, hoy no hay ningún papel que diga quién responde. Un SLA con tiempos comprometidos y una sola persona sin contrato es, además, un incumplimiento programado para el primer agosto.
  - **requiere:** Asesoría legal, una vez, para una plantilla reutilizable. El operador no es asesor jurídico y el contrato debe decirlo expresamente.
  - **riesgo:** Formalizar puede asustar a un cliente acostumbrado a trabajar por WhatsApp. Es preferible a descubrir el reparto de responsabilidades con una reclamación encima de la mesa.

- **[contenido] Calendario de estacionalidad del sector y del centro comercial** (impacto medio, esfuerzo M)
  - **qué:** Un calendario anual de 6 hitos, no de 52: enero (propósitos, el pico del año en suplementación), marzo-mayo (preparación de verano), septiembre (vuelta a la rutina), Black Friday y Navidad, más los hitos propios de cada centro comercial (rebajas, campañas, actividades). Cada hito dispara lo mismo: el aviso operativo, la promoción vigente, la publicación en la ficha de Google y la creatividad de campaña.
  - **por qué aquí:** El sistema no tiene ninguna noción de fecha en ningún sitio, y solo una dimensión menciona la estacionalidad de pasada. En este sector la demanda no es plana: es un pico enorme en enero y otro antes del verano, y el resto es meseta. Toda la lista de propuestas está optimizada para el estado estacionario. Además hay un solapamiento que nadie ha visto: **el mes de máxima intención del año, enero, es el mes con más excepciones de calendario** (1 y 6 de enero, horarios de rebajas del centro) — es decir, la campaña más valiosa cae justo donde el dato de horario es menos fiable.
  - **requiere:** El calendario comercial de la marca y el de cada centro. Trabajo de coordinación, no de código.
  - **riesgo:** Un calendario anual planificado que nadie ejecuta es un documento muerto. Debe reducirse a los 6 hitos que caben en la capacidad de una persona, y cada hito debe tener una fecha de preparación anterior, no la fecha del evento.

- **[funcionalidad] Abrir la costura de idioma antes de necesitarla** (impacto medio, esfuerzo M)
  - **qué:** Un campo `locale` por tienda que alimente `<html lang>`, `og:locale` y, cuando haya más de una versión, `hreflang` y el selector. Hoy con un solo valor (`es-ES`) y sin traducir nada. Y una decisión escrita sobre qué pasa cuando haya una tienda en un territorio con obligaciones lingüísticas.
  - **por qué aquí:** `Landing.astro` fija `lang="es"` y `og:locale="es_ES"` como literales, y ninguna dimensión ha tocado el idioma. La corrección honesta al encargo es que hoy **no hay tienda en Cataluña** —las 7 están en Madrid (3), Galicia (2), Aragón y Andalucía—, así que el catalán no es un problema actual sino el que llega con la siguiente apertura, en una franquicia que declara más de 25 puntos de venta. En Galicia, la exposición práctica hoy es baja y el volumen de búsqueda en gallego para este vertical es marginal, así que **no propongo traducir**: propongo que exista el sitio donde poner el idioma, porque abrir esa costura con 7 dominios cuesta una tarde y con 170 URLs cuesta un proyecto.
  - **requiere:** Nada. Es un campo y tres sustituciones.
  - **riesgo:** El riesgo es el contrario del habitual: sobreactuar y traducir 7 webs al gallego por corrección, gastando el presupuesto de contenido en algo que no tiene demanda medible, en vez de en las 150-250 palabras locales de las que depende media lista de propuestas.

- **[servicio] Declarar el conflicto de interés y escribir la regla de reparto entre tiendas de la cadena** (impacto medio, esfuerzo S)
  - **qué:** Un párrafo en la propuesta comercial que diga que el operador trabaja para varias tiendas de la misma marca, incluidas tiendas que compiten por la misma consulta; y una regla escrita de reparto: qué tienda se queda la consulta genérica de la ciudad, qué zona ataca cada una, y qué pasa cuando abre una tienda nueva a menos de X km de una existente.
  - **por qué aquí:** Una dimensión propone reasignar la ubicación de Las Rosas de "Madrid" a "San Blas-Canillejas" para descanibalizar. Eso es correcto y es también una decisión que **quita visibilidad a un cliente para dársela a otro**, tomada por el proveedor de los dos, sin que ninguno de los dos lo sepa. Es el único punto de toda la lista donde el operador tiene un incentivo estructural que no coincide con el de su cliente. Declararlo es barato; que salga a la luz cuando un franquiciado compare posiciones con otro, no.
  - **requiere:** Nada. Y conviene que la regla la valide la central, que es quien de verdad tiene autoridad para arbitrar entre franquiciados.
  - **riesgo:** Un franquiciado puede exigir la consulta genérica de la ciudad como condición. Mejor tener esa discusión antes de cobrar que después de haber movido las posiciones.

- **[contenido] Política de contenido de nutrición: menores, lenguaje y trastornos de la conducta alimentaria** (impacto medio, esfuerzo S)
  - **qué:** Una página de reglas de redacción, corta, que aplique a la FAQ, a las guías, a las páginas de categoría y sobre todo a la calculadora que propone una dimensión: nada de promesas de resultado, nada de cifras de peso objetivo, nada de vocabulario de culpa, aviso explícito de que es orientación general y no pauta dietética, y una regla sobre menores — ni la calculadora ni el contenido de déficit calórico deben dirigirse a menores de 18.
  - **por qué aquí:** Varias dimensiones nombran el Reglamento 1924/2006 de declaraciones nutricionales, que es el riesgo regulatorio. Ninguna nombra el riesgo humano, que en nutrición deportiva es el conocido: una calculadora que devuelve calorías objetivo a una persona de 15 años con una relación complicada con la comida. Eso no es un problema de cumplimiento, es un daño, y además es el tipo de contenido que un evaluador de calidad de Google penaliza con dureza en salud. La propuesta de calculadora incluye un descargo genérico; esto es la línea que falta.
  - **requiere:** Nada externo. Idealmente una revisión por alguien con titulación real, que enlaza con la verificación de credenciales que ya piden dos dimensiones.
  - **riesgo:** Que quede en un documento y no en el proceso. Debe formar parte del criterio de aceptación de cada pieza de contenido, igual que la accesibilidad.

- **[funcionalidad] Medición de campo propia, porque CrUX no va a tener datos** (impacto medio, esfuerzo S)
  - **qué:** Recoger las métricas web reales de los propios visitantes (LCP, INP, CLS y TTFB) con unas líneas de script sin cookies, y guardarlas agregadas. Complemento, no sustituto, de GA4.
  - **por qué aquí:** Todas las dimensiones dan por hecho que el rendimiento es el producto y que se puede demostrar. No se puede: con el tráfico de una tienda local, el informe de experiencia de usuario de Chrome no tendrá muestra suficiente y Search Console mostrará el dato agregado o ninguno. Todo lo que el operador podrá enseñar son pruebas de laboratorio hechas desde su propio ordenador, que no se parecen a un móvil en 4G dentro de un centro comercial. Sin dato de campo, "tu web es rápida" es una opinión, y encima es la opinión sobre la que se justifica no meter pop-ups ni vídeos.
  - **requiere:** Nada externo si se recoge en el propio endpoint del servidor; sin cookies y sin identificador, no cambia la situación de consentimiento.
  - **riesgo:** Añadir JavaScript de cliente a un proyecto que presume de no tenerlo. Debe ser mínimo, diferido y no bloqueante — y si no cabe en menos de un kilobyte, no compensa.

- **[funcionalidad] Higiene de dominios: titularidad, renovación, bloqueo y `www`** (impacto medio, esfuerzo S)
  - **qué:** Inventario de los 7 dominios con titular registral, cuenta del registrador, fecha de renovación, renovación automática activada, bloqueo de transferencia y contacto de aviso. Y una decisión sobre `www`: hoy `Landing.astro` acepta `www.dominio` como host canónico y le sirve la página con `index, follow` y el canonical apuntando al ápice, así que las dos versiones responden 200 y todo depende del canonical. Un 301 de `www` al ápice en Cloudflare cierra el asunto.
  - **por qué aquí:** Toda la lista de propuestas invierte en un activo que caduca anualmente y cuya titularidad nadie ha documentado. Un dominio no renovado se lleva por delante el SEO, la coherencia NAP con la ficha de Google y con el directorio del centro, y el correo si lo hubiera — y se pierde en silencio. La dimensión de SEO local sí pregunta quién tiene el acceso DNS para verificar en Search Console, pero como requisito de una tarea, no como activo que hay que custodiar.
  - **requiere:** Acceso al registrador. Media hora.
  - **riesgo:** Ninguno técnico. El riesgo es descubrir que los dominios están a nombre de quien no debería, que es precisamente el motivo de hacerlo ahora y no dentro de un año.

- **[servicio] Derechos de imagen de las fotos que ya están publicadas** (impacto medio, esfuerzo S)
  - **qué:** Revisar las 30 fotos de `public/photos/` una a una buscando personas identificables (empleados y, sobre todo, clientes de paso), y o bien recabar consentimiento por escrito, o bien sustituir o difuminar. Aplicar la misma regla a las futuras sesiones de fotos y al video tour.
  - **por qué aquí:** Dos dimensiones piden consentimiento de imagen para la **futura** sección de equipo y para las **futuras** sesiones de fotos. Ninguna se ha preguntado por las fotos que ya están publicadas en 6 dominios, que además son material rescatado de los WordPress antiguos, es decir de origen y autoría no documentados. Un cliente que aparece de fondo en un escaparate y se ve publicado en una web comercial tiene una reclamación directa contra la sociedad franquiciada, y la protección de la Ley Orgánica 1/1982 no depende de que la foto sea buena. Y el video tour que exige la marca —trayecto por el interior del centro grabando otras tiendas— multiplica el problema, porque además incluye marcas y rótulos de terceros y zonas comunes cuyo permiso de grabación lo da el centro, no el franquiciado.
  - **requiere:** Mirar 30 ficheros. Es la propuesta más barata de esta lista.
  - **riesgo:** Si hay que retirar fotos, alguna galería se queda corta y su sección deja de renderizarse por la guarda `visible()` — que es el comportamiento correcto, pero hay que anticiparlo antes de que una web pierda una sección sin avisar.

---

## AUTOCRÍTICA

- **El supuesto del que más depende esta lista** es que los datos que he leído en `stores.json` describen la realidad. Si el horario de Vigo lo puso alguien copiando el del centro comercial y la tienda en realidad no abre domingos, mi hallazgo número 1 cambia de naturaleza: deja de ser un problema regulatorio y pasa a ser el mismo problema de dato sucio que ya han descrito otras tres dimensiones, y mi propuesta más elaborada pierde la mitad de su valor. Todo lo que digo sobre horarios hay que confirmarlo con cada franquiciado antes de mover una línea.
- **La parte más floja es el marco legal.** No soy asesor jurídico y las tres áreas que toco —horarios comerciales por comunidad autónoma, accesibilidad bajo la Ley 11/2023 y derecho de marca en el contrato de franquicia— tienen excepciones que dependen de datos que no tengo: la superficie de venta de cada local, si el centro está en zona de gran afluencia turística, el tamaño de cada sociedad, y el texto del contrato. He intentado formular cada una como pregunta verificable en lugar de como conclusión, pero un lector con prisa las leerá como conclusiones, y no lo son.
- **Riesgo que mi propia lista introduce y no he compensado:** he añadido 20 propuestas a un catálogo que ya tenía unas 90 para una persona, y al mismo tiempo he propuesto un criterio para matar propuestas. Es contradictorio si no se aplica el criterio también a lo mío. Aplicándolo: de mis 20, las que sobreviven a "impacto alto, coste de mantenimiento cero" son cuatro —el hero, los terceros detrás del consentimiento, el estado de la tienda y la verificación contractual— y esas cuatro deberían ir antes que casi todo lo demás de las otras siete dimensiones, porque tres se arreglan en una tarde y la cuarta puede invalidar el proyecto entero.
- **Sesgo consciente:** he ido a buscar lo que falta, así que he producido una lista de faltas. Eso da una imagen injustamente negativa de un repositorio que tiene decisiones notablemente buenas —el `noindex` por host no canónico, el rechazo razonado de `aggregateRating`, la guarda `visible()` por sección, el desacoplamiento de plantilla y contenido— y que está por encima de la media del sector en las cosas que suelen estar mal. La ausencia de accesibilidad y de dimensión de idioma no es negligencia: es lo que pasa cuando se prioriza correctamente durante un año.
- **Lo que no he podido verificar:** si las fotos actuales contienen personas identificables (no he abierto los ficheros de imagen), si los centros comerciales de Vigo y Córdoba están en zona de gran afluencia turística, si GranCasa ha abierto ya, y el contenido del contrato de franquicia — que es, con diferencia, el documento más importante de todos los que se han citado en las siete dimensiones y el único que nadie ha leído.

---

# VEREDICTO ADVERSARIAL — 7 analistas, 1 operador, 2 webs vivas

Todo lo que marco como **[verificado]** lo he comprobado yo en el repo esta sesión. Lo que viene de fuera (centros comerciales, comunidadusafitness.com, hemeroteca) lo marco **[no verificado por mí]** y lo trato como hipótesis, no como dato.

---

## 0. El error que comparten los 7 analistas

### 0.1 Escriben sobre 7 landings. Hay 2.

`C:\Users\totti\Desktop\Usafitness-webs\memory\02-current-state.md` **[verificado]**: solo **Vigo y Alcobendas** sirven este código. GranCasa está lista pero esperando DNS. Villanueva, Marineda, Las Rosas y El Arcángel **siguen en WordPress**.

Consecuencia que ninguno de los 7 documentos asume: cada propuesta que dice "en las 7 tiendas" — la capa de medición vía `stores.json`, las secciones nuevas, los badges, la FAQ, el schema, los breadcrumbs, las 170 URLs — **hoy no toca 5 de 7 dominios**. Rellenar `ga4Id` en `stores.json` para Marineda no mide Marineda: mide un servidor Astro que no sirve ese dominio.

Y el detalle más caro: tres analistas proponen **pilotar en El Arcángel** ("la tienda más completa"). El Arcángel está en WordPress. El piloto no se puede hacer ahí sin migrarla primero, y cuando se migre habrá cambiado el activo que se quería medir.

**Corolario duro:** mientras 4 dominios estén en WordPress, el "sistema de plantillas" no es un producto, es un prototipo con dos usuarios. Cualquier inversión en secciones nuevas antes de terminar la migración es construir la planta 4 de un edificio con dos plantas.

### 0.2 El truco "sin backend, todo por wa.me" funciona en 1 de 7 dominios

`stores.json` **[verificado]**, tienda por tienda:

| tienda | `phone` | `whatsapp` | estado real |
|---|---|---|---|
| villanueva | +34913916557 | **idéntico al fijo** | CTA sospechoso |
| marineda | +34881169567 | **idéntico al fijo** | CTA sospechoso |
| lasrosas | +34911464826 | **idéntico al fijo** | CTA sospechoso |
| alcobendas | +34919360967 | **idéntico al fijo** | CTA sospechoso |
| grancasa | +34876439039 | **ausente** | botón no se renderiza |
| arcangel | +34957916862 | **ausente** | botón no se renderiza |
| vigo | +34986916804 | +34661490626 | **único móvil real** |

No es "4 de 7 apuntan a fijo". Es: **1 de 7 tiene WhatsApp utilizable, 4 lo tienen apuntando a una centralita y 2 no lo tienen**.

Esto tumba, hoy, el mecanismo de escape que sostiene *toda* la parte accionable de cinco de los siete análisis: reserva de orientación por wa.me, encargos por wa.me, mensaje prellenado por sección, alta VIP por WhatsApp, difusión por WhatsApp Business, `/orientacion-gratuita`. Todas ellas son, en 6 de 7 dominios, **un enlace a una conversación que nadie va a leer**. Y el analista que propone medir clics de WhatsApp en GA4 mediría el ruido de un canal muerto y se lo enseñaría al franquiciado como conversión.

### 0.3 El agujero legal que buscan en el futuro ya está abierto en el presente

Los siete discuten el RGPD de formularios que no existen. Ninguno mira lo que ya se está sirviendo **[verificado]**:

- `C:\Users\totti\Desktop\Usafitness-webs\src\components\Location.astro` línea 21: **iframe de Google Maps** con `loading="lazy"`, sin ninguna puerta de consentimiento. Se carga en cuanto el usuario llega a la tercera sección — es decir, en la práctica siempre.
- `C:\Users\totti\Desktop\Usafitness-webs\src\layouts\Landing.astro` líneas 169-171: **Google Fonts** desde `fonts.googleapis.com` / `fonts.gstatic.com`, también sin consentimiento.
- `C:\Users\totti\Desktop\Usafitness-webs\src\components\CookieConsent.astro` línea 16: `const avisoCookies = analitica;` y `analitica = !!ga4Id`. Como **ningún** store tiene `ga4Id` (el campo ni siquiera existe en el JSON), **el banner de cookies no aparece en ningún dominio**.

El comentario del propio componente dice: *"sin GA4 no se instala ninguna cookie"*. Eso es **falso**: el embed de Maps es un tercero que fija cookies de Google y transfiere la IP antes de cualquier consentimiento (art. 22.2 LSSI). La web está hoy en la peor combinación posible: carga terceros y no pide consentimiento.

Nadie lo vio porque los siete estaban mirando el formulario que no existe en vez del iframe que sí existe.

---

## 1. Lo que hay que hacer ANTES que nada

Ordenado. Cada punto está antes del siguiente por una razón, no por gusto.

**P0.1 — Borrar las reseñas inventadas. Hoy. 20 minutos. Cero dependencias externas.** **[verificado]**
Las mismas tres autoras — *Hiba de la Iglesia Moreno*, *Amaya Guerra*, *Andrea García* — firman reseñas en **marineda, lasrosas y vigo**; *Andrea García* aparece además en **villanueva**. En marineda y lasrosas el texto es **idéntico palabra por palabra**. Son cuatro dominios de al menos tres sociedades distintas publicando testimonios de las mismas personas.

Esto no es "contenido duplicado" ni "un problema de credibilidad". Es publicidad con reseñas falsas: práctica desleal expresamente tipificada desde la transposición de la Directiva Ómnibus (TRLGDCU), reclamable por consumo contra **la sociedad titular de cada dominio**, no contra el operador. Y el operador es quien lo publicó.

No hay que "conseguir reseñas reales" primero — eso depende del franquiciado y por eso lleva meses bloqueado. Hay que **borrarlas ya**: el guard `visible: (s) => Array.isArray(s.reviews) && s.reviews.length > 0` en `C:\Users\totti\Desktop\Usafitness-webs\src\sections\registry.ts` ya oculta la sección sin tocar código, y GranCasa demuestra que la landing renderiza perfecta con 0 reseñas.

Es el único punto de las ~120 propuestas que combina riesgo máximo, coste nulo y dependencia cero. Que ninguno de los siete lo pusiera el primero es el fallo de priorización más grave del conjunto.

**P0.2 — Quitar las promesas comerciales sin fuente escrita.** **[verificado]**
Las 7 `metaDescription` terminan en **"Hasta 20% dto."** — una promoción indexada, sin fecha, sin origen documentado. Y `C:\Users\totti\Desktop\Usafitness-webs\src\components\Promotions.astro` publica cuatro porcentajes concretos (VIP 10%, funcionario 15%, cumpleaños 20%, cupón 5€ desde 49,90€) **hardcodeados e idénticos en las 7**, para un programa que es del franquiciador, no de las sociedades que firman los dominios.

La respuesta correcta **no** es la propuesta que hacen cuatro analistas ("una página que explique las condiciones"). Escribir condiciones detalladas de un programa que no controlas, en 7 dominios de 3 sociedades, multiplica la exposición por 7 en vez de cerrarla. La respuesta es: **quitar los porcentajes hasta que alguien los ponga por escrito**, y mientras tanto decir "consulta las promociones vigentes en tienda".

**P0.3 — Terminar la migración (DNS de GranCasa + 4 WordPress).**
Sin esto, todo lo demás se aplica a 2 dominios. Además los 4 WordPress son superficie de ataque que nadie mantiene y que, si cae uno, cae con el nombre de la marca.

**P0.4 — Resolver el dato de Villanueva.** **[no verificado por mí]** Un analista reporta que el hub de marca dice "C.C. La Pasada" donde `stores.json` dice "C.C. El Zoco". Si el equivocado es el JSON, **hay una dirección falsa publicada** y alimentando el `Store` schema. Es una llamada de teléfono y bloquea cualquier trabajo de NAP, schema o fichas.

**P0.5 — Un dato de WhatsApp por tienda, o esconder el botón.**
El código ya lo soporta sin cambios: `WhatsAppFloat` no renderiza si `whatsapp` está vacío. La decisión honesta es **vaciar el campo en las 4 tiendas donde apunta a un fijo** hasta que el franquiciado confirme un móvil. Mejor sin botón que con un botón que abre una conversación muerta. Pista concreta y barata **[no verificado por mí]**: un analista reporta que la ficha del centro de Alcobendas publica **685538136**, que es un móvil — probablemente el WhatsApp real de una de las dos tiendas que sí están vivas.

**P0.6 — Medición, pero la versión que un solo operador puede sostener.**
Aquí los siete aciertan en el diagnóstico y se pasan de frenada en la solución. "7 propiedades GA4 + eventos delegados + Consent Mode + 7 accesos al franquiciado" es un proyecto, no una tarea, y además solo funcionaría en 2 dominios.

El arranque correcto son las dos cosas que **no requieren consentimiento, ni JS, ni código**:
1. **Search Console por registro TXT en DNS** en los 7 dominios. Es lo único que responde la pregunta que sostiene toda la tesis del negocio ("¿alguien busca *suplementos GranCasa*?") y que hoy nadie ha medido nunca.
2. **Cloudflare Web Analytics** en las zonas que ya existen.

GA4 solo donde vaya a haber campaña, y **después** de arreglar el banner de cookies (P0.7). Encender GA4 antes es encender el banner en 7 dominios el mismo día que el iframe de Maps sigue cargando sin puerta.

**P0.7 — Poner el iframe de Maps detrás del consentimiento (o quitarlo).**
Coste: una fachada estática con imagen + clic, o directamente sustituir el iframe por un enlace a Maps (que ya existe en el Hero y en Schedule). Quitar el iframe además baja peso y elimina un tercero de la ruta crítica — es la única propuesta de este veredicto que mejora simultáneamente cumplimiento, rendimiento y CTA. Mismo tratamiento para Google Fonts: **autoalojar Inter** (~30 min) elimina una hoja de estilos bloqueante de tercero y la discusión legal entera.

**P0.8 — Smoke test de los 7 hosts + CI, ANTES de tocar `middleware.ts`.**
No hay `.github/`, no hay tests, no hay script `test` **[verificado]**. Un solo servicio Railway sirve todos los dominios. El refactor de `locals.store` que proponen dos analistas es correcto y hay que hacerlo — pero es el punto de entrada de las webs vivas y hoy no hay red. **El orden es test primero, refactor después.** Al revés es una apuesta con el negocio del cliente.

---

## 2. Humo, cargo cult y "porque lo hace todo el mundo"

**Las ~170 URLs (24 páginas × 7 dominios).** La propuesta más peligrosa del conjunto. Su propio autor escribe que depende de que el franquiciado aporte 150-250 palabras genuinas por página — el mismo franquiciado que lleva meses sin dar su razón social. Sin ese input es literalmente un generador de *scaled content* en una red de 7 dominios, en un vertical YMYL, redactado por alguien sin titulación en nutrición, publicado bajo el CIF de sociedades ajenas. **No es "aplazar": es descartar.** Y el piloto de 24 URLs en una tienda tampoco: 24 páginas de copy nutricional es un mes de trabajo de la única persona que existe.

**Todo el teatro de datos estructurados.** `BreadcrumbList`, `hasOfferCatalog`, `ImageObject`, `Person`, `containedInPlace`/`ShoppingCenter`, `parentOrganization`, `Service`+`Offer` a precio 0, `CollectionPage`. Uno de los analistas lo admite: *"cero rich result garantizado"*. Es la clase de trabajo que produce diffs bonitos y mueve cero métricas. Coste real conjunto: una hora dentro de `Landing.astro` el día que se toque por otra cosa. Prioridad: la última. Nunca como proyecto.

**FAQPage "por motores conversacionales e ingesta de IA".** Tres analistas verifican correctamente que el rich result está muerto, y acto seguido dos justifican la sección por un beneficio **infalsificable**: no se puede medir, no se puede atribuir, no se puede desmentir. Si la FAQ se hace, que se haga por lo único comprobable: son las preguntas logísticas (planta, parking, domingo) que hoy no responde nadie y que generan llamadas. Si se justifica por IA, es fe.

**Calculadora de proteína y calorías.** Mete JS, mete territorio de consejo dietético personalizado, y su conversión final es "ven a tienda" — que es lo que ya hacen mal los tres CTA existentes. Tesis de tráfico sin un solo dato que la respalde (0/7 en Search Console).

**Plantilla 3 "Guía" con máscaras blob.** `template` está **ausente en las 7 tiendas** **[verificado]**: las dos plantillas que ya existen tienen **cero adoptantes**. Construir la tercera es construir para un usuario imaginario. Lo mismo, en menor escala, el token de trama diagonal (inofensivo, 20 min, pero es una tarea doméstica, no una propuesta) y el `--font-accent` script — segunda familia tipográfica, claims en inglés, contra un presupuesto de 162 KB que costó conseguir. Descartado.

**Landing `/comunidad` por dominio.** Un analista verifica **[no verificado por mí]** que `comunidadusafitness.com` existe y es del franquiciador, y que los banners "Landing Comunidad" apuntan ahí. Los otros tres proponen reconstruirla en cada dominio. **Sería duplicar un activo ajeno y competir con la propia marca.** Si el hallazgo se confirma, esas propuestas caen enteras — y con ellas el argumento de "los banners ya están producidos".

**Pop-up / exit-intent.** Un analista lo rechaza con buenos argumentos y los demás lo recuelan en `/comunidad`. Rechazo total, con un motivo adicional que nadie da: **sin analítica no se puede evaluar**. Un pop-up sube emails y baja visitas a la vez; sin la segunda mitad del dato parece un éxito. No se prueba lo que no se puede medir.

**Email marketing como módulo.** Vender envíos a una lista de cero personas. El propio analista lo admite. Fuera del catálogo el primer año.

**Alta digital de la Tarifa VIP (XL, con BD).** Su autor reconoce que se salta la secuencia decidida en `memory/01-product-vision.md`. Es la propuesta que convierte "7 landings" en "una plataforma con panel" para una persona sin socio técnico. No.

**Arreglar `site: 'https://usafitness.es'` en `astro.config.mjs`.** **[verificado]: no arregla nada.** El canonical se construye en `Landing.astro` como `https://${domain}/`, el og:url igual, y `sitemap.xml.ts` genera desde `store.domain`. `Astro.site` **no lo consume nadie** — de hecho `@astrojs/sitemap` está en `package.json` y **no está en `integrations`**: es una dependencia muerta que conviene borrar. El miedo al duplicado por `trailingSlash` tampoco aplica: el middleware normaliza la barra final y el canonical va hardcodeado sin ella. Dos analistas lo presentaron como problema; es cosmético.

---

## 3. Suenan bien y mueren de mantenimiento con una sola persona

**"Abierto ahora / Cierra en X".** Es el patrón que más repite el benchmark y el peor negocio aquí. Exige horario por día **más festivos de apertura de 7 centros comerciales distintos**, actualizados para siempre, y renderizado sin caché en cada petición. El día que un centro cambia un festivo, la web **miente** — y miente justo en el dato por el que alguien se desplaza. Veredicto partido: **sí** al horario estructurado de 7 días como dato (alimenta el schema, la sección y la FAQ, y no caduca); **no** al badge en vivo. El badge es una promesa de mantenimiento perpetuo a cambio de un adorno.

**Agenda de eventos con `Event` schema.** Requiere un calendario que alguien mantenga. Una sección con un evento de hace ocho meses es peor señal que no tener sección. Solo si hay eventos reales y recurrentes; hoy solo hay aperturas.

**Gimnasios y clubes colaboradores.** Depende de acuerdos firmados que el operador no puede conseguir. Es trabajo comercial del franquiciado disfrazado de sección web.

**Kit de contenido para redes (8-12 piezas/mes).** × 7 tiendas = **84 piezas al mes**. Es una jornada completa, no un módulo. Y la gestión completa de redes, como el propio analista calcula, es imposible más allá de 2-3 tiendas. Correcto el diagnóstico; el kit tampoco escala, solo se rompe más despacio.

**Rodaje del video tour.** A Coruña, Vigo, Zaragoza, Córdoba y tres puntos de Madrid. Una persona. Más permiso de grabación en zona común de cada centro (que puede tumbar la entrega **después** de cobrar). Y la central ya edita el vídeo gratis **[no verificado por mí]**. No es un producto: como mucho es un subproducto de un viaje que se hace por otra razón.

**Registro de citas `citations[]` con fecha de última verificación.** Una hoja de cálculo que se pudre. Sin revisión trimestral —que no va a ocurrir— da falsa sensación de control, que es peor que no tenerla.

**Formulario Tally → GitHub Action → commit automático.** La propuesta de ingeniería más peligrosa del conjunto: dar escritura efectiva sobre el repo a 7 personas no técnicas, en un repo sin tests, que despliega **un solo servicio que sirve los 7 dominios**. Un commit malo tumba las 7 tiendas a la vez; uno bueno redespliega las 7 igualmente. Ni con Zod delante. No.

**La pila de captación completa (Brevo + 7 listas + 7 contratos art. 28 + doble opt-in + buzón que vigilar + derechos de supresión).** Aquí es donde muere el operador único. Y un matiz que ninguno calculó: de las 3 tiendas con bloque `company`, **dos comparten sociedad** (USA GOVE S.L. en GranCasa y Arcángel, mismo NIF B22465587) **[verificado]**. Así que hoy hay **2 responsables del tratamiento identificables, no 3**, y **4 tiendas que no pueden recoger legalmente un solo email**. No se captura ni un dato hasta que haya contrato firmado. Y `emailLegal` de Vigo es **`adricbp@gmail.com`** —un Gmail personal como contacto legal de una S.L.— y el de El Arcángel es **`grancasa@tiendausa.es`**, el correo de otra tienda. Eso es dato legal **erróneo publicado**, que es peor que el vacío que el `noindex` protege.

---

## 4. Asumen datos que el franquiciado no va a dar nunca

Regla de contraste: el franquiciado lleva **meses** sin entregar su razón social —el dato más barato y más obligatorio que existe—. Cualquier propuesta que dependa de que aporte información más laboriosa que esa, no va a ocurrir.

- **Servicios por tienda (badges tipo H&B).** Requiere un inventario que nadie va a compilar, y cada badge es una promesa exigible en el mostrador. Si se hace, máximo 2 badges ciertos en las 7, escritos por el operador.
- **Marcas reales por tienda ("más de 40").** No va a llegar la lista. Nota adversarial que nadie hizo: los 8 logotipos de terceros **ya están publicados hoy**, sin autorización escrita documentada. No es un riesgo de expandir; es un riesgo vivo.
- **Equipo y expertos (Julián / Amanda).** Suma: (a) *nutricionista* y *dietista-nutricionista* son títulos regulados en España; (b) un analista **no encontró rastro público** de las credenciales de Amanda Gil; (c) hacen falta consentimientos de imagen que cubran 7 dominios de 3 sociedades que **no los emplean**. El upside es E-E-A-T especulativo; el downside es intrusismo, derechos de imagen y publicidad engañosa, multiplicado por 7. **No publicar.**
- **Condiciones exactas de VIP / funcionario / cumpleaños.** Programa del franquiciador. Ver P0.2.
- **Calendario promocional de la marca.** El sistema de campañas fechadas es correcto en diseño; su input no existe.
- **Compromiso de responder citas en un plazo.** No hay forma de imponer un SLA a 7 terceros. Y una cita pedida y no contestada hace más daño que no ofrecer citas.

**La excepción que sí vale y hay que hacer** (y es lo mejor de las cuatro dimensiones de contenido): **planta, número de local, parking y transporte**. No depende del franquiciado — **lo publican los propios centros comerciales** y lo puede copiar el operador en una tarde **[no verificado por mí, pero con citas concretas en tres análisis independientes]**: "Planta baja, Local nº 21" (Las Rosas), "Planta 0" (Gran Vía de Vigo), "Planta Calle, Local 0-36" + 3 h de parking gratis (Arena). El campo `mall` ya existe en las 7 **[verificado]** y hoy no se usa para nada. Es contenido único por tienda, imposible de canibalizar entre dominios, y responde la pregunta que de verdad hace quien ya está dentro del centro.

---

## 5. Lo que sí vale y nadie priorizó bien

Ordenado por retorno real, no por lo que luce en una propuesta:

1. **Reapuntar las fichas de los 7 centros comerciales** (un email por centro, firmado por el franquiciado). Es la única propuesta del conjunto que es puro retorno sin código, sin mantenimiento y sin RGPD. Y de paso corrige teléfonos: la ficha de Alcobendas y la del franquiciador para Marineda contradicen a `stores.json` **[no verificado por mí]**.
2. **Esquema Zod / Content Layer sobre `stores.json`.** Mejor ratio técnico del repo. Aviso honesto que hay que aceptar antes de empezar: el primer build estricto **va a fallar en cadena** (4 tiendas sin `company`, `place_id` sintéticos, `sections`/`template` inexistentes). Eso es el objetivo, pero hay que reservar la sesión para arreglar datos, no solo para escribir el esquema.
3. **`404.astro` y dejar de redirigir a `/`.** 30 minutos, elimina 7 soft-404 **[verificado]**: `[...slug].astro` hace `Astro.redirect('/')` para cualquier ruta desconocida.
4. **`locals.store` + `env.d.ts` + una sola resolución de host.** Correcto y necesario — **después** del smoke test. Hoy hay 12 `as any` y la resolución `host→tienda` copiada en 5 ficheros.
5. **Verificador de assets en build** (20 líneas). La propuesta más barata de las 120 y la que menos se va a hacer porque no se ve.
6. **`lastmod` real en el sitemap y fuera `changefreq`/`priority`** **[verificado]**, más borrar `@astrojs/sitemap` que está instalado y sin usar. Media hora, mientras se toca el fichero.
7. **El centro comercial dentro del contenido** (título de sección, alt de galería, texto de Location, `mall` en el schema). Es la tesis declarada del producto y hoy `mall` es un campo muerto.

---

## 6. Contradicciones entre analistas que hay que resolver antes de decidir nada

| Tema | Postura A | Postura B | Quién manda |
|---|---|---|---|
| `/comunidad` | "reconstruirla, los banners ya existen" (3 análisis) | "`comunidadusafitness.com` ya existe y es del franquiciador" (1 análisis, con URL) | **B**, si se confirma la URL. Verificarlo cuesta 1 minuto y cancela 3 propuestas. |
| FAQ | "rich result muerto, se hace por IA/long-tail" | "se hace por conversión y logística local" | **La segunda**. La primera es infalsificable. |
| Enlazado entre dominios | anillo de 7 / footer cruzado | hub-and-spoke, nunca recíproco | **Hub-and-spoke**, y por un motivo que el analista da bien: misma IP, misma plantilla, mismos textos. El anillo es una huella delatora. |
| Guía en HTML | publicarla en los 7 | publicarla en 1 y enlazar | **Ninguna de las dos todavía.** Son 7 sociedades independientes; ninguna manda tráfico a otra. Es una decisión de negocio del franquiciador, no del operador. |
| Medición | 7 propiedades GA4 + eventos | Cloudflare Web Analytics como suelo | **Search Console primero** (ninguno lo puso el primero pese a ser gratis, sin consentimiento y sin código). |

---

## 7. Las preguntas que bloquean todo lo demás

1. ¿Cuándo se migran las 4 tiendas de WordPress y quién controla el DNS de cada dominio (operador o franquiciado)? Sin la respuesta, no se puede ni verificar Search Console ni desplegar nada.
2. ¿Las reseñas actuales son reales? Si no lo son, ¿quién autorizó publicarlas y desde cuándo están vivas?
3. ¿De dónde sale "Hasta 20% dto." y los cuatro porcentajes de `Promotions.astro`? ¿Hay un documento del franquiciador que los respalde?
4. Villanueva: ¿El Zoco o La Pasada?
5. ¿Cuál es el móvil real de cada tienda y está dado de alta en WhatsApp Business? (Empezando por Alcobendas y Vigo, que son las dos vivas.)
6. ¿El franquiciador acepta que las fichas de los centros y `usafitness.es` enlacen al dominio de cada tienda, o su política es que todo apunte a su PrestaShop?
7. ¿`comunidadusafitness.com` es del franquiciador? ¿Y la guía en PDF se puede distribuir desde 7 dominios de terceros?
8. Las 4 tiendas sin `company`: ¿hay fecha, o se asume indefinidamente que sus páginas legales van en `noindex`?
9. ¿Quién es el responsable del tratamiento si mañana se captura un email? Con dos sociedades identificadas y una compartiendo `emailLegal` entre dos tiendas, hoy no hay respuesta.
10. ¿El franquiciado percibe la ficha de Google como suya? Todo el catálogo recurrente cuelga de esa suposición y nadie la ha comprobado.
11. ¿Cuánto tráfico tiene hoy cualquiera de las 7? Nadie lo sabe. Toda priorización posterior a esta lista es opinión hasta que exista ese número.

---

## Autocrítica

- **La suposición de la que más depende este veredicto** es que `memory/02-current-state.md` sigue siendo cierto (2 dominios en Astro, 4 en WordPress). Si la migración avanzó y no está reflejada en memoria, el punto 0.1 —que reordena todo lo demás— pierde fuerza, aunque no la pierden ni las reseñas falsas ni el iframe sin consentimiento.
- **La parte más floja** es el juicio sobre las fichas de centros comerciales y `comunidadusafitness.com`: no las he verificado yo, y sobre ellas descansan tanto la propuesta que más recomiendo (reapuntar fichas) como tres que descarto (`/comunidad`). Verificar esas URLs debería ser el primer acto, antes que discutir prioridades.
- **Riesgo que yo tampoco he cubierto:** he juzgado casi todo por coste de mantenimiento del operador, y eso me sesga sistemáticamente contra lo que el franquiciado quizá sí pagaría. Mi lista optimiza que el sistema no se caiga; no demuestra que el franquiciado renueve.
- **Sesgo de negatividad declarado:** el encargo pedía dureza, así que he tirado a matar propuestas donde a veces cabía una versión reducida (servicios: 2 badges en vez de 8; FAQ: 6 preguntas logísticas en vez de 25). Léase como "no en esta forma", no siempre como "nunca".
- **Lo que no he podido verificar y cambiaría el orden:** si alguna de las 4 tiendas en WordPress tiene tráfico apreciable, migrarla sube por encima incluso de borrar las reseñas — porque entonces el daño de las reseñas falsas está en un WordPress que este repo no controla.

---
**Possible next commands (pick one):**
a) `/mm-plan "P0: borrar reseñas falsas + quitar claims sin fuente + Maps tras consentimiento"` — si quieres ejecutar ya el bloque de riesgo cero-dependencia.
b) `/mm-doubt` — si prefieres llevar primero las 11 preguntas del punto 7 al dueño antes de tocar nada.
c) Nada aún — si este veredicto va a un sintetizador que integra los 7 análisis y decide después.
**¿Cuál?** responde `a`, `b` o `c`.