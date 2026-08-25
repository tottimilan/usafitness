# Medición y observabilidad — Plan de implementación

**Date:** 2026-08-25
**Branch:** `feat/medicion-y-observabilidad`
**Author:** User + Claude Opus 5
**Status:** Done — las 6 tareas ejecutadas, PR #1 mezclado (`348150c`) y desplegado con la puerta de salud activa. Revisión formal: **No listo** → 2 críticos (alcance del consentimiento) corregidos en `d832181` → mezclado. Seguimiento de la revisión (I-3, I-4, P-1 y menores) en `feat/seguimiento-revision-pr1`.

## Goal

Que rellenar `ga4Id` sea seguro, y que una caída deje de descubrirse porque llama un franquiciado.

## Architecture

Astro 6 SSR sobre `@astrojs/node` standalone en Railway, con Cloudflare delante de los 7 dominios. Se toca la capa de consentimiento (`CookieConsent.astro`, el único sitio que carga un tercero), el `<head>` compartido (`Base.astro`), el esquema de datos (`stores.ts`) y se añade una ruta de servicio (`src/pages/health.ts`) que el middleware debe dejar pasar sin reescribir. **Cero dependencias nuevas**: `package.json` sigue con `astro` y `@astrojs/node`.

## Tech Stack tocado

Astro (rutas `APIRoute`, `is:inline`, middleware), gtag.js de GA4 con Consent Mode v2, `node:test`, Railway (`railway.json`). Nada de React, nada de Tailwind — ver la excepción de stack en `memory/07-decisions-log.md`.

---

## Por qué este plan existe, con la prueba delante

`ga4Id` está a 0 de 7 y el código de medición lleva escrito desde el commit `2800b67` sin haberse ejecutado nunca con un ID real. Se puso uno de prueba en Vigo, se compiló y se pidió la home:

```
script de gtag.js presente sin consentimiento:  1
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST12345X">
tamaño real de gtag.js:  416.812 bytes en crudo · 145.608 bytes comprimido
```

La home de Vigo pesa hoy **38.164 bytes**. El primer acto de esta slice —pegar un ID— añadiría **145 KB de Google en cada visita, antes de que el visitante toque el banner**, en dominios cuyo argumento de venta es la velocidad y el cero-terceros. Multiplica por casi cinco el peso de la página con un script que no es del sitio. Y el botón **Rechazar** no impediría esa petición: el tag ya se ha descargado.

No es un bug latente que convenga arreglar algún día. **Es el bug que activa la primera tarea de esta slice.** Por eso el orden del plan es: primero la puerta, después la llave.

---

## Success criteria (observables)

- [x] **C1** — Con `ga4Id` relleno, ningún `src`/`href` del HTML inicial apunta a Google; la petición solo ocurre tras Aceptar. ⚠ **El comando literal original (`grep -c googletagmanager` → 0) está MAL para este criterio**: con el arreglo funcionando devuelve **1**, porque la URL vive como cadena dentro del cargador diferido — quien audite con ese grep concluirá lo contrario de la verdad. La comprobación correcta es `pideRecursoDe` en `tests/smoke.test.mjs` (mención ≠ petición), o contar peticiones de red en el navegador, que se hizo.
- [x] **C2** — `npm test` afirma la ausencia de `googletagmanager` en las 7 tiendas **incondicionalmente**: poner un `ga4Id` de mentira en `stores.json` no debe silenciar ninguna aserción.
- [x] **C3** — `curl -s -H 'Host: usafitnessvigo.com' localhost:4321/health` devuelve 200 con `"tienda":"vigo"`; con un host desconocido, `"tienda":null`; y ninguna respuesta nombra a otra tienda.
- [x] **C4** — `/health` responde **503** si la tabla de dominios no tiene exactamente 2 entradas por tienda.
- [x] **C5** — `curl -s -H 'Host: usafitness.es' localhost:4321/vigo | grep -c google-site-verification` devuelve **0**; con `Host: usafitnessvigo.com` devuelve **1**.
- [x] **C6** — `grep -rn 'transport_type' src/` y `grep -rn 'define:vars' src/` devuelven ambos vacío.
- [x] **C7** — Un `ga4Id` con prefijo `GT-` valida; `UA-12345-1` sigue siendo rechazado.
- [x] **C8** — `railway.json` versionado con `healthcheckPath: "/health"`, y el sondeo de Railway (`Host: healthcheck.railway.app`) devuelve 200 comprobado en local antes de commitearlo.
- [x] **C9** — `npm run build && npm test` verde. 65 tests hoy → ~73.

