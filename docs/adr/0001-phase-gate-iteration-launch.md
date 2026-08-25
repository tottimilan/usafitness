# ADR 0001 — Phase gate Iteration → Launch: BLOCK

- **Estado:** Aceptado
- **Fecha:** 2026-08-25
- **Contexto de ejecución:** primer `/mm-gate` del proyecto. Es también la confirmación
  retroactiva que quedó pendiente el 2026-06-24 (`memory/13-phase-history.md`:
  *"Confidence at entry: Medium … confirm with /mm-gate after retroactive audit"*).
- **Método:** 6 auditores independientes por dimensión (postura de fase, operaciones,
  legal, artefactos, producto, seguridad) contra `phase-criteria.json`, más un escéptico
  por dimensión que intentó refutar cada bloqueo. 29 bloqueos propuestos, 6 refutados,
  23 confirmados. 35 caveats.

> Este fichero es el primer contenido de `docs/adr/`, cuya ausencia es a la vez uno de
> los huecos que el gate señala. Registrar aquí el gate no cierra ese hueco — faltan las
> ~13 decisiones arquitectónicas que hoy solo viven en `memory/07-decisions-log.md` —
> pero abre el directorio con la decisión que lo motiva.

## Correcciones aplicadas tras verificación propia

Dos afirmaciones del informe se comprobaron de nuevo a mano y se corrigen aquí:

1. **La exposición legal viva afecta a DOS tiendas, no a una.** El informe nombra solo a
   Alcobendas. Verificado con `curl` el 2026-08-25: **Marineda y Alcobendas** sirven ambas
   `index, follow` en su portada y un `/aviso-legal` con HTTP 200 y el texto
   "Estamos actualizando la información legal de esta tienda", sin razón social ni NIF.
   Villanueva y Las Rosas también carecen de `company`, pero siguen en WordPress, así que
   no sirven este código.

2. **La remediación B1 paso 1 (poner la portada en `noindex`) no se recomienda.** El
   `noindex` no cura el incumplimiento de la LSSI art. 10 —la obligación nace de que el
   sitio esté disponible al público, no de que esté indexado— y a cambio destruiría el
   posicionamiento de dos tiendas vivas, que es el producto que se está vendiendo.
   Esconde el problema y cobra el precio. La vía correcta es conseguir los datos: una
   llamada por tienda.

---

# Phase Gate Review — USAFitness

**From:** Iteration (declarada) — *ver §3: la declaración es incorrecta*
**To:** Launch
**Date:** 2026-08-25
**Reviewer:** Claude Opus 5
**Criterios:** `phase-criteria.json` §phases.Launch (4 entry_criteria) · §phases.Iteration (4 entry_criteria, 3 exit_criteria)

---

## 2. Criterios de entrada a Launch

