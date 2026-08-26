/**
 * LA GUARDA DE stores.json
 *
 * `tests/smoke.test.mjs` comprueba lo que los 7 dominios RESPONDEN.
 * Este fichero comprueba lo que el esquema RECHAZA, que no es lo mismo.
 *
 * Un esquema al que nunca se le ha visto tumbar un build no demuestra nada:
 * podría estar aceptándolo todo. Cada test de aquí le mete a propósito el
 * error que se quiere impedir y exige que falle. Si alguien relaja una regla
 * —cambia `strictObject` por `object`, quita el formato del teléfono—, el
 * test correspondiente se pone rojo.
 *
 * Lee `src/data/*.ts` directamente: Node ejecuta TypeScript desde la v23.6,
 * así que la suite prueba el módulo real y no una copia de sus reglas.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import { stores, esquemaTiendas, avisosDeDatos, tablaCoherente } from '../src/data/stores.ts';
import { respuestaDeSalud } from '../src/data/salud.ts';
import {
  planDeConsentimiento,
  ambitosDeBorrado,
  esCookieDeGoogle,
  fuenteInline,
} from '../src/data/consentimiento.ts';
import { parseHorario } from '../src/data/horario.ts';

/** Una tienda que pasa el esquema. Cada test la rompe por un sitio distinto. */
const valida = () => JSON.parse(JSON.stringify(stores[0]));

/** Afirma que el esquema rechaza `tiendas` y que el motivo menciona `pista`. */
function rechaza(tiendas, pista) {
  const r = esquemaTiendas.safeParse(tiendas);
  assert.equal(r.success, false, 'el esquema debería haber rechazado esto y lo aceptó');
  const texto = JSON.stringify(r.error.issues).toLowerCase();
  assert.ok(texto.includes(pista.toLowerCase()), `el error no menciona "${pista}": ${texto.slice(0, 300)}`);
}

describe('Los datos reales pasan', () => {
  test('las 7 tiendas validan', () => {
    assert.equal(stores.length, 7);
    assert.ok(esquemaTiendas.safeParse(stores).success);
  });

  test('el horario de cada tienda produce franjas para Schema.org', () => {
    // Con el parser REAL, no con una copia de sus reglas: si el parser cambia
    // y deja de entender un horario existente, esto se entera.
    for (const t of stores) {
      assert.ok(parseHorario(t.schedule).length > 0, `el parser no entiende el horario de ${t.slug}`);
    }
  });

  test('los avisos son informativos y no vacíos', () => {
    // No se afirma un número exacto: los avisos bajan según llegan datos, y un
    // test que exija "21 avisos" se pondría rojo el día que algo mejore.
    const avisos = avisosDeDatos();
    assert.ok(Array.isArray(avisos));
    for (const a of avisos) assert.match(a, /^[a-z0-9-]+: /, 'cada aviso empieza por el slug de su tienda');
  });
});

describe('La guarda rechaza lo que tiene que rechazar', () => {
  test('una clave con un typo', () => {
    // El caso real: escribir `heroImagen`. Antes daba una tienda con la foto
    // por defecto y nadie se enteraba hasta verlo en el dominio del cliente.
    const t = valida();
    t.heroImagen = t.heroImage;
    delete t.heroImage;
    rechaza([t], 'heroImagen');
  });

  test('un teléfono que no se puede marcar', () => {
    const t = valida();
    t.phone = '986 916 804'; // sin +34: `href="tel:"` sale con basura
    rechaza([t], 'e.164');
  });

  test('un horario que el parser no entiende', () => {
    const t = valida();
    t.schedule = 'Abierto todos los días de 10 a 22';
    rechaza([t], 'openinghoursspecification');
  });

  test('un NIF con formato imposible', () => {
    const t = valida();
    t.company = {
      razonSocial: 'EJEMPLO S.L.',
      nif: '12345',
      direccionPostal: 'Calle Falsa 1',
      emailLegal: 'a@b.es',
      telefonoLegal: '900000000',
      lastUpdated: '1 de enero de 2026',
    };
    rechaza([t], 'nif');
  });

  test('datos legales a medias', () => {
    // Peor que no tener `company`: publica un aviso legal incompleto en
    // `index, follow`. El `noindex` protege el caso vacío, no el caso a medias.
    const t = valida();
    t.company = { razonSocial: 'EJEMPLO S.L.', nif: 'B12345678' };
    rechaza([t], 'direccionpostal');
  });

  test('dos tiendas con el mismo dominio', () => {
    const a = valida();
    const b = valida();
    b.slug = 'otra';
    rechaza([a, b], 'repetido');
  });

  test('la misma persona firmando reseñas en dos tiendas', () => {
    // Ya pasó: 10 reseñas de las mismas tres autoras repartidas entre
    // sociedades independientes, retiradas el 2026-08-24. No otra vez.
    const a = valida();
    const b = valida();
    b.slug = 'otra';
    b.domain = 'otra.com';
    const resena = { author: 'Persona Repetida', text: 'Muy bien', stars: 5 };
    a.reviews = [resena];
    b.reviews = [{ ...resena }];
    rechaza([a, b], 'persona repetida');
  });

  test('una sección inventada en el campo `sections`', () => {
    const t = valida();
    t.sections = ['hero', 'seccion-que-no-existe'];
    rechaza([t], 'sections');
  });

  test('un ga4Id que no es un ga4Id', () => {
    const t = valida();
    t.ga4Id = 'UA-12345-1'; // Universal Analytics, apagado desde 2024
    rechaza([t], 'g-');
  });

  test('un ga4Id con prefijo GT- sí vale', () => {
    // Es lo que entrega la interfaz de Google hoy. Rechazarlo haría fallar el
    // build de los 7 dominios el día que se pegue el ID recién creado.
    const t = valida();
    t.ga4Id = 'GT-ABC1234';
    assert.ok(esquemaTiendas.safeParse([t]).success);
  });

  test('una ruta de imagen sin barra inicial', () => {
    const t = valida();
    t.heroImage = 'photos/vigo/hero.webp'; // relativa: 404 en /aviso-legal
    rechaza([t], 'ruta absoluta');
  });
});

