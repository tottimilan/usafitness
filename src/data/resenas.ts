/**
 * EL ENLACE DE RESEÑA, Y LA COMPROBACIÓN DE QUE APUNTA A ESTA TIENDA
 *
 * Google no acepta el CID para el formulario de «escribir reseña»: exige el
 * Place ID (`ChIJ…`). Los dos identifican la misma ficha, y de hecho el Place
 * ID LLEVA EL CID DENTRO: es base64url de un protobuf con la forma
 *
 *     0a 12 09 <cellId little-endian 64> 11 <CID little-endian 64>
 *
 * Comprobado el 2026-09-06 contra el ejemplo de la documentación de Google
 * (`ChIJgUbEo8cfqokR5lP9_Wh_DaM`) y contra las siete tiendas con ficha: 7 de 7.
 * Eso permite que el build VERIFIQUE el dato en vez de confiar en él — pegar el
 * Place ID del centro comercial, que es justo lo que la tentación pide cuando
 * una tienda no tiene ficha propia, deja de ser un enlace falso publicado en el
 * dominio de un cliente y pasa a ser un error de compilación. Es la misma
 * familia de guarda que `FICHAS_PROHIBIDAS` en `stores.ts`, pero aritmética en
 * vez de una lista escrita a mano.
 *
 * Google avisa de que un Place ID puede cambiar y recomienda refrescarlo
 * pasados doce meses; `scripts/place-id.mjs --verificar` hace esa pasada.
 *
 * Sin `node:fs` ni nada de Astro: este módulo lo cargan los tres cargadores del
 * proyecto (Vite en SSR, Node pelado en los tests y Node dentro de
 * `astro:config:setup`), la misma restricción que `presupuesto.ts`.
 */

const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * El CID que lleva dentro un Place ID de FICHA DE NEGOCIO, en decimal.
 *
 * `null` si no es un Place ID de negocio: un CID pelado, un Place ID de
 * dirección (`Ei…`, `GhIJ…` — Google documenta que no todos empiezan por ChIJ)
 * o cualquier otra cosa. Devolver `null` y no lanzar es deliberado: quien llama
 * decide si eso es un error de build o solo un dato que falta.
 */
export function cidDePlaceId(placeId: string): string | null {
  const bytes: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const ch of placeId) {
    const v = B64URL.indexOf(ch);
    if (v < 0) return null;
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 0xff);
    }
  }
  // 0a 12 09 + 8 bytes de celda + 11 + 8 bytes de CID = 20 bytes exactos.
  if (bytes.length < 20) return null;
  if (bytes[0] !== 0x0a || bytes[1] !== 0x12 || bytes[2] !== 0x09 || bytes[11] !== 0x11) return null;
  let cid = 0n;
  for (let i = 19; i >= 12; i--) cid = (cid << 8n) | BigInt(bytes[i]);
  return cid.toString();
}

export interface EnlaceDeResena {
  href: string;
  etiqueta: string;
  /** `formulario` abre la caja de escribir reseña; `ficha` solo lleva a Google. */
  tipo: 'formulario' | 'ficha';
}

/**
 * El único sitio donde se construye el enlace de reseña.
 *
 * Con `placeId`, el formulario directo. Sin él pero con ficha, el enlace a la
 * ficha por CID y una etiqueta que NO promete el formulario: el visitante
 * tendría que buscar el botón, y prometerle otra cosa sería mentirle. Sin
 * ficha, `null`: la pieza no se pinta y nunca se anuncia el vacío.
 *
 * La URL del formulario no aparece hoy en ninguna página viva de Google —solo
 * en su ayuda archivada de 2019-2020— pero responde (comprobado el 2026-09-06).
 * Si la retiran, se cambia aquí y el resto del sistema no se entera.
 *
 * La política de contribuciones de Google prohíbe incentivar reseñas y
 * presionar al cliente dentro del local: este enlace es pasivo a propósito.
 */
export function enlaceResena(store: {
  placeId?: string;
  googleMapsLink?: string;
}): EnlaceDeResena | null {
  if (store.placeId) {
    return {
      href: `https://search.google.com/local/writereview?placeid=${store.placeId}`,
      etiqueta: 'Escribe tu reseña',
      tipo: 'formulario',
    };
  }
  if (store.googleMapsLink) {
    return { href: store.googleMapsLink, etiqueta: 'Ver en Google', tipo: 'ficha' };
  }
  return null;
}
