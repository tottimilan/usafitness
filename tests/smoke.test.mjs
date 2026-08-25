/**
 * TEST DE HUMO DE LOS 7 DOMINIOS
 *
 * Este proyecto sirve 7 empresas distintas desde UN SOLO servicio y UN SOLO
 * punto de entrada. Un fallo en `middleware.ts` o en `Landing.astro` no rompe
 * una web: rompe siete, cada una de un cliente que paga.
 *
 * Hasta ahora no había ninguna red. Este fichero es la primera.
 *
 * Sin dependencias: `node:test` y `node:assert` vienen con Node. Se ejecuta
 * contra el BUILD DE PRODUCCIÓN, no contra `astro dev`, y esto no es un
 * detalle: Vite bloquea la cabecera `Host` y devuelve 403, así que un test
 * contra dev daría el mismo error antes y después de cualquier cambio.
 * Un falso verde es peor que no tener test.
 *
 *   npm test
 */

import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';

const PORT = 4599;
const BASE = `http://127.0.0.1:${PORT}`;

const stores = JSON.parse(readFileSync(new URL('../src/data/stores.json', import.meta.url), 'utf8')).stores;

let server;

/**
 * Petición simulando que llega al dominio real de una tienda.
 *
 * Se usa `node:http` y NO `fetch` a propósito: `Host` es una forbidden header
 * name en la especificación de fetch, así que undici la descarta en silencio.
 * Con fetch, todas las peticiones llegaban al host genérico y el test parecía
 * comprobar el enrutado por dominio sin comprobarlo en absoluto.
 * Es exactamente el falso verde que este fichero existe para evitar.
 */
function get(path, host) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port: PORT, path, method: 'GET', headers: host ? { Host: host } : {} },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text: () => body }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

before(async () => {
  server = spawn(process.execPath, ['dist/server/entry.mjs'], {
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
    stdio: 'ignore',
  });

  // Esperar a que levante, sin dormir a ciegas.
  const limite = Date.now() + 20000;
  for (;;) {
    try {
      await get('/');
      return;
    } catch {
      if (Date.now() > limite) throw new Error('El servidor no levantó. ¿Has ejecutado `npm run build`?');
      await new Promise((r) => setTimeout(r, 200));
    }
  }
});

after(() => server?.kill());