describe('Los ficheros que declaran los datos existen de verdad', () => {
  test('el propio verificador está en el repositorio', async () => {
    // No es paranoia: `.gitignore` traía `build/` sin anclar, o sea "cualquier
    // carpeta llamada build a cualquier profundidad", y se tragó `src/build/`.
    // El fichero existía en local, la suite entera pasaba en local, y el CI
    // caía con "Cannot find module". Un `git status` limpio no demuestra que
    // el árbol esté completo. Este test falla en un clon recién hecho.
    const m = await import('../src/build/verificar-assets.ts');
    assert.equal(typeof m.assetsQueFaltan, 'function');
  });

  test('no falta ninguna imagen ni la tipografía', async () => {
    // El esquema comprueba que una ruta TENGA forma de ruta. Esto comprueba
    // que el fichero esté. Una ruta mal escrita no da error en ningún sitio:
    // da un hueco roto en el dominio de un cliente que paga.
    const { assetsQueFaltan } = await import('../src/build/verificar-assets.ts');
    const dirPublic = fileURLToPath(new URL('../public', import.meta.url));
    assert.deepEqual(assetsQueFaltan(stores, dirPublic), []);
  });

  test('y si falta uno, lo dice con nombre y sitio', async () => {
    const { assetsQueFaltan } = await import('../src/build/verificar-assets.ts');
    const dirPublic = fileURLToPath(new URL('../public', import.meta.url));
    const rota = { ...stores[0], heroImage: '/photos/vigo/no-existe.webp' };
    const faltan = assetsQueFaltan([rota], dirPublic);
    assert.equal(faltan.length, 1);
    assert.match(faltan[0], /no-existe\.webp — declarado en .*heroImage/);
  });
});

describe('La respuesta de /health, incluido el camino del 503', () => {
  // El camino de error de /health no lo ejercía ningún test, y probarlo contra
  // el build real exigiría compilar con una tabla rota. La revisión del PR #1
  // lo marcó (I-4), y la primera corrección se quedó corta: probaba solo
  // `tablaCoherente`, y mutar `status: ok ? 200 : 503` a `200` fijo en la ruta
  // dejaba la suite en verde. Por eso la respuesta ENTERA — cuerpo y status —
  // es ahora función pura y se prueba aquí con la tabla rota de verdad.
  const tablaReal = () => new Map(stores.flatMap((t) => [[t.domain, t], [`www.${t.domain}`, t]]));

  test('tabla entera → 200 y la tienda del host', () => {
    const r = respuestaDeSalud(stores, tablaReal(), stores[0].domain, 'abc123', 42);
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.ok, true);
    assert.equal(r.cuerpo.tienda, stores[0].slug);
    assert.equal(r.cuerpo.dominios, stores.length * 2);
  });

  test('tabla a medias → 503, que es lo único que Railway lee', () => {
    // Un dominio duplicado en los datos colapsa dos entradas del Map en una:
    // el tamaño baja y una sociedad serviría el contenido de otra con un 200
    // impecable en la home. El healthcheck solo actúa si esto es un 503.
    const mapa = tablaReal();
    mapa.delete(`www.${stores[0].domain}`);
    const r = respuestaDeSalud(stores, mapa, stores[0].domain, null, 0);
    assert.equal(r.status, 503);
    assert.equal(r.cuerpo.ok, false);
  });

  test('host desconocido → tienda null, y sigue sano', () => {
    const r = respuestaDeSalud(stores, tablaReal(), 'healthcheck.railway.app', null, 0);
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.tienda, null);
  });

  test('sin tiendas → 503', () => {
    assert.equal(respuestaDeSalud([], new Map(), 'x', null, 0).status, 503);
    assert.equal(tablaCoherente([], new Map()), false);
  });
});


