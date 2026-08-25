# Triaje de `npm audit` — agosto 2026

- **Fecha:** 2026-08-25
- **Commit base:** `c0fa6a5` (rama `feat/seguimiento-revision-pr1`)
- **Línea base:** [`docs/security/audit-2026-08-25.json`](./audit-2026-08-25.json) — 10 vulnerabilidades a nivel de paquete (8 high, 1 moderate, 1 low), todas con `fixAvailable=true`.
- **Método:** cada veredicto de alcanzabilidad se demostró con comandos (grep sobre `dist/server`, `curl` contra el build en ejecución, lectura de código con `fichero:línea`). Un segundo agente escéptico reejecutó la evidencia e intentó refutar cada "no alcanzable"; sus hallazgos están incorporados.

**Resumen honesto en una frase:** de las 10 vulnerabilidades reportadas, solo una es alcanzable en este despliegue (el 500 por `If-Match` malformado del adaptador Node, que se mitiga con un patch dentro del mismo major); las otras nueve viven en código que este proyecto no empaqueta o en features que no usa, y el cierre definitivo de todas exige el salto mayor a astro@7 que queda fuera de alcance hoy.

---

## 1. Tabla de triaje

| Paquete | Severidad (npm) | Superficie | ¿Alcanzable? | Decisión | Reevaluar cuando |
|---|---|---|---|---|---|
| `@astrojs/node@10.0.4` | moderate (1 mod + 1 low) | runtime-ssr | **Sí** (solo el aviso if-match) | ✅ **MITIGADO** — subido a 10.0.6 | Migración a astro@7; si `trailingSlash` pasa a `"always"`; si la CDN cachea 5xx |
| `astro@6.1.5` | high (2 high + 4 mod + 2 low) | runtime-ssr | No | ACEPTAR | Si se introduce `define:vars`, islas, server islands, slots/spreads dinámicos o `prerender=true` |
| `devalue@5.7.1` | high (CVSS 7.5, solo disponibilidad) | runtime-ssr | No | ACEPTAR | Si se añaden Astro Actions, sesiones activas o cualquier `devalue.parse` sobre input de red |
| `js-yaml@4.1.1` | high (2 high + 1 mod) | no-usado | No | ACEPTAR | Si se añade markdown/MDX/content collections o parseo YAML en runtime |
| `nanoid@3.3.11` | high (CVSS real 5.9) | build | No | ACEPTAR | Si nanoid aparece en `dist/server` tras algún build futuro |
| `postcss@8.5.9` | high (2 high + 2 mod) | build | No | ACEPTAR | Si postcss aparece en `dist/`; si el build procesa CSS de origen externo |
| `sharp@0.34.5` | high (CVE de libvips) | runtime-ssr | No | ACEPTAR | Si se añaden `astro:assets`/uploads/`remotePatterns`; si `/_image` queda expuesto en hosts de tienda |
| `svgo@4.0.1` | high (CVSS 8.2) | no-usado | No | ACEPTAR | Si se activa `experimental.svgo` o se importan SVG como componentes |
| `vite@7.3.2` | high (1 high + 1 mod) | dev-only | No | ACEPTAR | Si producción sirviera vía `astro dev`/`preview`; quitar `host: 0.0.0.0` en dev local (Windows) |
| `esbuild@0.27.7` | low (CVSS 2.5, AV:L) | dev-only | No | ACEPTAR | Si algo del repo usa `esbuild --serve`/`servedir` |

**Balance: 1 MITIGADO (ya aplicado), 9 ACEPTAR, 0 ACTUALIZAR-URGENTE.**

