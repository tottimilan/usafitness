# Decisions Log — USAFitness Landing Pages

> _To be developed. Append-only. Never edit past decisions; add a new entry that supersedes them._

## Format

```
### YYYY-MM-DD — Decision title
- **Decision:**
- **Reason:**
- **Alternatives considered:**
- **Consequences:**
- **Files affected:**
- **Supersedes:** (optional link to previous decision)
```

## Entries

### 2026-08-24 — Las secciones sin datos no se renderizan (germen del sistema de secciones)
- **Decision:** `whatsapp`, `reviews[]` y `galleryImages[]` pasan a opcionales; si faltan, su sección no se emite. `aggregateRating` solo se declara si hay reseñas reales.
- **Reason:** el alta de GranCasa (sin WhatsApp ni reseñas) reventaba con `undefined.replace()` y habría publicado `"ratingValue":"NaN"`. Es además el primer paso real hacia el sistema de secciones de `memory/01`.
- **Alternatives considered:** rellenar con datos falsos — rechazado: publicaría reseñas inventadas en la web de una empresa real.
- **Consequences:** una tienda puede darse de alta con datos parciales. Sigue fijo el ORDEN de las secciones y siguen hardcodeados `Products`, `Promotions` y `Brands`.
- **Files affected:** `src/components/WhatsAppFloat.astro`, `src/components/Schedule.astro`, `src/layouts/Landing.astro`, `src/pages/[...slug].astro`. Commit `828ec40`.

### 2026-08-24 — Sync desde la plantilla MASTERMIND con 3 preservaciones
- **Decision:** sincronizados 64 ficheros desde `MASTERMIND TEMPLATE 2.0`, preservando `README.md`, `.cursor/rules/02-tech-stack.mdc` y las entradas propias de `.gitignore` (`.astro/`, `*.code-workspace`).
- **Reason:** el whitelist del sync incluye ficheros que aquí son del proyecto, no de la plantilla. El README documenta `stores.json` y el despliegue.
- **Alternatives considered:** sync completo sin preservar — rechazado: habría sustituido la documentación del proyecto por la de la plantilla.
- **Consequences:** el dry-run devolverá **exit 1 para siempre** con esos 3 ficheros. Es lo correcto, no un fallo. `template-audit` reporta un COUNT_MISMATCH (9 vs 10 reglas) que es falso positivo por `usafitness-project.mdc`.
- **Files affected:** 64 ficheros de `.cursor/`, `.claude/`, `scripts/` y documentos raíz. Commit `f079ecf`.

### 2026-08-24 — Excepción de stack: el sistema de diseño de la plantilla NO aplica
- **Decision:** en este repositorio no se usan `prototype-designer`, `mockup-factory`, `/mm-design`, `/mm-mockup` ni `scripts/install-shadcn-mcp.ps1`, y las reglas de `08-design-system.mdc` se ignoran.
- **Reason:** la plantilla asume React + Tailwind + shadcn/ui. Esto es Astro con HTML/CSS puro. `install-shadcn-mcp` termina en `exit 2` aquí, y las skills se disparan con palabras españolas ("diseña", "prototipo") que en un proyecto de landings son frases normales.
- **Alternatives considered:** adoptar shadcn — rechazado: exigiría React y destruiría el ~0 JS que sostiene el SEO.
- **Consequences:** el sistema de diseño real queda documentado en `memory/14-design-system.md` (custom properties de `src/styles/global.css`).
- **Files affected:** `.cursor/rules/usafitness-project.mdc`, `memory/14-design-system.md`.

### 2026-08-24 — Destino B (plataforma de campañas), pero por etapas
- **Decision:** el proyecto acabará gestionando campañas SEM/Meta desde aquí, pero primero secciones y landings optimizadas, después medición, y la plataforma al final.
- **Reason:** decisión explícita del usuario. Ver `memory/01-product-vision.md`.
- **Consequences:** "sin panel, sin BD, sin auth" pasa a ser temporal, no permanente. La configuración por tienda debe ser **dato estructurado**, no condicionales dispersos, para poder migrar a una fila de BD.
- **Files affected:** `memory/01-product-vision.md`.

### 2026-08-24 — Retroactive memory seeding via retroactive-documenter
- **Decision:** Seeded `memory/00, 02, 03, 04, 06, 08` from observed codebase facts during MASTERMIND onboarding (phase Iteration), one commit per approved file.
- **Reason:** Onboarding an existing, previously-undocumented project; populate memory from code reality instead of leaving placeholders, so `/mm-audit` and `/mm-gate` have a factual base.
- **Alternatives considered:** Leave the skeleton intact and fill manually — rejected: slower, inconsistent, and loses code provenance.
- **Consequences:** `memory/` now reflects code reality at commit `77ccd78`. Strategic layer (personas, monetization, UVP, non-negotiables, prioritized Top-10 risks, Hard Truth) still pending via `/mm-audit` (Phase 6); phase confirmation pending via `/mm-gate` (Phase 7).
- **Files affected:** `memory/00-project-brief.md`, `memory/02-current-state.md`, `memory/03-architecture.md`, `memory/04-data-model.md`, `memory/06-feature-map.md`, `memory/08-known-risks.md`, `memory/13-phase-history.md`.
- **Supersedes:** —