describe('Cada dominio sirve su tienda', () => {
  for (const s of stores) {
    test(`${s.slug} → ${s.domain}`, async () => {
      const res = await get('/', s.domain);
      assert.equal(res.status, 200, 'debe responder 200 en su propio dominio');
      const html = res.text();

      assert.match(html, new RegExp(`rel="canonical" href="https://${s.domain}/"`), 'canonical al dominio propio');
      assert.match(html, /name="robots" content="index, follow/, 'indexable en su host canónico');
      assert.ok(html.includes(s.name), 'el nombre de la tienda aparece en la página');

      // Aislamiento: la web de una tienda no puede mencionar el dominio de otra.
      for (const otra of stores) {
        if (otra.domain === s.domain) continue;
        assert.ok(!html.includes(otra.domain), `no debe filtrarse ${otra.domain}`);
      }
    });
  }
});

describe('Los hosts no canónicos no compiten en Google', () => {
  test('un host desconocido va a noindex', async () => {
    const res = await get(`/${stores[0].slug}`, 'preview.up.railway.app');
    const html = res.text();
    assert.match(html, /name="robots" content="noindex/, 'noindex fuera del dominio de la tienda');
  });

  test('las páginas legales tampoco se indexan fuera del dominio de su tienda', async () => {
    // Era un fallo REAL, no una hipótesis: `[slug]/[doc].astro` calculaba
    // `robots` solo a partir de si la tienda tenía datos legales, sin mirar el
    // host. En el preview de Railway y en el dominio genérico, el aviso legal
    // de un cliente se publicaba `index, follow`. Ahora la regla vive en
    // `Base.astro` y se aplica igual a todas las páginas.
    const s = stores.find((x) => x.company);
    const res = await get(`/${s.slug}/aviso-legal`, 'preview.up.railway.app');
    assert.match(res.text(), /name="robots" content="noindex/);
  });

  test('el 404 no se indexa ni en el dominio propio de la tienda', async () => {
    const res = await get('/no-existe', stores[0].domain);
    assert.match(res.text(), /name="robots" content="noindex/);
  });

  test('www resuelve igual que el dominio pelado', async () => {
    const s = stores[0];
    const res = await get('/', `www.${s.domain}`);
    assert.equal(res.status, 200);
    assert.match(res.text(), /name="robots" content="index, follow/);
  });

  test('el token de Search Console no se publica fuera del dominio de su tienda', async () => {
    // `Base.astro` calcula `enSuDominio` para el meta robots pero no lo aplicaba
    // al token de verificación: cualquier host que sirviera /vigo publicaba el
    // token de propiedad de Vigo.
    const s = stores.find((x) => x.googleSiteVerification);
    if (!s) return;
    const ajeno = (await get(`/${s.slug}`, 'preview.up.railway.app')).text();
    assert.ok(!ajeno.includes('google-site-verification'), 'fuera de su dominio, no');
    const propio = (await get('/', s.domain)).text();
    assert.ok(propio.includes(s.googleSiteVerification), 'en su dominio, sí');
  });
});

describe('Sitemap por dominio, sin mezclar tiendas', () => {
  for (const s of stores) {
    test(`${s.slug}`, async () => {
      const res = await get('/sitemap.xml', s.domain);
      assert.equal(res.status, 200);
      const xml = res.text();

      assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/, 'XML bien formado');
      assert.ok(xml.includes('<urlset'), 'lleva urlset');
      assert.ok(xml.includes(`<loc>https://${s.domain}/</loc>`), 'incluye su propia home');

      for (const otra of stores) {
        if (otra.domain === s.domain) continue;
        assert.ok(!xml.includes(otra.domain), `el sitemap de ${s.slug} no puede listar ${otra.domain}`);
      }

      // Nunca se envían a Google URLs que la propia web marca noindex.
      if (!s.company) {
        assert.ok(!xml.includes('/aviso-legal'), 'sin datos legales, las legales no van al sitemap');
      }
    });
  }
});

describe('Las 4 páginas legales responden', () => {
  const DOCS = ['aviso-legal', 'politica-de-privacidad', 'politica-de-cookies', 'politica-redes-sociales'];
  for (const s of stores) {
    test(`${s.slug}`, async () => {
      for (const doc of DOCS) {
        const res = await get(`/${doc}`, s.domain);
        assert.equal(res.status, 200, `/${doc} debe responder en ${s.domain}`);
        const html = res.text();
        // Se comprueba el prefijo, no la cadena exacta: `Base.astro` añade
        // `max-image-preview:large` donde se indexa. Lo que importa es que
        // empiece por `index` y no por `noindex`.
        const esperado = s.company ? /content="index, follow/ : /content="noindex/;
        assert.match(html, esperado, `robots correcto en /${doc} según tenga o no datos legales`);
        if (s.company) {
          // La razón social sí está en los cuatro documentos. El NIF solo en
          // los que identifican al prestador, no en todos: afirmarlo en los
          // cuatro sería un test que exige algo que no debe pasar.
          assert.ok(html.includes(s.company.razonSocial), 'aparece la razón social del titular');
          assert.ok(!html.includes('undefined'), 'ningún campo legal sin rellenar');
        }
      }

      // El NIF, donde toca: el aviso legal identifica al prestador (LSSI art. 10).
      if (s.company) {
        const html = (await get('/aviso-legal', s.domain)).text();
        assert.ok(html.includes(s.company.nif), 'el NIF del titular aparece en el aviso legal');
      }
    });
  }
});

describe('Una tienda sin datos legales identifica al menos su establecimiento', () => {
  // Antes, sin `company`, los 4 documentos servían un párrafo que no
  // identificaba a nadie: "Estamos actualizando la información legal". El gate
  // del 2026-08-25 comprobó en vivo que Marineda y Alcobendas servían su
  // portada en `index, follow` con eso detrás. Esto NO cumple el art. 10 LSSI
  // —para eso hacen falta razón social y NIF, que no se inventan— pero publica
  // lo que sí consta en vez de no decir nada.
  const sinDatos = stores.filter((s) => !s.company);

  for (const s of sinDatos) {
    test(`${s.slug}`, async () => {
      const html = (await get('/aviso-legal', s.domain)).text();

      assert.match(html, /name="robots" content="noindex/, 'un documento incompleto no se indexa');
      assert.ok(!html.includes('Estamos actualizando la información legal'), 'el texto vacío ya no se sirve');

      // Lo que sí se publica, y es verificable.
      assert.ok(html.includes(s.name), 'nombra el establecimiento');
      assert.ok(html.includes(s.streetAddress), 'publica la dirección real');
      assert.ok(html.includes(s.phoneDisplay), 'da un teléfono por el que pedir los datos completos');

      // Y lo que NO se publica, que es la mitad importante.
      assert.match(html, /pendiente de incorporar/, 'dice explícitamente qué falta');
      assert.doesNotMatch(html, /[A-HJ-NP-SUVW]\d{7}[0-9A-J]/, 'jamás un NIF inventado');
      for (const otra of stores) {
        if (!otra.company) continue;
        assert.ok(!html.includes(otra.company.razonSocial), `no toma prestada la razón social de ${otra.slug}`);
        assert.ok(!html.includes(otra.company.nif), `no toma prestado el NIF de ${otra.slug}`);
      }
    });
  }

  test('las tiendas que SÍ tienen datos siguen sirviendo el documento completo', async () => {
    const s = stores.find((x) => x.company);
    const html = (await get('/aviso-legal', s.domain)).text();
    assert.ok(html.includes(s.company.razonSocial));
    assert.ok(html.includes(s.company.nif));
    assert.ok(!html.includes('pendiente de incorporar'), 'sin bloque provisional donde no hace falta');
  });
});

describe('Ningún dominio filtra datos de otra sociedad', () => {
  test('cada NIF aparece solo donde debe', async () => {
    for (const s of stores) {
      const res = await get('/aviso-legal', s.domain);
      const html = res.text();
      for (const otra of stores) {
        if (!otra.company || otra.company.nif === s.company?.nif) continue;
        assert.ok(!html.includes(otra.company.nif), `${s.slug} no puede mostrar el NIF de ${otra.slug}`);
      }
    }
  });
});

describe('Nada de terceros antes del consentimiento', () => {
  /**
   * ¿El HTML inicial hace que el navegador PIDA algo a ese dominio?
   *
   * Un `includes('dominio')` no sirve, porque no distingue una PETICIÓN de una
   * MENCIÓN. Este proyecto ha tropezado con eso DOS veces:
   *
   *   1. Un comentario del CSS que nombraba `fonts.googleapis.com` viajaba al
   *      bundle y satisfacía su propia aserción.
   *   2. La URL de gtag.js vive como cadena dentro del cargador diferido y solo
   *      se usa si el usuario acepta. Mencionarla no descarga nada — pero un
   *      `includes` la daba por descargada, y eso hacía imposible escribir el
   *      código correcto: el test bloqueaba la solución en vez del problema.
   *
   * Se comprueba lo único que sí es una petición al pintar la página: un
   * atributo `src`/`href` que el navegador vaya a resolver.
   *
   * LÍMITE HONESTO: esto no demuestra que no salga NINGUNA petición. Un
   * `document.createElement('script')` ejecutado al cargar pasaría este test.
   * Eso solo lo prueba el navegador contando peticiones de red.
   */
  /**
   * Vacía el CUERPO de cada `<script>` conservando su etiqueta de apertura.
   *
   * Es la distinción que hace falta y que un regex sobre el HTML crudo no puede
   * hacer: dentro de un script, `s.src = '…'` es una ASIGNACIÓN que solo se
   * ejecuta si alguien llama a la función que la contiene; en la etiqueta de
   * apertura, `src="…"` es una DESCARGA que el navegador hace sí o sí.
   * Se parecen tanto que el primer intento de este test daba por descargado lo
   * que solo estaba escrito.
   */
  const sinCuerposDeScript = (html) =>
    html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');

  const pideRecursoDe = (html, dominio) =>
    new RegExp(`(?:src|href)\\s*=\\s*["']?[^"'\\s>]*${dominio.replace(/\./g, '\\.')}`, 'i').test(
      sinCuerposDeScript(html)
    );

  for (const s of stores) {
    test(`${s.slug}`, async () => {
      const html = (await get('/', s.domain)).text();
      assert.ok(!pideRecursoDe(html, 'fonts.googleapis.com'), 'las fuentes se sirven desde el propio dominio');
      assert.ok(!pideRecursoDe(html, 'fonts.gstatic.com'), 'sin preconnect a Google');
      assert.ok(!html.includes('<iframe'), 'el mapa es una fachada hasta que el usuario lo pide');
      // Incondicional a propósito: estaba envuelto en `if (!s.ga4Id)`, así que
      // se desarmaba solo en cuanto una tienda tuviera ID — justo cuando empieza
      // a hacer falta. La política no es "sin ga4Id no se carga GA4": es "GA4 no
      // se pide hasta que el usuario acepta", y eso vale con ID y sin él.
      assert.ok(!pideRecursoDe(html, 'googletagmanager.com'), 'GA4 no se pide antes del consentimiento');
    });
  }

  test('con ga4Id, la URL de gtag.js solo vive dentro del cargador diferido', async () => {
    // Contra la tienda que tenga ID; si aún no hay ninguna, se salta en vez de
    // dar un verde que no significa nada.
    const s = stores.find((x) => x.ga4Id);
    if (!s) return;
    const html = (await get('/', s.domain)).text();

    assert.ok(!pideRecursoDe(html, 'googletagmanager.com'), 'ningún src/href apunta a Google al cargar');

    // Y aparece UNA sola vez, dentro de la función que solo se invoca al aceptar.
    // Sin esta parte, sacar la inyección de la función pasaría el test anterior:
    // `s.src = …` es una asignación, no un atributo del marcado.
    const veces = (html.match(/googletagmanager/g) ?? []).length;
    assert.equal(veces, 1, 'la URL de gtag.js aparece exactamente una vez');

    const desde = html.indexOf('window.ufCargarAnalitica = function');
    assert.ok(desde > -1, 'existe el cargador diferido');
    const cargador = html.slice(desde, html.indexOf('};', desde));
    assert.ok(cargador.includes('googletagmanager'), 'la URL está dentro del cargador, no en el ámbito global');

    assert.ok(html.includes("gtag('consent', 'default'"), 'Consent Mode se declara desde el principio');
    assert.ok(html.includes(s.ga4Id), 'el id viaja en el HTML para poder cargarlo al aceptar');
  });
});

describe('Una URL que no existe da 404, no un redirect a la home', () => {
  for (const s of stores) {
    test(`${s.slug}`, async () => {
      // Antes esto devolvía 302 a `/`. Un soft 404 no es reportable en Search
      // Console (el enlace roto no aparece nunca) y hace que cualquier URL
      // inventada acabe respondiendo 200.
      const res = await get('/pagina-que-no-existe', s.domain);
      assert.equal(res.status, 404, 'debe ser un 404 de verdad');

      const html = res.text();
      assert.match(html, /name="robots" content="noindex/, 'la página de error nunca se indexa');
      // Y llega con la marca de SU tienda, no con un error genérico: es la
      // única pantalla desde la que se puede recuperar a esa visita.
      assert.ok(html.includes(s.name), 'el 404 lleva el nombre de la tienda');
      assert.ok(html.includes(`tel:${s.phone}`), 'el 404 ofrece llamar a esa tienda');

      for (const otra of stores) {
        if (otra.domain === s.domain) continue;
        assert.ok(!html.includes(otra.domain), `el 404 de ${s.slug} no puede nombrar a ${otra.slug}`);
      }
    });
  }

  test('una ruta anidada también da 404 y no redirige', async () => {
    // El middleware antiguo solo miraba el PRIMER segmento: /suplementos/x
    // caía en el catch-all y acababa en la home. Era el motivo por el que no
    // se podía añadir ninguna página nueva al sitio.
    const res = await get('/suplementos/creatina', stores[0].domain);
    assert.equal(res.status, 404);
  });
});

describe('Una sola URL canónica por página', () => {
  test('la barra final se corrige con un 301', async () => {
    const s = stores.find((x) => x.company) ?? stores[0];
    const res = await get('/aviso-legal/', s.domain);
    assert.equal(res.status, 301, 'permanente, para que el enlace externo se corrija');
    assert.equal(res.headers.location, '/aviso-legal');
  });

  test('la home con barra sigue siendo la home', async () => {
    const res = await get('/', stores[0].domain);
    assert.equal(res.status, 200, '"/" no debe entrar en el bucle de redirección');
  });
});

describe('Los estáticos no pasan por el enrutado de tiendas', () => {
  test('el logo, la tipografía y una foto se sirven en el dominio de la tienda', async () => {
    const s = stores.find((x) => x.galleryImages.length > 0) ?? stores[0];
    for (const ruta of ['/usafitness.svg', '/fonts/inter-latin.woff2', s.heroImage]) {
      const res = await get(ruta, s.domain);
      assert.equal(res.status, 200, `${ruta} debe servirse tal cual, sin reescribir a /${s.slug}${ruta}`);
    }
  });
});

// La integridad de `stores.json` (unicidad, horarios, reseñas cruzadas) vive
// ahora en `tests/datos.test.mjs`, contra el esquema real. Este fichero se
// queda solo con lo que los 7 dominios RESPONDEN por HTTP.
