# Alta de tienda automatizada — Plan de implementación

**Date:** 2026-08-26
**Branch:** `feat/alta-de-tienda-automatizada`
**Author:** User + Claude Opus 5
**Status:** Draft

## Goal

Que dar de alta una tienda deje de costar una sesión y pase a costar una revisión.

## Architecture

Dos módulos puros en `src/build/` (extracción y composición, testables sin red) y un guion de E/S en `scripts/` que hace las peticiones, escribe ficheros e imprime el informe. Es la misma separación que ya funcionó con `src/data/salud.ts`: la lógica se prueba, la cáscara solo mueve bytes.

## Tech Stack tocado

Node 24 (TypeScript nativo), `node:test`, `sharp` (para fotos — ver Task 5). Ninguna dependencia de runtime nueva: el sitio publicado no cambia ni un byte.

---

## Por qué este plan existe, y por qué ahora

El modelo de venta decidido el 2026-08-26 es **a cada franquiciado**. Eso mueve el techo del negocio de operativo a comercial:

```
operar 58 tiendas    →  43,5 h/mes  →  cabe de sobra
51 altas manuales    →  204-306 h   →  25 meses a 2 altas/mes
```

**El alta es la restricción.** Cada hora que se recorte es una tienda más al año. Montar Lagoh (tienda 8) llevó una sesión entera, y de todo aquello **una sola decisión necesitó criterio humano**: elegir el plano general mirando las fotos.

## Y una cosa que descubrí planificando esto, que cambia el diseño

Probé mi propio método de resolución de fichas de Google contra cuatro tiendas que no están en el repo, sin guiarlo. **Falló, y falló en silencio:**

| tienda | coordenadas que devolvía | dónde está de verdad |
|---|---|---|
| La Vaguada | `34.77, -3.70` | Madrid (**eso es Marruecos**) |
| Moncloa | `36.80, -3.71` | Madrid (**eso es Granada**) |

Funcionaba a mano porque yo comparaba cada resultado con lo que sabía. Automatizado, habría metido coordenadas de otro país sin que nadie lo notara — exactamente el fallo que este proyecto lleva días arreglando.

**La causa:** buscaba «cualquier par de decimales» en el payload. Google emite una estructura que da nombre, dirección postal completa, coordenadas y CID **juntos**:

```
"USA Fitnes C.C La Vaguada, Av. de Monforte de Lemos, 36, Fuencarral-El Pardo, 28029 Madrid",[40.4803129,-3.7055636],"7436451405124138054"
```

Anclando ahí, la extracción reproduce **exactamente** los datos que verifiqué a mano para Vigo y Lagoh, y devuelve *no resuelto* para Nevada Shopping en vez de inventar. Ese es el patrón sobre el que se construye todo lo demás.

---

## Success criteria (observables)

- [ ] **C1** — `npm run alta -- investigar <nombre-o-dominio>` produce un expediente con la ficha resuelta o un «no resuelto» explícito, y **no escribe nada** en el repo.
- [ ] **C2** — La extracción de ficha reproduce, sobre HTML guardado, el CID y las coordenadas verificados a mano de Vigo (`13733725187430675717`, `42.220823,-8.724406`) y Lagoh (`12953955987222298776`, `37.3429771,-5.988432`).
- [ ] **C3** — Un payload sin entidad resuelta (Nevada Shopping) devuelve `null`, nunca una coincidencia parcial.
- [ ] **C4** — Una ficha cuyo código postal no corresponde a la provincia esperada se **rechaza** con el motivo, aunque traiga CID y coordenadas.
- [ ] **C5** — La verificación de Instagram usa control positivo **y** negativo en la misma tanda; si el control positivo falla, el guion aborta con «método roto» en vez de reportar «no encontrada».
- [ ] **C6** — `npm run alta -- aplicar <nombre-o-dominio> --portada N` escribe la entrada y las fotos, y el build valida sin tocar nada a mano.
- [ ] **C7** — Sin `--portada`, `aplicar` se niega a continuar y remite a la hoja de contacto.
- [ ] **C8** — `npm run build && npm test` verde tras dar de alta una tienda con el guion.

---

## Files

| Acción | Ruta | Propósito |
|---|---|---|
| Crear | `src/build/ficha-google.ts` | Extraer nombre, dirección, coords y CID de un payload. Puro. |
| Crear | `src/build/alta.ts` | Componer la entrada de tienda y listar lo que falta. Puro. |
| Crear | `scripts/alta-tienda.mjs` | La cáscara: peticiones, ficheros, informe. |
| Crear | `tests/fixtures/` | Payloads guardados de Vigo, Lagoh y Nevada Shopping. |
| Modificar | `tests/datos.test.mjs` | Tests de las dos piezas puras. |
| Modificar | `package.json` | `sharp` como devDependency + guion `alta`. |