describe('Las decisiones del consentimiento (I-2 de la revisión del PR #1)', () => {
  // Antes, esta lógica vivía dentro de un `<script is:inline>` y ningún test
  // podía importarla: la suite comprobaba la FORMA del HTML, no el
  // COMPORTAMIENTO. La revisión lo demostró con 4 mutaciones de comportamiento,
  // las 4 en verde. Tres de ellas eran decisiones puras y ahora están aquí.

  test('aceptar concede analítica y manda cargar', () => {
    const p = planDeConsentimiento('granted');
    assert.equal(p.consent.analytics_storage, 'granted');
    assert.equal(p.cargarAnalitica, true, 'mutación "borrar la llamada al cargador"');
    assert.equal(p.borrarCookies, false);
  });

  test('rechazar deniega, no carga y manda borrar', () => {
    const p = planDeConsentimiento('denied');
    assert.equal(p.consent.analytics_storage, 'denied');
    assert.equal(p.cargarAnalitica, false, 'rechazar no puede descargar gtag.js');
    assert.equal(p.borrarCookies, true, 'mutación "borrar el filtro de cookies"');
  });

  test('NUNCA se concede publicidad — el banner solo informa de analítica', () => {
    // Mutación "ad_storage: granted fijo". Los ad_* se declaran en `denied` en
    // el consent default y no vuelven a tocarse: conceder publicidad bajo un
    // aviso que habla de analítica es el crítico C-1 de la revisión.
    for (const valor of ['granted', 'denied']) {
      const claves = Object.keys(planDeConsentimiento(valor).consent);
      assert.deepEqual(claves, ['analytics_storage'], `en "${valor}" solo se toca analytics_storage`);
    }
  });

  describe('Los ámbitos de borrado de cookies', () => {
    test('desde www. cubre el dominio registrable, que es donde GA las escribe', () => {
      // El fallo I-1: con solo el host exacto, visitando por www. la cookie
      // sobrevivía mientras el comentario afirmaba lo contrario.
      const a = ambitosDeBorrado('www.ejemplo.com');
      assert.ok(a.includes('.ejemplo.com'), 'el dominio registrable con punto');
      assert.ok(a.includes('ejemplo.com'), 'y sin punto');
      assert.ok(a.includes(''), 'y sin atributo domain');
    });

    test('desde el dominio pelado también', () => {
      const a = ambitosDeBorrado('ejemplo.com');
      assert.ok(a.includes('.ejemplo.com') && a.includes('ejemplo.com'));
    });

    test('en localhost no inventa ámbitos', () => {
      assert.deepEqual(ambitosDeBorrado('localhost'), ['']);
    });
  });

  describe('Qué cookies se consideran de Google', () => {
    test('las de Analytics y las de Ads', () => {
      for (const n of ['_ga', '_ga_ABC123', '_gid', '_gat', '_gac_x', '_gcl_au']) {
        assert.ok(esCookieDeGoogle(n), `${n} debería borrarse`);
      }
    });

    test('y nada más — no se tocan cookies ajenas', () => {
      for (const n of ['uf-consent', 'ga', '_gustavo', 'session', '__cf_bm']) {
        assert.ok(!esCookieDeGoogle(n), `${n} NO es de Google y no se toca`);
      }
    });
  });

  test('el HTML recibe estas MISMAS funciones, no una copia', () => {
    // La garantía de que no hay dos implementaciones: el componente inyecta
    // `fuenteInline()`, que es el toString() de las funciones de arriba. Si
    // alguien las cambia, cambian el test y el HTML a la vez.
    const fuente = fuenteInline();
    for (const nombre of ['planDeConsentimiento', 'ambitosDeBorrado', 'esCookieDeGoogle']) {
      assert.ok(fuente.includes(`function ${nombre}`), `${nombre} viaja al HTML`);
    }
    // Y lo que viaja tiene que ser JS que un navegador entienda: el fichero es
    // TypeScript, así que si un tipo sobreviviera al toString() se rompería el
    // script inline en los 7 dominios a la vez, sin que el build se queje.
    assert.doesNotThrow(() => new Function(fuente), 'la fuente inyectada parsea como JS');
  });
});

