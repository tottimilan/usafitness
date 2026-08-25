import { defineMiddleware } from 'astro:middleware';
import { porDominio } from './data/stores';
import { LEGAL_DOCS } from './data/legal';

const legalSlugs = new Set(LEGAL_DOCS.map((d) => d.slug));

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('host')?.split(':')[0] ?? '';
  const path = context.url.pathname;

  const slug = porDominio.get(host)?.slug;

  if (slug) {
    // On a store's own domain, serve its content directly without mixing stores.
    if (path === '/' || path === '') {
      return context.rewrite(`/${slug}`);
    }
    // Clean legal URLs per domain: /aviso-legal -> /<slug>/aviso-legal
    const firstSegment = path.replace(/^\/+/, '').replace(/\/+$/, '');
    if (legalSlugs.has(firstSegment)) {
      return context.rewrite(`/${slug}/${firstSegment}`);
    }
  }

  return next();
});
