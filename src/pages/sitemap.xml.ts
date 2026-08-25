import type { APIRoute } from 'astro';
import { stores, porDominio } from '@/data/stores';
import { LEGAL_DOCS } from '@/data/legal';

export const prerender = false;

// Google ignora <changefreq> y <priority> desde hace años; el único elemento
// opcional que sí consume es <lastmod>. Se emite la fecha del build: es la
// señal de frescura más honesta que este proyecto puede dar, porque el
// contenido de una tienda cambia cuando se redespliega.
const LASTMOD = new Date().toISOString().slice(0, 10);

function urlEntry(loc: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </url>`;
}

export const GET: APIRoute = ({ request }) => {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const store = porDominio.get(host);

  let entries: string[] = [];

  if (store) {
    // Per-store sitemap: only this store's canonical URLs. No mixing.
    const base = `https://${store.domain}`;
    entries.push(urlEntry(`${base}/`));
    // Legal pages are only indexable when the store has real `company` data
    // (see [slug]/[doc].astro, which sets noindex otherwise). Listing them here
    // would submit URLs we ourselves tell Google not to index.
    if (store.company) {
      for (const doc of LEGAL_DOCS) {
        entries.push(urlEntry(`${base}/${doc.slug}`));
      }
    }
  } else {
    // Generic/preview domain: list every store's canonical homepage.
    for (const s of stores) {
      entries.push(urlEntry(`https://${s.domain}/`));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