> **Aplicado el 2026-08-25**, no diferido. `@astrojs/node` 10.0.4 → 10.0.6.
> Reproducido antes y después contra el build de producción:
>
> ```
> curl -H 'if-match: malformed-etag' .../usafitness.svg
>   antes:  500      ← cache poisoning
>   después: 412     ← Precondition Failed, la semántica correcta
> ```
>
> Fijado con un test de regresión (`tests/smoke.test.mjs`, bloque *"Una cabecera
> malformada no tumba un estático"*). Es el único de los diez avisos que era
> alcanzable desde internet.

---

## 2. Evidencia por paquete

### 2.1 `@astrojs/node@10.0.4` — MITIGAR

Dos avisos: GHSA-c57f-mm3j-27q9 (moderate, cache poisoning por `If-Match` malformado, <10.0.5) y GHSA-r557-wffq-wvrc (low, open redirect por backslash inicial, >=8.1.0 <11.0.2).

**Aviso 1 (if-match) — ALCANZABLE, confirmado en vivo.** El adaptador standalone ES el servidor: `entry.mjs` reexporta el handler desde `chunks/server_BSoyqO9V.mjs`, donde va empaquetado el serve-static (`send`). Fuente leída: `node_modules/@astrojs/node/dist/serve-static.js` — con `If-Match` malformado, `send` lanza `PreconditionFailedError` y el handler lo mapea a 500 en vez de 412. Los estáticos se sirven ANTES del middleware, así que es alcanzable en cualquier host:

```
curl -D- -o/dev/null -H 'If-Match: "bogus"' http://127.0.0.1:4801/usafitness.svg
→ HTTP/1.1 500 Internal Server Error   (baseline sin header: 200 image/svg+xml)
```

**Aviso 2 (open redirect) — NO alcanzable.** El guard `isInternalPath()` solo aparece en la rama `case "always"` del `switch(trailingSlash)`, y este proyecto tiene `trailingSlash: 'never'` (`astro.config.mjs`; confirmado en el manifest del build: `grep trailingSlash dist/server/chunks/server_BSoyqO9V.mjs` → `"trailingSlash":"never"`). La rama vulnerable es código muerto. Intentos de forzar redirect externo contra el build:

```
//evil.com/      → 404
/\evil.com/      → 404
/%5Cevil.com/    → 301 Location: /%5Cevil.com     (mismo origen; el navegador no decodifica %5C antes de parsear autoridad)
/%5C%5Cevil.com/ → 301 Location: /%5C%5Cevil.com  (ídem)
```

Ningún vector produce un `Location` con host externo.

**Controles compensatorios del aviso 1 mientras no se mitigue:** (a) el 500 solo lo provoca quien envía el header a sí mismo — sin daño a terceros por reflejo; (b) el envenenamiento exige una capa que cachee 5xx y Cloudflare por defecto no cachea 5xx (la respuesta lleva además `Cache-Control: public, max-age=0`); (c) impacto CVSS solo disponibilidad baja (C:N/I:N/A:L).

**Mitigación barata y recomendada ya:** subir de 10.0.4 a **10.0.6**. `npm view @astrojs/node@10.0.6 peerDependencies` → `{astro: ^6.0.0}`: compatible con astro 6.1.5, es un patch dentro del mismo major. **Esto contradice el supuesto del brief de que "el fix implica astro@7 + adapter@11"** — eso solo aplica al aviso low (fix en 11.0.2, peer astro ^7), que queda como riesgo aceptado residual porque no es alcanzable hoy.

*(Este triaje no pasó por refutación del escéptico; su evidencia empírica en vivo — curls A/B contra el build — hace las veces de verificación.)*

### 2.2 `astro@6.1.5` — ACEPTAR

Ocho avisos (XSS en `define:vars`, replay de server islands, XSS por nombres de atributo en spread/renderHTMLElement, XSS vía `transition:*` y View Transitions, SSRF por Host en página de error prerenderizada, XSS por nombre de slot). Todos exigen features que este repo no usa:

1. `define:vars`: `grep -rn 'define:vars' src/` → vacío (exit 1). En dist solo aparece como string de mensaje en `chunks/sequence_mRaxHbWm.mjs`, no como uso.
2. Server islands: `grep -rn 'server:defer|serverIsland' src/` → vacío; en el build `serverIslandMap = new Map([])` está vacío.
3. y 4. Spread props: el único spread de todo src es `<Section {...props} />` en `src/pages/[...slug].astro:44`, y todas las claves son literales estáticos de `src/sections/registry.ts`. El input de atacante (Host, pathname, `?plantilla=` saneado a `[0-9a-z-]{0,12}`) nunca se convierte en NOMBRE de atributo.
4. y 6. `transition:*` / ViewTransitions: `grep -rn 'transition:|ClientRouter|astro:transitions|ViewTransitions' src/` → solo propiedades CSS en `<style>`, cero directivas Astro; sin islas de cliente.
5. SSRF por Host: exige página de error con `prerender: true`. Las 7 rutas (incluida `404.astro:20`) tienen `prerender = false`; `grep -rl '"prerender":true' dist/server/` → vacío.
6. Slot dinámico: `grep -rn 'slot={' src/` → vacío; todos los slots son literales (`Base.astro:112/115`, `Landing.astro:101`).

**El escéptico confirmó no alcanzable** tras reejecutar todo y probar en vivo (PORT=4802). Sobre el candidato más fuerte (SSRF por Host) aportó evidencia adicional: `App.renderError` (`server_BSoyqO9V.mjs:5924`) solo entra en la rama de fetch si `errorRouteData.prerender===true`, y además el adaptador implementa `prerenderedErrorPageFetch` (línea 6697) leyendo `404.html`/`500.html` **de disco**, nunca con fetch de red al origen del Host. Probado: `curl -H 'Host: 169.254.169.254'` a ruta inexistente → 404 en 5.9 ms, sin retardo ni petición saliente. Inyección en `?plantilla=` → el `.replace(/[^0-9a-z-]/gi,'')` elimina el payload (`grep -c 'alert(1)'` = 0 en la respuesta).

**Control real:** la ausencia de las features vulnerables en el bundle — los caminos no existen, no es que estén filtrados en el borde.

**Reevaluar cuando:** se introduzca cualquiera de (a) `define:vars`; (b) islas de cliente / ClientRouter / `transition:*`; (c) server islands; (d) slot o clave de spread derivados de input; (e) `prerender=true` en cualquier página, en especial la de error. También de oficio en el salto a astro@7 (nota: GHSA-4g3v-8h47-v7g6 cubre hasta <=7.0.9; requiere 7.0.10+).

### 2.3 `devalue@5.7.1` — ACEPTAR

GHSA-77vg-94rm-hx3p (CVE-2026-42570): DoS por deserialización de sparse arrays en `devalue.parse`/`unflatten`. Instalado 5.7.1, dentro del rango vulnerable (>=5.6.3 <=5.8.0).

Sí viaja al bundle (`dist/server/chunks/server_BSoyqO9V.mjs:4` importa parse/stringify/unflatten), pero sus funciones solo se llaman en 4 sitios: L849 (`deserializeActionResult`), L1070 (serializa respuesta de action), L4266/L4271 (clase `AstroSession`). Los dos consumidores no reciben input de atacante:

- **Astro Actions:** `grep -rln "astro:actions|defineAction" src/` → vacío; `src/actions` no existe; sin handlers POST. El endpoint `/_actions` **no está registrado** en el manifest (las 9 rutas son /, /404, /[...slug], /[slug]/[doc], /_image, /_server-islands/[name], /health, /robots.txt, /sitemap.xml). En vivo: `curl -X POST /_actions/foo -H 'Content-Type: application/json+devalue' --data '[["Array",1],-3]'` → 404.
- **Server islands** (sí registrado): deserializa props con `JSON.parse` (`server_BSoyqO9V.mjs:3266`), no con devalue, y tras descifrar con clave del servidor.

**El escéptico confirmó no alcanzable, pero corrigió un error factual del triaje:** la afirmación de que las sesiones "no están configuradas / driver inerte" es **falsa** — el manifest contiene `sessionConfig` real (driver `unstorage/drivers/fs-lite`, dist L6304) y el driver está cableado (L6311); el adaptador Node las habilita por defecto. Aun así devalue no es alcanzable: `unflatten` (L4549) solo se ejecuta dentro de `#ensureData`, que solo se dispara al llamar `Astro.session.get/set` — y ningún middleware ni página lo llama. Prueba en vivo: nunca se emite `Set-Cookie astro-session` (ni en /, ni /vigo, ni con cookie crafteada). Y aunque se invocara, `storage.get(sessionID)` lee un fichero que el propio servidor escribió con `stringify`; el atacante controla el sessionID (clave), no el contenido. Además `parseRequestBody` (dist L986-1030) parsea input de actions con `formData()`/`JSON.parse`, no con devalue; `parse$1` solo deserializa un `actionResult` de round-trip interno.

**Reevaluar cuando:** (a) se cree `src/actions/` o se use `defineAction` (→ pasaría a ACTUALIZAR-URGENTE: `/_actions` haría `devalue.parse` del body del atacante); (b) alguna página empiece a usar `Astro.session`; (c) cualquier endpoint llame devalue sobre input de red; (d) el salto a astro@7, que arrastra devalue >=5.8.1. Fecha por defecto: auditoría trimestral 2026-11.

### 2.4 `js-yaml@4.1.1` — ACEPTAR

Tres avisos CWE-407 (DoS cuadrático parseando merge keys / `!!omap`). Transitiva de `@astrojs/markdown-remark@7.1.0` (build).

- `grep -rln "js-yaml" dist/` → vacío (exit 1): **no está en ninguna parte del build**, ni server ni client. Ni siquiera el string "yaml" aparece en los chunks de server.
- `find src -name "*.md" -o -name "*.mdx" -o -name "*.yaml" -o -name "*.yml"` → vacío; `src/content/` no existe. Cero ficheros YAML que parsear ni en build.
- El contenido de runtime entra por `src/data/stores.ts:30` vía `import bruto from './stores.json' with { type: 'json' }` — JSON, no YAML.

**El escéptico confirmó** reejecutando y añadiendo `grep -rn "\.load(|safeLoad|loadAll" dist/server` → sin coincidencias: no hay sink de parseo YAML en el runtime. No procede curl: sin código en dist no hay nada que disparar. Explotar la única fase donde js-yaml podría correr (build) exigiría commit access o CI comprometida — escenario en el que el atacante ya ejecuta código.

**Reevaluar cuando:** se añada markdown/MDX/content collections con frontmatter; se parsee YAML en runtime; o en el salto a astro@7 (arrastra js-yaml >=4.3.1).

### 2.5 `nanoid@3.3.11` — ACEPTAR

Dos avisos CWE-835 (bucle infinito con size negativo o cero). Cadena 100% build-time: astro → vite@7.3.2 → postcss@8.5.9 → nanoid@3.3.11.

- `grep -rn nanoid dist/server` → vacío (exit 1). `grep -rln "useandom|customAlphabet|urlAlphabet" dist/` → vacío: ni el nombre ni las firmas de implementación viajan al bundle.
- Única invocación real en build: `node_modules/postcss/lib/input.js:80` → `nanoid(6)` — tamaño constante positivo, incapaz de disparar ninguno de los dos avisos.

**Matiz del brief resuelto:** el brief de sesiones anteriores decía que nanoid "SÍ está en dist/server". **El escéptico lo desmintió con el build fresco:** el "exit=0" original fue un falso positivo de `head` al final del pipe; reejecutado sin pipe, `grep -rn nanoid dist/server` → exit 1. La firma única del alfabeto (`useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF`) tampoco aparece en dist — descarta un renombrado por minificación. Los IDs del servidor usan exclusivamente `crypto.randomUUID()` nativo (`server_BSoyqO9V.mjs:4447/4540/4596`, `sequence_mRaxHbWm.mjs:1228`), no nanoid. El bundle standalone es autocontenido: no hay import dinámico que pueda arrastrarlo en runtime.

**Reevaluar cuando:** nanoid aparezca en `dist/server` tras cualquier build post-upgrade (re-ejecutar el grep de firmas), o en la migración a astro@7.

### 2.6 `postcss@8.5.9` — ACEPTAR

Cuatro avisos (XSS por `</style>` sin escapar en el stringifier; lecturas arbitrarias vía `sourceMappingURL`). Transitiva 100% build-time (astro → vite → postcss).

- `grep -rl postcss dist/` → vacío (exit 1): no viaja ni a server ni a client.
- `grep -rn sourceMappingURL dist/server --include=*.mjs` → vacío. Sin `postcss.config.*` ni `tailwind.config.*`; nadie lo invoca directamente.
- Input del build: `src/styles/global.css` + bloques `<style>` de los `.astro` — todo CSS del repo; el output se emite como ficheros externos `dist/client/_astro/*.css`, no inline.

**El escéptico confirmó**, con dos aportes: (1) corrigió la higiene de la evidencia — el exit code original medía `head`, no `grep`; verificado con `PIPESTATUS` que el grep real es exit 1 (la conclusión era correcta igualmente); (2) probó una superficie no mencionada: `src/layouts/Base.astro:109` emite `<style set:html={plantillaCss}>` en runtime — la forma exacta del aviso XSS —, pero `plantillaCss` lo construye `tokensToCss()` (`src/data/templates.ts:119-123`) con template literals sobre objetos estáticos del repo, **no** con el stringifier de postcss; el aviso no aplica a esa ruta.

**Reevaluar cuando:** postcss aparezca en `dist/`; el pipeline procese CSS de origen externo (temas de terceros, CSS en stores.json, contenido de usuario); CI que haga build de PRs de forks no confiables; o el salto a astro@7.

### 2.7 `sharp@0.34.5` — ACEPTAR

GHSA-f88m-g3jw-g9cj: CVE heredadas de libvips, que solo se disparan cuando libvips **decodifica bytes de imagen crafteados por el atacante** (Attack Vector: Local; no se disparan por dimensiones/params — confirmado leyendo el GHSA).

sharp SÍ viaja a dist/server y SÍ ejecuta (`sharp_DglJlbEe.mjs:55`: `await import('sharp')`; la ruta `/_image` la registra el adaptador aunque el repo no use `astro:assets`). Pero el atacante no puede entregar bytes:

```
A) Host preview (something.up.railway.app)  GET /_image?href=/usafitness.svg&f=png&w=50&h=50 → 200 (sharp corre, rasteriza el SVG del repo)
B) Host de tienda (usafitnessvigo.com)      mismo GET → 404  (el middleware reescribe /_image a /<slug>/_image → inalcanzable en producción)
C) href remoto (https://example.com/x.png)  → 403  (remotePatterns vacío → isRemoteAllowed rechaza)
D) data:image/svg+xml,...                   → 403
E) /../../../etc/passwd                     → 500  (guarda isParentDirectory)
F) /nope.svg                                → 500
G) http://127.0.0.1/foo.png                 → 403
```

**El escéptico confirmó y amplió:** probó variantes de bypass del 403 remoto (`//` protocol-relative, `hTtps` en mayúsculas, espacio inicial, `https:` sin barras, `%2f%2f`, `blob:`) → todas 403 (`isRemoteAllowed`, `node_C8hwJK2d.mjs:1866-1870`); `file://`, traversal y directorio → 500 (`isParentDirectory` en `loadLocalImage`, `node_C8hwJK2d.mjs:1889-1910`); y evasiones del gating del middleware (`//_image`, `/_image/`, `/%5Fimage`, `/./_image`, `/_image%00`) → todas 404 en hosts de tienda. Los únicos bytes que llegan a libvips son los estáticos versionados del repo (`public/usafitness.svg`, favicon) = input de confianza.

**Reevaluar (y muy probablemente actualizar) cuando:** (a) se añada `astro:assets`/`<Image>`/`getImage` o `remotePatterns`/`domains`; (b) uploads o contenido de usuario que alimente bytes a sharp; (c) cambie el gating del middleware exponiendo `/_image` en hosts de tienda; (d) el salto a astro@7 (trae sharp >=0.35); (e) aparezca una CVE de libvips cuyo vector no exija bytes crafteados (p.ej. DoS por dimensiones, que aquí sí serían parcialmente controlables).

### 2.8 `svgo@4.0.1` — ACEPTAR

GHSA-2p49-hgcm-8545 (el plugin `removeScripts` deja scripts ejecutables; CVSS 8.2).

- `grep -rln svgo dist/` → vacío: no existe en runtime.
- Único call-site en astro: `vite-plugin-assets.js:286` → `makeSvgComponent(..., settings.config.experimental.svgo)`, y `optimize()` solo corre si esa config es truthy. `grep -rn experimental astro.config.mjs` → vacío: **desactivado**, no corre ni en build.
- `grep -rn "import.*\.svg" src/` → vacío: cero imports de SVG como componente.

**El escéptico confirmó** e investigó dos ángulos extra: (1) los abundantes SVG inline escritos a mano en las plantillas `.astro` (Header, Social, Schedule, etc.) son HTML literal, nunca pasan por el pipeline de assets ni por `svgo.optimize()`; (2) `src/data/stores.ts:41` admite rutas `.svg` como imagen, pero se renderizan como `<img src>` estático. El vector del aviso exige usar svgo para sanear SVGs no confiables y servir el resultado — función que este proyecto (sin BD, sin uploads) no tiene.

**Reevaluar cuando:** se active `experimental.svgo`; aparezca un import de `.svg` como componente; el proyecto acepte SVGs de usuarios; o el salto a astro@7 (svgo >=4.0.2).

### 2.9 `vite@7.3.2` — ACEPTAR

GHSA-fx2h-pf6j-xcff (high: bypass de `server.fs.deny` en Windows vía NTFS ADS `::$DATA` y nombres 8.3) y GHSA-v6wh-96g9-6wx3 (moderate: robo de hash NTLMv2 vía `/__open-in-editor` de launch-editor). **Ambos afectan exclusivamente al dev server.**

- 100% transitiva de astro; no figura en dependencies/devDependencies.
- No viaja al runtime: `grep -rn "from 'vite'|import('vite')|require('vite')" dist/server` → exit 1. La única aparición literal es `__vite_import_meta_env__` (objeto de env inline), no el paquete. El único `createServer` de dist (`server_BSoyqO9V.mjs:6925`) es el `http/https.createServer` del adaptador Node.
- `launch-editor` ni siquiera es dep del árbol (`npm ls launch-editor` → empty); vive solo dentro del chunk de dev de vite.
- Producción: `railway.json` startCommand = `node dist/server/entry.mjs`. Vite jamás se carga.

**El escéptico confirmó con prueba empírica** contra el build en ejecución: todos los vectores devuelven 404 con la página de error SSR — `/.env::$DATA?raw`, `/.env?raw`, `/@fs/.../env?raw`, `/.env%3A%3A%24DATA?raw`, `stores.json::$DATA`, `/__open-in-editor?file=...`, `/@vite/client`, `/@fs/etc/passwd`. Razón adicional independiente: ambos avisos son específicos de Windows y Railway corre contenedores Linux.

**Riesgo residual real (del puesto de trabajo, no del despliegue):** un desarrollador ejecutando `npm run dev` en Windows con `server.host: '0.0.0.0'` queda expuesto en su LAN a ambos vectores. **Mitigación barata local:** quitar `host: '0.0.0.0'` del bloque server en dev o usar `--host 127.0.0.1`.

**Reevaluar cuando:** el salto a astro@7 (arrastra vite@8 parcheado); o si alguna vez se sirviera producción vía `astro dev`/`preview`.

### 2.10 `esbuild@0.27.7` — ACEPTAR

GHSA-g7r4-m6w7-qqqr (low, CVSS 2.5 AV:L): lectura arbitraria de ficheros en Windows **desde el servidor de desarrollo propio de esbuild** (`--servedir`), vía traversal con backslashes.

- Versión 0.27.7 en rango vulnerable (0.27.3–0.28.0), transitiva de astro/vite.
- No viaja a dist/server: el único hit de `esbuild` es un STRING de mensaje de error de @astrojs/node (`server_BSoyqO9V.mjs:6656`), no código.
- El componente vulnerable jamás se invoca en este árbol: `grep -rl "servedir" node_modules/vite/dist node_modules/astro/dist src/ scripts/ astro.config.mjs` → exit 1 en todos. `astro dev` levanta el servidor de vite, que usa esbuild solo vía API transform/build, nunca su modo serve.

**El escéptico confirmó:** de las tres condiciones del CVE (esbuild serve activo + Windows + alcanzable por HTTP) solo se cumple la de Windows en dev local; el handler vulnerable nunca se instancia. No hay ruta alternativa.

**Reevaluar cuando:** algún script del repo use `esbuild --serve`/`servedir`/`context().serve()`; el salto a astro@7 (esbuild >=0.28.1); o el `npm audit` trimestral 2026-11 si el salto no se ha hecho.

---

## 3. La conclusión incómoda

`npm audit` dice `fixAvailable: true` en las 10. Lo que no dice es que ese fix es **astro@7 + @astrojs/node@11**: un salto mayor de framework que toca el motor de render de los 7 dominios de 7 sociedades distintas servidos por un único proceso. No es un `npm update` — es una migración con breaking changes documentados, que hay que planificar como su propia slice de trabajo, con la suite de humo de los 7 dominios (`npm test` + `npm run test:armado`) como red de seguridad, y no colar dentro de un PR de seguimiento.

Este triaje demuestra que **esperar es defendible**: 9 de los 10 avisos no son alcanzables porque el código vulnerable no está en el bundle o la feature que lo dispara no existe, y el único alcanzable (if-match) se cierra con el patch 10.0.6 dentro del mismo major. Pero "defendible hoy" no es "defendible para siempre" — la aceptación descansa sobre condiciones concretas que están escritas en cada sección de "reevaluar cuando".

**Disparadores que adelantarían el salto a astro@7:**

1. Un aviso nuevo **critical**, o uno high cuyo vector SÍ sea alcanzable con las features actuales (el tripwire del CI existe exactamente para el primero).
2. Introducir cualquiera de las features hoy ausentes que reviven avisos muertos: Astro Actions (`devalue` pasaría a ACTUALIZAR-URGENTE), uso de `Astro.session`, `astro:assets`/uploads (sharp), islas de cliente, `prerender=true`, contenido markdown.
3. Exploit público contra astro 6.1.x o el fin del soporte de la rama 6.x.
4. La revisión trimestral de dependencias (2026-11) si nada de lo anterior ocurrió antes.

## 4. Reglas derivadas

Costumbres que quedan instauradas a partir de este triaje:

1. **Reevaluar el triaje cuando cambie `package-lock.json`.** Cualquier PR que toque el lockfile debe comprobar si las versiones de los 10 paquetes triados cambiaron y si algún "reevaluar cuando" se activó. El triaje está datado y atado al commit `c0fa6a5`: no es eterno.
2. **Tripwire en CI:** el paso `npm audit --audit-level=critical` añadido a `.github/workflows/ci.yml` pasa hoy (0 critical) y se pondrá rojo el día que aparezca algo genuinamente nuevo y grave — que es exactamente cuando este documento debe reabrirse, no antes. Un tripwire a nivel `high` sería teatro: estaría rojo permanentemente por los 8 high aquí aceptados con evidencia.
3. **Regla de oro de alcanzabilidad:** ningún "no alcanzable" vale sin el comando que lo demuestra (grep sobre `dist/server`, curl contra el build, `fichero:línea`). "Probablemente no" no es un veredicto.
4. **Higiene de exit codes en pipes:** dos evidencias de este triaje midieron el exit de `head` en vez del de `grep` (falsos positivos detectados por el escéptico en nanoid y postcss). Al usar grep en pipe, verificar con `PIPESTATUS` o reejecutar sin pipe.
5. **Revisión de features-gatillo en code review:** los PRs que introduzcan `define:vars`, islas de cliente, server islands, Actions, sesiones, `prerender=true`, `experimental.svgo`, imports de `.svg`, markdown o uploads deben citar este documento y reabrir el triaje del paquete afectado.
6. **Cita para dev local en Windows:** valorar quitar `host: '0.0.0.0'` del bloque `server` en dev (o `--host 127.0.0.1`) — es el único riesgo residual real de vite/esbuild y es del puesto de trabajo, no del despliegue.
7. **Cierre definitivo:** la migración astro@7 + @astrojs/node@11 cierra de raíz los 10 avisos; al ejecutarla, verificar con `npm ls` que devalue>=5.8.1, js-yaml>=4.3.1, sharp>=0.35, svgo>=4.0.2, esbuild>=0.28.1 y repetir los greps de presencia en `dist/server`.
