import type { APIRoute } from 'astro';
import { stores, porDominio } from '@/data/stores';

export const prerender = false;

/**
 * SALUD Y DIAGNÓSTICO
 *
 * Dos usos, y conviene no confundirlos:
 *
 *  1. Puerta de despliegue. Railway lo sondea con `healthcheckPath` y no
 *     manda tráfico a un build que no responda 200. Hoy un build que arranca
 *     y no sabe servir entra en producción en los 7 dominios a la vez.
 *     OJO: Railway deja de mirarlo en cuanto el deploy está vivo. Es puerta,
 *     no vigilancia. Lo que vigila es el monitor externo.
 *
 *  2. Diagnóstico. `tienda` responde "¿quién crees que eres en este host?",
 *     que es la pregunta que separa "Railway caído" de "el enrutado está roto".
 *
 * `ok` no es decorativo: comprueba que la tabla de dominios tenga las dos
 * entradas por tienda que construye `src/data/stores.ts` (el dominio pelado y
 * el `www.`). Una tabla a medias es exactamente lo que haría que cuatro
 * sociedades sirvieran el NIF de una sola — y eso devuelve 200 en la home, así
 * que un ping no lo vería. Con 503, el healthcheck lo convierte en puerta.
 *
 * El cuerpo tiene LAS MISMAS CLAVES Y LOS MISMOS TIPOS en cualquier host. Un
 * monitor que lea este JSON no puede tener un contrato que dependa de la
 * cabecera `Host`: lo único que cambia con el host es el VALOR de `tienda` y el
 * de `midiendo`. Por eso no hay campos condicionales aquí — un campo que en un
 * host es booleano y en otro un número, o que en un host desaparece, es una
 * trampa para el que consume la respuesta.
 */
export const GET: APIRoute = ({ request }) => {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const tiendaDelHost = porDominio.get(host) ?? null;

  const dominiosEsperados = stores.length * 2;
  const ok = stores.length > 0 && porDominio.size === dominiosEsperados;

  const cuerpo = {
    ok,
    tienda: tiendaDelHost?.slug ?? null,
    tiendas: stores.length,
    dominios: porDominio.size,
    // Booleano y con el alcance del host: "¿mide ESTA tienda?". La lista de
    // slugs que planteaba el plan publicaría el censo de las otras seis en el
    // dominio de su cliente, que es justo lo que prohíbe el criterio C3.
    midiendo: Boolean(tiendaDelHost?.ga4Id),
    // Cuántas de las 7 miden. Es un recuento: no nombra a nadie, así que puede
    // viajar en cualquier host sin filtrar nada entre sociedades. Va aparte y
    // con nombre propio para que `midiendo` no cambie de tipo según el host.
    midiendoFlota: stores.filter((s) => s.ga4Id).length,
    // `?? null` porque las variables RAILWAY_GIT_* no existen en un rollback
    // ni en un despliegue por imagen. Afirmar un SHA que no se tiene es peor
    // que no afirmarlo.
    sha: process.env.RAILWAY_GIT_COMMIT_SHA ?? null,
    uptime: Math.round(process.uptime()),
  };

  return new Response(JSON.stringify(cuerpo), {
    status: ok ? 200 : 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
};
