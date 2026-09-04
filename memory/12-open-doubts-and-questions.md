# Open Doubts and Questions — USAFitness Landing Pages

**Last updated:** 2026-08-24
**Current phase:** Iteration

> This file is the living record of the project's open doubts, the questions the AI has asked the user, and the user's own observations.
> It is updated at every checkpoint, before and after any important document or implementation.
> It is the single source of truth for *"what we still don't know"*.

---

## 0. Correction of record (2026-08-24)

The first pass of this file (and of `memory/00-project-brief.md`) described USAFitness as a chain of **gyms**. **That was wrong.** These are **tiendas de suplementación deportiva** — sports-nutrition supplement retail stores, all located inside shopping centres. The evidence was in `src/data/stores.json` all along (`"Tu tienda de suplementación en…"`, `"Proteínas, creatinas, aminoácidos"`). The error came from extracting fields with `grep` instead of reading the file, then inferring the sector from the brand name.

**Process lesson:** verify the product's identity from primary content before asking the user anything about users or market. Questions Q3/Q4 below were vague *and* already answerable from the repo — they should never have been asked.

---

## 1. AI Current Doubts (Open)

### Technical
- [ ] How many stores must this scale to (5 → 20 → 100)? Determines whether file-based `stores.json` stays viable or needs schema validation / CMS.
- [ ] Is Railway + single Node service the long-term host? All client domains depend on one service.
- [ ] Appetite for a test/CI safety net given zero tests and a paying-client site per domain.

### Product / Value Proposition
- [ ] Differentiator vs. what a store already gets free from a Google Business Profile — what does the own-domain landing add that GBP does not?
- [ ] Is the landing the store's primary web presence, or complementary to its Instagram / GBP?

### Users / Jobs-to-be-Done
- [x] ~~Who is the end visitor~~ — answered from code: someone searching for sports supplements near them, who values in-store personal advice (every review praises named staff) and discounts ("hasta 20% dto.").

### Business Model / Monetization
- [x] ~~How this makes money~~ — recurring **monthly fee per store**, paid by each store owner. (Q5)
- [x] ~~Store ownership structure~~ — **independent companies, each with its own CIF**; **one company may hold several stores** (confirmed 2026-08-24: USA GOVE S.L. / B22465587 owns both El Arcángel and GranCasa). (Q6)
- [x] ~~Transactional roadmap~~ — **no**. (Q7)
- [ ] Churn risk: what makes a store owner stop paying? (Not asked yet — belongs to the audit.)
- [ ] Is the service sold beyond USAFitness-branded stores, or only within this brand?

### UX / Critical Flows / Edge Cases
- [x] ~~Primary conversion action~~ — **all three equally**: WhatsApp, phone call, directions. (Q2)
- [ ] Are those three conversions tracked as GA4 events today? (Verifying in code.)

### Risks (technical, legal, operational, regulatory)
- [ ] **Duplicate reviews across stores** — identical review text + identical author names reused across Villanueva / Marineda / Las Rosas. Trust, SEO-duplication and possibly consent implications. Needs owner decision.
- [ ] 4 of 5 stores have no real legal `company` data → legal pages `noindex`. Priority?
- [ ] Single Railway service = SPOF for every paying client's domain simultaneously.

### Assumptions that might be wrong
- [ ] That the operator is the sole builder and decision-maker.
- [ ] That all 5 stores are current paying clients (some may be pilots/free).

---

## 2. High-Quality Questions Asked to the User

### Answered

### Q2 — UX / Conversion
- **Question:** What single thing should a visitor DO — WhatsApp, call, directions, or sign up online?
- **Status:** Answered (2026-08-24)
- **User response:** "las 3 que mencionas" — WhatsApp, phone and directions are all primary.
- **Impact:** No single hero CTA; the three contact paths must each be prominent and should each be measured.

### Q5 — Business Model
- **Question:** How does this make money for you specifically?
- **Status:** Answered (2026-08-24)
- **User response:** Each store pays a **monthly fee for the service**. Amounts deliberately not shared.
- **Impact:** This is a productized recurring service, not an internal marketing site. Reliability and per-client SEO results are the retention drivers. Reframes the whole risk model.

### Q6 — Business Model / Ownership
- **Question:** One company or independent franchisees?
- **Status:** Answered (2026-08-24)
- **User response:** **Totally independent companies**, each with its own CIF and legal entity; some owners have 2–3 stores.
- **Refinement (2026-08-24):** a single company can be the legal owner of several stores — `USA GOVE S.L.` (B22465587) is the titular of both El Arcángel and GranCasa. Company 1—N Store.
- **Impact:** Confirms the per-store `company` block is required. The same company block legitimately repeats across stores; that is not duplicated data.

