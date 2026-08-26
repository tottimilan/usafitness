# Catálogo comercial de servicios — 2026-08-26 · **revisado tras el giro de método, 2026-08-27**

> **CORRECCIÓN DE PREMISA, aplicada al recibirlo (2026-08-26).**
>
> Este catálogo se produjo con la hipótesis de que **el comprador sería la
> central**, y su Nivel 4 («Pack Red») descansaba entera en eso. El usuario
> decidió lo contrario ese mismo día, y decide él. La nota alcanza a §1 (tesis)
> y a §7.2(b): ambos quedan anotados «escrito bajo la hipótesis descartada —
> el modelo elegido es (b): tienda a tienda».
>
> **Revisión post-giro (27-ago):** el muestrario queda condicionado a F3b (las
> 2 plantillas que ofrecía están rechazadas), se integran los 4 productos de la
> investigación de conversión, y el informe mensual incorpora los eventos
> nuevos. El ciclo de VENTA lo gobierna `docs/product/proceso-comercial.md`;
> este catálogo gobierna QUÉ se vende y a qué precio.
>
> **Modelo elegido: (b). Vende a cada franquiciado, uno a uno. La central solo
> avisa** — bendice el servicio y abre la puerta, no lo contrata ni lo paga.
>
> Lo que eso cambia en la lectura de abajo:
>
> - **El Nivel 4 no aplica** tal como está escrito. Su mejor €/h desaparece del
>   plan, y con él la vía de 0,35 h/tienda que hacía caber 58 tiendas «sobradamente».
> - **El techo que manda es el COMERCIAL, no el operativo.** El propio documento
>   lo dice: con venta de una en una son 51 altas × 4-6 h = 204-306 h, y a 2
>   altas al mes, **25 meses de onboarding**. El techo realista es **~30 tiendas
>   en dos años**, no 90.
> - **Por eso el tiempo de alta deja de ser una métrica de eficiencia y pasa a
>   ser LA restricción del negocio.** Cada hora que se recorta del alta es una
>   tienda más al año. El `scripts/nueva-tienda.mjs` que el catálogo lista como
>   utilidad es, con el modelo (b), la pieza central.
> - El propio documento admite en su autocrítica que «la central va a comprar»
>   era «opinión disfrazada de análisis» y que nadie lo había intentado nunca.
>   La decisión del usuario lo resuelve por la vía de no depender de ello.
>
> Lo demás del catálogo sigue en pie y está construido sobre datos medidos de
> las tiendas reales.

---

# §3 — Catálogo comercial (versión definitiva, 2026-08-26)

> Sustituye por completo a la versión anterior de `memory/06-feature-map.md §3`.
> Datos verificados hoy contra `src/data/stores.json` (7 fichas: villanueva, marineda, lasrosas, alcobendas, grancasa, vigo, arcangel). `company` 3/7 · `ga4Id` 0/7 · `template` 0/7 · `sections` 0/7 · `whatsapp` presente en 5, y de esos **solo Vigo (+34661…) es móvil**; los otros cuatro son fijos. GranCasa lleva `googleMapsStatus: "sin-ficha-gbp"` declarado a propósito — no es un descuido, y no se enseña como si lo fuera.
> **Discrepancia abierta:** hay 8 dominios conectados y 7 tiendas en el repo. `usafitnesslagoh.com` apunta a un servicio sin entrada versionada. Eso no es una tienda pendiente: es un dominio sirviendo algo que nadie valida en el build.

---

## 1. La tesis, en tres frases

**Este negocio no vende webs ni marketing: vende ser el único que sabe qué es verdad sobre cada tienda** —teléfono, horario real, festivos del centro, CIF, coordenadas con 5 decimales, CID de la ficha— y mantener ese dato coherente en todos los sitios donde aparece. El comprador que puede pagarlo a escala no es el franquiciado individual (medido: 4 de 7 llevan meses sin dar su NIF pese a que les bloquea sus propias páginas legales), sino **la central, que ya impone un ANEXO de Integración Digital obligatorio al que le falta exactamente esta mitad**. Y todo lo que exija atención diaria —campañas, reseñas con SLA, redes sociales— queda fuera del catálogo mensual, no por precio sino porque a 20 tiendas convierte a una persona sola en una guardia de 24/7 mal pagada.

Corolario que ordena el resto del documento: **el pago único es trabajo que programo yo; la mensualidad con reloj es trabajo que programa el cliente.** Solo entra en el recurrente lo que se puede desatender 10 días laborables sin que el cliente se entere.

---

## 2. El catálogo

### Nivel 0 — Alta (pago único). Es el filtro, no el margen.

