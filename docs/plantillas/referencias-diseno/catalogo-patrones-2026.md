# Catálogo de patrones 2026 — lo que gusta, lo que dura, lo que cabe en nuestro stack

**Fecha:** 2026-08-27 · **Origen:** ocho frentes de investigación en paralelo (webs premiadas · tendencias 2026 · movimiento viable en CSS · scroll largo/infinito · GitHub · comunidades y X · el sector · gramáticas de marca): 110 patrones y ~350 ejemplos (292 marcados [V] tras abrir la página, 61 [P]), deduplicados aquí en **37 patrones** y **7 familias**.
**Qué significa [V]:** en siete de los ocho frentes la página se abrió con `WebFetch`, que devuelve marcado y texto — equivale al estado `[LEÍDA]` de `notas-capturas.md`, no a una captura. El frente de sector sí usó el panel a 375 px. Tres afirmaciones las verifiqué yo (ver `notas-capturas.md`, sección final): Basic-Fit vista, Apple retail y Kronborg por estructura.

---

## Los invariantes de 2026 (lo que se ve en todo lo que gusta)

- Base clara con UN acento que vive en la UI (botones, guiones, titulares), nunca pintado sobre la foto: Lando, Dropbox Brand, Scout, Apple, Nike [V]. Coincide con el brand book (base blanca, cian como acento).
- La tipografía es la imagen: contraste de escala 10:1 entre un titular display y un chrome de 12–16px; text-wrap balance/pretty; la palabra es lo que tapa la falta de foto (NOCCO, Kronborg, Lando, Awwwards Typography [V]).
- Cero elevación falsa: sin sombras, sin tarjetas que «flotan», radio 0 o mínimo; la profundidad la da el color de fondo o la foto (Apple/Nike vía DESIGN.md [P], v0 [V], tactile brutalism [V]).
- Fotos en celda de proporción fija sobre fondo plano; a sangre solo con producción profesional (Scout, Lightweight [V]); retrato recortado en pequeño antes que escena grande (Lando [V]).
- En páginas de lugar, el estado de hoy + dirección + una acción sin scroll: Apple Retail, Basic-Fit, Kronborg, Nike Retail, Decathlon [V]. Es el estándar que la suplementación española no cumple.
- Un solo CTA visible y menú oculto (Scout, Lando [V]); en local, barra fija inferior de 2–3 acciones o cabecera compacta, nunca ambas (NN/g [V]).
- Movimiento reactivo al gesto (scroll, toque, navegación), nunca ambiental ni en bucle; solo transform/opacity; prefers-reduced-motion respetado; contenido visible sin JS (WebKit, whoooop, Bushell/Coyier [V]).
- Transiciones nativas entre páginas (View Transitions cross-document): la sensación de app sin SPA; 2ª feature más deseada en State of CSS 2026 [V].
- Estructura visible: numeración 01·02·03 en recorridos, una idea por bloque, página que se acaba en 5–7 pantallas con señales de continuación (Terminal, Floema, NN/g [V]).
- Prueba social como dato en HTML (nota + n + fuente), no widget embebido (Susanne Kaufmann, Heirest, Huel [V]).
- Iconos de un solo set de trazo coherente (24px/2px) inline como sprite, o ninguno; nunca dos sets mezclados (Lucide, Tabler [V]).
- Legibilidad para máquinas: JSON-LD LocalBusiness con horario, geo y sameAs; HTML semántico. Lo que Google/Apple Maps/asistentes leen para responder «¿está abierta?» sin abrir la web (Muzli, Fireart, Studio Meyer [V]).
- Consentimiento no modal con botones simétricos (Fitness Park, H&B [V]); sin terceros no hace falta banner: la barra actual del repo ya es la versión correcta.
- Copy real y local en la zona noble (frases cortas con punto, dato de lugar, texto firmado): lo contrario del «AI slop» (925 Studios [V]) y del copy genérico (R6).

## Lo que está pasando de moda (a evitar)

- 3D / WebGL / Spline / GSAP ScrollTrigger / vídeo scrubbed por scroll: 800 KB–2 MB de JS antes de pintar (Studio Meyer [V]); rompe los 900 KB y «cero terceros»; sin producto propio que girar. Espectáculo de agencia, no patrón.
- Tipografía cinética (letras que se estiran, palabras que giran, peso variable animado): «everywhere as a demo, almost never ships» [V Studio Meyer]; CLS y lectores de pantalla (Digital Silk [V]); requiere fuente variable que no tenemos. Solo la palabra en script entrando, y nunca el horario.
- Reveal-on-scroll genérico desde opacity:0 (con JS o sin @supports): las tres premiadas abiertas mostraron viewports en blanco (Dropbox, Floema, Lando [V]); «Death to scroll fade» (Bushell, Coyier 2026 [V]). En una tienda con 4G flojo es una web rota.
- Preloaders con porcentaje y «Tap to explore» (Squarespace Foundations, Juice [V]) y cookie walls a pantalla completa (Floema, Kronborg [V]; 7 de 7 páginas por tienda vistas): interponen un trámite entre el buscador y el horario (R7).
- Dark mode como base o como quinta plantilla: contradice el brand book (base blanca luminosa), las fotos ruidosas se ven peor sobre negro, y el repo ya retiró D4 («cambiar tokens es cambiar la pintura»). Vale solo como capa modo: claro|oscuro|auto.
- Bento de tarjetas redondeadas 16–24px con sombra suave: «now the default» [P Studio Meyer], lo que Framer/Webflow regalan, lee como SaaS; a 375px se apila en «cuatro tarjetas» — el tell del AI slop (925 Studios [V]). Solo la versión de DATO con radio 0/bisel.
- Glassmorphism como tema (tarjetas de cristal sobre fotos): -15/30 % FPS en Android medio [V Studio Meyer], contraste que falla en silencio (Pravin Kumar, CSSWG [V/P]); sobre nuestras fotos es barro gris. Solo la barra fija.
- Mesh/aurora gradients y blobs orgánicos: estética «landing SaaS con IA» 2024–26 que envejece rápido; contradicen la gramática geométrica; Nike/Apple: «no decorative gradients» [P]. El degradado morado-azul es el tell nº 1 del AI slop [V].
- Grano/feTurbulence en vivo (filter: url()) sobre áreas grandes: coste por píxel en pantallas 3x; sobre foto mala parece filtro Instagram 2012. El rayado 45° hace el mismo trabajo a 0 KB.
- Neo-brutalismo / anti-grid / layout roto: emergente en 2026 [V Studio Meyer, Figma], pero pierde con tráfico frío [V brainy.ink] —el nuestro es todo frío— y un franquiciado lo lee como «rota» o «de 2010», la queja literal del dueño. Choca con Helvetica limpia y base blanca.
- Retro Y2K, «dial-up design», museumcore, neumorfismo, cromo líquido en titulares/botones: modas de 12–24 meses (Wix, Figma [V]; Y2K typography [P]); un pastiche de 2003 es peor que una web de 2010. El metal de marca es una banda fina, no un acabado.
- Cursores personalizados y estelas: el tráfico objetivo es táctil, no hay cursor; anulan ajustes de accesibilidad (Bailey, Bushell [V]). Peso y JS para cero usuarios.
- Scrolljacking y scroll-snap mandatory en la página entera: desorientación documentada, «a full swipe and it moved nowhere», evitar en móvil (NN/g [V]); la ficha no cabe en 375×667 con texto ampliado. Therabody ya lo quitó [V]. Como mucho proximity desde la segunda pantalla.
- Scroll infinito con carga automática: footer inalcanzable, botón atrás roto en >90 % (Baymard/Smashing, NN/g [V]); no hay nada que cargar. Basic-Fit pagina de 12 en 12 [V].
- Parallax con background-attachment: fixed o perspective: parcial en iOS Safari en todas las versiones hasta 26.6 (caniuse [V]); animación de interacción (WCAG 2.3.3); firma de las plantillas 2013–2016; y con fotos verticales de 382px no hay material que desplazar.
- Hero con la foto de la tienda (o vídeo) a pantalla completa y carrusel en el hero: desplaza el horario fuera del primer viewport (R1), magnifica la foto de móvil, esconde la dirección tras el slide 2 (Nike, Red Bull, ESN [V]). Es el «wordpress mediocre» rechazado.
- Contadores animados «+500 clientes felices / 99 %» y cuentas atrás que se reinician (H&B «23 h 40 m» [V]): cliché 2010–2015, urgencia sin hecho, y sin documento de la central violan R2 (lección del «Hasta 20 % dto.»). La única urgencia legítima es la hora de cierre real.
- Pop-ups, interstitials de entrada, selectores modales (Ghost, TransparentLabs [V]): Google penaliza cubrir contenido en móvil desde 2017 [V]; la misma mecánica va como sección.
- Marquesina en el mismo sitio, contenido y paleta que la plantilla rechazada (ADN de D1/D2 según direcciones.md); marquesinas múltiples, a dos velocidades, con iconos o que no se paran con reduced-motion: es <marquee> de 2005.
- Tipografías condensadas «deportivas» (Barlow Condensed, Big Shoulders, Bebas) y fuentes autoalojadas «porque son bonitas» (Inter, Montserrat): no existen en la marca (gramática §4), son la estética Gymshark que todos copian, y cuestan 48–150 KB con Grancasa a 22 KB del tope.
- Feature grid Tailwind (tarjeta + sombra + radio 8–12 + icono en círculo de color), frameworks classless (Pico, Water.css) e iconos de librería genérica: 9 de los 12 temas Astro más estrellados lo traen [V]; es la firma del «wordpress mediocre».
- Apostar la base a features Chrome-only o recién llegadas: ::scroll-marker, interpolate-size, scroll-state(), corner-shape (sin Safari [V]); scroll-driven en Firefox estable (tras flag en sep-2026 [V MDN]); Astro <ClientRouter /> (añade JS cuando lo nativo da lo mismo). Todo solo como mejora progresiva.
- Logo como marca de agua, patrón repetido o pegatina sobre fotos; una cuña en cada sección: ninguna de las grandes lo hace (Nike, Puma, Decathlon, Santander [V]); el brand book nunca pone dos cuñas. Clip-art.

## Las familias

### Composición
Tres composiciones excluyentes entre sí: (a) diagonal — la web como el propio local, con la cuña cortando el hero y el chevron separando secciones; (b) panel — mosaico de datos, la web como cartel informativo; (c) editorial — una pregunta por pantalla, mucho aire. La composición es el primer eje que el ojo usa para decidir si dos webs son distintas (lección escrita en templates.ts: los tokens solos no bastan).

Patrones: Cuña diagonal de esquina como contenedor del hero y recorte de la foto · Bandas diagonales cian/metal como separadores de sección (chevron) y sección sesgada · Mosaico de tarjetas de DATO (bento sin fotos, radio 0 o bisel) · Página con fin: 5–7 pantallas, una pregunta por pantalla, secciones que dejan asomar la siguiente

### Tipografía
El eje que separa «Cartel» (rótulo gigante, la foto es papel) de una plantilla de voz baja (frases con punto, versalitas, dato local como ornamento). La pila del sistema y los tokens son transversales a las cinco; lo que cambia por plantilla es la escala (18vw vs 40px) y el gesto (script vs corchetes vs numeración).

Patrones: Rótulo a escala cartel: titular gigante que sangra por los bordes o pisa la foto · Un titular, dos voces: Light + Bold en la misma línea, y UNA palabra en script · Frases-cartel de 2–4 palabras con punto, y micro-etiquetas en versalitas · Numeración editorial de pasos y secciones (01 · 02 · 03) · Cifra de oferta en display, condición en pequeño, un botón · Tipografía del sistema (Helvetica Neue nativa en iOS) + escala fluida + text-wrap balance/pretty

### Foto
Cinco tratamientos distintos de la MISMA foto mediocre, uno por plantilla: papel bajo el rótulo (duotono), recortada por la cuña, anotada con pines, lámina con cartela/passe-partout, tira de fachada con snap. Regla común: 382px es el techo, nunca hero a sangre, y la fachada nunca se duotona.

Patrones: Foto pequeña y recortada sobre fondo plano («bloque estudio»), nunca hero a sangre · Duotono/monotono cian para domar fotos de ambiente · Foto anotada con pines de llamada (línea + punto anillado) · Círculo punteado / arcos finos como marco de texto o retrato · Tira horizontal con scroll-snap (fachada primero, fotos verticales, categorías)

### Movimiento
Un «gesto de movimiento» por plantilla, nunca todos: casi nada (solo :active + view transitions), o la cuña que crece/cabecera que compacta, o desplegables, o stacking cards, o reveal + progreso + franja. Todo reactivo (scroll, toque, navegación), nunca ambiental; todo dentro de @supports y no-preference; el estado estático es el canónico porque el brand book es estático.

