# Rodaja 1a de Rótulo — los datos de tienda que la plantilla necesita — Implementation Plan

**Date:** 2026-09-06
**Branch:** `feat/rotulo-datos`
**Author:** User + Claude Opus 5
**Status:** Done (2026-09-06)

## Amendment 2026-09-06 — lo que se desvió al ejecutarlo

1. **Las tareas 1 y 2 se commitearon juntas.** El plan preveía commitear la tarea 1 con dos tests en rojo, porque dependían de datos que llegaban en la 2. Commitear en rojo va contra la política de pruebas, así que se hicieron seguidas y se commiteó una sola vez.
2. **Dos mutaciones de la tarea 5 sobrevivieron, y eso cambió el código y el test.** Quitar la guarda `origen === destino` no rompía nada: era código muerto, porque intercambiar un elemento consigo mismo ya no hace nada. Se ha borrado. Y cambiar el intercambio por una inserción tampoco rompía nada, porque el único caso probado tenía origen y destino **adyacentes**, donde las dos operaciones dan lo mismo. Se añadió el caso lejano, que ahora la mata. La tercera mutación (quitar la comprobación de dato) mataba desde el principio.
3. **El evento `pedir_resena` va sin test.** Se registró y se clasifica, pero no hay ninguna píldora que lo emita hasta la rodaja 2: un test hoy pasaría por construcción, que es justo lo que memory/16 llama decorativo.
4. **La rodaja 1b se ejecutó en esta misma rama.** El plan las daba por independientes y lo son, pero el test de cobertura de glifos de 1b lee el campo `rotulo` que entra en 1a, así que en secuencial sale más limpio un solo PR.

**Resultado medido:** 220 pruebas, 220 pasan con la suite armada, 0 dormidas, 0 fallos. La línea de partida eran 196 con 3 dormidas. Ninguna de las ocho webs vivas cambia: ninguna tienda declara plantilla y hay un test que fija que las tres plantillas vivas no tienen zona móvil.

## Goal

Que `stores.json` pueda declarar el rótulo del cartel, la prioridad de la tienda, su Place ID y su foto de interior, con el esquema que los valida, las guardas que impiden publicar un dato falso y las funciones puras que los convierten en dato de página. Ni un píxel cambia en las ocho webs vivas.

## Architecture

Un solo servicio Astro SSR sirve los ocho dominios. `src/data/stores.ts` valida `stores.json` con Zod **al importarse**, así que un campo nuevo mal declarado no da un aviso: tumba el arranque de los ocho dominios. Por eso el orden es siempre esquema y test primero, datos después. `src/data/templates.ts` declara el vocabulario y el catálogo de plantillas; el intercambio de la zona móvil vive ahí, junto a `resolveSections`, y no en la página. `src/data/resenas.ts` es nuevo y puro: lo tienen que poder cargar los tres cargadores del proyecto (Vite en SSR, Node pelado en los tests y Node dentro de `astro:config:setup`), así que no importa `node:fs` ni nada de Astro.

## Tech Stack touched

Astro 6 SSR · Zod (vía `astro/zod`) · Node 24 con ejecución nativa de TypeScript · `node:test` · integración `usafitness:validar-datos` de `astro.config.mjs`.

## Success criteria (observable)

- [ ] `npm run build` sigue diciendo «stores.json válido — 8 tiendas» y no añade ningún error nuevo.
- [ ] `npm test` verde: las ocho páginas canónicas responden exactamente igual que antes (ninguna tienda declara `template`, así que nada de esto se pinta todavía).
- [ ] `node --test tests/datos.test.mjs` verde con los siete tests nuevos, y cada uno se ha visto **rojo** con su mutación antes de darlo por bueno.
- [ ] `stores.json` lleva `rotulo` en 8 de 8 y `placeId` en 7 de 8; `node scripts/place-id.mjs --verificar` sale con código 0.
- [ ] Pegar en `stores.json` el Place ID del centro comercial GranCasa, o el de otra tienda, **rompe el build** con un mensaje que nombra los dos CID.
- [ ] `avisosDeDatos()` incluye «grancasa: sin placeId» y ninguna otra tienda.

## Files

| Acción | Ruta | Para qué |
|---|---|---|
| Crear | `src/data/resenas.ts` | `cidDePlaceId` (descodifica el Place ID) y `enlaceResena` (única construcción del enlace de reseña). |
| Modificar | `src/data/stores.ts` | Cuatro campos nuevos, dos reglas cruzadas en `superRefine`, dos avisos. |
| Modificar | `src/data/templates.ts` | `PRIORIDADES`, `ZonaMovil` en `Template`, `ordenDeSecciones` y `avisoDePrioridad`. |
| Modificar | `src/pages/[...slug].astro` | Llamar a `ordenDeSecciones` en vez de a `resolveSections`. |
| Modificar | `src/data/stores.json` | Los ocho `rotulo` y los siete `placeId` medidos. |
| Crear | `scripts/place-id.mjs` | Sacar y verificar los Place ID desde el embed por CID. |
| Modificar | `tests/datos.test.mjs` | Los tests de las guardas nuevas. |
| Modificar | `docs/medicion/guia-alta.md` | Fila `pedir_resena` en el registro único de eventos §3.4. |

