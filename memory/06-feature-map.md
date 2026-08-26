# Feature Map — USAFITNESS · ROADMAP DEFINITIVO

**Última actualización:** 2026-08-26 · Sustituye al roadmap anterior.
**Método:** todo lo marcado **[V]** lo he verificado en el código o en `src/data/stores.json` en esta sesión. Lo marcado **[S]** es supuesto o viene de fuentes externas que no he podido comprobar yo. Lo marcado 🔒 depende de un dato que solo puede aportar el franquiciado.

---

## 0. LÍNEA BASE VERIFICADA (leer antes de priorizar nada)

Estos hechos reordenan todo lo demás. No son opiniones de diseño.

| Hecho | Evidencia |
|---|---|
| ~~**El sistema sirve 2 dominios, no 7.**~~ **CADUCADO — remedido 2026-08-26 contra los dominios en vivo, no contra memoria.** Van **5 de 7 en nuestro Astro** (Marineda, Alcobendas, GranCasa, Vigo, El Arcángel — los cinco sirven `/_astro/`). **Villanueva sigue en WordPress** (`wp-content` en el HTML). **Las Rosas está caída: el DNS no resuelve** — ver la fila siguiente | **[V 2026-08-26 — `curl` a los 7 dominios]** |
| 🔴 **`usafitnesslasrosas.com` no resuelve — la tienda está fuera de línea ahora mismo.** No es que sirva mal: no hay DNS, así que tampoco queda el WordPress anterior. Diagnóstico: el dominio está `active` en el registro (caduca 2027-04-09) y delegado a `michelle/mitchell.ns.cloudflare.com`, **los mismos nameservers que Vigo, que sí funciona**. Preguntando directamente a `michelle`, Vigo resuelve y Las Rosas devuelve **REFUSED** — o sea, esos NS no sirven esa zona. El registro marca `last changed 2026-08-26` (hoy). Lectura: los nameservers se cambiaron a Cloudflare hoy y **la zona todavía no está activa en la cuenta**. Se arregla añadiendo el dominio en Cloudflare; no hay nada que tocar en el repo | **[V 2026-08-26 — RDAP de Verisign + consulta directa al NS]** |
| **Analítica: 0 de 7.** El campo `ga4Id` **no existe** en ninguna de las 7 fichas. `googleSiteVerification` tampoco | `stores.json` **[V]** |
| **El banner de cookies no aparece en ningún dominio.** `CookieConsent.astro:16` → `const avisoCookies = analitica;` y `analitica = !!ga4Id`. El commit `fb40b4e` creó las dos variables y el comentario, pero las dejó iguales: **el desacople no está hecho**, y `memory/06` decía que sí — **✅ CERRADO (Fase 2).** `avisoCookies` ya no es `analitica`: el aviso se pinta con o sin `ga4Id` y gtag.js solo se inyecta al aceptar. | `CookieConsent.astro` **[V]** |
| **Hay terceros cargando sin consentimiento hoy.** `Location.astro:21` incrusta el iframe de Google Maps; `Landing.astro:169-171` carga Google Fonts con dos `preconnect`. La IP del visitante llega a Google antes de pintar nada, y no hay aviso — **✅ CERRADO (Fase 2).** Maps pasó a fachada con clic (el `<iframe>` que queda en el fichero está dentro de un comentario) y no queda un solo `preconnect` a Google Fonts en `src/`. | **[V]** |
| ~~**`heroImage` es una prop muerta.**~~ **CADUCADO — reverificado 2026-08-26.** `Hero.astro:19` ya hace `src={heroImage}` sobre un `<img class="hero-bg">`; el `background-image` fijo se retiró (queda el comentario en la línea 54 explicando el cambio). Cada tienda pinta su propia cabecera | **[V 2026-08-26]** |
| **WhatsApp utilizable: 1 de 7.** Solo Vigo tiene móvil real (`+34661490626`). Villanueva, Marineda, Las Rosas y Alcobendas tienen el **fijo copiado** en el campo `whatsapp`. GranCasa y El Arcángel no tienen campo | `stores.json` **[V]** |
| **Responsables del tratamiento identificables: 2, no 3.** USA GOVE S.L. (B22465587) es dueña de **GranCasa y El Arcángel**; NM10 SHOP S.L. (B22854681) de Vigo. Las otras 4 no tienen bloque `company` | **[V]** |
| **Dato legal erróneo publicado.** `emailLegal` de El Arcángel es `grancasa@tiendausa.es` (el correo de otra tienda) y el de Vigo es `adricbp@gmail.com` (Gmail personal como contacto legal de una S.L.) | **[V]** |
| **Las reseñas se repiten en 4 tiendas, no en 3.** *Hiba de la Iglesia Moreno*, *Amaya Guerra* y *Andrea García* firman en **Marineda, Las Rosas y Vigo**; *Andrea García* además en **Villanueva**. En Marineda y Las Rosas el texto es idéntico palabra por palabra. `memory/06` marcaba Vigo como "reseñas propias": **es falso** | **[V]** |
| **Las dos plantillas tienen cero adoptantes.** `template` y `sections` están **ausentes en las 7 tiendas**. El sistema de plantillas funciona y no lo usa nadie | **[V]** |
| **Cualquier URL nueva es imposible hoy.** `middleware.ts` solo reescribe `/` y los 4 slugs legales, comparando **el primer segmento**. Todo lo demás cae en `[...slug].astro`, que hace `Astro.redirect('/')`. No existe `404.astro`: los 7 dominios generan soft-404 — **✅ CERRADO (3.4 + 3.5).** El middleware reescribe *cualquier* ruta bajo el slug y decide el enrutador de Astro; `404.astro` existe y devuelve 404 real. | **[V]** |
| **Sin tests, sin CI, sin script `test`.** Un solo servicio Railway sirve los 7 dominios: un fallo tumba 7 empresas a la vez — **✅ CERRADO (3.1).** `test`, `test:ci` y `test:armado` en `package.json`, `.github/workflows/ci.yml` en cada push. 111 tests. | `package.json` **[V]** |
| **Cero reglas de foco en todo `src/`.** `grep -rn "focus" src/` no devuelve una sola coincidencia. Y `Footer.astro:23` mete un `<button>` como hijo directo de un `<ul>` — **✅ CERRADO (3.9).** 9 reglas de foco en `global.css`, fijadas por un test contra el CSS *servido*. El `<button>` dentro del `<ul>` **no se tocó: es marcado válido** — la afirmación original era falsa. | **[V]** |
| **8,5 MB en `public/photos`** sin `srcset`, sin `sizes`, sin AVIF. Alcobendas sigue en JPG | **[V]** |
| **`@astrojs/sitemap` está instalado y no está en `integrations`**: dependencia muerta. `site: 'https://usafitness.es'` (dominio del franquiciador) no lo consume nadie: el canonical se construye a mano en `Landing.astro` — **✅ CERRADO.** La dependencia muerta se desinstaló; el sitemap se genera a mano por dominio. | **[V]** |

~~**Consecuencia que gobierna el roadmap:** *el producto es un prototipo con dos usuarios*. Toda propuesta redactada como "en las 7 tiendas" hoy toca 2.~~

**Consecuencia revisada (2026-08-26).** Ya no es un prototipo: **5 de 7 dominios sirven este código en producción**, y con Lagoh serán 6 de 8. Pero la frase que sustituye a la anterior es otra y es más incómoda: **la escala real del cliente son ~58 tiendas, no 7** (`docs/product/escala-real.md`), y el modelo de venta decidido es *tienda por tienda*, no un contrato con la central. Eso convierte el coste **por alta** en la métrica que gobierna el roadmap, no el coste por funcionalidad: algo que cuesta 15 minutos por tienda son 14 h a 58 tiendas. Es exactamente lo que justifica el plan de alta automatizada (`.cursor/plans/2026-08-26-alta-de-tienda-automatizada.md`) y lo que hace que **3.10 (partir `stores.json`) suba de prioridad**: con 58 entradas en un solo fichero, cada alta es un conflicto de merge como el que ya dio Lagoh.

**Lo que sigue siendo cierto:** toda propuesta que dependa del WhatsApp funciona en 1 de 7 — solo Vigo tiene móvil real. Las otras 4 llevan el fijo copiado, y en un `wa.me` un fijo no abre conversación.

---

---

## 0-bis. BACKLOG VIVO — todo lo abierto a 2026-08-26

> **Este apartado existe porque se estaban perdiendo cosas.** Hallazgos reales
> de una sesión —el vídeo servido sin enlazar, el hero repetido en 7 tiendas,
> dos dominios caídos— vivían solo en el chat. Aquí no se prioriza: aquí se
> **inventaría**. La prioridad la ponen las fases de §4.
>
> Regla: nada entra sin evidencia comprobable, y nada sale sin que se pueda
> señalar el commit o el panel donde se cerró. Todo lo de abajo está verificado
> el 2026-08-26 contra el código, los ficheros o los dominios en vivo — no
> contra la memoria de nadie.

