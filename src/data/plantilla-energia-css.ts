/**
 * HOJA DE LA PLANTILLA «ENERGÍA»
 *
 * La web como cartel de sala de entrenamiento: la ciudad en condensada
 * gigante, ofertas desfilando en una banda roja, el horario como marcador.
 * Es la plantilla que NO depende de que las fotos del franquiciado sean
 * buenas — la tipografía y el movimiento hacen el trabajo.
 *
 * POR QUÉ ES UN `.ts` QUE EXPORTA UN STRING Y NO UN `.css` CON `?raw`
 *
 * `?raw` es de Vite, y este módulo lo cargan TRES cargadores: Vite (bundle
 * SSR), Node pelado (`node --test`) y Node en `astro:config:setup`. La misma
 * restricción de los tres cargadores que decidió el diseño de 3.10. Un string
 * exportado funciona en los tres.
 *
 * POR QUÉ VIAJA INLINE EN EL <head> Y NO EN `global.css`
 *
 * `global.css` lo descargan las 50 tiendas. Esta hoja solo pesa para quien
 * usa la plantilla: se concatena a `plantillaCss` en la página y solo se
 * inyecta bajo `html[data-plantilla="energia"]`. TODO selector va prefijado:
 * una regla sin prefijo aquí sería un fuga hacia las demás plantillas.
 *
 * REGLAS DE LA CASA QUE ESTA HOJA RESPETA (todas bajo test):
 *  - Las animaciones viven dentro de `prefers-reduced-motion: no-preference`:
 *    sin preferencia declarada no hay nada que "apagar", el estado quieto es
 *    el de partida.
 *  - Nada de contenido oculto esperando JavaScript: los revelados van en
 *    `@supports (animation-timeline: view())` y parten de visible.
 *  - La galería conserva `--proporcion` por foto: la tira cambia el CONTENEDOR
 *    (flex + snap), jamás recorta una foto.
 *  - La paleta es LA MARCA: azul 0055B8, rojo E1251B, cian 00A7E1 solo
 *    decorativo. Lo único nuevo es la superficie «azul noche» 071B33, de la
 *    misma familia que el scrim ya sancionado del hero.
 */