---

## Files

| Acción | Ruta | Propósito |
|---|---|---|
| Modificar | `src/components/CookieConsent.astro:15-54` | gtag.js deja de descargarse hasta que el usuario acepta. Es el cambio central. |
| Modificar | `src/components/ConversionTracking.astro:66` | Borrar `transport_type: 'beacon'`: no existe en gtag de GA4 y viaja como parámetro personalizado. |
| Modificar | `src/layouts/Base.astro:76` | `google-site-verification` solo en el dominio propio de la tienda. |
| Modificar | `src/data/stores.ts:156` | Aceptar también IDs `GT-`, que es lo que entrega la interfaz de Google hoy. |
| Crear | `src/pages/health.ts` | Endpoint de diagnóstico y puerta de despliegue de Railway. |
| Modificar | `src/middleware.ts:44` | `/health` a `RAIZ_COMPARTIDA` para que no se reescriba por dominio. |
| Crear | `railway.json` | `healthcheckPath` versionado: un build que arranca y no sabe servir deja de recibir tráfico. |
| Modificar | `tests/smoke.test.mjs` | Desarmar el test que se apaga solo + guardas nuevas. |
| Modificar | `tests/datos.test.mjs` | `GT-` válido, `UA-` sigue rechazado. |

**Fuera de este plan, a propósito** (van en el siguiente): pegar los `ga4Id` reales, dar de alta las propiedades de GA4, los monitores de UptimeRobot y el triaje de `npm audit`. Este plan es **solo el código que hace que todo eso sea seguro**. Es la frontera natural: lo de aquí lo ejecuta un agente y lo verifica el CI; lo del otro son altas en paneles y decisiones tuyas.

---

## ⚠ Corrección del propio plan (2026-08-25, durante la ejecución)

El subagente de la Tarea 2 paró con **BLOCKED** y tenía razón: **este plan se contradecía consigo mismo.**

La aserción que la Tarea 1 mandaba escribir era `!html.includes('googletagmanager')`. Pero el código que la Tarea 2 manda escribir necesita la URL de gtag.js **como cadena dentro del cargador diferido** — es la única forma de tenerla sin descargarla. El test daba por **descargado** lo que solo estaba **escrito**, así que impedía escribir la solución correcta. No era un test estricto: era un test equivocado bloqueando el arreglo.

Es la **segunda vez** que este proyecto tropieza con lo mismo. La primera fue un comentario del CSS que nombraba `fonts.googleapis.com` y satisfacía su propia aserción. El comentario que lo explicaba estaba **tres líneas encima** de la aserción que escribí mal.

**Arreglado** vaciando el cuerpo de los `<script>` antes de buscar:

```js
const sinCuerposDeScript = (html) =>
  html.replace(/(<script[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');
```

Dentro de un script, `s.src = '…'` es una **asignación** que solo corre si alguien llama a la función. En la etiqueta de apertura, `src="…"` es una **descarga**. Se parecen tanto que el primer intento de arreglo también falló: el regex `src\s*=\s*…` casaba las dos.

Más una segunda aserción —la URL aparece exactamente una vez y **dentro** del cargador— para que sacarla de la función también se note.

**Y el límite que ningún test de cadenas puede cruzar:** esto no demuestra que no salga ninguna petición. Un `document.createElement('script')` ejecutado al cargar pasaría. Eso solo lo prueba el navegador contando peticiones, y se hizo (ver el cierre de T3).

---

## Task 1 — El test que se apaga solo

`tests/smoke.test.mjs:248` envuelve su única aserción en `if (!s.ga4Id)`. Hoy pasa porque ninguna tienda tiene ID. En cuanto se rellene el primero, esa condición se hace falsa para esa tienda y el test **deja de afirmar nada: no falla, enmudece**, con el nombre del bloque ya mintiendo. El guardián se apaga en el instante exacto en que empieza a hacer falta. Va primero para que todo lo demás tenga red.

**Ficheros:** `tests/smoke.test.mjs`

### Steps

