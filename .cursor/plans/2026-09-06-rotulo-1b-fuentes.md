# Rodaja 1b de Rótulo — las dos fuentes propias, generadas y medidas — Implementation Plan

**Date:** 2026-09-06
**Branch:** `feat/rotulo-fuentes`
**Author:** User + Claude Opus 5
**Status:** Draft

## Goal

Dejar en `public/fonts/` las dos únicas fuentes que Rótulo descarga —la display del cartel y la cursiva de una palabra—, generadas con un comando reproducible desde un commit fijo del repositorio de Google Fonts, medidas contra el tope de peso y protegidas por un test que impide que un rótulo nuevo caiga a la fuente del sistema sin que nadie se entere.

## Architecture

El presupuesto de peso vive en `src/data/presupuesto.ts` y lo aplica la integración `usafitness:validar-datos` de `astro.config.mjs`: suma los ficheros que `fuentesDeLaPagina` declara más el CSS comprimido, y **revienta el build** por encima de 120 KB. `usaFuenteBase: false` es lo único que saca la fuente base del cómputo y de la precarga, pero existe hoy en `PlantillaConPeso` y **no** en la interfaz `Template`: declararlo en el catálogo sin ampliar la interfaz funciona por accidente en tiempo de ejecución y es un error de tipos que nadie ve, porque el CI no corre comprobación de tipos. Esta rodaja lo arregla antes de que haga falta.

Las fuentes se generan con fontTools, que es software libre, desde los ficheros fuente de `google/fonts` a un commit anclado: mismo commit y mismas listas de caracteres dan los mismos bytes en cualquier máquina.

## Tech Stack touched

Python 3 con `fonttools` y `brotli` (solo para generar, no en tiempo de ejecución) · Astro 6 · `node:test`.

## Success criteria (observable)

- [ ] `python scripts/fuentes-rotulo.py` genera dos ficheros y, ejecutado dos veces, produce **los mismos bytes**.
- [ ] `public/fonts/archivo-expanded-black-rotulo.woff2` pesa 5.124 bytes y `public/fonts/rotulo-script.woff2` 4.520 bytes; los dos por debajo del techo de 6 KB que fija el test.
- [ ] Los dos ficheros no tienen tabla de ejes (son instancias estáticas a propósito) y la display declara ancho expandido: `usWidthClass` 7 y avance de la M de 1,178 em.
- [ ] Cada carácter de los ocho rótulos de `stores.json` está en la display; cada carácter de las palabras en cursiva está en la script. Añadir un rótulo con una letra que falta **pone el test rojo**.
- [ ] `npm run build` verde y el peso de las plantillas vivas no cambia: hasta que exista `TEMPLATES.rotulo`, las fuentes están en disco pero no las declara nadie.
- [ ] `public/fonts/LICENCIAS.md` nombra las dos licencias y por qué la cursiva está renombrada.

## Files

| Acción | Ruta | Para qué |
|---|---|---|
| Crear | `scripts/fuentes-rotulo.py` | Descarga, instancia, subsetea y verifica. |
| Crear | `src/data/fuentes/glifos-rotulo.txt` | Los caracteres que la display lleva dentro. |
| Crear | `src/data/fuentes/palabras-script.txt` | Las palabras que la cursiva puede escribir. |
| Crear | `public/fonts/archivo-expanded-black-rotulo.woff2` | La display del cartel. |
| Crear | `public/fonts/rotulo-script.woff2` | La cursiva de una palabra por titular. |
| Crear | `public/fonts/LICENCIAS.md` | Las licencias de lo que servimos. |
| Modificar | `src/data/templates.ts` | `usaFuenteBase` y `modo` en la interfaz `Template`. |
| Modificar | `src/data/presupuesto.ts` | La fila medida de Rótulo en la cabecera. |
| Modificar | `tests/datos.test.mjs`, `tests/smoke.test.mjs` | El test de cobertura de glifos y el de existencia generalizado. |

---

## Task 1 — Las dos listas de caracteres

**Files touched:** Crear `src/data/fuentes/glifos-rotulo.txt` y `src/data/fuentes/palabras-script.txt`