| Servicio | Qué incluye | Precio | h/mes por tienda tras automatizar | Qué hay que construir | Dolor concreto que resuelve |
|---|---|---|---|---|---|
| **Sesión de alta de 45 min** | UNA llamada con guion cerrado donde se hace de golpe todo lo que exige su presencia: razón social/NIF/domicilio/email legal **dictados por teléfono** y tecleados en directo; firma electrónica de contrato marco + art. 28 RGPD + **mandato SEPA**; verificación del móvil real de WhatsApp con llamada; invitación de gestor a la ficha de Google; las 6 fotos o el guion para que las haga el dependiente hoy | Incluida en el Alta | **0** recurrente · 0,75 h mías, una vez | Guion + checklist verificable · plantilla de firma con los 3 documentos precargados por sociedad | El método actual (email pidiendo el NIF) tiene **57% de no-respuesta medida**. Una no-respuesta indefinida es una tarea que reaparece cada semana sin producir un euro. La llamada la convierte en sí o no el mismo día |
| **Alta Express — web en su dominio** | Web con plantilla elegida, foto de hero propia, NAP coherente, 4 páginas legales publicadas, GA4 + Search Console **a nombre de su sociedad**, sitemap, 404, los 3 eventos de conversión | **490 €** · 690 € con migración real desde WordPress | **0** recurrente · 4-6 h hoy, objetivo **≤3 h** en la tienda 20 | `scripts/nueva-tienda.mjs` (12 campos → entrada validada) + conversión y nombrado automático de fotos a AVIF/WebP | Hoy quien busca "usafitness <su centro>" aterriza en el directorio del centro o en usafitness.es: el clic se lo lleva otro. Y sin web propia no tiene dónde corregir su teléfono cuando su ficha se lo cambia |
| **Muestrario y elección de plantilla** | Sesión de 20 min sobre `/muestrario` (noindex) con **la(s) plantilla(s) del método** sobre datos ficticios — **disponible desde F3b; hasta entonces este servicio NO se ofrece** (angular y energia, rechazadas 26-27/08, no se enseñan). Elige y se aplica el mismo día | Incluido en el Alta · **149 €** suelto para las 7 ya publicadas | **0** | Ruta `/muestrario` con datos de mentira. **1 día** | Su web es hoy byte-idéntica a la de otras seis tiendas de la misma marca y él lo ve. Además estrena un sistema construido, pagado y con **0 de 7 adoptantes** |
| **Alta de ficha de Google** | Reclamar/verificar, categoría principal y secundarias, pin dentro del centro (no en el parking), horario real + **festivos del centro cargados como horarios especiales**, atributos, 10 fotos, Productos, 5 Q&A sembradas | Incluido en el Alta · **290 €** suelto | **0** recurrente · 3-4 h una vez | Checklist de 22 puntos + `holidays/<centro>.json` que alimenta a la vez ficha y web | Los 4 factores que más pesan en el local pack son de ficha y se ponen bien una sola vez. **La verificación por postal/vídeo/llamada queda fuera del alcance por escrito**: la decide Google, sin plazo ni endpoint |
| **QR de captación de reseñas** | Enlace corto verificado + expositor de mostrador + tarjeta de bolsa + bloque en la web (HTML puro) + guion de 8 palabras para el dependiente que cumple la política de Google | Incluido en el Alta | **0 exactamente** | Generador de QR en build desde el CID → SVG para imprenta | El 47% no usa un negocio con menos de 20 reseñas. Sin flujo de entrada no hay nada que gestionar. **Es el único servicio del catálogo que sigue funcionando igual si me muero** |
| **Entidad para IA** (opcional) | Alta en Bing Places, Apple Business Connect, Facebook y Foursquare con NAP idéntico + reapuntar la ficha del directorio del centro al dominio propio | **149 €** una vez | **0** | Nada de código: procedimiento de 5 pasos + plantilla NAP derivada de `stores.json` | Cobertura barata frente a una incertidumbre real (unas fuentes dicen que ChatGPT tira solo de Bing, otras de Foursquare). **Se vende el alta, nunca el resultado**: todos los datos de adopción son de EE. UU. Y añade un coste oculto: a partir de aquí cada cambio de teléfono se propaga a 5 sitios, no a 2 |

**Alta completa: 490 €** (sesión + web + legal + ficha + QR + muestrario). **690 €** con migración. **+149 €** entidad IA.

### Nivel 1 — Base mensual. Es el suelo y el envase de todo.