- [ ] **1.1** — Ver el guardián apagarse. Poner un `ga4Id` de mentira y comprobar que el suite sigue verde pese a que el HTML carga Google.
  ```bash
  cp src/data/stores.json /tmp/stores.bak.json
  python -c "
  import json,io,collections
  p='src/data/stores.json'
  d=json.load(io.open(p,encoding='utf-8'),object_pairs_hook=collections.OrderedDict)
  for s in d['stores']:
      if s['slug']=='vigo': s['ga4Id']='G-TEST12345X'
  io.open(p,'w',encoding='utf-8',newline='\n').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')"
  npm run build && npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
  ```
  **Expected:** `pass 65, fail 0` — **verde con gtag.js cargando sin consentimiento.** Eso es el fallo.

- [ ] **1.2** — Quitar la condición. Sustituir las líneas 248-250 de `tests/smoke.test.mjs`:
  ```js
        // Incondicional a propósito. Estaba
        // envuelto en `if (!s.ga4Id)`, así que se desarmaba solo en cuanto una
        // tienda tuviera ID — justo cuando empieza a hacer falta. La política
        // elegida no es "sin ga4Id no se carga GA4": es "GA4 no se carga hasta
        // que el usuario acepta", y eso vale con ID y sin él.
        assert.ok(!pideRecursoDe(html, 'googletagmanager.com'), 'GA4 no se pide antes del consentimiento');
  ```
  **Run:** `npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"`
  **Expected:** **FAIL** en `vigo` — el test ya afirma algo y lo que afirma es falso.

- [ ] **1.3** — Restaurar los datos y confirmar que el rojo era del `ga4Id` de prueba, no del cambio.
  ```bash
  cp /tmp/stores.bak.json src/data/stores.json && npm run build && npm test 2>&1 | grep -E "^ℹ (pass|fail)"
  ```
  **Expected:** `pass 65, fail 0`.

- [ ] **1.4** — Commit.
  ```bash
  git add tests/smoke.test.mjs && git commit -m "test(medicion): desarmar el guardian que se apagaba al llegar el ga4Id"
  ```

---

## Task 2 — gtag.js detrás del consentimiento

El cambio central. Hoy `<script async src=gtag.js>` se emite siempre que hay `ga4Id`. Pasa a inyectarse solo al aceptar.

Se elige **Consent Mode básico** (no cargar el tag) sobre el avanzado (cargarlo y mandar pings sin cookies) por aritmética: el único premio del avanzado es el *behavioral modeling*, que Google condiciona a **1.000 usuarios diarios consentidos por propiedad** y modela cada propiedad por separado. Con una propiedad por tienda de barrio eso es inalcanzable por órdenes de magnitud. Se pagarían 145 KB por visita a cambio de nada.

**Ficheros:** `tests/smoke.test.mjs`, `src/components/CookieConsent.astro`

### Steps

- [ ] **2.1** — Test primero: con `ga4Id`, el HTML inicial no contiene gtag.js pero sí el arranque de Consent Mode. Añadir dentro del `describe('Nada de terceros antes del consentimiento')`:
  ```js
  test('con ga4Id, el tag sigue sin descargarse hasta que el usuario acepta', async () => {
    // Se prueba contra la tienda que tenga ID; si aún no hay ninguna, el test
    // se salta solo en vez de dar un verde que no significa nada.
    const s = stores.find((x) => x.ga4Id);
    if (!s) return;
    const html = (await get('/', s.domain)).text();
    assert.ok(!pideRecursoDe(html, 'googletagmanager.com'), 'ningún src/href apunta a Google al cargar');
    assert.ok(html.includes("gtag('consent', 'default'"), 'Consent Mode sí se declara desde el principio');
    assert.ok(html.includes(s.ga4Id), 'el id viaja en el HTML para poder cargarlo al aceptar');
  });
  ```
  **Run:** `npm test`
  **Expected:** PASS trivial (no hay ninguna tienda con ID todavía). El test se activa en el paso 2.3.