### 2026-08-24 — Sin `aggregateRating` autoservido, y sin automatizar reseñas de Google
- **Decision:** se retira el `aggregateRating` que la propia web se atribuía a sí misma, y se descarta traer automáticamente las reseñas y la nota de Google.
- **Reason:** Google es explícito en dos puntos. Uno: las valoraciones que un sitio se da a sí mismo (*self-serving*) hacen la página **inelegible para las estrellas** — el marcado no daba nada y sí cargaba riesgo de acción manual. Dos: *"Don't aggregate reviews or ratings from other websites"*. Además la Places API solo devuelve 5 reseñas y sus condiciones prohíben cachearlas.
- **Alternatives considered:** (a) mantenerlo — rechazado, es exactamente lo que la documentación desaconseja; (b) scrapear Google — rechazado, incumple los términos y rompería en cualquier cambio de maquetación; (c) Places API — rechazado por el límite de 5 y la prohibición de caché.
- **Consequences:** las estrellas no van a salir en los resultados de Google por esta vía. La palanca real es la **ficha de Google Business**, que sí las muestra en el mapa y en el panel de la derecha. Las reseñas en la web quedan como prueba social, no como marcado.
- **Files affected:** `src/layouts/Landing.astro`, `src/components/Reviews.astro`.

### 2026-08-24 — Los colores del manual de marca se miden antes de adoptarlos
- **Decision:** la paleta oficial del brand book se aplica, pero **cada color se mide contra WCAG 2.2 AA antes de asignarlo a un token de texto**. Dos colores del manual se rechazaron para texto.
- **Reason:** aplicar el gris corporativo `#98989A` a `--color-text-light` dio **2.63:1** sobre blanco (el mínimo es 4.5:1). El cian sobre texto daba 2.9:1. Detectado midiendo la luminancia relativa en el navegador **después** de aplicarlo, no antes.
- **Alternatives considered:** confiar en el manual — rechazado: un manual de marca está pensado para impresión y rotulación, no para texto de 13 px en pantalla.
- **Consequences:** `--color-text-light` es `#6E6E70` (4.65:1), una variante más oscura del gris de marca. La identidad se respeta; la legibilidad manda. **Regla general: color de manual ≠ color de interfaz. Medir siempre.**
- **Files affected:** `src/styles/global.css`, `memory/14-design-system.md`.

### 2026-08-24 — Header, Footer, cookies y WhatsApp NO son componibles
- **Decision:** el sistema de secciones permite reordenar y quitar secciones de contenido, pero Header, Footer, `WhatsAppFloat` y `CookieConsent` quedan fuera del registro y se renderizan siempre.
- **Reason:** un error de configuración en un array de secciones no puede dejar una landing sin aviso de cookies ni sin enlaces legales. Son obligaciones legales, no decisiones de diseño.
- **Alternatives considered:** meterlas en el registro con una marca `obligatoria: true` — rechazado: sigue siendo un sitio donde un typo las apaga. Si no están en el registro, no hay typo posible.
- **Consequences:** una plantilla no puede mover el footer ni prescindir del aviso. Es el límite deliberado del sistema.
- **Files affected:** `src/sections/registry.ts`, `src/pages/[...slug].astro`.

### 2026-08-24 — Cero terceros antes del consentimiento
- **Decision:** ninguna petición sale a un dominio de terceros hasta que el usuario consiente. Tipografía autoalojada, mapa como fachada con clic-para-cargar, GA4 solo con `ga4Id`.
- **Reason:** cargar Google Fonts o un iframe de Maps **es** una transferencia de la IP del visitante a Google antes de que consienta. El aviso de cookies no cubre lo que ya se ha cargado al pintar la página.
- **Alternatives considered:** dejar las fuentes de Google porque "solo es una fuente" — rechazado: es el mismo tratamiento de datos, y además cuesta rendimiento.
- **Consequences:** el mapa exige un clic más. A cambio, la página no carga nada de terceros de salida y el consentimiento es revocable desde el footer.
- **Files affected:** `src/styles/global.css`, `src/components/Location.astro`, `src/components/CookieConsent.astro`, `public/fonts/`.