### A. Lo que puedo hacer yo (código)

| # | Qué | Evidencia medida | Esf. |
|---|---|---|---|
| ✅ **A1** | ~~La galería impone 4:3 horizontal a fotos que no lo son.~~ **CERRADO 2026-08-26** (PR #11). El primer diseño —una forma de celda por tienda según la orientación mayoritaria— resultó insuficiente al medir: **4 de las 8 tiendas mezclan orientaciones**, villanueva y marineda exactamente a la mitad. Con una sola forma de celda se recorta la mitad igual, solo cambia cuáles. Se rehizo: cada foto conserva **su** proporción y el flujo es multicolumna. Verificado en navegador: lagoh pasó de 442×332 con el 44% del alto cortado y ampliada 1,16×, a **289×386, escala 0,76 y cero recorte** | PR #11 | M |
| ◐ **A2** | **7 de 8 tiendas enseñan la misma foto dos veces** (`hero.webp` y `tienda-1.webp`, idénticos byte a byte). **El coste ya no se paga** (PR #14): las dos apuntan a la misma URL, así que el navegador la descarga una vez en vez de dos — entre 35 KB (lagoh) y 134 KB (arcangel) por visita. **Sigue abierta la parte editorial**: si la foto debe verse dos veces o no. La página se ve exactamente igual que antes; solo dejó de cobrarse doble. Detectado por huella SHA-256, no por ruta: las rutas sí difieren. `repitenElHero()` las lista | PR #14 · decisión pendiente del usuario | S |
| ✅ **A3** | ~~Número impar de fotos deja una huérfana.~~ **CERRADO 2026-08-26** (PR #11), y por construcción: en un flujo multicolumna no hay filas fijas donde pueda faltar algo. Dejó de ser un caso que tratar | PR #11 | S — cayó con A1 |
| **A4** | **Las reglas de curación de fotos nunca se escribieron.** Cuáles entran, en qué orden, cómo se detectan las casi duplicadas, qué es el plano general. Existe `docs/fotos/inventario-2026-08-25.md` con el plano de cada tienda, pero es un inventario, no una regla — y Lagoh ni aparece, es posterior | — | S |
| ✅ **A5** | ~~3.8 · Imágenes responsive.~~ **CERRADO 2026-08-26** (PR #14). La flota pasa de **8916 KB a 4436 KB (−50%)**, verificado contra los dominios en producción y coincidiendo al KB con lo medido en local. **AVIF se descartó con datos**: gana 5-8% a los anchos que de verdad se sirven y cuesta 3,2× el tiempo de build. **No se usó `astro:assets`**: habría añadido el endpoint `/_image`, que sí pasa por el middleware — la trampa anotada en `middleware.ts:37` habría dado 404 en los 8 dominios a la vez. Los ficheros pregenerados viven en `public/` y el adaptador los sirve antes del middleware, así que desaparece por construcción. Presupuesto de 900 KB por página que **rompe el build**. Alcobendas sigue en JPG pero ya se sirve redimensionada; convertir las fuentes es una mejora menor que queda en A5-bis | PR #14 | M |
| **A5-bis** | **Los 4 JPG de Alcobendas siguen siendo JPG como fuente** (982 KB). Ya se sirven redimensionados y en WebP, así que el visitante no lo nota; lo que queda es que la fuente ocupe menos en el repositorio. Mejora menor, sin prisa | `find public/photos ! -name "*.webp"` | S |
| **A6** | **Hay un vídeo de 2,25 MB servido en público que no enlaza nadie.** `public/photos/grancasa/WhatsApp Video 2026-08-20 at 15.50.09.mp4`, commiteado, responde **200 en producción**, y el nombre del fichero va en la URL tal cual. O se usa —con clic para reproducir, no autoplay— o se saca. Hoy es peso muerto con una URL que no da buena imagen | `curl` a `usafitnessgrancasa.com` → 200, 2 249 635 bytes, `video/mp4` | S |
| **A7** | **3.10 · Partir `stores.json`.** Con ~58 tiendas en un fichero, cada alta arriesga un conflicto de merge — ya pasó al fusionar Lagoh. Diseñado, refutado y **recortado**: el diseño ganador prometía cero conflictos vía `merge=union`, y **eso es falso en GitHub** (medido: merge local ✔ · API de GitHub **409** · PR **`CONFLICTING`**; GitHub no honra los drivers de `.gitattributes`). Lo que sí funciona, medido en el mismo experimento: **índice ordenado alfabéticamente**, sin driver ninguno — altas en letras lejanas fusionan limpias, solo chocan las de slugs contiguos, y ese conflicto son dos líneas planas en vez de un JSON anidado. Sigue valiendo por los diffs y por el tamaño, no por la promesa que traía. Ver `memory/07-decisions-log.md` (2026-08-26). **Requisito previo: `.gitattributes` con `text eol=lf`** o el test de formato canónico falla al 100% en Windows | experimento con ramas reales, 2026-08-26 | S–M |
| **A8** | **3.3 · `locals.store` y una sola resolución de host.** ⏭ Aplazada **a propósito**, no olvidada: dos de sus tres motivos originales ya no existen. Queda `headers.get('host')?.split(':')[0]` repetido en 5 ficheros. Deuda real, barata, no bloquea nada | — | S |
| **A9** | **Ejecutar el plan de alta automatizada** (`.cursor/plans/2026-08-26-alta-de-tienda-automatizada.md`, 6 tareas TDD). Es lo que convierte 58 altas de inviables en viables. **Le falta un paso que hoy no contempla**: comprobar que el dominio sirve lo nuestro después de cambiar el DNS — justo el hueco por el que se coló Lagoh. `npm run flota` ya lo cubre; hay que engancharlo al final del alta | el plan · `scripts/estado-flota.mjs` | L |
| **A10** | **Solo 3 de 8 tiendas tienen reseñas** (villanueva, alcobendas, arcangel). Las otras 5 pintan la sección vacía. Y las 8 reseñas del sistema son **todas de 5 estrellas**, lo que dejó decorativo un test hasta que el fixture de `test-armado` bajó una a 4★. **Es un patrón, no un caso**: cuando los datos reales solo contienen un valor, la comprobación no comprueba nada. Aplica igual a `template` y a `variant`, ambos ausentes en las 8 | `stores.json` | — depende de A-franquiciado |

### B. Lo que solo puedes hacer tú (paneles externos)

| # | Qué | Estado medido | Urgencia |
|---|---|---|---|
| **B1** | **`usafitnesslasrosas.com` no resuelve.** SERVFAIL en `8.8.8.8` y en `1.1.1.1`. Dominio `active` en el registro hasta 2027-04-09, delegado a los mismos NS que Vigo. La zona no está activa en la cuenta de Cloudflare | verificado por DoH | 🔴 **ahora** |
| **B2** | **`usafitnesslagoh.com` tampoco resuelve.** Mismo cuadro. **Se creyó que servía WordPress porque una caché local mentía** — internet no lo ve | verificado por DoH | 🔴 **ahora** |
| **B3** | **`usafitnessvillanueva.com` ni siquiera está en Cloudflare.** Sus NS son `dns5716/dns5717.phdns22.es`. Es la única de las 8 que sigue entera en su hosting anterior | RDAP de Verisign | media |
| **B4** | **Monitor externo de uptime.** Riesgo #10. Hoy no vigila nada nadie: los dos cortes de arriba se descubrieron mirando a mano. Requisito duro: **que viva fuera de Railway y fuera de Cloudflare**. Guía en `docs/medicion/guia-alta.md` §1. Bloqueante de la recomendación: comprobar si el plan gratuito de StatusCake incluye test DNS y API (5 min de panel, plan B definido) | `docs/medicion/guia-alta.md` | alta |
| **B5** | **Search Console en los 8 dominios** + envío de sitemap. Guía §2. Es la única medición que funciona hoy en todas, porque es agnóstica del motor | `googleSiteVerification`: 0/8 | alta |
| **B6** | **GA4, una propiedad por tienda.** Guía §3. ⚠️ En cuanto se rellena `ga4Id`, la web empieza a pedir consentimiento y a cargar Google tras la aceptación: **no es un cambio invisible** | `ga4Id`: 0/8 | media |
| **B7** | **Cambiar el orden de migración** para no repetir B1/B2: crear la zona en Cloudflare **y elegir plan hasta el final** ANTES de tocar los NS en el registrador. Cloudflare **autoborra** una zona Free que lleve 28 días en «Finish setup»: un dominio dado de alta a medias en enero desaparece solo en marzo | guía §0.4 | alta |

### C. Bloqueado en franquiciados (datos que no están en ninguna fuente pública)

| # | Qué falta | A quién |
|---|---|---|
| **C1** | **Datos legales (`company`): faltan en 5 de 8** — villanueva, marineda, lasrosas, alcobendas, lagoh. Sin eso, sus 4 páginas legales no identifican al responsable del tratamiento | 5 franquiciados |
| **C2** | **WhatsApp real: utilizable en 1 de 8.** Solo Vigo tiene móvil. Villanueva, Marineda, Las Rosas y Alcobendas llevan **el fijo copiado** en el campo `whatsapp` — y en un `wa.me` un fijo no abre conversación. GranCasa, Arcángel y Lagoh no tienen campo | 7 franquiciados |
| **C3** | **GranCasa no tiene ficha de Google** (`googleMapsStatus: sin-ficha-gbp`). Es la única sin `googleMapsEmbed`. La ficha la crea su dueño en su Google Business Profile; nadie más puede | GranCasa |
| **C4** | **Reseñas reales para las 5 tiendas que no tienen** | 5 franquiciados |
| **C5** | **Fotos mejores para Lagoh.** 382 px es el techo de lo que guardaba su WordPress. Con A1 quedan dignas a 3 columnas, pero el hero sigue ampliado 1,75× | Lagoh |
| **C6** | Las 10 preguntas de §6, que siguen todas abiertas — incluida la única que puede invalidar el proyecto entero: **si el contrato de franquicia permite dominio y web propios con la marca** | central / franquiciados |

### Cómo se ataca (y por qué en ese orden)

1. ~~**A1 + A2 + A3 + A5 en una sola tanda.**~~ **HECHO 2026-08-26** (PR #11 y #14). La apuesta era que compartían andamiaje —medir imágenes en build— y salió bien: el medidor que escribió A1 es el que usó A5 tres horas después. Resultado: cero recortes, cero huérfanas, y la flota a la mitad de peso. Queda de ese bloque **la decisión editorial de A2** y la conversión menor de A5-bis.
2. **A7 (3.10)**, ya con la refutación hecha y la premisa corregida: el enunciado hay que reescribirlo antes de implementar —lo que se compra ya no es «cero conflictos», es «diffs legibles y conflictos triviales»—, y con `.gitattributes eol=lf` como primer paso.
3. **A6** cae de paso, es un `git rm` o una decisión de diseño de 20 minutos.
4. **A9** después, porque se apoya en A7.
5. **A8** al final: es la única de la lista que no molesta a nadie mientras espera.

**B1 y B2 no están en esta cola porque no dependen de mí, pero son lo único de todo el documento que tiene a un cliente sin web ahora mismo.**

---
## 1. CATÁLOGO DE SECCIONES

**Escala de esfuerzo:** S < 1 día · M 2–5 días · L 1–3 semanas · XL > 1 mes.
**Mantenimiento** = cada cuánto hay que tocarla para que no mienta. Es la columna que decide, no el esfuerzo.

> **Regla de admisión (nueva, y es la que mata propuestas):** si una sección exige refresco **más de una vez al año** y no está vendida como línea recurrente, **no se construye**. Si el dato lo aporta el franquiciado y el franquiciado no lo ha aportado, **no se pinta** — el `visible()` de `registry.ts` ya sabe hacerlo.

### 1.1 Secciones que ya existen

| Sección | Qué resuelve | Dato del franquiciado | Esf. | Mant. | Base/Opc. | Estado real |
|---|---|---|---|---|---|---|
| **Header** (fija) | Marca + CTA llamar | — | — | Nunca | Fija | ✅ **Matizado 2026-08-26:** sigue midiendo ~28-30 px, pero eso **cumple** el criterio AA aplicable (WCAG 2.5.8, 24 px). Los 44 px son 2.5.5, que es **AAA**. Subirlo es mejora de conversión, no un incumplimiento **[V 2026-08-26]** |
| **Hero** | Identidad de la tienda + CTA Maps | Foto de fachada | S | Anual | Base | ⚠ ✅ La foto YA se aplica (`Hero.astro:19`). Sigue el texto autogenerado con plantilla mad-lib idéntica en las 7 **[V 2026-08-26]** Texto autogenerado con plantilla mad-lib idéntica en las 7 **[V]** |
| **Promotions** | 4 beneficios de fidelización | 🔒 Condiciones por escrito | — | Trimestral | Base | ⛔ Hardcodeada e idéntica ×7; 4 porcentajes sin fuente documentada; único CTA `tel:` **[V]** |
| **Location** | Dónde está + mapa | Dirección | — | Nunca | Base | ⚠ Iframe de Google sin puerta de consentimiento. 3 `place_id` sintéticos **[V]** |
| **Gallery** | Prueba visual del local | Fotos | S | Anual | Opc. | ✅ Con `visible()`. ⚠ Sin `srcset`; GranCasa no la pinta (0 fotos) |
| **Reviews** | Prueba social | 🔒 Reseñas reales | — | Mensual | Opc. | ⛔ **Autoras repetidas en 4 tiendas.** ✅ Pestañas con `role="tab"`/`aria-selected`/`aria-controls` y estrellas con nombre (3.9). ⛔ **Sigue en pie lo grave: autoras repetidas en 4 tiendas.** Y solo 3 de 7 tienen reseñas **[V 2026-08-26]** **[V]** |
| **Products** | Surtido | Categorías reales | — | Anual | Base | ⛔ 13 strings sin un solo enlace. Idéntica ×7 (`props: () => ({})`) **[V]** |
| **Brands** | Marcas que trabaja | 🔒 Listado real | — | Anual | Base | ⛔ 8 logos idénticos ×7, sin texto, sin autorización escrita documentada **[V]** |
| **Schedule** | Cuándo abre + 3 CTA | 🔒 Horario por día | — | Trimestral | Base | ⚠ String de texto libre parseado por regex; Villanueva ni contempla domingo |
| **Social** | Perfiles propios | 🔒 Handles | — | Nunca | Opc. | ✅ Con `visible()`. Solo Vigo tiene datos: no se pinta en 6 de 7 **[V]** |
| **Footer** (fija) | Legales + revocar cookies | Datos de sociedad | — | Anual | Fija | ⚠ ✅ **Era un falso positivo:** `<button>` como hijo de `<ul>` es marcado válido. No se tocó y no hay que tocarlo **[V 2026-08-26]** **[V]** |
| **WhatsAppFloat** (fija) | Canal directo | 🔒 Móvil real | — | Nunca | Fija | ⛔ Apunta a un fijo en 4 tiendas; ausente en 2 |
| **CookieConsent** (fija) | Consentimiento | — | — | Anual | Fija | ⛔ ✅ Se muestra siempre, y ahora es una puerta real: sin aceptar no se inyecta un byte de Google **[V 2026-08-26]** **[V]** |

### 1.2 Secciones nuevas que SÍ entran en el catálogo

| Sección | Qué resuelve | Dato del franquiciado | Esf. | Mant. | Base/Opc. |
|---|---|---|---|---|---|
| **`asesoramiento`** — Asesoramiento gratuito en tienda | Nombra el único diferencial real frente a Amazon y HSN. **16 de 18 reseñas del JSON ya lo mencionan** y la web no lo dice en ninguna parte. Copy ya escrito en los activos de marca | Confirmar que el servicio existe y es gratuito en esa tienda (1 pregunta) | **S** | **Nunca** | **Base** |
| **`centro`** — Cómo llegar *dentro* del centro | Planta, número de local, referencia visual ("junto a X"), parking y su gratuidad, transporte. Responde lo que pregunta quien **ya está dentro** del centro, que es el visitante mayoritario. Contenido imposible de canibalizar entre dominios | Planta y local. **Se puede copiar del directorio del centro** si el franquiciado no contesta **[S]** | **S** | Anual | **Base** |
| **`horario` v2** — Horario estructurado por día | Sustituye el string por datos: 7 días con tramos + **excepciones fechadas con caducidad automática**. Alimenta `openingHoursSpecification` **y** `specialOpeningHoursSpecification`, la sección y la FAQ | 🔒 Horario real por día + calendario del centro + **bajo qué supuesto abre en domingo** (5 comunidades, 5 regímenes) | **M** | Trimestral | **Base** |
| **`aviso`** — Aviso operativo efímero | Franja bajo el header con texto corto y **fecha de fin obligatoria en el esquema**: "hoy cerramos a las 18:00 por inventario". Es el contenido que un comerciante necesita de verdad y el que más rápido hace que note que paga un servicio vivo | Lo pide él cuando lo necesita | **S** | Bajo demanda | Opc. |
| **`estado`** *(no es sección: es un campo que gobierna el render)* | `proxima-apertura` / `activa` / `cerrada-temporalmente` / `cerrada`. Hoy **GranCasa publica horario y emite `openingHoursSpecification` para un local que no atiende a nadie** **[V]** | Un valor | **S** | Bajo demanda | **Base** |
| **`faq`** — 6-8 preguntas **logísticas** | Dónde aparco, en qué planta, si abren domingo, si asesoran gratis, si hacen encargos, cómo se consigue la VIP. Genera el único texto genuinamente distinto entre dominios sin inventar nada | Las preguntas reales del mostrador | **S** | Anual | Opc. |
| **`objetivos`** — Products reorganizada por objetivo | Sustituye 13 strings muertos por 5-6 bloques enlazados (ganar masa, definición, rendimiento, descanso, salud, mujer). El objetivo es lenguaje de cliente; la categoría es lenguaje de almacén | Qué trabaja realmente | **M** | Anual | **Base** |
| **`encargos`** — Pídelo y te lo traemos | Click&Collect del que no tiene e-commerce. Convierte el WhatsApp mudo en una petición concreta. Coste técnico casi nulo | ⛔ **Bloqueada por el móvil real** + compromiso de plazo | **S** | Nunca | Opc. |
| **`vip`** — Tarifa VIP explicada | La web anuncia 4 descuentos y no explica cómo se consiguen. Versión honesta: "se tramita en caja, esto es lo que necesitas" | 🔒 Condiciones por escrito de quien las controla | **S** | Anual | Opc. |
| **`marcas` v2** — Marcas con texto | Un logo sin texto no posiciona. "Optimum Nutrition Vigo" es una query real | 🔒 Listado real + autorización de uso de logotipo | **M** | Anual | Opc. |
| **`prensa`** — Han hablado de nosotros | Respalda "más de 20 años" con algo verificable en vez de con una afirmación propia. Las aperturas ya tuvieron cobertura **[S]** | Nada: los enlaces existen | **S** | Nunca | Opc. |
| **`video`** — Video tour del centro | Lo que un pin de Maps no sabe: en qué planta y junto a qué. Servido como fachada (póster + clic), nunca iframe directo | ⛔ El vídeo. El ANEXO ya lo exige, pero no consta que exista **[S]** | **M** | Bianual | Opc. |
| **`eventos`** — Agenda | `Event` sigue dando rich result. **Solo con regla de expiración automática por fecha** | 🔒 Calendario real. Sin eventos, la sección no se pinta | **M** | Mensual | Opc. (⚠ solo si hay línea recurrente vendida) |

### 1.3 Rechazadas para el catálogo → ver §5

`equipo` / `expertos`, `calculadora`, `gimnasios colaboradores`, `barra de promoción permanente`, `pop-up`, plantilla 3 "Guía".

---

## 2. PÁGINAS MÁS ALLÁ DE LA LANDING

**Corrección de encuadre obligatoria:** las 170 URLs (24 páginas × 7 dominios) están **descartadas** (§5). Lo que sigue es la arquitectura máxima a la que se puede llegar, **pilotada en UNA tienda** y ampliada solo con datos de Search Console delante.

**Bloqueante duro:** ninguna de estas URLs es alcanzable hoy. `middleware.ts` solo conoce `/` y los 4 legales, y compara únicamente el primer segmento. Hay que arreglar eso (Fase 3) antes de escribir una sola línea de copy.

**Reglas de URL:** minúsculas, sin tildes, `trailingSlash: 'never'` explícito, jerarquía máxima 2 niveles, canonical absoluto al dominio propio, y **nada entra en el sitemap hasta que su copy local esté terminado** (flag `publicada` por tienda).

```
https://usafitness<tienda>.com/
│
├── /                                  Landing (HUB)          → "usa fitness <centro>", "suplementos <centro>"
│
├── /como-llegar                       Planta, local, parking → "dónde está usa fitness <centro>",
│                                      transporte, horario      "usa fitness <centro> planta",
│                                      del centro vs tienda     "parking <centro>"          [Tier A · replicable]
│
├── /asesoramiento-gratuito            El servicio + reserva  → "asesoramiento suplementos <ciudad>",
│                                      por WhatsApp             "qué proteína me conviene <ciudad>"  [Tier A]
│
├── /suplementos                       Hub de categorías      → "tienda de suplementos <ciudad>",
│                                                               "suplementos <centro>"        [Tier A]
│   ├── /suplementos/proteinas                                → "comprar proteína <ciudad>"
│   ├── /suplementos/creatina                                 → "creatina <centro>"
│   ├── /suplementos/pre-entreno                              → "pre entreno <ciudad>"
│   └── /suplementos/quemagrasas                              → "quemagrasas <ciudad>"
│        ⚠ CUATRO categorías en el piloto, no ocho. Se amplía con datos de GSC, no por simetría.
│
├── /preguntas-frecuentes              FAQ logística local    → cola larga conversacional     [Tier A]
│
├── /promociones                       VIP, funcionario,      → "descuento funcionario suplementos"
│                                      cumpleaños, cupón        🔒 BLOQUEADA hasta tener condiciones escritas
│
├── /gracias                           Destino del POST 303   → noindex, fuera del sitemap
├── /404                               Hoy no existe          → elimina 7 soft-404
│
└── legales (ya existen)
    /aviso-legal · /politica-de-privacidad · /politica-de-cookies · /politica-redes-sociales
```

**Tier B — se escribe UNA vez, vive en un dominio, los demás enlazan:** guías de contenido, fichas de marca. **No se replica ×7.**
**Tier C — no se hace:** artículos genéricos de nutrición sin ángulo local. Ahí no hay partida contra HSN, Myprotein ni el propio `usafitness.es`.

**Enlazado interno:**
- `Products` deja de ser 13 strings muertos y pasa a ser **enlaces** al hub y a las categorías. Es la victoria SEO más barata del repo — pero **después** de que las páginas existan: enlaces a 404 son peor que texto plano.
- Breadcrumbs + `BreadcrumbList` en toda página interior. Es lo único de esta lista que **sigue produciendo rich result** tras la retirada de las FAQ.
- Entre dominios: **hub-and-spoke, nunca anillo.** ~~Cada landing enlaza hacia arriba al hub de marca una sola vez desde el footer~~ → **DESCARTADO POR EL USUARIO (2026-08-26): no se enlaza la cuenta ni el hub de marca desde ninguna landing.** El motivo comercial es suyo; el técnico lo respalda: `social.*` alimenta el `sameAs` de Schema.org, que declara de quién ES la cuenta, y la corporativa es de otra entidad. Hay una guarda en `src/data/stores.ts` que rechaza en build cualquier URL que contenga `usafitnessoficial` o `comunidadusafitness`. El resto del párrafo sigue vigente: un anillo recíproco de 7 dominios con misma IP, misma plantilla y mismos textos es una huella delatora, no una estrategia.

---

## 3. CATÁLOGO COMERCIAL DE SERVICIOS

> ⚠️ **SUSTITUIDO el 2026-08-26 por `memory/15-catalogo-servicios.md`**, que se
> hizo con la escala real (58 tiendas, no 7) y con el modelo de venta decidido:
> a cada franquiciado, no a la central. El catálogo nuevo mide horas/mes por
> tienda de cada servicio y descarta explícitamente lo que no aguanta a 20
> tiendas llevadas por una persona sola — el de abajo costaba 2,20 h/tienda/mes,
> que a 58 son 128 h y no cabe en un mes de trabajo.
>
> Lo de abajo se conserva como registro de lo que se pensó en agosto.

> **La regla que protege el negocio:** *solo se cobra mensualidad por lo que se pudre o se acumula.* Una web se construye una vez → pago único. Una reseña entra cada semana, una publicación de Google caduca a los 7 días, un festivo cambia el horario, una promo rota → mensualidad. Cobrar mensual por trabajo puntual se detecta al tercer mes y se cancela.

### Nivel 0 — ALTA (pago único, obligatorio antes de cualquier mensualidad)

| Entregable | Qué incluye | Esf. |
|---|---|---|
| Web en su dominio | Migración desde WordPress, plantilla elegida, secciones elegidas, fotos | M |
| **Capa de medición** | Search Console (TXT en DNS) + Cloudflare Web Analytics + GA4 donde vaya a haber campaña + eventos de las 3 conversiones. **Las propiedades se crean a nombre del cliente y se le da acceso: son suyas** | M |
| Ficha de Google verificada | Reclamar, categoría, atributos, horarios especiales, fotos, Q&A sembrada | M |
| Datos legales publicados | Recogida por escrito de razón social, NIF, domicilio, email legal + 4 documentos | S |
| **NAP y fichas del centro** | Reapuntar la ficha del directorio del centro al dominio de la tienda y corregir teléfono/horario. **Es puro retorno: sin código, sin mantenimiento, sin RGPD** | S |

*Sin el Nivel 0 no existe informe, ni campaña optimizable, ni argumento de renovación. Es el cajón que hace vendibles a los demás.*

### Nivel 1 — BASE mensual (lo que se cobra aunque no contrate nada más)

| Módulo | Por qué justifica recurrencia | h/tienda/mes |
|---|---|---|
| Guardia técnica y SLA | 7 dominios en un solo servicio Railway; caída = 7 empresas. Incluye **cambios de contenido bajo demanda**, que es lo que sí se ve | 0,5 |
| Ficha de Google gestionada | 2-4 publicaciones (caducan a los 7 días), fotos, horarios de festivo, vigilancia de ediciones de terceros | 0,5–1 |
| Gestión de reseñas | Respuesta en 24-48 h, protocolo de captación en tienda, reporte de falsas. Flujo semanal = se pudre | 0,5 |
| Informe mensual de 1 página | Llamadas, clics de WhatsApp, "cómo llegar", impresiones en Maps, queries, reseñas. **Más "esto hice / esto haré"** — sin esa mitad, un mes malo es un recordatorio mensual de que no funciona | 0,25 |

**≈ 1,5–2,5 h/tienda/mes → 7 tiendas = 12–18 h/mes. Sostenible.**

### Nivel 2 — MÓDULOS recurrentes (elige)

| Módulo | Suelo / condición | Coste real |
|---|---|---|
| **Google Ads local** | Search en radio 3-8 km + Maps. Honorario separado del medio. **Requiere medición viva y WhatsApp real.** Hay un suelo de presupuesto por debajo del cual no hay señal para optimizar y no debe venderse | +2–3 h/tienda/mes |
| **Meta Ads geolocalizado** | Nunca antes que Google Ads: en Meta se compra atención, no intención, y el franquiciado espera "ver gente entrar". Sin un código canjeable en caja, no se puede demostrar | +2–3 h/tienda/mes |
| **Kit de contenido para redes** *(el franquiciado publica)* | 8-12 piezas/mes con plantillas de marca + calendario + textos. El informe incluye **"piezas entregadas vs. publicadas"** para que el dato sea suyo y no una discusión | +2 h/tienda/mes |

**Aritmética que hay que respetar:** 7 tiendas con campañas ≈ 35–40 h/mes, al límite de una persona. **La gestión completa de redes (8-10 h/tienda/mes) no cabe: máximo 2-3 plazas, a precio de escasez, nunca como línea estándar.**

### Nivel 3 — ENCARGOS puntuales (catálogo de pedidos)

Landing de campaña (`noindex`, con fecha de caducidad y alguien que la despublique) · Sesión de fotos · Sección nueva del catálogo §1 · Contenido local por página · Alta en directorios · Kit de nota de prensa por apertura.

### Lo que hay que firmar antes de facturar

1. **Contrato marco de servicio por sociedad:** alcance, tiempos reales de una persona sola (**incluidas vacaciones**), quién responde del contenido comercial (el franquiciado) y quién de su publicación fiel (el operador), límite de responsabilidad.
2. **Contrato de encargado del tratamiento (art. 28 RGPD).** Buena noticia verificada: hoy hay **2 sociedades identificadas, no 7** → son **2 contratos**, no 7. Las otras 4 no pueden recoger un solo dato hasta que aporten su `company`.
3. **Protocolo de baja:** titular registral de cada dominio, quién paga la renovación, propiedad de GA4/GSC/ficha de Google, qué se entrega si el cliente se va y en qué plazo. **Nadie ha nombrado nunca la renovación de dominios**, y un dominio no renovado se lleva por delante la web, el SEO y la coherencia NAP en silencio.
4. **Declaración de conflicto de interés:** el operador trabaja para tiendas de la misma marca que compiten por la misma consulta (3 en Madrid). Decidir quién se queda la query genérica de la ciudad es una decisión del proveedor pagado por ambas partes. Se declara por escrito y, si se puede, la arbitra la central.

### Palanca que multiplica a una sola persona

Las 7 tiendas son **3-4 interlocutores** (USA GOVE S.L. posee dos). Vender de uno en uno tiene techo inmediato. El movimiento que escala es que **la central meta el pack de alta dentro del onboarding obligatorio del franquiciado** — el ANEXO de Integración Digital ya es un proceso obligatorio y le falta exactamente la mitad (web, ficha de Google, medición). Riesgo asumido: cambia el cliente, y quien vende también puede sustituir.

---

## 4. ROADMAP EJECUTABLE POR FASES

### FASE 0 — Cortafuegos y arreglos de 30 minutos ✅ **CERRADA 2026-08-24** (`d13a1e1`, `7e31c45`)

*No es una fase de producto: es lo que hay que quitar de encima antes de medir nada. Cero dependencias externas.*

**Criterio de entrada:** ninguno. Se empieza hoy.

| # | Tarea | Esf. | Por qué va aquí |
|---|---|---|---|
| ✅ 0.1 | **Vaciar las reseñas duplicadas** de Villanueva, Marineda, Las Rosas y Vigo | 20 min | Cuatro dominios de al menos tres sociedades publican testimonios de las mismas tres personas, con texto idéntico en dos. Eso no es "contenido duplicado": es publicidad con reseñas falsas, práctica desleal tipificada, reclamable **contra la sociedad titular de cada dominio**. El `visible()` ya oculta la sección sin tocar código, y GranCasa demuestra que la landing renderiza perfecta con 0 reseñas. **No hay que conseguir reseñas reales primero — hay que borrar estas ya** |
| ✅ 0.2 | **Quitar "Hasta 20% dto." de las 7 `metaDescription`** y los 4 porcentajes de `Promotions.astro` hasta tener fuente escrita. Sustituir por "consulta las promociones vigentes en tienda" | S | Promoción indexada sin fecha ni origen, de un programa del franquiciador publicado bajo el CIF de sociedades que no lo controlan |
| ⛔ 0.3 | ~~**Vaciar el campo `whatsapp`** en las 4 tiendas donde es el fijo~~ — **DESCARTADA POR EL USUARIO 2026-08-24** | 10 min | El usuario decidió mantenerlos: *"yo ya les hice las web hace tiempo, tiene que funcionar"*. Sigue **sin verificar**: `wa.me` responde igual con un número real que con uno inventado, así que desde aquí no se puede comprobar. Se cierra con una llamada, no con código. Riesgo asumido por el usuario, no mitigado |
| ✅ 0.4 | **Maps detrás del consentimiento** (fachada estática + clic) y **autoalojar Inter** | S | Hoy dos terceros reciben la IP del visitante antes de pintar nada y no hay aviso. Mejora cumplimiento, rendimiento (dos handshakes TLS y una hoja bloqueante menos) y robustez frente a portales cautivos de wifi de centro comercial, todo con el mismo movimiento |
| ✅ 0.5 | **Desacoplar de verdad `avisoCookies` de `analitica`** y reescribir el texto del banner para que describa lo que realmente hay | S | El comentario del componente afirma que sin GA4 no se instala ninguna cookie. Es falso desde que existe el iframe |
| ✅ 0.6 | **Arreglar el hero:** usar `heroImage` como `<img>` con `fetchpriority="high"` y `srcset` en vez del fondo CSS fijo | 30 min | Es a la vez el bug de diferenciación más barato del repo (la imagen a pantalla completa es idéntica en las 7) y la mayor mejora de LCP posible: hoy el elemento más grande de la página se descubre tarde porque es un `background-image` |
| ✅ 0.7 | **Corregir `emailLegal` de El Arcángel y Vigo** | 10 min | Un dato legal erróneo publicado es peor que el vacío que el `noindex` protege |
| ✅ 0.8 | Borrar `@astrojs/sitemap` (dependencia muerta) y `lastmod` real en el sitemap en vez de `changefreq`/`priority` | 30 min | Google ignora changefreq y priority; usa lastmod. El sitemap gasta bytes en lo que no se lee y omite lo único que sí |

**Criterio de salida (medible):**
`grep` de los nombres de autora repetidos en `stores.json` → 0 coincidencias · `grep "20% dto"` en `stores.json` → 0 · petición a Google en el HTML inicial de las 2 tiendas vivas → 0 antes del consentimiento · las 2 tiendas vivas sirven cada una **su** foto de hero · LCP de laboratorio mejorado y anotado.

✅ **Verificado 2026-08-24.** Los cuatro criterios se cumplen y además quedan **fijados por tests** (`tests/smoke.test.mjs`): el aislamiento de reseñas por autora y el «cero terceros» se comprueban en los 7 dominios en cada push, así que no pueden volver por descuido. Viewport inicial 814 KB → 162 KB.

---

### FASE 1 — Medición ⏳ **EN CURSO** — código hecho (`2800b67`), altas en manos del usuario

**Criterio de entrada:** Fase 0 cerrada. Encender GA4 antes de arreglar el banner sería encender el aviso en varios dominios el mismo día que el iframe sigue cargando sin puerta.

| # | Tarea | Esf. | Nota |
|---|---|---|---|
| ⏳ 1.1 | **Search Console en los 7 dominios por registro TXT en DNS** (Domain property: cubre www, no-www, http y https, y no se pierde si alguien toca el layout) | S | **Es la única medición que funciona hoy en las 7**, porque es agnóstica del motor: mide también los 4 WordPress. Y es lo único que responde la pregunta que sostiene toda la tesis del producto — *¿alguien busca "suplementos GranCasa"?* — que nadie ha medido nunca |
| ⏳ 1.2 | **Cloudflare Web Analytics** en las zonas que ya existen | S | Gratis, sin cookies, sin consentimiento, sin código. Es un suelo, no un techo: no hace atribución de campaña |
| ⏳ 1.3 | **Campo `ga4Id` + GA4 solo en las tiendas vivas** con campaña prevista | S | Una propiedad por tienda, no una compartida: el dato pertenece a cada sociedad y el franquiciado puede querer acceso |
| ✅ 1.4 | **Un solo listener delegado** que emita `contacto_llamada`, `contacto_whatsapp` y `contacto_maps` con la sección de origen como parámetro | S | ~15 líneas. La fontanería del Consent Mode v2 ya está montada |
| ⏳ 1.5 | Enviar el sitemap de cada dominio en GSC | 10 min | Nadie ha comprobado nunca si el sitemap dinámico se lee |

**Trampa que hay que evitar explícitamente:** números de teléfono de tracking por fuente. Romperían la coherencia NAP entre la web, la ficha de Google y el directorio del centro, que es justo el activo que se está vendiendo. **Se mide el clic; no se toca el número.** Y en el informe la métrica se llama *intención de llamada*, no *llamadas*: un clic en `tel:` no es una llamada, sobre todo en escritorio.

**Estado 2026-08-24:** 1.4 hecho — `ConversionTracking.astro` emite los tres eventos con la sección de origen, en fase de captura. (El `transport_type: 'beacon'` original se retiró en el PR #1: no existe en gtag de GA4 — era de Universal Analytics — y viajaba como parámetro personalizado gastando una de las 25 ranuras por evento; gtag ya usa `sendBeacon` por su cuenta.) **Escrito pero sin medir todavía: `ga4Id` está a 0 de 7.** 1.1, 1.2, 1.3 y 1.5 son altas en paneles externos y las está haciendo el usuario con la guía entregada. Lo que devuelve son los `G-…`; se pegan en `stores.json` y la fase se cierra sola.

**Criterio de salida (medible):** 7/7 dominios verificados en GSC con sitemap enviado y sin errores de cobertura críticos · primera exportación de queries reales guardada como línea base · 3 eventos de conversión disparando en las tiendas vivas · **primera respuesta documentada a "¿cuánto tráfico tiene esto y por qué consultas entra?"** — una pregunta que hoy nadie del proyecto puede contestar.

---

### FASE 2 — Terminar la migración

**Criterio de entrada:** Fase 1 cerrada, o al menos GSC en los 7 (para tener la línea base **antes** de migrar y poder demostrar el efecto).

| # | Tarea | Bloqueante |
|---|---|---|
| 2.1 | Reverificar cuántos dominios sirven Astro hoy (memory/02 puede haber envejecido) | — |
| 2.2 | Apuntar el DNS de GranCasa y de El Arcángel | 🔒 Quién controla el DNS de cada dominio |
| 2.3 | Migrar Villanueva, Marineda y Las Rosas | 🔒 `place_id` reales + datos legales |
| 2.4 | Sustituir los 3 `place_id` sintéticos por el embed verificado de la ficha real | 🔒 Ficha de Google de cada tienda |
| 2.5 | Resolver la contradicción **C.C. El Zoco vs. C.C. La Pasada** en Villanueva **[S]** | Una llamada. Si el JSON está mal, hay **una dirección falsa publicada** alimentando el `Store` schema |
| 2.6 | Campo `estado` por tienda y aplicarlo a GranCasa | — |

**Criterio de salida:** 7/7 dominios sirviendo Astro · 0 WordPress vivos con el nombre de la marca · 0 `place_id` sintéticos · ninguna tienda emitiendo `openingHoursSpecification` sin atender.

---

### FASE 3 — Cimientos técnicos ⏳ **EN CURSO** — 3.1, 3.2, 3.4, 3.5, 3.6, 3.7 y 3.9 cerradas · **quedan 3.3, 3.8 y 3.10**

**Criterio de entrada:** Fase 2 cerrada. **Orden interno no negociable: el test va antes del refactor.** Al revés es una apuesta con el negocio del cliente sobre el punto de entrada compartido por 7 webs vivas.

| # | Tarea | Esf. |
|---|---|---|
| ✅ 3.1 | **Smoke test de los 7 hosts + CI.** Con `node:test`, sin dependencias: por dominio, `Host` falseado → `/` devuelve 200, canonical correcto, `index` solo en el host canónico, sitemap XML válido y sin mezclar tiendas, 4 rutas legales vivas | M |
| ✅ 3.2 | **Esquema Zod + Content Layer sobre `stores.json`** (`astro/zod` ya viene con Astro). Mejor ratio del repo. **Aviso honesto: el primer build estricto va a fallar en cadena** — 4 tiendas sin `company`, `place_id` sintéticos, `sections`/`template` inexistentes. Eso es el objetivo; hay que reservar la sesión para arreglar datos | M |
| ⏭ 3.3 | **`locals.store` + `env.d.ts` + una sola resolución de host.** ~~`domainToSlug` se construye 2 veces~~ (ya es un índice único, `porDominio`) y ~~hay 12 `as any`~~ (0, hay tipo real derivado del esquema). Queda lo que decía el título: `headers.get('host')?.split(':')[0]` sigue repetido en 5 ficheros, y el middleware ya resuelve la tienda pero no la pasa a las páginas | S |
| ✅ 3.4 | **`404.astro`** y dejar de hacer `Astro.redirect('/')` | S |
| ✅ 3.5 | ~~**Registro de páginas** (`PAGES`, calcado de `LEGAL_DOCS`)~~ + middleware que resuelva rutas anidadas + `trailingSlash: 'never'` | M | **El registro `PAGES` NO se ha construido, a propósito.** La regla general del middleware (reescribir *cualquier* ruta bajo el slug de la tienda y dejar que decida el enrutador de Astro) es menos código que la lista blanca anterior y resuelve el bloqueo entero. Un registro con cero entradas más allá de las legales sería abstracción especulativa. Añadir una página = crear un `.astro` bajo `src/pages/[slug]/`. El flag `publicada` por tienda del §2 sigue pendiente y se hará **cuando exista la primera página con copy**, que es cuando hay algo que publicar o no |
| ✅ 3.6 | **`Base.astro`**: el `<head>` está duplicado a mano entre `Landing.astro`, `[slug]/[doc].astro`, `index.astro` y ahora también `404.astro` — **cuatro copias**. Con páginas nuevas, la regla de `noindex` por host se aplicaría o no según qué fichero se copió: el fallo silencioso más caro posible en 7 dominios. **No era un riesgo, ya había pasado dos veces:** (1) las páginas legales se publicaban `index, follow` en CUALQUIER host — comprobado contra el build: `preview.up.railway.app/vigo/aviso-legal` → indexable, compitiendo con el dominio del propio cliente; (2) seguían con `theme-color: #1B3A6B`, el azul anterior al manual de marca. La regla de indexación vive ahora solo en `Base.astro`. `Page.astro` no se ha hecho: no hay todavía ninguna página de contenido que lo justifique | M |
| ✅ 3.7 | **Verificador de assets en build**: que toda ruta de `heroImage`, `galleryImages` y avatares exista — **y también los 4 assets que el código referencia a mano** (logo, tipografía, favicons), que era el agujero que no estaba en el título: si falta la tipografía no se ve un hueco, se ve otra letra, y eso no lo detecta nadie mirando. Verificado borrando una foto: el build cae nombrando fichero y sitio de declaración | S |
| 3.8 | **Imágenes responsive** (`srcset`/`sizes`, AVIF con respaldo WebP, reconvertir los JPG de Alcobendas) + **presupuesto de peso verificado en build** | M |
| ✅ 3.9 | **Accesibilidad WCAG 2.2 AA como criterio de aceptación**, no como auditoría única. Hecho: `:focus-visible` en los tokens (había **cero** reglas de foco en todo el CSS), enlace de salto con destino real, `<main>` que ya no envuelve cabecera y pie, `scroll-padding-top` (2.4.11, criterio nuevo de la 2.2), `prefers-reduced-motion: reduce` — el bloque anterior usaba `no-preference` y no apagaba nada —, pestañas de reseñas con `role="tab"`/`aria-selected`/`aria-controls`, estrellas con `role="img"` + `aria-label`, y la burbuja de WhatsApp oculta mientras el aviso pide decisión (estaba tapada al 100%: 0 de 324 píxeles alcanzables, 132 caían sobre "Aceptar"). **Dos puntos del enunciado original eran falsos y no se tocaron:** el `<button>` dentro del `<ul>` es marcado válido, y los 44 px del CTA son WCAG **2.5.5 (AAA)** — el criterio AA es 2.5.8, 24 px, que ya se cumplía. Las reglas viajan fijadas por tests contra el CSS servido, no solo escritas | M |
| 3.10 | Partir `stores.json` en un fichero por tienda + `shared.json` para promociones, categorías y marcas (hoy dentro de los `.astro`) | S |

**Criterio de salida:** CI en verde en cada push, con el smoke test de los 7 hosts pasando · build que **falla** si un asset no existe o si `stores.json` no valida · una URL nueva de prueba servida correctamente en un dominio canónico · 404 real en los 7 · 0 reglas de foco → cobertura completa · presupuesto de imagen documentado y respetado.

**Estado 2026-08-26.** 111 tests, 0 skipped con `npm run test:armado`. Lo que queda:

- **3.3** está **⏭ aplazada a propósito**, no pendiente por olvido: dos de sus tres motivos originales ya no existen (`porDominio` es índice único; cero `as any`). Lo que queda es `headers.get('host')?.split(':')[0]` repetido en 5 ficheros. Es deuda real pero barata, y no bloquea nada.
- **3.8** y **3.10** siguen abiertas. **3.8 tiene una trampa anotada en `src/middleware.ts:37`**: al usar `astro:assets` aparece el endpoint `/_image`, que sí pasa por el middleware; sin meterlo en `RAIZ_COMPARTIDA` se reescribiría a `/<slug>/_image` y **todas** las imágenes optimizadas darían 404 en los 7 dominios a la vez.
- **Deuda descubierta al cerrar 3.9, no planificada:** las 8 reseñas del sistema son **todas de 5 estrellas**, así que el test que compara la puntuación anunciada con la dibujada no distinguía nada — un `aria-label` fijo pasaba en verde y la mutación sobrevivió. Se resolvió bajando una reseña a 4★ en el fixture de `test-armado`. **Es un patrón, no un caso:** cuando los datos reales solo contienen un valor, la comprobación es decorativa. Aplica igual a `stars`, a `template` y a `variant`.
- **Solo 3 de 7 tiendas tienen reseñas** (Villanueva, Alcobendas, El Arcángel). Las otras 4 pintan la sección vacía.

---

### FASE 4 — Diferenciación de contenido (donde por fin se gana algo)

**Criterio de entrada:** Fase 3 cerrada + datos de GSC de al menos 6 semanas.

| # | Tarea | Depende de |
|---|---|---|
| 4.1 | **Sección `asesoramiento`** en las 7 | Confirmación de 1 pregunta |
| 4.2 | **Sección `centro`** (planta, local, parking, transporte) — la excepción que **no** depende del franquiciado: lo publican los propios centros | Copiar del directorio del centro **[S]** |
| 4.3 | **Reapuntar las 7 fichas de los centros comerciales** al dominio de la tienda y corregir teléfono y horario | Un email por centro **firmado por el franquiciado** |
| 4.4 | **Descanibalizar los 3 dominios de Madrid**: Las Rosas → San Blas-Canillejas, Alcobendas → Alcobendas y San Sebastián de los Reyes, Villanueva → noroeste. **Con los datos de GSC delante, no antes** | Fase 1 |
| 4.5 | **`horario` v2** con excepciones fechadas | 🔒 Horario por día + régimen de domingo |
| 4.6 | **Sección `faq`** logística | 🔒 Preguntas del mostrador |
| 4.7 | **`objetivos`** sustituyendo a `Products` | — |
| 4.8 | Reseñas reales por tienda | 🔒 Protocolo de captación en tienda |
| 4.9 | **Adoptar por fin las plantillas**: hoy `template` está ausente en las 7 y las dos plantillas existentes tienen cero adoptantes. Enseñarlas y que cada dueño elija | Muestrario (ver 4.10) |
| 4.10 | **Muestrario interno** (`noindex`) con plantillas y secciones sobre datos ficticios: hoy el artefacto central del modelo de venta no existe y la única forma de enseñar `angular` es un `?plantilla=2` que solo funciona fuera del dominio canónico | S |

**Criterio de salida:** ≥ 3 secciones nuevas en producción · **< 40% del texto visible byte-idéntico entre dominios** (hoy 60-70% **[S]**) · ≥ 4 de 7 fichas de centro comercial apuntando al dominio propio · 0 reseñas con autoría compartida · al menos 2 tiendas con plantilla elegida explícitamente.

---

### FASE 5 — Páginas y captación mínima (PILOTO EN UNA TIENDA)

**Criterio de entrada:** Fase 4 cerrada + una tienda con franquiciado que **realmente contesta**. La tienda piloto se elige por colaboración demostrada, no por "completitud" — y ojo: El Arcángel, propuesto como piloto por varios análisis, está en WordPress **[S]**.

| # | Tarea |
|---|---|
| 5.1 | `/como-llegar`, `/asesoramiento-gratuito`, `/preguntas-frecuentes` en la tienda piloto |
| 5.2 | `/suplementos` + **4** categorías (no 8), con 150-250 palabras genuinamente locales cada una |
| 5.3 | Breadcrumbs + `BreadcrumbList` (lo único de la lista que sigue dando rich result) |
| 5.4 | Enlazar `Products` a las categorías |
| 5.5 | **Solo si hay contrato art. 28 firmado y `company` completo:** endpoint `/api/lead` con `<form method="POST">` nativo (0 KB de JS), Zod, honeypot + time-trap, y 303 a `/gracias`. **Probar `security.checkOrigin` en producción antes de prometer nada**: el propio `robots.txt.ts` documenta que detrás de Cloudflare+Railway la URL interna apunta a localhost, así que el primer POST puede dar 403 en producción y funcionar en local |
| 5.6 | Proveedor de email con servidores en la UE, **una lista por tienda** (compartir leads entre sociedades es comunicación de datos sin base legal) |

**Criterio de salida (a 8-10 semanas):** las páginas nuevas del piloto acumulan **≥ 15% de las impresiones del dominio** en GSC · al menos una posiciona en top-20 por una query con el nombre del centro · **si no, se revierte y no se replica.** 24 URLs perdidas, no 170.

---

### FASE 6 — Campañas (el segundo ancla)

**Criterio de entrada:** conversiones midiéndose ≥ 8 semanas · WhatsApp real en la tienda · landing de campaña con `noindex` y fecha de caducidad · presupuesto de medios por encima del suelo de señal.

Google Ads local primero (search + Maps), Meta después y solo con un código canjeable en caja que cierre el bucle web→mostrador. La landing de campaña es el producto de mayor margen del catálogo: se compone eligiendo secciones, no escribiendo código.

**Criterio de salida:** coste por intención de contacto conocido y estable por tienda · al menos un mes con canjes de código registrados en caja.

---

### FASE 7 — Plataforma (diferida, con disparador escrito)

**No se construye ahora. Se escribe el ADR con el disparador**, o la decisión se tomará por agotamiento en mitad de una urgencia:

1. Datos escritos por alguien que no es el operador.
2. Datos que cambian más rápido que un deploy.
3. Más de un editor.

**Umbral operativo medible:** más de ~2 deploys semanales motivados **solo** por contenido, o la primera petición con urgencia menor a 24 h. Candidato preseleccionado: un Postgres gestionado con Auth incluida, porque el panel la va a necesitar. Con Zod + un fichero por tienda, 25-30 tiendas y 25 secciones se llevan bien en Git.

---

## 5. LO QUE NO VAMOS A HACER

| Descartado | Por qué |
|---|---|
| **Las ~170 URLs (24 páginas × 7 dominios)** | Depende de que el franquiciado aporte 150-250 palabras genuinas por página — el mismo que lleva meses sin dar su razón social. Sin ese input es un generador de contenido escalado en una red de 7 dominios, en un vertical de salud, redactado por alguien sin titulación en nutrición, bajo el CIF de sociedades ajenas. **Máximo: el piloto de la Fase 5 en una tienda** |
| **Pop-up, exit-intent, modal de scroll o de tiempo** | Google degrada los intersticiales intrusivos en móvil en páginas de aterrizaje desde buscador, que es exactamente el activo que se vende. El exit-intent se apoya en `mouseleave`, que no existe en móvil. Y el visitante típico busca el horario **estando ya dentro del centro**: el modal no intercepta a quien se va, intercepta a quien iba a entrar en la tienda. **Motivo adicional decisivo: sin analítica no se puede evaluar** — un pop-up sube emails y baja visitas a la vez |
| **Vender FAQ como rich result** | Google restringió las FAQ en agosto de 2023 y retiró la función por completo el 7 de mayo de 2026 **[S, con tres fuentes independientes]**. La sección se hace, pero **por conversión y logística local**, que es comprobable. Justificarla "por motores conversacionales e ingesta de IA" es un beneficio infalsificable: no se puede medir, atribuir ni desmentir |
| **El teatro de datos estructurados** (`hasOfferCatalog`, `ImageObject`, `Person`, `Service`+`Offer` a 0 €, `CollectionPage`, `containedInPlace`) | Cero rich result garantizado, lo admiten sus propios proponentes. Produce diffs bonitos y mueve cero métricas. Coste conjunto: una hora dentro de `Landing.astro` **el día que se toque por otra cosa**. Nunca como proyecto. Excepción: `BreadcrumbList` (sí da rich result) y `Event` (sigue vivo) |
| **Sección "Equipo / Nuestros expertos"** | Suma tres riesgos multiplicados por 7: *nutricionista* y *dietista-nutricionista* son títulos regulados en España; no consta rastro público que corrobore las credenciales de una de las dos personas **[S]**; y harían falta consentimientos de imagen que cubran 7 dominios de sociedades que **no las emplean**. Upside: E-E-A-T especulativo. Downside: intrusismo, derechos de imagen y publicidad engañosa |
| **Badge "Abierto ahora / Cierra en X"** | Exige horario por día **más el calendario de festivos de 7 centros distintos en 5 comunidades autónomas**, mantenido para siempre, y sin caché. El día que un centro cambia un festivo, la web **miente** justo en el dato por el que alguien se desplaza. **Sí al horario estructurado como dato; no al badge en vivo** |
| **Calculadora de proteína y calorías** | Mete JS en un proyecto de ~0 JS, entra en territorio de consejo dietético personalizado (con el riesgo real de devolver calorías objetivo a un menor), y su conversión final es "ven a tienda", que es lo que ya hacen los 3 CTA. Tesis de tráfico sin un solo dato que la respalde |
| **Plantilla 3 "Guía" con máscaras blob · `--font-accent` script** | Las dos plantillas que ya existen tienen **cero adoptantes** **[V]**. Construir la tercera es construir para un usuario imaginario. Y una segunda familia tipográfica contra un presupuesto de 162 KB que costó conseguir, para pintar cinco palabras **en inglés** en una landing de SEO local en español, rompe el match de mensaje |
| **`/comunidad` replicada por dominio** | `comunidadusafitness.com` existe y es del franquiciador **[S — verificarlo cuesta 1 minuto y cancela tres propuestas de golpe]**. Reconstruirla en 7 dominios sería duplicar un activo ajeno y competir con la propia marca. La jugada correcta es una página local que **enlace** a la comunidad |
| **Publicar la guía de nutrición en HTML en los 7 dominios** | Mismo texto en 7 dominios = canibalización. Las tres salidas (uno solo publica / canonical cruzado / reescribir ×7) implican decidir a qué sociedad se le regala el tráfico, y **eso no es una decisión del operador** |
| **Alta digital de la Tarifa VIP con base de datos** | Convierte "7 landings" en una plataforma con panel para una persona sin socio técnico, saltándose la secuencia decidida en `memory/01`. Además es dato personal de consumidor a escala, con el descuento de funcionario implicando acreditar profesión |
| **Email marketing como módulo del catálogo** | Vender envíos a una lista de cero personas. Fuera del catálogo el primer año |
| **Gestión completa de redes como línea estándar** | 8-10 h/tienda/mes: tres tiendas se comen un tercio del mes de una persona. Plaza limitada a 2-3 y precio de escasez, o no se ofrece. El **kit de contenido** tampoco escala bien (84 piezas/mes ×7), solo se rompe más despacio |
| **Formulario Tally → GitHub Action → commit automático** | Dar escritura efectiva sobre el repo a 7 personas no técnicas, en un repo que despliega **un solo servicio con los 7 dominios dentro**. Un commit malo tumba las 7 a la vez. Ni con Zod delante |
| **Formulario de contacto genérico** | Compite en desventaja contra WhatsApp, que ya está en el móvil del cliente y contesta al momento. Añade un tratamiento más, un buzón que vigilar y un plazo de conservación. Los formularios que valen aquí piden algo concreto a cambio de algo concreto. **Condición de reapertura:** si GSC/GA4 muestran muchas sesiones de escritorio en horario de oficina sin ningún clic de contacto |
| **Números de teléfono de tracking** | Rompen la coherencia NAP entre web, ficha de Google y directorio del centro: destruyen el activo que se está vendiendo para medir una métrica que se puede aproximar con el clic |
| **Registro `citations[]` con fecha de verificación** | Una hoja de cálculo que se pudre. Sin revisión trimestral —que no va a ocurrir— da falsa sensación de control, que es peor que no tenerla |
| **Anillo de enlaces recíprocos entre los 7 dominios** | Misma IP, misma plantilla, mismos textos, probablemente mismo registrador. El anillo es una huella delatora. **Hub-and-spoke, nunca recíproco** |
| **Gimnasios y clubes colaboradores** | Depende de acuerdos firmados que el operador no puede conseguir. Es trabajo comercial del franquiciado disfrazado de sección web |
| **Rodaje del video tour como producto** | A Coruña, Vigo, Zaragoza, Córdoba y tres puntos de Madrid, una persona, más permiso de grabación en zona común que puede tumbar la entrega **después** de cobrar. Y la central ya edita el vídeo gratis **[S]**: vender "video tour" a secas choca con lo que el franquiciado ya recibe. Como mucho, subproducto de un viaje que se hace por otra razón |
| **Volver a emitir `aggregateRating`** | Retirado en `550844d` con razón: Google declara inelegible para estrellas a quien controla sus propias reseñas. Marcarlo es riesgo de acción manual a cambio de cero estrellas, ×7 |
| **Tratar `site: 'https://usafitness.es'` como un problema** | **[V]** No lo consume nadie: el canonical, el og:url y el sitemap se construyen desde `store.domain`. Es cosmético. Lo que sí hay que hacer es borrar `@astrojs/sitemap`, que está instalado y sin usar |
| **Traducir al gallego** | Hoy no hay tienda en Cataluña y el volumen de búsqueda en gallego para este vertical es marginal. Lo que sí se hace es **abrir la costura**: un campo `locale` por tienda con un solo valor, porque hacerlo con 7 dominios cuesta una tarde y con 170 URLs cuesta un proyecto |

---

## 6. DATOS QUE BLOQUEAN EL ROADMAP (una llamada cada uno)

1. ¿Cuántos dominios sirven Astro **hoy** y **quién controla el DNS** de cada uno — el operador o el franquiciado?
2. **¿El contrato de franquicia permite dominio y web propios con la marca?** Es la única pregunta que puede invalidar el proyecto entero: el ANEXO demuestra que la central regula la presencia digital hasta el detalle de quién debe ser titular de las cuentas. Nadie ha leído ese contrato.
3. ¿Las reseñas actuales son reales? ¿Quién autorizó publicarlas y desde cuándo están vivas?
4. ¿De dónde salen "Hasta 20% dto." y los 4 porcentajes de `Promotions.astro`? ¿Hay documento del franquiciador?
5. Villanueva: **¿El Zoco o La Pasada?**
6. ¿Cuál es el móvil real de cada tienda y está dado de alta en WhatsApp Business?
7. Las 4 tiendas sin `company`: ¿hay fecha, o se asume `noindex` indefinido?
8. ¿Bajo qué supuesto abre en domingo cada tienda de Galicia, Andalucía y Aragón?
9. ¿El franquiciador acepta que las fichas de los centros y `usafitness.es` enlacen al dominio de cada tienda?
10. ¿Las 30 fotos ya publicadas contienen personas identificables sin consentimiento?

---

## Autocrítica

- **Supuesto del que más depende este roadmap:** que `memory/02-current-state.md` sigue siendo cierto (2 dominios en Astro). Si la migración avanzó y no está reflejada, la Fase 2 se acorta mucho y las Fases 4-5 suben. Lo que **no** cambia en ningún escenario es la Fase 0: las reseñas repetidas y el iframe sin consentimiento son ciertos hoy, verificados en el código.
- **La parte más floja son las Fases 5 y 6.** Descansan sobre que exista un franquiciado que conteste y sobre un presupuesto de medios que nadie ha comprometido. Si ninguno aparece, el roadmap real termina en la Fase 4 — y eso ya sería un producto mucho mejor que el actual.
- **Riesgo que este documento no cubre:** he priorizado por coste de mantenimiento del operador, y eso sesga sistemáticamente contra lo que el franquiciado quizá sí pagaría (gente entrando por su puerta). Este plan optimiza que el sistema no se caiga; no demuestra que el cliente renueve. El único mecanismo que ataca eso es el cupón canjeable en caja de la Fase 6, y llega tarde.
- **Contradicción que asumo:** he añadido una regla para matar propuestas por coste de mantenimiento y he mantenido 13 secciones nuevas. Aplicando la regla a mi propio catálogo, las que sobreviven a "impacto alto + mantenimiento nunca o anual" son cinco: `asesoramiento`, `centro`, `estado`, `faq` y `aviso`. Las demás deben esperar a que haya una línea recurrente vendida que las pague.