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

      assert.equal(celdas.length, s.galleryImages.length, 'una celda por foto');

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

  test('basta una foto vertical para que la galería pase a 3 columnas', async () => {
    // A 2 columnas la celda mide 442px: una 9:16 saldría de 786px de alto.
    const conVertical = stores.find((s) => s.slug === 'vigo');
    const html = (await get('/', conVertical.domain)).text();
    assert.match(html, /--columnas:3/, 'vigo tiene fotos 9:16 y necesita 3 columnas');

    const soloHorizontales = stores.find((s) => s.slug === 'arcangel');
    const html2 = (await get('/', soloHorizontales.domain)).text();
    assert.match(html2, /--columnas:2/, 'arcangel es todo 4:3: 2 columnas y celdas grandes');
  });
});