### 2026-08-24 — Los tests corren contra el build de producción y con `node:http`
- **Decision:** la suite levanta `dist/server/entry.mjs` y hace las peticiones con `node:http`. No contra `astro dev` y no con `fetch`.
- **Reason:** dos falsos verdes reales, encontrados al construirla. (1) Vite bloquea la cabecera `Host` y devuelve 403 — un test contra dev daría el mismo error antes y después de cualquier cambio. (2) `Host` es *forbidden header name* en la especificación de fetch: undici la descarta en silencio, así que **todas** las peticiones llegaban al host genérico y el test parecía comprobar el enrutado por dominio sin comprobar nada.
- **Alternatives considered:** Playwright — rechazado por ahora: pesa mucho para lo que hace falta, que es verificar respuestas HTTP, no render.
- **Consequences:** `npm test` exige `npm run build` antes. La suite se validó **por mutación**: se reintrodujo Google Fonts a propósito → 7 fallos; se revirtió → 34/34.
- **Files affected:** `tests/smoke.test.mjs`, `.github/workflows/ci.yml`, `package.json`. Commit `c9626f8`.

### 2026-08-24 — Roadmap definitivo de 8 fases
- **Decision:** el catálogo de secciones, la arquitectura de URLs y el catálogo comercial quedan fijados en `memory/06-feature-map.md`, con una lista explícita de **lo que NO se va a hacer**.
- **Reason:** el usuario pidió dejar de preguntar y analizar. El orden no es por dificultad, es por dependencia: sin medición no se puede demostrar nada; sin rutas anidadas no puede existir ninguna página nueva.
- **Consequences:** `memory/06-feature-map.md` deja de ser un mapa de funcionalidades y pasa a ser el roadmap operativo. Lo descartado se documenta con el motivo, para no volver a discutirlo.
- **Files affected:** `memory/06-feature-map.md`. Commit `aee0e44`.

### 2026-08-25 — La validación de datos corre en `astro:config:setup`, no solo al importar el módulo
- **Decision:** el esquema de `stores.json` y el verificador de assets se ejecutan desde una integración de Astro en `astro:config:setup`, no únicamente al cargarse `src/data/stores.ts`.
- **Reason:** un módulo solo se ejecuta cuando alguien lo importa, y en SSR eso pasa **al arrancar el servidor** — es decir, ya desplegado. Un dato roto habría pasado el build, pasado el CI, desplegado, y tumbado los 7 dominios a la vez al arrancar. El fallo tiene que ocurrir en la máquina de quien escribió el dato.
- **Alternatives considered:** un script `prebuild` con `tsx` — rechazado: añade una dependencia para algo que la config ya puede hacer.
- **Consequences:** el build importa ficheros `.ts` a través del cargador de Node, así que hace falta el soporte nativo de TypeScript. Declarado `engines.node >=22.18.0` y el CI a Node 24. Verificado rompiendo un dato: el build sale con código distinto de cero y nombra la tienda, no el índice del array.
- **Files affected:** `astro.config.mjs`, `src/data/stores.ts`, `src/build/verificar-assets.ts`, `package.json`, `.github/workflows/ci.yml`. Commits `fbd52d0`, `e50de48`.

### 2026-08-25 — Error frente a aviso: dónde está la línea en el esquema
- **Decision:** el esquema **rompe el build** con lo que rompe el render o publica un dato falso, y solo **avisa** con lo que degrada.
- **Reason:** el roadmap avisaba de que "el primer build estricto va a fallar en cadena". Habría sido cierto con un esquema estricto de verdad: 4 tiendas sin `company`, `place_id` construidos a mano, campos que dependen de datos que solo puede dar el franquiciado. Bloquear el despliegue de 7 dominios vivos hasta que lleguen esos datos es peor que la carencia — y además el `visible()` de cada sección ya maneja bien el caso vacío.
- **Consequences:** hoy salen 21 avisos en el log del build, con el slug delante, y bajan solos según lleguen datos. Lo que sí rompe: clave con typo (`strictObject`), teléfono que no se puede marcar, NIF imposible, `company` a medias (peor que vacía: publica un aviso legal incompleto en `index`), horario que el parser no entiende, dominio repetido, y la misma persona firmando reseñas en dos sociedades.
- **Files affected:** `src/data/stores.ts`, `tests/datos.test.mjs`.

### 2026-08-25 — El middleware no lleva lista blanca de páginas
- **Decision:** en el dominio de una tienda, **cualquier** ruta se reescribe bajo su slug y decide el enrutador de Astro. No se construye el registro `PAGES` que pedía el roadmap.
- **Reason:** la regla general es MENOS código que la lista blanca anterior y resuelve el bloqueo entero. Un registro con cero entradas más allá de las legales sería abstracción especulativa: no hay ninguna página de contenido escrita todavía.
- **Alternatives considered:** `PAGES` calcado de `LEGAL_DOCS` — diferido a cuando exista la primera página con copy, que es cuando el flag `publicada` por tienda tendrá algo que publicar o no.
- **Consequences:** añadir una página = crear un `.astro` bajo `src/pages/[slug]/`. Detalle que costó un 508 Loop Detected: hay que usar `next(ruta)` y no `context.rewrite(ruta)` — rewrite relanza la cadena de middleware y la ruta ya reescrita vuelve a entrar.
- **Files affected:** `src/middleware.ts`, `src/pages/404.astro`, `astro.config.mjs`. Commit `24b0a17`.

