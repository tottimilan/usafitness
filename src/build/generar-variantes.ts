/**
 * GENERAR LAS VARIANTES DE IMAGEN EN EL BUILD
 *
 * `src/data/imagen.ts` sabe QUÉ variantes hacen falta y cómo se llaman. Este
 * módulo las produce.
 *
 * Corre en `astro:config:setup`, o sea antes de que Astro copie `public/` a
 * `dist/client/`. Por eso las variantes escritas aquí acaban desplegadas sin
 * ningún paso extra.
 *
 * SE SALTA LO QUE YA ESTÁ HECHO. Codificar las 47 fotos cuesta ~9 s; repetirlo
 * en cada `npm run dev` sería un peaje diario para no cambiar nada. Se compara
 * la fecha de la fuente contra la de la variante, que es la comprobación que un
 * `mtime` ya responde sin leer un byte de imagen.
 *
 * `sharp` no es una dependencia nueva: ya está instalada como transitiva de
 * Astro. Se declara igualmente en `devDependencies` — depender de la transitiva
 * de otro paquete es depender de una decisión que no controlamos.
 */

import sharp from 'sharp';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { anchosDe, rutaVariante, type Fuente } from '../data/imagen.ts';

export interface ResumenVariantes {
  generadas: number;
  reutilizadas: number;
  bytes: number;
  /** Milisegundos de codificación. Solo de las generadas. */
  ms: number;
}

/** ¿Hay que rehacer `destino`? Sí si no existe o si la fuente es más nueva. */
function estaAlDia(fuente: string, destino: string): boolean {
  try {
    return statSync(destino).mtimeMs >= statSync(fuente).mtimeMs;
  } catch {
    return false;
  }
}

export async function generarVariantes(fuentes: Fuente[], dirPublic: string): Promise<ResumenVariantes> {
  const r: ResumenVariantes = { generadas: 0, reutilizadas: 0, bytes: 0, ms: 0 };

  for (const fuente of fuentes) {
    const origen = join(dirPublic, fuente.src);

    for (const ancho of anchosDe(fuente)) {
      const destino = join(dirPublic, rutaVariante(fuente.src, ancho));

      if (estaAlDia(origen, destino)) {
        r.reutilizadas++;
        r.bytes += statSync(destino).size;
        continue;
      }

      const t = Date.now();
      // `withoutEnlargement` es cinturón sobre tirantes: `anchosDe` ya no
      // devuelve anchos mayores que el original, pero si alguien relajara esa
      // regla, sharp seguiría sin ampliar. Ampliar añade peso y cero
      // información.
      const buf = await sharp(origen).resize({ width: ancho, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      mkdirSync(dirname(destino), { recursive: true });
      writeFileSync(destino, buf);

      r.ms += Date.now() - t;
      r.generadas++;
      r.bytes += buf.length;
    }
  }

  return r;
}

/**
 * Ancho que pide un móvil corriente: 375 px de ventana a densidad 2.
 *
 * La primera versión de esta función medía la variante MÁS PEQUEÑA, y eso hacía
 * que el presupuesto mintiera a lo grande: GranCasa lo pasaba holgadamente
 * mientras un teléfono real se descargaba 974 KB. Un presupuesto que mide otra
 * cosa que la que paga el visitante es peor que no tener presupuesto, porque
 * además tranquiliza.
 */
const ANCHO_MOVIL = 375 * 2;

/**
 * Peso de las imágenes que se descarga un móvil en la página de una tienda.
 *
 * Elige por foto la misma variante que elegiría el navegador: la más pequeña
 * que llegue a `ANCHO_MOVIL`, y si ninguna llega, la mayor que haya. No es el
 * algoritmo exacto de `srcset` —depende del dispositivo— pero sí el caso
 * corriente, y es comparable entre tiendas y entre commits.
 *
 * NO se deduplica por `src` a propósito: cuando el hero y la primera de la
 * galería son el mismo fichero con dos nombres —pasa en 7 de las 8 tiendas— el
 * navegador se lo descarga DOS VECES. El presupuesto tiene que verlo.
 */
export function pesoDeUnaPagina(fuentes: Fuente[], dirPublic: string): number {
  let total = 0;
  for (const f of fuentes) {
    const elegido = anchosDe(f).find((a) => a >= ANCHO_MOVIL);
    // Si ninguna variante llega al ancho que pide el móvil, el navegador se
    // lleva EL ORIGINAL, que es el mayor de todo el `srcset`. La primera
    // versión cogía aquí la variante más grande y subestimaba: en Vigo decía
    // 202 KB cuando el navegador descargaba 415. Lo detectó el propio
    // navegador, midiendo — el modelo estaba mal, no la web.
    const ruta = elegido ? join(dirPublic, rutaVariante(f.src, elegido)) : join(dirPublic, f.src);
    try {
      total += statSync(ruta).size;
    } catch {
      /* si falta, el verificador de assets ya rompe el build por su cuenta */
    }
  }
  return total;
}
