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

  test('www resuelve igual que el dominio pelado', async () => {
    const s = stores[0];
    const res = await get('/', `www.${s.domain}`);
    assert.equal(res.status, 200);
    assert.match(res.text(), /name="robots" content="index, follow/);
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
        const esperado = s.company ? /content="index, follow"/ : /content="noindex/;
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
  for (const s of stores) {
    test(`${s.slug}`, async () => {
      const html = (await get('/', s.domain)).text();
      // Se buscan referencias REALES (href/url), no menciones sueltas: un
      // comentario en el CSS que nombre el dominio viaja al bundle y daría un
      // falso positivo, que en un test es tan malo como un falso negativo.
      assert.doesNotMatch(html, /(?:href|src|url\()="?https:\/\/fonts\.googleapis\.com/, 'las fuentes se sirven desde el propio dominio');
      assert.doesNotMatch(html, /(?:href|src|url\()="?https:\/\/fonts\.gstatic\.com/, 'sin preconnect a Google');
      assert.ok(!html.includes('<iframe'), 'el mapa es una fachada hasta que el usuario lo pide');
      if (!s.ga4Id) {
        assert.ok(!html.includes('googletagmanager'), 'sin ga4Id no se carga GA4');
      }
    });
  }
});

describe('Integridad de los datos de tienda', () => {
  test('no hay dominios ni slugs repetidos', () => {
    const dominios = stores.map((s) => s.domain);
    const slugs = stores.map((s) => s.slug);
    assert.equal(new Set(dominios).size, dominios.length, 'dominios únicos');
    assert.equal(new Set(slugs).size, slugs.length, 'slugs únicos');
  });

  test('ninguna reseña se firma en dos tiendas distintas', () => {
    const porAutor = new Map();
    for (const s of stores) {
      for (const r of s.reviews ?? []) {
        if (!porAutor.has(r.author)) porAutor.set(r.author, new Set());
        porAutor.get(r.author).add(s.slug);
      }
    }
    const repetidos = [...porAutor.entries()].filter(([, t]) => t.size > 1);
    assert.deepEqual(
      repetidos.map(([a, t]) => `${a}: ${[...t].join(', ')}`),
      [],
      'la misma persona no puede firmar reseñas en varias empresas'
    );
  });

  test('el horario de todas las tiendas parsea a Schema.org', () => {
    // El parser reconoce "lunes a viernes/sábado/domingo" y días sueltos. Si un
    // franquiciado escribe el horario de otra forma, openingHoursSpecification
    // desaparece del marcado SIN dar error. Este test lo convierte en fallo.
    const RE = /(\d{1,2}:\d{2})\s*[a–-]\s*(\d{1,2}:\d{2})/;
    const DIAS = /lunes a domingo|lunes a sábado|lunes a viernes|domingo|sábado/i;
    for (const s of stores) {
      const lineas = s.schedule.split('\n');
      const validas = lineas.filter((l) => RE.test(l) && DIAS.test(l));
      assert.ok(validas.length > 0, `el horario de ${s.slug} no lo entiende el parser: "${s.schedule}"`);
    }
  });
});