### Q7 — Business Model / Roadmap
- **Question:** Any intent to add transactional features (online signup, booking, payments)?
- **Status:** Answered (2026-08-24)
- **User response:** No.
- **Impact:** The no-DB / no-auth architecture is a permanent, correct choice — not tech debt. Rules out a whole class of "add e-commerce" recommendations.

### Withdrawn (bad questions — answerable from the repo)

### Q1, Q3, Q4 — Product / Users
- **Status:** Withdrawn 2026-08-24. Q1 was premised on the wrong sector (gyms). Q3 and Q4 were vague and the repo already answered them: the visitor is a sports-supplement buyer looking for a store near them; store content, reviews and schedules make the job-to-be-done clear.
- **Impact:** Process correction — investigate primary sources before asking the user.

### Still open (re-scoped, not yet re-asked)

### Q8 — Technical / Scale
- **Question:** How many stores in 12 months — ~5, ~20, ~100?
- **Why it matters:** At 5, `stores.json` is fine. At 100, unvalidated JSON editing on a paying-client system becomes the main operational risk.
- **Status:** Pending

### Q9 — Technical / Safety net
- **Question:** How much do you want to invest in a build check / per-store smoke test vs. keep shipping fast?
- **Why it matters:** Every client's live site depends on one shared template and one shared service. A broken deploy breaks all paying clients at once.
- **Status:** Pending

### Q10 — UX / Metrics
- **Question:** Do you track WhatsApp/call/directions clicks as GA4 events? Do you report results to the stores?
- **Why it matters:** For a paid monthly service, demonstrable results are the retention mechanism. Untracked conversions = no proof of value at renewal time.
- **Status:** Pending

### Q11 — Risk / Legal
- **Question:** Are the duplicated reviews across stores intentional placeholders, and is completing legal data for the 4 pending stores a near-term priority?
- **Why it matters:** Identical reviews with identical author names on three different companies' sites is a trust and compliance exposure for your clients, not just for you.
- **Status:** Pending

### Q12 — Strategy / Vision
- **Question:** 12 months out, what does "this worked" look like?
- **Why it matters:** Defines the North Star and success metric for `01-product-vision.md`.
- **Status:** Pending

### Q13 — Datos que bloquean el roadmap (2026-08-24)
No son preguntas de estrategia: cada una es una llamada de teléfono y desbloquea trabajo ya escrito.

| # | Qué falta | Qué desbloquea | A quién |
|---|---|---|---|
| a | **Razón social + NIF + domicilio + email legal** de Villanueva, Marineda, Las Rosas y Alcobendas | 16 páginas legales salen de `noindex` | franquiciado de cada tienda |
| b | **Apuntar el DNS de El Arcángel** a Railway | Es la migración más cercana: ya tiene todo lo demás | el usuario |
| c | **Fotos de GranCasa** (6) y **alta de su ficha de Google Business** | Galería + mapa por ficha en vez de por dirección | franquiciado de GranCasa |
| d | **`place_id` reales** de Villanueva, Marineda y Las Rosas | Los mapas actuales usan valores que parecen sintéticos | ficha de Google de cada tienda |
| e | **Confirmar dirección de Villanueva**: el JSON dice C.C. El Zoco, una fuente externa apunta a C.C. La Pasada | Coherencia NAP, que es el activo que se vende | franquiciado |
| f | **Confirmar los 4 números de WhatsApp** (son fijos). El usuario asume que funcionan; **desde aquí es imposible verificarlo** — `wa.me` responde igual con un número inventado | Uno de los tres caminos de conversión | franquiciado |
| g | **Reseñas propias reales** para las 4 tiendas que se quedaron a 0 | Prueba social; la sección hoy no se renderiza | franquiciado / ficha de Google |

- **Status:** Pending — entregada al usuario la lista con el paso a paso.

### Q14 — Ninguna tienda usa el sistema de plantillas
- **Question:** ¿a qué tienda se le asigna `angular`, y quién lo decide — el usuario, o el franquiciado de esa tienda?
- **Why it matters:** `clasica` y `angular` existen, funcionan y **no las usa nadie**: las 7 tiendas se ven igual. Un sistema de diferenciación que ninguna tienda ha estrenado no está validado — no sabemos si `angular` aguanta el contenido real de una tienda concreta hasta verlo en su dominio.
- **Status:** Pending

