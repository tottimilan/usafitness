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
 * EL SEGUNDO INTENTO TAMBIÉN FALLÓ, Y ESO ESTUVO PUBLICADO
 *
 * Se pasó a flujo multicolumna con la proporción real de cada foto, y aquí
 * quedó escrito que así «los números impares dejan de dejar huecos
 * ESTRUCTURALMENTE, porque en un flujo multicolumna no hay filas fijas donde
 * falte algo». **Es falso.** El hueco no desaparece: se muda al fondo de la
 * columna más corta, donde encima parece un error de carga.
 *
 * Medido en producción el 2026-08-27, a 900 px de ancho:
 *
 *   villanueva   402 px de hueco   (2 + 2 + 1 fotos por columna)
 *   marineda     402 px
 *   grancasa     972 px            (3 + 1 + 1)  ← más alto que dos fotos
 *
 * Justo las tres tiendas que MEZCLAN orientaciones, que es el caso difícil que
 * este mismo fichero decía haber resuelto. El error no fue el mecanismo —no se
 * recorta ninguna foto, eso sí se cumplió— sino dar por bueno el resultado sin
 * mirarlo: se verificó la propiedad y no el aspecto.
 *
 * LO QUE SE HACE AHORA: FILAS JUSTIFICADAS
 *
 * Las fotos se reparten en filas, y cada fila se escala para llenar EXACTAMENTE
 * el ancho disponible. Es el reparto de las galerías de fotos de toda la vida, y
 * resuelve las tres cosas a la vez: no recorta —cada foto mantiene su
 * proporción—, no deja huecos —toda fila llena el ancho— y la mezcla de
 * orientaciones deja de importar, porque una fila puede llevar una apaisada y
 * una vertical y las dos salen con el MISMO alto.
 *
 * La aritmética que lo hace funcionar: en una fila de ancho útil A, si a cada
 * foto se le da un ancho proporcional a su ratio r, entonces
 *
 *     ancho_i = A · r_i / Σr        alto_i = ancho_i / r_i = A / Σr
 *
 * o sea que **todas las fotos de la fila salen a la misma altura**, sea cual
 * sea su forma. Y el CSS lo hace solo con `flex-grow: r` y `flex-basis: 0`, sin
 * una sola altura en píxeles y sin JavaScript: la fila sigue llenando el ancho
 * exacto a cualquier tamaño de pantalla.
 *
 * Lo único que hay que decidir aquí es DÓNDE se corta cada fila, y eso se elige
 * con la proporción real de cada foto para que ninguna fila salga ni aplastada
 * ni gigante.
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
  /** El mismo dato en número: es el `flex-grow` que reparte el ancho de la fila. */
  ratio: number;
  orientacion: Orientacion;
  /** Parte del ancho de la fila que ocupa, de 0 a 1. Sirve para el `sizes`. */
  parte: number;
}

export interface Fila {
  fotos: FotoColocada[];
  /**
   * Alto que tendrá la fila al ancho de referencia. No se emite como píxeles
   * —el CSS lo saca solo de las proporciones— pero se calcula aquí porque es lo
   * que decide dónde se corta cada fila, y porque sin él no hay nada que probar.
   */
  alto: number;
  /**
   * La fila llenaría el ancho a costa de salir más alta que el tope, así que se
   * queda en el tope y se centra. Pasa cuando quedan una o dos verticales
   * sueltas: estirarlas a 900 px las dejaría de 1200 px de alto.
   */
  centrada: boolean;
  /** El alto al que se queda si va centrada. Viaja al CSS: no siempre es el mismo. */
  tope: number;
}

