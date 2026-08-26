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
  return tienda.galleryImages.map((src) => ({ src, ...(MAPA[src] ?? POR_DEFECTO) }));
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