### 2026-08-25 — La regla de indexación por host vive en un solo sitio
- **Decision:** `Base.astro` calcula `robots` para todas las páginas: `noindex` explícito manda siempre; con tienda, `index` solo si la petición llegó a SU dominio; sin tienda, `noindex`.
- **Reason:** el `<head>` estaba escrito a mano cuatro veces y **ya había fallado**: `[slug]/[doc].astro` calculaba `robots` mirando solo si la tienda tenía datos legales, sin mirar el host, así que `preview.up.railway.app/vigo/aviso-legal` se publicaba `index, follow` — compitiendo en Google con el dominio del propio cliente. Verificado contra el build antes de arreglarlo.
- **Consequences:** `Landing.astro` recibe la tienda entera en vez de 20 props sueltas; el compilador impide pasar un campo por otro. `Page.astro` no se ha hecho: no hay página de contenido que lo justifique.
- **Files affected:** `src/layouts/Base.astro`, `src/layouts/Landing.astro`, `src/pages/*`. Commit `61dd93e`.

### 2026-08-25 — La fase declarada era falsa: corrección Iteration → MVP
- **Decision:** el proyecto se registra en **MVP** desde el 2026-06-24, no en Iteration. Aprobado explícitamente por el usuario tras el primer `/mm-gate`.
- **Reason:** el gate Iteration → Launch salió **BLOCK** con 0 de 4 criterios de entrada cumplidos, y al verificar la entrada en Iteration se descubrió que tampoco se había alcanzado nunca. 3 de sus 4 `entry_criteria` no se cumplían el 2026-06-24 y siguen sin cumplirse: sin medición (`ga4Id` 0 de 7, y cero peticiones a `googletagmanager` en los 4 dominios Astro vivos), sin observabilidad (2 dependencias en `package.json`, ninguna de monitorización, sin endpoint de salud) y sin verificación de seguridad (`npm audit`: 10 vulnerabilidades, 8 High, sin triaje). El proyecto no transitó a Iteration: fue **colocado** ahí durante un onboarding, con la nota *"confirm with /mm-gate after retroactive audit"* que llevaba dos meses pendiente.
- **Alternatives considered:** (a) dejarlo en Iteration y anotar que la etiqueta es discutible — rechazado por el usuario: la memoria seguiría afirmando algo que la evidencia desmiente, y es la memoria la que dirige las decisiones de las siguientes sesiones; (b) editar `phase-criteria.json` porque los criterios son de plantilla genérica — sigue siendo una opción legítima, pero el sitio para discutirlo es el JSON y una decisión registrada, no waivear el gate.
- **Consequences:** el próximo gate es **MVP → Iteration**, no Iteration → Launch, y sus condiciones están escritas en `memory/13`. Aparecen dos huecos nuevos que antes no se medían (`docs/testing/strategy.md` y `docs/flows/`). La entrada del 2026-06-24 se conserva íntegra y queda marcada como superseded. **No es un retroceso del proyecto:** lo construido sigue donde estaba y los 3 criterios de salida de Iteration sí se cumplen — lo que cambia es que la etiqueta deja de mentir.
- **Files affected:** `memory/13-phase-history.md`, `memory/02-current-state.md`, `docs/adr/0001-phase-gate-iteration-launch.md`. Commits `7294250`, este.

### 2026-08-25 — Identificación provisional del establecimiento en vez de un aviso vacío
- **Decision:** cuando una tienda no tiene `company`, sus documentos legales publican los datos identificativos del establecimiento que **sí** constan (nombre, dirección completa, teléfono, dominio) más una advertencia visible de que el documento está incompleto y un canal para pedir lo que falta. Antes servían un párrafo que no identificaba a nadie.
- **Reason:** el gate comprobó en vivo que Marineda y Alcobendas sirven su portada en `index, follow` con *"Estamos actualizando la información legal de esta tienda"* detrás. Dos sociedades reales publicando un sitio comercial sin que el visitante pueda saber quién está detrás.
- **Alternatives considered:** (a) poner también la **portada** en `noindex` mientras falten los datos — **rechazado**: el `noindex` no cura el art. 10 de la LSSI, porque la obligación nace de que el sitio esté disponible al público y no de que esté indexado, y a cambio destruiría el posicionamiento de dos tiendas vivas, que es el producto que se vende. Esconde el problema y cobra el precio. (b) Inventar o deducir la razón social — prohibido por la regla del proyecto (`.cursor/rules/usafitness-project.mdc:24`).
- **Consequences:** **es reducción de daño, no cumplimiento.** El art. 10 exige razón social, NIF y datos registrales, y eso solo lo cierra una llamada por tienda. El bloque desaparece solo el día que llegue `company`. La página legal sigue en `noindex` porque el documento sigue incompleto. Cinco tests nuevos, dos de ellos verificando lo que **no** debe ocurrir: que jamás aparezca un NIF con formato válido, ni la razón social de otra tienda.
- **Files affected:** `src/data/legal.ts`, `src/pages/[slug]/[doc].astro`, `src/styles/global.css`, `tests/smoke.test.mjs`. Commit `b29dcbb`.