- [ ] **Step 1.1 — Escribir las listas.** `glifos-rotulo.txt`, en una sola línea sin salto final:

  ```
  ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑÜ0123456789 .,:–·%×→¿¡-−+/&!'’
  ```

  `palabras-script.txt`:

  ```
  socio aquí hoy gratis Stronger Journey Sport Success
  ```

  > Las cuatro palabras en inglés son las que cuelgan en la pared de la tienda, no invenciones: salen del render de local del material de marca. Las cuatro en español son las de los titulares propios. Añadir una palabra obliga a regenerar el fichero, y eso es la regla de escasez convertida en mecanismo.

- [ ] **Step 1.2 — Commit.**
  **Run:** `git add src/data/fuentes && git commit -m "chore(fuentes): las dos listas que fijan que puede escribir cada fuente de Rotulo"`

---

## Task 2 — El generador

**Files touched:** Crear `scripts/fuentes-rotulo.py`

- [ ] **Step 2.1 — Escribir el script.** El cuerpo verificado el 2026-09-06 (produjo los dos ficheros y la comprobación de cobertura salió limpia):

  ```python
  """
  LAS DOS FUENTES DE RÓTULO, GENERADAS DE FORMA REPRODUCIBLE

  Rótulo descarga exactamente dos ficheros y ninguno más: la display del cartel
  y la cursiva de una palabra por titular. El cuerpo va con la fuente del
  sistema, que pesa cero.

  Por qué se generan aquí y no se bajan del CDN de Google:
    · Google no acota los ejes de una fuente variable. Pedirle «solo ancho 125 y
      peso 900» y pedirle la familia entera devuelven EL MISMO fichero de 90.104
      bytes. Instanciada y subseteada aquí, la display pesa 5.124.
    · El parámetro `text=` de su API genera URLs efímeras que dependen del
      agente de usuario: sirve para probar, no para construir.
    · Subsetear una fuente es modificarla. La OFL permite hacerlo, pero exige
      renombrar si la familia tiene nombre reservado. Aquí se hace explícito.

  Requisitos: pip install fonttools brotli
  Uso: python scripts/fuentes-rotulo.py
  """
  import io, os, subprocess, sys, urllib.request
  from fontTools.ttLib import TTFont

  # Commit anclado de google/fonts. Sin anclar, dos builds pueden producir
  # métricas distintas y descolocar la fórmula del tamaño del rótulo.
  COMMIT = '5e35378e6bda803962ee6fd257e444a7d459660d'
  RAW = f'https://raw.githubusercontent.com/google/fonts/{COMMIT}/'

  RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  TMP = os.path.join(RAIZ, '.fuentes-tmp')
  FONTS = os.path.join(RAIZ, 'public', 'fonts')
  LISTAS = os.path.join(RAIZ, 'src', 'data', 'fuentes')
  os.makedirs(TMP, exist_ok=True)

  ORIGEN = {
      'Archivo[wdth,wght].ttf': 'ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf',
      'Allura-Regular.ttf': 'ofl/allura/Allura-Regular.ttf',
      'OFL-archivo.txt': 'ofl/archivo/OFL.txt',
      'OFL-allura.txt': 'ofl/allura/OFL.txt',
  }

  def bajar(nombre, ruta):
      destino = os.path.join(TMP, nombre)
      if not os.path.exists(destino):
          req = urllib.request.Request(RAW + ruta, headers={'User-Agent': 'usafitness-fuentes/1.0'})
          io.open(destino, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
      return destino

  def correr(args):
      subprocess.run([sys.executable, '-m'] + args, check=True, cwd=TMP)

  for nombre, ruta in ORIGEN.items():
      bajar(nombre, ruta)

  # 1. Display: instancia estática en el único punto de diseño que usa Rótulo.
  correr(['fontTools.varLib.instancer', 'Archivo[wdth,wght].ttf', 'wdth=125', 'wght=900', '-o', 'archivo-125-900.ttf'])
  correr(['fontTools.subset', 'archivo-125-900.ttf',
          f'--text-file={os.path.join(LISTAS, "glifos-rotulo.txt")}',
          '--flavor=woff2', '--no-hinting', '--desubroutinize',
          '--name-IDs=0,1,2,3,4,5,6,13,14', '--notdef-outline',
          f'--output-file={os.path.join(FONTS, "archivo-expanded-black-rotulo.woff2")}'])

  # 2. Cursiva: subset por palabras. Allura es OFL SIN nombre reservado, así que
  #    no hay que renombrarla; si algún día se cambia por una que sí lo tenga
  #    (Sacramento, Kaushan), hay que reescribir los name IDs 1/4/16 y 3/6.
  correr(['fontTools.subset', 'Allura-Regular.ttf',
          f'--text-file={os.path.join(LISTAS, "palabras-script.txt")}',
          '--flavor=woff2', '--no-hinting',
          '--name-IDs=0,1,2,3,4,5,6,13,14', '--notdef-outline',
          f'--output-file={os.path.join(FONTS, "rotulo-script.woff2")}'])

  # 3. Verificación: lo que se acaba de generar es lo que se cree que es.
  display = TTFont(os.path.join(FONTS, 'archivo-expanded-black-rotulo.woff2'))
  script = TTFont(os.path.join(FONTS, 'rotulo-script.woff2'))
  assert 'fvar' not in display, 'la display tiene que ser ESTÁTICA: sobran los ejes'
  assert display['OS/2'].usWidthClass == 7, 'la display no salió expandida'
  assert display['OS/2'].usWeightClass == 900
  m = display['hmtx'][display.getBestCmap()[ord('M')]][0] / display['head'].unitsPerEm
  assert abs(m - 1.178) < 0.001, f'el avance de la M cambió: {m}'

  falta = [c for c in io.open(os.path.join(LISTAS, 'glifos-rotulo.txt'), encoding='utf-8').read()
           if ord(c) not in display.getBestCmap()]
  assert not falta, f'la display no cubre: {falta}'
  falta = [c for c in io.open(os.path.join(LISTAS, 'palabras-script.txt'), encoding='utf-8').read()
           if c != ' ' and ord(c) not in script.getBestCmap()]
  assert not falta, f'la cursiva no cubre: {falta}'

  for f in ['archivo-expanded-black-rotulo.woff2', 'rotulo-script.woff2']:
      print(f'{f}: {os.path.getsize(os.path.join(FONTS, f))} B')
  ```

  **Run:** `python scripts/fuentes-rotulo.py`
  **Expected:** imprime `archivo-expanded-black-rotulo.woff2: 5124 B` y `rotulo-script.woff2: 4520 B`, sin ninguna aserción rota.

