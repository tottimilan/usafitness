/**
 * SRCSET Y SIZES
 *
 * Hoy cada dominio sirve la foto original a cualquier pantalla. En GranCasa eso
 * son **1770 KB de imágenes** para llenar columnas de 289 px.
 *
 * Medido sobre las 47 fotos del proyecto: servir 600 px en vez del original
 * baja GranCasa de 1770 KB a 542 KB, un **69% menos**, sin que se note en
 * pantalla — porque 600 px ya cubre una columna de 289 px en una pantalla del
 * doble de densidad.
 *
 * POR QUÉ NO HAY AVIF, QUE ES LO QUE SE SUELE PONER AQUÍ
 *
 * Se midió antes de decidir. AVIF gana sobre WebP:
 *
 *     400px   5,3%      600px   8,5%      900px  12,1%     1400px  17,3%
 *
 * Los anchos que de verdad se sirven son los dos primeros —móvil y columnas de
 * galería—, o sea un 5-8%. A cambio, codificar AVIF cuesta **3,2 veces más**
 * (29,3 s contra 9,1 s para todas las variantes) en **cada** build de Railway, y
 * obliga a un `<picture>` con dos `<source>` en vez de un `<img>`.
 *
 * No compensa. El original ya es WebP, así que la ganancia de formato es
 * pequeña; la ganancia grande es el TAMAÑO, y esa ya la da redimensionar.
 * Si algún día las fotos llegan en un formato peor, la cuenta cambia y esto
 * hay que volver a medirlo — no re-discutirlo de memoria.
 *
 * POR QUÉ SE PREGENERAN Y NO SE USA `astro:assets`
 *
 * Dos motivos, y el segundo es el que decide:
 *
 *  1. Las rutas salen de `stores.json`, o sea son dinámicas. Astro optimiza lo
 *     que puede analizar estáticamente, y esto no lo es.
 *  2. `astro:assets` en SSR añade el endpoint `/_image`, que **sí** pasa por
 *     el middleware — el aviso está escrito en `src/middleware.ts:37`. Sin
 *     meterlo en `RAIZ_COMPARTIDA` se reescribiría a `/<slug>/_image` y todas
 *     las imágenes darían 404 en los 8 dominios a la vez.
 *
 * Los ficheros pregenerados viven en `public/`, y el adaptador los sirve
 * **antes** de que el middleware llegue a ejecutarse. La trampa desaparece por
 * construcción en vez de por acordarse de una lista.
 */

/** Anchos que se generan. El original se añade aparte como el más grande. */
export const ANCHOS = [400, 600, 900] as const;

export interface Fuente {
  /** Ruta original, tal como aparece en `stores.json`. */
  src: string;
  ancho: number;
  alto: number;
}

/**
 * Ruta de una variante. Van bajo `/_img/` y NO junto al original: así el
 * directorio de fotos sigue conteniendo solo lo que subió un humano, y las
 * generadas se pueden borrar enteras sin mirar qué había dentro.
 */
export function rutaVariante(src: string, ancho: number): string {
  const punto = src.lastIndexOf('.');
  const sinExt = punto > 0 ? src.slice(0, punto) : src;
  return `/_img${sinExt}-${ancho}.webp`;
}

/** Anchos que tiene sentido generar para esta foto: nunca por encima del original. */
export function anchosDe(fuente: Fuente): number[] {
  return ANCHOS.filter((a) => a < fuente.ancho);
}

/**
 * `srcset` con las variantes más el original al final.
 *
 * El original se incluye con su ancho real y sin reprocesar: es la mejor copia
 * que existe, y volver a codificarla solo puede empeorarla.
 */
export function srcsetDe(fuente: Fuente): string {
  const partes = anchosDe(fuente).map((a) => `${rutaVariante(fuente.src, a)} ${a}w`);
  partes.push(`${fuente.src} ${fuente.ancho}w`);
  return partes.join(', ');
}

/**
 * `sizes` describe QUÉ ANCHO ocupará la foto, para que el navegador elija la
 * variante antes de haber maquetado nada.
 *
 * Tres tramos, que son los tres que tiene el CSS de la galería:
 *   · hasta 640px  → una columna, ancho completo
 *   · hasta 932px  → el grid aún no llega a su tope, así que manda el viewport
 *   · a partir de ahí → el grid está topado en 900px y la columna es fija
 *
 * 932 = 900 del grid + 32 del relleno del contenedor.
 */
export function sizesDe(columnas: number, cruzaTodo = false): string {
  if (cruzaTodo) return '(max-width: 932px) 100vw, 900px';
  const fija = Math.round((900 - (columnas - 1) * 16) / columnas);
  return `(max-width: 640px) 100vw, (max-width: 932px) calc(100vw / ${columnas}), ${fija}px`;
}

/**
 * `sizes` de una foto dentro de una fila justificada.
 *
 * Con el reparto por columnas, todas las fotos de la galería declaraban el
 * mismo ancho porque todas ocupaban una columna igual. En filas justificadas ya
 * no: en una fila con una apaisada y una vertical, la apaisada ocupa casi el
 * doble. `parte` es su fracción del ancho de la fila, y con ella el navegador
 * elige la variante que de verdad necesita en vez de una talla media.
 *
 * Por debajo de 640px la fila se apila y cada foto ocupa el ancho entero.
 */
export function sizesDeFoto(parte: number): string {
  const porcentaje = Math.round(parte * 100);
  const fijo = Math.round(parte * 900);
  return `(max-width: 640px) 100vw, (max-width: 932px) ${porcentaje}vw, ${fijo}px`;
}
