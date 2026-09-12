/**
 * LA HOJA DE «RÓTULO» — lo que la convierte en otra web y no en otra pintura
 *
 * Viaja inline en el `<head>` SOLO en las páginas que declaran esta plantilla.
 * En `global.css` pesaría para las cincuenta tiendas que no la usan.
 *
 * Los tokens solos no pueden cambiar composición ni tipografía, y eso es
 * exactamente lo que el ojo usa para decidir si dos webs son distintas. Esta
 * hoja es la diferencia entre una plantilla y un cambio de color.
 *
 * LAS TRES COSAS QUE HACEN A RÓTULO
 *
 *  1. **El plano de color a sangre.** Desde el borde izquierdo al derecho, sin
 *     contenedor, y acabado en diagonal a 45°. Ninguna de las otras cuatro
 *     plantillas lleva color de borde a borde: es lo que se reconoce a un metro.
 *  2. **El tipo a escala de cartel.** El nombre de la tienda ocupa la pantalla.
 *     El tamaño lo calcula el servidor con la tabla de avances de la fuente
 *     (`rotulo.ts`), y por eso no hay `vw` ni salto de maquetación.
 *  3. **Cero movimiento.** Ni un efecto de scroll. Es la plantilla que no se
 *     mueve, a propósito: de cinco, una tiene que serlo.
 *
 * EL TEXTO DEL PLANO VA EN NEGRO, Y ES LO ÚNICO QUE CUMPLE
 *
 * Medido sobre el cian de marca (#00A7E1) el 12-09-2026:
 *
 *   negro       7,61  ✔ cumple para todo
 *   azul marca  2,55  ✖ ni siquiera para texto grande
 *   blanco      2,76  ✖
 *
 * La primera versión de esta hoja ponía el texto en el azul de marca y este
 * mismo comentario afirmaba que «ahí sí cumple». Era falso y no estaba medido:
 * cinco de los seis textos del cartel fallaban. Es la lección del manual de
 * marca otra vez — sus colores están pensados para rotular, no para texto.
 *
 * El negro además ya estaba en el plano: el logotipo va en negro dentro del
 * cian por diseño, así que el texto no añade un color, usa el que ya hay.
 *
 * QUÉ NO LLEVA, Y ES DECISIÓN
 *
 * Sin `animation-timeline`, sin marquesina, sin sombras, sin radios, sin iconos
 * de librería, sin degradados. Cada una de esas cinco es una marca de fábrica de
 * la web de 2010 que el dueño rechazó dos veces.
 */

export const CSS_ROTULO = `
/**
 * La fuente del rótulo vive AQUÍ y no en global.css: son 5.120 bytes que solo
 * necesita esta plantilla, y en global.css los parsearían las cincuenta tiendas
 * que no la usan.
 *
 * 'font-display: block' y no 'swap', que es lo contrario de lo habitual y
 * tiene motivo: el rótulo es un titular de 58 a 87 px cuyo tamaño lo calculó el
 * servidor con los avances de ESTA fuente. Con 'swap', la pila del sistema
 * pintaría el nombre a un ancho completamente distinto y luego saltaría — un
 * salto de maquetación en lo más grande de la pantalla. Con 5 KB y precarga, el
 * periodo de bloqueo no lo ve nadie.
 */
@font-face {
  font-family: 'ArchivoExpandedBlack';
  src: url('/fonts/archivo-expanded-black-rotulo.woff2') format('woff2');
  font-weight: 900;
  font-style: normal;
  font-stretch: expanded;
  font-display: block;
}

html[data-plantilla="rotulo"] {
  --plano: #00A7E1;
  /* El color del texto SOBRE el plano. Negro, no azul: ver la cabecera. */
  --sobre-plano: #111111;
}

/* ── El plano del cartel ─────────────────────────────────────────────────── */

html[data-plantilla="rotulo"] .hero--rotulo {
  padding: 0;
  background: none;
}

html[data-plantilla="rotulo"] .plano {
  background: var(--plano);
  /* A sangre: el plano no vive dentro del contenedor, llega a los dos bordes.
     Es lo único de la página que lo hace, y por eso se reconoce a un metro. */
  padding: 1.25rem 1rem 3.5rem;
  /* La diagonal con la que acaba. Con clip-path y no con un pseudo-elemento girado:
     un triángulo girado deja el fondo por debajo y se ve el borde. */
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 2.75rem), 0 100%);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: flex-start;
}

html[data-plantilla="rotulo"] .plano-logo {
  /* El logo DENTRO del color, en negro. Fuera del plano sería una cabecera más. */
  width: 124px;
  height: auto;
  filter: brightness(0);
}

/* ── El rótulo ───────────────────────────────────────────────────────────── */

html[data-plantilla="rotulo"] .plano-rotulo {
  margin: 0;
  display: flex;
  flex-direction: column;
  font-family: 'ArchivoExpandedBlack', var(--font-family);
  /* El tamaño lo pone el servidor por tienda. Aquí solo se usa. */
  font-size: var(--rotulo-px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  color: var(--sobre-plano);
  text-transform: uppercase;
  /* SE CORTA POR LA DERECHA A PROPÓSITO en las tiendas de nombre largo: un
     rótulo cortado se lee como rotulación de escaparate.

     'align-self: stretch' NO es decoración: el plano usa 'align-items:
     flex-start', así que sin esto el h1 se ensancha hasta el texto, el
     'overflow: hidden' no tiene nada que recortar y el rótulo empuja la PÁGINA
     ENTERA a lo ancho. Medido: cinco de las ocho tiendas se podían desplazar en
     horizontal y el cartel salía cortado también por la izquierda. */
  align-self: stretch;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
}

html[data-plantilla="rotulo"] .plano-palabra {
  display: block;
}

/* ── La línea de dato y las dos acciones ─────────────────────────────────── */

html[data-plantilla="rotulo"] .plano-dato {
  margin: 0;
  color: var(--sobre-plano);
  font-size: 0.95rem;
  line-height: 1.35;
  /* Light para el texto y Bold solo para el dato: el peso señala la hora, que
     es lo único que el visitante busca de verdad en esta línea. */
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

html[data-plantilla="rotulo"] .plano-dato b {
  font-weight: 700;
}

html[data-plantilla="rotulo"] .plano-sep {
  opacity: 0.55;
}

html[data-plantilla="rotulo"] .plano-acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.2rem;
}

html[data-plantilla="rotulo"] .plano-btn {
  padding: 0.7rem 1.3rem;
  border: 2px solid var(--sobre-plano);
  border-radius: 0;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1;
  /* :active con muelle. Es el único movimiento de la plantilla y solo responde
     al dedo: nada se mueve solo. */
  transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
}

html[data-plantilla="rotulo"] .plano-btn:active {
  transform: scale(0.96);
}

html[data-plantilla="rotulo"] .plano-btn--llena {
  background: var(--sobre-plano);
  color: #fff;
}

html[data-plantilla="rotulo"] .plano-btn--borde {
  background: transparent;
  color: var(--sobre-plano);
}

/* ── Nada se mueve solo ──────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  html[data-plantilla="rotulo"] .plano-btn {
    transition: none;
  }
}
`;
