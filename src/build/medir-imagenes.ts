/**
 * MEDIR LAS IMÁGENES EN EL BUILD
 *
 * `src/data/galeria.ts` decide el layout a partir de las dimensiones. Este
 * módulo es el que las averigua.
 *
 * POR QUÉ EN EL BUILD Y NO AL RENDERIZAR
 *
 * En SSR, leer el disco en cada petición para saber cuánto mide una foto sería
 * absurdo. Y hacerlo al cargar el módulo tampoco vale: en producción `public/`
 * ya no existe con ese nombre —el adaptador la copia a `dist/client/`—, así que
 * la ruta que funciona en desarrollo falla desplegada. Se mide una vez, antes
 * de compilar, y el resultado se escribe en `src/data/dimensiones.json`.
 *
 * Ese fichero SE COMMITEA a propósito. Dos motivos: en una revisión se ve de un
 * vistazo cuándo una foto cambia de forma —que es justo lo que descoloca una
 * galería— y un test comprueba que sigue cuadrando con los ficheros reales, así
 * que no puede quedarse rancio en silencio.
 *
 * SE LEEN CABECERAS, NO SE DECODIFICA
 *
 * Ancho y alto viven en los primeros bytes de los tres formatos que usa el
 * proyecto. No hace falta decodificar el píxel ni, sobre todo, una dependencia
 * nueva para leer dos enteros.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, sep } from 'node:path';

export interface Dimensiones {
  ancho: number;
  alto: number;
  /**
   * Primeros 12 caracteres del SHA-256 del fichero.
   *
   * No es para integridad: es para detectar la MISMA foto guardada con dos
   * nombres. Pasa en 7 de las 8 tiendas —`hero.webp` y `tienda-1.webp` son
   * byte a byte idénticos—, y comparar rutas no lo detecta porque las rutas sí
   * son distintas. 12 caracteres hexadecimales son 48 bits: de sobra para
   * cincuenta ficheros, y no ensucian el diff como los 64 completos.
   */
  huella: string;
}

/** Solo cabecera: sin huella. `null` si no se reconoce el formato. */
export function medirBuffer(b: Buffer): Omit<Dimensiones, 'huella'> | null {
  // PNG: firma de 8 bytes, y luego IHDR con ancho y alto en big-endian.
  if (b.length >= 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
  }

  // WebP: contenedor RIFF con tres variantes, y cada una guarda el tamaño en
  // un sitio distinto. Es el formato de casi todas las fotos del proyecto.
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const tipo = b.toString('ascii', 12, 16);
    if (tipo === 'VP8X') {
      return { ancho: (b.readUIntLE(24, 3) & 0xffffff) + 1, alto: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
    }
    if (tipo === 'VP8 ') {
      return { ancho: b.readUInt16LE(26) & 0x3fff, alto: b.readUInt16LE(28) & 0x3fff };
    }
    if (tipo === 'VP8L') {
      const n = b.readUInt32LE(21);
      return { ancho: (n & 0x3fff) + 1, alto: ((n >> 14) & 0x3fff) + 1 };
    }
    return null;
  }

  // JPEG: hay que recorrer los marcadores hasta un SOF, que es el que lleva el
  // tamaño. Se saltan los de reinicio (D0-D7) y los que no son SOF.
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o + 9 < b.length) {
      if (b[o] !== 0xff) {
        o++;
        continue;
      }
      const marca = b[o + 1];
      // SOF0..SOF15 excepto DHT (C4), JPG (C8) y DAC (CC), que comparten rango.
      if (marca >= 0xc0 && marca <= 0xcf && marca !== 0xc4 && marca !== 0xc8 && marca !== 0xcc) {
        return { alto: b.readUInt16BE(o + 5), ancho: b.readUInt16BE(o + 7) };
      }
      const largo = b.readUInt16BE(o + 2);
      if (largo < 2) return null; // cabecera corrupta: mejor null que bucle infinito
      o += 2 + largo;
    }
  }

  return null;
}

export function medirFichero(ruta: string): Dimensiones | null {
  try {
    const b = readFileSync(ruta);
    // La cabecera vive en los primeros bytes; 64 KB sobran para cualquier
    // formato. La huella, en cambio, se calcula sobre el fichero ENTERO: dos
    // fotos distintas de la misma tienda comparten cabecera con facilidad, y
    // una huella de los primeros 64 KB las daría por iguales.
    const d = medirBuffer(b.subarray(0, Math.min(b.length, 65_536)));
    if (!d) return null;
    return { ...d, huella: createHash('sha256').update(b).digest('hex').slice(0, 12) };
  } catch {
    return null;
  }
}

const EXTENSIONES = /\.(webp|jpe?g|png)$/i;

/**
 * Mide todas las imágenes bajo `raiz` y las devuelve indexadas por su ruta
 * pública (`/photos/vigo/tienda-1.webp`), que es la forma en que aparecen en
 * `stores.json`. Las que no se pueden medir se omiten: el verificador de assets
 * ya rompe el build si falta un fichero, así que aquí un hueco solo significa
 * «formato que no sé leer», y eso no debe tumbar un despliegue.
 */
export function medirDirectorio(raiz: string): Record<string, Dimensiones> {
  const salida: Record<string, Dimensiones> = {};

  const recorrer = (dir: string) => {
    for (const entrada of readdirSync(dir)) {
      const completa = join(dir, entrada);
      if (statSync(completa).isDirectory()) {
        recorrer(completa);
        continue;
      }
      if (!EXTENSIONES.test(entrada)) continue;
      const d = medirFichero(completa);
      if (d) salida['/' + relative(raiz, completa).split(sep).join('/')] = d;
    }
  };

  recorrer(raiz);
  // Ordenadas: el fichero generado se commitea, y un orden que baila mete ruido
  // en cada diff y esconde el cambio que sí importa.
  return Object.fromEntries(Object.entries(salida).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Mide y escribe el fichero generado. Devuelve si el contenido CAMBIÓ, para
 * que el build lo diga: es un fichero commiteado, y uno que cambia sin que
 * nadie lo note acaba desincronizado del repositorio.
 */
export function escribirDimensiones(dirPublic: string, destino: string): { total: number; cambios: boolean } {
  const medidas = medirDirectorio(dirPublic);
  const texto = JSON.stringify(medidas, null, 2) + '\n';

  let anterior: string | null = null;
  try {
    anterior = readFileSync(destino, 'utf8');
  } catch {
    /* primera vez */
  }

  if (anterior !== texto) writeFileSync(destino, texto);
  return { total: Object.keys(medidas).length, cambios: anterior !== texto };
}