- [ ] **Step 2.2 — Reproducibilidad.** Borra los dos woff2 y vuelve a ejecutar.
  **Run:** `python scripts/fuentes-rotulo.py && node -e "const c=require('node:crypto'),f=require('node:fs');for(const x of ['archivo-expanded-black-rotulo.woff2','rotulo-script.woff2'])console.log(x, c.createHash('sha256').update(f.readFileSync('public/fonts/'+x)).digest('hex').slice(0,16))"`
  **Expected:** las mismas dos huellas que la primera vez.

- [ ] **Step 2.3 — Ignorar el temporal.** Añade `/.fuentes-tmp/` a `.gitignore`.

- [ ] **Step 2.4 — Commit.**
  **Run:** `git add scripts/fuentes-rotulo.py .gitignore public/fonts/archivo-expanded-black-rotulo.woff2 public/fonts/rotulo-script.woff2 && git commit -m "feat(fuentes): las dos fuentes de Rotulo, generadas desde un commit fijo de google/fonts"`

---

## Task 3 — Las licencias

**Files touched:** Crear `public/fonts/LICENCIAS.md`

- [ ] **Step 3.1 — Escribirlo.**

  ```markdown
  # Las fuentes que servimos, y con qué permiso

  | Fichero | Familia original | Licencia | Nombre reservado | Qué le hemos hecho |
  |---|---|---|---|---|
  | `inter-latin.woff2`, `inter-latin-ext.woff2` | Inter (rsms) | SIL Open Font License 1.1 | no | subset latin de la distribución oficial |
  | `barlow-condensed-700/800-latin.woff2` | Barlow Condensed (Jeremy Tribby) | SIL OFL 1.1 | no | subset latin |
  | `archivo-expanded-black-rotulo.woff2` | Archivo (Omnibus-Type) | SIL OFL 1.1 | no | instanciada a ancho 125 / peso 900 y subseteada a los caracteres de `src/data/fuentes/glifos-rotulo.txt` |
  | `rotulo-script.woff2` | Allura (TypeSETit) | SIL OFL 1.1 | no | subseteada a las palabras de `src/data/fuentes/palabras-script.txt` |

  Subsetear una fuente es modificarla, y la OFL lo permite. Lo que no permite es
  conservar un **nombre reservado** en una versión modificada: si alguna vez se
  cambia la cursiva por Sacramento o Kaushan Script, que sí lo tienen, hay que
  renombrar la tabla de nombres antes de publicarla. Allura y Archivo no tienen
  nombre reservado, así que se sirven con el suyo.

  Los avisos de licencia viajan dentro de cada woff2 (identificadores 13 y 14 de
  la tabla de nombres), que es lo que la OFL pide para el software incrustado.
  Los textos completos están en el repositorio de origen, anclado en
  `scripts/fuentes-rotulo.py`.
  ```