### 2026-08-25 — Consent Mode básico: gtag.js no se descarga hasta que el usuario acepta
- **Decision:** el tag de GA4 se inyecta en el momento de aceptar, no en la carga de la página. Se elige Consent Mode **básico** (no cargar el tag mientras esté denegado) frente al **avanzado** (cargarlo y enviar pings sin cookies). Planificado en `.cursor/plans/2026-08-25-medicion-y-observabilidad.md`.
- **Reason:** medido, no supuesto. Se puso un `ga4Id` de prueba en Vigo y se compiló: el HTML emite `<script async src="…/gtag/js?id=…">` sin ninguna puerta de consentimiento, y gtag.js pesa **416.812 bytes en crudo / 145.608 comprimido**. La home de Vigo pesa **38.164 bytes**. Es decir, la primera tarea de la slice de medición —pegar un ID— habría multiplicado por casi cinco el peso de la página con un script de Google, antes de que el visitante tocase el banner, y **"Rechazar" no habría impedido la petición** porque el tag ya estaba descargado. Eso contradice el trabajo hecho en `fb40b4e` y `7e31c45` (fuentes autoalojadas, mapa con fachada) y ataca lo que sostiene el SEO, que es el producto.
- **Alternatives considered:** Consent Mode **avanzado** — rechazado por aritmética: su único premio es el *behavioral modeling*, que Google condiciona a **1.000 usuarios consentidos al día y por propiedad**, y modela cada propiedad por separado. Con una propiedad por tienda de barrio es inalcanzable por órdenes de magnitud. Se pagarían 145 KB por visita a cambio de nada.
- **Consequences:** se pierde el modelado de conversiones no consentidas, que este proyecto no iba a alcanzar. A cambio, el banner deja de ser decorativo. Se elimina de paso el único `define:vars` del repo (superficie de la vulnerabilidad XSS abierta de Astro) usando `set:html` con el `ga4Id` ya validado por Zod.
- **Files affected:** `src/components/CookieConsent.astro`, `tests/smoke.test.mjs`. Ejecutado en el PR #1 (`9f75208`).

### 2026-08-25 — El test de terceros se desarmaba solo al llegar el primer `ga4Id`
- **Decision:** quitar el `if (!s.ga4Id)` que envolvía la única aserción sobre `googletagmanager` en `tests/smoke.test.mjs:248`, dejándola incondicional para las 7 tiendas.
- **Reason:** con la condición, el test pasa hoy porque ninguna tienda tiene ID. En cuanto se rellena el primero, la condición se hace falsa para esa tienda y el test **deja de afirmar nada: no falla, enmudece**, y el suite sigue verde con el nombre del bloque ya mintiendo. El guardián se apagaba exactamente en el instante en que empezaba a hacer falta. Es el mismo patrón de falso verde que ya se corrigió dos veces en este proyecto (`fetch` descartando la cabecera `Host`, y el comentario del CSS que satisfacía su propia aserción).
- **Consequences:** la política que se afirma pasa a ser la real — *"GA4 no se carga antes del consentimiento"*, con ID y sin él — y es **una línea menos de código**, no una más. No se puede desactivar poniendo un dato.
- **Files affected:** `tests/smoke.test.mjs`. Ejecutado en el PR #1 (`5bbe43e`).

### 2026-08-25 — El consentimiento concede solo lo que el aviso informa
- **Decision:** al aceptar el banner se concede **solo** `analytics_storage`. Los tres `ad_*` de Consent Mode v2 se declaran en `denied` y ahí se quedan hasta que existan campañas **y** un banner y una Política de Cookies que nombren publicidad, cookies concretas, a Google como tercero y la transferencia internacional.
- **Reason:** la revisión del PR #1 (6 revisores + escéptico por dimensión) salió **"No listo"** con dos críticos que eran la misma decisión: (C-1) se concedían los cuatro parámetros bajo un aviso que solo dice "cookies analíticas" — consentimiento no específico ni informado, RGPD art. 4.11, multiplicado por 7 responsables del tratamiento; (C-2) un `granted` guardado **antes** de que existiera GA4 (el banner escribía la decisión aunque no gobernara nada) se heredaba como consentimiento publicitario completo. El razonamiento técnico original era correcto — Consent Mode v2 exige declarar esos parámetros — con la conclusión legal equivocada: declararlos en `denied` es obligatorio; concederlos sin informar, no.
- **Alternatives considered:** (b) reescribir banner y política ya, con inventario real de cookies — diferido: exige el inventario y probablemente revisión jurídica, y bloquearía el merge del arreglo de los 145 KB. Cuando llegue, habrá que **versionar la clave** `uf-consent` para no heredar decisiones tomadas bajo el texto antiguo.
- **Consequences:** las campañas de Google Ads no podrán atribuir con `ad_storage` hasta hacer (b). El `granted` heredado concede exactamente lo que el aviso de entonces decía. De la misma revisión: el borrado de cookies al revocar ahora recorre los sufijos progresivos del hostname (con solo el host exacto, visitando por `www.` la cookie sobrevivía mientras el comentario afirmaba lo contrario) y cubre `_ga/_gid/_gat/_gac/_gcl`.
- **Files affected:** `src/components/CookieConsent.astro`. Commit `d832181`, PR #1.

