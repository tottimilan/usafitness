import type { APIRoute } from 'astro';
import { stores, porDominio } from '@/data/stores';
import { respuestaDeSalud } from '@/data/salud';

export const prerender = false;

/**
 * SALUD Y DIAGNÓSTICO
 *
 * Dos usos, y conviene no confundirlos:
 *
 *  1. Puerta de despliegue. Railway lo sondea con `healthcheckPath` y no
 *     manda tráfico a un build que no responda 200. Hoy un build que arranca
 *     y no sabe servir entra en producción en todos los dominios a la vez.
 *     OJO: Railway deja de mirarlo en cuanto el deploy está vivo. Es puerta,
 *     no vigilancia. Lo que vigila es el monitor externo.
 *
 *  2. Diagnóstico. `tienda` responde "¿quién crees que eres en este host?",
 *     que es la pregunta que separa "Railway caído" de "el enrutado está roto".
 *
 * `ok` no es decorativo: una tabla de dominios a medias es exactamente lo que
 * haría que una sociedad sirviera el contenido y el NIF de otra — con un 200
 * impecable en la home que ningún ping detecta. Con 503, el healthcheck lo
 * convierte en puerta.
 *
 * Esta ruta es un ADAPTADOR fino a propósito: la respuesta entera (cuerpo y
 * status, incluido el mapeo ok→503) se construye en `src/data/salud.ts`, que
 * es función pura y está bajo test con una tabla rota. Lo único que vive aquí
 * es lo que exige el runtime: cabeceras, entorno y la cabecera Host.
 *
 * El cuerpo tiene LAS MISMAS CLAVES Y LOS MISMOS TIPOS en cualquier host: lo
 * único que cambia con el host es el VALOR de `tienda` y el de `midiendo`. Un
 * campo que aparece o cambia de tipo según el host es una trampa para el
 * monitor que consume la respuesta.
 */
export const GET: APIRoute = ({ request }) => {
  const host = request.headers.get('host')?.split(':')[0] ?? '';

  const { status, cuerpo } = respuestaDeSalud(
    stores,
    porDominio,
    host,
    // `|| null` y no `?? null`: si la variable existe pero vacía, `??` la
    // dejaría pasar como "" — y afirmar un SHA que no se tiene es peor que no
    // afirmarlo. Las RAILWAY_GIT_* tampoco existen en un rollback ni en un
    // despliegue por imagen.
    process.env.RAILWAY_GIT_COMMIT_SHA || null,
    Math.round(process.uptime())
  );

  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
};