- [ ] **2.2** — Sustituir el bloque `{analitica && (…)}` de `src/components/CookieConsent.astro` (líneas 29-54) por:
  ```astro
  {analitica && (
    <script
      is:inline
      data-cfasync="false"
      set:html={`
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  // Todo denegado por defecto. Sin wait_for_update: ese parámetro hace esperar
  // medio segundo a un update que, en este montaje, se emite tres líneas más
  // abajo de forma síncrona o no se emite nunca. Solo penalizaba al visitante.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  // gtag.js NO se descarga aquí. Son 145 KB comprimidos de Google — casi cinco
  // veces el peso de la página entera — y descargarlos antes de que el visitante
  // toque el banner haría que "Rechazar" no impidiese la petición. Se inyecta
  // solo al aceptar, y una sola vez.
  window.ufCargarAnalitica = function () {
    if (window.__ufAnaliticaCargada) return;
    window.__ufAnaliticaCargada = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=${ga4Id}';
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', '${ga4Id}', { anonymize_ip: true });
  };

  // Visitante que ya aceptó en una visita anterior: no se le vuelve a preguntar.
  try {
    if (localStorage.getItem('uf-consent') === 'granted') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
      window.ufCargarAnalitica();
    }
  } catch (e) {}
  `}
    />
  )}
  ```
  Tres cosas que no son estilo:
  - **`set:html` y no `define:vars`**: `define:vars` es la superficie de la vulnerabilidad XSS abierta de Astro (`GHSA` en `npm audit`), y es su único uso en todo el repo. Se elimina de paso. El `ga4Id` interpolado está validado por Zod contra `^(G|GT)-[A-Z0-9]+$`, así que no admite comillas ni `<`.
  - **`data-cfasync="false"`**: si alguna zona de Cloudflare tiene Rocket Loader activo, reescribe los `<script>` y no garantiza el orden — el shim de `gtag` podría no existir cuando el banner lo llame. Este atributo lo excluye. Es barato y evita un fallo que solo se daría en producción.
  - **Los cuatro parámetros en el `update`**, no solo `analytics_storage`: desde marzo de 2024 Consent Mode v2 exige `ad_user_data` y `ad_personalization`, y son justo los que harán falta cuando lleguen las campañas.

- [ ] **2.3** — Verificar contra un ID de prueba que ahora sí falla lo que debe.
  ```bash
  cp src/data/stores.json /tmp/stores.bak.json
  python -c "
  import json,io,collections
  p='src/data/stores.json'
  d=json.load(io.open(p,encoding='utf-8'),object_pairs_hook=collections.OrderedDict)
  for s in d['stores']:
      if s['slug']=='vigo': s['ga4Id']='G-TEST12345X'
  io.open(p,'w',encoding='utf-8',newline='\n').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')"
  npm run build && npm test 2>&1 | grep -E "^ℹ (pass|fail)"
  ```
  **Expected:** `pass 66, fail 0` — con ID y sin gtag.js en la carga inicial. Comprobación directa:
  ```bash
  (node dist/server/entry.mjs &) && sleep 2
  curl -s -H 'Host: usafitnessvigo.com' localhost:4321/ | grep -c googletagmanager   # 0
  curl -s -H 'Host: usafitnessvigo.com' localhost:4321/ | grep -c ufCargarAnalitica  # 2
  ```

- [ ] **2.4** — Restaurar y commitear.
  ```bash
  cp /tmp/stores.bak.json src/data/stores.json && npm run build && npm test
  git add src/components/CookieConsent.astro tests/smoke.test.mjs
  git commit -m "fix(consentimiento): gtag.js deja de descargarse antes de que el usuario acepte"
  ```

---

## Task 3 — Que Aceptar cargue, y Rechazar siga rechazando

El IIFE del banner llama a `gtag('consent','update')` pero nadie inyecta el tag. Sin este paso, aceptar no mide nada.

**Ficheros:** `src/components/CookieConsent.astro:80-88`

### Steps

- [ ] **3.1** — Sustituir el cuerpo de `decide()`:
  ```js
          function decide(value) {
            try { localStorage.setItem(KEY, value); } catch (e) {}
            banner.hidden = true;
            var concedido = value === 'granted';
            if (window.gtag) {
              // En los dos sentidos: retirar el consentimiento tiene que revocar
              // de verdad, no solo dejar de conceder (RGPD art. 7.3).
              window.gtag('consent', 'update', {
                ad_storage: concedido ? 'granted' : 'denied',
                ad_user_data: concedido ? 'granted' : 'denied',
                ad_personalization: concedido ? 'granted' : 'denied',
                analytics_storage: concedido ? 'granted' : 'denied'
              });
            }
            // La descarga del tag ocurre AQUÍ y no antes. `ufCargarAnalitica` no
            // existe en una tienda sin ga4Id, de ahí la comprobación.
            if (concedido && window.ufCargarAnalitica) { window.ufCargarAnalitica(); }
          }
  ```
  **Run:** `npm run build && npm test`
  **Expected:** PASS, 66.