### 2026-08-25 — Tercera variante de la trampa mención/petición: la filtración por comentario
- **Decision:** los comentarios de scripts `is:inline` no llevan nombres de dominio reales de ninguna tienda. La advertencia queda escrita en el propio componente.
- **Reason:** al documentar el arreglo del borrado de cookies se usó el dominio de Vigo como ejemplo en un comentario. Un script inline **viaja en el HTML**: el comentario se sirvió en las páginas de las otras 6 sociedades y el test de aislamiento se puso rojo 12 veces ("no debe filtrarse usafitnessvigo.com"). Primera variante: un comentario del CSS satisfacía su propia aserción. Segunda: un `includes` daba por descargado lo que solo estaba escrito. Tercera: un comentario inline filtra el dominio de una sociedad en las webs de las demás. El test de aislamiento entre inquilinos atrapó la tercera en local antes de llegar a ningún sitio.
- **Files affected:** `src/components/CookieConsent.astro`. Commit `d832181`.

### 2026-08-25 — La lógica del consentimiento sale del script inline y se comparte por `toString()`
- **Decision:** las decisiones del consentimiento (qué se concede, si se carga gtag.js, qué cookies se borran y en qué ámbitos) viven en `src/data/consentimiento.ts` como funciones puras. El componente inyecta su **código fuente** en el script inline con `Function.prototype.toString()`. Playwright queda descartado.
- **Reason:** la revisión del PR #1 (I-2) demostró que la suite comprobaba la **forma** del HTML y no el **comportamiento**: cuatro mutaciones —cargar gtag sin consentir, aceptar sin medir, revocar sin borrar, conceder publicidad al rechazar— pasaban las 4 en verde. El obstáculo real era estructural: un `<script is:inline>` no se puede importar, así que ningún test podía llegar a esa lógica.
- **Alternatives considered:** (a) **Playwright** — descartado: ~300 MB de navegadores en CI, dependencia nueva en un proyecto de 2 dependencias cuya doctrina de test es "sin dependencias", y todo para cubrir dos `addEventListener`. Tres de las cuatro mutaciones son decisiones puras. (b) Reescribir la lógica en el test — rechazado explícitamente: es la trampa de las dos implementaciones que ya costó una sesión con el parser de horarios, y un test que copia el código no prueba el código.
- **Consequences:** 5 mutaciones de comportamiento se ponen rojas donde antes había verde. **Se levanta la regla que bloqueaba pegar los `ga4Id` reales.** Queda sin cubrir el cableado con el DOM (que el clic llame a `decide`), que se verifica a mano en navegador y está declarado. Restricción nueva y anotada en el fichero: esas funciones **no pueden cerrar sobre nada** — su texto viaja literal al HTML de 7 dominios. Un test comprueba que la fuente inyectada parsea como JS de navegador, porque un tipo de TypeScript que sobreviviera al `toString()` rompería el script en los 7 a la vez sin que el build se queje.
- **Files affected:** `src/data/consentimiento.ts`, `src/components/CookieConsent.astro`, `tests/datos.test.mjs`, `memory/08-known-risks.md`.

### 2026-08-26 — Se vende a cada franquiciado; la central solo avisa
- **Decision:** modelo **(b)**. El desarrollador habla con cada tienda y contrata con cada sociedad. La central bendice el servicio y avisa a la red, pero **no lo contrata ni lo paga**.
- **Reason:** decisión del usuario, y tiene la ventaja de no depender de una sola firma. La alternativa (a) —la central contrata para toda la red— daba un cliente único, mucho menos trabajo comercial y administrativo, y mucho menos ingreso; además ponía toda la facturación en una sola relación que, encima, es una amistad.
- **Consequences, y esta es la parte que importa:** el techo del negocio deja de ser operativo y pasa a ser **comercial**. El catálogo calcula que la operación recurrente de 58 tiendas cabe en 43,5 h/mes de las 68 disponibles — o sea que operar no es el problema. Pero **51 altas a 4-6 h son 204-306 horas**, y a 2 altas al mes son **25 meses**. El techo realista con este modelo es **~30 tiendas en dos años**.
- **De ahí sale la prioridad técnica:** cada hora que se recorte del alta de una tienda es una tienda más al año. `scripts/nueva-tienda.mjs` deja de ser una utilidad y pasa a ser la pieza que decide cuántas tiendas caben. Hoy el alta es manual: montar Lagoh (tienda 8) llevó una sesión entera, y de eso solo una decisión —elegir el plano general mirando las fotos— necesitó criterio humano.
- **Files affected:** `memory/00-project-brief.md`, `memory/15-catalogo-servicios.md`.

