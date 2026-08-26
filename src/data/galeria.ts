/**
 * CÓMO SE COLOCA UNA GALERÍA
 *
 * El layout lo decide la FOTO, no la plantilla. Hasta ahora era al revés: un
 * grid fijo de 2 columnas con `aspect-ratio: 4/3` y `object-fit: cover`, daba
 * igual lo que hubiera dentro.
 *
 * QUÉ HACÍA ESO, MEDIDO
 *
 * Lagoh, cuyas tres fotos son verticales de 382×510:
 *
 *   celda en escritorio   442 × 332 px (4/3)
 *   foto                  382 × 510 px (3/4)
 *   → se recorta el 44% del alto de cada foto
 *   → y además se AMPLÍA una imagen de 382 px hasta 442
 *
 * Las dos cosas a la vez: se ve menos foto y peor. Y como eran 3 en un grid de
 * 2, la tercera quedaba huérfana.
 *
 * LA PRIMERA SOLUCIÓN ERA INSUFICIENTE, Y LO DIJERON LOS DATOS
 *
 * El primer intento fue elegir UNA forma de celda por tienda según la
 * orientación mayoritaria. Al medir las 52 imágenes reales resultó que **4 de
 * las 8 tiendas mezclan orientaciones**, y dos de ellas exactamente a la mitad:
 *
 *   villanueva   3 horizontales + 3 verticales
 *   marineda     3 horizontales + 3 verticales
 *   grancasa     2 horizontales + 4 verticales
 *   vigo         1 horizontal   + 3 verticales de ratio 0,56 (vertical de móvil)
 *
 * Con una sola forma de celda, la mitad de las fotos de esas tiendas se
 * recortan igual — solo cambia cuáles. No hay forma de celda buena para un
 * conjunto mezclado.
 *
 * LO QUE SE HACE
 *
 * Cada foto conserva SU proporción y el grid es multicolumna. Consecuencias:
 * no se recorta ninguna foto nunca, la mezcla deja de ser un problema, y los
 * números impares dejan de dejar huecos **estructuralmente** en vez de por
 * aritmética — en un flujo multicolumna no hay filas fijas donde falte algo.
 *
 * Lo único que queda por decidir es CUÁNTAS columnas, y eso sí depende de las
 * fotos: una vertical en una columna ancha sale enorme y se come la página.
 *
 * Este módulo es PURO: recibe las dimensiones ya medidas y devuelve el plan.
 * Medir ficheros es trabajo de `src/build/medir-imagenes.ts`, que corre en el
 * build. Así la decisión —que es donde están las reglas— se prueba sin tocar
 * el disco.
 */

export type Orientacion = 'horizontal' | 'vertical' | 'cuadrada';

export interface Foto {
  src: string;
  ancho: number;
  alto: number;
}

export interface FotoColocada extends Foto {
  /** Valor literal para `aspect-ratio`, con la proporción real de la foto. */
  proporcion: string;
  orientacion: Orientacion;
}

export interface PlanDeGaleria {
  columnas: number;
  /** La primera cruza todas las columnas. Es el plano general de la tienda. */
  destacarPrimera: boolean;
  /** Ancho máximo del grid en px. */
  anchoMaximo: number;
  fotos: FotoColocada[];
  /** Carencias que un humano tiene que resolver. No rompen el build. */
  avisos: string[];
}

/**
 * Margen para no llamar «vertical» a una foto que es horizontal por 3 px. Una
 * 4:3 tiene ratio 1,33 y una 3:4 tiene 0,75; el 5% no confunde ninguna de las
 * dos y absorbe los redondeos de las conversiones a WebP.
 */
const MARGEN_CUADRADA = 0.05;

export function orientacionDe(foto: Foto): Orientacion {
  const r = foto.ancho / foto.alto;
  if (Math.abs(r - 1) <= MARGEN_CUADRADA) return 'cuadrada';
  return r > 1 ? 'horizontal' : 'vertical';
}

const ANCHO_MAXIMO = 900;
const HUECO = 16;

export interface Opciones {
  /**
   * `galleryFeatured` de la tienda, o la variante `destacada` de la plantilla.
   * Decisión editorial ya tomada: se respeta.
   */
  destacadaForzada?: boolean;
}

/**
 * **Basta UNA vertical para pasar a 3 columnas**, no que sean mayoría.
 *
 * A 2 columnas la celda mide 442 px, así que una foto 3:4 sale de 589 px de
 * alto y una 9:16 —las de Vigo— de 786: se comen la pantalla y empujan el
 * resto de la página fuera de vista. A 3 columnas la misma foto mide 289 px de
 * ancho, que es tamaño de fotografía dentro de un texto.
 *
 * Que las horizontales salgan algo más pequeñas es un precio menor al lado de
 * eso, y de todas formas ninguna de las que hay hoy se amplía a 289 px: la más
 * pequeña del proyecto mide 382.
 */
export function columnasPara(fotos: Foto[]): number {
  if (fotos.length <= 2) return Math.max(1, fotos.length);
  return fotos.some((f) => orientacionDe(f) === 'vertical') ? 3 : 2;
}

export function planDeGaleria(fotos: Foto[], opciones: Opciones = {}): PlanDeGaleria {
  const columnas = columnasPara(fotos);
  const destacarPrimera = Boolean(opciones.destacadaForzada) && fotos.length > 1;

  const colocadas: FotoColocada[] = fotos.map((f) => ({
    ...f,
    proporcion: `${f.ancho} / ${f.alto}`,
    orientacion: orientacionDe(f),
  }));

  return {
    columnas,
    destacarPrimera,
    anchoMaximo: ANCHO_MAXIMO,
    fotos: colocadas,
    avisos: avisosDeCalidad(fotos, columnas, destacarPrimera),
  };
}

/**
 * Fotos que se van a ver AMPLIADAS. No rompen el build —son las que hay— pero
 * tienen que ser visibles: es lo único que separa «esta galería se ve regular»
 * de «hay que pedirle fotos mejores al franquiciado», y esa segunda frase no
 * se le ocurre a nadie mirando la pantalla.
 */
function avisosDeCalidad(fotos: Foto[], columnas: number, destacarPrimera: boolean): string[] {
  const anchoColumna = (ANCHO_MAXIMO - (columnas - 1) * HUECO) / columnas;
  const avisos: string[] = [];

  for (const [i, f] of fotos.entries()) {
    // La destacada cruza todas las columnas, así que se le exige el ancho entero.
    const necesario = destacarPrimera && i === 0 ? ANCHO_MAXIMO : anchoColumna;
    if (f.ancho < necesario) {
      avisos.push(
        `${f.src}: ${f.ancho}px de ancho para una columna de ${Math.round(necesario)}px — se verá ampliada ${(
          necesario / f.ancho
        ).toFixed(2)}x`
      );
    }
  }
  return avisos;
}