| Servicio | Qué incluye | Precio | h/mes por tienda | Qué hay que construir | Dolor concreto |
|---|---|---|---|---|---|
| **Base** | Guardia técnica (**coste de flota, no por tienda**), SSL, uptime, backups, **aviso de caducidad del dominio a 60 días**, **2 cambios de contenido al mes con plazo declarado de 5 días laborables**, Semáforo NAP mensual e informe de 1 página | **59 €/mes** · suelo absoluto **39 €** | **0,55 h** (0,13 servicio + 0,30 interlocución + 0,12 admin) | Ver §5 | Cuando el centro cambia el horario de Navidad no tiene a quién llamar y su web miente tres semanas |
| ↳ *Semáforo NAP* | Diff `stores.json` ↔ ficha ↔ directorio del centro: teléfono, dirección, horario, festivos, categoría, URL. Rojo/ámbar/verde con el diff exacto. **Se vende como "te aviso", nunca como "te lo arreglo en X horas"** | dentro de la Base | 0,03 | `src/build/verificar-nap.ts` en CI, calcado de `verificar-assets.ts`. **v1 contra snapshot revisado a mano** — funciona hoy, sin API y sin permisos de nadie | Medido: el teléfono de Marineda no coincide con su ficha, 4 tiendas tienen horarios distintos entre web y Google, y **2 figuran cerradas los domingos en Google estando abiertas** |
| ↳ *Informe mensual de 1 página* | Impresiones, consultas, intención de llamada, clics de WhatsApp y "cómo llegar", reseñas nuevas, Semáforo en verde o rojo + **dos párrafos escritos a mano: esto hice / esto haré** | dentro de la Base | 0,10 | `scripts/informe.mjs` (GSC Search Analytics + GA4 Data API → HTML) en cron mensual | No lo pagan: es lo que hace que renueven lo demás. **Tiene periodicidad pero no urgencia**: si sale el día 3 nadie lo nota, y las 20 tiendas se hacen en una tarde en lote |

### Nivel 2 — Módulos mensuales opcionales. Con tope numérico o no se venden.

| Servicio | Qué incluye | Precio | h/mes por tienda | Qué hay que construir | Condición innegociable |
|---|---|---|---|---|---|
| **Ficha gestionada** | 2-4 publicaciones/mes distribuidas desde **una pieza de marca escrita una vez** con fechas escalonadas, fotos, Q&A, Productos, **festivos del centro cargados con un año de antelación**, y revisión mensual de ediciones de terceros | **+39 €/mes** | **0,20 h** con API · **0,55 h** a mano o con herramienta comprada | Cliente OAuth contra Business Profile API con token de grupo de agencia + distribuidor 1→N con escalonado | Solo si llegó la invitación de gestor. **Los festivos se cargan en octubre**: si no, diciembre me arruina las Navidades a 20 tiendas a la vez. **La "vigilancia de ediciones" es una revisión dentro del informe, no una alerta** |
| **Respuesta a reseñas — lote semanal** | Borrador generado, **revisión y edición humana una a una, publicación en lote una vez por semana**, aviso al franquiciado solo cuando la reseña describe un incidente que solo él resuelve | **+29 €/mes hasta 8 reseñas** · +19 € por cada tramo de 8 | **0,33 h** con 8 reseñas (2,5 min/reseña reales) | Pub/Sub `NEW_REVIEW` → cola de borradores → **pantalla de aprobación, no una aplicación** → `reviews.updateReply` | **Lote semanal declarado por contrato, jamás 48 h.** Tope de volumen escrito. **4 semanas de blackout al año.** El 50% descarta a quien responde con plantillas: automatizar el envío destruye el producto |

### Nivel 3 — Encargos puntuales. Se cobran a la pieza, nunca "incluido".

| Servicio | Precio | h/mes | Qué hay que construir |
|---|---|---|---|
| **Sección nueva** (`asesoramiento`, `centro`, `faq`, `estado`, `aviso`) | 90-190 € | **0** | 5 componentes + entrada en `SECTIONS`. Media semana para las cinco; después, añadirla a una tienda es un string en un array. **Regla de admisión: si exige refresco más de una vez al año, no se construye** |
| **Landing de promoción con caducidad automática** | 290 € | **0** | Flag de fecha-fin con despublicación automática. **Se despublica sola**: un entregable que caduca sin que yo lo toque es un entregable que no me persigue en agosto |
| **Paquete de fotos / migración WordPress** | por horas, 45 €/h | 0 | Nada |

`asesoramiento` es la sección con más evidencia detrás: aparece en 16 de 18 reseñas del JSON y **no está publicada en ninguna web**. `centro` (planta, local, parking, transporte) es la única que se rellena copiando del directorio del centro **sin que el franquiciado conteste nada**.

### Nivel 4 — Pack Red (la central). Es el producto, no el sueño.

| Qué incluye | Precio | h/mes por tienda | Por qué lo compran |
|---|---|---|---|
| Las 58 tiendas con web propia, guardia de flota, Semáforo NAP, informe mensual y panel de estado de red. **Una factura, un interlocutor, los 58 CIF ya en su poder** | **39 €/tienda/mes → 2.262 €/mes** + 190 €/tienda de alta | **0,35 h** (la interlocución cae de 0,30 a 0,10) | Su dolor no es el marketing de una tienda: es que 58 sociedades independientes publiquen 58 versiones distintas del teléfono y el horario **de su marca**. Ya está pasando y ya está medido |

