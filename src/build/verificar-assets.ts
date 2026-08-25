/**
 * VERIFICADOR DE ASSETS — solo en build, nunca en el servidor
 *
 * El esquema de `stores.json` comprueba que una ruta de imagen TENGA forma de
 * ruta. No comprueba que el fichero exista, y esa es la mitad interesante:
 * escribir `/photos/vigo/tienda-5.webp` cuando solo hay cuatro fotos no da
 * ningún error. Da un hueco roto en el dominio de un cliente que paga, y solo
 * se descubre mirando.
 *
 * Esto vive fuera de `src/data/stores.ts` a propósito: aquel módulo lo carga
 * también el servidor en producción, donde `public/` ya no existe como tal
 * (Astro lo copia a `dist/client/`). Un `readdirSync` allí sería una bomba de
 * relojería. Aquí solo lo llama la integración de `astro.config.mjs`.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

interface TiendaConAssets {
  slug: string;
  heroImage: string;
  galleryImages: string[];
  reviews: { author: string; avatar?: string }[];
}

/**
 * Assets que el código referencia con la ruta escrita a mano, fuera de
 * `stores.json`. Si falta la tipografía no se ve un hueco: se ve otra letra, y
 * eso no lo detecta nadie mirando por encima.
 */
const FIJOS = ['/usafitness.svg', '/fonts/inter-latin.woff2', '/favicon.png', '/favicon-96.png'];

/** Devuelve la lista de assets declarados que no están en disco. */
export function assetsQueFaltan(tiendas: TiendaConAssets[], dirPublic: string): string[] {
  const declarados: { ruta: string; quien: string }[] = FIJOS.map((ruta) => ({ ruta, quien: 'código' }));

  for (const t of tiendas) {
    declarados.push({ ruta: t.heroImage, quien: `${t.slug}.heroImage` });
    t.galleryImages.forEach((ruta, i) => declarados.push({ ruta, quien: `${t.slug}.galleryImages[${i}]` }));
    for (const r of t.reviews) {
      if (r.avatar) declarados.push({ ruta: r.avatar, quien: `${t.slug}, avatar de ${r.author}` });
    }
  }

  return declarados
    .filter(({ ruta }) => !existsSync(join(dirPublic, ruta)))
    .map(({ ruta, quien }) => `${ruta} — declarado en ${quien}`);
}
