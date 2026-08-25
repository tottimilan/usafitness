import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  // Build the public origin from the real Host header (behind Cloudflare/Railway
  // the internal request URL points to localhost, which would be wrong here).
  const host = request.headers.get('host') ?? new URL(request.url).host;
  const proto = request.headers.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;
  // /health va con `no-store`: es la única ruta que garantiza un fallo de
  // caché en cada visita, en 7 dominios. Excluirla del rastreo cuesta un
  // renglón; el X-Robots-Tag: noindex del propio endpoint sigue siendo la
  // barrera de indexación.
  const body = `User-agent: *\nAllow: /\nDisallow: /health\n\nSitemap: ${origin}/sitemap.xml\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