**Condición de diseño sin la cual no se firma:** dominios y propiedades GA4/GSC **a nombre de cada franquiciado**, nunca de la central ni míos. El motor, el esquema y el generador, a mi nombre. Eso es lo que impide que la central se lleve 58 sitios a otro proveedor con un email.

---

## 3. Lo que se descarta, con nombre

Esta sección vale más que la anterior. Cada línea de aquí son semanas que no se pierden.

**1. Google Ads y Meta Ads. Fuera del catálogo, en cualquier nivel.** Tres razones y basta cualquiera: (a) 2,5 h/tienda/mes irreducibles — cada plaza cuesta el hueco de **4,5 tiendas de Base**; (b) los prerrequisitos están al 0% verificado: `ga4Id` 0/7 y **un solo WhatsApp móvil real de 7**; (c) es el único servicio que hace al cliente dependiente del resultado *semanal*, gasta dinero ajeno todos los días y no admite dos semanas sin mirar — el fallo no es "me retraso", es "te he quemado 400 € y no ha entrado nadie". Y con 3 tiendas en Madrid, optimizar la de una es pujar contra la otra con dinero de gestión que cobro a las dos. Si algún día entra, entra como encargo por horas, una plaza por ciudad, con el medio en la tarjeta del cliente.

**2. Instagram, en las tres versiones.** Ni gestión completa (8 h/tienda/mes), ni "kit para que publique él", ni "canal de marca replicado". El kit está enterrado por los datos del propio proyecto: **Las Rosas 460 días sin publicar con 48 posts, GranCasa 0 publicaciones y 2 seguidores**. Y su métrica ("piezas entregadas vs. publicadas") produce un informe mensual que demuestra que el cliente incumple: eso es una baja, no una renovación. La versión "publicamos nosotros" tampoco entra, por un coste que ninguna propuesta contabiliza: **publicar en su cuenta abre un canal donde desconocidos preguntan por stock y precio en comentarios y DM**, sobre suplementación, en fin de semana, y el franquiciado no los va a contestar. Eso no está en los 0,3 h/mes ni puede estarlo.

**3. Respuesta a reseñas con SLA de 48 h.** Es el servicio que mejor suena y el peor de todos. Un compromiso de 48 h sobre un evento que llega en sábado y el 26 de diciembre ata siete días a la semana por 39 €. Dos semanas de vacaciones son dos semanas incumpliendo el único compromiso medible que he firmado, **y el incumplimiento es público en Google**. Sobrevive solo la versión en lote semanal con tope.

**4. El "Pack B / Tú no tocas nada" a 129-149 €.** El nombre es el problema: es una promesa que solo puede cumplir un equipo. Y la aritmética la mata: 1,35 h/tienda × 58 = **78 h/mes**, por encima de las 75 disponibles. El error de diseño es empaquetar el módulo lineal (reseñas) dentro de una cuota plana.

**5. Cambios de contenido "ilimitados" o "bajo demanda sin límite razonable".** La palabra "razonable" no la define el contrato, la define un franquiciado nervioso un viernes. Dos cambios al mes, 5 días laborables, escrito.

**6. Avisos operativos el mismo día ("hoy cerramos a las 18:00").** Es una promesa de publicación en horas por 59 €/mes: a 20 tiendas obliga a no estar nunca a más de dos horas de un portátil, y el día que falle el fallo se ve en la web del cliente.

**7. WhatsApp como canal de soporte.** No es un servicio con nombre y es lo que decide si esto es habitable: no tiene bandeja, ni cola, ni estado, ni horario. Con 20 tiendas son 20 personas con mi móvil y expectativa implícita de respuesta en minutos. **Las peticiones entran por formulario o email con plazo declarado, o el negocio no llega a la tienda 15 aunque las horas cuadren.**

**8. Cobrar guardia técnica por tienda.** Son 7 dominios en un solo servicio Railway: vigilar 58 cuesta lo mismo que vigilar 7. La versión anterior de este catálogo lo cobraba a 0,5 h/tienda/mes, lo que a 58 tiendas **factura 29 h/mes de trabajo que no existe** y esconde las horas que sí. Pasa a fijo de flota: 3-6 h/mes en total.

**9. Recoger los datos legales por email o formulario.** Método probado y fallido en este mismo repo: 4 de 7 llevan meses bloqueando sus propias páginas legales. Se sustituye por dictado telefónico dentro de la sesión de 45 minutos, o no se da de alta la tienda.

**10. Cobro por transferencia mensual.** Con un 57% de no-respuesta medido, cualquier cobro que exija una acción suya cada mes llegará tarde la mitad de los meses. **Mandato SEPA firmado en el alta o no hay servicio.** No es comodidad de cobro, es diseño.