Patrones: Revelado al entrar en viewport con animation-timeline: view(), estado final por defecto · Cuña/barra de progreso ligada al scroll (scroll()) · Cabecera que se compacta con el scroll y deja fijo el dato de hoy · Tarjetas apiladas / scrollytelling con sticky (una pregunta por tarjeta) · Transiciones nativas entre páginas (View Transitions cross-document, sin ClientRouter) · Desplegables nativos animados (details/summary, popover, @starting-style, grid 0fr→1fr) · Una sola micro-interacción de sistema: :active con scale y easing linear(), hover gated · Marquesina CSS de claims o categorías (reubicada y rediseñada, o no vuelve)

### Navegación y conversión local
La ficha y el horario son invariantes (R1/R3) y van en las cinco. Lo que cambia es el elemento persistente —barra inferior, cabecera compacta, píldora con un solo CTA— y la puerta de entrada al resto (índice de anclas vs selector de objetivo vs nada). Un solo elemento fijo por plantilla.

Patrones: Ficha de tienda en el primer viewport (nombre + estado de hoy + dirección + una acción) · Horario como dato con formato: estado de hoy + semana plegable + horario del asesor · Barra fija inferior de 2–3 acciones (Cómo llegar · WhatsApp · Horario) · Índice de anclas con chevrons / chips de una palabra · Selector de objetivo: 4 botones apilados («¿Qué buscas?»)

### Superficie
La base blanca es invariante (brand book) y la elevación es cero en todas (sin sombras, sin tarjetas redondeadas). Lo que distingue: cuánto cian a sangre (mucho en «Franja», casi nada en «Lámina»), si hay textura (rayado) o material (metal), y si la esquina es recta o biselada. La capa nocturna es infraestructura (modo: claro|oscuro|auto), no una plantilla.

Patrones: Base blanca + un acento cian que solo vive en la UI; azul en titulares; rojo una vez · Rayado diagonal fino a 45° / rejilla técnica como textura de bloques sin foto · Metal cepillado como banda fina (gradiente CSS, 0 KB) · Bloque de color plano a sangre como sección: el cambio de color ES el divisor

### Contenido local y prueba
Transversal: no da lugar a una plantilla distinta sino al argumento comercial de todas — ninguna cadena española de suplementos tiene página por tienda digna (Sprinter solo NAP, TopNutrition todas en una página, usafitness.es sin localizador). El estándar lo marcan Apple, Decathlon y Basic-Fit. Depende de los siete campos nuevos de ficha y de quién escribe el texto (decisiones bloqueantes 1 y 4).

Patrones: Servicios en tienda como fichas (icono propio + nombre + una línea) · Bloque firmado del responsable de la tienda (60 palabras, datos de ESA tienda) · FAQ hiperlocal: 3–5 preguntas que solo esa tienda puede responder · Prueba social como dato en tarjeta (nota + n + fuente + fecha), no como widget · Tiendas cercanas de la red con foto y estado

## Los patrones, uno a uno

### Ficha de tienda en el primer viewport (nombre + estado de hoy + dirección + una acción)  ·  *Navegación y conversión local*
Bloque compacto sin foto grande: nombre de la tienda como titular, una línea de estado en gris regular (~15px) del tipo «Abre a las 10:00» / «Hoy 10:00–21:30» que dice CUÁNDO abre cuando está cerrada, dirección en texto enlazada a Maps, teléfono como enlace, y un único botón. La galería va debajo como tira pequeña, nunca como hero. Kronborg lo resuelve como barra de 3 celdas bajo el logo ([menú] | «Abierto hoy 10-17 ▾» | «Entradas →»).

**Por qué gusta:** Responde la pregunta nº 1 del que busca un sitio físico («¿está abierto y cómo llego?») sin un solo scroll; el visitante siente que la web le entiende. NN/g: el 57 % del tiempo de visualización cae por encima del pliegue. Y para el franquiciado ver SU horario y SU tienda en el primer golpe de vista es el «esa es la mía».