- [ ] **Step 3.2 — Commit.**
  **Run:** `git add public/fonts/LICENCIAS.md && git commit -m "docs(fuentes): las licencias de lo que servimos, y por que"`

---

## Task 4 — El contrato de plantilla

**Files touched:** Modificar `src/data/templates.ts`, `src/data/presupuesto.ts`

- [ ] **Step 4.1 — Ampliar la interfaz.** En `interface Template`, después de `fonts`:

  ```ts
    /**
     * `false` cuando la plantilla NO usa la familia base para nada: entonces
     * Inter deja de precargarse y de contar en el presupuesto.
     *
     * Ojo, y por eso está aquí escrito: esto solo quita la PRECARGA. El
     * `@font-face` de Inter sigue en global.css y `--font-family` la nombra, así
     * que una plantilla con `usaFuenteBase: false` que no sobrescriba ese token
     * hace que el navegador se la descargue igual — y el tope no lo vería,
     * porque mide lo declarado, no lo servido. Las dos cosas van juntas.
     */
    usaFuenteBase?: boolean;
    /**
     * Cómo responde la plantilla al ajuste claro/oscuro del sistema. `claro`
     * (por defecto) ignora la preferencia; `auto` invierte sus superficies
     * blancas. Es infraestructura, nunca una plantilla aparte.
     */
    modo?: 'claro' | 'auto';
  ```

- [ ] **Step 4.2 — La fila medida.** En la cabecera de `src/data/presupuesto.ts`, bajo las dos filas que ya están:

  ```
   *     rótulo   9 KB (Archivo Expanded Black 5 + cursiva 4) + ~13 KB de CSS = 22 KB,
   *              sin Inter (usaFuenteBase:false). Medido el 2026-09-06 con
   *              scripts/fuentes-rotulo.py; el CSS es estimación calibrada
   *              contra global.css + energía, y se re-mide cuando exista la hoja.
  ```

  **Run:** `npm run build && npm test` · **Expected:** verde, sin cambios de peso: todavía ninguna plantilla declara las fuentes nuevas.

- [ ] **Step 4.3 — Commit.**
  **Run:** `git add src/data/templates.ts src/data/presupuesto.ts && git commit -m "feat(plantillas): usaFuenteBase y modo entran en el contrato Template"`

---

## Task 5 — El test que impide el fallo silencioso

**Files touched:** Modificar `tests/datos.test.mjs`, `tests/smoke.test.mjs`

- [ ] **Step 5.1 — Test en rojo.** En `tests/datos.test.mjs`:

  ```js
  describe('Una fuente subseteada no puede quedarse sin una letra', () => {
    // El riesgo real de subsetear: un rótulo con una letra que no está dentro
    // no da error, se pinta con la fuente del sistema y nadie se entera hasta
    // ver la captura. Esto lo convierte en un test rojo.
    const dentroDe = async (fichero) => {
      const { readFileSync } = await import('node:fs');
      const woff2 = readFileSync('public/fonts/' + fichero);
      // La tabla cmap de un woff2 no se lee sin descomprimir; en vez de meter
      // una dependencia, se comprueba contra la LISTA que generó el fichero,
      // que es la fuente de verdad de lo que lleva dentro.
      return new Set(readFileSync('src/data/fuentes/' + (fichero.includes('script') ? 'palabras-script.txt' : 'glifos-rotulo.txt'), 'utf8'));
    };

    test('cada letra de los ocho rótulos está en la display', async () => {
      const cubiertos = await dentroDe('archivo-expanded-black-rotulo.woff2');
      for (const t of stores) {
        if (!t.rotulo) continue;
        for (const c of t.rotulo.replace(/\|/g, '')) {
          assert.ok(cubiertos.has(c), `${t.slug}: el rótulo usa "${c}" y la fuente no lo lleva`);
        }
      }
    });

    test('los dos ficheros existen y no engordan', async () => {
      const { statSync } = await import('node:fs');
      for (const [f, tope] of [['archivo-expanded-black-rotulo.woff2', 6144], ['rotulo-script.woff2', 6144]]) {
        const n = statSync('public/fonts/' + f).size;
        assert.ok(n > 0 && n <= tope, `${f} pesa ${n} B y el techo son ${tope}`);
      }
    });
  });
  ```

  En `tests/smoke.test.mjs`, generaliza el test de existencia para que cubra cualquier plantilla futura:

  ```js
  test('las fuentes que declara CUALQUIER plantilla existen de verdad en public/', async () => {
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
  ```

  **Run:** `npm run test:ci` · **Expected:** verde (los rótulos de la rodaja 1a ya están y sus letras están cubiertas).