- [ ] **3.2** — Verificar el comportamiento en navegador, que es lo único que prueba de verdad que el clic funciona.
  **Run:** `npm run dev`, abrir `http://localhost:4321/vigo` con un `ga4Id` de prueba puesto, DevTools → Red, filtro `googletagmanager`.
  **Expected:** 0 peticiones al cargar · 1 tras pulsar **Aceptar** · 0 nuevas tras pulsar **Rechazar** y recargar.

- [ ] **3.3** — Commit.
  ```bash
  git add src/components/CookieConsent.astro
  git commit -m "feat(consentimiento): aceptar carga el tag; rechazar sigue sin cargarlo"
  ```

---

## Task 4 — Tres correcciones de una línea

Independientes entre sí y del resto. Van juntas porque ninguna llega a 2 minutos.

**Ficheros:** `src/components/ConversionTracking.astro`, `src/layouts/Base.astro`, `src/data/stores.ts`, `tests/smoke.test.mjs`, `tests/datos.test.mjs`

### Steps

- [ ] **4.1** — Test del token de Search Console. Añadir al `describe('Los hosts no canónicos no compiten en Google')`:
  ```js
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
  ```
  **Run:** `npm test` → PASS trivial (ninguna tienda tiene token todavía).

- [ ] **4.2** — `src/layouts/Base.astro:76`, envolver en la variable que el fichero ya calcula:
  ```astro
      {enSuDominio && store?.googleSiteVerification && (
        <meta name="google-site-verification" content={store.googleSiteVerification} />
      )}
  ```

- [ ] **4.3** — `src/components/ConversionTracking.astro`, borrar el parámetro y las dos líneas de comentario que prometen lo que no hace:
  ```js
          window.gtag('event', evento, { seccion: seccionDe(a) });
  ```
  `transport_type` es de Universal Analytics; en gtag de GA4 no existe. Como gtag no valida claves desconocidas, viajaba como **parámetro de evento personalizado**, gastando una de las 25 ranuras por evento en cada propiedad. gtag ya usa `navigator.sendBeacon` por su cuenta.

- [ ] **4.4** — `src/data/stores.ts:156`, aceptar los IDs que entrega Google hoy:
  ```ts
    // `GT-` además de `G-`: la interfaz de Google entrega hoy identificadores
    // `GT-` y `gtag('config')` acepta los dos. Con el regex anterior, pegar el
    // ID que Google acaba de dar reventaba el build de los 7 dominios con un
    // mensaje que mandaba a buscar un ID que quizá no existe.
    ga4Id: z.string().regex(/^(G|GT)-[A-Z0-9]+$/, 'un ID de GA4 tiene la forma "G-XXXXXXXXXX" o "GT-XXXXXXXX"').optional(),
  ```

- [ ] **4.5** — En `tests/datos.test.mjs`, extender el test existente `'un ga4Id que no es un ga4Id'`:
  ```js
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
  ```

- [ ] **4.6** — Verificar y commitear.
  ```bash
  grep -rn 'transport_type' src/    # vacío
  grep -rn 'define:vars' src/       # vacío
  npm run build && npm test 2>&1 | grep -E "^ℹ (pass|fail)"   # pass 68
  git add -A && git commit -m "fix(medicion): quitar transport_type, acotar el token de GSC y aceptar IDs GT-"
  ```

---

## Task 5 — `/health`

Hoy nadie puede responder qué commit sirve producción ni qué tienda cree servir el proceso para un host dado. Y un build que arranca pero no sabe servir entra en producción en los 7 dominios a la vez.

**Nombre: `health.ts`, nunca `_health.ts`.** Astro excluye del enrutado todo `src/pages/_*`. El ADR 0001 propuso `/_health` y es un error que se corrige aquí.

**Ficheros:** `tests/smoke.test.mjs`, `src/pages/health.ts`, `src/middleware.ts`

### Steps