**11. Contenido local generado por plantilla replicado a 58 dominios, blog de nutrición y páginas de ciudad.** Es el patrón exacto que Google sanciona como *scaled content abuse*, y el dato de intención lo remata: las consultas informacionales muestran AI Overview el 92% de las veces y local pack el 6%. Ese tráfico ni se gana ni compra. Y con 3 tiendas en Madrid, me canibalizo contra mí mismo.

**12. Cualquier avatar, actor de IA o testimonio sintético.** Publicidad encubierta con testimonio inventado sobre producto de consumo alimentario. Es el mismo tipo de error que ya quemó este proyecto con las fichas inventadas. No entra a ningún precio.

**13. Petición de reseñas por WhatsApp/SMS, tablet en mostrador, incentivos, y cualquier encuesta que filtre a los contentos.** Lo primero no tiene dato que capturar (no hay TPV ni CRM) y es categoría *marketing* con base legal RGPD. Lo último es *review gating*, prohibido literalmente por la política de contenido de Maps.

**14. El fetcher permanente del directorio del centro comercial.** "1 h por centro, se hace una vez" subestima el único tipo de automatización que se rompe sola: scraping de HTML ajeno, en 47 centros distintos, fallando **en silencio** dentro de una pieza que se vende como "lo veo yo antes que tu cliente". La comprobación del directorio pasa a manual anual dentro del alta.

**15. La tercera plantilla, el CMS y el panel para que el franquiciado edite.** Las dos plantillas existentes tienen **cero adoptantes**: construir la tercera es construir para un usuario imaginario. Y darle una herramienta de edición es devolverle el trabajo que constituye el producto entero.

**16. El argumento comercial de que "las publicaciones de Google caducan a los 7 días".** Falso desde enero de 2021: pierden prominencia, no desaparecen. Un franquiciado espabilado lo comprueba en dos minutos y a partir de ahí no cree nada más de la propuesta. **Corregido en este catálogo.**

**17. Inventario local en Merchant Center.** No es una propuesta, es **una pregunta para la central**: ¿hay TPV común obligatorio en la red? Si sí, es el mayor desbloqueo del catálogo y se integra una vez para las 58. Si no, exige un feed de stock por sociedad independiente y está muerto. No se vuelve a mencionar hasta tener respuesta.

---

## 4. El techo de capacidad

**Presupuesto.** 120 h/mes facturables × 11 meses = **110 h/mes de media efectiva**. Fijos que no dependen de N: guardia de flota 4 h + venta 15 h + producto/plataforma 15 h = **34 h**. Quedan **76 h/mes para tiendas**, de las que reservo 8 h para altas (2/mes × 4 h) → **68 h de recurrente**.

**Mix realista con este catálogo:** 100% compra Base (0,55 h), ~50% añade Ficha gestionada (0,20 h), ~30% añade Reseñas (0,33 h).

```
h/tienda/mes = 0,55 + (0,50 × 0,20) + (0,30 × 0,33) = 0,75 h
Techo operativo = 68 / 0,75 = 90 tiendas
```

**Pero ese no es el número que manda.** Con venta de una en una, 51 altas × 4-6 h = **204-306 h**, y a 2 altas/mes son **25 meses de onboarding**. El techo comercial de una persona vendiendo tienda a tienda es **~30 tiendas en dos años**. Vía Pack Red (0,35 h/tienda), 58 tiendas consumen **20 h/mes** y el cuello vuelve a ser el alta, no la operación.

**Números redondos:**

| Escenario | h/tienda | Recurrente a 20 | Recurrente a 58 | ¿Cabe en 68 h? |
|---|---|---|---|---|
| Base sola | 0,55 | 11 h | 32 h | Sí, con holgura |
| Mix del catálogo | 0,75 | 15 h | 43,5 h | Sí |
| Pack Red (central) | 0,35 | — | 20 h | Sí, sobradamente |
| *Catálogo anterior (§3 viejo)* | *2,20* | *44 h* | *128 h* | ***No: roto por 60 h*** |

**Qué servicio rompe el techo primero: la respuesta a reseñas. Y no rompe por número de tiendas, sino por número de reseñas.** Es la única partida cuyo coste crece sin que crezca el negocio: si las tiendas pasan de 8 a 20 reseñas/mes —que es lo que pasa si el resto del catálogo funciona—, esas mismas 17 tiendas suscritas pasan de 5,7 h/mes a **14 h/mes** sin un euro más de facturación. Por eso el tope por tramos no es una comodidad de tarificación: es lo que impide que el éxito del producto mate al proveedor.

**Aviso sobre el número 90:** es aritmética, no experiencia. Nadie ha llevado nunca más de 7 tiendas en este proyecto. Trátalo como techo teórico y revísalo con datos reales en la tienda 15.

---

## 5. El orden de construcción

Cada paso se vende antes de construir el siguiente. Nada se construye a ciegas.

