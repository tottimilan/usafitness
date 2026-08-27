# Inventario completo — secciones, landings y estrategias de servicio

**Fecha:** 2026-08-27 · **Por qué existe:** puerta pedida por el dueño tras aprobar las 5 secciones F1: *«primero ver qué secciones nos faltaban, y qué landings… quizás metería aquí también estrategias de otros servicios, como suscripciones para novedades. Una vez confirmadas todas, ya nos meteremos en diseño.»*
**Estado:** ✅ **APROBADO por el dueño (27-ago)** — A2 entran las tres («dan diferenciación entre tiendas»); «Nuestro equipo» ELEVADA: «aprovechar mucho… puede abrir nuevos caminos». Pedida una RONDA 2 de innovación (bold, interactiva, objetivos nuevos) antes de cerrar del todo. Con su OK, este inventario es EL catálogo cerrado de la generación 2, y empieza el diseño (Loop A).

---

## A. El catálogo total de secciones (generación 2)

Las 9 actuales no se heredan: cada una se juzga contra las preguntas P y conversiones N. Resultado: **fusiones y sustituciones**, no acumulación — una landing con 14 secciones no responde mejor, responde más lento.

### Se transforman (las 9 de hoy → 6 de la generación 2)

| Hoy | Destino | Por qué |
|---|---|---|
| `hero` | **Se rediseña en F3** (por plantilla) | Es la cara de cada plantilla; el contenido mínimo lo fijan R1/R6 |
| `promotions` (4 tarjetas) | **→ absorbida por «Hazte socio»** | Sus 4 beneficios SON el programa de socio; tenerlos en dos sitios es la confusión actual |
| `schedule` + `location` | **→ fusionadas en «Hoy en tienda»** | Horario, dónde-dentro-del-centro, mapa y botones de contacto son UNA pregunta (P1), no dos secciones |
| `products` (13 strings) + `brands` | **→ fusionadas en «Productos y marcas»** | Sobre las 137 categorías y 52 marcas reales; la marquesina de logos vive dentro |
| `gallery` | **Se queda** + gana el **slot de vídeo** | Ya reconstruida (proporciones reales); el vídeo con clic-para-reproducir entra aquí — pedirás más vídeos a las tiendas |
| `reviews` | **Se queda** + gana **«déjanos tu reseña»** | El enlace directo a la ficha de Google es la máquina de reseñas (5/8 tiendas a cero — el mayor agujero medido) |
| `social` | **Se queda**, compacta | Franja fina; conversión N5, la menor |

### Nuevas (aprobadas 27-ago)

**Hazte socio** ⭐ · **Oferta del mes** (dos niveles) · **Hoy en tienda** · **Productos y marcas** · **Por qué en tienda** — hojas completas en `docs/plantillas/secciones-f1/ficha.md`.

### Candidatas nuevas de este inventario (a tu veredicto)

| Sección | P/N | Por qué | Condición |
|---|---|---|---|
| **FAQ local** | P1/P4 · sin evento propio | Las 4-6 preguntas reales de tienda física: ¿parking? ¿devoluciones? ¿pago con tarjeta/Bizum? ¿encargos por WhatsApp? Responde objeciones sin llamar y alimenta SEO local (la gente busca las preguntas literales) | Contenido de marca + 1-2 datos por tienda (parking) |
| **Nuestro equipo / expertos** | P4-P5 · sin evento | Los expertos con nombre del brand book (Gouveia, Gil) + «tu asesor en tienda». E-E-A-T: el contenido de nutrición firmado por gente con credenciales pesa en Google | **Tu respuesta pendiente**: ¿pueden aparecer? |
| **Novedades del mes** | P2 · `ver_productos` | «Lo nuevo en la estantería» — 3-4 productos que acaban de llegar. Da razón de VOLVER a la web y a la tienda; enlaza con el canal de novedades (C) | Dato mensual (foto móvil + nombre); encaja como servicio gestionado |

## B. Las landings — el mapa total

### Por tienda