| # | Criterio (literal de `phase-criteria.json`) | Estado | Evidencia más contundente |
|---|---|---|---|
| 1 | **SLA/SLO defined** | ❌ NO_CUMPLE | `memory/03-architecture.md:52` dice literalmente: `Availability / SLA: _TBD — single Railway service, no documented SLO._` Las tres líneas del bloque *Non-functional requirements* (49-52) están en TBD. Cero cifras de disponibilidad, TTFB o 5xx en todo el repo. Agravante: `memory/06-feature-map.md:153` lista "Guardia técnica y SLA" como **módulo vendible** (0,5 h/tienda/mes) sobre una cuota mensual (`memory/12:35`) — se vende un compromiso que no está definido. |
| 2 | **Incident runbook exists** | ❌ NO_CUMPLE | `ls -d docs/*/` → solo `docs/brand/` y `docs/product/`. No existe `docs/ops/`, `docs/runbooks/` ni `docs/security/`. El grep por `runbook\|incident\|on-call\|guardia\|escalado\|postmortem` sobre `docs/`, `memory/`, `README.md` y `scripts/` devuelve solo el módulo comercial de `memory/06:153`. Lo más cercano es `README.md:131-136` ("Deploy en Railway"), que es alta de servicio, no respuesta a incidentes: no dice quién detecta, en cuánto tiempo, ni a quién se avisa en cada una de las 7 sociedades. El riesgo que debería cubrir sigue Open: `memory/08:41` "Single Railway service = single point of failure". |
| 3 | **Rollback tested** | ❌ NO_CUMPLE | No probado y **ni siquiera definido**. `git rev-list --count HEAD` = **80**; `git log --merges` = **0**; `git log --grep='^Revert'` = **0**; `git branch -a` = solo `main`. No hay `railway.json`, `Dockerfile`, `Procfile` ni `nixpacks.toml` versionados. `.github/workflows/ci.yml` corre **en paralelo** al auto-deploy (sin `environment:`, sin `needs:`, sin paso de despliegue). `memory/08` Operational #2, Open: "No staging/preview — edit JSON → push → auto-deploy goes straight to all live stores". Los 4 incidentes reales de producción (388d3df, 6c850d3, bd21724, 2758a54) se resolvieron **hacia delante**, ninguno con vuelta atrás. |
| 4 | **Legal/compliance review passed for scope** | ❌ NO_CUMPLE | `ls docs/security` → *No such file or directory*. No existe ningún `review-*.md`: la skill `security-review` **nunca se ha ejecutado**. El único análisis jurídico del repo (`docs/product/analisis-secciones-criticas.md:159`) se autodescarta por escrito: "No soy asesor jurídico". Y el alcance está incumplido en producción: solo **3 de 7** tiendas tienen bloque `company` (2 sociedades reales: USA GOVE S.L. ×2 y NM10 SHOP S.L.); `curl https://usafitnessalcobendas.com/` devuelve `index, follow` mientras `/aviso-legal` devuelve 200 con "Estamos actualizando la información legal…" — art. 10 LSSI incumplido **hoy, en vivo**. |

**Resultado: 0 de 4 criterios de entrada cumplidos.**

Nota de encuadre honesta: `docs/security/security-risk-map.md` y `docs/adr/` **no existen** (verificado; `git log --all --diff-filter=D` confirma que nunca existieron), pero en `phase-criteria.json` son `expected_artifact_paths` y `exit_criteria` de Launch — se producen *durante* Launch, no antes. No los cuento como bloqueos de entrada. Sí cuentan como deuda de fases anteriores (§3).

---

## 3. Confirmación retroactiva de la entrada en Iteration

`memory/13-phase-history.md` registra una única transición: **2026-06-24, "Onboarded existing project into MASTERMIND at phase Iteration"**, con *"Confidence at entry: Medium (phase picked by user during onboarding; confirm with /mm-gate after retroactive audit)"* y *"Link to gate review: pending first /mm-gate run"*. Esa confirmación llevaba 2 meses y 55 commits pendiente. Este gate la resuelve.

**La entrada en Iteration fue incorrecta.** De los 4 `entry_criteria` de Iteration, tres no se cumplían el 2026-06-24 y **siguen sin cumplirse hoy**:

| Criterio de entrada a Iteration | Estado 2026-06-24 | Estado 2026-08-25 | Evidencia |
|---|---|---|---|
| All P0 features shipped | No evaluable | No evaluable | No existe `docs/product/prd.md` ni `docs/features/`. Nunca hubo frontera de MVP. Sustantivamente, la misión declarada (migrar WordPress → sistema propio) va por **4 de 7**: sirven Astro marineda, alcobendas, grancasa y vigo; siguen en WordPress 7.1 + Elementor sobre Plesk villanueva, lasrosas y arcangel (verificado por curl: 34, 53 y 44 aciertos de `wp-content`). |
| First user sessions logged | ❌ | ❌ | `grep -c ga4Id src/data/stores.json` → **0** de 7. `npm run build` emite 7 avisos "sin ga4Id → los eventos de conversión no se envían a ningún sitio". curl a los 4 dominios Astro: `googletagmanager` = 0 en los cuatro. Inversión perversa: los 3 dominios WordPress **sí** miden (lasrosas sirve `GTM-MR7678J5`). Cada migración *pierde* la única medición que tenía. |
| Zero Critical/High security findings open | ❌ (nunca verificado) | ❌ | Nunca se ejecutó `security-review`; el criterio se dio por cumplido por **ausencia de hallazgos, no de problemas**. Hoy `npm audit` sobre 343 dependencias devuelve **10 vulnerabilidades: 0 Critical, 8 High**, 1 moderate, 1 low — sin un solo triaje escrito. Corrección a un auditor: el "casi-incidente" del commit 824f8ec **no fue una exposición pública consumada** (esos ficheros nunca se comitearon; curl hoy → 404); el bloqueo se sostiene solo por la ausencia de auditoría. |
| Observability in place | ❌ | ❌ | `package.json` tiene exactamente **2 dependencias**: `astro ^6.1.5` y `@astrojs/node ^10.0.4`. Grep de sentry/datadog/otel/uptimerobot/healthcheck sobre `src/`, `package.json`, `astro.config.mjs`, `.github/`, `scripts/` → **0 implementaciones**. `ls src/pages/` = 6 ficheros, ninguno endpoint de salud. `memory/08` Technical #3, Open: "prod errors are invisible until a user reports them". |