export const CSS_ENERGIA = `
@font-face {
  font-family: 'Barlow Condensed';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/barlow-condensed-700-latin.woff2') format('woff2');
}
@font-face {
  font-family: 'Barlow Condensed';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('/fonts/barlow-condensed-800-latin.woff2') format('woff2');
}

html[data-plantilla="energia"] {
  --e-azul: var(--color-primary, #0055B8);
  --e-rojo: #E1251B;
  --e-cian: #00A7E1;
  --e-noche: #071B33;
  --e-display: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif;
}

/* ── Tipografía rotulista ──────────────────────────────────────────────── */
html[data-plantilla="energia"] h1,
html[data-plantilla="energia"] h2,
html[data-plantilla="energia"] .section-title {
  font-family: var(--e-display);
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.92;
}
html[data-plantilla="energia"] .section-title {
  font-size: clamp(2.2rem, 1.2rem + 4vw, 3.6rem);
}

/* ── Marquesinas (cinta, promos, marcas) ───────────────────────────────── */
html[data-plantilla="energia"] .fx-marquesina {
  overflow: hidden;
  display: flex;
}
html[data-plantilla="energia"] .fx-marquesina__track {
  display: flex;
  flex: none;
  gap: 2.5rem;
  padding-right: 2.5rem;
  align-items: center;
  white-space: nowrap;
}
@media (prefers-reduced-motion: no-preference) {
  html[data-plantilla="energia"] .fx-marquesina__track {
    animation: e-desfile var(--e-marquesina-s, 30s) linear infinite;
  }
  html[data-plantilla="energia"].marquesinas-pausadas .fx-marquesina__track {
    animation-play-state: paused;
  }
}
@keyframes e-desfile {
  to { transform: translateX(-100%); }
}

/* ── Cinta de claims sobre el header ───────────────────────────────────── */
html[data-plantilla="energia"] .cinta-marca {
  background: var(--e-noche);
  color: #fff;
  font-family: var(--e-display);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  --e-marquesina-s: 26s;
}
html[data-plantilla="energia"] .cinta-marca__pausa {
  flex: none;
  background: none;
  border: 0;
  color: #fff;
  padding: 0.35rem 0.75rem;
  min-width: 24px;
  min-height: 24px;
  cursor: pointer;
  font: inherit;
}
html[data-plantilla="energia"] .cinta-marca__sep { color: var(--e-cian); }

/* ── Hero cartel ───────────────────────────────────────────────────────── */
html[data-plantilla="energia"] .hero--cartel {
  min-height: 0;
  display: block;
  text-align: left;
  background: var(--e-azul);
  color: #fff;
  padding: clamp(2.5rem, 6vw, 5rem) 1.5rem 0;
  overflow: hidden;
}
html[data-plantilla="energia"] .cartel {
  max-width: var(--max-width, 1080px);
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
}
html[data-plantilla="energia"] .cartel-eyebrow {
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: var(--e-cian);
}
html[data-plantilla="energia"] .cartel h1 {
  display: grid;
  margin: 0;
}
html[data-plantilla="energia"] .cartel-ciudad {
  font-size: clamp(3.4rem, 11vw, 9rem);
  font-weight: 800;
  color: #fff;
}
html[data-plantilla="energia"] .cartel-nombre {
  font-size: clamp(1.6rem, 4.5vw, 3.2rem);
  font-weight: 700;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.85);
}
@supports not (-webkit-text-stroke: 1px #fff) {
  html[data-plantilla="energia"] .cartel-nombre { color: rgba(255, 255, 255, 0.75); }
}
html[data-plantilla="energia"] .cartel-texto {
  max-width: 56ch;
  color: rgba(255, 255, 255, 0.88);
}
html[data-plantilla="energia"] .cartel-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
html[data-plantilla="energia"] .cartel-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.7rem 1.6rem;
  font-family: var(--e-display);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
}
html[data-plantilla="energia"] .cartel-cta--llena {
  background: #fff;
  color: var(--e-azul);
}
html[data-plantilla="energia"] .cartel-cta--borde {
  border: 2px solid rgba(255, 255, 255, 0.85);
  color: #fff;
}
html[data-plantilla="energia"] .cartel-foto {
  margin: 1.5rem calc(50% - 50vw) 0;
  position: relative;
}
html[data-plantilla="energia"] .cartel-foto img {
  width: 100%;
  height: clamp(220px, 38vw, 420px);
  object-fit: cover;
  display: block;
}
@supports (mix-blend-mode: multiply) {
  html[data-plantilla="energia"] .cartel-foto::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--e-azul);
    mix-blend-mode: multiply;
    opacity: 0.28;
    pointer-events: none;
  }
}

/* ── Promociones: banda roja en marcha ─────────────────────────────────── */
html[data-plantilla="energia"] .promos-marquesina {
  background: var(--e-rojo);
  color: #fff;
  padding: 1.6rem 0;
  --e-marquesina-s: 22s;
  clip-path: polygon(0 var(--e-corte, 2.2rem), 100% 0, 100% 100%, 0 100%);
  margin-top: calc(var(--e-corte, 2.2rem) * -1);
  position: relative;
  z-index: 1;
}
html[data-plantilla="energia"] .promo-item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.7rem;
}
html[data-plantilla="energia"] .promo-item strong {
  font-family: var(--e-display);
  font-weight: 800;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1;
}
html[data-plantilla="energia"] .promo-item span {
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  max-width: 22ch;
  white-space: normal;
  line-height: 1.15;
}
html[data-plantilla="energia"] .promos-aviso {
  text-align: center;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 1rem 1.5rem 0;
}

/* ── Galería: tira-escaparate con snap ─────────────────────────────────── */
html[data-plantilla="energia"] .gallery { background: #fff; }
html[data-plantilla="energia"] .gallery-grid {
  columns: auto;
  column-gap: 0;
  display: flex;
  /* La galería base apila sus filas en columna. Esta plantilla las pone en UNA
     línea que se desliza, así que tiene que decir la dirección: sin esto los
     hijos se estiraban al ancho del contenedor y la tira dejaba de existir. */
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  max-width: none;
  padding: 0.25rem 1.5rem 1rem;
  -webkit-overflow-scrolling: touch;
}
html[data-plantilla="energia"] .gallery-item {
  flex: none;
  height: clamp(240px, 40vw, 360px);
  width: auto;
  aspect-ratio: var(--proporcion, 4 / 3);
  scroll-snap-align: center;
  margin: 0;
  break-inside: auto;
}
/* La galería base reparte las fotos en filas justificadas; aquí la tira es UNA
   sola línea que se desliza, así que las filas se disuelven y sus fotos pasan a
   ser hijas directas de la tira. Eso es lo que hace display:contents, y evita
   duplicar el marcado solo para esta plantilla. */
html[data-plantilla="energia"] .gallery-fila { display: contents; }

/* Y hay que devolverle a la foto su tamaño de tira. Disolver la fila no anula
   la regla base que reparte el ancho por proporciones —el selector sigue
   casando— y esa regla lleva la clase de ámbito de Astro, así que gana por
   especificidad: la foto salía de 1.104px de ancho y 0 de alto, o sea la tira
   entera rota. Se recupera nombrando también el contenedor, que sube esta regla
   por encima. Medido, no supuesto. */
html[data-plantilla="energia"] .gallery-grid .gallery-fila > .gallery-item,
html[data-plantilla="energia"] .gallery-grid .gallery-fila--centrada > .gallery-item {
  flex: 0 0 auto;
  height: clamp(240px, 40vw, 360px);
  width: auto;
}

/* ── Productos: la pizarra ─────────────────────────────────────────────── */
html[data-plantilla="energia"] .pizarra {
  background: var(--e-noche);
  color: #fff;
  padding: var(--section-padding, 4rem 1.5rem);
}
html[data-plantilla="energia"] .pizarra .section-title { color: #fff; }
html[data-plantilla="energia"] .pizarra-lista {
  list-style: none;
  margin: 2rem auto 0;
  padding: 0;
  max-width: var(--max-width, 1080px);
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 1.1rem;
  row-gap: 0.6rem;
}
html[data-plantilla="energia"] .pizarra-lista li {
  font-family: var(--e-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3.4vw, 2.6rem);
  text-transform: uppercase;
  line-height: 1;
}
html[data-plantilla="energia"] .pizarra-lista li::after {
  content: '·';
  color: var(--e-cian);
  margin-left: 1.1rem;
}
html[data-plantilla="energia"] .pizarra-lista li:last-child::after { content: ''; }

/* ── Marcas: marquesina sobre blanco ───────────────────────────────────── */
html[data-plantilla="energia"] .brands { background: #fff; --e-marquesina-s: 34s; }
html[data-plantilla="energia"] .brands .fx-marquesina { margin-top: 1.8rem; }
html[data-plantilla="energia"] .brand-item img {
  height: 46px;
  width: auto;
  object-fit: contain;
  filter: grayscale(1);
  opacity: 0.75;
}

/* ── Reseñas: bajar el pulso ───────────────────────────────────────────── */
html[data-plantilla="energia"] .reviews { background: var(--color-bg-alt, #f4f6f8); }
html[data-plantilla="energia"] .review-text {
  font-family: var(--e-display);
  font-style: normal;
  font-weight: 700;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  line-height: 1.25;
  text-transform: none;
}

/* ── Horario: el marcador ──────────────────────────────────────────────── */
html[data-plantilla="energia"] .schedule {
  background: var(--e-azul);
  color: #fff;
}
html[data-plantilla="energia"] .schedule .section-title,
html[data-plantilla="energia"] .schedule p { color: #fff; }
html[data-plantilla="energia"] .schedule-card {
  background: transparent;
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
html[data-plantilla="energia"] .schedule-card h3,
html[data-plantilla="energia"] .schedule-card .card-title {
  color: #fff;
}
html[data-plantilla="energia"] .schedule-line {
  font-family: var(--e-display);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-size: clamp(1.8rem, 5vw, 3.4rem);
  line-height: 1.1;
}

/* ── Social: franja fina, no una parada ────────────────────────────────── */
html[data-plantilla="energia"] .social { padding: 1.6rem 1.5rem; background: #fff; }
html[data-plantilla="energia"] .social .section-title {
  font-size: 1rem;
  letter-spacing: 0.18em;
}

/* ── Footer: cierre en azul noche con corte diagonal ───────────────────── */
html[data-plantilla="energia"] .footer {
  background: var(--e-noche);
  clip-path: polygon(0 2rem, 100% 0, 100% 100%, 0 100%);
  padding-top: 4rem;
}

/* ── Barra de contacto fija en móvil ───────────────────────────────────── */
html[data-plantilla="energia"]:has(#uf-cookie-banner:not([hidden])) .barra-contacto {
  display: none !important;
}
html[data-plantilla="energia"] .barra-contacto {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 60;
  display: none;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  background: var(--e-noche);
  padding: 0.5rem 0.6rem calc(0.5rem + env(safe-area-inset-bottom));
  gap: 0.5rem;
}
html[data-plantilla="energia"] .barra-contacto a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 48px;
  color: #fff;
  text-decoration: none;
  font-family: var(--e-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
html[data-plantilla="energia"] .barra-contacto a.es-whatsapp {
  background: #fff;
  color: var(--e-noche);
  border-color: #fff;
}
@media (max-width: 767px) {
  html[data-plantilla="energia"] .barra-contacto { display: grid; }
  html[data-plantilla="energia"] a.whatsapp-float { display: none; }
  html[data-plantilla="energia"] body { padding-bottom: 64px; }
}

/* ── Revelados ligados al scroll: solo donde el motor sabe hacerlo ─────── */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    html[data-plantilla="energia"] .section .container {
      animation: e-sube linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 42%;
    }
  }
}
@keyframes e-sube {
  from { opacity: 0.35; transform: translateY(22px); }
  to { opacity: 1; transform: none; }
}
`;