**Semana 0 — El experimento que decide la arquitectura (coste: 7 emails).**
Pedir a las 7 tiendas actuales la invitación de gestor a su ficha de Google y **contar cuántas llegan en 14 días**. Si llegan ≥5, el módulo de Ficha gestionada existe y se construye contra la API (gratis, aprobada por proyecto, un proyecto para las 58). Si llegan ≤3, ese módulo no existe: el catálogo real es Nivel 0 + Base + Pack Red, y la ficha se opera a mano o con herramienta comprada. **Este experimento decide 40-60 h de trabajo y no cuesta nada.** Ninguna línea de código de GBP se escribe antes de tenerlo.

**Paso 1 — Semáforo NAP v1 (medio día).** Contra snapshot revisado a mano: funciona hoy, sin API aprobada y sin permisos de nadie. Calcado de `src/build/verificar-assets.ts`, corre en CI y falla el build en rojo. **Vendible el mismo día que existe**: es la auditoría gratuita que abre todas las conversaciones y el argumento que se comprueba en 30 segundos en el móvil del franquiciado.

**Paso 2 — `scripts/nueva-tienda.mjs` + conversión de fotos (2-3 días).** Ataca el cuello de botella real, no el recurrente: baja el alta de 4-6 h a ≤3 h. Sobre 51 tiendas pendientes son **150-250 h ahorradas**, más que cualquier optimización del recurrente de todo el catálogo. **Vende el Alta Express a 490 €.**

**Paso 3 — `/muestrario` (1 día).** Enciende `template` y `sections`, que están construidos, pagados y con **0 de 7 adoptantes**. Es el mejor retorno por hora construida del plan entero y convierte "una web" (commodity que compite contra Fiverr) en "elige delante de mí". **Vende 149 € a las 7 actuales y sube la tasa de cierre de la 9.**

**Paso 4 — `scripts/informe.mjs` (2-3 días).** GSC + GA4 → HTML de una página en cron mensual. Exige antes pegar los `G-…` en `ga4Id` (hoy 0/7; la fontanería de Consent Mode v2 ya está montada y bajo test). **Habilita cobrar la Base mensual**, que sin informe es una cuota sin prueba de vida.

**Paso 5 — Las 5 secciones (media semana).** `asesoramiento`, `centro`, `faq`, `estado`, `aviso` (con fecha-fin obligatoria en el esquema). **Vende el Nivel 3 a las 7 actuales inmediatamente** y después vale para las 58 sin tocar código.

**Paso 6 — Solo si el experimento salió bien: cliente GBP API + Pub/Sub + cola de aprobación (2 semanas).** Módulos de Nivel 2. **Nunca antes del paso 5.**

**Lo que NO se construye:** monitor externo (se compra), tercera plantilla, CMS, panel de cliente, integración con Meta.

---

## 6. La primera venta: la tienda 9

**A quién, por este orden de preferencia:**

1. **La segunda tienda de una sociedad ya identificada.** USA GOVE S.L. ya posee dos de las siete. Una segunda tienda del mismo dueño no necesita contrato marco nuevo, ni art. 28 nuevo, ni SEPA nuevo, ni perseguir datos legales: **el alta baja de 5 h a ~2 h y la venta es un mensaje, no una llamada.** Es el euro más barato que existe en este negocio y todavía no se ha ido a buscar.
2. **Si no la hay: una tienda en una ciudad donde no haya otra USAFitness** (fuera de Madrid, A Coruña, Zaragoza, Vigo, Córdoba, Sevilla). De las 58, **11 son a pie de calle**: ahí está el candidato. Motivo: en cuanto el producto toca la ficha y las reseñas, optimizar a una tienda de Madrid **empuja hacia abajo a las otras dos madrileñas en el mismo pack**. Con la web el juego era de suma positiva; con la ficha es suma cero entre clientes míos. Mientras no esté firmada la declaración de conflicto de interés, crecer por ciudades nuevas es lo único limpio.
3. **Desempate: ficha ya verificada y con reseñas.** Si está verificada me evito el único punto del alta que puede encallar semanas sin que yo pueda hacer nada.
4. **Descarte automático:** la tienda que no tenga a nadie capaz de dar datos legales y accesos en una sola llamada. Cuatro de las siete actuales llevan meses ahí; sumar una novena igual no es una venta, es una deuda.

**Qué se le ofrece, en tres movimientos:**

**(1) Antes de pedir un euro: su auditoría, gratis.** Una página con capturas y cero opiniones: su teléfono en la web frente al de su ficha, su horario de domingo en Google frente al que abre de verdad, su horario frente al del directorio del centro, cuántas fotos tiene su ficha, cuántas reseñas y de cuándo es la última. Se abre por donde duele: *"tu web dice que abres los domingos y tu ficha de Google dice que cierras — llevas meses mandando gente a una persiana bajada."* Lo comprueba él en el móvil en diez segundos. No es una promesa: es un fallo suyo que otro vio antes.