### 2026-08-26 — El muestrario de plantillas es la herramienta de venta
- **Decision:** se construirá una página específica para USAFitness donde el franquiciado vea las plantillas, las secciones y las pantallas disponibles antes de decidir. El usuario la pidió como material comercial.
- **Reason:** el sistema de plantillas lleva construido desde el 2026-08-24 y **ninguna tienda lo usa** (`template` y `sections` a 0 de 8). Se registró como riesgo: «un sistema de diferenciación que ninguna tienda ha estrenado no está validado». Esta decisión le da por fin un consumidor — y no es el que se había previsto. No es una función del producto: **es lo que se enseña en la reunión de venta**, y lo que convierte «te hago una web» en «elige cuál».
- **Consequences:** el muestrario necesita datos ficticios (no los de una tienda real) y va `noindex`, porque enseñar la web de un cliente como demostración de otro es exactamente el tipo de mezcla entre sociedades que el resto del proyecto evita. El catálogo lo tarifica: incluido en el alta, 149 € suelto para las 8 ya publicadas. Y da un motivo para que las tiendas existentes elijan plantilla, que hoy no tienen.
- **Files affected:** pendiente — ruta `/muestrario`, `memory/06-feature-map.md`.

### 2026-08-26 — El alta de tienda se automatiza anclando a la estructura, no a la forma del dato
- **Decision:** `scripts/alta-tienda.mjs` en dos fases (`investigar` no escribe nada, `aplicar` toca el repo), con la lógica en tres módulos puros y testables: `ficha-google.ts`, `instagram.ts` y `alta.ts`. Plan en `.cursor/plans/2026-08-26-alta-de-tienda-automatizada.md`.
- **Reason:** con el modelo de venta a cada franquiciado, el techo del negocio es el alta: 51 altas × 4-6 h son 25 meses. Montar Lagoh a mano llevó una sesión, y de todo aquello **una sola decisión necesitó criterio humano**.
- **El hallazgo que decidió el diseño:** probé mi propio método contra cuatro tiendas sin guiarlo y **falló en silencio**. Devolvía coordenadas de **Marruecos** para La Vaguada y de **Granada** para Moncloa, con el CID correcto al lado. Funcionaba a mano porque yo comparaba cada resultado con lo que sabía. La causa: buscaba «cualquier par de decimales» en el payload. Google emite nombre, dirección postal completa, coordenadas y CID en **una sola estructura**; anclando ahí, la extracción reproduce exactamente los datos que verifiqué a mano de Vigo y Lagoh, y devuelve *no resuelto* para Nevada Shopping en vez de inventar.
- **Alternatives considered:** (a) fiarse de `spotlit` como única señal — insuficiente: `spotlit` estaba a 1 en los dos casos que devolvían coordenadas de otro país; (b) validar solo por nombre — insuficiente: Xanadu devuelve «USA Fitness» a secas, indistinguible de las otras 57. Por eso van **tres guardas independientes**: que sea de USA Fitness, que el nombre nombre esa tienda, y que las coordenadas caigan en la provincia de su código postal.
- **Consequences:** una dependencia nueva y solo de desarrollo (`sharp`, que ya estaba en disco como transitiva de Astro). El patrón depende de un formato que Google no documenta; si cambia, `extraerFicha` devuelve `null` — fallo seguro, no invención. Y `investigar` acepta **nombre o dominio**: de las 58 tiendas solo 8 tienen dominio, así que atar el alta al dominio habría dejado 50 fuera desde el primer día (era un error de la primera versión del plan, detectado al revisarlo).
- **Files affected:** planificado — `src/build/ficha-google.ts`, `src/build/instagram.ts`, `src/build/alta.ts`, `scripts/alta-tienda.mjs`, `tests/fixtures/`, `tests/datos.test.mjs`, `package.json`.

### 2026-08-26 — `merge=union` no funciona en GitHub: la premisa del diseño de 3.10 es falsa

- **Decision:** **descartar `merge=union`** como mecanismo para que dos altas de tienda no choquen. El diseño ganador de la tarea 3.10 se apoyaba en él y su beneficio principal —«dos altas simultáneas nunca conflictan»— **no se sostiene**. En su lugar, la palanca real es **mantener el índice ordenado alfabéticamente**.
- **Reason:** el panel que juzgó los tres diseños marcó esta suposición como la única que sostenía el 0% de conflictos, y avisó de que estaba verificada **solo en el merge local**. Lo estaba. Comprobado.
- **La medida, con el mismo par de ramas en los dos sitios:**

  | Vía | Resultado |
  |---|---|
  | `git merge` local, con `.gitattributes` presente | ✔ limpio, y el fichero resultante correcto |
  | `POST /repos/…/merges` de la API de GitHub | ✖ **409 Merge conflict** |
  | Pull request real (`mergeable`) | ✖ **`CONFLICTING` / `DIRTY`** |

  **GitHub no honra los drivers de `merge` de `.gitattributes`.** Da igual que el driver `union` sea interno de git: el merge del servidor no lo aplica. Como todo el trabajo se fusiona por PR, el mecanismo es inservible aquí.