**Ejemplos:** [Apple Retail — Puerta del Sol (captura 375px)](https://www.apple.com/es/retail/puertadelsol/) [V — H1 → «Abre a las 10:00» → carrusel → dirección + teléfono → tabla de horario; la marca más cara del mundo no pone hero a sangre en su página de tienda] · [Basic-Fit — club A Coruña (captura 375px)](https://www.basic-fit.com/es-es/clubs/basic-fit-a-coruna-avd.-salvador-de-madariaga-1ec43550fd654c7d8e23bc6c96cd2ff0.html) [V — título bold caps, dirección-enlace con icono, reloj + dos líneas de horario, CTA a todo el ancho, todo en el primer viewport] · [Kronborg Slot (SiteInspire; captura 375px)](https://kronborg.dk/) [V — barra de utilidad fija bajo el título con horario de hoy desplegable y CTA]

**Viabilidad:** js-inline-pequeno · 0 KB si el estado se renderiza en SSR desde parseHorario; ~0,6–1 KB de JS inline si la página se cachea en CDN y el estado debe calcularse en cliente · Universal. Intl.DateTimeFormat con timeZone Europe/Madrid: Safari 10+. Trampa verificada en el repo: el servidor corre en UTC · reduced-motion: Estático; el único movimiento es el chevron del desplegable (transition:none bajo reduce)

**Sirve a:** P1, N1 (ver_horario, contacto_maps), N2, R1, R3 (solo estado «abierto/cierra en» con horario v2 + festivos; sin eso, solo el horario del día) · **Con la marca:** Casa con la base blanca luminosa (elemento 7): el dato en tinta sobre blanco, el color solo en el botón. El nombre de la tienda pide el campo `rotulo` corto (≤14 car.) ya bloqueante en direcciones.md: las 8 empiezan por «USAFITNESS» y llegan a 30 caracteres.

### Horario como dato con formato: estado de hoy + semana plegable + horario del asesor  ·  *Navegación y conversión local*
Tabla de 7 filas (día · fecha · horas) con HOY en Bold y la fecha real en cada fila (Apple: «Hoy · 5 sep. · 10:00-21:30»), plegada tras un chevron en móvil (Kronborg) o desplegada como hoja desde abajo con `popover` + `@starting-style`. Variante de doble horario (Anytime, Fitness Park): «tienda 10–22» y debajo «asesor: martes y jueves 17–20». Datos estructurados JSON-LD LocalBusiness con openingHoursSpecification, geo y hasMap en el head.

**Por qué gusta:** La fecha elimina la duda «¿este horario es de verdad o de la plantilla?»; el desplegable evita 7 líneas en el primer viewport; el horario del asesor convierte «te asesoramos» en una cita posible sin formulario. Para máquinas (Google, Apple Maps, asistentes) el JSON-LD es el argumento comercial más fuerte de 2026: «tu horario correcto aparece donde la gente pregunta», algo que usafitness.es no publica.

**Ejemplos:** [Apple Retail — Puerta del Sol](https://www.apple.com/es/retail/puertadelsol/) [V — «Hoy» en bold con fecha, semana móvil desde hoy, tres columnas] · [Anytime Fitness — Ciudad Universitaria](https://www.anytimefitness.es/gimnasio/sp-0072/ciudad-universitaria-madrid-28039/) [V — «Open 24 hours» + bloque «Horario de oficina» separado por días] · [caniuse — Popover API / @starting-style](https://caniuse.com/mdn-api_htmlelement_popover) [V — popover completo en iOS 18.3+; @starting-style Safari 17.5+]

**Viabilidad:** css-puro · ~0,4 KB CSS (grid) + ~0,5 KB para el popover; 1–2 KB de JSON-LD. Marcar «Hoy»: SSR con caché ≤1 día o ~0,3 KB de JS · <details>: universal. Popover: Safari 17+ (iOS 18.3+ completo). @starting-style: Safari 17.5+, Chrome 117+, Firefox 129+. Fallback: <details> o la tabla siempre visible · reduced-motion: transition-duration:0 bajo reduce; la hoja aparece al instante

**Sirve a:** P1, P5 (horas del asesor), N1 (ver_horario), N6 (pedir_cita), R3 · **Con la marca:** Neutro respecto a las formas: es tipografía Light/Bold (elemento 6) aplicada al dato — «Hoy» en Bold, el resto en Light. La hoja debe salir de abajo, no de la esquina, para no pisar la cuña. Horario de asesor solo si el franquiciado lo tiene fijo de verdad.

### Barra fija inferior de 2–3 acciones (Cómo llegar · WhatsApp · Horario)  ·  *Navegación y conversión local*
Barra de 52–64px anclada abajo en móvil con 2–3 botones de igual ancho, icono + etiqueta, altura táctil ≥48px y `padding-bottom: env(safe-area-inset-bottom)`; enlaces con intención (URL de Maps con la dirección, wa.me con texto prellenado, tel:). Aparece tras el primer viewport y no tapa el pie. Variante «arriba»: cabecera píldora flotante con un solo CTA (Scout Motors, Lando). Variante de par: CTA relleno + CTA hueco apilados (Anytime). Cristal (backdrop-filter) solo aquí, nunca sobre fotos.

**Por qué gusta:** Las dos preguntas más buscadas a un pulgar de distancia en cualquier punto del scroll; el usuario no lo percibe como diseño sino como que «la web funciona». Elimina la decisión: hay un botón que tocar. Para el franquiciado es el argumento medible: cada toque emite evento.

**Ejemplos:** [Anytime Fitness — Ciudad Universitaria (captura 375px)](https://www.anytimefitness.es/gimnasio/sp-0072/ciudad-universitaria-madrid-28039/) [V — píldora rellena + hueca apiladas; al hacer scroll aparece barra inferior fija con la principal (~12 % del viewport)] · [Scout Motors (Awwwards E-commerce of the Year 2025; captura 375px)](https://www.scoutmotors.com/) [V — header flotante redondeado con un único CTA «RESERVE»] · [Google Search Central — interstitials](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials) [V — permite banners que ocupan «una pequeña fracción de la pantalla»; base de R7]

**Viabilidad:** css-puro · 0 KB (fixed/sticky); ~0,3 KB de JS si se oculta al llegar al pie · Universal. env(safe-area-inset-*) Safari 11.1+. backdrop-filter Safari 9+ con -webkit- (18+ sin prefijo), envuelto en @supports con fallback blanco al 95 %. iOS 26 ha mostrado desplazamientos de fixed/sticky al colapsar la barra [P]: probar en dispositivo · reduced-motion: Aparecer/desaparecer con opacity 150ms; sin transición bajo reduce. Respetar prefers-reduced-transparency devolviendo fondo opaco

**Sirve a:** P1, N1 (contacto_maps), N2 (contacto_whatsapp, contacto_llamada), R1, R7 · **Con la marca:** Casa con la base blanca: barra blanca, texto azul #0055B8 (blanco sobre cian da ~2,8:1 y falla AA). CONFLICTO YA DETECTADO: CookieConsent.astro es otra barra fija inferior en las 8 tiendas; hay que decidir el apilado. Un solo elemento fijo por página (NN/g): esta barra O la cabecera compacta, no ambas más la barra de progreso.

### Índice de anclas con chevrons / chips de una palabra  ·  *Navegación y conversión local*
Bajo la ficha, una caja con 3–5 filas separadas por línea fina y chevron a la derecha («¿Qué tienen?» / «Hazte socio» / «Reseñas» / «Te asesoran»), o 5 chips de una palabra en dos filas con flex-wrap. Enlazan a #secciones con `scroll-margin-top` y `scroll-behavior: smooth`. Sin scroll-spy o con 15 líneas de IntersectionObserver.

**Por qué gusta:** Permite saltar a lo que uno busca sin leer lo demás, con el patrón lista-con-chevron que la gente conoce de los ajustes del móvil. Y hace visible en la primera pantalla el mapa completo de la web: el argumento de venta al franquiciado («mira todo lo que tiene»).

**Ejemplos:** [Anytime Fitness — «IR A» (captura 375px)](https://www.anytimefitness.es/gimnasio/sp-0072/ciudad-universitaria-madrid-28039/) [V — caja morada con 3 filas-ancla y chevrons dentro del primer scroll] · [Apple — iPhone 17 Pro (sub-nav Explorar/Comprar)](https://www.apple.com/es/iphone-17-pro/) [V — landmark permanente de una página de 12 secciones (estructura leída)] · [NN/g — Infinite Scrolling](https://www.nngroup.com/articles/infinite-scrolling-tips/) [V — la falta de landmarks es la causa de no reencontrar contenido en páginas largas]

**Viabilidad:** css-puro · 0 KB (~0,6 KB con scroll-spy) · Anclas universales; scroll-behavior/scroll-margin Safari 15.4+ (degrada a salto) · reduced-motion: html{scroll-behavior:auto} bajo reduce

**Sirve a:** P1, P2, P3, P4, P5, N1 · **Con la marca:** El chevron de la lista puede dibujarse como el pin de llamada (línea + punto anillado, elemento 5). Las etiquetas deben ser las preguntas del visitante, no las de la marca (R6). No usar tira horizontal para chips de texto (WCAG 1.4.10).

### Selector de objetivo: 4 botones apilados («¿Qué buscas?»)  ·  *Navegación y conversión local*
Cuatro botones a todo el ancho, uno por objetivo (Ganar músculo / Energía y resistencia / Control de peso / Vengo a regalar), que caben en 375px sin scroll y llevan a rutas o secciones ancla. Ghost lo sirve como interstitial sobre un fondo de claims manuscritos; Optimum Nutrition como eje «Shop by Goal». Aquí va como SECCIÓN, nunca como modal.

**Por qué gusta:** Quita la vergüenza de «no sé por dónde empezar»: el visitante no necesita saber nombres de productos, solo qué quiere. Cuatro opciones = cero fricción.

**Ejemplos:** [Ghost Lifestyle (captura 375px)](https://www.ghostlifestyle.com/) [V — «Let us know your goal» con 4 botones BUILD MUSCLE / ENERGY & ENDURANCE / WEIGHT MANAGEMENT / OTHER] · [Optimum Nutrition](https://www.optimumnutrition.com/en-us) [V — menú «Shop by Goal» paralelo a «Shop by Product» (texto leído)]

**Viabilidad:** css-puro · ~0,8 KB (4 enlaces-botón; :target para mostrar la ruta sin JS) · Universal · reduced-motion: Sin animación

**Sirve a:** P6 (punto_de_partida{ruta}), N6 (vale_orientacion), P8 (opción estacional «vengo a regalar») · **Con la marca:** Casa con el rayado 45° como fondo de la sección (en vez del papel pintado manuscrito de Ghost, que huele a pre-entreno americano) y con mayúsculas Helvetica + UNA palabra en script en el titular. R7 prohíbe la versión interstitial.

### Cuña diagonal de esquina como contenedor del hero y recorte de la foto  ·  *Composición*
Triángulo/trapecio cian que nace en la esquina superior izquierda a ~45°, ocupa 15–30 % del ancho y corta el primer viewport en diagonal: el texto (blanco o azul) vive en la cuña y la foto de fachada queda recortada por su borde o «comida» en paralelogramo (`clip-path: polygon()`; fallback `linear-gradient` con parada dura). En Basic-Fit la cuña naranja de esquina enmarca el carrusel de fachada; en Stripe la banda diagonal parte el hero. Una cuña por pantalla, en una esquina.

**Por qué gusta:** Da dirección y velocidad al primer viewport sin foto buena; el ojo lee la diagonal como movimiento y la foto queda «colocada» en vez de expuesta. El recorte esconde lo peor de una foto mala (techos, cables, suelo). Y el franquiciado ve en la web lo mismo que ve al entrar en su tienda.

**Ejemplos:** [Basic-Fit — club A Coruña (captura 375px)](https://www.basic-fit.com/es-es/clubs/basic-fit-a-coruna-avd.-salvador-de-madariaga-1ec43550fd654c7d8e23bc6c96cd2ff0.html) [V — triángulo naranja en esquina superior derecha con el carrusel de fachada solapado; es la geometría de USA Fitness en otro color] · [CSS-Tricks — Non-rectangular headers](https://css-tricks.com/creating-non-rectangular-headers/) [V — compara SVG, clip-path, skew, gradient; clip-path si hay fondo complejo debajo] · [Stripe](https://stripe.com/es) [V — banda diagonal que parte el hero (el WebGL de su degradado NO es adoptable)]

**Viabilidad:** css-puro · <0,5 KB por cuña · clip-path polygon sin prefijo Safari 13.1+ (con -webkit- desde 9.1), Chrome 55+, Firefox 54+. Gradiente con parada dura: universal (fallback perfecto). corner-shape (bevel) NO está en Safari: solo bajo @supports · reduced-motion: Estática. Si la cuña entra animada: solo transform/opacity y apagada bajo reduce

**Sirve a:** P1 (la cuña es el contenedor de «Abierto hoy · horario · cómo llegar»), N1, R1, identidad · **Con la marca:** ES el elemento nº 1 de la gramática, construido físicamente en las tiendas (paneles, nevera). Regla del brand book: una por pantalla, en una esquina. Riesgo: polygon en % cambia el ángulo con el aspect-ratio (a 375×667 sale más vertical): fijar un eje en px/vw. Con la foto vertical de 382px debajo, la diagonal resalta el pixelado del borde: object-fit cover + velo cian al 20 % en la zona de contacto.

### Bandas diagonales cian/metal como separadores de sección (chevron) y sección sesgada  ·  *Composición*
Cada frontera entre secciones lleva una banda diagonal fina (24–48px) cian arriba y plata abajo con hueco blanco entre las dos —el chevron del brand book— alternando esquina arriba-izquierda / abajo-derecha. Versión Stripe: contenedor con `transform: skewY(-12deg)` y `overflow: hidden`, hijos contra-sesgados para que el texto quede recto. Nunca todas las secciones con el mismo sesgo.

**Por qué gusta:** Ritmo: la página entera parece una sola pieza de cartelería y cada sección arranca con la misma firma. Es lo que la gente asocia con «web de producto moderna» sin foto de campaña.

**Ejemplos:** [Kevin Hufnagl — Stripe gradient effect](https://kevinhufnagl.com/how-to-stripe-website-gradient-effect/) [V — documenta --section-skew-Y: -12deg y transform-origin; la parte WebGL queda fuera] · [Envato Tuts+ — Hero sections with asymmetrical design](https://webdesign.tutsplus.com/css-hero-sections-with-asymmetrical-designs--cms-106695t) [P — spans de color hijos que heredan el skew]

**Viabilidad:** css-puro · <0,5 KB · transform universal; texto sesgado sin contra-sesgo se emborrona en Safari (rasteriza) · reduced-motion: Estática

**Sirve a:** solo estética, R5 (el sesgo es solo el borde; cada sección sigue declarando P+N) · **Con la marca:** ES el elemento nº 2 (chevron cian + metal). El skew rompe position:sticky y scroll-snap dentro de la sección: no combinar con stacking cards. Si se sesga todo igual, a la tercera sección parece «slanted divider» de Bootstrap.

### Mosaico de tarjetas de DATO (bento sin fotos, radio 0 o bisel)  ·  *Composición*
Rejilla CSS con una tarjeta 2×2 dominante («Hoy: abierto · cierra 22:00») rodeada de 1×1 y 2×1 («Cómo llegar», «4,7 · 212 reseñas», «Hazte socio», «Asesor: ma/ju 17–20»); cada tarjeta = un dato grande + una línea de apoyo, con borde 1px o bisel 45° en una esquina y cero sombra. En 375px se reordena por número de tarjetas disponibles (3, 5 o 7), nunca deja huecos. Las tarjetas son de dato, jamás de foto.

**Por qué gusta:** Escaneable en 3 segundos: cada tarjeta es una respuesta, no un párrafo. Lo que hoy la gente asocia con «app moderna» sin que nadie se lo explique.

**Ejemplos:** [Studio Meyer — reality check 2026](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check) [V — el bento «se hizo estándar» (Apple, Google, Microsoft, Spotify); cifra +23 % scroll depth sin metodología] · [Apple — iPhone](https://www.apple.com/iphone/) [V — matiza el mito: tarjetas uniformes, no bento de tamaños desiguales (estructura leída)] · [v0 (Vercel)](https://v0.app/) [V — tarjetas con borde gris fino, sin sombra, hover que solo cambia el borde: el «brutalismo de producto» (estructura leída)]

**Viabilidad:** css-puro · 0 KB (grid-template-areas, ~1,5 KB de CSS) · Grid universal; container queries Safari 16+ para que la tarjeta se adapte a su celda · reduced-motion: No aplica; hover de elevación solo bajo no-preference

**Sirve a:** P1, P3 (tarjeta socio estática, R2), P4 (nota Google + n), P5, N1 · **Con la marca:** Choca si se hace con radios 16–24px y sombras (lee como SaaS): la marca pide radio 0 o UNA esquina biselada a 45° (traducción de la cuña a tarjeta). Casa con el círculo punteado como marco de la tarjeta dominante. Con los datos de Lagoh (0 reseñas, sin WhatsApp) se llena de tarjetas vacías: layout por recuento real.

### Página con fin: 5–7 pantallas, una pregunta por pantalla, secciones que dejan asomar la siguiente  ·  *Composición*
Ficha (1 pantalla) → qué tienen (1) → socio (1) → reseñas (1) → asesor/ruta (1–2) → mapa y pie (1). Cada sección ≈100svh con UN titular grande (40–56px), un dato y una acción; scroll libre (nunca snap mandatory); el titular siguiente asoma cortado por el borde inferior para romper la ilusión de completitud. Bloques sin P+N se eliminan en vez de rellenar. `content-visibility: auto` + `contain-intrinsic-size` en las secciones fuera de pantalla.

**Por qué gusta:** Una página que se acaba en 6 pantallas se lee entera y deja sensación de dominio («ya sé todo lo que tenía que saber»); cada pantalla tiene un titular que dice de qué va y un botón que dice qué hacer. Es lo que el dueño lee como «moderno»: aire y un solo mensaje frente a la cuadrícula de widgets de 2010.

**Ejemplos:** [NN/g — Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/) [V — 74 % del tiempo en las dos primeras pantallas; señales de continuación como texto cortado] · [GOV.UK — one thing per page](https://www.gov.uk/service-manual/design/form-structure) [V — base conceptual (ámbito formularios)] · [Therabody — home (antiejemplo)](https://www.therabody.com/) [V — ~14 secciones, dos heros de rebajas, tres carruseles: el scroll largo que fatiga; y ya no usa el scrolljacking que NN/g le testeó]

**Viabilidad:** css-puro · 0 KB (min-height:100svh con fallback vh) · svh/dvh Safari 15.4+; content-visibility Safari 18+, Chrome 85+, Firefox 125+ · reduced-motion: No aplica

**Sirve a:** P1, P2, P3, P4, P5, R1, R2, R5, R6 · **Con la marca:** Casa con la base blanca y con «una cuña por pantalla»: cada pantalla puede llevar UN elemento de la gramática. Riesgo: si cada pantalla «necesita» una foto a todo ancho, son 6 fotos malas gigantes; la pantalla se llena con tipografía, cuña, metal y datos, y la foto vive en un recorte pequeño.

### Rótulo a escala cartel: titular gigante que sangra por los bordes o pisa la foto  ·  *Tipografía*
Una palabra o frase en mayúsculas a `clamp(3rem, 18vw, 10rem)` que ocupa el 100 % del ancho del móvil y se recorta por los lados (Kronborg) o se solapa un 20 % sobre la foto tratada como papel (NOCCO); texto de apoyo diminuto (12–13px) al lado: contraste de escala 10:1. La foto lleva velo plano azul al 80 % o duotono; `mix-blend-mode` solo probado por tienda. Nike: display 96px uppercase y chrome de 12–16px, nada intermedio.

**Por qué gusta:** Se lee desde un metro y desde el móvil en la calle; comunica seguridad sin fotografía cara. Es el lenguaje del cartel y del escaparate que el franquiciado ya conoce, y el único patrón que resuelve el problema nº 1: la foto mediocre deja de importar cuando la letra manda. Ver el nombre de SU centro comercial a 90px es el «quiero esa».

**Ejemplos:** [NOCCO (captura 27-ago, «captura de oro» de D1)](https://www.nocco.com/) [V — «TIME TO PERFORM» rompe el marco de una foto documental mediocre; a 375px el titular es media pantalla y la foto queda como textura] · [Kronborg Slot (captura 375px)](https://kronborg.dk/) [V — wordmark serif a ancho completo recortado por los bordes sobre la foto] · [Awwwards — categoría Typography](https://www.awwwards.com/websites/typography/) [V — ganadores actuales etiquetados «Typography» (Trevor Noah, Aardvark, Decathlon Yestalgia): el tipo grande sigue premiándose]

**Viabilidad:** css-puro · 0 KB con la fuente del sistema; +20–35 KB por cada peso extra autoalojado en WOFF2 subset · clamp() Safari 13.1+; text-wrap: balance Safari 17.5+/Chrome 130+/Firefox 121+ (degrada); overflow-x: clip; hyphens:auto con lang=es · reduced-motion: Estático; si entra animado, nunca desplaza layout (CLS)

**Sirve a:** P1 (el rótulo ES el nombre del centro + «ABIERTO HASTA LAS 22:00»), P3, R1, R6 · **Con la marca:** Casa con la tipografía de cartelería (elemento 6): mayúsculas Helvetica Bold/Bold Extended. Choca con la foto: sobre foto amarillenta el cian vibra a verde, por eso la tinta sobre foto es blanco o azul, y la renuncia de «Cartel» (sin apaisada usable → tinta plana) es la red. Bloqueante: `rotulo` ≤14 caracteres; con «USAFITNESS PARQUE CORREDOR» a 18vw son 3–4 líneas y el horario sale del primer viewport (viola R1).

### Un titular, dos voces: Light + Bold en la misma línea, y UNA palabra en script  ·  *Tipografía*
«ABIERTO hoy hasta las 22:00» con `font-weight` 300 y 700 en la misma línea; «YOU ARE Stronger THAN YOU THINK» con una sola palabra en cursiva/script. Lando: «LANDO» serif fina + «NORRIS» sans bold en la misma línea, subtítulo en versalitas diminutas. Ornamentos tipográficos de 0 KB: comillas, corchetes `[CÓMO LLEGAR]`, flechas «↳». La palabra en script puede entrar un instante después del resto (única concesión a la tipografía cinética).

**Por qué gusta:** Lee como diseño «de estudio» y no de plantilla; el ojo se detiene en la palabra destacada; el titular «se lee solo» y parece cartel, no párrafo. La palabra en script es lo que la gente recuerda del escaparate y en web nadie lo hace.

**Ejemplos:** [Lando Norris (Awwwards SOTY 2025; captura 375px)](https://www.landonorris.com/) [V — dos familias/pesos en la misma línea + subtítulo en versalitas] · [Off-White](https://www.off---white.com/en-es) [V — Helvetica mayúsculas, descripciones entre comillas, botones entre corchetes: un solo recurso retórico como sistema] · [Bürocratik (CSSDA WOTM abr-2025)](https://burocratik.com/) [V — taglines con flecha tipográfica y contraste de pesos]

**Viabilidad:** css-puro · 0 KB si ya cargan Light y Bold (Helvetica Neue nativa en iOS/macOS); ~15–25 KB una script OFL subset latin si se autoaloja · Universal. @starting-style para la entrada de la script: Safari 17.5+ · reduced-motion: La script visible desde el primer frame; la entrada solo bajo no-preference y solo esa palabra (nunca la frase, nunca el horario)

**Sirve a:** P1 (dato en Bold, resto en Light: jerarquía sin caja), P3, P5, R6, N1/N2 (botones [CÓMO LLEGAR] [WHATSAPP]) · **Con la marca:** ES el elemento nº 6 tal cual (Light+Bold en banners; mayúsculas + una palabra script en la cartelería de tienda). Reglas deducidas: una script por titular, nunca en cuerpo ni botones (pasa a invitación de boda). Los claims en inglés hay que medirlos con el público local. Corchetes en botones exigen 44px y fondo cian para no perder afordancia.

### Frases-cartel de 2–4 palabras con punto, y micro-etiquetas en versalitas  ·  *Tipografía*
Cada bloque lleva un titular cortísimo con punto final («Te decimos que no.» «Sin precios raros.» «Hoy, hasta las 22.») como única imagen de la sección; microcopy en versalitas de 11–12px («PLANTA 1 · ENTRADA NORTE», «DESDE 2019»). Dato local real tratado como ornamento tipográfico: coordenadas GPS, planta del centro, reloj local (estático).

**Por qué gusta:** Se lee en un vistazo en 375px y suena a persona, no a folleto; para «¿me vais a vender lo que no necesito?» un «Te decimos que no.» vale más que un párrafo. El dato de lugar ancla la web a un sitio real y da textura de estudio.

**Ejemplos:** [MindMarket (Awwwards SOTM dic-2025)](https://mindmarket.com/) [V — «No more chaos.» «One brief. One team.» uno por bloque] · [Bürocratik](https://burocratik.com/) [V — coordenadas GPS de las dos oficinas en el pie] · [Juice Agency (CSSDA WOTM sep-2025)](https://www.juice.agency/) [V — «ORLANDO: 06:25:03» reloj local en la cabecera]

**Viabilidad:** css-puro · 0 KB (el reloj en vivo serían ~0,3 KB; prescindible) · Universal · reduced-motion: Estático; nada de reloj en vivo

**Sirve a:** P1 (planta, entrada, coordenadas), P3, P5, P7, R6 · **Con la marca:** Casa con la base blanca y con el Light/Bold. Exige copy real por tienda: si la central no aprueba claims quedan frases vacías («Tu tienda. Tu gente.») que son justo el «wordpress mediocre». Un «abierto · cierra 22:00» en vivo sin festivos rompe R3: solo dato estático desde JSON.

### Numeración editorial de pasos y secciones (01 · 02 · 03)  ·  *Tipografía*
Contador tipográfico pequeño (misma fuente o monoespaciada del sistema) delante de cada paso de un recorrido: «01 Cuéntanos tu objetivo · 02 Te lo explicamos · 03 Te llevas solo lo que necesitas». Con `counter-increment` + `::before`. Solo para secuencias reales, nunca para ventajas o productos.

**Por qué gusta:** Convierte una lista en un recorrido: el visitante sabe cuánto queda y por dónde empezar. Es el recurso más barato para que una página con 6 bloques parezca «pensada».

**Ejemplos:** [Terminal Industries (Awwwards SOTM sep-2025)](https://terminal-industries.com/) [V — contadores 01–04 en el recorrido del producto] · [Grab&Go (franquicia retail PT)](https://grabandgo.pt/) [V — «Negócio na mão em 3 passos» para el franquiciado] · [Floema (Awwwards SOTM may-2026)](https://floema.com/en) [V — cinco categorías numeradas tras el hero]

**Viabilidad:** css-puro · 0 KB · Universal · reduced-motion: No aplica

**Sirve a:** P6, P5, N6 (vale_orientacion) · **Con la marca:** Casa con el pin de llamada (elemento 5): el número puede ir en el punto anillado y la línea unir los pasos. Numerar lo que no es secuencia es relleno y el dueño lo leerá así.

### Cifra de oferta en display, condición en pequeño, un botón  ·  *Tipografía*
«2×1» o «Muestra gratis» a ~64px (clamp), debajo «hasta el 30 sep · en tienda» en regular y un único botón «Ver oferta»; condiciones en asterisco. Sin precios, sin cuenta atrás. La única urgencia legítima es la hora de cierre real.

**Por qué gusta:** Se entiende a tres metros: número grande = beneficio, letra pequeña = condición, botón = qué hacer.

**Ejemplos:** [Fitness Park — Castellana 85](https://www.fitnesspark.es/club/madrid-castellana-85/) [V — «0€ / LAS PRIMERAS 8 SEMANAS / Después 27€» + un botón + asterisco (texto leído)] · [Optimum Nutrition](https://www.optimumnutrition.com/en-us) [V — oferta con código y FECHA límite explícita] · [Prozis (gira 27-ago)](https://www.prozis.com/es/es) [V — contador anclado a un hecho operativo real: modelo para «cierra en 2 h 15 min»]

**Viabilidad:** css-puro · ~0,3 KB · clamp() Safari 13.1+ con fallback px · reduced-motion: No animar la cifra (R4); los contadores animados son el cliché nº 1 de 2010

**Sirve a:** N4 (ver_oferta), P2, P3 (solo con fuente escrita, R2) · **Con la marca:** Casa con el rojo #E1251B como «lo que caduca» (regla 4 de la gramática) — el único rojo de la página — y con Bold Extended. R2: cifra sin documento de la central = nunca (lección del «Hasta 20 % dto.» retirado). El modelo de ofertas aún no está construido (decisión bloqueante nº 3).

### Tipografía del sistema (Helvetica Neue nativa en iOS) + escala fluida + text-wrap balance/pretty  ·  *Tipografía*
Pila neo-grotesca de modern-font-stacks sin Inter delante: `'Helvetica Neue', Roboto, 'Arial Nova', Arial, sans-serif` — en iPhone/Mac renderiza la tipografía del brand book a 0 KB; Android cae a Roboto. Tamaños con `clamp()` (utopia-core) entre 375px y escritorio; `text-wrap: balance` en titulares de >2 líneas, `pretty` en cuerpo. Tokens en dos capas (primitivos numerados + roles semánticos por plantilla). El rol Extended se aproxima con letter-spacing amplio + mayúsculas o se autoaloja UN peso subseteado.

**Por qué gusta:** Carga instantánea sin parpadeo; la mancha de texto parece compuesta a mano (sin viudas) y en móvil nada se ve encogido. Es lo que separa «de agencia» de «de plantilla» sin que el visitante sepa por qué. Y libera presupuesto: el repo precarga Inter (48 KB) siempre, con Grancasa a 22 KB del tope.

**Ejemplos:** [system-fonts/modern-font-stacks](https://github.com/system-fonts/modern-font-stacks) [V — 15 pilas por clasificación con su CSS exacto] · [WebKit — text-wrap: pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/) [V — WebKit evalúa el párrafo entero; pretty en Safari 26] · [argyleink/open-props](https://github.com/argyleink/open-props) [V — convención de tokens; escribir solo los que se usan, no importar los 4 KB]

**Viabilidad:** css-puro · 0 KB (frente a 48 KB de Inter hoy); 1–3 KB de tokens · clamp() Safari 13.1+; balance Safari 17.5+; pretty Safari 26+ (Firefox lo ignora sin daño) · reduced-motion: No aplica

**Sirve a:** R1 (horario legible a 375px), R5 (vocabulario común a las 5 plantillas), presupuesto 900 KB · **Con la marca:** Casa: la marca ES Helvetica Neue con 5 roles. Choca en Android/Windows (Roboto/Arial): aceptar la degradación o `size-adjust` sobre local(). Riesgo de sistema: si las 5 plantillas comparten tokens de radio/sombra, acaban pareciéndose; la capa semántica debe cambiar de verdad (radio 0 en una, bisel en otra).

### Foto pequeña y recortada sobre fondo plano («bloque estudio»), nunca hero a sangre  ·  *Foto*
Cada foto vive en una celda de `aspect-ratio` fijo (1:1 o 4:5) con `object-fit: cover` y `object-position` por foto, sobre fondo plano gris #F5F5F5/#DADADA o cian que aporta el «aire», a no más de su ancho nativo (382px = techo absoluto). Lando: retrato recortado sobre blanco, el color lo pone la UI. D3 «Portada»: la foto como lámina con passe-partout y pie fechado; D2: cartela debajo (una foto con pie es documentación).

**Por qué gusta:** Ocho fotos desiguales de móvil se convierten en una retícula uniforme que parece hecha por un fotógrafo; una cara mirando a cámara en pequeño genera más confianza que una tienda grande mal iluminada. Es lo contrario de la «web WordPress»: sin cajas flotando ni foto de stock.

**Ejemplos:** [Lando Norris (captura 375px)](https://www.landonorris.com/) [V — retrato recortado sobre blanco puro; el color viene del CSS] · [Susanne Kaufmann (SiteInspire)](https://www.susannekaufmann.com/) [V — packshot sobre fondo neutro + valoración 4.8–4.9 + 2 líneas] · [every-layout.dev — Frame y Reel](https://every-layout.dev/layouts/) [V — contenedor de proporción fija + scroll horizontal nativo]

**Viabilidad:** css-puro · 0 KB de CSS; fotos a 400–600px pesan 30–60 KB en WebP/AVIF frente a 150–300 KB a sangre · aspect-ratio Safari 15+; object-fit universal; AVIF Safari 16.1+ con fallback WebP vía <Picture layout=constrained> · reduced-motion: No aplica

**Sirve a:** P2, P4, P5 (retrato del asesor), N6, R1 (el hero no es la foto) · **Con la marca:** Casa con la base blanca (elemento 7) y con el gris #DADADA como «estudio». El marco puede ser el círculo punteado (retrato del asesor) o el recorte en cuña. Recortar caras de empleados exige consentimiento (R8/RGPD). En escritorio la foto de 382px solo puede ser un tile de 1/3, jamás hero.

### Duotono/monotono cian para domar fotos de ambiente  ·  *Foto*
`filter: grayscale(1) contrast(1.2)` sobre la foto + capa cian con `mix-blend-mode: multiply` (o `background-blend-mode`), con `isolation: isolate` en el contenedor. Convierte cualquier foto de móvil en «una imagen de la marca» y unifica luces. Alternativa sin blend: `grayscale(1) sepia(1) hue-rotate(160deg) saturate(3)`. Spotify diseñó su «Lens» precisamente para fotos de terceros que no controlaba.

**Por qué gusta:** Coherencia: diez fotos malas distintas se vuelven una serie; la gente lee coherencia como profesionalidad y la mala luz pasa a ser «estilo».

**Ejemplos:** [COLLINS — Spotify case study](https://wearecollins.com/case-studies/spotify/) [V — duotono de serigrafía para fotos no controladas] · [Web Designer Wall — Spotify colorizer con blend modes](https://webdesignerwall.com/tutorials/create-spotify-colorizer-effects-css-blend-modes) [V — código exacto con @supports] · [Piper Haywood — blend modes y stacking context](https://piperhaywood.com/css-blend-modes-beware-the-stacking-context/) [V — un ancestro con fixed/opacity/transform corta el blend]

**Viabilidad:** css-puro · 0 KB (evita retocar 50×8 fotos a mano) · mix-blend-mode Safari 8+ (parcial), Chrome 41+, Firefox 32+; bug reportado en iOS 26 WKWebView con filter+blend [P]: probar por tienda · reduced-motion: Estático; nunca transicionar filter

**Sirve a:** P4 (tienda seria), solo estética · **Con la marca:** Casa con el cian dominante en superficie. Choca con la información: mata sabores, envases y el reconocimiento de la fachada desde el pasillo. PROHIBIDO sobre lineales/producto (P2) y fachada (P1); solo ambiente, equipo, fondo de hero. Sobre luz amarilla puede quedar verdoso: verificar en píxeles, no aprobar por la propiedad.

### Foto anotada con pines de llamada (línea + punto anillado)  ·  *Foto*
Contenedor con `aspect-ratio` fijo y 2–3 pins absolutos en %: punto cian + anillo `::before` con pulso (solo transform/opacity) + etiqueta corta («aquí te asesoran», «neveras», «entrada planta 1»). Convierte una foto de móvil en un plano anotado; la mirada va al trazo, no a la calidad.

**Por qué gusta:** La gente no mira una foto de tienda: mira DÓNDE está lo que busca. Un pin responde «¿qué tienen?» y «¿por dónde entro?» en un segundo y hace que la foto parezca intencionada.

**Ejemplos:** [CodePen — Pulsating Hotspot (Matthias Ott)](https://codepen.io/matthiasott/pen/qEEwXp) [P — anillo que se expande y se detiene al hover; solo scale/opacity (CodePen devolvió 403)] · [CodePen — Image hotspots pure CSS](https://codepen.io/will301/pen/MdJVMV) [P — etiqueta desplegable sin JS] · [Kronborg Slot](https://kronborg.dk/) [V — arco fino blanco superpuesto a la foto del hero (trazo sobre foto, mismo principio)]

**Viabilidad:** css-puro · <1 KB + ~0,3 KB por pin · Universal; aspect-ratio Safari 15+ · reduced-motion: Apagar el pulso; el punto queda fijo. La información está en la etiqueta, nunca en la animación (R4)

**Sirve a:** P2 (pins sobre lineales), P1 (pin sobre fachada/centro comercial), P5, N1 (ver_productos) · **Con la marca:** ES el elemento nº 5 del brand book, literal. Exige `object-position` por foto en el JSON o el pin señala la pared al cambiar el recorte. En 375px caben 3 pins con etiqueta; en las verticales de 382px solo sobre el tercio superior. Patrón POCO VERIFICADO: solo fuentes [P].

### Círculo punteado / arcos finos como marco de texto o retrato  ·  *Foto*
SVG inline `<circle stroke-dasharray="0 8" stroke-linecap="round" pathLength>` (puntos redondos perfectamente repartidos, `vector-effect: non-scaling-stroke`) enmarcando UN bloque de ≤6 palabras («Hazte socio en caja. Alta en 2 min.») o el retrato recortado del asesor sobre fondo plano. Lando usa arcos orbitales de 1px gris detrás del retrato. Nunca `border: dashed` + `border-radius` (se vuelve sólido y desigual entre motores).

**Por qué gusta:** Marco editorial sin caja: el texto flota y la página respira; añade profundidad y «dibujo» a 0 KB. Es el elemento más humano de la gramática (sello, etiqueta a mano).

**Ejemplos:** [Lando Norris (captura 375px)](https://www.landonorris.com/) [V — círculos concéntricos tenues detrás del retrato sobre blanco] · [MDN — stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) [V — receta exacta del círculo punteado; baseline desde 2020] · [Bugzilla 382721](https://bugzilla.mozilla.org/show_bug.cgi?id=382721) [P — border dashed con radius renderizado sólido]

**Viabilidad:** css-puro · ~0,3 KB por SVG · Universal. mask/clip-path para recortar el círculo tras la foto: Safari 15.4+ · reduced-motion: Estático; un stroke-dashoffset girando lento es el único movimiento tolerable y se apaga bajo reduce

**Sirve a:** P3 (socio, sin cifras: R2), P5 (retrato del asesor), P8, N3 (interes_socio) · **Con la marca:** ES el elemento nº 4 (círculos punteados de 300–450px en los banners, único uso del rojo como forma). Regla: enmarca UN bloque, no decora. Choca sobre foto ruidosa (pegatina de supermercado): solo sobre blanco/cian plano con la foto recortada DENTRO, no encima.

### Tira horizontal con scroll-snap (fachada primero, fotos verticales, categorías)  ·  *Foto*
`overflow-x: auto; scroll-snap-type: x mandatory; scroll-snap-stop: always` con tarjetas de 72–80 % del ancho para que la siguiente asome (peek) y un contador «3/8»; las verticales de 382px caben enteras a altura fija. La primera foto es siempre la FACHADA con rótulo (Apple, Basic-Fit, Nike). Opcional: la tarjeta centrada escala .92→1 con `view(inline)` (Safari 26+). Solo fotos/categorías/marcas; el texto (horario, dirección) jamás en horizontal.

**Por qué gusta:** Es el gesto de Instagram y Maps: deslizar de lado se entiende sin explicación y permite enseñar 8 fotos mediocres pequeñas en vez de una grande. Al franquiciado le gusta porque «salen todas sus fotos»; la fachada sirve para reconocer el local al llegar.

**Ejemplos:** [Apple Retail — Puerta del Sol](https://www.apple.com/es/retail/puertadelsol/) [V — carrusel de 5 fotos bajo el nombre y el estado; la foto es secundaria y desplazable] · [Nike Store Madrid Serrano II](https://www.nike.com/retail/s/nike-store-madrid-serrano-ii) [V — fachada arriba; tiendas cercanas con foto + estado (texto leído)] · [Adrian Roselli — Horizontal scrolling containers are not a content strategy](http://adrianroselli.com/2025/08/horizontal-scrolling-containers-are-not-a-content-strategy.html) [V — problemas de teclado, foco y gesto atrás; solo para imágenes]

**Viabilidad:** css-puro · ~0,4 KB (+0,4 KB de JS para puntos activos, o se omite y se deja el peek) · scroll-snap Safari 11+; scroll-snap-stop Safari 15+. Los puntos por view(): Safari 26+ (::scroll-marker es solo Chrome 135+: no usar) · reduced-motion: El snap es navegación, se mantiene; sin escalado; scroll-behavior:auto

**Sirve a:** P1 (reconocer la tienda), P2, P4, N1 (ver_productos) · **Con la marca:** Casa con la cuña como recorte de la primera tarjeta y con el duotono en las de ambiente (nunca en la fachada). Sin peek ni contador parece una sola foto (ilusión de completitud). Con 1 sola foto (Lagoh tiene 3 verticales, dos iguales): sin tira, una foto y la cuña.

### Revelado al entrar en viewport con animation-timeline: view(), estado final por defecto  ·  *Movimiento*
Tarjetas o adornos que suben 16–24px y pasan de opacity .4 (nunca 0) a 1 en el tramo `animation-range: entry 0% cover 40%`, sin listeners ni IntersectionObserver. TODA la declaración vive dentro de `@supports (animation-timeline: view())` y `@media (prefers-reduced-motion: no-preference)`: sin soporte, el elemento está en su estado final. Máximo 2–3 efectos por página, nunca sobre la zona noble. Variante: claim que se «pinta» de cian con background-clip:text ligado al scroll.

**Por qué gusta:** La página «responde» al pulgar: sensación de app y de «vivo», reversible, sin tirón de librería. Es lo que el dueño lee como «moderno» frente a una página que aparece de golpe.

**Ejemplos:** [WebKit — A guide to scroll-driven animations with just CSS](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/) [V — imágenes que entran deslizando y paran al 50 %; patrón @media not (prefers-reduced-motion); Safari 26] · [whoooop — ship scroll-driven animations safely](https://whoooop.co.uk/blog/css-scroll-driven-animations) [V — estado final como CSS por defecto, animación dentro de @supports, solo transform/opacity] · [Dropbox Brand / Floema / Lando (antiejemplo; capturas 375px)](https://brand.dropbox.com/) [V — las tres premiadas mostraron viewports en blanco sin JS: opacity:0 + observer es la forma más rápida de que una tienda vea una web vacía]

**Viabilidad:** css-puro · 0,3–0,8 KB por familia de elementos · Chrome 115+, Safari/iOS 26.0+ (con glitches cerca del 0 % en 26.0–26.4, corregidos en 26.5), Firefox: caniuse lo lista en 158 pero MDN lo daba tras flag en sep-2026 — tratar como no soportado. Cobertura móvil España estimada ≈92 % (cálculo propio) · reduced-motion: Todo bajo no-preference; con reduce nada se mueve y nada se oculta (R4)

**Sirve a:** solo estética, R4 (si se hace al revés que los premiados: visible por defecto) · **Con la marca:** Casa si lo que se revela son los adornos de la gramática (cuña, rayado, pines), no los datos. Choca con las fotos: una foto mala que se mueve llama más la atención sobre su calidad; nunca escalar por encima de 1.0. Crítica de 2026 (Bushell, Coyier: «Death to scroll fade»): si se abusa es la plantilla AOS de 2019.

### Cuña/barra de progreso ligada al scroll (scroll())  ·  *Movimiento*
Elemento fijo de 4–6px —o la propia cuña de la esquina superior izquierda— que escala en X de 0 a 1 con `animation-timeline: scroll(root block)` y `transform-origin: 0 50%`, hecha con el rayado 45° o el cian de marca. Dice «cuánto queda» en una página larga.

**Por qué gusta:** Orientación sin coste y una pieza de identidad que cobra vida sin un byte de JS; el usuario sabe que la página tiene fin.

**Ejemplos:** [scroll-driven-animations.style — Reading progress indicator](https://scroll-driven-animations.style/demos/progress-bar/css/scroll-defaults.html) [V — barra de progreso CSS puro con scroll()] · [Chrome for Developers — Scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations) [V — scroll(), view(), animation-range, timeline-scope]

**Viabilidad:** css-puro · ~0,2 KB · Chrome 115+, Safari/iOS 26+; Firefox no. En Safari 26.0 el progreso «no clampa»: animation-fill-mode both · reduced-motion: La cuña queda fija en su posición de marca u oculta

**Sirve a:** solo estética, identidad (cuña / rayado) · **Con la marca:** Casa con la cuña (elemento 1) y el rayado (3): la gramática ya dice que el rayado puede ser «barra de progreso/scroll». Riesgo: si la cuña crece sobre la cabecera tapa el horario/CTA sticky — capa propia de 4–6px o z-index bajo el texto. Tres elementos fijos (cabecera + barra inferior + progreso) en 667px es demasiado.

### Cabecera que se compacta con el scroll y deja fijo el dato de hoy  ·  *Movimiento*
Primer viewport: cuña grande + logo + «Hoy 10:00–21:30 · Cierra en 3 h». Al bajar 120–200px, con `animation-timeline: scroll()` y `animation-range: 0 200px`, la cuña encoge (transform) y queda una franja sticky de 40px con horario + botón «Cómo llegar». Sin soporte, la franja compacta es sticky desde el inicio (elegir el estado compacto como base). Chrome-only extra: `@container scroll-state(stuck: top)` para la sombra.

**Por qué gusta:** La información que más se busca nunca desaparece pero deja de ocupar un tercio de la pantalla; es el patrón de las apps de mapas y comida. El franquiciado ve su horario «vivo» todo el rato.

**Ejemplos:** [scroll-driven-animations.style — Shrinking header + shadow](https://scroll-driven-animations.style/demos/shrinking-header-shadow/css/) [V — cabecera que se encoge y añade sombra, CSS puro] · [Apple — iPhone 17 Pro (sub-nav sticky)](https://www.apple.com/es/iphone-17-pro/) [V — nombre del producto + «Comprar» acompañan 12 secciones (estructura leída)] · [NN/g — Sticky headers](https://www.nngroup.com/articles/sticky-headers/) [V — fondo opaco, una fila, mínima altura; ratio contenido/cromo]

**Viabilidad:** css-puro · ~0,5 KB · position: sticky universal; el encogimiento Chrome 115+/Safari iOS 26+; scroll-state() solo Chrome 133+ (mejora, nunca base) · reduced-motion: Sin transición: franja compacta desde el inicio

**Sirve a:** P1, N1, R1, R3 · **Con la marca:** Casa con la cuña (se encoge, no desaparece). Doble fuente de verdad del horario (grande arriba, pequeño en la franja) renderizada del MISMO dato. Excluye la barra fija inferior en la misma plantilla (un solo elemento persistente).

### Tarjetas apiladas / scrollytelling con sticky (una pregunta por tarjeta)  ·  *Movimiento*
4–5 tarjetas de ~80vh con `position: sticky; top: 0`: la de debajo escala a .92 y baja opacidad mientras la siguiente pasa por encima (view() + animation-range exit). Cada tarjeta = una pregunta del cliente («¿Por dónde empiezo?», «¿Me vais a vender lo que no necesito?») o un paso de la ruta del asesor con la cuña fijada y un número 1→2→3. Tarjetas de tinta plana + tipografía, la foto pequeña dentro. Solo en la segunda mitad de la página.

**Por qué gusta:** Convierte 4–5 mensajes en una narración que se controla con el pulgar: el usuario «pasa página» y cada tarjeta recibe atención completa. Es el lenguaje de Apple y de las landings premium que el dueño reconoce como «bonito».

**Ejemplos:** [scroll-driven-animations.style — Stacking cards](https://scroll-driven-animations.style/demos/stacking-cards/css/) [V — tarjetas sticky que se apilan y escalan; CSS puro] · [Apple — iPhone 17 Pro (galerías fijadas)](https://www.apple.com/es/iphone-17-pro/) [V — imagen fija mientras el texto cambia (estructura leída, no vista correr)] · [CSS-Tricks — Stacked cards with sticky positioning](https://css-tricks.com/stacked-cards-with-sticky-positioning-and-a-dash-of-sass/) [P — versión solo sticky, sin escala]

**Viabilidad:** css-puro · ~0,6 KB. Sin scroll-driven, las tarjetas se apilan (sticky) sin escalar · sticky Safari 13+; el escalado Chrome 115+/Safari iOS 26+. Bugs de sticky múltiple reportados en iOS 26.0 [P] · reduced-motion: Quitar sticky y escala: las tarjetas fluyen

**Sirve a:** P5, P6, P7, P3, N6 · **Con la marca:** Casa con la cuña fijada como elemento constante y la numeración en el pin. Choca con la foto a pantalla completa (la foto mala más grande posible) y con las secciones sesgadas (skew rompe sticky). 5 tarjetas × 80vh alargan 4 pantallas: nunca antes del horario (R1/R3).

### Transiciones nativas entre páginas (View Transitions cross-document, sin ClientRouter)  ·  *Movimiento*
`@view-transition { navigation: auto; }` en el CSS y `view-transition-name` único en 2–3 elementos (cuña/logo, bloque de horario, barra fija). Al ir de la portada a /oferta o /guia, esos elementos persisten y el resto hace crossfade de ~250ms. Cero JS: Astro SSR ya es multipágina. NO usar `<ClientRouter />` (añade router en cliente).

**Por qué gusta:** Elimina el parpadeo blanco entre páginas, la señal inconsciente de «web vieja»; la tienda se siente un lugar y no cinco documentos. State of CSS 2026: la 2ª feature más deseada. Es la diferencia más visible entre «una web» y «una app» a coste cero.

**Ejemplos:** [WebKit — Two lines of cross-document view transitions code](https://webkit.org/blog/16967/two-lines-of-cross-document-view-transitions-code-you-can-use-on-every-website-today/) [V — Safari 18.2+; sin soporte, cero efecto] · [caniuse — @view-transition (cross-document)](https://caniuse.com/mdn-css_at-rules_view-transition) [V — Chrome/Edge 126+, Safari 18.2+, Samsung 28+; Firefox no] · [Astro docs — View transitions](https://docs.astro.build/en/guides/view-transitions/) [V — la vía nativa no altera la MPA ni añade JS]

**Viabilidad:** css-puro · ~0,3 KB; 0 JS · Chrome 126+, Safari/iOS 18.2+ (cubre iOS 18 y 26: casi todo el parque iPhone); Firefox no cross-document (navega normal) · reduced-motion: ::view-transition-group(*){animation:none} bajo reduce (WebKit tolera dejar el crossfade)

**Sirve a:** N1 (home → cómo llegar sin sensación de salir), N4 (ver_oferta), N6 (/guia), venta al franquiciado («parece una app») · **Con la marca:** Casa con la cuña como elemento persistente entre páginas. Riesgos: nombres duplicados abortan la transición en silencio; una foto de 382px que cambia de tamaño estira píxeles 250ms (no nombrarla); TTFB de SSR frío se percibe como congelado — medir antes de activar.

### Desplegables nativos animados (details/summary, popover, @starting-style, grid 0fr→1fr)  ·  *Movimiento*
FAQ y «preguntas que da vergüenza hacer» como `<details><summary>` con el contenido en un wrapper `display:grid; grid-template-rows: 0fr → 1fr` (transición 300ms) y el chevron rotando; hojas de horario o selector WhatsApp/Llamar/Maps como `popover` que sube desde abajo con `@starting-style` y `transition: display/overlay allow-discrete`. Nada de `interpolate-size` (solo Chrome 129+).

**Por qué gusta:** Una pregunta que se abre suavemente invita a leer la siguiente; el salto brusco del details nativo parece roto. La animación de entrada de la hoja es la que la gente conoce de iOS/Android: familiar, no decorativa.

**Ejemplos:** [MDN — @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) [V — Baseline 2024; ejemplo de popover con opacity/transform] · [caniuse — interpolate-size](https://caniuse.com/mdn-css_properties_interpolate-size) [V — Chrome 129+ solo; Safari y Firefox sin soporte (ago-2026)] · [Terminal Industries](https://terminal-industries.com/) [V — acordeones FAQ tras el recorrido numerado]

**Viabilidad:** css-puro · ~0,4–0,5 KB; 0 JS · <details> universal; grid-template-rows animable Safari 16+; @starting-style Safari 17.5+; popover iOS 18.3+ completo. Sin soporte: apertura instantánea · reduced-motion: transition:none → igual que nativo

**Sirve a:** P6, P7, P5, P1 (horario semanal), N2, N6 · **Con la marca:** Neutro; el chevron puede ser el pin. Choca con R7 si el popover se abre solo o tapa >15 %; solo por toque. Un FAQ de 12 preguntas en la primera mitad desplaza el bloque de socio (R2): máximo 5.

### Una sola micro-interacción de sistema: :active con scale y easing linear(), hover gated  ·  *Movimiento*
Todos los botones comparten UN gesto: `:active { scale: .96 }` con `transition: scale 500ms linear(...)` (spring generada), fondo azul #0055B8 durante el toque, `-webkit-tap-highlight-color: transparent`. Los hovers (levantar 4px, subrayado que crece) viven dentro de `@media (hover: hover) and (pointer: fine)` para el ordenador del franquiciado; el móvil solo ve :active. Nada más se mueve por sí solo.

**Por qué gusta:** El rebote sutil es lo que diferencia una interfaz «cuidada» de una plantilla; el pulgar recibe confirmación de que ha tocado «Llamar» y no repite el toque. Y una web que NO rebota por todas partes se percibe más cara. Apple: scale(0.95) como único gesto de todo el sistema.

**Ejemplos:** [caniuse — linear() easing](https://caniuse.com/mdn-css_types_easing-function_linear-function) [V — Safari 17.2+, Chrome 113+, Firefox 112+; fallback automático a ease] · [Jake Archibald — Linear easing generator](https://linear-easing-generator.netlify.app/) [V — springs a linear() con paradas optimizadas] · [MDN — @media hover](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover) [V — hover:none en táctiles; envolver :hover]

**Viabilidad:** css-puro · <0,6 KB (1–2 curvas en :root) · Universal; linear() Safari 17.2+; :active en iOS requiere <a>/<button> · reduced-motion: transition-duration:1ms (mantener el cambio de color, quitar el rebote)

**Sirve a:** N1, N2 (menos toques fallidos), R4 · **Con la marca:** Casa con la sobriedad de la base blanca. Overshoot grande en 375px parece juego: limitar a .96↔1.02. Copiar Hover.css (curl, bounce, grow-shadow) = «web de 2010» inmediata.

### Marquesina CSS de claims o categorías (reubicada y rediseñada, o no vuelve)  ·  *Movimiento*
Banda de 36–44px con texto en mayúsculas duplicado (aria-hidden la copia) desplazándose con `translateX(calc(-100% - gap))` en 30–60s, bordes fundidos con mask-image, una sola banda por página. Contenido: claims de marca («YOU ARE Stronger THAN YOU THINK») o categorías sin precio; jamás horario ni oferta. Puede ir sobre el rayado 45° y rotada -3° como chevron.

**Por qué gusta:** Energía y actualidad en 44px sin imágenes: una franja que se mueve dice «aquí pasa algo» y es el código visual del deporte (marcadores, pantallas de gimnasio).

**Ejemplos:** [Ryan Mulligan — The infinite marquee](https://ryanmulligan.dev/blog/css-marquee/) [V — técnica canónica; con reduced-motion «desactivar el autoscroll por completo»] · [Smashing — Infinite-scrolling logos in flat HTML and pure CSS](https://www.smashingmagazine.com/2024/04/infinite-scrolling-logos-html-css/) [V — sin duplicar markup (animation-delay negativo), mask-image, pausa] · [Gymshark (gira 27-ago)](https://www.gymshark.com/) [V — barra de anuncio superior de 40px: slot unánime del sector (las 12 referencias la llevan)]

**Viabilidad:** css-puro · ~0,4 KB + 200 bytes de HTML duplicado · Universal; mask-image sin prefijo Safari 15.4+ · reduced-motion: OBLIGATORIO parar y mostrar la fila estática con wrap (es la animación autónoma más problemática para vestibular)

**Sirve a:** P2 (categorías), N4 solo como repetición (la oferta existe además en estático, R4), solo estética · **Con la marca:** Casa con las bandas diagonales y el claim con palabra en script. AVISO DEL REPO: la marquesina figura como ADN de la plantilla RECHAZADA (direcciones.md, tokens compartidos D1/D2). Si vuelve: otro sitio, otro contenido, otro ritmo y sin la paleta rojo/azul de la rechazada; y con logos de laboratorios hay riesgo legal con la central.

### Base blanca + un acento cian que solo vive en la UI; azul en titulares; rojo una vez  ·  *Superficie*
Fondo blanco, tinta oscura, y el color en tres sitios: superficies/cuñas #00A7E1, titulares y logo #0055B8, #E1251B una sola vez por página (lo que caduca). El acento nunca se aplica sobre la foto (ahí solo blanco o negro). Lando: blanco + lima en dos botones; Dropbox: blanco + azul solo en tipo y logo; Scout: un guion naranja de 20px como toda la firma.

**Por qué gusta:** Se percibe como «marca segura de sí misma»: no necesita pintar todo. Una página con UN acento se percibe cara; con tres, barata.

**Ejemplos:** [Lando Norris (captura 375px)](https://www.landonorris.com/) [V — lima solo en botones; resto blanco/negro] · [Dropbox Brand (Awwwards SOTM feb-2025; captura 375px)](https://brand.dropbox.com/) [V — azul #0061FE solo en tipografía y logo sobre blanco] · [Spotify design guidelines](https://developer.spotify.com/documentation/design) [V — la marca fija por escrito dónde NO va su color]

**Viabilidad:** css-puro · 0 KB (custom properties) · Universal; color-scheme: light fijado (sin toggle) · reduced-motion: No aplica

**Sirve a:** N1/N2 (el acento marca el botón que importa), P4, R3 (el único rojo reservado al estado real del horario cuando esté validado), identidad · **Con la marca:** ES el elemento nº 7 y la regla de colores del brand book (cian domina superficies, azul titulares, rojo escaso). Contrastes medidos: blanco sobre cian ~2,8:1 y azul sobre cian ~2,5:1 FALLAN; el rojo 4,19:1 no pasa como texto pequeño; #98989A no pasa sobre blanco. En bloque cian el texto es tinta oscura; en bloque azul, blanco (~7:1).

### Rayado diagonal fino a 45° / rejilla técnica como textura de bloques sin foto  ·  *Superficie*
`repeating-linear-gradient(-45deg, #DADADA 0 2px, transparent 2px 10px)` en esquinas, franjas, fondo del bloque de socio o del selector de objetivo; nunca bajo texto de lectura ni junto a fotos. Variante Dropbox Brand: rejilla de líneas de 1px azul claro dividiendo la página en columnas; Decathlon Yestalgia: fondo tipo plano técnico con ítems numerados. Mínimo 2px y contraste bajo (moiré en DPR fraccionario).

**Por qué gusta:** Da estructura y «materia» a una página blanca con poco contenido; el ojo percibe orden aunque las fotos no lo tengan, y remite a gimnasio/industria. Es lo que más rápido dice «USA Fitness» al que conoce los paneles de la tienda.

**Ejemplos:** [Dropbox Brand (captura 375px)](https://brand.dropbox.com/) [V — rejilla de 4 columnas con líneas azul claro en todo el scroll] · [MDN — repeating-linear-gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient) [V — sintaxis exacta; universal desde 2015] · [Afif13/CSS-Pattern](https://github.com/Afif13/CSS-Pattern) [V — patrones solo con gradientes parametrizados]

**Viabilidad:** css-puro · 0 KB · Universal · reduced-motion: Estático; nunca animar background-position (repinta la capa)

**Sirve a:** P2/N4 (franja rayada como etiqueta de oferta), P3 (fondo del bloque socio), solo estética · **Con la marca:** ES el elemento nº 3. Regla del brand book: el rayado no pisa texto, vive en esquinas y zonas sin contenido. Rayado + foto ruidosa + texto = tres capas compitiendo; rayas amarillo/negro = «en obras», nunca. Sustituye al grano/feTurbulence (que sobre foto mala parece filtro Instagram 2012 y cuesta GPU).

### Metal cepillado como banda fina (gradiente CSS, 0 KB)  ·  *Superficie*
Franja de 24–48px con `linear-gradient(45deg, #999 5%, #fff 10%, #ccc 30%, #ddd 50%, #ccc 70%, #fff 80%, #999 95%)` + un rayado horizontal casi imperceptible (tres repeating-gradients de longitud distinta, simurai) o resuelta plana en #DADADA. Siempre pareja de la cuña cian formando el chevron, con hueco blanco entre ambas. Texto plata solo con `background-clip: text` en una cifra, nunca en botones.

**Por qué gusta:** Es el único elemento «premium» de la gramática: la nevera y los paneles llevan metal real; bien dosificado lee como calidad de material, no como botón brillante.

**Ejemplos:** [simurai — Brushed metal](https://simurai.com/lab/2011/08/21/brushed-metal) [V — 3 repeating-gradients para simular veta] · [ibelick — Metallic effect with CSS](https://ibelick.com/blog/creating-metallic-effect-with-css) [V — gradiente multi-parada a 45° con código completo] · [caniuse — background-clip: text](https://caniuse.com/background-clip-text) [V — Safari iOS 15.5+ completo]

**Viabilidad:** css-puro · <0,5 KB · Universal (conic Safari 12.2+ si se usa) · reduced-motion: Estático; el «shine sweep» fuera siempre (R4)

**Sirve a:** solo estética, P4 indirecto (materialidad = tienda real) · **Con la marca:** ES el elemento nº 2. Choca si se hace cromado fotorrealista (skeuomorfismo 2010 / «liquid chrome» 2025) o con 3 paradas (Windows XP): 8–12 paradas y verlo en píxeles. Nunca fondo de sección ni CTA; junto a fotos con luz mala apaga más la foto.

### Bloque de color plano a sangre como sección: el cambio de color ES el divisor  ·  *Superficie*
Secciones enteras en un solo color de marca de borde a borde (cian, azul, gris #F5F5F7) con tipografía grande en negativo y sin foto ni línea divisoria; la alternancia blanco/color/blanco es toda la estructura. Apple: exactamente una sombra en todo el sistema; Nike: «no drop-shadow elevation, cards do not lift». Es la salida limpia para la peor tienda (Lagoh: sin apaisada usable): tinta plana + rótulo.

**Por qué gusta:** La forma más barata de «tener marca» sin fotos: una pantalla cian con el rótulo se reconoce como USA Fitness a un metro, igual que la cuña en la tienda. Sin cajas flotando con sombra ni bordes redondeados: se percibe como catálogo impreso, lo contrario de la «web WordPress».

**Ejemplos:** [awesome-design-md — Apple DESIGN.md](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/apple/DESIGN.md) [P — tiles blanco/#f5f5f7/oscuro, «el cambio de color es el divisor», una sola sombra (análisis generado, no oficial)] · [Barebells (gira 27-ago)](https://www.barebells.com/) [V — color plano + producto como identidad del sector] · [925 Studios — AI slop guide (antiejemplo)](https://www.925studios.co/blog/ai-slop-web-design-guide) [V — el degradado morado-azul como tell de web generada; color semántico ligado a función]

**Viabilidad:** css-puro · 0 KB; además reduce CSS · Universal · reduced-motion: No aplica

**Sirve a:** P3 (sección socio como bloque propio y estático, R2), P4 (bloque azul con reseñas), R1 (primer viewport digno en la peor tienda) · **Con la marca:** Casa con «el cian domina superficies» PERO la base debe seguir siendo blanca: el bloque de color es minoritario (regla 5 de la gramática). Contraste: en cian el texto va oscuro; en azul, blanco. Sustituye al mesh/aurora (estética SaaS-IA que envejece); si se usa malla, paleta estricta cian→azul sobre blanco y siempre con un elemento sólido encima.

### Servicios en tienda como fichas (icono propio + nombre + una línea)  ·  *Contenido local y prueba*
Rejilla de 4–8 fichas por tienda activables desde el JSON: «Asesoramiento gratuito», «Báscula de composición corporal», «Muestras para probar», «Recogida de reserva», «Tarjeta regalo». Icono del set propio (trazo fino, pin de llamada) o texto sin icono. Decathlon las titula H3 + una línea; H&B las pone como chips antes del horario.

**Por qué gusta:** Es la respuesta a «¿qué tienen?» sin catálogo ni precios, escrita una vez para las 50 tiendas y activada por tienda.

**Ejemplos:** [Decathlon — Albacete](https://www.decathlon.es/es/store-view/tienda-de-deportes-albacete-0070045500455) [V — «Servicios en tienda» con fichas H3 + una línea, más categorías y marcas destacadas por tienda (DOM leído)] · [Holland & Barrett — Manchester Market Street](https://www.hollandandbarrett.com/stores/manchester-3845/) [V — chips «Consultation Room», «Biometrics Machine» delante del horario] · [lucide-icons/lucide](https://github.com/lucide-icons/lucide) [V — SVG crudos inlineables 24px/2px como base si no hay set propio]

**Viabilidad:** css-puro · ~0,5 KB CSS + 2–3 KB de 6–8 SVG inline (sprite <symbol>) · Universal · reduced-motion: No aplica

**Sirve a:** P2, P5, P7 («asesoramiento sin compromiso» como servicio) · **Con la marca:** Casa si los iconos se dibujan con la gramática (pin línea+punto, trazo a 45°); choca con iconos de librería genérica mezclados (look plantilla WordPress). No listar servicios que la tienda no da: dato por tienda, no de plantilla.

### Bloque firmado del responsable de la tienda (60 palabras, datos de ESA tienda)  ·  *Contenido local y prueba*
H2 «Unas palabras de [nombre]» + párrafo en primera persona con cifras propias del local (m², desde cuándo, planta, qué se pregunta más en su mostrador) + retrato pequeño en círculo punteado y b/n. Nace de un cuestionario de 5 preguntas al franquiciado, no de la central.

**Por qué gusta:** Es la prueba de que detrás hay una persona y de que la página no es la de la tienda de al lado. En una tienda de barrio ES el activo: el franquiciado que te va a atender.

**Ejemplos:** [Decathlon — Albacete](https://www.decathlon.es/es/store-view/tienda-de-deportes-albacete-0070045500455) [V — «Unas palabras del director de la tienda» con 4000 m² y servicios concretos] · [JOHN REED — Downtown LA](https://us.johnreed.fitness/clubs/downtown-los-angeles/) [V — titular propio del club con dato único (texto leído)] · [StoreRocket — location page design](https://storerocket.io/learn/location-page-design) [P — foto del encargado con nombre y bio hace la página «personal, no corporativa»]

**Viabilidad:** css-puro · 0 KB + foto ≤25 KB WebP · Universal · reduced-motion: No aplica

**Sirve a:** P5, P4, P7, N2 (WhatsApp con el nombre del asesor prellenado), R6 · **Con la marca:** Casa con el círculo punteado como marco del retrato y con Light+Bold en el titular. Choca con la clonación: 50 páginas con el mismo «director» es peor que nada. Decisión bloqueante nº 4 (quién escribe el texto). YMYL: Amanda Gil es entrenadora certificada, NO nutricionista.

### FAQ hiperlocal: 3–5 preguntas que solo esa tienda puede responder  ·  *Contenido local y prueba*
Acordeón `<details>` con preguntas del franquiciado sobre lo práctico: parking, planta del centro, entrada, transporte, «¿puedo venir sin saber nada?», «¿hacéis tarjetas regalo?». Texto plano, máximo 5. Fuente directa: las FAQ de seguidores respondidas por dependientes de la GUÍA TIENDAS de la central.

**Por qué gusta:** Responde lo práctico de P1 que ningún horario responde y da a Google texto único por tienda; la gente lo lee porque son SUS preguntas.

**Ejemplos:** [Decathlon — Albacete](https://www.decathlon.es/es/store-view/tienda-de-deportes-albacete-0070045500455) [V — FAQ con Parque Comercial Imaginalia, Vía Verde de Alcaraz, Chinchilla] · [Hurrdat — location page examples](https://hurrdatmarketing.com/web-design-news/location-page-examples/) [P — «location-specific FAQs guide visitors toward conversion»]

**Viabilidad:** css-puro · ~0,3 KB · <details> universal · reduced-motion: Sin animación por defecto

**Sirve a:** P1, P5, P6, P8, R6 · **Con la marca:** Neutro. Choca si se generan con IA a granel («¿Qué es la creatina?»): se nota. Las preguntas vienen del franquiciado.

### Prueba social como dato en tarjeta (nota + n + fuente + fecha), no como widget  ·  *Contenido local y prueba*
«4,7 · 212 reseñas en Google · sep-2026» en HTML con estrellas SVG inline y enlace saliente a la ficha; 1–2 citas cortas. Sin embed, sin feed de Instagram (solo enlace). Con 0 reseñas (5 de 8 tiendas), la sección se da la vuelta o no se pinta: decisión comercial pendiente.

**Por qué gusta:** El 96 % lee reseñas: ver la cifra sin salir resuelve la duda de fiabilidad en un segundo.

**Ejemplos:** [Susanne Kaufmann](https://www.susannekaufmann.com/) [V — nota numérica dentro de la tarjeta] · [Heirest (CSSDA WOTD 4-sep-2026)](https://heirest.com/) [V — «The experience, as told by you»] · [Huel (gira 27-ago)](https://huel.com/) [V — formato de nota + n ya capturado]

**Viabilidad:** css-puro · 0 KB · Universal · reduced-motion: No aplica (sin carrusel automático)

**Sirve a:** P4, N1 (contacto_maps), N5 (Instagram como enlace) · **Con la marca:** Casa con el círculo punteado (la cifra dentro) o la tarjeta biselada. La cifra lleva fuente y fecha (mismo estándar que R2). Grancasa no tiene ficha de Google: sameAs vacío, no inventado.

### Tiendas cercanas de la red con foto y estado  ·  *Contenido local y prueba*
3 tarjetas de tiendas de la misma ciudad/área con miniatura de fachada, nombre, distancia y «Abierta/Cerrada», renderizadas en SSR desde los datos de flota; visibles solo cuando la actual está cerrada.

**Por qué gusta:** Hace visible la RED («la cadena más grande de España» que usafitness.es dice y no enseña); si esta está cerrada, la otra está a 3 km. Para vender: el franquiciado sin web ve su hueco en el mapa.

**Ejemplos:** [Nike Store Madrid Serrano II](https://www.nike.com/retail/s/nike-store-madrid-serrano-ii) [V — «Nearby Stores» con foto + dirección + estado] · [Basic-Fit — A Coruña](https://www.basic-fit.com/es-es/clubs/basic-fit-a-coruna-avd.-salvador-de-madariaga-1ec43550fd654c7d8e23bc6c96cd2ff0.html) [V — «Gimnasios cercanos» con km]

**Viabilidad:** css-puro · 0 KB JS; 3 miniaturas WebP ≤8 KB · Universal · reduced-motion: No aplica

**Sirve a:** P1, P4, venta a franquiciados (efecto red) · **Con la marca:** Neutro. Conflicto comercial entre franquiciados (mandar visitantes a otro): solo misma área y solo con la actual cerrada; hoy 8 de ~50 tienen web.

## Cinco combinaciones — HIPÓTESIS para la fase de diseño, no decisión

### Cartel (D1, ya en construcción)
- Familias: Tipografía: rótulo a escala cartel + dos voces con UNA palabra en script + cifra display de oferta · Superficie: base blanca + tinta plana cian/azul cuando no hay apaisada usable (bloque de color como renuncia) · Foto: papel bajo el rótulo — pequeña, duotono cian en ambiente, nunca a sangre · Movimiento: casi nada — :active con linear() + View Transitions; la script entra un instante después · Navegación: ficha en el primer viewport + barra fija inferior (Cómo llegar · WhatsApp) · Contenido local: FAQ hiperlocal + prueba social como dato
- Motivo de marca: Elemento 6 (mayúsculas Helvetica + una palabra en script, Light+Bold) con la cuña como tinta plana del rótulo, no como forma dibujada. El rojo #E1251B solo en lo que caduca.
- Para quién: Franquiciado de tráfico peatonal, Instagram activo, que nunca producirá fotos buenas; la peor tienda de la flota (Lagoh: 3 verticales de 382px, dos iguales) se ve digna.
- Por qué es distinta: Es la única cuyo primer viewport es texto: el rótulo a 18vw ES la imagen y la foto es papel. Radio 0, sin formas geométricas visibles, sin movimiento de scroll. Bloqueante: `rotulo` ≤14 caracteres o las ocho portadas empiezan igual por «USAFITNESS».

### Diagonal («la web es el local»)
- Familias: Composición: cuña de esquina como contenedor del hero + foto de fachada recortada en paralelogramo + chevron cian/metal separando secciones alternadas · Foto: fachada real recortada por la cuña (sin duotono), tira horizontal con snap para el resto · Movimiento: la cuña crece como progreso de scroll + cabecera que se compacta dejando fijo «Hoy hasta las 22:00 · Cómo llegar» · Tipografía: roles Helvetica sin gigantismo (Bold para el dato, Light para el resto); numeración 01·02·03 en la ruta del asesor · Superficie: base blanca con metal cepillado como banda fina del chevron; rayado 45° solo en esquinas · Navegación: cabecera compacta sticky como único elemento fijo (sin barra inferior)
- Motivo de marca: Elementos 1 y 2 (cuña diagonal cian + banda de metal formando chevron): la geometría que está construida físicamente en paneles, nevera y cartelería. La Basic-Fit de A Coruña demuestra el esquema con otro color.
- Para quién: Tienda de centro comercial que quiere que la web se reconozca desde el pasillo: la misma cuña en la web, el brand book y la nevera. Franquiciado que valora «que se vea la marca».
- Por qué es distinta: La única con composición en diagonales y con la foto recortada por una forma; el movimiento está ligado a la cuña (crece, se encoge) y no a reveals. Riesgo propio: el ángulo del polygon cambia con el aspect-ratio (fijar eje en px/vw); skew rompe sticky, así que las secciones sesgadas no conviven con stacking cards.

### Panel (infografía de datos)
- Familias: Composición: mosaico de tarjetas de DATO con una esquina biselada a 45° (bento sin fotos): horario hoy 2×2, cómo llegar, nota Google, socio, asesor · Foto: anotada con pines de llamada (línea + punto anillado) sobre el lineal y la fachada; retrato del asesor en círculo punteado · Tipografía: cifras y horario en Bold, etiquetas en versalitas/mono del sistema; dato local como ornamento (planta, entrada, coordenadas) · Movimiento: desplegables nativos (details/popover con @starting-style) para semana completa y selector de contacto; pulso del pin apagado bajo reduce · Superficie: rayado 45° como fondo de las tarjetas sin dato de foto; base blanca; cero sombras · Navegación: índice de anclas con chevrons dibujados como pines
- Motivo de marca: Elementos 4 y 5 (círculo punteado como marco de UN bloque de texto + pin de llamada): la gramática ya los describe como «la web como panel informativo». Es el único motivo de la marca que ningún referente del sector tiene.
- Para quién: Tienda con datos ricos: reseñas, servicios reales, asesor con horas fijas, varias fotos. El franquiciado «serio» que quiere que su web sea un panel de información, no un anuncio.
- Por qué es distinta: Sin hero: el primer viewport es una rejilla de respuestas. La foto no es fondo ni lámina, es un plano anotado. Riesgo propio: con Lagoh (0 reseñas, sin WhatsApp) el mosaico se vacía — el layout debe reordenarse por número real de tarjetas (3/5/7) y las fotos verticales solo admiten pins en el tercio superior. Los pines son el patrón menos verificado del catálogo (solo fuentes [P]).

### Lámina (D3 «Portada», editorial)
- Familias: Composición: página con fin — 5–7 pantallas, una pregunta por pantalla, mucho aire, el titular siguiente asomando · Foto: bloque estudio — la foto ascendida a lámina con passe-partout gris #DADADA y pie fechado (cartela); retrato del responsable pequeño · Tipografía: frases-cartel de 2–4 palabras con punto, micro-etiquetas en versalitas, corchetes en los CTA; escala moderada · Movimiento: stacking cards sticky para la ruta del asesor (segunda mitad) + View Transitions hacia /guia y Equipo · Superficie: base blanca luminosa casi total; el metal cepillado como única banda; ningún cian a sangre · Navegación: cabecera píldora con un solo CTA (Scout/Lando) + ficha compacta tipo Apple Retail · Contenido local: bloque firmado del responsable + FAQ hiperlocal + horario del asesor
- Motivo de marca: Elemento 7 (base blanca y luminosa) con el metal (2) como único material: la casa natural del texto firmado, /guia y «Las verdades». El sitio noble es para lo que se dice en el mostrador, no para la imagen.
- Para quién: Boutique / tienda con asesor reconocible (la GUÍA TIENDAS de la central ya tiene a Gouveia y Amanda Gil); franquiciado que vende confianza y consejo, no volumen.
- Por qué es distinta: La de voz más baja y menos color: se distingue de Cartel por la escala (40–56px frente a 18vw) y de Diagonal por la ausencia total de formas; es la única con scrollytelling y la única con texto firmado como pieza central. Riesgo propio: con 50 tiendas, el texto firmado clonado la mata (R6); y en tipografía Light gris el horario puede quedar por debajo de 4,5:1.

### Franja (velocidad y oferta)
- Familias: Superficie: bloques de color plano a sangre alternados (cian con tinta oscura / azul con blanco / blanco) + rayado 45° como textura y velocidad · Tipografía: Bold Extended aproximado con mayúsculas + letter-spacing; cifra display de la oferta del mes con condición pequeña y un solo rojo · Movimiento: reveal por view() de los adornos (nunca datos) + barra de progreso RAYADA + una marquesina de claims/categorías reubicada respecto a la rechazada · Foto: tira horizontal con snap (categorías, rincones, fachada primero) — la foto siempre pequeña dentro del bloque de color · Composición: bandas horizontales de color y plata como ritmo (cartel de campaña), sin diagonales cortando el hero · Navegación: selector de objetivo (4 botones) + chips de anclas; barra fija inferior
- Motivo de marca: Elemento 3 (rayado diagonal fino: «textura y velocidad, el rayado como barra de progreso/scroll, aire deportivo») con el chevron como bandas horizontales de color y plata.
- Para quién: Tienda a pie de calle con público joven, canal de WhatsApp/Instagram activo y oferta mensual real documentada por la central. El franquiciado que quiere «energía».
- Por qué es distinta: La única con color a sangre y con ritmo horizontal de franjas; la más «viva» en movimiento (progreso, reveal, marquesina). ES TAMBIÉN LA MÁS CERCANA A LA PLANTILLA RECHAZADA («Energía»: marquesina, paleta azul/rojo, titular 800): entra con prueba de muerte fijada como D2 — miniatura a 375px junto a la rechazada y, si a un metro se parecen, se retira y sus piezas (rayado, franja de oferta, selector de objetivo) se mudan a Panel o Diagonal. Depende del modelo de ofertas aún no construido (decisión bloqueante nº 3).

## Límites y honestidad

- Qué significa [V] aquí: en 7 de los 8 frentes WebFetch devolvió texto y estructura, NO píxeles — equivale al estado [LEÍDA] de notas-capturas.md, no a captura. Solo hay píxeles a 375px de: las 12 referencias de la gira del 27-ago (NOCCO, Gymshark, Barebells, Bulk, Crown, Momentous, TransparentLabs, AG1, Huel, MyProtein, Prozis, Alphalete), de las capturas del frente de premios (Kronborg, Lando, Scout, Dropbox Brand, Floema) y de las del frente de retail (Ghost, Basic-Fit club, Anytime Fitness club, Apple Puerta del Sol y los modales de Decathlon, Nike, H&B y Fitness Park). Antes de la puerta del dueño hay que capturar en el panel las 6–8 referencias que se adopten por plantilla.
- Sitios y fuentes bloqueados o caídos (no evaluados): Godly (403), Land-book (403), The FWA (500), páginas anuales/categorías de Awwwards y fichas de Scout/Lando en Awwwards (404/502), CodePen (403 en todos los pens: los pines de llamada y varios demos van como [P]), X/Twitter (sin acceso; hilo de Jhey reconstruido desde CSS-Tricks), Bluesky (API 403), Reddit (bloqueado incl. .json), Threads, freefrontend y bram.us (403), Webflow blog trends 2026 (error de cabeceras; sustituido por Mavlers [P]), Springer 2025 scrolljacking (muro institucional; solo resumen), Baymard (404; sustituido por Smashing 2016), tablas de compatibilidad de MDN (no renderizan), caniuse de text-wrap: pretty (sin tabla), adidas.es, decathlon.es vía WebFetch (403; leído en navegador), HSN (403), MASmusculo (bucle), Synergym (vacío), Equinox listado, GNC locator, Barry's, Metropolitan, Lululemon ES, Interbrand/Santander, Brand New (muro), bauhaus.futurelondonacademy.com (SSL). Van Gogh Museum, 100 Lost Species y Santioni solo devolvieron cáscara SPA.
- Estado de Firefox para scroll-driven animations es contradictorio entre frentes: caniuse lo lista en 158 (frentes 1, 4, 8) mientras MDN Experimental Features lo daba tras flag «Release: No» a sep-2026 (frente 3). Tratado como no soportado; con 1,19 % de cuota móvil en España no cambia la decisión, pero el fallback estático lo verán también iOS 17–18 (≈21 % de iPhones sin iOS 26 en jun-2026 según Apple vía MacRumors).
- Los caveats de Safari 26.0–26.4 (progreso erróneo de view() cerca del 0 %, sticky múltiple desplazado, filter+mix-blend-mode en WKWebView) vienen de notas de WebKit, un issue de Mastodon y un blog, no de pruebas propias. Nada se ha ejecutado en un iPhone real; Playwright no cubre WebKit iOS real. Las versiones de soporte del frente de retail se citaron de memoria (no de caniuse ese día).
- Patrones poco verificados: pines de llamada sobre foto (solo CodePen [P] + el brand book); Kümmerlein [P]; los DESIGN.md de Nike/Apple (awesome-design-md) son análisis generados por IA de webs públicas, no documentación oficial; el «rayado en divisores» de Optimum Nutrition es inferencia del volcado; el scrollytelling atribuido a Scout Motors por un agregador NO aparece en el marcado de su home; corner-shape lo devolvió MDN como no soportado en ningún navegador (reverificar); grainy/mesh gradients solo [P]; css-pattern.com y los repos de marquee (Azie88, triadwebteam) solo vistos en resultados de búsqueda.
- Cifras sin metodología publicada, citadas como señal y no como dato: Studio Meyer (+23 % scroll depth con bento, 18 % sesiones en oscuro, 82 % usuarios dark, -15/30 % FPS glass, 2.300 citas Copilot), B12/WriterDock (67 % de SaaS con bento), Fireart (47 % batería), Contentsquare (tasa de scroll ≈50 % viene del resumen del buscador; lo verificado es -2 % interanual). Ninguna cifra de conversión de barra fija inferior («25–40 % más llamadas») tiene fuente primaria: descartadas. La cobertura ≈92 % de scroll-driven en móvil España es cálculo propio (Statcounter + adopción Apple).
- Consenso social real leído es escaso: HN vía Algolia devuelve 0 historias para «web design trends» 2025–26 y 10 de baja puntuación para scroll-driven; Designer News cerrado; Dense Discovery sin listado; Sidebar.io activo pero centrado en IA. El «consenso» del catálogo procede de blogs de expertos, notas de WebKit/Chrome, State of CSS 2026 (4.902 respuestas) y la convergencia Figma/Muzli/Wix/Fireart/Envato, no de hilos virales.
- No se ha medido el peso real en KB de ninguna página externa (los «40+ imágenes» de Apple son conteo de referencias en el marcado). Los recuentos de estrellas de GitHub son los del 5-sep-2026 y aproximados. No se ha medido ninguna cifra de peso tipográfico propia (direcciones.md ya lo señala como el punto donde revienta el presupuesto con Grancasa a 22 KB del tope).
- Cinco decisiones del repo condicionan qué patrones se pueden pintar y no son de diseño: los siete campos nuevos de ficha (rotulo, desde, zonaInterior, gbp, movilVerificado, orientacion, canalWhatsapp), el rótulo ≤14 caracteres, el modelo de ofertas (no construido: ninguna plantilla pinta oferta), quién escribe el texto de marca y revisa alegaciones, y qué hacer con 0 reseñas en 5 de 8 tiendas. Las capas SECTION_IDS/resolveSections (capa 0) descartan en silencio secciones desconocidas.
- Supuesto que sostiene las cinco combinaciones y puede ser falso (heredado de direcciones.md): que el franquiciado decide porque las plantillas se ven distintas. Puede decidir por precio, por confianza en el operador o porque su web oficial es tan pobre que cualquier cosa gana. La única señal a favor es que el dueño rechazó dos veces con la palabra «clavada» — pero es el operador, no el franquiciado que paga. Si al verlas enteras se parecen por debajo de la paleta, la conclusión honesta será una plantilla muy buena y un muestrario sincero, no cinco.