---

## Task 1 — `cidDePlaceId` y `enlaceResena`

**Files touched:** Crear `src/data/resenas.ts` · Test `tests/datos.test.mjs`

### Steps

- [ ] **Step 1.1 — Test en rojo.** Al final de `tests/datos.test.mjs`, y en la lista de imports de arriba añade `import { cidDePlaceId, enlaceResena } from '../src/data/resenas.ts';`

  ```js
  describe('El Place ID lleva dentro la ficha a la que dice apuntar', () => {
    // La forma de un Place ID de negocio es base64url de un protobuf:
    //   0a 12 09 <cellId LE64> 11 <CID LE64>
    // Descodificarlo convierte «¿este identificador es el de esta tienda?» en
    // aritmética, y no en un enlace roto que solo se ve pinchándolo.
    test('los siete Place ID de la flota llevan el CID de su propia ficha', () => {
      for (const t of stores) {
        if (!t.placeId) continue;
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
      assert.equal(cidDePlaceId('EicxMyBNYXJrZXQgU3QsIFdpbG1pbmd0b24sIE5DIDI4NDAxLCBVU0E'), null, 'un Place ID de DIRECCIÓN no es de negocio');
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

      // Sin placeId, la píldora no promete el formulario: lleva a la ficha.
      const sinPlaceId = { ...lagoh, placeId: undefined };
      assert.equal(enlaceResena(sinPlaceId).href, lagoh.googleMapsLink);
      assert.equal(enlaceResena(sinPlaceId).etiqueta, 'Ver en Google');

      // Sin ficha no hay nada que enseñar: la pieza no se pinta.
      const grancasa = stores.find((s) => s.slug === 'grancasa');
      assert.equal(enlaceResena(grancasa), null);
    });
  });
  ```

  **Run:** `node --test tests/datos.test.mjs`
  **Expected:** FAIL — `Cannot find module '../src/data/resenas.ts'`.