- **Lo que SÍ funciona, medido en el mismo experimento:** un índice **ordenado alfabéticamente**, sin `.gitattributes` ni driver ninguno.

  | Escenario | Merge en GitHub |
  |---|---|
  | Altas en letras lejanas (`badajoz` + `zaragoza`) | ✔ **sin conflicto**, y el resultado cuadra: las dos en imports y en el array, y sigue ordenado |
  | Altas en letras pegadas (`malaga` + `marbella`) | ✖ conflicto |

  Dos inserciones en puntos distintos de un fichero no son un conflicto para git: lo son cuando caen en el mismo hueco. Con la lista ordenada, dos altas solo chocan si sus slugs caen contiguos — y cuantas más tiendas hay, más raro es. Cuando choque, el conflicto son **dos líneas planas** con resolución obvia, no un JSON anidado de 353 líneas como el que dio Lagoh.

- **Alternatives considered:** (a) configurar el driver en el runner de CI — no sirve, el conflicto lo declara GitHub antes de que CI llegue a correr; (b) fusionar siempre en local y empujar — renuncia a los PR, que es donde vive la revisión; (c) no partir el fichero — sigue en pie como opción, pero pierde el resto de ventajas (diffs legibles, encontrar una tienda, no cargar 58 entradas para tocar una).
- **Consequences:** el diseño de 3.10 **no se descarta, se recorta**. Sigue valiendo por los diffs y por el tamaño, pero hay que quitar de su enunciado la promesa de cero conflictos y sustituirla por «conflictos raros y triviales». El `.gitattributes` que proponía sigue haciendo falta, pero **solo por `text eol=lf`**: sin eso, el test de formato canónico que el diseño añade falla al 100% en Windows, que es la máquina del usuario (`core.autocrlf=true`, y el árbol de trabajo tiene CRLF mientras git guarda LF).
- **Y una lección del propio experimento:** la primera versión falló por CRLF. El script que preparaba las ramas hacía `replace("  vigo,\n", …)` y no casaba contra `\r\n`, así que una rama se publicó **sin la línea que debía añadir** y el resultado parecía demostrar que `union` corrompía el fichero. No lo corrompía: mi montaje estaba roto. La misma trampa que el crítico había señalado, mordiendo dentro del experimento montado para comprobar otra cosa.
- **Files affected:** ninguno todavía — decide el enunciado de la tarea 3.10 antes de implementarla.

### 2026-08-27 — R3 rebajada: horario del día sí, estado «abierto ahora» condicionado

- **Decision:** la regla R3 de la metodología pedía «estado de apertura visible» y contradecía el descarte razonado de memory/06 §5 (el badge en vivo exige festivos de N centros en 5 comunidades mantenidos para siempre; el día que falla, la web miente en el dato por el que alguien se desplaza). R3 queda: **horario de HOY como dato estructurado, siempre; el estado en vivo solo con horario v2 + `holidays/<centro>.json` cargado con un año de antelación y degradación segura.**
- **Reason:** la revisión adversarial del sistema documental (lente de rigor) cazó la contradicción entre dos documentos vivos. Se resuelve del lado del descarte original porque el coste del badge mintiendo (un cliente ante una persiana bajada) supera su valor, y la investigación muestra que la pregunta nº1 (horario, ~la mitad de visitantes) se responde igual con el dato del día.
- **Files affected:** `docs/metodologia/creacion-de-webs.md` §5 (R3), este log.

### 2026-08-27 — El sistema documental pasa revisión adversarial: 66 hallazgos → 28 cambios

- **Decision:** aplicar la síntesis completa de la revisión (4 lentes: negocio, coherencia, sesión-nueva, rigor). Lo estructural: **nace `docs/product/proceso-comercial.md`** — el sistema declaraba «vender es lo más importante» y no producía ni un artefacto de venta; ahora el ciclo pitch → demo pre-construida con seed data → auditoría → cierre → alta → informe → retención de los 8 actuales tiene documento, dueño y fila en el mapa del norte. Precedencia escrita entre docs (metodología manda en lo operativo). F0 desacoplada de los beneficios de socio (pasan a «lista-salvo-dato» en F1). Registro único de eventos en guia-alta §3.4. Modelo de ofertas a dos niveles y precio oculto en memory/04. Tres riesgos nuevos (sesgo de consentimiento, cesión Corelam, foso-por-inacción).
- **Dos errores factuales míos corregidos por la revisión, verificados contra el repo:** memory/02 decía «PR #17 no se mezcla» y está mezclado en main (c1596f2); el norte citaba `docs/product/escala-real.md`, que vivía en una rama sin mezclar — traído con `git checkout docs/escala-real --`.
- **Files affected:** 14 ficheros; 8 hallazgos descartados con motivo escrito (en el JSON de la revisión).
