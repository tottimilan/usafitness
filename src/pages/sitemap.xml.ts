import type { APIRoute } from 'astro';
import storesData from '@/data/stores.json';
import { LEGAL_DOCS } from '@/data/legal';

export const prerender = false;

const domainToSlug = new Map<string, string>();
for (const store of storesData.stores) {
  domainToSlug.set(store.domain, store.slug);
  domainToSlug.set('www.' + store.domain, store.slug);
}

function urlEntry(loc: string, priority: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export const GET: APIRoute = ({ request }) => {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const slug = domainToSlug.get(host);

  let entries: string[] = [];

  if (slug) {
    // Per-store sitemap: only this store's canonical URLs. No mixing.
    const store = storesData.stores.find((s) => s.slug === slug)!;
    const base = `https://${store.domain}`;
    entries.push(urlEntry(`${base}/`, '1.0'));
    // Legal pages are only indexable when the store has real `company` data
    // (see [slug]/[doc].astro, which sets noindex otherwise). Listing them here
    // would submit URLs we ourselves tell Google not to index.
    if ((store as any).company) {
      for (const doc of LEGAL_DOCS) {
        entries.push(urlEntry(`${base}/${doc.slug}`, '0.3'));
      }
    }
  } else {
    // Generic/preview domain: list every store's canonical homepage.
    for (const store of storesData.stores) {
      entries.push(urlEntry(`https://${store.domain}/`, '1.0'));
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
