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
