/**
 * robots.txt, uno por dominio.
 *
 * POR QUÉ NO SE CONSTRUYE LA URL CON LA CABECERA
 *
 * La primera versión componía el origen con `Host` y `x-forwarded-proto` tal y
 * como llegaban, porque detrás de Cloudflare la URL interna apunta a localhost.
 * El razonamiento era correcto y la ejecución no: las dos cabeceras las escribe
 * quien llama, así que acababan dentro del cuerpo de la respuesta. Medido el
 * 11-sep contra el build de producción:
 *
 *   Host: atacante.com · x-forwarded-proto: javascript
 *     → «Sitemap: javascript://atacante.com/sitemap.xml»
 *
 * y servido con `cache-control: public, max-age=3600`, o sea con una hora de
 * vida en cualquier caché intermedia. No es una vía de ejecución —esto es texto
 * plano y ningún rastreador sigue un `javascript:`— pero es texto del atacante
 * publicado bajo el dominio de un cliente, y eso no se hace.
 *
 * El arreglo es el que `sitemap.xml.ts` ya usaba desde el principio: la URL sale
 * de `store.domain`, que está validado por el esquema, y la cabecera solo sirve
 * para BUSCAR la tienda, nunca para escribirla. En un host desconocido —el
 * genérico o la preview de Railway— no se emite la línea `Sitemap`: ese host va
 * `noindex` y no tiene mapa propio que ofrecer.
 */
import type { APIRoute } from 'astro';
import { porDominio, hostCanonico } from '@/data/stores';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const store = porDominio.get(hostCanonico(request));

  // /health va con `no-store`: es la única ruta que garantiza un fallo de
  // caché en cada visita, en todos los dominios. Excluirla del rastreo cuesta un
  // renglón; el X-Robots-Tag: noindex del propio endpoint sigue siendo la
  // barrera de indexación.
  const lineas = ['User-agent: *', 'Allow: /', 'Disallow: /health'];
  if (store) lineas.push('', `Sitemap: https://${store.domain}/sitemap.xml`);

  return new Response(`${lineas.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      // El cuerpo ya no lleva nada de quien llama, pero esta respuesta se cachea
      // una hora: que ninguna caché intermedia pueda decidir que es otra cosa.
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