describe('Los mapas apuntan a la ficha de la tienda, no a una búsqueda', () => {
  // Agosto de 2026: el usuario reportó que el mapa no señalaba la tienda dentro
  // del centro comercial y que el botón abría Google Maps pero no la tienda.
  // Eran DOS fallos distintos, y la causa raíz de los dos era la misma: los
  // campos admitían cualquier URL. Un `/maps/search/` abre resultados; un
  // `?q=<dirección>` geocodifica un texto y pone el pin sobre el centro
  // comercial. Estos tests fijan la forma que sí apunta a la ficha.

  const conFicha = stores.filter((s) => s.googleMapsStatus !== 'sin-ficha-gbp');

  test('las tiendas con ficha traen las dos URLs y coordenadas', () => {
    assert.ok(conFicha.length > 0);
    for (const s of conFicha) {
      assert.ok(s.googleMapsEmbed, `${s.slug} sin embed`);
      assert.ok(s.googleMapsLink, `${s.slug} sin enlace`);
      assert.ok(s.geo, `${s.slug} sin geo`);
    }
  });

  test('el embed y el botón apuntan al MISMO CID', () => {
    // Es la regla que habría cazado el fallo de lasrosas sola: sus dos campos
    // se desmentían entre sí, con el dato bueno ya presente en el repo.
    for (const s of conFicha) {
      const a = s.googleMapsEmbed.match(/\d{15,20}/)[0];
      const b = s.googleMapsLink.match(/\d{15,20}/)[0];
      assert.equal(a, b, `${s.slug}: el mapa y el botón llevan a fichas distintas`);
    }
  });

  test('ninguna URL es una búsqueda ni un enlace opaco', () => {
    for (const s of conFicha) {
      for (const url of [s.googleMapsEmbed, s.googleMapsLink]) {
        assert.ok(!url.includes('/maps/search/'), `${s.slug}: /maps/search/ abre resultados, no la ficha`);
        assert.ok(!url.includes('maps.app.goo.gl'), `${s.slug}: un enlace corto es opaco — nadie que lea el JSON sabe adónde apunta`);
        assert.ok(!/[?&]q=/.test(url), `${s.slug}: ?q= geocodifica un texto y el pin cae sobre el centro comercial`);
      }
    }
  });

  test('dos tiendas no comparten ficha', () => {
    const cids = conFicha.map((s) => s.googleMapsLink.match(/\d{15,20}/)[0]);
    assert.equal(new Set(cids).size, cids.length, 'un CID repetido es copy-paste entre sociedades distintas');
  });

  test('el geo tiene precisión de ficha, no de estimación a ojo', () => {
    // Cuatro tiendas tenían el geo a más de 1 km (marineda 1.871 m, vigo
    // 1.340 m, villanueva 1.291 m, alcobendas 1.003 m). Todas se escribieron
    // con 3-4 decimales; las dos buenas traían 6-7. Cinco decimales son ~1 m.
    for (const s of conFicha) {
      for (const eje of ['lat', 'lng']) {
        const dec = (String(s.geo[eje]).split('.')[1] ?? '').length;
        assert.ok(dec >= 5, `${s.slug}.geo.${eje} tiene ${dec} decimales: eso no sale de una ficha de Google`);
      }
    }
  });

  test('una tienda sin ficha lo declara, y no enlaza la del centro comercial', () => {
    // La tentación era usar el CID del centro comercial GranCasa. Comprobado el
    // 2026-08-25: ese CID devuelve "Gran Casa", con su teléfono y sus 25.602
    // reseñas, y cero menciones a USA Fitness. Sería publicar la tarjeta de
    // otro negocio en la web de este cliente.
    const CENTRO_GRANCASA = '13649349957894030431';
    for (const s of stores) {
      if (s.googleMapsStatus === 'sin-ficha-gbp') {
        assert.ok(!s.googleMapsEmbed && !s.googleMapsLink && !s.geo,
          `${s.slug} declara no tener ficha pero trae datos de mapa`);
      }
      const json = JSON.stringify(s);
      assert.ok(!json.includes(CENTRO_GRANCASA),
        `${s.slug} usa el CID del CENTRO COMERCIAL, no el de la tienda`);
    }
  });
});