- [ ] **5.1** — Test primero. Nuevo bloque en `tests/smoke.test.mjs`:
  ```js
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
        for (const otra of stores) {
          if (otra.slug === s.slug) continue;
          assert.ok(!res.text().includes(otra.domain), `no nombra a ${otra.slug}`);
        }
      }
    });

    test('en un host desconocido dice que no sabe, y sigue estando sano', async () => {
      // Es el caso del sondeo de Railway, que llega con Host: healthcheck.railway.app.
      const res = await get('/health', 'healthcheck.railway.app');
      assert.equal(res.status, 200);
      assert.equal(JSON.parse(res.text()).tienda, null);
    });

    test('no se cachea y no se indexa', async () => {
      // Un diagnóstico cacheado por Cloudflare miente. Y un JSON rastreable en un
      // dominio cuyo SEO es el producto es daño autoinfligido.
      const res = await get('/health', stores[0].domain);
      assert.match(res.headers['cache-control'], /no-store/);
      assert.match(res.headers['x-robots-tag'], /noindex/);
    });
  });
  ```
  **Run:** `npm test`
  **Expected:** **FAIL** — `/health` todavía no existe; en el dominio de una tienda el middleware lo reescribe a `/<slug>/health` y devuelve el 404.

- [ ] **5.2** — Crear `src/pages/health.ts`:
  ```ts
  import type { APIRoute } from 'astro';
  import { stores, porDominio } from '@/data/stores';

  export const prerender = false;

  /**
   * SALUD Y DIAGNÓSTICO
   *
   * Dos usos, y conviene no confundirlos:
   *
   *  1. Puerta de despliegue. Railway lo sondea con `healthcheckPath` y no
   *     manda tráfico a un build que no responda 200. Hoy un build que arranca
   *     y no sabe servir entra en producción en los 7 dominios a la vez.
   *     OJO: Railway deja de mirarlo en cuanto el deploy está vivo. Es puerta,
   *     no vigilancia. Lo que vigila es el monitor externo.
   *
   *  2. Diagnóstico. `tienda` responde "¿quién crees que eres en este host?",
   *     que es la pregunta que separa "Railway caído" de "el enrutado está roto".
   *
   * `ok` no es decorativo: comprueba que la tabla de dominios tenga las dos
   * entradas por tienda que construye `src/data/stores.ts` (el dominio pelado y
   * el `www.`). Una tabla a medias es exactamente lo que haría que cuatro
   * sociedades sirvieran el NIF de una sola — y eso devuelve 200 en la home, así
   * que un ping no lo vería. Con 503, el healthcheck lo convierte en puerta.
   */
  export const GET: APIRoute = ({ request }) => {
    const host = request.headers.get('host')?.split(':')[0] ?? '';
    const tiendaDelHost = porDominio.get(host) ?? null;

    const dominiosEsperados = stores.length * 2;
    const ok = stores.length > 0 && porDominio.size === dominiosEsperados;

    const cuerpo = {
      ok,
      tienda: tiendaDelHost?.slug ?? null,
      tiendas: stores.length,
      dominios: porDominio.size,
      // CORREGIDO respecto al borrador de este plan, que aquí ponía
      // `midiendo: stores.filter((s) => s.ga4Id).map((s) => s.slug)`. Ese array
      // nombra a las otras seis sociedades en el dominio de un cliente, que es
      // exactamente lo que prohíbe el criterio C3. El contrato real es:
      // `midiendo` booleano con el alcance del host, y el recuento de flota en
      // un campo aparte — un mismo nombre no puede ser booleano en un host y
      // número en otro.
      midiendo: Boolean(tiendaDelHost?.ga4Id),
      // Un recuento no nombra a nadie, así que puede viajar en cualquier host.
      midiendoFlota: stores.filter((s) => s.ga4Id).length,
      // `?? null` porque las variables RAILWAY_GIT_* no existen en un rollback
      // ni en un despliegue por imagen. Afirmar un SHA que no se tiene es peor
      // que no afirmarlo.
      sha: process.env.RAILWAY_GIT_COMMIT_SHA ?? null,
      uptime: Math.round(process.uptime()),
    };

    return new Response(JSON.stringify(cuerpo), {
      status: ok ? 200 : 503,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    });
  };
  ```

