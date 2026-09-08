/**
 * LA FAQ DE UNA TIENDA — solo preguntas que podemos responder de verdad
 *
 * La regla que la gobierna, y que se aplica sin excepción: **una pregunta sin
 * dato se omite ENTERA**. Nunca una respuesta a medias, nunca un «consúltanos»
 * disfrazado de respuesta. Una FAQ que no responde es peor que no tener FAQ,
 * porque gasta el scroll de alguien que venía con una duda concreta.
 *
 * DE DÓNDE SALE CADA RESPUESTA
 *
 * Ninguna es texto libre. Las cuatro se derivan de algo que ya existe: el
 * horario que ya valida el esquema, los ocho logos de marca que las ocho webs
 * ya publican, y las frases de «Hazte socio» y «Por qué en tienda» que ya están
 * escritas y sancionadas. Si mañana cambia el banco de textos de marca, cambia
 * aquí, y no hay dos versiones circulando.
 *
 * LO QUE NO ENTRA, Y POR QUÉ
 *
 *  · Nada de nutrición («¿qué proteína me va mejor?»). Es una alegación de
 *    salud sobre un alimento, y el Reglamento 1924/2006 aplica a la web de una
 *    tienda aunque no venda online. Los beneficios se predican de la TIENDA.
 *  · Nada de precios: decisión del dueño, ni siquiera en la forma «no
 *    publicamos precios», que sonaría a opacidad y no responde.
 *  · «¿Dónde estáis dentro del centro?» sería la más útil y hoy es imposible:
 *    `streetAddress` empieza literalmente por `mall` en las 8, así que la
 *    respuesta sería el propio nombre del centro otra vez. Necesita un campo de
 *    planta o zona que nadie ha rellenado.
 *  · Parking, medios de pago, envíos y devoluciones: 0 de 8. El dato no es
 *    nuestro —es del centro comercial o de la central— y se publicaría bajo el
 *    CIF del franquiciado.
 *  · El horario general y «¿estáis abiertos ahora?»: ya los responden el hero y
 *    Hoy en tienda en el primer scroll. Gastarían un hueco sin añadir nada.
 *
 * SIN DATOS ESTRUCTURADOS, A PROPÓSITO. Ver el comentario de `Faq.astro`.
 */

import { parseHorario } from './horario.ts';

/** Las ocho marcas que las ocho webs ya publican como logos (`Brands.astro`).
 *  La FAQ no nombra ni una marca que no esté ya en la misma página. */
export const MARCAS = [
  'Quamtrax',
  'Amix',
  'Applied Nutrition',
  'Optimum Nutrition',
  'Zoomad Labs',
  'Cellucor',
  'MuscleTech',
  'Nutrex',
];

export interface EntradaFaq {
  pregunta: string;
  respuesta: string;
}

/** Con menos de esto la sección no se pinta: tres respuestas son una FAQ, una es un hueco. */
export const MINIMO_ENTRADAS = 3;

interface TiendaFaq {
  schedule: string;
  whatsapp?: string;
  phoneDisplay: string;
}

export function faqDeTienda(store: TiendaFaq): EntradaFaq[] {
  const entradas: EntradaFaq[] = [];
  const franjas = parseHorario(store.schedule);
  const domingo = franjas.find((f) => f.dayOfWeek.includes('Sunday'));

  // 1. Domingos. Solo si el horario dice que se abre; si no, la pregunta NO
  //    existe. Escribir «no, los domingos no abrimos» sería deducir un cierre
  //    de la ausencia de una línea, y la ausencia puede ser un olvido.
  if (domingo) {
    const igualQueElResto = franjas.every((f) => f.opens === domingo.opens && f.closes === domingo.closes);
    entradas.push({
      pregunta: '¿Abrís los domingos?',
      respuesta: igualQueElResto
        ? `Sí. Los domingos abrimos de ${domingo.opens} a ${domingo.closes}, el mismo horario que el resto de la semana.`
        : `Sí, de ${domingo.opens} a ${domingo.closes}. Los domingos cerramos antes que el resto de la semana.`,
    });
  }

  // 2. La cita. La primera palabra ya responde.
  entradas.push({
    pregunta: '¿Hay que pedir cita?',
    respuesta:
      'No. Se pregunta en el mostrador, sin cita y sin avisar antes. Cuentas qué entrenas y te dicen qué te conviene.',
  });

  // 3. Marcas. Se nombran las mismas que ya se ven en logos, y se dice la
  //    verdad incómoda: en la estantería no cabe el catálogo entero.
  const cierre = store.whatsapp
    ? 'escríbenos antes por WhatsApp y te decimos si lo tenemos'
    : `llámanos al ${store.phoneDisplay} y te decimos si lo tenemos`;
  entradas.push({
    pregunta: '¿Qué marcas tenéis?',
    respuesta: `Trabajamos ${MARCAS.slice(0, -1).join(', ')} y ${MARCAS.at(-1)}, entre otras. En la estantería no cabe todo el catálogo: si vienes a por un producto concreto, ${cierre}.`,
  });

  // 4. Socio. Las cuatro ventajas, las mismas del banco y sin una sola cifra.
  entradas.push({
    pregunta: '¿Cómo me hago socio?',
    respuesta:
      'Se pide en caja al pagar y tarda dos minutos: no hay formulario que rellenar ni alta por internet. ' +
      'Incluye precio de socio, descuento para policía, bomberos y fuerzas de seguridad, un descuento el día ' +
      'de tu cumpleaños y, a partir de cierta compra, un cupón para la siguiente visita.',
  });

  return entradas;
}
