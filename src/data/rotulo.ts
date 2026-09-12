/**
 * EL RÓTULO A ESCALA DE CARTEL — el tamaño de letra de cada tienda, en el servidor
 *
 * La tesis de la plantilla «Rótulo» es que **el tipo ES la imagen**: lo primero
 * que se ve no es una foto, es el nombre del sitio ocupando la pantalla. Eso
 * solo funciona si el nombre llena el ancho, y el nombre cambia por tienda:
 * «LAGOH» son cinco letras y «EL ARCÁNGEL» son once.
 *
 * POR QUÉ EL TAMAÑO SE CALCULA AQUÍ Y NO CON `vw` NI EN EL NAVEGADOR
 *
 *  · Un `font-size: 18vw` a ojo deja «LAGOH» pequeño y «ALCOBENDAS» reventado,
 *    y no hay un solo número que sirva para las ocho.
 *  · Medirlo en el cliente exige JavaScript y produce un salto de maquetación
 *    en cuanto la fuente termina de cargar, justo encima del titular. Es el peor
 *    sitio de la página para que algo se mueva.
 *
 * Con la tabla de avances de la fuente que se sirve —`avances-rotulo.json`,
 * generada por `scripts/avances-rotulo.py` desde el propio woff2— el servidor
 * sabe cuánto medirá el texto antes de mandarlo.
 *
 * UNA PALABRA POR LÍNEA, Y MANDA LA MÁS ANCHA
 *
 * El cartel apila las palabras: «LAS / ROSAS», «EL / ARCÁNGEL». Así que el ancho
 * del bloque no es el de la cadena entera sino el de su palabra más larga, y es
 * ese el que decide el tamaño. Medir la cadena completa daba 440 px para «LAS
 * ROSAS» cuando de verdad mide 271: el error que este comentario existe para que
 * no se repita.
 *
 * EL SUELO, Y POR QUÉ ALGUNAS SE CORTAN A PROPÓSITO
 *
 * Por debajo de `SUELO_PX` el rótulo deja de leerse como cartel y pasa a ser un
 * titular más. Así que cuando ni al suelo cabe, **no se encoge: se corta por el
 * borde derecho**. Es una decisión del diseño, no un desbordamiento: un rótulo
 * cortado se lee como rotulación de escaparate. Lo que hay que mirar en la
 * captura es cuánto se corta — el diseño acepta entre 1,5 y 3 caracteres, y
 * `corteEnCaracteres` lo dice para poder comprobarlo sin regla.
 */

import avancesJson from './fuentes/avances-rotulo.json' with { type: 'json' };

/** Por debajo de esto deja de ser un cartel. */
export const SUELO_PX = 58;

/** Tope por arriba: un rótulo de tres letras no puede comerse la pantalla. */
export const TECHO_PX = 132;

type Avances = Record<string, number>;
const AVANCES: Avances = avancesJson.avances;

/**
 * Las palabras del rótulo, una por línea.
 *
 * El esquema admite `|` como salto explícito —para los rótulos donde el operador
 * quiere partir por otro sitio que el espacio— y el espacio como salto natural.
 */
export function palabrasDeRotulo(rotulo: string): string[] {
  return rotulo
    .split(/[|\s]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** El ancho de un texto en em, según la fuente que se sirve. */
export function anchoEm(texto: string, avances: Avances = AVANCES): number {
  let total = 0;
  for (const c of texto) {
    const a = avances[c];
    // Un carácter que la fuente no trae no se puede medir. El esquema de
    // `stores.json` ya rechaza los rótulos con letras fuera del subset, así que
    // llegar aquí significa que alguien ha tocado una de las dos cosas sin la
    // otra: mejor que reviente el build que publicar un rótulo mal medido.
    if (a === undefined) throw new Error(`«${c}» no está en la tabla de avances del rótulo`);
    total += a;
  }
  return total;
}

export interface RotuloMedido {
  /** Las líneas, ya partidas. */
  palabras: string[];
  /** El tamaño de letra en px. */
  px: number;
  /** Cuántos caracteres se salen por la derecha. 0 si cabe entero. */
  corteEnCaracteres: number;
  /** El ancho que ocupará la palabra más ancha, en px. Para poder comprobarlo. */
  anchoPx: number;
}

/**
 * El tamaño de letra de este rótulo en este ancho.
 *
 * `ahora` no hace falta: esto no depende del reloj. `ancho` es el espacio útil
 * en px, ya descontado el margen del plano.
 */
export function medirRotulo(rotulo: string, ancho: number, avances: Avances = AVANCES): RotuloMedido {
  const palabras = palabrasDeRotulo(rotulo);
  const anchos = palabras.map((p) => anchoEm(p, avances));
  const mayor = Math.max(...anchos, 0);
  if (!mayor) return { palabras, px: SUELO_PX, corteEnCaracteres: 0, anchoPx: 0 };

  // Llenar el ancho, con suelo y techo. El suelo es lo que provoca el corte.
  const px = Math.min(TECHO_PX, Math.max(SUELO_PX, Math.floor(ancho / mayor)));
  const anchoPx = Math.round(mayor * px);
  const sobra = anchoPx - ancho;
  // El corte se expresa en caracteres —no en píxeles— porque es lo que se juzga
  // mirando la captura: «se come dos letras y media» se comprueba a ojo.
  const anchoMedioCaracter = (mayor / [...palabras.reduce((a, b) => (anchoEm(a, avances) >= anchoEm(b, avances) ? a : b))].length) * px;
  return {
    palabras,
    px,
    corteEnCaracteres: sobra > 0 ? Math.round((sobra / anchoMedioCaracter) * 10) / 10 : 0,
    anchoPx,
  };
}
