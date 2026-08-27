/**
 * EL PRESUPUESTO DE PESO, DICHO ENTERO
 *
 * El build ya tenía un tope de 900 KB por página en móvil, pero medía SOLO
 * imágenes: el mensaje de error decía «presupuesto de imagen» y era honesto
 * con lo que hacía, no con lo que la cifra prometía. Fuentes y CSS se bajan
 * siempre, en la carga inicial, y no contaban.
 *
 * Medido el 2026-08-27, con el peso completo (imágenes con scroll hasta el
 * final + fuentes + CSS comprimido):
 *
 *     grancasa  932 KB   ← se pasa por 32 KB
 *     villanueva 736 · arcangel 692 · marineda 642 · lasrosas 640
 *     alcobendas 544 · vigo 469 · lagoh 213
 *
 * Es decir: la peor página ya estaba por encima del tope estando en verde, y
 * cualquier plantilla nueva con tipografía propia aterriza justo encima.
 *
 * POR QUÉ HAY DOS NÚMEROS Y NO UNO
 *
 * Las fotos son dato del franquiciado: recortarlas o recomprimirlas se ve en
 * pantalla y lo decide una persona, igual que los demás avisos que dependen de
 * datos ajenos (ver `avisosDeDatos`). Romper el build por ellas convertiría
 * una decisión del dueño en un bloqueo del equipo.
 *
 * Las fuentes y el CSS de una plantilla los escribimos NOSOTROS. Ahí sí cabe
 * un tope duro, y es justo el que hace falta ahora: la fase de diseño va a
 * elegir tipografías, y sin este trinquete «pesa poco» sería una opinión.
 *
 *     clásica  47 KB (Inter) +  7 KB de CSS  =  54 KB
 *     energía  47 + 22 + 22   + ~9 KB        = 100 KB
 *
 * El tope de 120 KB deja sitio a una familia más o a una display con dos pesos,
 * y no a cinco ficheros. Si una dirección lo necesita, se sube A PROPÓSITO y se
 * escribe por qué, que es lo contrario de descubrirlo en producción.
 */

/** Lo que puede pesar la parte de la página que escribimos nosotros. */
export const TOPE_PLANTILLA = 120 * 1024;

/** El tope de la página entera. No rompe el build: avisa. Ver cabecera. */
export const PRESUPUESTO_PAGINA = 900 * 1024;

/** La fuente base del sitio, declarada en `global.css` y precargada en Base. */
export const FUENTE_BASE = '/fonts/inter-latin.woff2';

export interface PlantillaConPeso {
  id: string;
  fonts?: string[];
  css?: string;
  /**
   * `false` solo si la plantilla NO usa la familia base para nada. Hoy ninguna:
   * `energia` trae Barlow para los rótulos pero el cuerpo sigue en Inter, así
   * que quitarle la precarga la haría más lenta, no más ligera. El campo existe
   * para las direcciones de la generación 2, que sí traen su propia cara de
   * texto — y para que ese ahorro sea una declaración explícita y no un efecto
   * secundario de haber declarado `fonts`.
   */
  usaFuenteBase?: boolean;
}

/** Los ficheros de fuente que esa plantilla hace descargar de verdad. */
export function fuentesDeLaPagina(t: PlantillaConPeso): string[] {
  const propias = t.fonts ?? [];
  return t.usaFuenteBase === false ? propias : [FUENTE_BASE, ...propias];
}

export interface PesoDePlantilla {
  fuentes: number;
  css: number;
  total: number;
  exceso: number;
  ficheros: string[];
}

/**
 * Peso de lo nuestro: fuentes (ya comprimidas, woff2) más CSS comprimido.
 *
 * Las dos funciones de lectura se inyectan porque este módulo lo importan tres
 * cargadores distintos —Vite en SSR, Node pelado en los tests y Node dentro de
 * `astro:config:setup`— y solo uno de ellos puede tocar el disco. Un `import`
 * de `node:fs` aquí arriba rompería los otros dos.
 */
export function pesoDePlantilla(
  t: PlantillaConPeso,
  tamañoDe: (ruta: string) => number,
  comprimido: (texto: string) => number,
  cssDeLaPlantilla: string,
  cssGlobal: string
): PesoDePlantilla {
  const ficheros = fuentesDeLaPagina(t);
  const fuentes = ficheros.reduce((n, f) => n + tamañoDe(f), 0);
  const css = comprimido(cssGlobal + cssDeLaPlantilla);
  const total = fuentes + css;
  return { fuentes, css, total, exceso: Math.max(0, total - TOPE_PLANTILLA), ficheros };
}