- [ ] **5.3** — `src/middleware.ts:44`, añadir la ruta a `RAIZ_COMPARTIDA`:
  ```ts
  const RAIZ_COMPARTIDA = new Set(['/sitemap.xml', '/robots.txt', '/404', '/health']);
  ```
  Railway no lo necesita (sondea con un host desconocido, que ya cae por `if (!store) return next()`), pero sin esta línea `usafitnessvigo.com/health` se reescribe a `/vigo/health` y devuelve la página 404 entera. La trampa sería: healthcheck verde, monitor externo en rojo permanente.
  **Run:** `npm run build && npm test 2>&1 | grep -E "^ℹ (pass|fail)"`
  **Expected:** `pass 71, fail 0`.

- [ ] **5.4** — Probar la invariante `ok` de verdad, que es la única parte del endpoint que no es un `console.log` con esteroides.
  ```bash
  # Romper la tabla a propósito: duplicar el dominio de una tienda haría que
  # porDominio.size no cuadre. El esquema lo rechaza antes, así que se comprueba
  # el cálculo directamente.
  node --input-type=module -e "
  import { stores, porDominio } from './src/data/stores.ts';
  console.log('tiendas', stores.length, 'dominios', porDominio.size,
              'invariante', porDominio.size === stores.length * 2);"
  ```
  **Expected:** `invariante true`.

- [ ] **5.5** — Prueba por mutación de la línea del middleware.
  ```bash
  sed -i "s|, '/health'||" src/middleware.ts && npm run build && npm test 2>&1 | grep -E "^ℹ fail"
  ```
  **Expected:** `fail 2` o más. Restaurar con `git checkout src/middleware.ts` y confirmar verde.

- [ ] **5.6** — Commit.
  ```bash
  git add src/pages/health.ts src/middleware.ts tests/smoke.test.mjs
  git commit -m "feat(salud): endpoint /health con invariante de la tabla de dominios"
  ```

---

## Task 6 — `railway.json`

**Ficheros:** `railway.json`

### Steps

- [ ] **6.1** — Probar el sondeo con el host exacto de Railway **antes** de commitear nada. Es el de-risking del primer despliegue con `healthcheckPath`: si esto falla en producción, Railway marca el deploy como fallido y no sirve nada.
  ```bash
  npm run build && (node dist/server/entry.mjs &) && sleep 2
  curl -s -o /dev/null -w "%{http_code}\n" -H 'Host: healthcheck.railway.app' localhost:4321/health
  ```
  **Expected:** `200`.

- [ ] **6.2** — Crear `railway.json`:
  ```json
  {
    "$schema": "https://railway.com/railway.schema.json",
    "deploy": {
      "startCommand": "node dist/server/entry.mjs",
      "healthcheckPath": "/health",
      "healthcheckTimeout": 120,
      "restartPolicyType": "ON_FAILURE"
    }
  }
  ```
  Antes de esto la configuración de despliegue solo existía en la memoria de una persona y en la UI de Railway. **Comprobar en Railway → Settings → Deploy que no haya un Health Check Path puesto a mano**: el fichero lo sobrescribe y conviene saberlo, no descubrirlo.

- [ ] **6.3** — Commit y PR.
  ```bash
  git add railway.json && git commit -m "chore(despliegue): versionar railway.json con healthcheck"
  git push -u origin feat/medicion-y-observabilidad
  gh pr create --title "Medición y observabilidad: la puerta antes que la llave" --body "..."
  ```
  **Nota:** `.cursor/rules/04-safety-and-git.mdc:28` dice *"`main` is always deployable. Never commit or push directly to `main`"*. El repo tiene 84 commits, 0 ramas y 0 PRs, y `main` sin proteger. Este plan empieza a cumplir la regla propia del proyecto. Ver §Riesgos.

---

## Self-review

