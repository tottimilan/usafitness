import { defineMiddleware } from 'astro:middleware';
import storesData from './data/stores.json';
import { LEGAL_DOCS } from './data/legal';

const domainToSlug = new Map<string, string>();
for (const store of storesData.stores) {
  domainToSlug.set(store.domain, store.slug);
  domainToSlug.set('www.' + store.domain, store.slug);
}

const legalSlugs = new Set(LEGAL_DOCS.map((d) => d.slug));

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('host')?.split(':')[0] ?? '';
  const path = context.url.pathname;

  const slug = domainToSlug.get(host);

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
