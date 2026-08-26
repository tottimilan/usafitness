/**
 * LA GALERÍA DE UNA TIENDA CONCRETA
 *
 * Une las dos mitades: `galeria.ts` sabe DECIDIR un layout a partir de unas
 * dimensiones, y `dimensiones.json` sabe cuánto mide cada fichero. Aquí se
 * juntan para responder «¿cómo se coloca la galería de Vigo?».
 *
 * Vive aparte de `galeria.ts` a propósito: aquel es puro y no conoce ni
 * `stores.json` ni el fichero generado, así que se puede probar con casos
 * inventados. Este sí toca los datos reales, y por eso es tan fino.
 */

import dimensiones from './dimensiones.json' with { type: 'json' };
import { planDeGaleria, type Foto, type PlanDeGaleria } from './galeria.ts';
import type { Tienda } from './stores.ts';

const MAPA = dimensiones as Record<string, { ancho: number; alto: number; huella: string }>;

/**
 * Una foto sin medir NO se descarta: se le da la proporción 4:3, que es la de
 * casi todo el proyecto. Un hueco aquí solo puede venir de un formato que el
 * medidor no sepa leer —el verificador de assets ya rompe el build si el
 * fichero falta—, y en ese caso desaparecer la foto de la web de un cliente
 * sería una reacción muy desproporcionada a no saber leer una cabecera.
 */
const POR_DEFECTO = { ancho: 1400, alto: 1050 };

export function fotosDe(tienda: Tienda): Foto[] {
  const hero = MAPA[tienda.heroImage];

  return tienda.galleryImages.map((src) => {
    const m = MAPA[src] ?? POR_DEFECTO;

    // Si esta foto de galería es EL MISMO FICHERO que el hero —pasa en 7 de las
    // 8 tiendas: `hero.webp` y `tienda-1.webp` son idénticos byte a byte— se
    // apunta a la URL del hero.
    //
    // La página se ve exactamente igual: es la misma imagen. Lo que cambia es
    // que el navegador deja de descargarla DOS VECES por tener dos nombres.
    // Medido: entre 35 KB (lagoh) y 134 KB (arcangel) por visita, tirados.
    //
    // Esto NO decide si la foto debe repetirse o no —eso es una decisión
    // editorial y está anotada aparte en `repitenElHero`—; solo deja de
    // cobrarla dos veces mientras se decide.
    if (hero && m !== POR_DEFECTO && m.huella === hero.huella) {
      return { src: tienda.heroImage, ...hero };
    }
    return { src, ...m };
  });
}

export function galeriaDe(tienda: Tienda): PlanDeGaleria {
  return planDeGaleria(fotosDe(tienda), { destacadaForzada: Boolean(tienda.galleryFeatured) });
}

/** Avisos de todas las tiendas, con el slug delante, como `avisosDeDatos()`. */
export function avisosDeGaleria(tiendas: Tienda[]): string[] {
  return tiendas.flatMap((t) => galeriaDe(t).avisos.map((a) => `${t.slug}: ${a}`));
}

/**
 * Fotos de la galería que son EL MISMO FICHERO que el hero.
 *
 * Medido el 2026-08-26: pasa en 7 de las 8 tiendas. El visitante ve la misma
 * foto dos veces —arriba de fondo y otra vez en «Conoce nuestra tienda»— y en
 * Lagoh eso deja la galería en 2 fotos útiles de 3.
 *
 * No se filtran automáticamente: quitar contenido de la web publicada de un
 * cliente es una decisión editorial, no un arreglo técnico, y en algunas
 * tiendas el plano general repetido puede ser deliberado. Se listan para que
 * la decisión se tome una vez y por escrito, en vez de no tomarse nunca.
 */
export function repitenElHero(tienda: Tienda): string[] {
  const hero = MAPA[tienda.heroImage];
  if (!hero) return [];
  // Por HUELLA y no por ruta: el caso real son dos rutas distintas
  // (`hero.webp` y `tienda-1.webp`) con exactamente los mismos bytes, así que
  // comparar rutas no detectaría ni uno de los siete.
  return tienda.galleryImages.filter((src) => src !== tienda.heroImage && MAPA[src]?.huella === hero.huella);
}

/**
 * TODAS las fotos que descarga la página de una tienda: la galería y el hero.
 *
 * El hero se olvidaba con facilidad al contar peso —no está en
 * `galleryImages`—, y es la única que se descarga SIEMPRE, sin esperar a que
 * nadie baje. En 7 de las 8 tiendas además es el mismo fichero que la primera
 * de la galería, así que `fotosDePagina` puede devolver la misma ruta dos
 * veces; quien cuente peso debe deduplicar por `src`.
 */
export function fotosDePagina(tienda: Tienda): Foto[] {
  return [{ src: tienda.heroImage, ...(MAPA[tienda.heroImage] ?? POR_DEFECTO) }, ...fotosDe(tienda)];
}

/**
 * El hero, con sus dimensiones REALES.
 *
 * `Hero.astro` las llevaba escritas a mano —`width="1400" height="1050"`— y
 * eran falsas en 5 de las 8 tiendas. La peor, Lagoh: declaraba 1400×1050
 * midiendo 382×510, o sea 3,7 veces más ancho del que tiene.
 */
export function fotoHero(tienda: Tienda): Foto {
  return { src: tienda.heroImage, ...(MAPA[tienda.heroImage] ?? POR_DEFECTO) };
}