1. **Cobertura de criterios.** C1→T2/T3 · C2→T1 · C3→T5.1 · C4→T5.4 · C5→T4.1/4.2 · C6→T4.3/T2.2 · C7→T4.4/4.5 · C8→T6.1 · C9→todas. **Sin huecos.**
2. **Escaneo de placeholders.** `grep -E "TBD|TODO|<fill|placeholder" .cursor/plans/2026-08-25-medicion-y-observabilidad.md` → solo el `--body "..."` de `gh pr create`, que es texto de una orden interactiva, no del código.
3. **Consistencia de tipos.** `ufCargarAnalitica` y `__ufAnaliticaCargada` se escriben igual en T2.2 y T3.1. Los campos de `/health` (`ok`, `tienda`, `tiendas`, `dominios`, `midiendo`, `midiendoFlota`, `sha`, `uptime`) coinciden entre T5.2 y las aserciones de T5.1. Las claves y sus tipos son los MISMOS en cualquier host —lo único que cambia con el `Host` es el valor de `tienda` y el de `midiendo`—, y T5.1 lo fija con una aserción de `Object.keys` sobre tres hosts: el dominio de una tienda, la sonda de Railway y `preview.up.railway.app`. `sha` viaja en todos ellos, tal y como especifica T5.2.
4. **Rutas de error.** T5.1 cubre host desconocido; T5.4 la invariante rota; T3.1 el `window.ufCargarAnalitica` inexistente en tienda sin ID; T2.1 el caso "aún no hay ninguna tienda con ID". El `try/catch` de `localStorage` cubre navegación privada.
5. **Test primero.** T1.1, T2.1, T4.1 y T5.1 son tests antes de código. T4.3 y T4.4 son borrados verificados por `grep` y por el test existente.
6. **Tamaño.** La más larga es T2 (~10 min). Ninguna se pasa.
7. **Dependencias.** Cero paquetes nuevos. Las APIs externas (gtag de GA4, Consent Mode v2, `railway.json`, variables `RAILWAY_GIT_*`) vienen del dossier de investigación con Context7 del 2026-08-25, no de memoria.

**Lo más frágil de este plan:** T3.2 es el único paso que no puede verificar el CI — requiere abrir DevTools y pulsar dos botones. Es también el único que demuestra que aceptar mide y rechazar no. Si se salta, C1 queda afirmado y no probado.

---

## Riesgos del plan

1. **La rama.** El repo nunca ha usado una. Railway despliega desde `main`, así que mientras la rama viva no llega nada a producción — que es lo correcto, pero significa que **el arreglo del consentimiento no está en producción hasta que se mezcle**. Si se van a pegar `ga4Id` antes de eso, el bug de 145 KB se activa. Orden no negociable: **mezclar esto antes de tocar ningún ID.**
2. **Cloudflare Rocket Loader.** Si está activo en alguna zona, el orden de los scripts no está garantizado. `data-cfasync="false"` lo cubre, pero conviene mirarlo en el panel: Speed → Optimization.
3. **El ID de prueba se queda pegado.** T1.1, T2.3 y T3.2 meten un `ga4Id` falso en `stores.json`. Cada uno tiene su paso de restaurar. Si uno se salta, se despliega un ID inventado. Red: `git diff src/data/stores.json` antes de cada commit.
4. **`healthcheckPath` mal puesto tumba el despliegue.** Si `/health` no devuelve 200 con el host de Railway, el deploy se marca fallido. Por eso T6.1 va antes que T6.2.
5. **El plan corrige al ADR 0001** (que proponía `/_health`, una ruta que Astro no enruta). Si alguien lee el ADR y no este plan, implementa algo que no funciona. Corregido en el ADR al cerrar el plan.

---

## Execution

**Opción A — Subagentes (recomendada):** `subagent-dispatcher`, un subagente por tarea con revisión en dos etapas. 6 tareas, dependencias claras.
**Opción B — Worktrees en paralelo:** no aplica. T2 y T3 tocan el mismo fichero y T5 depende de T1.
**Opción C — En línea:** yo ejecuto las 6 tareas en esta sesión con parada tras cada una.
**Opción D — Agente en la nube:** rama creada, PR al terminar.
**Opción E — Manual:** tú ejecutas, yo asisto.

---

## Lo que depende de ti, no del código

Nada de este plan lo necesita, pero el siguiente sí:

- **Propiedades de GA4**, una por tienda. Con la dimensión personalizada `seccion` (ámbito Evento) creada **el mismo día**: sin ella los eventos se recogen pero no aparecen en informes hasta 48 h después, y el síntoma es desmoralizante — se ven en DebugView y el informe sale vacío. Parece un bug del código y no lo es.
- **Cuenta de UptimeRobot** (gratis, sin tarjeta) con 5 monitores por palabra clave.
- **Decisión pendiente:** ¿las propiedades de GA4 se crean bajo tu cuenta de Google o bajo la de cada franquiciado? Cambia quién conserva el histórico si la relación termina. No lo decido yo.