| Landing | Estado | Nota |
|---|---|---|
| `/` (home) | ✅ existe → se rediseña con el catálogo A | La landing principal, todo el trabajo de F1-F3 |
| 4 legales | ✅ existen | Bloqueadas de contenido en 5 tiendas (datos del franquiciado) |
| **`/oferta`** | **NUEVA** | La página de oferta flash con cupón «enséñalo en caja» — el destino de campañas (IG bio, QR en tienda, canal WhatsApp). Es además producto vendible (Nivel 3). Sin oferta viva → redirige a home |
| **`/socio`** | **NUEVA — propuesta** | La sección estrella con URL propia y compartible: el dependiente puede decir «entra en tuweb.com/socio». Misma pieza, dos puertas. Coste marginal ~0 |
| Futuras SEO local («creatina en C.C. X») | ❌ ahora no | Contenido por tienda que nadie mantendría a escala 50; solo si los datos de GSC lo piden (Loop C) |

### Globales (no por tienda)

| Landing | Fase | Nota |
|---|---|---|
| **`/muestrario`** | F3b | El catálogo de plantillas para vender — noindex, datos ficticios |
| **Demo del prospecto** | Comercial | La landing pre-construida con seed data, URL de preview noindex — el «tu web ya existe» del pitch |

## C. Estrategias de servicio (lo que pediste añadir)

Cada una con su letra pequeña — la diferencia entre vender humo y vender producto:

| Estrategia | Qué es | Conversión | Letra pequeña | Cuándo |
|---|---|---|---|---|
| **Canal de WhatsApp de novedades** ⭐ | Bloque «Únete al canal de tu tienda» — el franquiciado difunde novedades/ofertas por Canal de WhatsApp (difusión unidireccional) | N2 · evento `unirse_canal` (nuevo, se propone al registro) | **La joya RGPD**: unirse lo hace el usuario en SU WhatsApp — nosotros no captamos ni un dato. 91% de uso de WhatsApp en España [V]. El franquiciado ya sabe usarlo | **v1 — recomendada.** Solo necesita el enlace del canal por tienda |
| **Suscripción email a novedades** | El formulario clásico de newsletter | N2-N3 | RGPD pleno: franquiciado = responsable, capa informativa AEPD en el formulario, doble opt-in, y solo tiendas con `company` completo (R8). Hoy: 3 de 8 | **Fase posterior**, cuando haya legales — el canal de WhatsApp la sustituye mientras |
| **Cupón de bienvenida al canal** | «Únete y enséñanos el mensaje de bienvenida en caja» | N4→N1 | Sin datos personales; medible en caja | v1.5, encima del canal |
| **Aviso de cumpleaños** | «Tu descuento de cumpleaños te espera» | N1 | Necesita fecha de nacimiento = dato personal sensible de gestionar → mismo tratamiento que newsletter | Posterior; el beneficio ya se anuncia en Hazte socio sin captar el dato |
| **Máquina de reseñas** | Ya catalogada (memory/15 §9): enlace «déjanos tu reseña» + gestión mensual de ficha | P4 | Ninguna — el enlace es a la ficha de Google de la tienda | v1 (el enlace) + servicio gestionado |

## D. Qué queda explícitamente FUERA (y por qué)

- **Venta online / carrito** — canal de la central. Escrito en el norte.
- **Blog de contenidos** — mantenimiento imposible a escala 50 sin equipo; el SEO local se ataca con FAQ + fichas de Google.
- **Chat en vivo de terceros** — rompe la regla de cero terceros; WhatsApp lo cubre mejor y gratis.
- **App / puntos digitales** — el programa de socio es presencial a propósito (fricción cero en caja).

## La puerta

Veredicto por bloque: **A** (las 3 candidatas: FAQ, equipo, novedades) · **B** (`/oferta` y `/socio` nuevas) · **C** (canal de WhatsApp v1, y el orden del resto). Con tu OK este inventario se cierra, se escriben las hojas de objetivos de lo aprobado que no las tenga, y **empieza el diseño**.
