# Investigación de conversión — agosto 2026

**Método:** 4 hilos paralelos con fuentes obligatorias. `[V]` = verificada contra la fuente primaria (la fuente lo dice; no implica verdad conductual). Las encuestas autoreportadas (BrightLocal 4%/88%; el 80% de NAP) son `[V-encuesta]`, y quien las cite hereda la marca. `[P]` probable · `[S]` sin verificar. **61 hallazgos, 41 verificados** — el volcado íntegro, commiteado: [`investigacion-conversion-2026-08.json`](investigacion-conversion-2026-08.json). Aquí, lo que decide diseño y negocio.

---

## 1. El catálogo real de usafitness.es (13 de 14 verificados)

- `[V]` **1.683 productos activos**, ~133 categorías con URLs amigables (`/proteinas`, `/creatina`, `/pre-entrenos`…), paginación abierta `?page=1..141` sin login. El árbol completo está en `/mapa del sitio`.
- `[V]` **52 marcas**; las 8 de nuestras landings están todas. **Quamtrax (~428 productos) y Amix (~228) concentran ~40% del catálogo** → los bloques de marca deben priorizarlas. Marcas fuertes que NO usamos: BSN, Weider, BiotechUSA.
- `[V]` **Ficha de producto sin login:** nombre, precio con IVA, stock, descripciones, sabores. Sin SKU visible → el matching landing↔ecommerce va por slug de URL.
- `[V]` **Fotos descargables en 5 tamaños** (`/{id}-{size}/{slug}.jpg`). ⚠️ `large_default` = 800×800, **437 KB** — una sola se come el 48% del presupuesto móvil. Partir de `home_default` (55 KB) y recomprimir a ≤40 KB.
- `[V]` **La central NO publica ofertas online** (prices-drop vacío, best-sales vacío, `/ofertas` 404) → **hueco: las landings pueden ser EL canal de promociones por tienda sin canibalizar nada.** Dato 27-ago del dueño: la central SÍ las produce (canal interno; el operador tiene acceso) — el hueco es aún mejor: contenido ya producido, publicable a coste ~0.
- `[V]` **El programa de socio NO existe publicado** en usafitness.es (cero menciones a socio/VIP/cumpleaños/funcionario) → **nuestra sección de socio será contenido único en el ecosistema.**
- `[V]` **Directorio de 58 tiendas** en páginas CMS (`/contentido/-usafitness-{slug}`): nombre del CC, dirección, horario, fijo, iframe de Maps. **Sin WhatsApp, sin fotos, sin reseñas** → listón bajísimo a batir + **seed data gratis para las ~50 altas** + pedir a la central backlink por tienda.
- `[V]` **Titular del ecommerce: GRUPO CORELAM, S.L. (B88404306)** → la cesión de fotos/textos se pide a ellos vía el operador.

## 2. El visitante local (lo que hace y busca, con fuentes)

- `[P]` Al llegar a la web de una tienda física en móvil buscan: **horario 54% · cómo llegar 53% · dirección 50%** (Google/Ipsos). → R1/R3 del método.
- `[P]` **50%** de búsquedas locales en móvil → visita en 24 h; **76%** de búsquedas "cerca de mí" → visita; ~28% acaba en compra (Think with Google). → La landing es el último paso antes de una visita inminente, no un catálogo.
- `[V-encuesta]` **Solo el 4% no lee reseñas**; 88% las consulta en Google (BrightLocal). → Las 5 tiendas sin reseñas son **el mayor agujero de conversión del proyecto**; toda landing lleva enlace «déjanos tu reseña» a su ficha.
- `[V-encuesta]` **80% pierde confianza con datos de contacto inconsistentes** (NAP). → Coherencia landing ↔ Google ↔ usafitness.es obligatoria (los teléfonos ya cuadran con el directorio central — verificado en muestra).
- `[V]` **53% abandona si tarda >3 s en móvil** (Google/SOASTA). → El presupuesto de 900 KB es decisión de conversión y entra en el pitch.
- `[V]` España: tráfico ~49% móvil general, pero la intención LOCAL se concentra en móvil. → Mobile-first en el flujo «ir a tienda»; desktop no despreciable para el flujo «investigar».