### Q15 — Qué pasa cuando el esquema estricto haga fallar el build
- **Question:** cuando la Fase 3.2 convierta los datos incompletos en errores de build, ¿se bloquea el despliegue de las tiendas afectadas, o se degradan a "campo opcional con aviso" hasta tener los datos?
- **Why it matters:** hay 4 tiendas sin `company` y 3 con `place_id` sintéticos. Un esquema estricto de verdad impide desplegar 7 dominios vivos hasta que lleguen datos que dependen de terceros. Un esquema laxo no arregla nada.
- **Recomendación:** estricto para lo que rompe render o publica un dato falso; aviso en build para lo que solo degrada (galería vacía, mapa por dirección). Se implementa así salvo indicación en contra.
- **Status:** Pending — no bloquea empezar 3.2.

---

## 3. User Observations / Notes

- 2026-08-24: "son tiendas de suplementación deportiva", not gyms. Stores are independent companies with their own CIF; some owners have 2–3 stores.
- 2026-08-24: prefers to be addressed in **Spanish**.
- 2026-08-24: expects the agent to **investigate the repo properly before asking**; vague questions whose answers are in the code are not acceptable.
- 2026-08-24: *"lo que necesito que hagas es no hacerme caso a mi, sino analizar"* — pide análisis propio y contraste, no ejecución literal de lo que él dice.
- 2026-08-24: decidió **mantener los WhatsApp que son fijos** en contra de la recomendación (tarea 0.3). Riesgo asumido explícitamente, no mitigado.
- 2026-08-24: quería **automatizar reseñas y nota de Google**. Se descartó con fundamento (ver `07-decisions-log`): Google declara inelegibles las valoraciones autoservidas y prohíbe agregar reseñas de otros sitios. La palanca real es la ficha de Google Business.

---

## 4. Recently Resolved Doubts

- **Project phase** — resolved 2026-08-24: confirmed **Iteration** by the user. Pending formal `/mm-gate` confirmation in Phase 7.
- **Sector / what the business actually is** — resolved 2026-08-24: sports-supplement retail stores, not gyms. Source: `src/data/stores.json` + user correction.
- **Monetization, ownership structure, transactional roadmap, conversion priority** — resolved 2026-08-24 (Q5, Q6, Q7, Q2 above).
- **Q11 (reseñas duplicadas)** — resuelto 2026-08-24: no eran placeholders intencionados. **Retiradas las 10** (`d13a1e1`) y fijado con un test que impide que la misma persona firme en dos tiendas. Los datos legales siguen pendientes → Q13a.
- **Q9 (cuánta red de seguridad)** — resuelto 2026-08-24 por los hechos: 34 tests de humo + CI (`c9626f8`), sin dependencias y sin coste de mantenimiento apreciable. Encontraron dos fallos reales el mismo día.
- **Los tres ejes de diferenciación de plantillas** — resuelto 2026-08-24 por el usuario: visual + estructura + diseño por sección; el orden lo propone la plantilla y lo ajusta la tienda; 2-3 plantillas para empezar.

---

## 5. Deferred / Parked

- Pricing/amounts of the monthly fee — user explicitly declined to share; not needed for the audit.

---

## Maintenance

- This file must be reviewed at every **phase gate**.
- The `doubt-surfacer` and `memory-updater` skills are responsible for keeping it accurate.
- Never delete entries. Move them to *Recently Resolved* or *Deferred*.


## 2026-08-27 — Abiertas para el dueño (F0 del plan de método)

1. **Beneficios completos del programa de socio** — «cuando me los den te los paso» (27-ago). Sigue siendo EL bloqueante de la sección estrella.
2. **¿Restricciones de la central** sobre qué puede publicar cada tienda? Sigue abierta (la pregunta del contrato de franquicia).

### Respondidas el 27-ago (tanda 2 — no re-preguntar)
- **Precios:** NO visibles por ahora, pero el sistema los soporta como campo opcional oculto «por si alguien sí los quiere». ✓
- **Ofertas: DOS NIVELES.** La central manda ofertas y el operador TIENE ACCESO a ellas (→ gestionable de serie); el franquiciado puede querer las suyas (→ override por tienda). Modelo: oferta-central compartida + oferta-propia opcional que la pisa. ✓
- **Norte y jerarquías:** pidió re-análisis profundo mío («mira si le falta o sobra algo») y después revisarlos él sobre el resultado abierto. En curso. ✓

### Respondidas el 27-ago (no re-preguntar)
- Programa socio: SIN doc escrito; alta EN TIENDA, rápida. ✓
- Productos: todos en usafitness.es (verificado: 1.683, fotos descargables). ✓
- Plantilla oscura: sí como opción, «está bien tener ambas». ✓
- Referencias visuales: investigar Awwwards/CodePen/gits/tendencias, presentar ARTEFACTO anotado y esperar su confirmación antes de construir; avisar si necesito skills/herramientas extra. ✓