- [ ] **Step 1.2 — Implementar.** Crear `src/data/resenas.ts`:

  ```ts
  /**
   * EL ENLACE DE RESEÑA, Y LA COMPROBACIÓN DE QUE APUNTA A ESTA TIENDA
   *
   * Google no acepta el CID para el formulario de «escribir reseña»: exige el
   * Place ID (`ChIJ…`). Los dos identifican la misma ficha, y de hecho el Place
   * ID LLEVA EL CID DENTRO: es base64url de un protobuf con la forma
   *
   *     0a 12 09 <cellId little-endian 64> 11 <CID little-endian 64>
   *
   * Comprobado el 2026-09-06 contra el ejemplo de la documentación de Google y
   * contra las siete tiendas con ficha: 7 de 7. Eso permite que el build
   * verifique el dato en vez de confiar en él — pegar el Place ID del centro
   * comercial (que es lo que la tentación pide cuando una tienda no tiene ficha)
   * deja de ser un enlace falso publicado y pasa a ser un error de compilación.
   *
   * Sin `node:fs` ni nada de Astro: este módulo lo cargan los tres cargadores
   * del proyecto (Vite en SSR, Node pelado en los tests y Node dentro de
   * `astro:config:setup`), la misma restricción que `presupuesto.ts`.
   */

  const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  /**
   * El CID que lleva dentro un Place ID de FICHA DE NEGOCIO, en decimal.
   * `null` si no es un Place ID de negocio: un CID pelado, un Place ID de
   * dirección (`Ei…`, `GhIJ…`) o cualquier otra cosa.
   */
  export function cidDePlaceId(placeId: string): string | null {
    const bytes: number[] = [];
    let acc = 0;
    let bits = 0;
    for (const ch of placeId) {
      const v = B64URL.indexOf(ch);
      if (v < 0) return null;
      acc = (acc << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((acc >> bits) & 0xff);
      }
    }
    // 0a 12 09 + 8 bytes + 11 + 8 bytes = 20 bytes exactos.
    if (bytes.length < 20) return null;
    if (bytes[0] !== 0x0a || bytes[1] !== 0x12 || bytes[2] !== 0x09 || bytes[11] !== 0x11) return null;
    let cid = 0n;
    for (let i = 19; i >= 12; i--) cid = (cid << 8n) | BigInt(bytes[i]);
    return cid.toString();
  }

  export interface EnlaceDeResena {
    href: string;
    etiqueta: string;
    /** `formulario` abre la caja de escribir reseña; `ficha` solo lleva a Google. */
    tipo: 'formulario' | 'ficha';
  }

  /**
   * El único sitio donde se construye el enlace de reseña.
   *
   * Con `placeId`, el formulario directo. Sin él pero con ficha, el enlace a la
   * ficha por CID y una etiqueta que NO promete el formulario. Sin ficha,
   * `null`: la pieza no se pinta y nunca se anuncia el vacío.
   *
   * La URL del formulario no aparece hoy en ninguna página viva de Google (solo
   * en su ayuda archivada de 2019-2020) pero responde. Si la retiran, se cambia
   * aquí y el resto del sistema no se entera.
   */
  export function enlaceResena(store: {
    placeId?: string;
    googleMapsLink?: string;
  }): EnlaceDeResena | null {
    if (store.placeId) {
      return {
        href: `https://search.google.com/local/writereview?placeid=${store.placeId}`,
        etiqueta: 'Escribe tu reseña',
        tipo: 'formulario',
      };
    }
    if (store.googleMapsLink) {
      return { href: store.googleMapsLink, etiqueta: 'Ver en Google', tipo: 'ficha' };
    }
    return null;
  }
  ```

  **Run:** `node --test tests/datos.test.mjs`
  **Expected:** los tres primeros PASS; el cuarto y el primero fallan todavía porque `placeId` aún no existe en el esquema ni en los datos (Task 2). Continúa.

- [ ] **Step 1.3 — Commit.**
  **Run:** `git add src/data/resenas.ts tests/datos.test.mjs && git commit -m "feat(resenas): el Place ID se descodifica y el enlace de resena se construye en un solo sitio"`

---

## Task 2 — `placeId` en el esquema, verificado contra el CID

**Files touched:** Modificar `src/data/stores.ts`, `src/data/stores.json` · Test `tests/datos.test.mjs`

### Steps

- [ ] **Step 2.1 — Test en rojo.** En `tests/datos.test.mjs`, dentro del describe «La guarda rechaza lo que tiene que rechazar»:

  ```js
  test('un placeId que no es un Place ID de ficha', () => {
    const t = valida();
    t.placeId = 'https://maps.google.com/?cid=1192403823564073512';
    rechaza([t], 'place id');
  });

  test('un placeId que apunta a OTRA ficha (el del centro comercial, el clásico)', () => {
    // El caso real que la tentación pide: GranCasa no tiene ficha, el centro sí.
    const t = valida();
    t.placeId = 'ChIJgUbEo8cfqokR5lP9_Wh_DaM'; // ficha de otro negocio
    rechaza([t], 'apunta a la ficha');
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
  ```

  **Run:** `node --test tests/datos.test.mjs`
  **Expected:** FAIL — el esquema acepta `placeId` porque `strictObject` no lo conoce… en realidad lo RECHAZA por clave desconocida y el mensaje no menciona «apunta a la ficha». Los tres fallan por el motivo correcto.

- [ ] **Step 2.2 — Implementar el campo.** En `src/data/stores.ts`, importa arriba junto a los otros:

  ```ts
  import { cidDePlaceId } from './resenas.ts';
  ```

  y añade el campo dentro de `EsquemaTienda`, justo después de `googleMapsStatus`:

  ```ts
    /**
     * Place ID de la ficha (`ChIJ…`). Es lo ÚNICO que acepta el formulario de
     * «escribir reseña» de Google; el CID que ya guardamos solo abre la ficha.
     * Se saca del HTML del propio embed por CID con `scripts/place-id.mjs`, sin
     * acceso de gestor y sin API de pago. Google avisa de que un Place ID puede
     * cambiar y recomienda refrescarlo pasados doce meses: por eso el
     * `superRefine` de abajo comprueba que lleva dentro el CID de ESTA tienda.
     */
    placeId: z
      .string()
      .regex(/^ChIJ[A-Za-z0-9_-]{23}$/, 'un Place ID de ficha de negocio son 27 caracteres que empiezan por "ChIJ" (p. ej. "ChIJzU_NTwBtEg0RmABuXlayxbM"); un CID o una URL no valen')
      .optional(),
  ```

- [ ] **Step 2.3 — Implementar las reglas cruzadas.** En el mismo fichero, dentro del `tiendas.forEach((t, i) => {` de `superRefine`, justo después del bloque que compara el CID del embed con el del enlace:

  ```ts
      // EL PLACE ID TIENE QUE SER EL DE ESTA TIENDA.
      // Se descodifica y se compara con el CID del enlace: un Place ID copiado
      // del centro comercial o de la tienda de al lado no compila. Es la misma
      // familia de guarda que FICHAS_PROHIBIDAS, pero aritmética.
      if (t.placeId) {
        if (sinFicha) {
          ctx.addIssue({ code: 'custom', path: [i, 'placeId'],
            message: 'declara no tener ficha de Google pero trae placeId. Una de las dos cosas sobra' });
        } else {
          const dentro = cidDePlaceId(t.placeId);
          if (dentro === null) {
            ctx.addIssue({ code: 'custom', path: [i, 'placeId'],
              message: 'no es un Place ID de ficha de negocio: no lleva un CID dentro. Sácalo con `node scripts/place-id.mjs`' });
          } else if (b && dentro !== b) {
            ctx.addIssue({ code: 'custom', path: [i, 'placeId'],
              message: `el placeId apunta a la ficha ${dentro} y el enlace a la ${b}: son fichas distintas` });
          }
        }
      }
  ```

  > `b` es el CID del enlace que ese bloque ya calculó (`const a = cidDe(t.googleMapsEmbed), b = cidDe(t.googleMapsLink);`).

  Y en `avisosDeDatos()`:

  ```ts
      if (!t.placeId && t.googleMapsStatus !== 'sin-ficha-gbp') {
        avisos.push(`${t.slug}: sin placeId → «escribe tu reseña» cae a «ver en Google» y el visitante tiene que buscar el botón`);
      }
  ```

  **Run:** `node --test tests/datos.test.mjs`
  **Expected:** los tres tests de Task 2.1 PASS; el de los siete Place ID de Task 1 sigue fallando (aún no están en el JSON).

- [ ] **Step 2.4 — Los datos.** Añade a cada tienda de `src/data/stores.json`, junto a `googleMapsLink`, el valor medido el 2026-09-06:

  | slug | placeId |
  |---|---|
  | villanueva | `ChIJUVOmwjGZQQ0RKKpavPVEjBA` |
  | marineda | `ChIJVx7_idJ9Lg0Rvo5Lblf6ej0` |
  | lasrosas | `ChIJ0VzvLwAvQg0RDdXuce7w-EM` |
  | alcobendas | `ChIJVZpXGZkpQg0R0_ZndmcWx8w` |
  | vigo | `ChIJ3ZBROcdjLw0RBfWjJ0v-l74` |
  | arcangel | `ChIJCQFRr64hbQ0RXOd-U9C69FE` |
  | lagoh | `ChIJzU_NTwBtEg0RmABuXlayxbM` |

  GranCasa **no** lo lleva: no tiene ficha.

  **Run:** `node --test tests/datos.test.mjs && npm run build`
  **Expected:** todo PASS; el build dice «stores.json válido — 8 tiendas» y en los avisos aparece solo `grancasa: sin placeId`.

- [ ] **Step 2.5 — Mutación.** Cambia el `placeId` de lagoh por el de vigo.
  **Run:** `npm run build`
  **Expected:** FALLA con «el placeId apunta a la ficha 13733725187430675717 y el enlace a la 12953955987222298776». Deshaz el cambio y vuelve a compilar en verde.

- [ ] **Step 2.6 — Commit.**
  **Run:** `git add src/data/stores.ts src/data/stores.json tests/datos.test.mjs && git commit -m "feat(datos): placeId por tienda, verificado en build contra el CID de su propia ficha"`

---

## Task 3 — `scripts/place-id.mjs`

**Files touched:** Crear `scripts/place-id.mjs`

### Steps

- [ ] **Step 3.1 — Escribir el script.**

  ```js
  /**
   * SACAR Y VERIFICAR LOS PLACE ID SIN ACCESO DE GESTOR NI API DE PAGO
   *
   * El HTML del embed por CID que ya guardamos en stores.json trae dentro el
   * Place ID de la ficha. Este script lo extrae, comprueba que lleva el CID
   * correcto (con el mismo descodificador que usa el build) y, con --escribir,
   * lo guarda.
   *
   *   node scripts/place-id.mjs            → lista lo que hay y lo que falta
   *   node scripts/place-id.mjs --verificar → sale con 1 si alguno no cuadra
   *   node scripts/place-id.mjs --escribir  → rellena los que falten
   *
   * Google recomienda refrescar los Place ID pasados doce meses: `--verificar`
   * entra en el Semáforo NAP anual y comprueba las 58 en menos de un minuto.
   */
  import { readFileSync, writeFileSync } from 'node:fs';
  import { cidDePlaceId } from '../src/data/resenas.ts';

  const FICHERO = new URL('../src/data/stores.json', import.meta.url);
  const escribir = process.argv.includes('--escribir');
  const verificar = process.argv.includes('--verificar');

  const original = readFileSync(FICHERO, 'utf8');
  const datos = JSON.parse(original);
  let problemas = 0;
  let cambios = 0;

  for (const t of datos.stores) {
    if (t.googleMapsStatus === 'sin-ficha-gbp') {
      console.log(`${t.slug}: sin ficha de Google — no procede`);
      continue;
    }
    const cid = t.googleMapsLink.match(/\d{15,20}/)[0];
    const url = `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s${cid}!3m1!1ses!5m1!1ses`;
    const html = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0.0.0 Safari/537.36' },
    }).then((r) => r.text());
    const encontrado = html.match(/ChIJ[A-Za-z0-9_-]{23}/)?.[0] ?? null;

    if (!encontrado) {
      // El detalle de que el embed traiga el ChIJ no está documentado: puede
      // desaparecer. La salida manual es el Place ID Finder oficial.
      console.error(`✖ ${t.slug}: el embed ya no trae el Place ID. Sácalo a mano en https://developers.google.com/maps/documentation/places/web-service/place-id (CID ${cid})`);
      problemas++;
      continue;
    }
    if (cidDePlaceId(encontrado) !== cid) {
      console.error(`✖ ${t.slug}: el Place ID ${encontrado} lleva dentro ${cidDePlaceId(encontrado)} y esperábamos ${cid}`);
      problemas++;
      continue;
    }
    if (t.placeId && t.placeId !== encontrado) {
      console.error(`✖ ${t.slug}: HA CAMBIADO — guardado ${t.placeId}, Google devuelve ${encontrado}`);
      problemas++;
      if (escribir) { t.placeId = encontrado; cambios++; }
      continue;
    }
    if (!t.placeId) {
      console.log(`+ ${t.slug}: ${encontrado}`);
      if (escribir) { t.placeId = encontrado; cambios++; }
      else problemas++;
    } else {
      console.log(`  ${t.slug}: ${t.placeId} ✓`);
    }
  }

  if (escribir && cambios > 0) {
    writeFileSync(FICHERO, JSON.stringify(datos, null, 2) + '\n');
    console.log(`\n${cambios} escritos en stores.json — revisa el diff antes de commitear`);
  }
  if (verificar && problemas > 0) process.exit(1);
  ```

  **Run:** `node scripts/place-id.mjs --verificar`
  **Expected:** las siete con `✓`, grancasa «sin ficha», código de salida 0.

- [ ] **Step 3.2 — Commit.**
  **Run:** `git add scripts/place-id.mjs && git commit -m "chore(scripts): place-id.mjs saca y refresca los Place ID desde el embed por CID"`

---

## Task 4 — `rotulo`

**Files touched:** Modificar `src/data/stores.ts`, `src/data/stores.json` · Test `tests/datos.test.mjs`

### Steps

- [ ] **Step 4.1 — Test en rojo.**

  ```js
  test('un rótulo que no cabe en el cartel', () => {
    const t = valida();
    t.rotulo = 'VILLANUEVA DE LA CAÑADA'; // tres palabras: más de dos líneas
    rechaza([t], 'dos líneas');
  });

  test('un rótulo en minúscula', () => {
    const t = valida();
    t.rotulo = 'Villanueva';
    rechaza([t], 'mayúsculas');
  });

  test('un rótulo con salto explícito sí vale', () => {
    const t = valida();
    t.rotulo = 'TORRE|CÁRDENAS';
    assert.ok(esquemaTiendas.safeParse([t]).success);
  });
  ```

  **Run:** `node --test tests/datos.test.mjs` · **Expected:** FAIL (clave desconocida, mensaje sin la pista).

- [ ] **Step 4.2 — Implementar.** En `EsquemaTienda`, junto a `location`:

  ```ts
    /**
     * El rótulo del cartel: lo que la plantilla «Rótulo» pinta a tamaño cartel
     * en el primer viewport. NO es `name`, que empieza por «USAFITNESS» en las
     * ocho y por tanto pintaría la marca en vez de la tienda.
     *
     * Una palabra por línea, dos líneas como mucho; `|` es un salto de línea
     * explícito para los nombres que no caben de otra forma («TORRE|CÁRDENAS»).
     * Mayúsculas porque el subset de Archivo que se descarga solo trae
     * mayúsculas: una minúscula caería a la fuente del sistema sin avisar.
     *
     * Sin él, la plantilla cae a `location` recortada en la coma.
     */
    rotulo: z
      .string()
      .regex(/^[A-ZÁÉÍÓÚÑÜ0-9]+(?:[ |][A-ZÁÉÍÓÚÑÜ0-9]+)*$/, 'el rótulo va en mayúsculas sin acentos raros ni signos; usa "|" para el salto de línea')
      .refine((r) => r.split(/[ |]/).length <= 2, 'el rótulo ocupa dos líneas como mucho: una palabra por línea')
      .optional(),
  ```

  Y el aviso en `avisosDeDatos()`:

  ```ts
      if (!t.rotulo) avisos.push(`${t.slug}: sin rotulo → el cartel imprimiría "${t.location}"`);
  ```

  **Run:** `node --test tests/datos.test.mjs` · **Expected:** los tres PASS.

- [ ] **Step 4.3 — Los ocho valores.** En `stores.json`, junto a `location`:
  `villanueva: "VILLANUEVA"` · `marineda: "MARINEDA"` · `lasrosas: "LAS ROSAS"` · `alcobendas: "ALCOBENDAS"` · `grancasa: "GRANCASA"` · `vigo: "GRAN VÍA"` · `arcangel: "EL ARCÁNGEL"` · `lagoh: "LAGOH"`.

  > Anchos medidos con la tabla de avances real de Archivo wdth 125 / wght 900 (media 0,927 em) a 58 px sobre 375 px: LAGOH 277 px · LAS ROSAS 271 · GRAN VÍA 227 · MARINEDA 419 (corta 0,8 caracteres) · EL ARCÁNGEL 432 (1,1) · GRANCASA 443 (1,2) · VILLANUEVA 499 (2,5) · ALCOBENDAS 537 (3,0). Los dos últimos son los casos límite que hay que mirar en la captura.

  **Run:** `npm run build && npm test` · **Expected:** verde, y el aviso «sin rotulo» desaparece.

- [ ] **Step 4.4 — Mutación.** Pon `rotulo: "VILLANUEVA DE LA CAÑADA"` en villanueva.
  **Run:** `npm run build` · **Expected:** falla nombrando la tienda y las dos líneas. Deshaz.

- [ ] **Step 4.5 — Commit.**
  **Run:** `git add src/data/stores.ts src/data/stores.json tests/datos.test.mjs && git commit -m "feat(datos): campo rotulo con la regla de dos lineas y los ocho valores medidos"`

---

## Task 5 — `prioridad` y la zona móvil

**Files touched:** Modificar `src/data/templates.ts`, `src/data/stores.ts`, `src/pages/[...slug].astro` · Test `tests/datos.test.mjs`

### Steps

- [ ] **Step 5.1 — Test en rojo.** Añade a los imports `ordenDeSecciones, avisoDePrioridad, PRIORIDADES` desde `templates.ts`, y:

  ```js
  describe('La tienda elige UNA cosa y solo se mueve un bloque', () => {
    // Una plantilla de mentira: la real llegará con Rótulo. Lo que se prueba
    // aquí es el mecanismo, no el diseño.
    const conZona = {
      id: 'prueba', label: 'Prueba', tokens: {},
      sections: ['hero', 'promotions', 'products', 'reviews', 'schedule'],
      zonaMovil: { posicion: 1, defecto: 'promotions', mapa: { visita: 'schedule', oferta: 'promotions', socio: 'products', asesoramiento: 'reviews' } },
    };

    test('sin prioridad manda el orden de la plantilla', () => {
      const orden = ordenDeSecciones(conZona, {}).map((s) => s.id);
      assert.deepEqual(orden, ['hero', 'promotions', 'products', 'reviews', 'schedule']);
    });

    test('la prioridad intercambia UN bloque, y solo uno', () => {
      const orden = ordenDeSecciones(conZona, { prioridad: 'socio' }).map((s) => s.id);
      assert.deepEqual(orden, ['hero', 'products', 'promotions', 'reviews', 'schedule']);
      // products subió al hueco y promotions ocupó el que dejó: nada más se movió.
    });

    test('el primer bloque no se toca nunca', () => {
      for (const p of PRIORIDADES) {
        assert.equal(ordenDeSecciones(conZona, { prioridad: p })[0].id, 'hero', `con ${p} el hero se movió`);
      }
    });

    test('si el bloque elegido no tiene dato, se queda el defecto y se avisa', () => {
      const sinReviews = (id) => id !== 'reviews';
      const orden = ordenDeSecciones(conZona, { prioridad: 'asesoramiento' }, sinReviews).map((s) => s.id);
      assert.deepEqual(orden, ['hero', 'promotions', 'products', 'reviews', 'schedule'], 'sin dato no se mueve nada');
      assert.match(avisoDePrioridad(conZona, { slug: 'x', prioridad: 'asesoramiento' }, sinReviews), /sin dato/);
    });

    test('una plantilla sin zona móvil ignora la prioridad', () => {
      const { TEMPLATES } = { TEMPLATES: null } ?? {};
      const orden = ordenDeSecciones({ ...conZona, zonaMovil: undefined }, { prioridad: 'socio' }).map((s) => s.id);
      assert.deepEqual(orden, ['hero', 'promotions', 'products', 'reviews', 'schedule']);
    });
  });
  ```

  Y en «La guarda rechaza lo que tiene que rechazar»:

  ```js
  test('una prioridad que no es una de las cuatro', () => {
    const t = valida();
    t.prioridad = 'productos';
    rechaza([t], 'prioridad');
  });

  test('prioridad y sections a la vez: dos fuentes de orden', () => {
    const t = valida();
    t.prioridad = 'socio';
    t.sections = ['hero', 'promotions'];
    rechaza([t], 'dos formas de decidir el orden');
  });
  ```

  **Run:** `node --test tests/datos.test.mjs` · **Expected:** FAIL — `ordenDeSecciones is not a function`.

- [ ] **Step 5.2 — Implementar en `templates.ts`.** Añade, después de `SectionRef`:

  ```ts
  /** Lo que una tienda puede pedir que se vea primero. UNA sola elección. */
  export const PRIORIDADES = ['visita', 'oferta', 'socio', 'asesoramiento'] as const;
  export type Prioridad = (typeof PRIORIDADES)[number];

  /**
   * El único hueco del orden que la tienda puede cambiar.
   *
   * `posicion` es el índice del orden de la plantilla que la tienda gobierna;
   * `defecto` es quién lo ocupa si la tienda no elige, y `mapa` dice qué bloque
   * sube a ese hueco por cada prioridad. El bloque desplazado baja al hueco que
   * deja el que sube: es un INTERCAMBIO, así que el número de secciones no
   * cambia y ninguna se cuela ni desaparece.
   *
   * Lo que esto NO puede tocar, por construcción: la periferia, el primer
   * viewport y cualquier posición protegida por R1-R3. Por eso `posicion` nunca
   * es 0 y la plantilla decide el mapa, no la tienda.
   */
  export interface ZonaMovil {
    posicion: number;
    defecto: SectionId;
    mapa: Partial<Record<Prioridad, SectionId>>;
  }
  ```

  Añade el campo a `interface Template`:

  ```ts
    /** El hueco que la tienda gobierna con su `prioridad`. Sin esto, la
     *  plantilla no admite prioridad y el orden es siempre el suyo. */
    zonaMovil?: ZonaMovil;
  ```

  Y las dos funciones nuevas al final del fichero:

  ```ts
  /**
   * El orden final: el de `resolveSections` más el intercambio de la zona móvil.
   *
   * `tieneDato` lo inyecta quien llame (la página se lo pasa desde el registro
   * de secciones) porque `templates.ts` no puede importar el registro: el
   * registro importa los componentes `.astro` y este módulo tiene que cargar en
   * `node --test` y en `astro:config:setup`.
   */
  export function ordenDeSecciones(
    template: Template,
    store: { sections?: SectionRef[] | null; prioridad?: Prioridad },
    tieneDato: (id: SectionId) => boolean = () => true
  ): { id: SectionId; variant?: string }[] {
    const orden = resolveSections(template, store.sections);
    const zona = template.zonaMovil;
    if (!zona || !store.prioridad) return orden;

    const elegido = zona.mapa[store.prioridad];
    if (!elegido || !tieneDato(elegido)) return orden;

    const destino = zona.posicion;
    const origen = orden.findIndex((s) => s.id === elegido);
    // Si el bloque elegido no está en el orden (lo quitó un `visible`) o ya
    // ocupa el hueco, no hay nada que intercambiar.
    if (origen < 0 || destino < 0 || destino >= orden.length || origen === destino) return orden;

    const copia = [...orden];
    [copia[destino], copia[origen]] = [copia[origen], copia[destino]];
    return copia;
  }

  /** El aviso de build cuando la prioridad elegida no tiene dato que enseñar. */
  export function avisoDePrioridad(
    template: Template,
    store: { slug: string; prioridad?: Prioridad },
    tieneDato: (id: SectionId) => boolean
  ): string | null {
    const zona = template.zonaMovil;
    if (!zona || !store.prioridad) return null;
    const elegido = zona.mapa[store.prioridad];
    if (!elegido) return `${store.slug}: la plantilla «${template.id}» no sabe qué hacer con prioridad "${store.prioridad}"`;
    if (!tieneDato(elegido)) {
      return `${store.slug}: prioridad "${store.prioridad}" sin dato (${elegido}) → se queda ${zona.defecto}`;
    }
    return null;
  }
  ```

- [ ] **Step 5.3 — Implementar en `stores.ts`.** Importa `PRIORIDADES` junto a `SECTION_IDS` y añade el campo tras `sections`:

  ```ts
    /**
     * Lo que esta tienda quiere que se vea primero, después del horario.
     * UNA elección, tecleada por el operador en la sesión de alta. Mueve un solo
     * bloque en el hueco que la plantilla reserva; no toca el primer viewport ni
     * la periferia (ver `ZonaMovil` en templates.ts).
     */
    prioridad: z.enum(PRIORIDADES).optional(),
  ```

  Y en `superRefine`, dentro del `forEach`:

  ```ts
      // Dos fuentes de orden es una de más: `sections` reemplaza el orden entero
      // y `prioridad` mueve un bloque dentro de él. Juntas, nadie sabe qué manda.
      if (t.prioridad && t.sections && t.sections.length > 0) {
        ctx.addIssue({ code: 'custom', path: [i, 'prioridad'],
          message: 'esta tienda declara `prioridad` y `sections`: son dos formas de decidir el orden y solo puede mandar una. `sections` es la válvula del operador; para la elección del franquiciado, `prioridad`' });
      }
  ```

  **Run:** `node --test tests/datos.test.mjs` · **Expected:** todos PASS.

- [ ] **Step 5.4 — Cablear la página.** En `src/pages/[...slug].astro`, cambia el import y la línea 38:

  ```astro
  import { getTemplate, ordenDeSecciones, tokensToCss } from '@/data/templates';
  import { buildPlan, tieneDato } from '@/sections/registry';
  ...
  const orden = ordenDeSecciones(template, store, (id) => tieneDato(id, store));
  ```

  Y en `src/sections/registry.ts`, exporta el predicado que ya existe implícito:

  ```ts
  /** ¿Esta sección tiene con qué pintarse en esta tienda? La misma regla que
   *  usa `buildPlan`, exportada para que la zona móvil no invente la suya. */
  export function tieneDato(id: SectionId, store: Store): boolean {
    const def = SECTIONS[id];
    if (!def) return false;
    return def.visible ? def.visible(store) : true;
  }
  ```

  **Run:** `npm run build && npm test`
  **Expected:** verde. Ninguna tienda tiene `prioridad` ni `template`, así que las ocho páginas salen byte a byte igual que antes.

- [ ] **Step 5.5 — Mutación.** En `ordenDeSecciones`, quita la guarda `origen === destino`.
  **Run:** `node --test tests/datos.test.mjs` · **Expected:** sigue verde (la guarda es defensiva). Entonces **añade un caso** que la mate: prioridad `oferta`, cuyo mapa apunta al propio `defecto`, y comprueba que el orden no cambia. Vuelve a poner la guarda y verifica que el caso nuevo pasa.

- [ ] **Step 5.6 — Commit.**
  **Run:** `git add src/data/templates.ts src/data/stores.ts src/pages/[...slug].astro src/sections/registry.ts tests/datos.test.mjs && git commit -m "feat(plantillas): la tienda elige UNA prioridad y la zona movil intercambia un solo bloque"`

---

## Task 6 — `fotoInterior`

**Files touched:** Modificar `src/data/stores.ts` · Test `tests/datos.test.mjs`

### Steps

- [ ] **Step 6.1 — Test en rojo.**

  ```js
  test('una fotoInterior que no está en la galería de esa tienda', () => {
    const t = valida();
    t.fotoInterior = '/photos/lagoh/tienda-2.webp'; // de otra tienda
    rechaza([t], 'galleryimages');
  });
  ```

- [ ] **Step 6.2 — Implementar.** Campo junto a `galleryFeatured`:

  ```ts
    /**
     * La foto que la banda de papel de «Rótulo» puede tratar en duotono.
     * Solo interior: la fachada nunca se filtra (hay que reconocerla desde el
     * pasillo) y el lineal tampoco (mata los envases). Sin ella, la banda no se
     * pinta y el rótulo crece: la renuncia no se nota.
     */
    fotoInterior: rutaPublica.optional(),
  ```

  Y en `superRefine`, dentro del `forEach`:

  ```ts
      if (t.fotoInterior && !t.galleryImages.includes(t.fotoInterior)) {
        ctx.addIssue({ code: 'custom', path: [i, 'fotoInterior'],
          message: `${t.fotoInterior} no está en galleryImages de esta tienda: la foto del papel tiene que ser una de las suyas` });
      }
  ```

  **Run:** `node --test tests/datos.test.mjs` · **Expected:** PASS. **No** se rellena en ninguna tienda todavía: ninguna de las 48 fotos actuales es de ambiente, y eso lo decide una persona mirándolas.

- [ ] **Step 6.3 — Commit.**
  **Run:** `git add src/data/stores.ts tests/datos.test.mjs && git commit -m "feat(datos): fotoInterior, la unica foto que el duotono puede tratar"`

---

## Task 7 — El evento `pedir_resena` en el registro

**Files touched:** Modificar `docs/medicion/guia-alta.md`, `src/components/ConversionTracking.astro`

### Steps

- [ ] **Step 7.1 — Registro.** En la tabla de §3.4, después de `contacto_maps`:

  ```markdown
  | `pedir_resena` | `seccion` | píldora «Escribe tu reseña» (Reseñas, o Hoy en tienda si Reseñas no se pinta) | pendiente de instrumentar (F2) |
  ```

- [ ] **Step 7.2 — Clasificador.** En `ConversionTracking.astro`, dentro de `tipoDe`, **antes** de la comprobación de Maps (porque la URL del formulario también es de Google):

  ```js
        if (href.indexOf('search.google.com/local/writereview') > -1) return 'pedir_resena';
  ```

  **Run:** `npm run build && npm test` · **Expected:** verde. El bloque «Nada de terceros antes del consentimiento» sigue pasando: esto clasifica enlaces, no los crea, y sin `gtag` no hace nada.

- [ ] **Step 7.3 — Commit.**
  **Run:** `git add docs/medicion/guia-alta.md src/components/ConversionTracking.astro && git commit -m "feat(medicion): pedir_resena entra en el registro unico y en el clasificador"`

---

## Self-review

1. **Cobertura de los criterios.** Los seis criterios se trazan: build (Tasks 2.4, 4.3, 5.4), tests nuevos (1.1, 2.1, 4.1, 5.1, 6.1), datos (2.4, 4.3), guarda del Place ID ajeno (2.5), avisos (2.3, 4.2). Sin huecos.
2. **Sin placeholders.** Ningún bloque de código lleva puntos suspensivos salvo la cita de contexto de `[...slug].astro`, que señala dónde encaja la línea nueva.
3. **Consistencia de nombres.** `cidDePlaceId`, `enlaceResena`, `ordenDeSecciones`, `avisoDePrioridad`, `tieneDato`, `ZonaMovil`, `PRIORIDADES` aparecen con la misma firma en todas las tareas.
4. **Caminos de error.** Cubiertos: Place ID ajeno (2.1), Place ID sin ficha (2.1), rótulo de tres palabras (4.1), prioridad inventada (5.1), prioridad sin dato (5.1), dos fuentes de orden (5.1), foto de otra tienda (6.1). El único camino no probado es que el embed deje de traer el `ChIJ`: el script lo detecta y manda al buscador oficial, pero no hay test porque exige red.
5. **Test primero.** Las siete tareas empiezan en rojo.
6. **Tamaño.** Ninguna tarea pasa de diez minutos. La más larga es la 5, y se puede partir por el paso 5.3 si hace falta.
7. **Dependencias externas.** Ninguna nueva. `scripts/place-id.mjs` usa `fetch`, que Node 24 trae de serie.

**Lo más frágil de este plan:** el descodificador de Place ID depende de que Google mantenga esa forma de protobuf. Está verificado hoy contra siete fichas y contra el ejemplo oficial, pero es un detalle no documentado. Si cambia, el build empieza a rechazar Place ID válidos, que es el fallo seguro (ruidoso, no silencioso), y la salida es relajar la comprobación a solo el formato.

**Lo que este plan no hace y podría echarse en falta:** no toca la línea «Hoy 10:00–22:00» ni el calendario de festivos. Van en la rodaja 1d, porque `franjaDeHoy` sin festivos puede mentir un día de fiesta y prefiero que las dos cosas entren juntas.

## Execution

**Opción A — por subagente (recomendada, son siete tareas):** cada tarea a un subagente fresco con revisión en dos pasos antes de avanzar.
**Opción B — en paralelo con la rodaja 1b:** son independientes salvo por `tests/datos.test.mjs`, donde cada una añade su propio `describe`. Dos worktrees, dos PR.
**Opción C — en línea:** ejecución seguida con parada después de cada `commit`.

## Decisión que registra este plan

`memory/07-decisions-log.md`: «2026-09-06 — Rótulo 1a: los campos de tienda entran con guarda aritmética (el Place ID se verifica contra el CID) y la libertad por tienda se limita a un intercambio de un bloque».
