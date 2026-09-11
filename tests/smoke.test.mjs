/**
 * TEST DE HUMO DE LOS 7 DOMINIOS
 *
 * Este proyecto sirve N empresas distintas desde UN SOLO servicio y UN SOLO
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

/** Como `get`, pero con cabeceras extra. Para probar vectores concretos. */
function getCon(path, host, cabeceras) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port: PORT, path, method: 'GET', headers: { ...(host ? { Host: host } : {}), ...cabeceras } },
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

  // `{ skip: … }` y NO `if (!s) return`. Con el return temprano, node:test lo
  // cuenta como PASS: el marcador dice 72 verdes y reclama una cobertura que no
  // existe, porque ninguna tienda tiene token todavía. Con `skip`, el resumen
  // dice `skipped 1` y la ausencia se ve en cada ejecución.
  //
  // La diferencia con el guardián que desarmó la Tarea 1 importa: aquel se
  // APAGABA al llegar el dato, este se ENCIENDE. Pero mientras esté dormido no
  // puede fingir que vigila.
  const conToken = stores.find((x) => x.googleSiteVerification);
  test(
    'el token de Search Console no se publica fuera del dominio de su tienda',
    { skip: conToken ? false : 'ninguna tienda tiene googleSiteVerification todavía' },
    async () => {
    // `Base.astro` calcula `enSuDominio` para el meta robots pero no lo aplicaba
    // al token de verificación: cualquier host que sirviera /vigo publicaba el
    // token de propiedad de Vigo.
    const s = conToken;
    const ajeno = (await get(`/${s.slug}`, 'preview.up.railway.app')).text();
    assert.ok(!ajeno.includes('google-site-verification'), 'fuera de su dominio, no');
    const propio = (await get('/', s.domain)).text();
    assert.ok(propio.includes(s.googleSiteVerification), 'en su dominio, sí');
    }
  );
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