**Consecuencia:** el proyecto no *transitó* a Iteration; fue **colocado** en Iteration durante un onboarding. La fase actual está mal declarada. La corrección correcta es hacia atrás, no hacia delante: el proyecto está en **MVP**, construyendo. La única evidencia positiva es que los 3 `exit_criteria` de Iteration sí se cumplen hoy (`memory/08` y `memory/07` vivos con commits citados, slices nuevas enviadas) — pero cumplir la salida de una fase en la que nunca se entró legítimamente no valida la entrada en la siguiente.

---

## 4. Veredicto

**Status: BLOCK**

**Reasoning:** Los 4 criterios de entrada a Launch fallan los 4, sin un solo cumplimiento parcial: no hay un objetivo de servicio escrito, ni procedimiento de incidente, ni una sola vuelta atrás probada en 80 commits, ni ninguna revisión de cumplimiento — mientras dos dominios comerciales vivos publican sin identificar al prestador. Además, la confirmación retroactiva demuestra que la fase actual está mal declarada: 3 de los 4 criterios de entrada a Iteration no se cumplían en 2026-06-24 y siguen sin cumplirse. No se avanza una fase que no se llegó a alcanzar.

**Approved next phase:** ninguna.

---

## 5. Huecos bloqueantes y remediación

Ordenados por lo que desbloquea más (los dos primeros cierran, entre ambos, 3 de los 6 bloqueos).

