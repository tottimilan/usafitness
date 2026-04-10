import { defineMiddleware } from 'astro:middleware';
import storesData from './data/stores.json';

const domainToSlug = new Map<string, string>();
for (const store of storesData.stores) {
  domainToSlug.set(store.domain, store.slug);
  domainToSlug.set('www.' + store.domain, store.slug);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('host')?.split(':')[0] ?? '';
  const path = context.url.pathname;

  const slug = domainToSlug.get(host);

  if (slug && (path === '/' || path === '')) {
    return context.rewrite(`/${slug}`);
  }

  return next();
});
