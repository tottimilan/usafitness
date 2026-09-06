/**
 * LA GUARDA DE stores.json
 *
 * `tests/smoke.test.mjs` comprueba lo que los dominios RESPONDEN.
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
import {
  SECTION_IDS,
  ORDEN_BASE,
  TEMPLATES,
  resolveSections,
  seccionesInvalidas,
  plantillasConSeccionesInvalidas,
  tokensToCss,
  PRIORIDADES,
  ordenDeSecciones,
  avisoDePrioridad,
} from '../src/data/templates.ts';
import {
  FUENTE_BASE,
  TOPE_PLANTILLA,
  fuentesDeLaPagina,
  pesoDePlantilla,
} from '../src/data/presupuesto.ts';
import { clasificar, resumirFlota, esProblema } from '../src/data/flota.ts';
import { planDeGaleria, orientacionDe, columnasPara } from '../src/data/galeria.ts';
import { anchosDe, srcsetDe, rutaVariante, sizesDe, sizesDeFoto } from '../src/data/imagen.ts';
import { fotosDe } from '../src/data/galeria-de-tiendas.ts';
import { cidDePlaceId, enlaceResena } from '../src/data/resenas.ts';

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
  test('todas las tiendas validan, y ninguna ha desaparecido', () => {
    // Este test decía `assert.equal(stores.length, 7)` y se rompió al añadir la
    // octava. Era una cifra escrita a mano en un proyecto que va camino de 58
    // tiendas: se habría roto 50 veces más, y cada rotura enseña a cambiar el
    // número sin mirar, que es como un test deja de servir.
    //
    // Lo que sí es invariante: el número puede SUBIR, nunca bajar. Una tienda
    // que desaparece de stores.json no la detecta nada más — el esquema valida
    // lo que hay, no lo que falta. Si el mínimo sube, se sube aquí a propósito.
    const MINIMO = 8;
    assert.ok(stores.length >= MINIMO,
      `hay ${stores.length} tiendas y el mínimo conocido es ${MINIMO}: ¿se ha borrado alguna?`);
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
    // build de todos los dominios el día que se pegue el ID recién creado.
    const t = valida();
    t.ga4Id = 'GT-ABC1234';
    assert.ok(esquemaTiendas.safeParse([t]).success);
  });

  test('una ruta de imagen sin barra inicial', () => {
    const t = valida();
    t.heroImage = 'photos/vigo/hero.webp'; // relativa: 404 en /aviso-legal
    rechaza([t], 'ruta absoluta');
  });

  test('un placeId que no es un Place ID de ficha', () => {
    const t = valida();
    t.placeId = 'https://maps.google.com/?cid=1192403823564073512';
    rechaza([t], 'place id');
  });

  test('un placeId que apunta a OTRA ficha (el del centro comercial, el clásico)', () => {
    // El caso real que la tentación pide: GranCasa no tiene ficha, el centro sí.
    // El formato es válido, así que el regex lo deja pasar; lo caza la
    // aritmética, que compara el CID de dentro con el del enlace.
    const t = valida();
    t.placeId = 'ChIJgUbEo8cfqokR5lP9_Wh_DaM'; // ficha de otro negocio
    rechaza([t], 'apunta a la ficha');
  });

  test('una fotoInterior que es de otra tienda', () => {
    // Pasa el formato y el fichero existe en disco: solo lo caza comparar con
    // la galería de ESTA tienda.
    const t = valida();
    t.fotoInterior = '/photos/lagoh/tienda-2.webp';
    rechaza([t], 'galleryimages');
  });

  test('una prioridad que no es una de las cuatro', () => {
    const t = valida();
    t.prioridad = 'productos';
    rechaza([t], 'prioridad');
  });

  test('prioridad y sections a la vez: dos fuentes de orden', () => {
    const t = valida();
    t.prioridad = 'socio';
    t.sections = ['hero', 'promotions'];
    rechaza([t], 'solo puede mandar una');
  });

  test('un rótulo que no cabe en el cartel', () => {
    const t = valida();
    t.rotulo = 'VILLANUEVA DE LA CAÑADA'; // cuatro palabras: más de dos líneas
    rechaza([t], 'dos líneas');
  });

  test('un rótulo en minúscula', () => {
    // El subset de Archivo que se descarga solo lleva mayúsculas: una minúscula
    // caería a la fuente del sistema en mitad del cartel y nadie lo vería hasta
    // la captura.
    const t = valida();
    t.rotulo = 'Villanueva';
    rechaza([t], 'mayúsculas');
  });

  test('un rótulo con salto de línea explícito sí vale', () => {
    const t = valida();
    t.rotulo = 'TORRE|CÁRDENAS';
    assert.ok(esquemaTiendas.safeParse([t]).success);
  });

  test('placeId en una tienda que declara no tener ficha', () => {
    const t = valida();
    delete t.geo;
    delete t.googleMapsEmbed;
    delete t.googleMapsLink;
    t.googleMapsStatus = 'sin-ficha-gbp';
    t.placeId = 'ChIJzU_NTwBtEg0RmABuXlayxbM';
    rechaza([t], 'placeid');
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
    // script inline en todos los dominios a la vez, sin que el build se queje.
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


describe('Las redes sociales que se publican son de ESA tienda', () => {
  // `social.instagram` no solo pinta un icono: alimenta el `sameAs` de
  // Schema.org en Landing.astro, o sea que le DECLARA A GOOGLE que ese negocio
  // es dueño de esa cuenta. Publicar el handle equivocado es una afirmación
  // falsa sobre una empresa real y manda los clientes de un franquiciado a la
  // cuenta de otro.
  //
  // Cada handle se verificó leyendo el og:title real de Instagram, no
  // deduciéndolo del patrón. Es la misma disciplina que se instauró tras el bug
  // de los mapas: no se publica un identificador que no se haya comprobado.

  const conIg = stores.filter((s) => s.social?.instagram);

  test('el formato es una URL de perfil, no una búsqueda ni un enlace suelto', () => {
    for (const s of conIg) {
      assert.match(s.social.instagram, /^https:\/\/www\.instagram\.com\/[A-Za-z0-9._]+\/$/,
        `${s.slug}: debe ser https://www.instagram.com/<handle>/`);
    }
  });

  test('dos tiendas no comparten cuenta', () => {
    // Sociedades distintas no pueden declararle a Google que son dueñas del
    // mismo perfil. Un duplicado aquí es copy-paste.
    const urls = conIg.map((s) => s.social.instagram.toLowerCase());
    assert.equal(new Set(urls).size, urls.length, 'hay una cuenta de Instagram repetida entre tiendas');
  });

  test('el handle no es el de otra tienda de la lista', () => {
    // Guarda contra el error más fácil: pegar el de Vigo en Marineda. Se
    // comprueba que el handle de cada una no aparezca en el `social` de otra.
    for (const a of conIg) {
      const handleA = a.social.instagram.split('/').filter(Boolean).pop();
      for (const b of conIg) {
        if (b.slug === a.slug) continue;
        const handleB = b.social.instagram.split('/').filter(Boolean).pop();
        assert.notEqual(handleA, handleB, `${a.slug} y ${b.slug} comparten el handle ${handleA}`);
      }
    }
  });

  test('una tienda sin cuenta no publica sameAs ni sección', () => {
    // Es lo correcto: mejor sin sección que enlazando la cuenta que más se
    // parezca. Las Rosas y El Arcángel están así a propósito.
    for (const s of stores) {
      if (s.social?.instagram) continue;
      assert.ok(!s.social || Object.values(s.social).every((v) => !v),
        `${s.slug} tiene un objeto social sin contenido útil`);
    }
  });
});

describe('No se enlaza la cuenta de marca desde ninguna tienda', () => {
  // Regla del usuario (2026-08-26). Tiene además fundamento técnico:
  // `social.*` alimenta el `sameAs` de Schema.org, que declara de QUIÉN ES la
  // cuenta. Poner la corporativa en la ficha de una tienda le diría a Google
  // que esa sociedad es dueña del perfil de la cadena — son entidades
  // distintas — y mandaría el tráfico que paga cada franquiciado a una cuenta
  // que no es suya.
  //
  // Es fácil heredar la confusión: los directorios de varios centros
  // comerciales enlazan @usafitnessoficial en vez de la cuenta de la tienda.
  const MARCA = ['usafitnessoficial', 'comunidadusafitness'];

  test('ninguna tienda enlaza una cuenta corporativa', () => {
    for (const s of stores) {
      for (const [red, url] of Object.entries(s.social ?? {})) {
        if (!url) continue;
        for (const m of MARCA) {
          assert.ok(!url.toLowerCase().includes(m),
            `${s.slug}.social.${red} enlaza ${m}, que es de la marca y no de esta tienda`);
        }
      }
    }
  });

  test('las 7 tiendas tienen su propia cuenta de Instagram', () => {
    // Se llegó aquí en dos tandas: 5 el 2026-08-26 y las 2 últimas cuando se
    // descubrió que el patrón de la cadena usa PUNTOS (usafitness_c.c.<sitio>),
    // que no se había probado. Si alguna desaparece, que se note.
    for (const s of stores) {
      assert.ok(s.social?.instagram, `${s.slug} se ha quedado sin Instagram`);
    }
  });
});

describe('Estado de la flota: qué sirve de verdad cada dominio', () => {
  // Los dos primeros tests son los dos fallos REALES del 2026-08-26, congelados
  // como casos. Se descubrieron a mano con `curl`; existen aquí para que la
  // próxima vez los descubra una máquina.

  const sonda = (extra) => ({
    slug: 'vigo',
    dominio: 'usafitnessvigo.com',
    resuelveDns: true,
    codigo: 200,
    cuerpo: null,
    ...extra,
  });

  const salud = (extra) =>
    JSON.stringify({
      ok: true,
      tienda: 'vigo',
      tiendas: 8,
      dominios: 16,
      midiendo: false,
      midiendoFlota: 0,
      sha: '36dcae879b246bb07c0fc8262b578691e95beb1d',
      uptime: 392,
      ...extra,
    });

  test('caso real: Las Rosas — el nombre no resuelve', () => {
    const d = clasificar(sonda({ slug: 'lasrosas', dominio: 'usafitnesslasrosas.com', resuelveDns: false, codigo: null }));
    assert.equal(d.estado, 'sin-dns');
    assert.match(d.detalle, /Cloudflare/, 'el detalle debe decir dónde mirar, no solo que falla');
  });

  test('caso real: Lagoh — 200 impecable sirviendo el WordPress anterior', () => {
    // Este es el que importa. El código HTTP es 200 y el dominio "funciona":
    // cualquier monitor que mire solo el status da esta tienda por buena.
    const d = clasificar(
      sonda({
        slug: 'lagoh',
        dominio: 'usafitnesslagoh.com',
        codigo: 200,
        cuerpo: '<body class="home wp-singular page-template-default wp-theme-hello-elementor">',
      })
    );
    assert.equal(d.estado, 'otro-sistema');
    assert.match(d.detalle, /WordPress/, 'debe nombrar QUÉ hay ahí: "desconocido" no es accionable');
    assert.match(d.detalle, /DNS/, 'y decir que el arreglo está en el DNS');
  });

  test('el peor caso de todos: nuestro código sirviendo la tienda equivocada', () => {
    // 200, contenido nuestro, y una sociedad publicando el NIF de otra. Ningún
    // ping lo detecta y la portada parece perfecta.
    const d = clasificar(sonda({ slug: 'vigo', cuerpo: salud({ tienda: 'grancasa' }) }));
    assert.equal(d.estado, 'enrutado-roto');
    assert.match(d.detalle, /grancasa/);
    assert.match(d.detalle, /vigo/);
  });

  test('un host que no reconoce la tienda tampoco pasa por bueno', () => {
    const d = clasificar(sonda({ cuerpo: salud({ tienda: null }) }));
    assert.equal(d.estado, 'enrutado-roto');
    assert.match(d.detalle, /ninguna tienda/);
  });

  test('ok:false se distingue de todo lo demás', () => {
    const d = clasificar(sonda({ codigo: 503, cuerpo: salud({ ok: false }) }));
    assert.equal(d.estado, 'degradada');
    assert.equal(d.sha, '36dcae879b246bb07c0fc8262b578691e95beb1d', 'el SHA sigue siendo útil en una respuesta degradada');
  });

  test('una tienda sana es «servida» y trae su SHA', () => {
    const d = clasificar(sonda({ cuerpo: salud() }));
    assert.equal(d.estado, 'servida');
    assert.equal(d.sha, '36dcae879b246bb07c0fc8262b578691e95beb1d');
    assert.equal(esProblema('servida'), false);
  });

  test('un JSON ajeno no se confunde con el nuestro', () => {
    // Muchos paneles de hosting devuelven JSON en /health. Si bastara con que
    // parsee, cualquiera de ellos pasaría por nuestro sistema.
    for (const impostor of [
      '{"status":"ok"}',
      '{"ok":true}',
      '{"ok":true,"tiendas":8}',
      '{"ok":"true","tiendas":8,"dominios":16}',
      'no soy JSON',
      '<html><body>404</body></html>',
    ]) {
      const d = clasificar(sonda({ cuerpo: impostor }));
      assert.notEqual(d.estado, 'servida', `"${impostor.slice(0, 30)}" no puede pasar por nuestro /health`);
    }
  });

  test('el resumen separa lo servido de lo que exige actuar', () => {
    const diags = [
      clasificar(sonda({ slug: 'vigo', cuerpo: salud() })),
      clasificar(sonda({ slug: 'grancasa', cuerpo: salud({ tienda: 'grancasa' }) })),
      clasificar(sonda({ slug: 'lasrosas', resuelveDns: false, codigo: null })),
      clasificar(sonda({ slug: 'lagoh', cuerpo: '<body class="wp-singular">' })),
    ];
    const r = resumirFlota(diags);

    assert.equal(r.total, 4);
    assert.equal(r.servidas, 2);
    assert.deepEqual(
      r.problemas.map((p) => p.slug).sort(),
      ['lagoh', 'lasrosas'],
      'los problemas son exactamente los dos que exigen actuar'
    );
    assert.equal(r.shas.length, 1, 'un solo servicio sirve todo: un solo SHA');
  });

  test('dos SHAs distintos entre dominios servidos es una señal, no ruido', () => {
    const diags = [
      clasificar(sonda({ slug: 'vigo', cuerpo: salud() })),
      clasificar(sonda({ slug: 'grancasa', cuerpo: salud({ tienda: 'grancasa', sha: 'otro-sha-distinto-000000' }) })),
    ];
    assert.equal(resumirFlota(diags).shas.length, 2, 'un solo servicio no puede servir dos builds a la vez');
  });
});

describe('Identificar QUÉ hay al otro lado cuando no es lo nuestro', () => {
  // El caso real: /health devuelve 404 en un WordPress, y ese 404 NO lleva las
  // huellas de WordPress (comprobado contra usafitnesslagoh.com y
  // usafitnessvillanueva.com el 2026-08-26). La huella está en la portada.
  //
  // Importa porque "responde 404 y no es nuestro" no dice qué hacer, mientras
  // que "lo sirve WordPress: el DNS apunta a otro sitio" sí.

  const base = { slug: 'lagoh', dominio: 'usafitnesslagoh.com', resuelveDns: true, cuerpo: null, cuerpoPortada: null };

  test('un 404 en /health con la portada en WordPress se identifica igual', () => {
    const d = clasificar({
      ...base,
      codigo: 404,
      cuerpo: '<html><head><title>Not Found</title></head><body>404</body></html>',
      cuerpoPortada: '<body class="home wp-singular wp-theme-hello-elementor">',
    });
    assert.equal(d.estado, 'otro-sistema');
    assert.match(d.detalle, /WordPress/, 'la huella está en la portada, no en el 404');
    assert.match(d.detalle, /DNS/);
  });

  test('sin portada sondeada, no se inventa el sistema', () => {
    const d = clasificar({ ...base, codigo: 404, cuerpo: '404' });
    assert.equal(d.estado, 'otro-sistema');
    assert.doesNotMatch(d.detalle, /WordPress|Next\.js|Shopify|Wix/, 'no puede nombrar un sistema que no ha visto');
  });

  test('la portada solo desempata: si /health ya es nuestro, manda /health', () => {
    // Una portada con restos de WordPress (una imagen servida desde el dominio
    // viejo, por ejemplo) no puede degradar una tienda que /health confirma.
    const d = clasificar({
      ...base,
      slug: 'vigo',
      codigo: 200,
      cuerpo: JSON.stringify({ ok: true, tienda: 'vigo', tiendas: 8, dominios: 16, sha: 'abc123' }),
      cuerpoPortada: '<body class="wp-singular">',
    });
    assert.equal(d.estado, 'servida');
  });
});

describe('La huella de WordPress tiene que aparecer PRONTO', () => {
  // El sondeo corta el cuerpo a 4000 caracteres para no descargar portadas
  // enteras de webs de clientes. Medido el 2026-08-26 contra
  // usafitnessvillanueva.com: su primer `wp-content` está en el byte 13036, o
  // sea fuera del corte. En los primeros 4000 solo aparece `/wp-`, y aparece
  // también en usafitnesslagoh.com. Por eso la huella es esa.
  test('`/wp-json` en la cabecera basta para identificarlo', () => {
    const d = clasificar({
      slug: 'villanueva',
      dominio: 'usafitnessvillanueva.com',
      resuelveDns: true,
      codigo: 404,
      cuerpo: '404',
      cuerpoPortada: '<link rel="https://api.w.org/" href="https://usafitnessvillanueva.com/wp-json/" />',
    });
    assert.equal(d.estado, 'otro-sistema');
    assert.match(d.detalle, /WordPress/);
  });
});

describe('El DNS hay que preguntárselo a internet, no a tu router', () => {
  // ESTE BLOQUE EXISTE POR UN FALLO DE ESTA MISMA HERRAMIENTA.
  //
  // La primera versión de `estado-flota.mjs` resolvía con `dns.lookup()`, que
  // usa el resolvedor del sistema. El 2026-08-26, `usafitnesslagoh.com` estaba
  // caído para todo internet —SERVFAIL en 8.8.8.8 y en 1.1.1.1— y esta máquina
  // lo seguía resolviendo a 185.45.73.103 desde una caché rancia. La
  // herramienta informó "responde 404, lo sirve WordPress" cuando la verdad era
  // "no existe para nadie". Diagnóstico equivocado, y encima tranquilizador.
  //
  // Preguntar al resolvedor local es justo lo que no sirve: durante una
  // migración, tu máquina es la que peor informada está.

  const base = { slug: 'lagoh', dominio: 'usafitnesslagoh.com', codigo: null, cuerpo: null };

  test('si ningún resolvedor público lo ve, está caído aunque tu PC lo resuelva', () => {
    const d = clasificar({ ...base, resuelveDns: false });
    assert.equal(d.estado, 'sin-dns');
  });

  test('resolvedores públicos que no coinciden es propagación, no caída', () => {
    // Estado REAL y esperable justo cuando se usa esto: en mitad de un cambio
    // de nameservers unos resolvedores ya tienen el dato y otros no. Informar
    // "caído" aquí sería alarmar por algo que se arregla solo en minutos.
    const d = clasificar({ ...base, resuelveDns: true, dnsDiscrepante: true });
    assert.equal(d.estado, 'dns-propagando');
    assert.match(d.detalle, /propag/i);
    assert.equal(esProblema('dns-propagando'), true, 'no es normal: hay que volver a mirarlo');
  });

  test('la discrepancia manda sobre lo que devuelva el HTTP', () => {
    // Si media internet no te ve, que TU petición HTTP funcione no significa
    // nada: la estás haciendo desde el lado que sí resuelve.
    const d = clasificar({
      ...base,
      resuelveDns: true,
      dnsDiscrepante: true,
      codigo: 200,
      cuerpo: JSON.stringify({ ok: true, tienda: 'lagoh', tiendas: 8, dominios: 16, sha: 'abc' }),
    });
    assert.equal(d.estado, 'dns-propagando');
  });

  test('sin discrepancia, todo sigue como antes', () => {
    const d = clasificar({
      ...base,
      slug: 'vigo',
      resuelveDns: true,
      dnsDiscrepante: false,
      codigo: 200,
      cuerpo: JSON.stringify({ ok: true, tienda: 'vigo', tiendas: 8, dominios: 16, sha: 'abc' }),
    });
    assert.equal(d.estado, 'servida');
  });
});

describe('La galería se coloca según la foto, no al revés', () => {
  const h = (n = 1) => ({ src: `h${n}.webp`, ancho: 1400, alto: 1050 }); // 4:3
  const v = (n = 1) => ({ src: `v${n}.webp`, ancho: 382, alto: 510 }); // 3:4, las de Lagoh
  const movil = (n = 1) => ({ src: `m${n}.webp`, ancho: 576, alto: 1024 }); // 9:16, las de Vigo
  const lote = (f, n) => Array.from({ length: n }, (_, i) => f(i + 1));

  test('orientación: el margen no confunde una 4:3 con una cuadrada', () => {
    assert.equal(orientacionDe(h()), 'horizontal');
    assert.equal(orientacionDe(v()), 'vertical');
    assert.equal(orientacionDe({ src: 'a', ancho: 500, alto: 500 }), 'cuadrada');
    // 2%: es una cuadrada con el redondeo de la conversión a WebP.
    assert.equal(orientacionDe({ src: 'a', ancho: 510, alto: 500 }), 'cuadrada');
    // 10%: ya es una decisión, no un redondeo.
    assert.equal(orientacionDe({ src: 'a', ancho: 550, alto: 500 }), 'horizontal');
  });

  test('NINGUNA foto se recorta: cada una lleva su propia proporción', () => {
    // Es la razón de ser del módulo. Antes, `aspect-ratio: 4/3` fijo más
    // `object-fit: cover` se comía el 44% del alto de las verticales de Lagoh.
    const p = planDeGaleria([...lote(h, 2), ...lote(v, 2), movil()]);
    assert.deepEqual(
      p.fotos.map((f) => f.proporcion),
      ['1400 / 1050', '1400 / 1050', '382 / 510', '382 / 510', '576 / 1024'],
      'la proporción de cada celda tiene que ser la de SU foto'
    );
  });

  test('basta UNA vertical para pasar a 3 columnas', () => {
    // Y no que sean mayoría. A 2 columnas la celda mide 442px, así que una 3:4
    // sale de 589px de alto y una 9:16 de 786: se comen la pantalla.
    //
    // Es el caso real de 4 de las 8 tiendas, que mezclan orientaciones —
    // villanueva y marineda exactamente a la mitad, 3 y 3.
    assert.equal(columnasPara(lote(h, 6)), 2, 'todas horizontales: 2 columnas');
    assert.equal(columnasPara([...lote(h, 5), v()]), 3, 'una sola vertical ya obliga a 3');
    assert.equal(columnasPara(lote(v, 3)), 3);
    assert.equal(columnasPara([h(), ...lote(movil, 3)]), 3, 'las 9:16 de vigo, con más razón');
  });

  test('con pocas fotos no se inventan columnas vacías', () => {
    assert.equal(columnasPara([v()]), 1);
    assert.equal(columnasPara([v(1), v(2)]), 2);
    assert.equal(columnasPara([]), 1, 'sin fotos no se divide por cero');
  });

  test('las tres verticales de Lagoh caben en su fila sin ampliarse', () => {
    // El número que motivó todo esto: 382px de foto en una celda de 442px.
    const p = planDeGaleria(lote(v, 3));
    for (const foto of p.filas[0].fotos) {
      const ancho = Math.min(p.filas[0].alto, p.filas[0].tope) * foto.ratio;
      assert.ok(ancho <= 382, `el hueco mide ${Math.round(ancho)}px y la foto 382px`);
    }
    assert.deepEqual(p.avisos, [], 'y por tanto no debe avisar de nada');
  });

  test('el flag galleryFeatured se respeta: es una decisión editorial', () => {
    assert.equal(planDeGaleria(lote(h, 4)).destacarPrimera, false);
    assert.equal(planDeGaleria(lote(h, 4), { destacadaForzada: true }).destacarPrimera, true);
  });

  test('con una sola foto, destacarla no significa nada', () => {
    // Cruzar «todas las columnas» cuando solo hay una es una operación vacía, y
    // dejarla activa complica el CSS sin cambiar un píxel.
    assert.equal(planDeGaleria([h()], { destacadaForzada: true }).destacarPrimera, false);
  });

  test('una foto demasiado pequeña para su columna AVISA', () => {
    // Es lo único que separa "se ve regular" de "hay que pedir fotos mejores",
    // y esa frase no se le ocurre a nadie mirando la pantalla.
    const p = planDeGaleria([
      { src: 'mini.webp', ancho: 120, alto: 160 },
      { src: 'mini2.webp', ancho: 120, alto: 160 },
      { src: 'mini3.webp', ancho: 120, alto: 160 },
    ]);
    assert.equal(p.avisos.length, 3);
    assert.match(p.avisos[0], /120px/);
    assert.match(p.avisos[0], /ampliada/);
  });

  test('a la destacada se le exige el ancho entero, no el de una columna', () => {
    const p = planDeGaleria([{ src: 'porta.webp', ancho: 500, alto: 375 }, ...lote(h, 3)], {
      destacadaForzada: true,
    });
    assert.ok(
      p.avisos.some((a) => a.includes('porta.webp')),
      'una foto de 500px cruzando una fila de 900px tiene que avisar'
    );
    assert.equal(p.avisos.length, 1, 'y las demás, que sí llenan su columna, no');
  });
});

describe('Cada pantalla se lleva el tamaño de foto que necesita', () => {
  // Hoy cada dominio sirve el original a todo el mundo. En GranCasa son 1770 KB
  // de imágenes para llenar columnas de 289 px. Medido: servir 600 px baja esa
  // página a 542 KB, un 69% menos, sin que se note.

  const grande = { src: '/photos/vigo/tienda-1.webp', ancho: 1400, alto: 1050 };
  const pequena = { src: '/photos/lagoh/tienda-1.webp', ancho: 382, alto: 510 };

  test('nunca se genera una variante MÁS GRANDE que el original', () => {
    // Ampliar una foto no añade un solo píxel de información y sí peso. Es el
    // error que ya cometía la galería antes de medir: estiraba los 382px de
    // Lagoh hasta 442.
    assert.deepEqual(anchosDe(grande), [400, 600, 900]);
    assert.deepEqual(anchosDe(pequena), [], 'una foto de 382px no tiene variantes que generar');
    assert.deepEqual(anchosDe({ src: 'x', ancho: 700, alto: 500 }), [400, 600]);
  });

  test('el srcset acaba SIEMPRE en el original, con su ancho real', () => {
    // El original es la mejor copia que existe: volver a codificarla solo puede
    // empeorarla, así que entra tal cual.
    const s = srcsetDe(grande);
    assert.match(s, /\/photos\/vigo\/tienda-1\.webp 1400w$/);
    assert.equal(s.split(', ').length, 4, '3 variantes + el original');
  });

  test('una foto pequeña se sirve sola, sin variantes inútiles', () => {
    assert.equal(srcsetDe(pequena), '/photos/lagoh/tienda-1.webp 382w');
  });

  test('las variantes van bajo /_img/ y no junto al original', () => {
    // Así `public/photos` sigue conteniendo solo lo que subió un humano, y las
    // generadas se pueden borrar enteras sin mirar qué había dentro.
    assert.equal(rutaVariante('/photos/vigo/tienda-1.webp', 600), '/_img/photos/vigo/tienda-1-600.webp');
    assert.equal(rutaVariante('/photos/alcobendas/tienda-1.jpg', 400), '/_img/photos/alcobendas/tienda-1-400.webp');
  });

  test('/_img/ son ficheros reales, así que no pisan la trampa del middleware', async () => {
    // `astro:assets` habría añadido el endpoint /_image, que SÍ pasa por el
    // middleware: sin meterlo en RAIZ_COMPARTIDA se reescribiría a
    // /<slug>/_image y todas las imágenes darían 404 en los 8 dominios a la vez.
    // Pregenerar lo evita por construcción, no por acordarse de una lista.
    const mw = await import('node:fs').then((fs) =>
      fs.readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8')
    );
    assert.ok(
      mw.includes('_image'),
      'el aviso sobre /_image tiene que seguir en el middleware para quien venga después'
    );
    assert.ok(!rutaVariante('/photos/x.webp', 400).startsWith('/_image'), 'y no usamos esa ruta');
  });

  test('sizes describe las tres franjas que tiene el CSS de la galería', () => {
    const tres = sizesDe(3);
    assert.match(tres, /\(max-width: 640px\) 100vw/, 'móvil: una columna a ancho completo');
    assert.match(tres, /calc\(100vw \/ 3\)/, 'entre 640 y 932 manda el viewport');
    assert.match(tres, /289px$/, 'y a partir de ahí la columna es fija');

    assert.match(sizesDe(2), /442px$/, '2 columnas dan celdas de 442px');
  });

  test('la foto destacada declara que cruza todo el ancho', () => {
    // Si declarara el ancho de una columna, el navegador se traería una
    // variante pequeña y la estiraría a 900px.
    assert.equal(sizesDe(3, true), '(max-width: 932px) 100vw, 900px');
  });
});

describe('Una vertical nunca se destaca a todo el ancho', () => {
  // El caso real que fija la regla: vigo tiene `galleryFeatured` y, al filtrar
  // el duplicado del hero, su primera foto pasa a ser una 9:16 de 574×1020.
  // Destacarla = pintarla a 900px de ancho → 1600px de alto, más alta que la
  // pantalla. El flag es una preferencia; la orientación es física.
  const h = { src: 'h.webp', ancho: 1400, alto: 1050 };
  const v = { src: 'v.webp', ancho: 574, alto: 1020 };

  test('con la primera horizontal, el flag manda', () => {
    const p = planDeGaleria([h, v, v], { destacadaForzada: true });
    assert.equal(p.destacarPrimera, true);
  });

  test('con la primera vertical, el flag se ignora', () => {
    const p = planDeGaleria([v, v, v], { destacadaForzada: true });
    assert.equal(p.destacarPrimera, false, 'una 9:16 a 900px de ancho mediría 1600px de alto');
  });
});

describe('Una sección nueva no puede caerse en silencio', () => {
  // El fallo que esto impide es concreto y ya estaba en el código: el filtro
  // de `resolveSections` validaba contra ORDEN_BASE —el orden histórico de
  // nueve— en vez de contra el vocabulario. Mientras ambas listas coincidían
  // no se notaba. En cuanto el vocabulario crece, una sección perfectamente
  // válida desaparecía sin un solo error, y la plantilla salía publicada con
  // las secciones de siempre y la pintura nueva.

  test('el filtro mira el vocabulario, no el orden histórico', () => {
    // Toda id declarada del vocabulario tiene que sobrevivir al filtro, esté
    // o no en ORDEN_BASE. Se comprueba una a una para que el día que se añada
    // «socio» u «hoy-en-tienda» este test lo cubra sin tocarlo.
    for (const id of SECTION_IDS) {
      const salida = resolveSections({ id: 'x', label: 'x', tokens: {}, sections: [id] });
      assert.deepEqual(
        salida,
        [{ id }],
        `la sección «${id}» se pierde al resolver, y no diría nada al publicarse`
      );
    }
  });

  test('el orden histórico es un subconjunto del vocabulario', () => {
    const vocabulario = new Set(SECTION_IDS);
    for (const ref of ORDEN_BASE) {
      const id = typeof ref === 'string' ? ref : ref.id;
      assert.ok(vocabulario.has(id), `ORDEN_BASE nombra «${id}», que no está en SECTION_IDS`);
    }
  });

  test('un id inventado en la plantilla se denuncia, no se ignora', () => {
    const rota = { id: 'rota', label: 'Rota', tokens: {}, sections: ['hero', 'seccion-que-no-existe'] };
    assert.deepEqual(seccionesInvalidas(rota), ['seccion-que-no-existe']);
    assert.equal(
      plantillasConSeccionesInvalidas({ rota }).length,
      1,
      'el build tiene que poder detectarlo antes de publicar'
    );
  });

  test('ninguna plantilla real nombra una sección que no existe', () => {
    assert.deepEqual(plantillasConSeccionesInvalidas(), []);
  });

  test('un id inventado en stores.json sigue siendo tolerado', () => {
    // La tolerancia es deliberada y NO se toca: una errata en el JSON de un
    // cliente no puede tumbar su web. Lo que cambia es de quién se tolera.
    const salida = resolveSections(
      { id: 'x', label: 'x', tokens: {}, sections: ['hero', 'social'] },
      ['hero', 'typo-del-cliente', 'social']
    );
    assert.deepEqual(salida, [{ id: 'hero' }, { id: 'social' }]);
  });
});

describe('El presupuesto de peso cuenta lo que se descarga de verdad', () => {
  const tamaños = { '/fonts/inter-latin.woff2': 47 * 1024, '/fonts/display.woff2': 22 * 1024 };
  const tamañoDe = (r) => tamaños[r] ?? 0;
  const comprimido = (t) => Math.round(t.length / 3); // gzip de mentira, determinista

  test('la fuente base cuenta salvo que la plantilla declare que no la usa', () => {
    assert.deepEqual(fuentesDeLaPagina({ id: 'a' }), [FUENTE_BASE]);
    assert.deepEqual(fuentesDeLaPagina({ id: 'b', fonts: ['/fonts/display.woff2'] }), [
      FUENTE_BASE,
      '/fonts/display.woff2',
    ]);
    assert.deepEqual(
      fuentesDeLaPagina({ id: 'c', fonts: ['/fonts/display.woff2'], usaFuenteBase: false }),
      ['/fonts/display.woff2'],
      'declarar que no se usa la base es lo único que quita su descarga'
    );
  });

  test('tres pesos de una display propia caben; cinco ficheros no', () => {
    const tres = Array(3).fill('/fonts/display.woff2');
    const cabe = pesoDePlantilla({ id: 'justa', fonts: tres }, tamañoDe, comprimido, '', '');
    assert.equal(cabe.fuentes, (47 + 22 * 3) * 1024);
    assert.equal(cabe.exceso, 0, '113 KB de fuentes tienen que caber: es una dirección viable');

    // Cinco ficheros es lo que pedía la propuesta de «Cartel» sin medir:
    // una display a dos pesos, una de texto a dos pesos y una monoespaciada.
    const cinco = Array(5).fill('/fonts/display.woff2');
    const gorda = pesoDePlantilla({ id: 'gorda', fonts: cinco }, tamañoDe, comprimido, '', '');
    assert.ok(gorda.exceso > 0, 'seis ficheros de fuente tienen que denunciarse');

    // Y la salida: declarar que no se usa la base devuelve el margen justo.
    const sinBase = pesoDePlantilla(
      { id: 'gorda', fonts: cinco, usaFuenteBase: false },
      tamañoDe,
      comprimido,
      '',
      ''
    );
    assert.equal(sinBase.exceso, 0, 'renunciar a Inter es lo que hace viable una cara propia');
  });

  test('las plantillas vivas caben en el tope, medidas de verdad', async () => {
    const fs = await import('node:fs');
    const zlib = await import('node:zlib');
    const cssGlobal = fs.readFileSync('src/styles/global.css', 'utf8');
    for (const t of Object.values(TEMPLATES)) {
      const peso = pesoDePlantilla(
        t,
        (r) => fs.statSync('public' + r).size,
        (s) => zlib.gzipSync(Buffer.from(s), { level: 9 }).length,
        tokensToCss(t) + (t.css ?? ''),
        cssGlobal
      );
      assert.equal(
        peso.exceso,
        0,
        `la plantilla «${t.id}» pesa ${Math.round(peso.total / 1024)} KB de fuentes y CSS, ` +
          `por encima del tope de ${TOPE_PLANTILLA / 1024} KB`
      );
    }
  });
});

describe('Ninguna galería deja un hueco al final de una columna', () => {
  // ESTE ES EL TEST QUE FALTABA. El reparto anterior era multicolumna, y en
  // `galeria.ts` quedó escrito que así los huecos desaparecían
  // «estructuralmente». Era falso: el hueco se mudaba al fondo de la columna
  // más corta. Medido en producción el 27-ago, a 900px de ancho:
  //
  //     villanueva 402px · marineda 402px · grancasa 972px
  //
  // Justo las tres tiendas que mezclan orientaciones. Se verificó que no se
  // recortaba ninguna foto —y era cierto— pero no que el resultado se viera
  // bien, que es lo que el dueño vio en diez segundos.

  const ANCHO = 900;
  const HUECO = 16;

  const h = (n = 1) => ({ src: `h${n}.webp`, ancho: 1400, alto: 1050 }); // 4:3
  const v = (n = 1) => ({ src: `v${n}.webp`, ancho: 382, alto: 510 }); // 3:4, las de Lagoh
  const movil = (n = 1) => ({ src: `m${n}.webp`, ancho: 576, alto: 1024 }); // 9:16, las de Vigo
  const lote = (f, n) => Array.from({ length: n }, (_, i) => f(i + 1));

  const anchoOcupado = (fila) => {
    const alto = Math.min(fila.alto, fila.tope);
    return (
      fila.fotos.reduce((a, f) => a + alto * f.ratio, 0) + (fila.fotos.length - 1) * HUECO
    );
  };

  test('toda fila llena el ancho exacto, salvo la que se centra a propósito', () => {
    const casos = [
      ['dos apaisadas y tres verticales (villanueva)', [h(1), h(2), v(3), v(4), v(5)]],
      ['una apaisada y cuatro verticales (grancasa)', [h(1), v(2), v(3), v(4), v(5)]],
      ['todas apaisadas (arcángel)', lote(h, 4)],
      ['todas verticales de móvil (vigo)', lote(movil, 3)],
      ['siete mezcladas', [h(1), v(2), h(3), v(4), v(5), h(6), v(7)]],
    ];
    for (const [nombre, fotos] of casos) {
      for (const fila of planDeGaleria(fotos).filas) {
        if (fila.centrada) continue;
        const ocupado = anchoOcupado(fila);
        assert.ok(
          Math.abs(ocupado - ANCHO) < 1,
          `${nombre}: una fila ocupa ${Math.round(ocupado)}px de los ${ANCHO} — eso es el hueco`
        );
      }
    }
  });

  test('todas las fotos de una fila salen al mismo alto, mezclen lo que mezclen', () => {
    // Es la aritmética que hace que la mezcla de orientaciones deje de importar:
    // ancho ∝ ratio y alto = ancho / ratio, o sea el mismo alto para todas.
    for (const fila of planDeGaleria([h(1), v(2), movil(3)]).filas) {
      const alto = Math.min(fila.alto, fila.tope);
      const altos = fila.fotos.map((f) => (alto * f.ratio) / f.ratio);
      assert.ok(
        Math.max(...altos) - Math.min(...altos) < 0.01,
        'dos fotos de la misma fila con alturas distintas dejarían un escalón'
      );
    }
  });

  test('ninguna fila sale más alta que su tope', () => {
    for (const fotos of [[v(1)], [v(1), v(2)], lote(movil, 2), [h(1)], lote(v, 5)]) {
      for (const fila of planDeGaleria(fotos).filas) {
        const real = fila.centrada ? fila.tope : fila.alto;
        assert.ok(real <= fila.tope + 0.01, `una fila de ${Math.round(real)}px se come la pantalla`);
      }
    }
  });

  test('el reparto usa todas las fotos, una vez y en orden', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 11]) {
      const fotos = Array.from({ length: n }, (_, i) => (i % 2 ? v(i) : h(i)));
      const planas = planDeGaleria(fotos).filas.flatMap((f) => f.fotos.map((x) => x.src));
      assert.deepEqual(
        planas,
        fotos.map((f) => f.src),
        `con ${n} fotos el reparto pierde, repite o desordena alguna`
      );
    }
  });

  test('la flota real, tienda por tienda: cero huecos', () => {
    // La prueba que de verdad importa, contra los datos de producción.
    for (const s of stores) {
      const fotos = fotosDe(s);
      if (!fotos.length) continue;
      for (const fila of planDeGaleria(fotos).filas) {
        if (fila.centrada) continue;
        const hueco = ANCHO - anchoOcupado(fila);
        assert.ok(Math.abs(hueco) < 1, `${s.slug}: una fila deja ${Math.round(hueco)}px sin llenar`);
      }
    }
  });

  test('destacar la primera la pone en su propia fila, y a todo el ancho', () => {
    const p = planDeGaleria([h(1), h(2), v(3), v(4)], { destacadaForzada: true });
    assert.equal(p.destacarPrimera, true);
    assert.equal(p.filas[0].fotos.length, 1, 'la destacada va sola en su fila');
    assert.equal(p.filas[0].fotos[0].src, 'h1.webp');
    assert.equal(
      p.filas[0].centrada,
      false,
      'y llena el ancho: con el tope normal se quedaba en 693px centrados, que es lo contrario de un plano general'
    );
    assert.ok(p.filas.length > 1, 'las demás se reparten aparte');
  });

  test('cada foto declara el ancho que de verdad ocupa en su fila', () => {
    // Con columnas todas declaraban lo mismo porque todas medían igual. En una
    // fila mixta, la apaisada ocupa casi el doble que la vertical: si el `sizes`
    // no lo dice, el navegador se baja una talla media que no le sirve a ninguna.
    const fila = planDeGaleria([h(1), v(2)]).filas[0];
    const [apaisada, vertical] = fila.fotos;
    assert.ok(apaisada.parte > vertical.parte * 1.5, 'la apaisada ocupa bastante más');
    assert.ok(Math.abs(apaisada.parte + vertical.parte - 1) < 0.001, 'y entre las dos, la fila entera');
    assert.match(sizesDeFoto(apaisada.parte), /\d+px$/);
  });
});

describe('El Place ID lleva dentro la ficha a la que dice apuntar', () => {
  // La forma de un Place ID de negocio es base64url de un protobuf:
  //   0a 12 09 <cellId LE64> 11 <CID LE64>
  // Descodificarlo convierte «¿este identificador es el de esta tienda?» en
  // aritmética, y no en un enlace roto que solo se ve pinchándolo. Es la misma
  // familia de guarda que FICHAS_PROHIBIDAS, que ya evitó una vez que
  // enlazáramos la ficha del centro comercial en la web de un cliente.
  test('los Place ID de la flota llevan el CID de su propia ficha', () => {
    const conPlaceId = stores.filter((t) => t.placeId);
    assert.ok(conPlaceId.length >= 7, `esperaba al menos 7 tiendas con placeId y hay ${conPlaceId.length}`);
    for (const t of conPlaceId) {
      const cidDelEnlace = t.googleMapsLink.match(/\d{15,20}/)[0];
      assert.equal(cidDePlaceId(t.placeId), cidDelEnlace, `${t.slug}: el placeId apunta a otra ficha`);
    }
  });

  test('el ejemplo oficial de Google se descodifica', () => {
    // developers.google.com/maps/documentation/places/web-service/place-id
    assert.equal(cidDePlaceId('ChIJgUbEo8cfqokR5lP9_Wh_DaM'), '11749187091794056166');
  });

  test('lo que no es un Place ID de ficha devuelve null', () => {
    assert.equal(cidDePlaceId('1192403823564073512'), null, 'un CID pelado no es un Place ID');
    assert.equal(
      cidDePlaceId('EicxMyBNYXJrZXQgU3QsIFdpbG1pbmd0b24sIE5DIDI4NDAxLCBVU0E'),
      null,
      'un Place ID de DIRECCIÓN no es de negocio'
    );
    assert.equal(cidDePlaceId('no-es-base64!'), null);
    assert.equal(cidDePlaceId(''), null);
  });

  test('el enlace de reseña se construye en un solo sitio y degrada', () => {
    const lagoh = stores.find((s) => s.slug === 'lagoh');
    assert.equal(
      enlaceResena(lagoh).href,
      'https://search.google.com/local/writereview?placeid=ChIJzU_NTwBtEg0RmABuXlayxbM'
    );
    assert.equal(enlaceResena(lagoh).etiqueta, 'Escribe tu reseña');
    assert.equal(enlaceResena(lagoh).tipo, 'formulario');

    // Sin placeId, la píldora no promete el formulario: lleva a la ficha.
    const sinPlaceId = { ...lagoh, placeId: undefined };
    assert.equal(enlaceResena(sinPlaceId).href, lagoh.googleMapsLink);
    assert.equal(enlaceResena(sinPlaceId).etiqueta, 'Ver en Google');
    assert.equal(enlaceResena(sinPlaceId).tipo, 'ficha');

    // Sin ficha no hay nada que enseñar: la pieza no se pinta y nunca se
    // anuncia el vacío.
    const grancasa = stores.find((s) => s.slug === 'grancasa');
    assert.equal(enlaceResena(grancasa), null);
  });
});

describe('La tienda elige UNA cosa y solo se mueve un bloque', () => {
  // Una plantilla de mentira: la de Rótulo llega con la plantilla. Lo que se
  // prueba aquí es el MECANISMO, no el diseño — y el mecanismo es el que el
  // dueño pidió: «no todas las tiendas tienen que seguir las mismas normas de
  // orden», pero sin abrir un editor de órdenes que nadie pueda probar.
  const conZona = {
    id: 'prueba',
    label: 'Prueba',
    tokens: {},
    sections: ['hero', 'promotions', 'products', 'reviews', 'schedule'],
    zonaMovil: {
      posicion: 1,
      defecto: 'promotions',
      mapa: { visita: 'schedule', oferta: 'promotions', socio: 'products', asesoramiento: 'reviews' },
    },
  };

  test('sin prioridad manda el orden de la plantilla', () => {
    const orden = ordenDeSecciones(conZona, {}).map((s) => s.id);
    assert.deepEqual(orden, ['hero', 'promotions', 'products', 'reviews', 'schedule']);
  });

  test('la prioridad intercambia UN bloque, y solo uno', () => {
    const orden = ordenDeSecciones(conZona, { prioridad: 'socio' }).map((s) => s.id);
    // products sube al hueco y promotions ocupa el que dejó: nada más se movió,
    // y el número de secciones no cambia.
    assert.deepEqual(orden, ['hero', 'products', 'promotions', 'reviews', 'schedule']);
  });

  test('es un intercambio, no una inserción: solo dos posiciones cambian', () => {
    // Con un bloque LEJANO del hueco (schedule está en la 4, el hueco es la 1).
    // Si esto fuera una inserción, products y reviews bajarían un puesto cada
    // uno y una sola elección de la tienda habría reordenado media página.
    // El caso adyacente no distingue las dos cosas: por eso hace falta este.
    const orden = ordenDeSecciones(conZona, { prioridad: 'visita' }).map((s) => s.id);
    assert.deepEqual(orden, ['hero', 'schedule', 'products', 'reviews', 'promotions']);
  });

  test('el primer bloque no se toca nunca, con ninguna prioridad', () => {
    // R1: el primer viewport es de la plantilla, no de la tienda.
    for (const p of PRIORIDADES) {
      assert.equal(ordenDeSecciones(conZona, { prioridad: p })[0].id, 'hero', `con ${p} el hero se movió`);
    }
  });

  test('la prioridad que apunta al ocupante por defecto no mueve nada', () => {
    const orden = ordenDeSecciones(conZona, { prioridad: 'oferta' }).map((s) => s.id);
    assert.deepEqual(orden, ['hero', 'promotions', 'products', 'reviews', 'schedule']);
  });

  test('si el bloque elegido no tiene dato, se queda el defecto y se avisa', () => {
    // Hoy es el caso NORMAL, no el raro: 8 de 8 tiendas están sin oferta viva.
    const sinReviews = (id) => id !== 'reviews';
    const orden = ordenDeSecciones(conZona, { prioridad: 'asesoramiento' }, sinReviews).map((s) => s.id);
    assert.deepEqual(orden, ['hero', 'promotions', 'products', 'reviews', 'schedule'], 'sin dato no se mueve nada');
    assert.match(
      avisoDePrioridad(conZona, { slug: 'x', prioridad: 'asesoramiento' }, sinReviews),
      /sin dato/
    );
  });

  test('sin prioridad no hay aviso, y con dato tampoco', () => {
    assert.equal(avisoDePrioridad(conZona, { slug: 'x' }, () => true), null);
    assert.equal(avisoDePrioridad(conZona, { slug: 'x', prioridad: 'socio' }, () => true), null);
  });

  test('una plantilla sin zona móvil ignora la prioridad', () => {
    const sinZona = { ...conZona, zonaMovil: undefined };
    const orden = ordenDeSecciones(sinZona, { prioridad: 'socio' }).map((s) => s.id);
    assert.deepEqual(orden, ['hero', 'promotions', 'products', 'reviews', 'schedule']);
    assert.equal(avisoDePrioridad(sinZona, { slug: 'x', prioridad: 'socio' }, () => true), null);
  });

  test('las plantillas vivas siguen sin zona móvil: nada cambia hoy', () => {
    // La garantía de que esta rodaja no toca ninguna de las ocho webs.
    for (const t of Object.values(TEMPLATES)) {
      const conPrioridad = ordenDeSecciones(t, { prioridad: 'socio' }).map((s) => s.id);
      const sinNada = ordenDeSecciones(t, {}).map((s) => s.id);
      assert.deepEqual(conPrioridad, sinNada, `«${t.id}» cambió de orden y no debería`);
    }
  });
});