**Fuera de este plan a propósito:** hacer `mall` opcional (bloquea las 11 tiendas a pie de calle — es riesgo #8 de `memory/08` y va aparte, porque toca render), y el muestrario.

---

## Task 1 — La extracción, con los tres casos que importan

Va primera porque es donde estaba el fallo silencioso.

**Ficheros:** `tests/fixtures/`, `tests/datos.test.mjs`, `src/build/ficha-google.ts`

### Steps

- [ ] **1.1** — Guardar los tres payloads reales como fixtures. Los tests no salen a la red: un test que depende de Google es un test que se pone rojo por causas ajenas.
  ```bash
  mkdir -p tests/fixtures
  for x in "vigo USA+Fitness+C.C+Gran+Via+de+Vigo" "lagoh USA+Fitness+Lagoh+Sevilla" "sin-resolver USA+Fitness+C.C+Nevada+Shopping"; do
    set -- $x
    curl -sL -m 25 "https://www.google.com/maps?q=$2&output=embed" -o "tests/fixtures/ficha-$1.html"
    echo "$1: $(wc -c < tests/fixtures/ficha-$1.html) bytes"
  done
  ```
  **Expected:** tres ficheros, los dos primeros ~3.5 KB, el tercero ~5.3 KB.

- [ ] **1.2** — Test primero. En `tests/datos.test.mjs`:
  ```js
  describe('Extraer la ficha de Google de un payload', () => {
    const fixture = (n) => readFileSync(new URL(`./fixtures/ficha-${n}.html`, import.meta.url), 'utf8');

    test('reproduce los datos que se verificaron a mano', async () => {
      // Vigo y Lagoh se verificaron uno a uno el 25 y el 26 de agosto, con
      // round-trip del feature id y comprobando el nombre. Si la extracción
      // automática no reproduce EXACTAMENTE eso, no sirve.
      const { extraerFicha } = await import('../src/build/ficha-google.ts');

      const vigo = extraerFicha(fixture('vigo'));
      assert.equal(vigo.cid, '13733725187430675717');
      assert.equal(vigo.lat, 42.220823);
      assert.equal(vigo.lng, -8.724406);
      assert.match(vigo.nombre, /USA Fitness/i);

      const lagoh = extraerFicha(fixture('lagoh'));
      assert.equal(lagoh.cid, '12953955987222298776');
      assert.equal(lagoh.lat, 37.3429771);
    });

    test('un payload sin entidad resuelta devuelve null, no una coincidencia parcial', async () => {
      // Nevada Shopping devuelve un payload MÁS GRANDE (5,3 KB) con una lista de
      // candidatos y sin `spotlit`. El tamaño no distingue: hay que mirar la
      // estructura. Devolver algo aquí sería inventar una ficha.
      const { extraerFicha } = await import('../src/build/ficha-google.ts');
      assert.equal(extraerFicha(fixture('sin-resolver')), null);
    });

    test('no coge un par de decimales cualquiera del payload', async () => {
      // El fallo real: buscar /(\d+\.\d+),(\d+\.\d+)/ devolvía 34.77,-3.70 para
      // La Vaguada — Marruecos en vez de Madrid — porque el payload trae otros
      // pares antes del bueno. La extracción tiene que anclarse a la estructura
      // "<texto>",[lat,lng],"<cid>" y no a la forma de un número.
      const { extraerFicha } = await import('../src/build/ficha-google.ts');
      const v = extraerFicha(fixture('vigo'));
      assert.ok(v.lat > 41 && v.lat < 44, `${v.lat} no está en Galicia`);
    });
  });
  ```
  **Run:** `node --test tests/datos.test.mjs`
  **Expected:** FAIL — `Cannot find module '../src/build/ficha-google.ts'`.

- [ ] **1.3** — Implementar `src/build/ficha-google.ts`:
  ```ts
  /**
   * EXTRAER UNA FICHA DE GOOGLE DE SU PAYLOAD DE EMBED
   *
   * Google emite la entidad resuelta como una tripleta: el texto (nombre más
   * dirección postal completa), las coordenadas, y el CID. Juntos y en ese
   * orden:
   *
   *   "USA Fitnes C.C La Vaguada, Av. de Monforte de Lemos, 36, 28029 Madrid",
   *   [40.4803129,-3.7055636],"7436451405124138054"
   *
   * ANCLARSE A ESA ESTRUCTURA NO ES UN DETALLE DE ESTILO. El primer intento
   * buscaba «cualquier par de decimales» y devolvía coordenadas de Marruecos
   * para una tienda de Madrid, en silencio, con CID correcto al lado. Un dato
   * plausible y falso es peor que ninguno: el falso se publica.
   */
  export interface FichaGoogle {
    /** Nombre tal como lo tiene Google. Puede traer erratas del propio dueño. */
    nombre: string;
    /** Dirección postal completa. Es lo que arregla los `streetAddress` que hoy
     *  son "C.C. Marineda City, A Coruña" — que no es una dirección. */
    direccion: string;
    lat: number;
    lng: number;
    /** Identificador numérico del negocio. Es el dato que hay que custodiar:
     *  las URLs se regeneran desde él, él no se regenera desde nada. */
    cid: string;
  }

  const TRIPLETA = /"([^"]{5,200}?)",\[(-?\d{1,3}\.\d{4,}),(-?\d{1,3}\.\d{4,})\],"(\d{15,20})"/;

  export function extraerFicha(payload: string): FichaGoogle | null {
    // `spotlit` es la señal de que Google resolvió UNA entidad. Sin ella, el
    // payload es una lista de candidatos o un mapa vacío — y puede ser más
    // grande que uno resuelto, así que el tamaño no vale como criterio.
    if (!payload.includes('spotlit')) return null;

    const m = TRIPLETA.exec(payload);
    if (!m) return null;

    const [, texto, lat, lng, cid] = m;
    const coma = texto.indexOf(',');
    return {
      nombre: coma > 0 ? texto.slice(0, coma).trim() : texto.trim(),
      direccion: coma > 0 ? texto.slice(coma + 1).trim() : '',
      lat: Number(lat),
      lng: Number(lng),
      cid,
    };
  }
  ```
  **Run:** `node --test tests/datos.test.mjs`
  **Expected:** PASS, 3 tests nuevos.

- [ ] **1.4** — Commit.
  ```bash
  git add src/build/ficha-google.ts tests/fixtures tests/datos.test.mjs
  git commit -m "feat(alta): extraer la ficha de Google anclando a su estructura"
  ```

---

## Task 2 — Las guardas: que un dato plausible no pase por bueno

La extracción ya no coge números al azar. Falta que **compruebe que la ficha es de la tienda que se pide**.

**Ficheros:** `tests/datos.test.mjs`, `src/build/ficha-google.ts`

### Steps

- [ ] **2.1** — Test primero:
  ```js
  describe('Una ficha se acepta solo si es de la tienda que se pide', () => {
    test('el código postal tiene que caer en la provincia esperada', async () => {
      // La guarda que habría cazado el fallo de Marruecos sin depender de la
      // extracción: los dos primeros dígitos del CP son la provincia.
      const { verificarFicha } = await import('../src/build/ficha-google.ts');
      const vaguada = {
        nombre: 'USA Fitnes C.C La Vaguada',
        direccion: 'Av. de Monforte de Lemos, 36, Fuencarral-El Pardo, 28029 Madrid',
        lat: 40.4803129, lng: -3.7055636, cid: '7436451405124138054',
      };
      assert.equal(verificarFicha(vaguada, { termino: 'Vaguada' }).ok, true);

      // Mismo CID y mismo nombre, coordenadas de otro sitio.
      const falseada = { ...vaguada, lat: 34.7717257, lng: -3.7055636 };
      const r = verificarFicha(falseada, { termino: 'Vaguada' });
      assert.equal(r.ok, false);
      assert.match(r.motivo, /coordenadas/i);
    });

    test('el nombre tiene que contener el término distintivo de la tienda', async () => {
      // "USA Fitness" a secas es lo que devolvió Xanadu: correcto pero
      // indistinguible de otras 57. Sin término propio no se acepta solo.
      const { verificarFicha } = await import('../src/build/ficha-google.ts');
      const generica = {
        nombre: 'USA Fitness',
        direccion: 'C. Puerto de Navacerrada, km 22, 28939 Arroyomolinos, Madrid',
        lat: 40.2988544, lng: -3.9281881, cid: '1834720221394051819',
      };
      const r = verificarFicha(generica, { termino: 'Xanadu' });
      assert.equal(r.ok, false);
      assert.match(r.motivo, /nombre/i);
    });

    test('una ficha que no es de USA Fitness se rechaza siempre', async () => {
      // El caso GranCasa: existe la ficha del CENTRO COMERCIAL y "se vería
      // bien". Publicarla sería poner la tarjeta de otro negocio en la web de
      // este cliente.
      const { verificarFicha } = await import('../src/build/ficha-google.ts');
      const centro = {
        nombre: 'Gran Casa', direccion: 'C. de María Zambrano, 35, 50018 Zaragoza',
        lat: 41.6699999, lng: -0.8899999, cid: '13649349957894030431',
      };
      const r = verificarFicha(centro, { termino: 'GranCasa' });
      assert.equal(r.ok, false);
      assert.match(r.motivo, /USA Fitness/i);
    });
  });
  ```
  **Run:** `node --test tests/datos.test.mjs` → **FAIL**: `verificarFicha` no existe.

- [ ] **2.2** — Añadir a `src/build/ficha-google.ts`:
  ```ts
  /**
   * Centro aproximado de cada provincia española por los dos primeros dígitos
   * del código postal. No hace falta precisión: solo detectar que unas
   * coordenadas están en otra punta del país, que es el error real.
   */
  const PROVINCIAS: Record<string, [number, number]> = {
    '01': [42.85, -2.67], '02': [38.99, -1.86], '03': [38.35, -0.48], '04': [36.84, -2.46],
    '05': [40.66, -4.70], '06': [38.88, -6.97], '07': [39.57, 2.65],  '08': [41.39, 2.17],
    '09': [42.34, -3.70], '10': [39.47, -6.37], '11': [36.53, -6.29], '12': [39.99, -0.04],
    '13': [38.99, -3.93], '14': [37.89, -4.78], '15': [43.37, -8.40], '16': [40.07, -2.13],
    '17': [41.98, 2.82],  '18': [37.18, -3.60], '19': [40.63, -3.16], '20': [43.32, -1.98],
    '21': [37.26, -6.94], '22': [42.13, -0.41], '23': [37.77, -3.79], '24': [42.60, -5.57],
    '25': [41.62, 0.62],  '26': [42.46, -2.45], '27': [43.01, -7.56], '28': [40.42, -3.70],
    '29': [36.72, -4.42], '30': [37.99, -1.13], '31': [42.81, -1.65], '32': [42.34, -7.86],
    '33': [43.36, -5.85], '34': [42.01, -4.53], '35': [28.12, -15.43],'36': [42.43, -8.64],
    '37': [40.97, -5.66], '38': [28.47, -16.25],'39': [43.46, -3.80], '40': [40.95, -4.12],
    '41': [37.39, -5.98], '42': [41.76, -2.47], '43': [41.12, 1.25],  '44': [40.34, -1.11],
    '45': [39.86, -4.03], '46': [39.47, -0.38], '47': [41.65, -4.72], '48': [43.26, -2.93],
    '49': [41.50, -5.75], '50': [41.65, -0.89], '51': [35.89, -5.32], '52': [35.29, -2.94],
  };

  const RADIO_PROVINCIA_KM = 120;

  function distanciaKm(a: number, b: number, c: number, d: number): number {
    const R = 6371, r = Math.PI / 180;
    const dp = (c - a) * r, dl = (d - b) * r;
    const x = Math.sin(dp / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dl / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  export interface Veredicto { ok: boolean; motivo: string }

  /**
   * Tres guardas, y ninguna sobra:
   *
   *  1. Es de USA Fitness. Sin esto se enlaza la ficha del centro comercial,
   *     que es la tentación real (pasó con GranCasa).
   *  2. El nombre nombra ESTA tienda. "USA Fitness" a secas es indistinguible
   *     de las otras 57.
   *  3. Las coordenadas caen en la provincia de su código postal. Es la que
   *     habría cazado las coordenadas de Marruecos sin depender de la
   *     extracción — dos comprobaciones independientes del mismo hecho.
   */
  export function verificarFicha(f: FichaGoogle, ctx: { termino: string }): Veredicto {
    if (!/usa\s*fitness/i.test(f.nombre)) {
      return { ok: false, motivo: `"${f.nombre}" no es una ficha de USA Fitness` };
    }

    const normal = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
    if (!normal(f.nombre).includes(normal(ctx.termino))) {
      return { ok: false, motivo: `el nombre "${f.nombre}" no contiene "${ctx.termino}": puede ser otra tienda` };
    }

    const cp = f.direccion.match(/\b(\d{5})\b/)?.[1];
    if (!cp) return { ok: false, motivo: 'la dirección no trae código postal' };

    const centro = PROVINCIAS[cp.slice(0, 2)];
    if (!centro) return { ok: false, motivo: `código postal ${cp}: provincia desconocida` };

    const d = Math.round(distanciaKm(f.lat, f.lng, centro[0], centro[1]));
    if (d > RADIO_PROVINCIA_KM) {
      return { ok: false, motivo: `las coordenadas están a ${d} km del centro de la provincia del CP ${cp}` };
    }

    return { ok: true, motivo: `${f.nombre} · CP ${cp} · a ${d} km del centro de su provincia` };
  }
  ```
  **Run:** `node --test tests/datos.test.mjs`
  **Expected:** PASS.

- [ ] **2.3** — Comprobar la guarda contra el fallo real, no solo contra el test.
  ```bash
  node --input-type=module -e "
  import { extraerFicha, verificarFicha } from './src/build/ficha-google.ts';
  import { readFileSync } from 'node:fs';
  const f = extraerFicha(readFileSync('tests/fixtures/ficha-vigo.html','utf8'));
  console.log('vigo real     :', verificarFicha(f, { termino: 'Vigo' }));
  console.log('vigo falseado :', verificarFicha({...f, lat: 34.77}, { termino: 'Vigo' }));
  "
  ```
  **Expected:** el primero `ok: true`; el segundo `ok: false` con los kilómetros.

- [ ] **2.4** — Commit.
  ```bash
  git add -A && git commit -m "feat(alta): tres guardas para que una ficha plausible no pase por buena"
  ```

---

## Task 3 — Instagram, con el control que faltó

El método de verificar handles **se rompió a mitad** el 26 de agosto: Instagram empezó a devolver 200 sin `og:title` tanto para perfiles reales como inexistentes, y mis «no encontrada» dejaron de significar nada. Se detectó porque el control positivo también falló.

**Ficheros:** `tests/datos.test.mjs`, `src/build/instagram.ts`

### Steps

- [ ] **3.1** — Test primero:
  ```js
  describe('Verificar un perfil de Instagram', () => {
    test('el método se declara roto si el control positivo falla', async () => {
      // Lo que pasó de verdad: Instagram dejó de emitir og:title y todos los
      // perfiles parecían inexistentes. Sin control positivo, el resultado
      // habría sido "ninguna tienda tiene Instagram" — falso y creíble.
      const { evaluarTanda } = await import('../src/build/instagram.ts');
      const r = evaluarTanda({ positivo: null, negativo: null, candidatos: {} });
      assert.equal(r.metodoValido, false);
      assert.match(r.motivo, /control positivo/i);
    });

    test('el método se declara roto si el control negativo devuelve algo', async () => {
      const { evaluarTanda } = await import('../src/build/instagram.ts');
      const r = evaluarTanda({ positivo: 'USA Fitness Vigo', negativo: 'Algo', candidatos: {} });
      assert.equal(r.metodoValido, false);
      assert.match(r.motivo, /control negativo/i);
    });

    test('con los dos controles bien, acepta solo el que nombra la tienda', async () => {
      const { evaluarTanda } = await import('../src/build/instagram.ts');
      const r = evaluarTanda({
        positivo: 'USA FITNESS | Vigo', negativo: null,
        candidatos: {
          'usafitness_c.c.lasrosas': 'Usa fitness C.C. Las Rosas',
          'usafitness_madrid': 'Otra cosa cualquiera',
        },
      }, { termino: 'Las Rosas' });
      assert.equal(r.metodoValido, true);
      assert.equal(r.handle, 'usafitness_c.c.lasrosas');
    });

    test('si ninguno nombra la tienda, no devuelve ninguno', async () => {
      const { evaluarTanda } = await import('../src/build/instagram.ts');
      const r = evaluarTanda({
        positivo: 'USA FITNESS | Vigo', negativo: null,
        candidatos: { 'usafitness_madrid': 'usafitness madrid' },
      }, { termino: 'Las Rosas' });
      assert.equal(r.metodoValido, true);
      assert.equal(r.handle, null);
    });
  });
  ```
  **Run:** `node --test tests/datos.test.mjs` → **FAIL**.

- [ ] **3.2** — Implementar `src/build/instagram.ts`:
  ```ts
  /**
   * VERIFICAR UN PERFIL DE INSTAGRAM, CON CONTROLES
   *
   * Esta pieza existe por un fallo concreto: el 26 de agosto de 2026 el método
   * de comprobación (pedir el perfil y leer og:title) dejó de discriminar —
   * Instagram empezó a devolver 200 sin og:title para perfiles reales E
   * inexistentes. Durante un rato, «no encontrada» no significó nada, y así se
   * perdió la cuenta de Las Rosas, que existía.
   *
   * Se detectó porque el control positivo también falló. De ahí la regla:
   * **cada tanda lleva un perfil que se sabe que existe y uno que se sabe que
   * no.** Si el positivo no aparece o el negativo sí, el método está roto y no
   * se reporta nada — ni encontrado ni no encontrado.
   *
   * Los candidatos se generan aparte; esta función solo juzga.
   */
  export interface Tanda {
    /** og:title del perfil que se sabe que existe. `null` si no vino. */
    positivo: string | null;
    /** og:title del perfil inventado. Debe ser `null`. */
    negativo: string | null;
    /** handle → og:title (o `null` si no vino). */
    candidatos: Record<string, string | null>;
  }

  export interface ResultadoTanda {
    metodoValido: boolean;
    motivo: string;
    handle: string | null;
    nombre: string | null;
  }

  const normal = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

  export function evaluarTanda(t: Tanda, ctx?: { termino: string }): ResultadoTanda {
    if (!t.positivo) {
      return { metodoValido: false, handle: null, nombre: null,
        motivo: 'el control positivo no devolvió nombre: el método está roto, no se reporta nada' };
    }
    if (t.negativo) {
      return { metodoValido: false, handle: null, nombre: null,
        motivo: `el control negativo devolvió "${t.negativo}": el método está roto` };
    }

    for (const [handle, nombre] of Object.entries(t.candidatos)) {
      if (!nombre) continue;
      // El nombre tiene que nombrar ESTA tienda. Sin esto se enlaza la cuenta
      // que más se parezca, que es cómo se acaba mandando a los clientes de una
      // sociedad a la cuenta de otra.
      if (ctx && !normal(nombre).includes(normal(ctx.termino))) continue;
      return { metodoValido: true, handle, nombre, motivo: `"${nombre}" nombra la tienda` };
    }

    return { metodoValido: true, handle: null, nombre: null,
      motivo: 'ningún candidato existe o ninguno nombra esta tienda' };
  }
  ```
  **Run:** `node --test tests/datos.test.mjs` → **PASS**.

- [ ] **3.3** — Commit.
  ```bash
  git add -A && git commit -m "feat(alta): verificar Instagram con control positivo y negativo"
  ```

---

## Task 4 — Componer la entrada y decir qué falta

**Ficheros:** `tests/datos.test.mjs`, `src/build/alta.ts`

### Steps

- [ ] **4.1** — Test primero:
  ```js
  describe('Componer la entrada de una tienda nueva', () => {
    test('lo que sale valida contra el esquema real', async () => {
      // No se prueba contra una copia de las reglas: se prueba contra el mismo
      // esquema que tumba el build. Si divergen, esto se entera.
      const { componerTienda } = await import('../src/build/alta.ts');
      const { entrada } = componerTienda({
        slug: 'prueba', dominio: 'usafitnessprueba.com', nombre: 'USAFITNESS C.C PRUEBA',
        mall: 'C.C. Prueba', telefono: '+34911111111', horario: 'De lunes a domingo: 10:00 a 22:00',
        ficha: { nombre: 'USA Fitness C.C Prueba', direccion: 'C. Falsa, 1, 28001 Madrid',
                 lat: 40.4200001, lng: -3.7000001, cid: '11111111111111111111' },
        instagram: 'usafitness_prueba',
        fotos: ['/photos/prueba/tienda-1.webp'],
      });
      assert.ok(esquemaTiendas.safeParse([entrada]).success,
        JSON.stringify(esquemaTiendas.safeParse([entrada]).error?.issues));
    });

    test('sin ficha, declara el hueco en vez de dejarlo mudo', async () => {
      // El caso GranCasa: sin ficha de Google, la tienda se marca y su sección
      // de mapa no se renderiza. El estado intermedio —sin mapa y sin
      // declararlo— es el que dejó meses de Schema.org sin coordenadas.
      const { componerTienda } = await import('../src/build/alta.ts');
      const { entrada, pendiente } = componerTienda({
        slug: 'p2', dominio: 'p2.com', nombre: 'USAFITNESS P2', mall: 'C.C. P2',
        telefono: '+34911111111', horario: 'De lunes a domingo: 10:00 a 22:00',
        ficha: null, instagram: null, fotos: ['/photos/p2/tienda-1.webp'],
      });
      assert.equal(entrada.googleMapsStatus, 'sin-ficha-gbp');
      assert.ok(!entrada.geo);
      assert.ok(pendiente.some((p) => /ficha de Google/i.test(p)));
    });

    test('siempre reclama los datos legales, que no se pueden automatizar', async () => {
      const { componerTienda } = await import('../src/build/alta.ts');
      const { pendiente } = componerTienda({
        slug: 'p3', dominio: 'p3.com', nombre: 'USAFITNESS P3', mall: 'C.C. P3',
        telefono: '+34911111111', horario: 'De lunes a domingo: 10:00 a 22:00',
        ficha: null, instagram: null, fotos: ['/photos/p3/tienda-1.webp'],
      });
      assert.ok(pendiente.some((p) => /razón social|NIF/i.test(p)));
    });
  });
  ```
  **Run:** `node --test tests/datos.test.mjs` → **FAIL**.

- [ ] **4.2** — Implementar `src/build/alta.ts`. La función compone la entrada con lo verificado y **devuelve además la lista de lo que falta**, que es la mitad útil: es lo que el usuario le pide al franquiciado.
  ```ts
  import type { Tienda } from '../data/stores.ts';
  import type { FichaGoogle } from './ficha-google.ts';

  export interface Materia {
    slug: string;
    dominio: string;
    nombre: string;
    mall: string;
    telefono: string;
    horario: string;
    ficha: FichaGoogle | null;
    instagram: string | null;
    fotos: string[];
  }

  export interface Resultado {
    entrada: Record<string, unknown>;
    /** Lo que no se puede sacar de ninguna fuente y hay que pedir. */
    pendiente: string[];
  }

  /** Formatea +34911111111 como "911 111 111", que es como se enseña. */
  function paraLeer(e164: string): string {
    const d = e164.replace('+34', '');
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }

  export function componerTienda(m: Materia): Resultado {
    const pendiente: string[] = [];

    // Los datos legales no salen de ninguna fuente pública: los da el
    // franquiciado o no existen. Sin ellos las 4 páginas legales van a
    // noindex, que es correcto, pero hay que pedirlos siempre.
    pendiente.push('razón social, NIF, domicilio, email y teléfono legal (los da el franquiciado)');

    if (!m.ficha) {
      pendiente.push('ficha de Google Business: no resuelta. Que envíen el enlace desde Compartir dentro de su panel de Google Business Profile');
    }
    if (!m.instagram) pendiente.push('cuenta de Instagram: no encontrada o no verificable');
    if (m.fotos.length < 4) pendiente.push(`solo ${m.fotos.length} fotos: pedir 5 o 6, con una del escaparate y el rótulo`);

    const cp = m.ficha?.direccion.match(/\b(\d{5})\b/)?.[1];
    const ciudad = m.ficha?.direccion.match(/\d{5}\s+([^,]+)/)?.[1]?.trim();
    if (!cp) pendiente.push('código postal: sin ficha no se puede deducir');

    const entrada: Record<string, unknown> = {
      slug: m.slug,
      name: m.nombre,
      domain: m.dominio,
      // `streetAddress` de la ficha y no del WordPress: los heredados son cosas
      // como "C.C. Marineda City, A Coruña", que no es una dirección postal y
      // rompe el PostalAddress del Schema.org.
      streetAddress: m.ficha?.direccion.split(',').slice(0, 2).join(',').trim() ?? m.mall,
      postalCode: cp ?? '00000',
      title: `Tu tienda de suplementación en ${ciudad ?? m.mall}`,
      subtitle: `Encuéntranos en el ${m.mall}`,
      location: ciudad ?? m.mall,
      metaDescription: `Tienda de nutrición deportiva y suplementos en el ${m.mall}${ciudad ? ` de ${ciudad}` : ''}. Proteínas, creatinas, aminoácidos y asesoramiento personalizado.`,
      phone: m.telefono,
      phoneDisplay: paraLeer(m.telefono),
      schedule: m.horario,
      heroImage: m.fotos[0]?.replace(/tienda-1\.webp$/, 'hero.webp') ?? '',
      reviews: [],
      galleryImages: m.fotos,
      addressLocality: ciudad ?? m.mall,
      addressRegion: ciudad ?? m.mall,
      mall: m.mall,
    };

    if (m.ficha) {
      entrada.geo = { lat: m.ficha.lat, lng: m.ficha.lng };
      entrada.googleMapsEmbed = `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s${m.ficha.cid}!3m1!1ses!5m1!1ses`;
      entrada.googleMapsLink = `https://maps.google.com/?cid=${m.ficha.cid}`;
    } else {
      entrada.googleMapsStatus = 'sin-ficha-gbp';
    }

    if (m.instagram) entrada.social = { instagram: `https://www.instagram.com/${m.instagram}/` };

    // `addressRegion` sale de la ciudad, que a veces no es la provincia. Se
    // marca para revisar en vez de dar por bueno un dato que alimenta el
    // Schema.org.
    pendiente.push(`revisar addressRegion: se ha puesto "${entrada.addressRegion}" a partir de la ciudad, y no siempre es la provincia`);

    return { entrada, pendiente };
  }
  ```
  **Run:** `node --test tests/datos.test.mjs` → **PASS**.

- [ ] **4.3** — Commit.
  ```bash
  git add -A && git commit -m "feat(alta): componer la entrada y devolver lo que hay que pedir"
  ```

---

## Task 5 — El guion, en dos fases

Separadas a propósito: **investigar** no escribe nada y se puede repetir; **aplicar** toca el repo.

**Ficheros:** `package.json`, `scripts/alta-tienda.mjs`

### Steps

- [ ] **5.1** — Declarar `sharp` y el guion.
  ```bash
  npm pkg set devDependencies.sharp="^0.34.5"
  npm pkg set scripts.alta="node scripts/alta-tienda.mjs"
  npm install
  ```
  **Justificación (regla 04):** hace falta convertir fotos a webp con el lado largo a 1400. **Alternativa considerada:** Python con Pillow — descartada porque metería Python en el flujo de un proyecto Node y en el CI. **Impacto:** cero en runtime — es `devDependency`, no viaja al sitio publicado. Y **ya estaba instalado** como dependencia transitiva de Astro: declararlo convierte una dependencia accidental en una explícita.

- [ ] **5.2** — Escribir `scripts/alta-tienda.mjs` con dos subcomandos:
  - `investigar <nombre-o-dominio>` — **acepta las dos formas, y esto no es comodidad**: de las 58 tiendas del directorio de marca solo 8 tienen dominio. Atar el alta a que exista un dominio dejaría 50 tiendas sin poder investigar. Con un nombre («C.C. La Vaguada») resuelve ficha e Instagram, que es de donde sale casi todo; con un dominio, además pide el WordPress y saca teléfono, dirección y horario; resuelve la ficha con `extraerFicha` + `verificarFicha`; verifica Instagram con `evaluarTanda` y sus dos controles; descarga las fotos que encuentre y **monta una hoja de contacto numerada**. Escribe todo en `.alta/<slug>/` (gitignorado) e imprime el expediente con la evidencia de cada dato.
  - `aplicar <dominio> --portada N` — lee el expediente, convierte las fotos poniendo la N primera, las escribe en `public/photos/<slug>/`, compone la entrada con `componerTienda`, la valida con `esquemaTiendas` **antes** de tocar `stores.json`, y añade la entrada. Sin `--portada`, se niega.

  El comentario de cabecera debe decir por qué son dos fases y por qué no hay portada por defecto:
  ```
  * NO HAY PORTADA POR DEFECTO, Y ES DELIBERADO.
  *
  * La primera foto ocupa el hueco grande y es la que decide si la página
  * parece la tienda o parece un estante. Se probó deducirla del ratio: no
  * funciona. En arcangel las 5 fotos son r=1.33 y en marineda las 3 primeras
  * también — empate, y en los dos casos la buena no era la primera. Cuál es
  * el plano general es un DATO, no un cálculo, y la única fuente es un ojo
  * humano mirando la hoja de contacto.
  ```

- [ ] **5.3** — Añadir `.alta/` al `.gitignore`, **anclado**:
  ```bash
  printf "\n# Expedientes de alta de tienda: material de trabajo, no del proyecto\n/.alta/\n" >> .gitignore
  ```
  Anclado con `/` a propósito: el 25 de agosto un patrón sin anclar (`build/`) se tragó `src/build/`, el CI cayó con «Cannot find module» y todo pasaba en local.

- [ ] **5.4** — Probar `investigar` contra una tienda real que no está en el repo. **Por nombre, no por dominio**: `usafitnesslavaguada.com` no existe — lo comprobé al revisar este plan, y era un error mío. Solo 8 de las 58 tiendas tienen dominio.
  ```bash
  npm run alta -- investigar "C.C. La Vaguada"
  ```
  **Expected:** ficha resuelta y verificada — nombre *USA Fitnes C.C La Vaguada* (con la errata que tiene Google), CP `28029` → Madrid, coordenadas `40.4803129,-3.7055636` a pocos km del centro de provincia — y `stores.json` **sin tocar** (`git status --short` limpio).

  Sin dominio no hay WordPress del que sacar teléfono ni horario, así que esos dos salen en `pendiente`. Es el caso normal para 50 de las 58: **el alta no espera al dominio**.

- [ ] **5.5** — Commit.
  ```bash
  git add -A && git commit -m "feat(alta): guion en dos fases, investigar y aplicar"
  ```

---

## Task 6 — La prueba que cuenta: dar de alta una tienda de verdad

**Ficheros:** ninguno nuevo — es la verificación de extremo a extremo.

### Steps

- [ ] **6.1** — Cronometrar un alta completa con el guion, sobre una tienda que sí tiene dominio y WordPress del que sacar datos y fotos. **El Arcángel sirve**: sigue en WordPress, está en el repo, y permite comparar lo que saca el guion contra lo que se metió a mano.
  ```bash
  time (npm run alta -- investigar usafitnesselarcangel.com)
  # comparar el expediente con lo que ya hay en stores.json: debe coincidir
  # (cid 5905550415306352476, geo 37.879133,-4.7657655)
  ```
  Después, el alta de verdad sobre una tienda nueva por nombre:
  ```bash
  time (npm run alta -- investigar "C.C. La Vaguada")
  # revisar la hoja de contacto y elegir la portada
  time (npm run alta -- aplicar "C.C. La Vaguada" --portada 3)
  npm run build && npm test
  ```
  **Expected:** build verde, tests verdes, y la tienda sirviéndose. **Apuntar el tiempo real**: es el número que decide cuántas tiendas caben en un año, y hoy la referencia es «una sesión entera».

- [ ] **6.2** — Comprobar que el guion se niega sin portada.
  ```bash
  npm run alta -- aplicar "C.C. La Vaguada"
  ```
  **Expected:** sale con código distinto de cero y remite a la hoja de contacto.

- [ ] **6.3** — Comprobar que no ha quedado nada suelto.
  ```bash
  git status --short          # solo stores.json y public/photos/<slug>/
  npm run test:armado
  ```

---

## Self-review

1. **Cobertura de criterios.** C1→T5.2/5.4 · C2→T1.2 · C3→T1.2 · C4→T2.1 · C5→T3.1 · C6→T6.1 · C7→T6.2 · C8→T6.1. Sin huecos.
2. **Placeholders.** Ninguno. El único texto sin código literal es el cuerpo de `scripts/alta-tienda.mjs` en T5.2, que se describe por comportamiento y subcomandos porque es cáscara de E/S — toda su lógica está en las tres piezas puras, que sí van completas.
3. **Consistencia.** `extraerFicha`, `verificarFicha`, `evaluarTanda` y `componerTienda` se llaman igual en tests, implementación y guion. `FichaGoogle` es el mismo tipo en las tres.
4. **Rutas de error.** Ficha no resuelta (T1.2), ficha de otro negocio (T2.1), coordenadas fuera de provincia (T2.1), método de Instagram roto (T3.1), sin candidato válido (T3.1), sin portada (T6.2). El caso «sin fotos» queda cubierto por `pendiente`, no por un error: es lo normal en un alta.
5. **Test primero.** T1.2, T2.1, T3.1 y T4.1 son tests antes de código.
6. **Tamaño.** La más larga es T5 (~15 min por el guion). Es cáscara sin lógica; si crece, se parte.
7. **Dependencias.** Una: `sharp`, con justificación, alternativa e impacto en T5.1. Ninguna de runtime.

**Un fallo que tenía este plan y encontré revisándolo:** la prueba de extremo a extremo usaba `usafitnesslavaguada.com`, un dominio que **no existe**. Solo 8 de las 58 tiendas tienen dominio, y las 8 ya están en el repo. Atar el alta al dominio habría dejado 50 tiendas fuera del guion desde el primer día. Corregido: `investigar` acepta nombre o dominio.

**Lo más frágil:** el patrón de la tripleta depende de un formato que Google no documenta. Si lo cambia, `extraerFicha` devuelve `null` — que es el fallo seguro correcto (no resuelve, no inventa), pero deja el alta a medias sin avisar de por qué. Los fixtures detectarían el cambio solo si alguien los regenera.

---

## Riesgos del plan

1. **El patrón no documentado.** Mitigado por diseño: al fallar devuelve `null` y la tienda se marca `sin-ficha-gbp`. No hay ruta en la que invente.
2. **`sharp` como devDependency nueva.** Ya estaba en disco como transitiva de Astro; declararla no descarga nada. Si Astro deja de traerla, `npm install` la baja: eso es lo que arregla declararla.
3. **La tabla de provincias son 52 pares a mano.** Un error tipográfico rechazaría fichas correctas de esa provincia. Es un fallo ruidoso (se ve al dar de alta), no silencioso.
4. **El radio de 120 km es un número elegido.** Suficiente para separar Madrid de Marruecos, insuficiente para detectar un error de 5 km dentro de la misma provincia. Para eso está la regla de los 5 decimales que ya existe en el esquema.
5. **`investigar` sale a la red y Google puede limitar la tasa.** Con 2 altas al mes no es un problema; si se hacen 20 seguidas, sí. No se resuelve aquí.

---

## Execution

**Opción A — Subagentes (recomendada):** `subagent-dispatcher`, uno por tarea con revisión en dos etapas. 6 tareas con dependencias claras y tres piezas puras bien aisladas.
**Opción B — Worktrees:** no aplica; T4 y T5 dependen de T1–T3.
**Opción C — En línea:** lo ejecuto en esta sesión con parada tras cada tarea.
**Opción D — Agente en la nube:** rama y PR al terminar.
**Opción E — Manual:** tú ejecutas, yo asisto.

---

## Lo que este plan NO automatiza, y no puede

- **Elegir el plano general.** Necesita un ojo. El guion prepara la hoja de contacto y exige la decisión.
- **Los datos legales.** No están en ninguna fuente pública. Los da el franquiciado o no existen.
- **Confirmar que el pin cae sobre el local.** La ficha la coloca su dueño en su Google Business Profile.
- **Conseguir fotos decentes.** Lagoh se quedó con un hero al 1,75× porque su WordPress solo guarda 382px.