**(2) La sesión de 45 minutos, con fecha.** Ahí se hace todo: NIF dictado, invitación de gestor, verificación del móvil de WhatsApp, y firma electrónica de los tres documentos **incluido el mandato SEPA**. Si en esa llamada no se firma el SEPA y no sale la invitación, **la tienda no se da de alta**. Media hora perdida es barata; una tienda a medias es una obligación permanente.

**(3) El precio, cerrado, en una frase: 490 € de alta + 59 €/mes.** Nada de menú de módulos. Si contrata en la misma llamada, la Entidad IA (149 €) va incluida. Y una promesa que sí se puede cumplir: *"esto te va a costar 45 minutos hoy y cero minutos a partir de mañana."*

**Lo que NO se le dice:** ni una palabra de campañas, de Instagram, ni de posiciones garantizadas. Y si hay otra tienda de la marca en su ciudad, el conflicto de interés se declara por escrito en la primera factura, no cuando alguien lo descubra.

---

## 7. Los riesgos que matan el negocio

**1. La marca puede reclamar los 8 dominios a coste cero.** `usafitnessvigo.com`, `usafitnessmarineda.com`… llevan una marca registrada dentro. Si el contrato de franquicia reserva el uso online de la marca al franquiciador —cláusula completamente estándar—, son 8 dominios reclamables mañana. **Y el disparador es el éxito, no el fracaso**: a 5 tiendas nadie mira; a 25 eres el departamento digital de facto de la red. Qué hacer: **conseguir por escrito, antes de la tienda #10, que el franquiciado puede tener dominio y web propios con la marca.** Cuesta un email. Hoy son 8 dominios; a 30 tiendas es el negocio entero. Es la única pregunta que puede invalidar el proyecto y sigue sin respuesta.

**2. Concentración: 100% del MRR en una marca y ~4 decisores.** Ni siquiera son 58 clientes: USA GOVE S.L. ya posee dos de las siete, así que a 20 tiendas espera 12-15 sociedades. Qué hacer, en este orden: (a) el punto 1, por escrito; (b) **vender a la central en vez de contra ella** — 58 tiendas de Pack Red son 2.262 €/mes por 20 h/mes, más dinero que 20 tiendas vendidas de una en una y menos de la mitad de horas; (c) **diversificar por geografía, no por marca**: gimnasios, fisios y nutricionistas en los mismos centros comerciales, mismo producto, misma automatización — la plataforma es agnóstica de marca, lo único específico de USAFitness es `stores.json`. **Objetivo medible: ninguna marca por encima del 60% del MRR en el mes 18.**

**3. Vender a la central es a la vez el mejor dinero y el mayor riesgo.** Quien compra centralizado también interioriza o saca a concurso. La única versión que sobrevive es la que deja **dominios y propiedades GA4/GSC a nombre de cada franquiciado** y el motor a nombre propio: sustituirme deja de ser "contratar a otro" y pasa a ser "que otro reescriba el esquema, el registro de secciones y el multidominio, y renegocie con 58 sociedades".

**4. Suma cero entre clientes de la misma ciudad.** En cuanto el producto es la ficha, subir a Las Rosas empuja abajo a Alcobendas. Se firma antes, no después. Y mientras no esté firmado: **una tienda por ciudad**.

**5. Punto único de fallo, dos veces.** Técnico: 7 dominios en un solo servicio Railway, y un solo proyecto GCP gestionando 58 fichas de 58 sociedades distintas significa que **una suspensión apaga 58 empresas a la vez**, con consecuencias legales peores porque son sociedades independientes. Humano: una baja de dos semanas con 20 clientes y ningún sustituto. Mitigación real y única: **ningún compromiso por debajo de 5 días laborables, y 4 semanas de blackout al año escritas en el contrato.** Es lo que hace que un mes malo se traduzca en retraso y no en incumplimiento visible.

**6. Verifactu y factura electrónica llegan antes a sus clientes que a él.** Sociedades: 1 de enero de 2027. Autónomos: 1 de julio de 2027. **Sus 20 clientes entran seis meses antes que él** y le pedirán facturas estructuradas antes de estar obligado a emitirlas. La herramienta se elige ahora, no en diciembre de 2026. Y la casilla de IAE (sección 1ª vs. 2ª) decide si cada factura lleva 15% de retención — o sea ~15% menos de caja todo el año y 20 gestorías con motivo para llamar. Que lo decida su gestor, no el azar.

**7. Fabricación de datos.** Ya pasó (10 reseñas retiradas el 2026-08-24; el CID del centro comercial de GranCasa en `FICHAS_PROHIBIDAS`). El esquema de `src/data/stores.ts` es la mejor defensa que existe y no se relaja para cerrar una venta: **lo que no se pueda verificar sale vacío y la sección no se pinta.** Eso incluye no enseñar el `googleMapsStatus: "sin-ficha-gbp"` de GranCasa como si fuera un agujero.