- [ ] **Step 5.2 — Mutación.** Pon `rotulo: "LAGOH·"` en lagoh y quita el `·` de `glifos-rotulo.txt`.
  **Run:** `node --test tests/datos.test.mjs` · **Expected:** ROJO con «lagoh: el rótulo usa "·" y la fuente no lo lleva». Deshaz las dos cosas.

- [ ] **Step 5.3 — Commit.**
  **Run:** `git add tests/ && git commit -m "test(fuentes): un rotulo con una letra fuera del subset se pone rojo, no silencioso"`

---

## Self-review

1. **Cobertura.** Los seis criterios tienen tarea: generación y reproducibilidad (2.1, 2.2), pesos (2.1, 5.1), estructura de la fuente (aserciones del script), cobertura de glifos (5.1), build verde (4.2), licencias (3.1).
2. **Sin placeholders.** El script está entero y verificado; los dos ficheros que produce ya existen medidos.
3. **Consistencia.** Los nombres de fichero aparecen idénticos en script, test, licencias y presupuesto.
4. **Caminos de error.** El script rompe con aserción si la fuente sale variable, si el ancho no es expandido, si la M cambia de avance o si falta un carácter. El test cubre el fallo silencioso del subset. Sin cubrir: que `google/fonts` retire el commit anclado, en cuyo caso la descarga falla ruidosamente.
5. **Test primero.** La tarea 5 llega después de los ficheros a propósito: no se puede escribir un test de cobertura contra un fichero que no existe. Su mutación (5.2) es la que demuestra que sirve.
6. **Tamaño.** Cinco tareas cortas; la más larga es la 2 y son unos ocho minutos.
7. **Dependencias.** `fonttools` y `brotli` en Python, solo para generar. No entra nada en tiempo de ejecución ni en el paquete de Node. Alternativa considerada y descartada: bajar los ficheros del CDN de Google, que no permite acotar ejes y da URLs efímeras.

**Lo más frágil:** el peso del CSS de Rótulo (unos 13 KB comprimidos) es una calibración contra `global.css` y la hoja de Energía, no una medida: la hoja aún no existe. El margen es enorme —22 KB usados de 120— así que el riesgo es de exactitud en la documentación, no de romper el tope.

**Lo que no cubre:** la elección definitiva de la cursiva. Allura es la que va escrita aquí porque no tiene nombre reservado y su trazo fino coincide con el del cartel de tienda, que he mirado. Cambiarla por Sacramento cuesta dos líneas del script más el renombrado, y sigue cabiendo.

## Execution

**Opción A — en línea:** son cinco tareas cortas y ninguna necesita revisión de dos pasos.
**Opción B — en paralelo con la rodaja 1a:** independientes salvo por `tests/datos.test.mjs`. El test 5.1 lee `t.rotulo`, así que si van en paralelo, esta rama se rebasa sobre la de 1a antes de mezclar.

## Decisión que registra este plan

`memory/07-decisions-log.md`: «2026-09-06 — Rótulo 1b: fuentes generadas con fontTools desde un commit anclado, no bajadas del CDN; instancia estática en vez de variable acotada (5 KB frente a 90); Allura como cursiva por no tener nombre reservado y por parecerse al cartel real».