**B1 — Cumplimiento legal del alcance (Launch entry #4 + exposición viva hoy)**
Lo que falta: la revisión no existe, el alcance no está escrito, y 4 de 7 tiendas no tienen `company` (villanueva, marineda, lasrosas, alcobendas). Alcobendas está en `index, follow` con el aviso legal vacío.
Remediación, en este orden:
1. **Hoy mismo**, sin esperar a nadie: que `legalReady === false` deje de servir la landing en `index, follow` — hoy `src/pages/[slug]/[doc].astro` solo aplica `noindex` a las 4 páginas legales, no a la home. Añadir test en `tests/smoke.test.mjs`. → `/mm-plan`
2. Recabar razón social, NIF, domicilio, email y teléfono legal de las 4 sociedades (dependencia externa: empezar ya). El esquema Zod (`src/data/stores.ts:53-57`, `strictObject`) ya valida el formato.
3. Ejecutar la skill **`security-review`** sobre el alcance real → produce `docs/security/review-2026-XX-lssi-rgpd.md` con el alcance escrito (qué 7 dominios, qué sociedades, qué tratamientos), y de paso da materia para `docs/security/security-risk-map.md`, artefacto de salida de Launch.
4. Dictamen jurídico externo: acción del usuario, no del agente.

**B2 — Observabilidad y medición (retroactivo Iteration #2 y #4; prerrequisito de B3)**
Es el desbloqueo más barato del proyecto y no depende de código: `ConversionTracking.astro` ya emite los tres eventos (commit 2800b67) y solo espera el ID.
Remediación: (a) monitor de uptime externo sobre los 7 dominios (0 código, plan gratuito) — cierra la detección de caídas; (b) endpoint `/_health` que devuelva 200 y el nº de tiendas cargadas; (c) rellenar `ga4Id` + `googleSiteVerification` en las 4 tiendas vivas y verificar con `curl -s https://<dominio>/ | grep googletagmanager`. → `/mm-plan` para la slice; actualizar `memory/08` Technical #3 a *Mitigated* solo cuando el monitor emita avisos, no cuando esté dado de alta.

**B3 — SLA/SLO definido (Launch entry #1)**
No se puede definir un SLO sin B2: hoy no existe una sola cifra de disponibilidad. Remediación: tras 2-4 semanas de monitor, escribir el SLO honesto de un operador unipersonal (disponibilidad mensual defendible, ventana de respuesta en horario laboral, exclusiones: Railway/Cloudflare, vacaciones, datos aportados por el franquiciado). Rellenar `memory/03-architecture.md:49-52` con la skill **`architecture-mapper`** y registrarlo como ADR. Pasar por **`approval-gatekeeper`**: es compromiso hacia clientes que pagan cuota mensual.

**B4 — Runbook de incidentes (Launch entry #2)**
Media jornada, sin dependencias externas. Crear `docs/runbooks/caida-de-dominio.md`: árbol de diagnóstico (¿caen los 7 o solo uno? → 7 = servicio Railway o Cloudflare; 1 = DNS/dominio), comandos concretos (`curl -I -H 'Host: usafitnessvillanueva.com' <origen>`), dónde están los logs de Railway, cómo forzar redespliegue, y tabla de contacto de las 7 sociedades con quién avisa a quién y en qué plazo. Skill: **`flow-analyzer`** para modelar las rutas de fallo; registrar en `memory/07-decisions-log.md`.

**B5 — Rollback probado (Launch entry #3)**
Depende de B4 (sin runbook, el rollback no tiene procedimiento). Remediación: (a) **ensayar** un rollback real — desplegar un cambio inocuo, revertirlo, cronometrar hasta que los 4 dominios sirvan la versión anterior, y escribir el tiempo medido en `docs/runbooks/rollback.md`; (b) versionar la config de despliegue (`railway.json`) para que no dependa de la memoria de una persona; (c) cerrar la carrera CI/deploy: proteger `main` exigiendo PR + CI verde, o mover el deploy a un job con `needs: verificar`. → `/mm-plan` + **`approval-gatekeeper`** (toca producción).

**B6 — Triaje de las 8 vulnerabilidades High (retroactivo Iteration #3)**
Hoy no hay riesgo aceptado; hay riesgo ignorado. Remediación: **`security-review`** para separar build-time (vite, esbuild, postcss, svgo, js-yaml) de runtime (`astro` sirve los 7 dominios en SSR), documentar en `docs/security/review-2026-08-25-deps.md`, y llevar los aceptados a `memory/08` como *Accepted* con justificación. Ojo: subir a `astro@7.2.6` / `@astrojs/node@11.1.4` es **salto mayor** (6→7, 10→11) — pasa por `/mm-plan` y `approval-gatekeeper`, no por `npm audit fix`. Dato del triaje ya hecho aquí: GHSA-2pvr-wf23-7pc7 (SSRF, CVSS 7.5) **probablemente no aplica** — las 6 rutas del proyecto son `prerender = false`, no hay página de error prerenderizada. Queda al menos GHSA-8hv8-536x-4wqp (XSS reflejado vía slot name, CVSS 7.1) sin coartada.

---

## 6. Lo que sí está listo

Esta lista no es cortesía: es lo que un gate honesto debe reconocer.

- **Los 3 criterios de SALIDA de Iteration se cumplen de verdad.** `memory/08-known-risks.md` tiene 22 filas con riesgos reales del mundo (no teóricos) y 6-7 cerrados **con hash de commit citado** (d13a1e1, fbd52d0, e50de48, 24b0a17, c9626f8). `memory/07-decisions-log.md` tiene 15 decisiones con alternativas y consecuencias. Slices nuevas enviadas: 58 commits después del onboarding, 26 de código.
- **La suite de tests es real y verde.** Ejecutada: **60/60 pass, 12 suites, 0 fail**. Y no son tests de escaparate: corren contra el **build de producción** con `node:http` y la cabecera `Host` falseada, porque `astro dev` la bloquea (decisión registrada en `memory/07:83`). `tests/smoke.test.mjs:184` recorre las 7×7 combinaciones de NIF para verificar que ningún dominio filtra datos de otra sociedad.
- **El aislamiento entre inquilinos funciona.** Verificado con peticiones reales: `/vigo/aviso-legal` con `Host: usafitnessmarineda.com` → 404; path traversal (`/../vigo/…`, `/%2e%2e/vigo/…`) → 404; la cabecera `Host` **no se refleja** en el HTML (canonical y og:url salen de `store.domain`, dato validado por Zod, no de la petición).
- **Las guardas de datos son mejores que la media.** Validación Zod ejecutada en `astro:config:setup`, es decir **antes de compilar**: un `stores.json` malformado no llega a desplegarse. La integración `usafitness:validar-datos` emite 24 avisos honestos y precisos (7 sin ga4Id, 4 sin datos legales, 4 sin reseñas, 4 WhatsApp sin verificar, 3 embeds de Maps fabricados a mano, 1 sin fotos, 1 sin coordenadas).
- **Cumplimiento técnico de consentimiento, verificado en vivo.** Fuentes autoalojadas (`public/fonts/inter-latin.woff2`, `grep fonts.googleapis src/` → 0), mapa detrás de una fachada con clic, Consent Mode v2 en ambos sentidos y consentimiento revocable (fb40b4e). curl a vigo, alcobendas, marineda y grancasa: **cero peticiones a terceros antes del consentimiento**. Es más de lo que hacen los 4 dominios WordPress que quedan.
- **Cero secretos comiteados** en toda la historia del repositorio.

El problema de este proyecto no es la calidad de lo construido. Es que está **construido, no lanzado**: sin medir, sin poder detectar una caída, sin poder volver atrás y sin haber preguntado nunca a nadie si lo que se publica en nombre de siete sociedades es legal.

---

## 7. Entrada de transición en borrador

```markdown
<!-- ===================================================================== -->
<!-- BLOQUE A — NO APLICABLE TODAVÍA. Veredicto 2026-08-25 = BLOCK.        -->
<!-- No escribir hasta que B1..B6 estén cerrados y se re-ejecute /mm-gate. -->
<!-- ===================================================================== -->

### YYYY-MM-DD — Iteration → Launch
- **Decided by:** User + Claude Opus 5
- **Trigger:** Cierre de los 6 huecos bloqueantes del gate del 2026-08-25 y re-ejecución de /mm-gate.
- **Entry criteria met:**
  - [ ] SLA/SLO defined — objetivo de disponibilidad, ventana de respuesta y exclusiones escritos en memory/03 §NFR + ADR, con línea base medida por el monitor de uptime.
  - [ ] Incident runbook exists — docs/runbooks/caida-de-dominio.md con árbol de diagnóstico, comandos y tabla de contacto de las 7 sociedades.
  - [ ] Rollback tested — ensayo real cronometrado y registrado en docs/runbooks/rollback.md; railway.json versionado; CI bloqueando el deploy.
  - [ ] Legal/compliance review passed for scope — docs/security/review-<fecha>-lssi-rgpd.md con alcance escrito; company presente en las 7 tiendas; dictamen jurídico externo referenciado.
- **Artifacts promoted:**
  - `docs/runbooks/caida-de-dominio.md`, `docs/runbooks/rollback.md` — operación
  - `docs/security/review-<fecha>-lssi-rgpd.md` — revisión de cumplimiento del alcance
  - `memory/03-architecture.md` §NFR — SLO definido (hoy TBD en la línea 52)
- **Blockers waived (if any):**
  - <ninguno previsto; cualquier waiver exige justificación escrita y approval-gatekeeper>
- **Confidence at entry:** <a fijar en el gate real>
- **Expected duration in new phase:** <semanas>
- **Success metric for this phase:** 7/7 dominios sirviendo el sistema, con SLO cumplido y medido durante 30 días consecutivos.
- **Link to gate review:** `docs/adr/XXXX-phase-gate-iteration-launch.md`

<!-- ===================================================================== -->
<!-- BLOQUE B — SÍ APLICABLE HOY. Corrección de registro, no transición.   -->
<!-- Requiere confirmación explícita del usuario antes de escribirse.      -->
<!-- ===================================================================== -->

### 2026-08-25 — Corrección de registro: la fase declarada era incorrecta (Iteration → MVP)
- **Decided by:** User + Claude Opus 5
- **Trigger:** Primer /mm-gate del proyecto, que es a la vez la confirmación retroactiva
  pendiente desde el 2026-06-24 ("Confidence at entry: Medium … confirm with /mm-gate
  after retroactive audit"; "Link to gate review: pending first /mm-gate run").
- **Hallazgo:** el proyecto no transitó a Iteration, fue colocado en Iteration durante el
  onboarding. 3 de los 4 entry_criteria de Iteration no se cumplían el 2026-06-24 y siguen
  sin cumplirse: "First user sessions logged" (0 de 7 tiendas con ga4Id; 0 peticiones a
  googletagmanager en los 4 dominios Astro vivos), "Zero Critical/High security findings
  open" (nunca verificado; npm audit devuelve hoy 8 High sin triaje), "Observability in
  place" (0 dependencias de observabilidad en un package.json de 2 paquetes; sin endpoint
  de salud). El cuarto, "All P0 features shipped", es inevaluable: no existe docs/product/prd.md
  ni frontera de MVP escrita.
- **Corrección aplicada:** Current phase = MVP, Since = 2026-06-24 (supersede la entrada de
  esa fecha, que se conserva). Confidence = High (verificado con evidencia, no elegido).
- **Deuda de fases anteriores registrada explícitamente:**
  - Definition exit "first ADRs accepted" y MVP entry "Architecture ADRs accepted":
    cobertura 0 ADR sobre ~13 decisiones identificables (10 en memory/07 + 3 fundacionales
    en memory/03). `docs/adr/` nunca existió.
  - expected_artifact_paths incumplidos: docs/product/prd.md, docs/architecture/system-map.md,
    docs/testing/strategy.md, docs/flows/, docs/features/.
- **Salida de MVP hacia Iteration (condiciones para el próximo gate):**
  ga4Id en las tiendas vivas + monitor de uptime emitiendo + triaje de dependencias escrito
  + frontera de P0 declarada en memory/06.
- **Link to gate review:** transcripción del gate del 2026-08-25 (este documento).
```

---

## 8. Autocrítica

- **El supuesto más frágil de este gate es que `phase-criteria.json` es la vara correcta para este proyecto.** Es una plantilla genérica aplicada a un producto de 7 landings de barrio con tráfico previsiblemente bajo. "Rollback tested" y "SLA/SLO defined" son criterios pensados para sistemas con más superficie; un operador unipersonal podría razonablemente argumentar que un rollback de Railway por UI y un SLO de "lo arreglo cuando lo vea" son proporcionados. **No he cedido en eso** —el proyecto factura cuota mensual a 7 sociedades y propone vender un SLA, lo que sube el listón, no lo baja— pero si el usuario decide que el criterio no aplica, el sitio correcto para discutirlo es editando `phase-criteria.json` y registrándolo como decisión, no waiveando el gate.
- **La parte más débil del análisis es el criterio "All P0 features shipped".** Lo he declarado no evaluable en vez de incumplido, que es lo honesto, pero eso significa que la corrección Iteration → MVP se apoya en 3 criterios verificados y 1 hueco. Un lector podría sostener que un proyecto sin PRD tampoco está "en MVP" en ningún sentido MASTERMIND, y que la etiqueta correcta es Definition. No lo defiendo con fuerza: la etiqueta importa menos que el hecho de que la fase declarada era falsa.
- **Seis auditores independientes llegaron al mismo veredicto, y eso debería inquietar tanto como tranquilizar.** El escéptico refutó 6 de 29 bloqueos propuestos, casi todos por el mismo error sistemático: confundir `exit_criteria`/`expected_artifact_paths` de Launch con `entry_criteria`. Si ese sesgo apareció seis veces, es plausible que quede alguna afirmación con el mismo defecto que no se detectó. He recontado los 4 criterios de entrada uno a uno contra el JSON por eso.
- **Riesgo no mencionado en ninguna dimensión: el bus factor.** `memory/08` Operational #3 declara bus factor = 1 con mitigación "Documentation" — y la documentación operativa es precisamente la que no existe (B4). Todos los bloqueos de este gate se remedian con trabajo de una sola persona que ya está saturada migrando DNS y persiguiendo datos legales de 4 franquiciados. El riesgo real no es que los bloqueos sean caros: es que se cierren *a medias* para poder marcar la casilla — un runbook que nadie ha ensayado y un SLO inventado sin datos serían peor que su ausencia, porque convertirían un hueco visible en una falsa garantía. Ese es exactamente el patrón que produjo la entrada en Iteration de 2026-06-24.