---

## 8. Autocrítica

- **El supuesto más frágil es 0,30 h/tienda/mes de interlocución, tratado como constante.** Casi con seguridad no lo es: cae con la antigüedad del cliente y se dispara en el trimestre del alta. Si la media real es 0,45, el mix pasa de 0,75 a 0,90 h y el techo baja de 90 a 75 tiendas. Y es la única partida del catálogo que **no automatiza jamás**, haga lo que haga: por eso el Pack Red no es una preferencia comercial, es la única palanca estructural que queda.

- **El precio es la parte peor fundamentada del documento, con diferencia.** No hay ni una cuenta de explotación real de una tienda USAFitness. Los 59 €/mes y los 490 € salen de anclas de mercado españolas y del dato de que la franquicia se monta desde 9.000 € de inversión — es inferencia, no medición. **Una sola conversación con un franquiciado sobre lo que factura y qué margen le queda vale más que toda la columna de precios.** El único número del que estoy razonablemente seguro es el suelo: por debajo de 39 €/mes, una llamada de 20 minutos convierte al cliente en pérdida.

- **"La central va a comprar" es opinión disfrazada de análisis.** Todo el Nivel 4 —el mejor €/h del catálogo, el que resuelve la concentración y el que rompe el techo— descansa en que un franquiciador que nunca ha sido abordado dirá que sí. La evidencia a favor es indirecta (el ANEXO de Integración Digital existe y regula hasta la titularidad de las redes). La evidencia en contra es que **nadie lo ha intentado ni una vez**. El resto del catálogo está construido sobre datos medidos; esa parte no.

- **Las horas de reseñas asumen 8 reseñas/mes por tienda y ese número no está medido en este proyecto.** Contar las reseñas reales de las 7 fichas cuesta una tarde y decide si el módulo se vende a 29 € o no se vende. Hasta entonces, el precio por tramos es una conjetura protegida por un tope, no un cálculo.

- **El techo de 90 tiendas es aritmética pura.** Nadie ha operado nunca más de 7 aquí. Divide 68 entre un número estimado y no incluye churn (con un 15% anual hay que captar 3-4 tiendas/año solo para no bajar), ni un mes entero de baja, ni el hecho de que la tienda 40 ya no la reconozco por el nombre. Es un techo teórico útil para descartar servicios imposibles, no una previsión.

---

**Next recommended command:** `/mm-plan` sobre el Paso 1 (Semáforo NAP v1 contra snapshot manual).
**Why:** es medio día de trabajo, es lo primero vendible del plan y es lo único que no depende de una aprobación de Google ni de que un franquiciado conteste.
**Skip if:** prefieres mandar antes los 7 emails de invitación de gestor — ese experimento no requiere ningún código y decide si el Nivel 2 existe.
---

## 9. Productos añadidos por la investigación de conversión (27-ago)

De `docs/product/investigacion-conversion-2026-08.md` §4, bajo el filtro «desatendible 10 días laborables». **Precios: pendiente del dueño.**

| Producto | Nivel | Qué es | Recurrente estimado |
|---|---|---|---|
| **Campaña del mes gestionada** | 2 | La central/operador diseña una vez (el operador TIENE acceso al canal de ofertas de la central — dato 27-ago); cada tienda opta; banner con fecha-fin y despublicación automática. Modelo Anytime/GNC | bajo (1 diseño/mes ÷ N tiendas) |
| **Página de oferta flash con cupón** | 3 | Landing `/oferta` con cupón visual «enséñalo en caja», fecha-fin obligatoria, medible por `ver_oferta`. Casi idéntica a la «Landing de promoción» ya catalogada — se fusionan | por pieza |
| **Pre-alta de socio → WhatsApp** | 3 | Formulario mínimo cuyo lead llega AL WhatsApp del franquiciado (sin base de datos nuestra). **Condicionado a `company` completo + móvil real** (R8) | por pieza |
| **Ficha de Google + máquina de reseñas** | 2 | Gestión mensual del perfil + enlace «déjanos tu reseña» — ataca el mayor agujero medido (5/8 tiendas sin reseñas; solo el 4% de consumidores no las lee) | refuerza módulos N2 existentes |

**Informe mensual de 1 página** (amplía la especificación existente): añade `ver_oferta` (con `origen` central/propia), `interes_socio` y `ver_horario` («intención de visita»). Regla de redacción: «mínimos medidos», nunca totales (riesgo de sesgo de consentimiento, memory/08).

**Decisión de tarificación pendiente (dueño):** ¿el override de oferta propia consume los 2 cambios/mes de la Base, o entra como «campaña del mes gestionada»?