### Respondidas el 27-ago (tanda 3 — no re-preguntar)
- **Norte y jerarquías: APROBADOS** («okey») con cláusula de revisión futura. F0 cerrada (el catálogo también está extraído). ✓
- **¿Quién paga de los 8?: NADIE.** Son pilotos del dueño para verificar viabilidad; solo tienen la web, sin otros servicios. La suposición «some may be pilots» (24-ago) queda cerrada. ✓
- **Precio del servicio: APLAZADO** a decisión del dueño «cuando tengamos todo», con desglose y análisis completo previos. Los importes de memory/15 son propuesta. ✓
- **energía en main: se queda, sin ofrecerse** («lo que tú consideres») — decisión razonada en memory/07. ✓

### Respondidas el 27-ago (tanda 4)
- **Las 5 secciones F1: APROBADAS** en el artefacto de referencias («me gusta el análisis y estas secciones»). ✓
- **Nueva puerta pedida:** inventario COMPLETO (todas las secciones, todas las landings, + estrategias de otros servicios como «suscripciones para novedades») presentado en artefacto y confirmado ANTES de meterse en diseño. ✓
- Pendiente sin responder: expertos E-E-A-T (Gouveia/Gil) en la web — sí/no. (No urge.)

### Respondidas el 27-ago (tanda 5)
- **Inventario completo: APROBADO en general.** A2 entran las tres (FAQ, Equipo, Novedades) — «dan además diferenciación entre una tienda y otra». ✓
- **«Nuestro equipo» ELEVADA a apuesta estratégica:** «aprovechar mucho… puede además abrir nuevos caminos». Diseñarla como plataforma, no como sección decorativa. ✓
- **Pedida RONDA 2 de innovación:** «haz otro loop… innova, sé bold… objetivos nuevos… algo interactivo… vamos más allá». En curso. ✓

### Respondidas el 27-ago (tanda 6)
- **Ronda 2: APROBADA ÍNTEGRA** («me gusta, buen trabajo, lo apruebo, y me gustan los nuevos objetivos también»). P6-P8 y N6-N8 son ya del sistema (metodología §2 + registro de eventos ampliado). ✓
- **EL INVENTARIO GEN 2 QUEDA CERRADO** (base + ronda 2). Siguiente fase: DISEÑO. ✓

### Abiertas (puertas externas para construir ronda 2)
1. **OK escrito de la central**: distribuir la guía PDF + imagen/credenciales del equipo — un solo viaje.
2. **Título de Amanda Gil documentado** (regulado; sin él, firma sin titulación específica).
3. Beneficios completos del socio (sin fecha — sigue).
4. Expertos en la web sí/no ya quedó implícitamente respondida con la aprobación de ronda 2 (equipo elevado y ruta Mujer aprobada) — PERO condicionada a la puerta 1-2.

### Abiertas tras el loop de secciones (27-ago, tarde) — detalle en docs/product/loop-secciones-2026-08-27.md
1. El vídeo-tour del ANEXO: ¿la central te entrega el fichero editado o solo el enlace a su cuenta oficial? Decide si va autoalojado con tope de peso o como fachada de tercero declarada en cookies, y si cabe pedirlo en el mismo viaje que el PDF de la guía y las imágenes del equipo.
2. ¿Aceptas que el franquiciado elija UNA prioridad en el alta (visita / oferta / socio / asesoramiento) que mueve un solo bloque, en vez de un orden libre de secciones por tienda? Es la diferencia entre 50 altas con regla y 50 arrays a mano.
3. Para el enlace «escribe tu reseña»: ¿lo sacas tú del perfil de Google de cada tienda en la sesión de alta (Read Reviews → Get more reviews, requiere el acceso de gestor que ya pides) o prefieres que use el Place ID con la herramienta pública? La primera es la vía oficial documentada; la segunda es la habitual pero no la he encontrado en ninguna página oficial de Google.
4. El vale de orientación gratuita lo promete la propia GUÍA de la central en nombre de la marca: ¿lo publicamos por defecto en todas las tiendas con opción de quitarlo (opt-out), en vez de esperar a que cada franquiciado lo firme (opt-in)?
5. ¿Se puede citar la GUÍA TIENDAS literalmente en la web (sus FAQ respondidas por dependientes, el capítulo de expertos) o solo sirve como fuente interna? Es distinto del permiso de alojar el PDF que ya está pedido, y decide quién escribe la FAQ y las verdades.
6. Social: ¿aceptas que deje de ser una sección del cuerpo y baje al pie (periferia), y que Novedades pase a ser pieza del servicio mensual y no de la v1? Libera dos huecos de orden en las cinco plantillas sin perder ningún evento.