export interface PlanDeGaleria {
  filas: Fila[];
  /** La primera cruza todo el ancho. Es el plano general de la tienda. */
  destacarPrimera: boolean;
  /** Ancho máximo del grid en px. */
  anchoMaximo: number;
  /** Todas las fotos en orden, para lo que necesite recorrerlas planas. */
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

/**
 * El alto al que se aspira para cada fila, y el que no se pasa.
 *
 * El objetivo sale de lo que ya se veía bien: las tiendas con fotos de una sola
 * orientación daban filas de ~332 px y nadie se quejó de ellas. El tope existe
 * por el caso contrario: dos verticales solas estiradas a 900 px de ancho salen
 * de 590 px de alto, y tres a una sola, de 1.200. Antes que eso, la fila se
 * queda en el tope y se centra — un margen simétrico se lee como decisión; un
 * hueco a un lado, como un fallo.
 */
const ALTO_OBJETIVO = 340;
const ALTO_MAXIMO = 520;

/**
 * La destacada tiene su propio tope, y más alto.
 *
 * El de 520 está pensado para que dos verticales sueltas no ocupen la pantalla.
 * Aplicárselo a la destacada la dejaba en 693 px de ancho centrados en 900, o
 * sea con margen a los lados: exactamente lo contrario de «plano general de la
 * tienda», que es para lo que existe. Una 4:3 a 900 de ancho mide 675 de alto y
 * eso es lo que se quiere; el tope sigue existiendo para que una foto casi
 * cuadrada no se vaya a 850.
 */
const ALTO_MAXIMO_DESTACADA = 680;

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

/** Alto de una fila que llena `ancho` con estas proporciones. Ver la cabecera. */
export function altoDeFila(ratios: number[], ancho = ANCHO_MAXIMO, hueco = HUECO): number {
  const suma = ratios.reduce((a, r) => a + r, 0);
  if (suma <= 0) return 0;
  return (ancho - (ratios.length - 1) * hueco) / suma;
}

/**
 * Dónde se corta cada fila.
 *
 * Se prueban TODOS los repartos posibles y se elige el que menos se aleja del
 * alto objetivo, con las filas que se pasarían del tope penalizadas fuerte.
 * Es programación dinámica sobre el número de fotos ya colocadas: con menos de
 * una docena de fotos por tienda, es instantáneo y —lo que importa— **es
 * determinista**. La versión anterior dejaba el reparto en manos del algoritmo
 * de equilibrado del navegador, que es justo lo que produjo los huecos.
 *
 * El coste es cuadrático a propósito: dos filas regulares valen más que una
 * perfecta y otra horrible, que era exactamente el defecto a evitar.
 */
export function repartirEnFilas(
  ratios: number[],
  ancho = ANCHO_MAXIMO,
  hueco = HUECO,
  objetivo = ALTO_OBJETIVO,
  maximo = ALTO_MAXIMO
): number[][] {
  const n = ratios.length;
  if (n === 0) return [];

  const PENALIZACION = 1e7;
  const coste = (h: number) => (h - objetivo) ** 2 + (h > maximo ? PENALIZACION : 0);

  // mejor[i] = coste mínimo de colocar las primeras i fotos en filas completas.
  const mejor = new Array<number>(n + 1).fill(Infinity);
  const corte = new Array<number>(n + 1).fill(0);
  mejor[0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (mejor[j] === Infinity) continue;
      const total = mejor[j] + coste(altoDeFila(ratios.slice(j, i), ancho, hueco));
      if (total < mejor[i]) {
        mejor[i] = total;
        corte[i] = j;
      }
    }
  }

  const filas: number[][] = [];
  for (let i = n; i > 0; i = corte[i]) {
    filas.unshift(Array.from({ length: i - corte[i] }, (_, k) => corte[i] + k));
  }
  return filas;
}

export function planDeGaleria(fotos: Foto[], opciones: Opciones = {}): PlanDeGaleria {
  // El flag es una preferencia; la orientación es física. Una 9:16 destacada a
  // 900px de ancho mediría 1600px de alto — más alta que la pantalla. Caso
  // real: vigo, cuya primera foto pasa a ser vertical al filtrar el duplicado
  // del hero.
  const destacarPrimera =
    Boolean(opciones.destacadaForzada) && fotos.length > 1 && orientacionDe(fotos[0]) === 'horizontal';

  const ratios = fotos.map((f) => f.ancho / f.alto);

  // La destacada es simplemente una fila de una sola foto: el resto se reparte
  // aparte. Así no hay dos mecanismos de maquetación conviviendo, que es de
  // donde salió el `column-span` que había que apagar a mano en móvil.
  const grupos = destacarPrimera
    ? [[0], ...repartirEnFilas(ratios.slice(1)).map((f) => f.map((i) => i + 1))]
    : repartirEnFilas(ratios);

  const colocadas: FotoColocada[][] = grupos.map((indices) => {
    const suma = indices.reduce((a, i) => a + ratios[i], 0);
    return indices.map((i) => ({
      ...fotos[i],
      proporcion: `${fotos[i].ancho} / ${fotos[i].alto}`,
      ratio: ratios[i],
      orientacion: orientacionDe(fotos[i]),
      parte: ratios[i] / suma,
    }));
  });

  const filas: Fila[] = colocadas.map((f, i) => {
    const alto = altoDeFila(f.map((x) => x.ratio));
    const tope = destacarPrimera && i === 0 ? ALTO_MAXIMO_DESTACADA : ALTO_MAXIMO;
    return { fotos: f, alto, centrada: alto > tope, tope };
  });

  return {
    filas,
    destacarPrimera,
    anchoMaximo: ANCHO_MAXIMO,
    fotos: filas.flatMap((f) => f.fotos),
    avisos: avisosDeCalidad(filas),
  };
}

/**
 * Fotos que se van a ver AMPLIADAS. No rompen el build —son las que hay— pero
 * tienen que ser visibles: es lo único que separa «esta galería se ve regular»
 * de «hay que pedirle fotos mejores al franquiciado», y esa segunda frase no
 * se le ocurre a nadie mirando la pantalla.
 */
function avisosDeCalidad(filas: Fila[]): string[] {
  const avisos: string[] = [];

  for (const fila of filas) {
    // Cada foto se ve exactamente al ancho que le toca en SU fila, que ahora se
    // conoce con precisión. Antes se comparaba contra un ancho de columna
    // teórico igual para todas, que en las filas mixtas no era el de ninguna.
    const alto = Math.min(fila.alto, fila.tope);
    for (const f of fila.fotos) {
      const necesario = alto * f.ratio;
      if (f.ancho < necesario) {
        avisos.push(
          `${f.src}: ${f.ancho}px de ancho para un hueco de ${Math.round(necesario)}px — se verá ampliada ${(
            necesario / f.ancho
          ).toFixed(2)}x`
        );
      }
    }
  }
  return avisos;
}
