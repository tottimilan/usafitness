# El Norte — qué es este proyecto y qué es lo más importante

**Fecha:** 2026-08-27 · **Fuente:** el dueño del proyecto, literal: *«lo más importante es vender esto a más tiendas, y tenemos que hacer un producto bueno, moderno, defendible, bien explicado, que se vea que sabemos qué hacemos y por qué y cómo vamos a mejorar su tienda.»*
**Este documento manda sobre los demás.** Si un plan, una plantilla o una sesión contradicen el norte, lo que se corrige no es el norte.

---

## 1. Qué es este proyecto, en una frase

**Un producto que se vende tienda a tienda a ~50 franquiciados de USA Fitness: una web que convierte búsqueda local en visitas a SU tienda, con mejoras medibles que justifican pagarla cada mes.**

No es «hacer webs». Es un producto comercial con dos clientes encadenados:

| Cliente | Qué compra | Qué le demuestra que funciona |
|---|---|---|
| **El franquiciado** (paga) | Presencia digital profesional + más gente entrando por la puerta | Informe simple: llamadas, WhatsApps, rutas a tienda, ofertas vistas — eventos que ya instrumentamos |
| **El visitante** (convierte) | Respuesta rápida: qué hay, qué gano, si está abierto, cómo llegar | Que la web se lo dé en segundos, en móvil |

## 2. Lo más importante, ordenado

1. **Vender a más tiendas.** Todo lo demás es instrumento de esto. Una mejora técnica que no ayuda a vender o a retener a un franquiciado es secundaria por definición.
2. **Producto defendible.** Cada pieza tiene un porqué que se puede explicar a un franquiciado en una frase («este bloque existe porque el 54% de la gente que llega busca tu horario» — con fuente). Sin porqué, no hay pieza.
3. **Producto moderno.** El listón no es «mejor que WordPress»: es que un franquiciado vea su landing junto a la de su competencia y quiera la nuestra. Dos plantillas rechazadas nos enseñaron que esto no sale de reestilizar; sale del método (`docs/metodologia/creacion-de-webs.md`).
4. **Producto medible.** El pitch es «sé cuánta gente te trajo la web este mes». Sin GA4 vivo no hay pitch — por eso la medición no es tarea técnica pendiente, es requisito comercial.

## 3. La tesis del producto (validada por la investigación 2026-08)

**Convertimos intención local en visita física.** Los datos que la sostienen (fuentes en `docs/product/investigacion-conversion-2026-08.md`):

- El **50%** de quienes buscan en local desde el móvil visitan una tienda en 24 h; el **76%** de búsquedas «cerca de mí» acaban en visita. La landing no es un catálogo: es el último paso antes de una visita que ocurre en horas.
- Lo más buscado al llegar a la web de una tienda física: **horario (54%), cómo llegar (53%), dirección (50%)**. El primer viewport se diseña para eso.
- **No competimos con el ecommerce de la central ni con Amazon**: vendemos inmediatez (lo tienes hoy), asesoramiento presencial, y el programa de socio que se activa en tienda.

**Y tres huecos estratégicos que la investigación encontró y nadie está ocupando:**

1. **La central no publica ofertas online** (su sección de ofertas está vacía — verificado). Nuestras landings pueden ser EL canal de promociones de cada tienda sin canibalizar nada. Argumento de venta directo.
2. **El programa de socio no está publicado en ningún sitio** del ecosistema USA Fitness (verificado: cero menciones en usafitness.es). Nuestra sección de socio será contenido único — pieza central del pitch.
3. **La página oficial de cada tienda en usafitness.es es pobrísima** (dirección + fijo + iframe; sin WhatsApp, sin fotos, sin reseñas — verificado sobre las 58). El listón a batir es bajísimo y además son **seed data gratis** para las ~50 altas. Pedir a la central un backlink desde cada una a su landing.

## 4. Qué significa «defendible» — el estándar de cada entrega

Nace de dos plantillas rechazadas. Una pieza es defendible cuando:

1. **Tiene objetivo escrito antes de construirse** (qué pregunta del visitante responde, a qué conversión sirve, qué evento emite).
2. **Su forma tiene procedencia** (referencia capturada, o dato que la justifica — no gusto sin origen).
3. **Ha sido VISTA** en captura, escritorio y móvil, con los datos de la mejor tienda y de la peor (lagoh), antes de enseñarse.
4. **Se puede explicar al comprador en una frase.** Si necesito un párrafo para justificarla, está mal.

## 5. Lo que este proyecto NO es

- No es un ecommerce (el canal de venta online es de la central, Grupo Corelam S.L.).
- No es SaaS con panel: el operador configura; el franquiciado decide y paga.
- No es una web bonita por tienda: es **un sistema** — plantillas de verdad distintas, secciones con objetivo, alta automatizable, medición de serie.
- No es urgente: *«no hay ninguna prisa»* (dueño, 2026-08-27). Se cierra por criterio, no por calendario.

## 6. El mapa documental (dónde está cada cosa)

| Pregunta | Documento |
|---|---|
| ¿Qué es el proyecto y qué manda? | **este documento** |
| ¿Cómo se construye una web/sección/plantilla? | `docs/metodologia/creacion-de-webs.md` |
| ¿Por qué existe el método? (los dos rechazos, desgranados) | `docs/product/metodo-plantillas-y-conversion.md` |
| ¿Qué evidencia sostiene las decisiones de conversión? | `docs/product/investigacion-conversion-2026-08.md` |
| ¿Qué se le vende al franquiciado? | `memory/15-catalogo-servicios.md` (+ productos nuevos de la investigación) |
| ¿Dónde está el proyecto AHORA y qué queda? | `memory/02-current-state.md` + backlog en `memory/06` §0-bis |
| ¿Cómo trabaja y se autoevalúa el agente? | `memory/16-protocolo-agente.md` |
| Escala real y modelo de negocio | `docs/product/escala-real.md` + `memory/00` |