## 3. Mecanismos de conversión — veredictos (15 de 21 verificados)

| Mecanismo | Veredicto | Por qué (con la letra pequeña) |
|---|---|---|
| **Barra fija móvil** Llamar/WhatsApp/Cómo llegar | ✅ Recomendado | 70% de buscadores móviles usan click-to-call `[P]`; ya instrumentado; construida en Energía, se conserva |
| **WhatsApp `wa.me` con mensaje prellenado por tienda** | ✅ Recomendado | 91% de uso en España (IAB 2025) `[V]`; first-party, 0 KB `[V]`; el prellenado identifica la tienda |
| **Banner/bloque «oferta del mes»** inline | ✅ Recomendado | Formato explícitamente seguro para Google `[V]`; gestionable como dato por tienda; GNC lo hace por tienda `[V]` |
| **Barra de oferta pegajosa** (<15% viewport, cerrable) | ✅ Recomendado | Seguro si no cubre contenido `[V]`; estado en localStorage |
| **Pop-up promocional** | ⚠️ Con condiciones | Penalización de interstitials móvil desde 2017 (doc. oficial Google, vigente) `[V]`. **Jamás overlay de entrada.** Diferido a interacción, parcial, cerrable, con oferta concreta: conversión media 3-5% `[P]`, no prometer los 9% del top |
| **Exit-intent** | ❌ Desaconsejado v1 | En móvil no existe cursor: se simula con hacks que los propios vendors admiten `[V]`; nuestro tráfico es móvil |
| **Formulario de captación** | ⚠️ Fase posterior | RGPD: convierte al franquiciado en responsable del tratamiento con capa informativa obligatoria en el propio formulario (AEPD) `[V]`; 5/8 tiendas sin datos legales → R8. Antes: `company` completo por tienda |
| **Cupón «enséñalo en caja»** | ✅ Recomendado | Sin datos personales, sin tercero, medible (`ver_oferta`) y canjeable offline — el puente perfecto online→tienda |
| **Aviso «abierto ahora / cierra pronto»** | ✅ Recomendado | Responde LA pregunta nº1 (54%); cálculo en cliente sin terceros |

## 4. Competencia y productos vendibles (7 de 12 verificados)

- `[V]` **El patrón a copiar existe:** la página por-club de **Anytime Fitness España** (oferta del mes con fecha fin arriba + fotos reales + staff + formulario) y la página por-tienda de **GNC** (teléfono + horario + cómo llegar impecables; localizador con «promociones activas» por tienda).
- `[V]` **Basic-Fit** valida nuestro modelo exacto: plantilla única + datos por club, calidad por uniformidad.
- `[P]` **MASmusculo** (14 tiendas, la cadena española comparable) tiene fichas de tienda pobres. `[V]` **HSN no tiene tiendas propias**; Prozis vende por córners. → **Ninguno de los comparables revisados (MASmusculo [P], HSN, Prozis) hace bien la landing por tienda de suplementos: el hueco está abierto en todo lo revisado.**
- **Productos vendibles al franquiciado** (se integran en `memory/15-catalogo-servicios.md`):
  1. **Campaña del mes gestionada** — la central/operador diseña una vez, cada tienda opta; banner con fecha fin (modelo Anytime/GNC).
  2. **Página de oferta flash con cupón de tienda** — «enséñalo en caja», medible por evento.
  3. **Pre-alta de socio → WhatsApp de la tienda** — sin base de datos nuestra, el lead llega al canal del franquiciado (cuando tenga `company` y móvil).
  4. **Ficha de Google gestionada + máquina de reseñas** — ataca el mayor agujero (5/8 sin reseñas) con gestión mensual.

## 5. Lo que quedó sin verificar (honestidad del dossier)

Las cifras `[P]` de Think with Google circulan de forma consistente pero algunas fuentes originales son de 2016-2018 — direccionalmente sólidas, no citarlas con decimales. Los benchmarks de conversión de pop-ups son autoreportados por vendors (Wisepops/Sumo): usar el rango conservador 3-5% y nunca en promesa comercial. La estructura por-club de Anytime/GNC se verificó en clubs concretos, no en toda la red.