describe('Accesibilidad: landmarks y las reglas que no puede haber borrado nadie', () => {
  // Estos tests son estructurales a propósito y no fingen ser otra cosa: no
  // demuestran que el foco SE VEA, demuestran que la regla que lo dibuja sigue
  // ahí. Es el techo de lo que puede afirmar un test HTTP; lo visual se mide en
  // navegador y está anotado en el commit.

  for (const s of stores) {
    test(`${s.slug} — <main> contiene el contenido y NADA más`, async () => {
      const html = (await get('/', s.domain)).text();
      const dentro = html.slice(html.indexOf('<main'), html.indexOf('</main>'));

      // `Landing.astro` envolvía el slot entero en <main>, y como la página mete
      // ahí la cabecera y el pie, quedaban DENTRO: banner y contentinfo anidados
      // en main. Además dejaba el enlace de salto sin destino — saltar "al
      // contenido" llevaba a la cabecera.
      assert.ok(!dentro.includes('<header'), 'el <header> va fuera de <main>');
      assert.ok(!dentro.includes('<footer'), 'el <footer> va fuera de <main>');
      assert.ok(dentro.includes('<section'), 'y las secciones dentro');

      // El enlace de salto es el primer elemento focusable de la página: si va
      // después de la cabecera no ahorra ni una tabulación.
      const iSalto = html.indexOf('salto-contenido');
      assert.ok(iSalto > -1, 'existe el enlace de salto');
      assert.ok(iSalto < html.indexOf('<header'), 'y va antes de la cabecera');
      assert.ok(html.includes('id="contenido"'), 'su destino existe');
    });
  }

  test('las reglas de accesibilidad viajan al CSS servido', async () => {
    const html = (await get('/', stores[0].domain)).text();
    const hoja = html.match(/\/_astro\/[^"]*\.css/)?.[0];
    assert.ok(hoja, 'la página enlaza una hoja de estilos');
    const css = (await get(hoja, stores[0].domain)).text();

    for (const [regla, porque] of [
      [':focus-visible', 'antes no había NINGUNA regla de foco en todo el CSS'],
      ['.salto-contenido:focus', 'sin esto el enlace de salto nunca se ve'],
      ['scroll-padding-top', 'sin esto la cabecera sticky tapa el elemento enfocado (WCAG 2.4.11)'],
      ['prefers-reduced-motion:reduce', 'el bloque anterior usaba no-preference y no apagaba nada'],
    ]) {
      assert.ok(css.includes(regla), `falta "${regla}": ${porque}`);
    }

    // Este va aparte porque no basta con que el selector exista: hay que
    // comprobar QUÉ declara. Una mutación que cambiara `display:none` por
    // `display:block` dejaba el selector en su sitio y el test en verde —
    // mientras la burbuja de WhatsApp volvía a quedar tapada por el aviso, con
    // el 40% de sus píxeles cayendo sobre el botón "Aceptar".
    const reglaWhatsApp = css.match(/:root:has\(#uf-cookie-banner:not\(\[hidden\]\)\)\s*\.whatsapp-float\{([^}]*)\}/);
    assert.ok(reglaWhatsApp, 'existe la regla que oculta la burbuja mientras el aviso pide decisión');
    assert.match(reglaWhatsApp[1], /display:\s*none/, 'y la oculta de verdad — display:none la saca también del orden de tabulación');
  });

  for (const s of stores.filter((s) => s.reviews?.length)) {
    test(`${s.slug} — la puntuación de cada reseña se puede oír`, async () => {
      const html = (await get('/', s.domain)).text();
      const puntuaciones = [...html.matchAll(/<p class="stars"([^>]*)>([^<]*)</g)];

      assert.equal(
        puntuaciones.length,
        s.reviews.length,
        `${s.reviews.length} reseñas en los datos, ${puntuaciones.length} puntuaciones en el HTML`,
      );

      for (const [, atributos, visible] of puntuaciones) {
        // Sin nombre accesible, «★★★★☆» es lo que el lector de pantalla tiene
        // que resolver solo, y cada uno hace algo distinto: NVDA deletrea
        // "estrella negra estrella negra…", VoiceOver a menudo lo salta entero.
        // Ninguna de las dos cosas dice "4 de 5", que es el dato.
        const nombre = atributos.match(/aria-label="([^"]+)"/)?.[1];
        assert.ok(nombre, `las estrellas "${visible}" salen sin aria-label`);

        // Que exista el atributo no basta: tiene que decir la MISMA puntuación
        // que dibujan las estrellas. Un aria-label fijo pasaría el test de
        // arriba y mentiría en cuatro de cada cinco reseñas.
        const llenas = (visible.match(/★/g) ?? []).length;
        assert.equal(
          nombre,
          `${llenas} de 5 estrellas`,
          `dibuja ${llenas} estrellas llenas pero anuncia "${nombre}"`,
        );

        // role="img" es lo que agrupa los cinco caracteres en un solo objeto;
        // sin él, el aria-label de un <p> lo ignoran varios lectores.
        assert.match(atributos, /role="img"/, 'falta role="img" en las estrellas');
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

  // Mismo motivo que el test del token de Search Console: `skip` y no un return
  // temprano, para que el marcador no cuente como verde lo que no se ha probado.
  const conGa4 = stores.find((x) => x.ga4Id);
  test(
    'con ga4Id, la URL de gtag.js solo vive dentro del cargador diferido',
    { skip: conGa4 ? false : 'ninguna tienda tiene ga4Id todavía' },
    async () => {
    const s = conGa4;
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
    }
  );

  test(
    'el ga4Id no viaja a hosts que no son el de su tienda',
    { skip: conGa4 ? false : 'ninguna tienda tiene ga4Id todavía' },
    async () => {
      // Mismo acotado que el token de Search Console: en el host de preview, el
      // cargador mediría sesiones ajenas dentro de la propiedad GA4 del
      // franquiciado (P-1 de la revisión del PR #1). No es un secreto — viaja
      // en el HTML de SU dominio en cada visita — pero el dato de cada tienda
      // pertenece a su sociedad, y contaminarlo también es filtrarlo.
      const s = conGa4;
      const ajeno = (await get(`/${s.slug}`, 'preview.up.railway.app')).text();
      assert.ok(!ajeno.includes(s.ga4Id), 'fuera de su dominio, el id no aparece');
      // La DEFINICIÓN del cargador, no su nombre: el banner (que se emite
      // siempre) lo menciona en su punto de llamada, con guarda de existencia.
      // La primera versión de esta aserción buscaba el nombre a secas y la
      // suite armada la tumbó: cuarta vez que este repo confunde mencionar
      // con emitir. Lo peligroso es la función con el id dentro, no la palabra.
      assert.ok(!ajeno.includes('window.ufCargarAnalitica = function'), 'sin id no se emite la definición del cargador');
    }
  );
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

describe('Una cabecera malformada no tumba un estático', () => {
  test('if-match inválido da 412, no 500', async () => {
    // GHSA de @astrojs/node: con `if-match` malformado el adaptador respondía
    // 500 en los ficheros estáticos — cache poisoning, y la única de las 10
    // vulnerabilidades de `npm audit` alcanzable desde internet en este
    // despliegue. Reproducido antes de arreglar (500) y después (412).
    //
    // El arreglo fue @astrojs/node 10.0.4 → 10.0.6, un PATCH del mismo major
    // (`peerDependencies: astro ^6.0.0`), no el salto a astro@7 que el ADR del
    // gate daba por necesario para las diez.
    const res = await getCon('/usafitness.svg', 'usafitnessvigo.com', { 'if-match': 'malformed-etag' });
    assert.equal(res.status, 412, 'Precondition Failed es la semántica correcta');
  });

  test('sin la cabecera, el estático se sirve normal', async () => {
    const res = await get('/usafitness.svg', 'usafitnessvigo.com');
    assert.equal(res.status, 200);
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
// queda solo con lo que los dominios RESPONDEN por HTTP.

describe('El endpoint de salud sirve para diagnosticar, no solo para hacer ping', () => {
  test('responde por dominio y dice qué tienda cree servir', async () => {
    for (const s of stores) {
      const res = await get('/health', s.domain);
      assert.equal(res.status, 200, `${s.slug} debe responder 200`);
      const d = JSON.parse(res.text());
      assert.equal(d.ok, true);
      assert.equal(d.tienda, s.slug, 'la tienda que el proceso cree servir en ese host');
      assert.equal(d.tiendas, stores.length);
      assert.equal(d.dominios, stores.length * 2, 'dominio pelado + www. por tienda');
      // Un endpoint de diagnóstico tampoco puede filtrar datos entre sociedades.
      // Se comprueba el SLUG además del dominio: el cuerpo no emite dominios
      // nunca, así que mirar solo el dominio es un guardián tautológico — pasa
      // por construcción y seguiría verde el día que el cuerpo empezara a
      // publicar el censo de las otras seis sociedades.
      for (const otra of stores) {
        if (otra.slug === s.slug) continue;
        assert.ok(
          !res.text().includes(otra.slug) && !res.text().includes(otra.domain),
          `no nombra a ${otra.slug}`
        );
      }
      // El alcance de `midiendo` es el host: dice si mide ESTA tienda, y es
      // booleano en todos los hosts. Sin esta aserción el campo podía cambiar de
      // tipo o de significado sin que fallara nada.
      assert.equal(typeof d.midiendo, 'boolean', 'midiendo es booleano en el dominio de una tienda');
      assert.equal(d.midiendo, Boolean(s.ga4Id), `midiendo sigue al ga4Id de ${s.slug}`);
      assert.equal(d.midiendoFlota, stores.filter((x) => x.ga4Id).length, 'recuento de flota');
    }
  });

  test('en un host desconocido dice que no sabe, y sigue estando sano', async () => {
    // Es el caso del sondeo de Railway, que llega con Host: healthcheck.railway.app.
    const res = await get('/health', 'healthcheck.railway.app');
    assert.equal(res.status, 200);
    const d = JSON.parse(res.text());
    assert.equal(d.tienda, null);
    // Un host sin tienda no es un host de confianza: `preview.up.railway.app`
    // entra por aquí y es público. Así que el cuerpo tampoco puede cambiar de
    // forma aquí: mismos tipos que en el dominio de una tienda.
    assert.equal(typeof d.midiendo, 'boolean', 'midiendo no cambia de tipo según el host');
    assert.equal(d.midiendo, false, 'sin tienda en el host no hay nada que medir');
    assert.equal(d.midiendoFlota, stores.filter((x) => x.ga4Id).length, 'recuento de flota');
  });

  test('el cuerpo tiene la misma forma en un dominio de tienda, en la sonda y en la preview pública', async () => {
    // `preview.up.railway.app` es el host hostil que este fichero ya usa para el
    // token de Search Console. Un campo que aparezca o desaparezca según el Host
    // rompe al monitor que lee el JSON y esconde qué se publica y dónde.
    const claves = ['ok', 'tienda', 'tiendas', 'dominios', 'midiendo', 'midiendoFlota', 'sha', 'uptime'];
    for (const host of [stores[0].domain, 'healthcheck.railway.app', 'preview.up.railway.app']) {
      const d = JSON.parse((await get('/health', host)).text());
      assert.deepEqual(Object.keys(d), claves, `mismas claves y en el mismo orden en ${host}`);
      // `sha` viaja en TODOS los hosts, incluida la preview pública: es el
      // contrato que fija el plan. Un hash de un repo privado no nombra a
      // ninguna sociedad, que es lo que protege C3.
      assert.ok(d.sha === null || typeof d.sha === 'string', `sha es string o null en ${host}`);
      assert.equal(typeof d.midiendo, 'boolean');
      assert.equal(typeof d.midiendoFlota, 'number');
    }
  });

  test('no se cachea y no se indexa', async () => {
    // Un diagnóstico cacheado por Cloudflare miente. Y un JSON rastreable en un
    // dominio cuyo SEO es el producto es daño autoinfligido.
    const res = await get('/health', stores[0].domain);
    assert.match(res.headers['cache-control'], /no-store/);
    assert.match(res.headers['x-robots-tag'], /noindex/);
  });
});

describe('La galería no recorta ninguna foto', () => {
  // ACOTADO el 11-09-2026: «ninguna» quiere decir **en la galería clásica**, que
  // es la que sirven las ocho webs vivas y la que estos tests piden por su
  // dominio propio. La variante `tira` de Rótulo SÍ recorta, a propósito y con
  // decisión del dueño escrita (memory/12, pregunta 7), y tiene su propio
  // bloque más abajo. Lo que sigue abierto es si esa decisión se extiende a las
  // otras cuatro plantillas; mientras no se extienda, este bloque las cubre a
  // todas menos a Rótulo.

  // Lo que se puede afirmar por HTTP es que cada celda declara la proporción
  // REAL de su foto. Que eso se traduzca en píxeles sin recorte se comprobó en
  // navegador y está en el commit: Lagoh pasó de 442×332 con el 44% del alto
  // cortado y ampliada 1,16x, a 289×386 con escala 0,76 y cero recorte.
  //
  // Este test protege la parte que sí es estructural: si alguien vuelve a poner
  // un `aspect-ratio` fijo, las proporciones dejan de coincidir con las
  // dimensiones de la imagen y esto se pone rojo.

  for (const s of stores.filter((s) => s.galleryImages.length)) {
    test(`${s.slug} — cada celda lleva la proporción de SU foto`, async () => {
      const html = (await get('/', s.domain)).text();
      const celdas = [...html.matchAll(/<figure class="[^"]*gallery-item[^"]*"[^>]*style="[^"]*--proporcion:\s*([\d]+)\s*\/\s*([\d]+)[^"]*"[\s\S]*?<img[^>]*width="(\d+)"[^>]*height="(\d+)"/g)];

      // Menos las que son el mismo fichero que el hero, que desde el
      // 2026-08-26 se filtran por decisión del dueño: el hero ya las enseña.
      const { default: dim } = await import('../src/data/dimensiones.json', { with: { type: 'json' } });
      const huellaHero = dim[s.heroImage]?.huella;
      const esperadas = s.galleryImages.filter((g) => dim[g]?.huella !== huellaHero).length;
      assert.equal(celdas.length, esperadas, 'una celda por foto no duplicada');

      for (const [, pw, ph, w, h] of celdas) {
        assert.equal(pw, w, 'el ancho de la proporción tiene que ser el de la imagen');
        assert.equal(ph, h, 'y el alto también: si no, hay recorte');
      }

      // Las dimensiones son las reales, no un 400x300 escrito a mano como antes
      // —que además provocaba salto de maquetación en TODAS las fotos.
      const genericas = celdas.filter(([, , , w, h]) => w === '400' && h === '300');
      assert.equal(genericas.length, 0, 'ninguna foto puede llevar el 400x300 genérico');
    });
  }

  test('una vertical se sirve estrecha y una apaisada, ancha', async () => {
    // Antes esto miraba `--columnas`, que era el único mando que había. Con
    // filas justificadas no hay columnas: cada foto ocupa la parte de su fila
    // que le toca por su forma. Lo que se protege sigue siendo lo mismo — que
    // una 9:16 no se pinte enorme y se coma la pantalla — pero ahora se
    // comprueba sobre el ancho que la página DECLARA para cada foto, que es lo
    // que decide qué se descarga y cómo se ve.
    const anchos = (html) =>
      [...html.matchAll(/sizes="[^"]*?, (\d+)px"/g)].map((m) => +m[1]);

    const vigo = stores.find((s) => s.slug === 'vigo');
    const deVigo = anchos((await get('/', vigo.domain)).text());
    assert.ok(deVigo.length > 0, 'la galería de vigo declara anchos por foto');
    assert.ok(
      Math.max(...deVigo) <= 320,
      `las 9:16 de vigo se declaran a ${Math.max(...deVigo)}px: a ese ancho miden más de 500 de alto`
    );

    const arcangel = stores.find((s) => s.slug === 'arcangel');
    const deArcangel = anchos((await get('/', arcangel.domain)).text());
    assert.ok(
      Math.min(...deArcangel) >= 400,
      `arcangel es todo 4:3 y sus fotos deberían ir anchas, no a ${Math.min(...deArcangel)}px`
    );
  });
});

describe('Cada pantalla se lleva el tamaño de foto que necesita', () => {
  // Antes, cada dominio servía el original a todo el mundo: 1541 KB de imágenes
  // en GranCasa para llenar columnas de 289 px. Con variantes por tamaño la
  // flota pasa de 8916 KB a 4436 KB, un 50% menos, y GranCasa de 1541 a 878.

  for (const s of stores.filter((s) => s.galleryImages.length)) {
    test(`${s.slug} — las fotos declaran srcset y sizes`, async () => {
      const html = (await get('/', s.domain)).text();
      const imgs = [...html.matchAll(/<img[^>]*class="hero-bg"[\s\S]*?>|<figure class="[^"]*gallery-item[\s\S]*?<img[^>]*>/g)].map(
        (m) => m[0]
      );
      assert.ok(imgs.length >= s.galleryImages.length, 'se encuentran las imágenes de la página');

      for (const img of imgs) {
        assert.match(img, /srcset="/, 'sin srcset el navegador solo puede traerse el original');
        assert.match(img, /sizes="/, 'sin sizes elige a ciegas, normalmente el más grande');
      }
    });
  }

  test('el srcset nunca ofrece una variante MAYOR que el original', async () => {
    // Ampliar no añade un solo píxel de información y sí peso. Lagoh es el caso
    // que lo prueba: sus fotos miden 382px, así que no debe tener variantes.
    const lagoh = stores.find((x) => x.slug === 'lagoh');
    const html = (await get('/', lagoh.domain)).text();

    for (const [, set] of html.matchAll(/srcset="([^"]+)"/g)) {
      const anchos = set.split(',').map((p) => parseInt(p.trim().split(/\s+/)[1]));
      assert.ok(
        Math.max(...anchos) <= 510,
        `las fotos de lagoh no pasan de 510px de ancho y el srcset ofrece ${Math.max(...anchos)}w`
      );
    }
  });

  test('el hero declara sus dimensiones REALES, no unas escritas a mano', async () => {
    // `Hero.astro` llevaba `width="1400" height="1050"` fijo y era falso en 5 de
    // las 8 tiendas. La peor: lagoh declaraba 1400 midiendo 382, o sea 3,7 veces
    // más ancho del que tiene.
    const { default: dim } = await import('../src/data/dimensiones.json', { with: { type: 'json' } });

    for (const s of stores) {
      const html = (await get('/', s.domain)).text();
      const hero = html.match(/<img[^>]*class="hero-bg"[^>]*>/)?.[0];
      assert.ok(hero, `${s.slug}: no se encuentra el hero`);

      const real = dim[s.heroImage];
      assert.ok(real, `${s.slug}: el hero no está medido`);
      assert.match(hero, new RegExp(`width="${real.ancho}"`), `${s.slug}: ancho declarado != real`);
      assert.match(hero, new RegExp(`height="${real.alto}"`), `${s.slug}: alto declarado != real`);
    }
  });

  test('la foto del hero NO vuelve a salir en la galería', async () => {
    // Historia en tres actos. (1) `hero.webp` y `tienda-1.webp` son el mismo
    // fichero byte a byte en 7 de las 8 tiendas: el visitante veía la misma
    // foto dos veces y la descargaba dos veces. (2) Primero se arregló solo el
    // coste: misma URL, una descarga. (3) El 2026-08-26 el dueño decidió la
    // parte editorial: el hero ya la enseña (semitransparente bajo el overlay),
    // así que en la galería sobra. Se filtra por HUELLA, no por ruta.
    const { default: dim } = await import('../src/data/dimensiones.json', { with: { type: 'json' } });

    for (const s of stores.filter((x) => x.galleryImages.length)) {
      const html = (await get('/', s.domain)).text();
      const srcs = [...html.matchAll(/<figure class="[^"]*gallery-item[\s\S]*?<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);

      const huellaHero = dim[s.heroImage]?.huella;
      for (const src of srcs) {
        assert.notEqual(src, s.heroImage, `${s.slug}: la galería sirve la URL del hero`);
        assert.notEqual(dim[src]?.huella, huellaHero, `${s.slug}: ${src} es el mismo fichero que el hero con otro nombre`);
      }
    }
  });

  test('destacar una foto VERTICAL a todo el ancho está prohibido', async () => {
    // Vigo tiene `galleryFeatured` y, tras quitar el duplicado del hero, su
    // primera foto es una 9:16. Destacarla significaría pintarla a 900px de
    // ancho → 1600px de alto: una foto más alta que la pantalla. El flag se
    // respeta solo cuando la primera es horizontal.
    const s = stores.find((x) => x.slug === 'vigo');
    const html = (await get('/', s.domain)).text();
    // Destacar es «ir sola en su fila». Antes esto buscaba una clase que ya no
    // existe, así que el test pasaba sin comprobar nada: se afirma sobre el
    // reparto real, que es lo único que decide cómo se ve.
    const primeraFila = html.split('class="gallery-fila').slice(1)[0] ?? '';
    const fotos = (primeraFila.match(/class="gallery-item"/g) ?? []).length;
    assert.ok(fotos !== 1, `vigo no puede destacar una 9:16 y su primera fila lleva ${fotos} foto(s)`);
  });
});

describe('Las plantillas se pintan como dicen que se pintan', () => {
  // NINGUNA tienda usa plantilla todavía, así que estas rutas de código no las
  // recorre nada en el uso normal. Eso ya escondió un fallo: al reescribir
  // `Gallery.astro` se perdió el soporte de `variant`, y la plantilla `angular`
  // dejó de destacar su primera foto sin que saltara un solo test.
  //
  // Se prueba con una tienda REAL forzando la plantilla por la ruta interna, que
  // es la que existe. No hace falta tocar `stores.json`.

  test('la plantilla `angular` reordena las secciones y destaca la primera foto', async () => {
    const { TEMPLATES, resolveSections, normalizeRef } = await import('../src/data/templates.ts');
    const ang = TEMPLATES.angular;
    assert.ok(ang, 'la plantilla angular sigue existiendo');

    const orden = resolveSections(ang).map(normalizeRef);
    const pos = (id) => orden.findIndex((s) => s.id === id);

    // Lo que la plantilla promete: la prueba social por delante del surtido.
    assert.ok(pos('reviews') < pos('products'), 'en angular, reviews va antes que products');
    assert.ok(pos('reviews') > -1 && pos('products') > -1);

    // Y la galería con su variante.
    const gal = orden.find((s) => s.id === 'gallery');
    assert.equal(gal?.variant, 'destacada', 'angular pide la galería destacada');

    const hero = orden.find((s) => s.id === 'hero');
    assert.equal(hero?.variant, 'compacto');
  });

  test('la variante `destacada` llega hasta el HTML, no se pierde por el camino', async () => {
    // Este es el que habría cazado la regresión. `Gallery.astro` recibía
    // `variant` y lo ignoraba: el marcado salía sin `gallery-item--destacada`.
    const { galeriaDe } = await import('../src/data/galeria-de-tiendas.ts');
    const s = stores.find((x) => x.slug === 'arcangel');
    const plan = galeriaDe(s);

    assert.equal(plan.destacarPrimera, false, 'arcangel no lleva el flag por tienda…');
    assert.ok(plan.filas[0].fotos.length > 1, '…así que su primera fila lleva varias fotos');

    // …y si con la plantilla la primera queda SOLA en su fila, solo puede venir
    // de la variante. Se comprueba sobre el HTML servido y no sobre el texto
    // del componente: la versión anterior de este test buscaba el nombre de una
    // clase en el fuente, así que al cambiar el mecanismo de maquetación se
    // puso roja sin que nada estuviera roto, y habría seguido verde si la clase
    // se hubiera quedado escrita sin pintar nada.
    // Por la ruta interna y SIN el dominio de la tienda: `?plantilla=` está
    // deshabilitado a propósito en el dominio canónico, para que nadie pueda
    // enseñarle al cliente su web con otra plantilla desde su propia URL.
    const html = (await get(`/${s.slug}?plantilla=angular`)).text();
    const filas = html.split('class="gallery-fila').slice(1);
    assert.ok(filas.length > 1, 'la galería sale repartida en filas');
    const fotosDeLaPrimera = (filas[0].match(/class="gallery-item"/g) ?? []).length;
    assert.equal(
      fotosDeLaPrimera,
      1,
      'con `angular`, la primera foto va sola en su fila: eso es destacarla'
    );
  });
});

describe('La plantilla Energía es OTRA web, no otra piel', () => {
  // El listón lo puso el dueño del proyecto rechazando `angular`: «cambia el
  // hero pero es prácticamente la misma web». Estos tests fijan lo que separa
  // a Energía de un cambio de pintura: composición propia (cartel, marquesinas,
  // pizarra), tipografía propia (Barlow Condensed autoalojada) y periferia
  // propia (cinta, footer diagonal, barra de contacto móvil).

  test('el preview la sirve entera: cartel, banda, pizarra, cinta y fuente', async () => {
    const html = (await get('/arcangel?plantilla=energia')).text();

    assert.match(html, /data-plantilla="energia"/);
    for (const marca of [
      'hero--cartel', // el primer viewport es un cartel, no una foto velada
      'cartel-ciudad', // la ciudad gigante
      'promos-marquesina', // la banda roja
      'pizarra-lista', // el surtido como pizarra
      'cinta-marca', // la periferia: cinta de claims…
      'barra-contacto', // …y barra de contacto móvil
      'barlow-condensed-700-latin.woff2', // tipografía propia, autoalojada
    ]) {
      assert.ok(html.includes(marca), `falta "${marca}": la plantilla está a medias`);
    }
  });

  test('los CTAs degradan: sin WhatsApp no se inventa un botón roto', async () => {
    // La promesa «dos botones que siempre existen» era mentira en 3 de 8
    // tiendas y el panel de diseño la cazó en los CINCO conceptos a la vez.
    // Por ENLACE, no por substring: el clasificador de eventos de
    // ConversionTracking menciona «wa.me» dentro de su script y es legítimo —
    // clasifica enlaces, no los crea. Lo prohibido es un href.
    const sinWa = (await get('/arcangel?plantilla=energia')).text();
    assert.ok(!/href="https:\/\/wa\.me/.test(sinWa), 'arcangel no tiene WhatsApp: ningún ENLACE puede apuntar ahí');
    assert.match(sinWa, /Cómo llegar/, 'el hueco lo ocupa el mapa, no un botón muerto');

    const conWa = (await get('/vigo?plantilla=energia')).text();
    assert.ok(/href="https:\/\/wa\.me\/34/.test(conWa), 'vigo sí tiene móvil: el botón existe');
  });

  test('el movimiento tiene control de pausa y respeta reduced-motion', async () => {
    // WCAG 2.2.2: contenido en movimiento automático → control para pararlo.
    const html = (await get('/arcangel?plantilla=energia')).text();
    assert.match(html, /id="uf-pausa-marquesinas"[^>]*aria-pressed="false"/);

    // Y la garantía que no depende de JavaScript: la animación de las
    // marquesinas SOLO se declara bajo `prefers-reduced-motion: no-preference`.
    const { CSS_ENERGIA } = await import('../src/data/plantilla-energia-css.ts');
    const idx = CSS_ENERGIA.indexOf('animation: e-desfile');
    const guardia = CSS_ENERGIA.lastIndexOf('prefers-reduced-motion: no-preference', idx);
    assert.ok(guardia > -1 && idx - guardia < 400, 'la marquesina se anima fuera de la guardia de reduced-motion');
  });

  test('la hoja no se fuga a las demás plantillas', async () => {
    // Cada selector va prefijado con html[data-plantilla="energia"]. Un `body`
    // o un `:root` a pelo aquí cambiaría las webs VIVAS de los clientes que
    // usan la clásica — el fallo más caro posible.
    const { CSS_ENERGIA } = await import('../src/data/plantilla-energia-css.ts');
    assert.ok(!/^\s*:root\b/m.test(CSS_ENERGIA), ':root sin prefijo en la hoja de energía');
    assert.ok(!/^\s*body\s*\{/m.test(CSS_ENERGIA), 'body sin prefijo en la hoja de energía');

    // Y las páginas canónicas no la reciben: la clásica sigue intacta.
    const clasica = (await get('/', stores.find((s) => s.slug === 'arcangel').domain)).text();
    assert.ok(!clasica.includes('hero--cartel'), 'la clásica no puede llevar el cartel');
    assert.ok(!clasica.includes('cinta-marca'), 'ni la cinta');
    assert.ok(!clasica.includes('barlow-condensed'), 'ni pagar la fuente que no usa');
  });

  test('las fuentes que declara CUALQUIER plantilla existen de verdad en public/', async () => {
    // Estaba cableado a `energia`, así que una plantilla nueva con una fuente
    // mal escrita no lo habría tocado: el build sí revienta, pero con un ENOENT
    // crudo de `statSync` y sin decir qué plantilla la declara.
    const { TEMPLATES } = await import('../src/data/templates.ts');
    const { existsSync } = await import('node:fs');
    for (const t of Object.values(TEMPLATES)) {
      for (const f of t.fonts ?? []) {
        assert.ok(
          existsSync(new URL('../public' + f, import.meta.url)),
          `${f} la declara «${t.id}» y no está en public/: la fuente caería a Arial sin que lo note nadie`
        );
      }
    }
    assert.ok((TEMPLATES.energia.fonts ?? []).length >= 2, 'los dos pesos de Barlow');
  });
});

describe('«Hazte socio» responde qué gano yo, y no promete cifras que nadie pueda sostener', () => {
  // La sección es contenido de MARCA: idéntica en las 50 tiendas, sin un dato
  // que el franquiciado tenga que mantener. Por eso es digna en la peor tienda
  // por construcción, que era el agujero que tenía que tapar.

  /** El trozo de HTML de la sección, para no medir el resto de la página. */
  const soloSocio = (html) => {
    const i = html.indexOf('<section class="socio');
    assert.ok(i > -1, 'no se pintó la sección socio');
    const j = html.indexOf('</section>', i);
    return html.slice(i, j);
  };

  test('la plantilla que la hospeda la pinta, y la clásica sigue sin ella', async () => {
    const conSocio = (await get('/lagoh?plantilla=rotulo')).text();
    assert.match(conSocio, /data-plantilla="rotulo"/);
    assert.ok(conSocio.includes('<section class="socio'), 'la plantilla que la declara la pinta');

    // La clásica es la que sirven las ocho webs vivas: no puede cambiar.
    const clasica = (await get('/', stores.find((s) => s.slug === 'lagoh').domain)).text();
    assert.ok(!clasica.includes('class="socio'), 'la clásica no lleva la sección nueva');
  });

  test('NI UNA CIFRA: las promesas sin documento no se publican', async () => {
    // Las promos actuales dicen «Hasta 10%», «Hasta 20%», «Cupón 5 € desde
    // 49,90 €». Ninguna tiene documento de la central, y ya hubo que retirar un
    // «Hasta 20% dto.» de los metadatos de las ocho por eso mismo. R2: las
    // cifras entran cuando lleguen POR ESCRITO. Este test es esa regla.
    const socio = soloSocio((await get('/lagoh?plantilla=rotulo')).text());
    assert.ok(!socio.includes('%'), 'un porcentaje sin documento se ha colado en Hazte socio');
    assert.ok(!/€|\beuros?\b/i.test(socio), 'un importe sin documento se ha colado en Hazte socio');
    assert.ok(!/\bhasta\s+\d/i.test(socio), 'un «hasta N» es justo la promesa que hubo que retirar');
    // Y las cuatro ventajas siguen ahí: quitar las cifras no es quitar el fondo.
    for (const v of ['Precio de socio', 'Descuento funcionario', 'Tu cumpleaños', 'Cupón por compra']) {
      assert.ok(socio.includes(v), `falta la ventaja «${v}»`);
    }
  });

  test('la conversión degrada por dato y nunca lleva a ningún sitio muerto', async () => {
    // N3 → N1: el alta es EN TIENDA, así que la conversión es una visita.
    const conFicha = soloSocio((await get('/lagoh?plantilla=rotulo')).text());
    assert.match(conFicha, /Cómo llegar a LAGOH/, 'usa el rótulo curado, no «USAFITNESS C.C LAGOH»');
    assert.match(conFicha, /href="https:\/\/maps\.google\.com\/\?cid=/);

    // GranCasa no tiene ficha de Google: ni mapa ni botón muerto.
    const sinFicha = soloSocio((await get('/grancasa?plantilla=rotulo')).text());
    assert.ok(!/maps\.google\.com/.test(sinFicha), 'sin ficha no puede haber enlace a Maps');
    assert.match(sinFicha, /href="tel:\+34/, 'el hueco lo ocupa el teléfono, no un botón roto');
  });

  test('no pide un solo dato personal', async () => {
    // R8: nada de captura de datos en tiendas sin bloque legal completo. Y
    // además la fricción real de hacerse socio es cero: se pide en caja.
    const socio = soloSocio((await get('/lagoh?plantilla=rotulo')).text());
    for (const etiqueta of ['<form', '<input', '<textarea', 'mailto:']) {
      assert.ok(!socio.includes(etiqueta), `«Hazte socio» no puede llevar ${etiqueta}`);
    }
  });

  test('el evento sabrá de dónde viene: la primera clase del section es «socio»', async () => {
    // `ConversionTracking.seccionDe` toma className.split(' ')[0]. Si deja de
    // ser «socio», el informe del franquiciado pierde el origen de la visita.
    const html = (await get('/lagoh?plantilla=rotulo')).text();
    assert.match(html, /<section class="socio /, 'la primera clase tiene que ser el id de la sección');
  });
});

describe('«Por qué en tienda» da tres razones, y la del medio la firma otro', () => {
  const soloPorque = (html) => {
    const i = html.indexOf('<section class="porque');
    assert.ok(i > -1, 'no se pintó la sección porque');
    return html.slice(i, html.indexOf('</section>', i));
  };

  test('la cita es literal, de una reseña de ESA tienda, y va firmada', async () => {
    // Decir «te asesora una persona» es una afirmación nuestra. Al lado va una
    // frase de alguien que no somos nosotros, entera y sin recortar.
    const s = stores.find((x) => x.slug === 'villanueva');
    const porque = soloPorque((await get(`/${s.slug}?plantilla=rotulo`)).text());
    const cita = porque.match(/«([^»]+)»/);
    assert.ok(cita, 'falta la cita entrecomillada');
    assert.ok(
      s.reviews.some((r) => r.text.includes(cita[1])),
      `la cita «${cita[1]}» no aparece literal en ninguna reseña de ${s.slug}`
    );
    assert.ok(
      s.reviews.some((r) => porque.includes(r.author)),
      'la cita tiene que ir firmada por quien la escribió'
    );
    assert.ok(porque.includes('en Google'), 'y decir de dónde sale');
  });

  test('sin reseñas no se inventa una cita: se dice el hecho operativo', async () => {
    // Cinco de las ocho tiendas están a cero reseñas. Es el caso normal.
    const porque = soloPorque((await get('/lagoh?plantilla=rotulo')).text());
    assert.ok(!porque.includes('«'), 'lagoh no tiene reseñas: no puede haber cita');
    assert.match(porque, /Asesoramiento en el mostrador/);
  });

  test('la conversión degrada: WhatsApp donde lo hay, teléfono donde no', async () => {
    const conWa = soloPorque((await get('/villanueva?plantilla=rotulo')).text());
    assert.match(conWa, /href="https:\/\/wa\.me\/34/);
    const sinWa = soloPorque((await get('/lagoh?plantilla=rotulo')).text());
    assert.ok(!/wa\.me/.test(sinWa), 'lagoh no tiene WhatsApp: ningún enlace puede apuntar ahí');
    assert.match(sinWa, /href="tel:\+34/);
  });

  test('no se nombra a ningún competidor', async () => {
    // Nombrarlo le hace publicidad, invita a ir a mirar y pone al visitante a
    // comparar precios, que es el terreno donde una tienda de barrio no gana.
    const porque = soloPorque((await get('/villanueva?plantilla=rotulo')).text());
    for (const quien of ['Amazon', 'amazon', 'Decathlon', 'MyProtein', 'Prozis', 'internet', 'online']) {
      assert.ok(!porque.includes(quien), `«Por qué en tienda» no puede nombrar a ${quien}`);
    }
  });

  test('la clásica sigue sin la sección, y el evento sabrá de dónde viene', async () => {
    const clasica = (await get('/', stores.find((s) => s.slug === 'villanueva').domain)).text();
    assert.ok(!clasica.includes('class="porque'), 'la clásica no lleva la sección nueva');
    const preview = (await get('/villanueva?plantilla=rotulo')).text();
    assert.match(preview, /<section class="porque /, 'la primera clase es el id de la sección');
  });
});

describe('La FAQ no lleva marcado muerto, ni JavaScript, ni marcas que no estén en la página', () => {
  const soloFaq = (html) => {
    const i = html.indexOf('<section class="faq');
    assert.ok(i > -1, 'no se pintó la sección faq');
    return html.slice(i, html.indexOf('</section>', i));
  };

  test('NI FAQPage NI QAPage: el resultado enriquecido murió el 7 de mayo de 2026', async () => {
    // Este test existe para que dentro de seis meses nadie lo reintroduzca
    // después de leer un artículo de SEO de 2021. Google dejó de mostrar el
    // resultado enriquecido de FAQ el 7-05-2026 y retiró su documentación el
    // 15-06-2026; y QAPage prohíbe literalmente nuestro caso, «an FAQ page
    // written by the site itself with no way for users to submit alternative
    // answers». El motivo para no marcarlo es la futilidad, no el miedo.
    // Se mira lo que se SIRVE, no el fuente: el fuente nombra «FAQPage» dentro
    // del comentario que explica por qué no se usa, y un test que buscara la
    // palabra estaría prohibiendo su propia documentación.
    const servido = (await get('/lagoh?plantilla=rotulo')).text();
    assert.ok(!/"@type"\s*:\s*"FAQPage"/.test(servido), 'FAQPage no se emite: el resultado enriquecido ya no existe');
    assert.ok(!/"@type"\s*:\s*"QAPage"/.test(servido), 'QAPage prohíbe expresamente una FAQ escrita por el propio sitio');
    assert.ok(!/"@type"\s*:\s*"Question"/.test(servido), 'ni Question suelta');

    // Y el PORQUÉ tiene que seguir escrito donde alguien lo vaya a leer antes
    // de reintroducirlo: sin el comentario, este test parece una manía.
    const fuente = readFileSync(new URL('../src/components/Faq.astro', import.meta.url), 'utf8');
    assert.match(fuente, /7 de mayo/, 'la razón, con su fecha, vive junto al código');
  });

  test('se abre y se cierra sin una línea de JavaScript', async () => {
    const faq = soloFaq((await get('/lagoh?plantilla=rotulo')).text());
    assert.ok(faq.includes('<details'), 'el acordeón es nativo');
    assert.ok(faq.includes('<summary'), 'con su summary');
    assert.ok(!faq.includes('<script'), 'ni un script dentro de la sección');
    assert.ok(!/onclick|addEventListener/.test(faq), 'ni un manejador escrito a mano');
  });

  test('no nombra ni una marca que no esté ya en la misma página', async () => {
    // Nombrar ocho marcas por escrito compromete más que enseñar ocho logos:
    // quien se desplaza y no encuentra la suya tiene un motivo para quejarse.
    // La regla es que la FAQ no añade ninguna marca nueva a la página.
    const html = (await get('/lagoh?plantilla=rotulo')).text();
    const faq = soloFaq(html);
    const { MARCAS } = await import('../src/data/faq.ts');
    for (const m of MARCAS) {
      assert.ok(faq.includes(m), `la FAQ debería nombrar ${m}`);
      const fuera = html.slice(0, html.indexOf('<section class="faq')) + html.slice(html.indexOf('</section>', html.indexOf('<section class="faq')));
      assert.ok(fuera.includes(m), `${m} se nombra en la FAQ pero no aparece en el resto de la página`);
    }
  });

  test('la pregunta del domingo aparece donde hay domingo y falta donde no', async () => {
    assert.match(soloFaq((await get('/lagoh?plantilla=rotulo')).text()), /¿Abrís los domingos\?/);
    const grancasa = soloFaq((await get('/grancasa?plantilla=rotulo')).text());
    assert.ok(!/domingo/i.test(grancasa), 'grancasa no declara domingo: la pregunta no existe');
    assert.ok(!/no abrimos/i.test(grancasa), 'y tampoco afirma que cierre');
  });

  test('la clásica sigue sin FAQ, y el evento sabrá de dónde viene', async () => {
    const clasica = (await get('/', stores.find((s) => s.slug === 'lagoh').domain)).text();
    assert.ok(!clasica.includes('class="faq'), 'la clásica no lleva la sección nueva');
    assert.match((await get('/lagoh?plantilla=rotulo')).text(), /<section class="faq /);
  });
});

describe('«Empieza aquí» elige sin JavaScript, sin teclado roto y sin prometer nada', () => {
  const soloEmpieza = (html) => {
    const i = html.indexOf('<section class="empieza');
    assert.ok(i > -1, 'no se pintó la sección empieza');
    return html.slice(i, html.indexOf('</section>', i));
  };
  /** El texto que un visitante LEE, sin atributos ni URLs. */
  const visible = (trozo) => trozo.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  test('cuatro radios de un mismo grupo y ni una línea de JavaScript', async () => {
    const e = soloEmpieza((await get('/lagoh?plantilla=rotulo')).text());
    assert.equal((e.match(/type="radio"/g) || []).length, 4, 'cuatro rutas fuera de temporada de regalo');
    assert.equal((e.match(/name="empieza"/g) || []).length, 4, 'del mismo grupo: solo una abierta a la vez');
    assert.equal((e.match(/<label /g) || []).length, 4, 'cada una con su etiqueta');
    assert.ok(!e.includes('<script'), 'ni un script dentro de la sección');
    assert.ok(!/onclick|onchange|addEventListener/.test(e), 'ni un manejador escrito a mano');
  });

  test('los radios siguen siendo alcanzables con el tabulador', async () => {
    // Se mira el CSS SERVIDO, no el fuente: `display:none` en un radio oculto
    // es el error clásico del patrón, y deja la sección inservible con teclado
    // sin que se note en ninguna captura.
    const html = (await get('/lagoh?plantilla=rotulo')).text();
    const hojas = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(hojas.length > 0, 'la página sirve alguna hoja de estilos');
    let regla = null;
    for (const h of hojas) {
      const css = (await get(h)).text();
      const m = css.match(/\.empieza-radio\[[^\]]*\]\{([^}]*)\}/);
      if (m) regla = m[1];
    }
    assert.ok(regla, 'la regla del radio llega al navegador');
    assert.match(regla, /clip-path/, 'se recorta');
    assert.ok(!/display:\s*none/.test(regla), 'nunca se esconde con display:none');
  });

  test('con WhatsApp, cada ruta manda su propio mensaje ya escrito', async () => {
    const e = soloEmpieza((await get('/villanueva?plantilla=rotulo')).text());
    const enlaces = [...e.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((m) =>
      decodeURIComponent(m[1].replace(/&#38;/g, '&'))
    );
    assert.equal(enlaces.length, 4, 'un WhatsApp por ruta');
    for (const frase of ['Vengo a ganar músculo.', 'Entreno resistencia.', 'Quiero cuidar la alimentación.', 'Empiezo de cero.']) {
      assert.ok(enlaces.some((u) => u.includes(frase)), `falta el mensaje de «${frase}»`);
    }
    assert.ok(!enlaces.some((u) => u.includes('VILLANUEVA')), 'el rótulo no se cuela gritando dentro de la frase');
  });

  test('sin WhatsApp no hay promesa rota: queda el mostrador y el teléfono', async () => {
    const e = soloEmpieza((await get('/lagoh?plantilla=rotulo')).text());
    assert.ok(!e.includes('wa.me'), 'lagoh no tiene WhatsApp verificado');
    assert.equal((e.match(/href="tel:/g) || []).length, 4, 'una llamada por ruta');
    assert.match(visible(e), /Enséñale esta pantalla/, 'y la salida que no necesita ningún dato');
  });

  test('ni un conector causal ni una cifra en lo que se lee', async () => {
    // La regla del Reglamento 1924/2006 aplicada donde se nota: la etiqueta
    // nombra el objetivo de la persona, la línea de abajo lista estanterías.
    // «Proteínas PARA ganar músculo» sería una declaración de salud.
    const texto = visible(soloEmpieza((await get('/lagoh?plantilla=rotulo')).text()));
    assert.ok(!/ para /i.test(texto), `se coló un conector causal: ${texto.slice(0, 120)}`);
    assert.ok(!/control de peso|adelgaz|rendimiento|energía y resistencia/i.test(texto), 'ni una etiqueta de zona ámbar');
    // El teléfono es la única cifra admitida, y solo dentro de un tel:.
    assert.ok(!/\d/.test(texto.replace(/Llamar al [\d\s]+/g, '')), 'ninguna cifra de catálogo');
  });

  test('la clásica no la lleva, y el evento sabrá de dónde viene', async () => {
    const clasica = (await get('/', stores.find((s) => s.slug === 'lagoh').domain)).text();
    assert.ok(!clasica.includes('class="empieza'), 'las ocho webs vivas no cambian');
    // La PRIMERA clase del <section> es el parámetro `seccion` del evento.
    assert.match((await get('/lagoh?plantilla=rotulo')).text(), /<section class="empieza /);
  });
});

describe('El host se normaliza, /_image está cerrado y robots no repite lo que le mandan', () => {
  test('un Host en mayúsculas o con punto final sirve SU tienda, no el host genérico', async () => {
    // Cloudflare hoy pone la cabecera en minúscula antes de reenviarla, así que
    // en producción esto no se veía. Depender de la configuración de otro no es
    // una defensa: si el borde cambia, o si alguien llega al servicio por otra
    // vía, el dominio de un cliente se sirve como host desconocido.
    for (const s of stores) {
      for (const variante of [s.domain, s.domain.toUpperCase(), `${s.domain}.`]) {
        const r = await get('/health', variante);
        assert.equal(r.status, 200, `${variante} debería responder`);
        assert.equal(JSON.parse(r.text()).tienda, s.slug, `${variante} debería servir ${s.slug}`);
      }
    }
  });

  test('un dominio ajeno sigue cayendo al host genérico', async () => {
    // La normalización no puede haber vuelto permisiva la tabla.
    const r = await get('/health', 'atacante.com');
    assert.equal(JSON.parse(r.text()).tienda, null);
  });

  test('/_image devuelve 404 en TODOS los hosts, también en los desconocidos', async () => {
    // No usamos `astro:assets` pero el adaptador registra el endpoint igual, y
    // sharp se importa en tiempo de ejecución. En los dominios de tienda estaba
    // tapado por casualidad (la reescritura lo convertía en /<slug>/_image); en
    // cualquier otro host respondía 200 con 382 KB y 1,2 s de CPU por petición.
    const ruta = '/_image?href=%2Fusafitness.svg&f=avif&w=4000&h=4000&q=100';
    for (const host of [stores[0].domain, stores[0].domain.toUpperCase(), 'preview.up.railway.app', undefined]) {
      const r = await get(ruta, host);
      assert.equal(r.status, 404, `/_image debería estar cerrado en ${host ?? '(sin host)'}`);
      assert.equal(r.text(), '', 'y sin cuerpo: no se codifica nada');
    }
  });

  test('robots.txt no devuelve ni una letra de lo que le mandan', async () => {
    const r = await getCon('/robots.txt', 'atacante.com', { 'x-forwarded-proto': 'javascript' });
    const cuerpo = r.text();
    assert.ok(!cuerpo.includes('atacante.com'), 'el Host no puede aparecer en el cuerpo');
    assert.ok(!cuerpo.includes('javascript'), 'ni el esquema que mande quien llama');
    assert.ok(!/Sitemap:/i.test(cuerpo), 'en un host desconocido no hay mapa que ofrecer');
    // Se cachea una hora: que ninguna caché intermedia decida que es otra cosa.
    assert.equal(r.headers['x-content-type-options'], 'nosniff');
  });

  test('robots.txt de una tienda apunta a SU dominio canónico, venga como venga la cabecera', async () => {
    const s = stores[0];
    for (const variante of [s.domain, s.domain.toUpperCase(), `${s.domain}.`]) {
      const cuerpo = (await getCon('/robots.txt', variante, { 'x-forwarded-proto': 'http' })).text();
      assert.match(cuerpo, new RegExp(`Sitemap: https://${s.domain.replace(/\./g, '\.')}/sitemap\.xml`));
      assert.ok(!cuerpo.includes('http://'), 'el esquema lo decidimos nosotros, no la cabecera');
    }
  });

  test('un ?plantilla= que apunte al prototipo no tumba la página', async () => {
    // `constructor`, `toString` y `valueOf` pasan el filtro del parámetro y
    // devolvían una función heredada, truthy, así que la reserva `??` no
    // disparaba: 500 sin autenticar. Ahora caen en la plantilla de siempre.
    for (const id of ['constructor', 'toString', 'valueOf', '__proto__']) {
      const r = await get(`/${stores[0].slug}?plantilla=${id}`, 'preview.up.railway.app');
      assert.equal(r.status, 200, `?plantilla=${id} no puede dar 500`);
      assert.match(r.text(), /data-plantilla="clasica"/, `${id} debería caer en la clásica`);
    }
  });
});

describe('La fachada del mapa sobrevive a cómo el compilador escriba las entidades', () => {
  test('el atributo decodifica EXACTAMENTE la URL de la tienda', async () => {
    // Salió al subir de astro 6.1.5 a 6.4.8: el compilador cambió `&#38;` por
    // `&amp;` en `data-map-src`. Las dos decodifican a `&` y el mapa siguió
    // funcionando, pero no había un solo test mirando esto — si la entidad se
    // hubiera roto, el mapa de las ocho tiendas habría dejado de cargar sin que
    // nada se pusiera rojo. Se afirma sobre el valor DECODIFICADO, que es lo que
    // el navegador le pasa al iframe, no sobre la grafía del HTML.
    const decodificar = (s) =>
      s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, '&');

    const conMapa = stores.filter((s) => s.googleMapsEmbed);
    assert.ok(conMapa.length >= 7, `esperaba al menos 7 tiendas con mapa y hay ${conMapa.length}`);

    for (const s of conMapa) {
      const html = (await get('/', s.domain)).text();
      const m = /data-map-src="([^"]+)"/.exec(html);
      assert.ok(m, `${s.slug}: no se pintó la fachada del mapa`);
      assert.equal(decodificar(m[1]), s.googleMapsEmbed, `${s.slug}: la URL del mapa no es la suya`);
    }

    // Y la tienda sin ficha de Google no puede tener fachada: sería el mapa de otro.
    const sinFicha = stores.find((s) => !s.googleMapsEmbed);
    if (sinFicha) {
      assert.ok(!(await get('/', sinFicha.domain)).text().includes('data-map-src'),
        `${sinFicha.slug} no tiene ficha: no puede pintar ningún mapa`);
    }
  });
});

describe('La variante «hoy» del horario, servida', () => {
  const soloHoy = (html) => {
    const i = html.indexOf('<section class="schedule');
    assert.ok(i > -1, 'no se pintó la sección de horario');
    return html.slice(i, html.indexOf('</section>', i));
  };
  const visible = (t) => t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  test('las ocho dicen algo de hoy, y ninguna afirma un cierre', async () => {
    // El cierre solo se afirma cuando lo dice el calendario del centro, que hoy
    // está vacío. Deducirlo de que falte una línea del horario manda a alguien
    // a su casa — ya pasó con dos tiendas en Google.
    for (const s of stores) {
      const t = visible(soloHoy((await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text()));
      assert.match(t, /HOY EN TIENDA|Hoy en tienda/i, `${s.slug} no rotula la sección`);
      assert.match(t, /Hoy,|Hoy no figura|no abre/, `${s.slug} no dice nada de hoy: ${t.slice(0, 120)}`);
      assert.ok(!/Hoy cerrado|Hoy, cerrado/i.test(t), `${s.slug} afirma un cierre`);
    }
  });

  test('dice DÓNDE, que es la otra mitad de P1', async () => {
    for (const s of stores) {
      const t = visible(soloHoy((await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text()));
      assert.ok(t.includes(s.mall), `${s.slug} no nombra su centro comercial`);
    }
  });

  test('la semana se pliega solo cuando hay más de una línea', async () => {
    // Un desplegable para enseñar lo que ya está justo encima es ruido.
    const unaLinea = stores.find((s) => s.schedule.split('\n').filter(Boolean).length === 1);
    const varias = stores.find((s) => s.schedule.split('\n').filter(Boolean).length > 1);
    assert.ok(unaLinea && varias, 'la flota tiene de los dos tipos');
    assert.ok(!soloHoy((await get(`/${unaLinea.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text()).includes('<details'),
      `${unaLinea.slug} tiene una sola línea y no debería desplegar nada`);
    assert.ok(soloHoy((await get(`/${varias.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text()).includes('Toda la semana'),
      `${varias.slug} tiene varias y debería poder verlas`);
  });

  test('la clásica conserva sus dos tarjetas de siempre', async () => {
    // Las ocho webs vivas no declaran plantilla: esta variante no puede
    // llegarles ni por asomo.
    const clasica = (await get('/', stores.find((s) => s.slug === 'vigo').domain)).text();
    assert.match(clasica, /Horario y canales de contacto/, 'la clásica mantiene su título');
    assert.ok(!clasica.includes('hoy-dato'), 'y no lleva ni un rastro de la variante');
  });
});

describe('Las reseñas como dato, y la píldora donde no llegan a tres', () => {
  const seccion = (html, clase) => {
    const i = html.indexOf(`<section class="${clase}`);
    return i === -1 ? null : html.slice(i, html.indexOf('</section>', i));
  };
  const visible = (t) => t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  test('con menos de tres reseñas la sección NO se pinta', async () => {
    // Dos reseñas no son prueba social, son dos personas. Villanueva tiene dos
    // y hoy las enseña como si fueran un aval.
    for (const s of stores.filter((x) => x.reviews.length < 3)) {
      const html = (await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text();
      assert.equal(seccion(html, 'reviews'), null, `${s.slug} tiene ${s.reviews.length} y no debería pintarlas`);
    }
    const conTres = stores.filter((x) => x.reviews.length >= 3);
    assert.ok(conTres.length >= 2, 'la flota tiene al menos dos tiendas con tres reseñas');
    for (const s of conTres) {
      assert.ok(seccion((await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text(), 'reviews'));
    }
  });

  test('la píldora aparece justo donde faltan reseñas, y nunca donde no hay ficha', async () => {
    // GranCasa no tiene ficha de Google: no se pinta ni la píldora. Nunca se
    // anuncia el vacío, y menos aún con un enlace que no lleva a ningún sitio.
    for (const s of stores) {
      const hoy = seccion((await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text(), 'schedule');
      const tiene = hoy.includes('hoy-pildora');
      const debe = s.reviews.length < 3 && (!!s.placeId || !!s.googleMapsLink);
      assert.equal(tiene, debe, `${s.slug}: reseñas=${s.reviews.length} ficha=${!!s.googleMapsLink} píldora=${tiene}`);
    }
    const sinFicha = stores.find((s) => !s.googleMapsLink);
    if (sinFicha) {
      const hoy = seccion((await get(`/${sinFicha.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text(), 'schedule');
      assert.ok(!/reseña/i.test(visible(hoy)), `${sinFicha.slug} no puede ni nombrar las reseñas`);
    }
  });

  test('la píldora usa el formulario de Google, que es lo que mide `pedir_resena`', async () => {
    const s = stores.find((x) => x.reviews.length < 3 && x.placeId);
    const hoy = seccion((await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text(), 'schedule');
    assert.match(hoy, /search\.google\.com\/local\/writereview\?placeid=/);
    // Y va la ÚLTIMA: es una invitación, no la acción que paga el franquiciado.
    assert.ok(hoy.indexOf('hoy-cta') < hoy.indexOf('hoy-resena'), 'el botón de visita va antes');
    assert.ok(hoy.indexOf('hoy-acciones') < hoy.indexOf('hoy-resena'), 'y el contacto también');
  });

  test('las reseñas van de la más corta a la más larga, y enteras', async () => {
    const s = stores.find((x) => x.reviews.length >= 3);
    const sec = seccion((await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text(), 'reviews');
    const largos = [...sec.matchAll(/class="dato-texto"[^>]*>«([^»]*)»/g)].map((m) => m[1].length);
    assert.equal(largos.length, s.reviews.length, 'se pintan todas');
    assert.deepEqual(largos, [...largos].sort((a, b) => a - b), 'de la más corta a la más larga');
    // Ninguna recortada: es texto firmado con nombre y apellidos que republicamos.
    for (const r of s.reviews) assert.ok(sec.includes(r.text), `«${r.author}» sale recortada`);
    assert.ok(!sec.includes('★'), 'sin estrellas: las ocho de la flota son de cinco y no informan de nada');
  });

  test('la clásica conserva sus pestañas con JavaScript', async () => {
    const clasica = (await get('/', stores.find((s) => s.slug === 'alcobendas').domain)).text();
    assert.match(clasica, /review-tab/, 'la clásica mantiene su carrusel');
    assert.ok(!clasica.includes('dato-resena'), 'y no lleva nada de la variante');
  });
});

describe('La tira de Rótulo recorta a propósito, y solo ella', () => {
  const seccion = (html) => {
    const i = html.indexOf('<section class="gallery');
    return i === -1 ? null : html.slice(i, html.indexOf('</section>', i));
  };

  test('una celda por foto, y todas del mismo tamaño', async () => {
    for (const s of stores.filter((x) => x.galleryImages.length)) {
      const sec = seccion((await get(`/${s.slug}?plantilla=rotulo`, 'preview.up.railway.app')).text());
      const celdas = (sec.match(/class="tira-celda"/g) || []).length;
      const { fotosDe } = await import('../src/data/galeria-de-tiendas.ts');
      const { planDeGaleria } = await import('../src/data/galeria.ts');
      const esperadas = planDeGaleria(fotosDe(s)).fotos.length;
      assert.equal(celdas, esperadas, `${s.slug}: ${celdas} celdas para ${esperadas} fotos`);
      assert.ok(!sec.includes('gallery-fila'), `${s.slug} no puede llevar la maquetación clásica`);
    }
  });

  test('la celda fija y el recorte llegan de verdad al navegador', async () => {
    // Se mira el CSS SERVIDO y no el fuente: es el único sitio donde consta que
    // esta variante recorta, y recortar es justo lo que el rediseño de la
    // galería quitó. Si algún día desaparece, que se vea.
    const html = (await get('/lagoh?plantilla=rotulo', 'preview.up.railway.app')).text();
    const hojas = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
    let regla = null;
    for (const h of hojas) {
      const css = (await get(h)).text();
      const m = css.match(/\.tira-celda\[[^\]]*\]\{([^}]*)\}/);
      if (m) regla = m[1];
    }
    assert.ok(regla, 'la regla de la celda llega al navegador');
    assert.match(regla, /aspect-ratio:\s*4\s*\/\s*5/, 'celda fija de 4:5');
    const img = [...hojas].length && html;
    assert.match(html, /tira-celda/, 'y las celdas están en el HTML');
  });

  test('se llega con el teclado', async () => {
    // Un carrusel horizontal al que no se llega tabulando no existe para quien
    // navega así, y el contenido queda sencillamente inaccesible.
    const sec = seccion((await get('/lagoh?plantilla=rotulo', 'preview.up.railway.app')).text());
    assert.match(sec, /class="tira"[^>]*tabindex="0"/, 'la tira es enfocable');
    assert.match(sec, /role="group"[^>]*aria-label="Fotos de /, 'y dice lo que es');
  });

  test('las ocho webs vivas siguen sin recortar un píxel', async () => {
    for (const s of stores.filter((x) => x.galleryImages.length)) {
      const clasica = (await get('/', s.domain)).text();
      assert.ok(!clasica.includes('tira-celda'), `${s.slug} no puede recibir la tira`);
      assert.match(clasica, /gallery-fila/, `${s.slug} mantiene las filas justificadas`);
    }
  });
});

describe('Cada plantilla recibe el marcado de galería que su hoja estiliza', () => {
  test('«energía» conserva las filas justificadas, que es lo que su CSS sabe pintar', async () => {
    // Esta plantilla declaraba `variant: 'tira'` sin que la variante existiera,
    // y su tira la construye su propia hoja sobre el marcado clásico. El día
    // que `tira` pasó a cambiar el MARCADO, energía se quedó sin CSS que
    // encajara: celdas que su hoja no conoce y filas que ya no existen.
    const html = (await get('/lagoh?plantilla=energia', 'preview.up.railway.app')).text();
    const i = html.indexOf('<section class="gallery');
    const sec = html.slice(i, html.indexOf('</section>', i));
    assert.match(sec, /gallery-fila/, 'energía necesita las filas: su hoja las convierte en tira');
    assert.ok(!sec.includes('tira-celda'), 'y no puede recibir el marcado de Rótulo');
  });

  test('solo Rótulo recibe la tira de marcado', async () => {
    const { TEMPLATES } = await import('../src/data/templates.ts');
    const conTira = Object.values(TEMPLATES).filter((t) =>
      t.sections.some((r) => typeof r === 'object' && r.id === 'gallery' && r.variant === 'tira')
    );
    assert.deepEqual(conTira.map((t) => t.id), ['rotulo'], 'si otra la pide, tiene que traer su CSS');
  });
});
