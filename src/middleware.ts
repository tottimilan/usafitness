import { defineMiddleware } from 'astro:middleware';
import { porDominio, hostCanonico } from './data/stores';

/**
 * ENRUTADO POR DOMINIO
 *
 * Un solo servicio sirve TODOS los dominios — 8 hoy, y la marca tiene 58
 * tiendas. Internamente todo vive bajo `/<slug>/…`; de puertas afuera cada
 * tienda ve su contenido en la raíz de SU dominio.
 * Este fichero es el único sitio donde se traduce lo uno en lo otro.
 *
 * QUÉ CAMBIÓ Y POR QUÉ (Fase 3.5)
 *
 * Antes esto solo conocía dos cosas: `/` y los cuatro documentos legales, y
 * comparaba únicamente el PRIMER segmento de la ruta. Consecuencia: era
 * literalmente imposible añadir una URL nueva. Cualquier otra ruta caía en el
 * catch-all de las páginas y terminaba en `Astro.redirect('/')`.
 *
 * Ahora la regla es general: **en el dominio de una tienda, la ruta que sea se
 * reescribe bajo su slug**, y quien decide si existe es el enrutador de Astro.
 *
 *   usafitnessvigo.com/                       →  /vigo
 *   usafitnessvigo.com/aviso-legal            →  /vigo/aviso-legal
 *   usafitnessvigo.com/suplementos/creatina   →  /vigo/suplementos/creatina
 *   usafitnessvigo.com/lo-que-sea             →  /vigo/lo-que-sea  →  404 real
 *
 * Es MENOS código que la lista blanca anterior, no más: añadir una página pasa
 * a ser crear un `.astro` bajo `src/pages/[slug]/`, que es como funciona Astro.
 * Y una ruta inexistente da 404 de verdad en vez de un redirect silencioso.
 */

/**
 * Rutas que sirve el propio servidor y NO pertenecen a ninguna tienda.
 *
 * Los ficheros de `public/` y el bundle de `/_astro/` no hacen falta aquí: el
 * adaptador los sirve antes de que este middleware llegue a ejecutarse.
 *
 * AVISO PARA LA TAREA 3.8 (imágenes responsive): en cuanto se use
 * `astro:assets`, Astro añade el endpoint `/_image`, y ese SÍ pasa por aquí.
 * Sin meterlo en esta lista se reescribiría a `/<slug>/_image` y todas las
 * imágenes optimizadas darían 404 en todos los dominios a la vez.
 */
const RAIZ_COMPARTIDA = new Set(['/sitemap.xml', '/robots.txt', '/404', '/health']);

/**
 * El endpoint de imágenes de Astro, cerrado a propósito.
 *
 * No usamos `astro:assets` —`src/data/imagen.ts:28` explica por qué— pero el
 * adaptador registra `/_image` igualmente: está en el manifiesto compilado y
 * `sharp` se importa en tiempo de ejecución. En los ocho dominios quedaba
 * tapado por casualidad, porque la reescritura de abajo lo convertía en
 * `/<slug>/_image`, que no existe. En cualquier otro host respondía: medido el
 * 11-sep contra el build de producción, `?f=avif&w=4000&h=4000&q=100` devolvía
 * 200 con 382.030 bytes y **1,21 s de CPU** por petición, contra 0,028 s del
 * 404. Eso es un amplificador de 43× que no le cuesta nada a quien lo pide.
 *
 * Además es la precondición del único aviso CRÍTICO que tenemos abierto
 * (GHSA-26w7-cxv4-gfx2, 9,8: ejecución remota al decodificar AVIF). Hoy no hay
 * un solo `.avif` que el endpoint pueda leer, así que la RCE no nos alcanza;
 * pero el esquema de `stores.ts` ACEPTA rutas `.avif`, o sea que estábamos a un
 * commit de que sí.
 *
 * SI ALGÚN DÍA SE ADOPTA `astro:assets`: esto es lo primero que hay que quitar,
 * y entonces `/_image` tiene que entrar en `RAIZ_COMPARTIDA` — sin eso las
 * imágenes darían 404 en los ocho dominios a la vez.
 */
const ENDPOINT_IMAGEN = '/_image';

export const onRequest = defineMiddleware(async (context, next) => {
  const host = hostCanonico(context.request);
  const path = context.url.pathname;

  // La barra final NO se trata aquí: `trailingSlash: 'never'` en la config ya
  // hace que el adaptador devuelva un 301 a la ruta sin barra. Se escribió ese
  // redirect a mano en este fichero y, al quitarlo para comprobarlo, los tests
  // siguieron en verde — era código muerto. Está anotado para que no vuelva.
  const store = porDominio.get(host);

  // Se corta ANTES de mirar la tienda: el agujero estaba justo en el camino del
  // host desconocido, así que cerrarlo solo para los dominios conocidos no
  // habría cerrado nada.
  if (path === ENDPOINT_IMAGEN) return new Response(null, { status: 404 });

  // Host desconocido (dominio genérico, preview de Railway): se sirve tal cual.
  // Ahí las tiendas viven en /<slug> y el layout las marca `noindex`, para que
  // ninguna copia compita en Google con el dominio de su propio cliente.
  if (!store) return next();

  if (RAIZ_COMPARTIDA.has(path)) return next();

  // `next(ruta)` y NO `context.rewrite(ruta)`: rewrite vuelve a lanzar la
  // cadena de middleware desde el principio, así que la ruta ya reescrita
  // entraría aquí otra vez y se reescribiría sobre sí misma — Astro lo corta
  // con un 508 Loop Detected. `next()` reescribe sin repetir el ciclo.
  return next(path === '/' ? `/${store.slug}` : `/${store.slug}${path}`);
});
