/**
 * LAS RUTAS DE «EMPIEZA AQUÍ» — el índice por objetivo, no por categoría
 *
 * Responde P6, la pregunta que nadie hace en voz alta: «no sé por dónde
 * empezar, y me da vergüenza preguntar». Convierte a N2 —un WhatsApp que llega
 * con el objetivo del cliente ya dicho— y de ahí a la visita.
 *
 * LO QUE ESTE FICHERO NO PUEDE HACER, Y ES LA REGLA QUE LO GOBIERNA
 *
 * No puede prometer un efecto. El Reglamento 1924/2006 se aplica a la web de
 * una tienda que no vende online —cubre la comunicación comercial, y el TJUE la
 * lee ancha (C-19/15)—, y quien responde es el franquiciado, bajo su CIF, con
 * multas de 5.001 a 20.000 € las graves (Ley 17/2011 arts. 44 y 52).
 *
 * De ahí la forma de cada ruta, que es la decisión del 6-sep aplicada:
 * **la etiqueta nombra el objetivo de LA PERSONA; las líneas de debajo listan
 * SURTIDO —categorías reales del catálogo— sin un solo conector causal.**
 * Nunca «proteínas para ganar músculo»: «GANAR MÚSCULO» arriba, «Proteínas»
 * abajo, y que la relación la haga quien lee, que es lo que hace de todas
 * formas al entrar por la puerta. `LEXICO_PROHIBIDO` lo sostiene con un test.
 *
 * DOS ETIQUETAS DEL DISEÑO NO SOBREVIVIERON, Y ESTÁN PENDIENTES DE FIRMA
 *
 *  · «ENERGÍA Y RESISTENCIA» pasa a «ENTRENO DE RESISTENCIA». Autocontrol
 *    calificó «máxima energía» y «máximo rendimiento» de declaraciones no
 *    autorizadas. Una modalidad de entrenamiento es un hecho sobre la persona;
 *    «energía» es un efecto sobre el cuerpo.
 *  · «CONTROL DE PESO» pasa a «CUIDAR LA ALIMENTACIÓN». No es una etiqueta
 *    desafortunada: es LITERALMENTE una de las categorías de declaración de
 *    salud que el reglamento nombra (art. 13.1.c). Escrita encima de una lista
 *    de complementos, la declaración la hacemos nosotros.
 *
 * Lo que se pierde con el cambio hay que decirlo: quien entra buscando perder
 * peso no encuentra aquí su ruta. Es coherente con el resto del sistema —el
 * consejo se da en el mostrador, y los beneficios se predican de la tienda—,
 * pero es una pérdida real, no un tecnicismo.
 *
 * SIN CIFRAS, A PROPÓSITO
 *
 * El catálogo extraído tiene contadores por categoría, y son tentadores. No
 * entran aquí: siete de esas puertas suman 2.588 sobre un catálogo de 1.683
 * porque «Mujer» y «Nutrición» engloban a las otras. Las cifras son de
 * «Productos y marcas», con puertas disjuntas, y allí se ganan la vida.
 *
 * NO ESTÁ LA RUTA «MUJER», Y NO ES UN OLVIDO
 *
 * Es un tercio del catálogo (557 de 1.683) y la única que el diseño quiere con
 * voz propia: la de Amanda Gil, entrenadora. Esa puerta —título documentado y
 * permiso de imagen— sigue cerrada. Una ruta «MUJER» que prometa voz y entregue
 * una lista de estantería es peor que no tenerla: le promete a un tercio del
 * catálogo una atención que no hay. Se omite entera, como la pregunta sin dato
 * de la FAQ.
 */

import { fechaEnMadrid } from './horario.ts';

export interface LineaDeRuta {
  /** El nombre EXACTO de una categoría del catálogo extraído. Un test lo
   *  comprueba contra `docs/product/catalogo-usafitness-2026-08.json`: aquí no
   *  se inventa una estantería que la tienda no tiene. */
  categoria: string;
  /**
   * Lo que se imprime. Existe porque el catálogo de la central escribe
   * «Proteinas» sin tilde y «Ganadores de Peso» con mayúscula en medio, y
   * publicar eso en ocho webs sería publicar su errata. La regla que impide
   * que esto se convierta en una puerta trasera: `muestra` y `categoria` tienen
   * que ser la MISMA palabra sin tildes ni mayúsculas, y hay un test que lo
   * comprueba. Se corrige la ortografía, nunca el surtido.
   */
  muestra: string;
  /** Qué es, dicho como se dice en el mostrador. Descripción, nunca efecto. */
  linea: string;
}

export interface Ruta {
  /** Viaja como parámetro `ruta` cuando se instrumente `punto_de_partida`. */
  id: string;
  /** El objetivo de la persona. Va en mayúsculas en el botón. */
  etiqueta: string;
  /** La línea del botón: surtido, separado por «·», sin verbos. */
  surtido: string;
  /** Las tres líneas del cartel de la ruta. */
  queMirar: LineaDeRuta[];
  /** El tercer eje: en qué viene. Formato, no efecto. */
  formato: string;
  /** Lo que el visitante manda por WhatsApp. Es la precalificación. */
  frase: string;
}

/**
 * Palabras que no pueden aparecer en ningún texto de ninguna ruta.
 *
 * Tres familias: el conector causal («para», el que convierte una lista en una
 * promesa), los verbos de resultado, y los dos nombres de categoría de
 * declaración de salud que el reglamento cita por su nombre.
 *
 * Ojo con lo que NO está prohibido y parece que debería: «geles energéticos»
 * es el nombre comercial de una estantería, no una promesa. Se prohíbe
 * «energía» como efecto, no el adjetivo de un producto que se llama así.
 */
export const LEXICO_PROHIBIDO = [
  'para ',
  'ayuda',
  'mejora',
  'aumenta',
  'favorece',
  'contribuye',
  'quema',
  'reduce',
  'adelgaz',
  'rendimiento',
  'recupera',
  'metabolismo',
  'salud',
  'control de peso',
  'energía y resistencia',
];

/** Las cuatro de todo el año. El orden es el del volumen de la estantería. */
const RUTAS_FIJAS: Ruta[] = [
  {
    id: 'musculo',
    etiqueta: 'Ganar músculo',
    surtido: 'Proteínas · Creatina · Ganadores de peso',
    queMirar: [
      { categoria: 'Proteinas', muestra: 'Proteínas', linea: 'whey, isolada, caseína y vegana' },
      { categoria: 'Creatina', muestra: 'Creatina', linea: 'monohidrato y kre-alkalina' },
      { categoria: 'Ganadores de Peso', muestra: 'Ganadores de peso', linea: 'el bote grande, con hidratos' },
    ],
    formato: 'En polvo, en barrita o vegano.',
    frase: 'Vengo a ganar músculo.',
  },
  {
    id: 'resistencia',
    etiqueta: 'Entreno de resistencia',
    surtido: 'Carbohidratos · Isotónicas · Geles',
    queMirar: [
      { categoria: 'Carbohidratos', muestra: 'Carbohidratos', linea: 'amilopectina, ciclodextrina y vitargo' },
      { categoria: 'Bebidas Isotónicas', muestra: 'Bebidas isotónicas', linea: 'el bidón del entreno largo' },
      { categoria: 'Geles Energéticos', muestra: 'Geles energéticos', linea: 'el formato de bolsillo' },
    ],
    formato: 'En polvo, en gel o en barrita.',
    frase: 'Entreno resistencia.',
  },
  {
    id: 'alimentacion',
    etiqueta: 'Cuidar la alimentación',
    surtido: 'Alimentos fitness · Barritas · Harinas',
    queMirar: [
      { categoria: 'Alimentos Fitness y Gourmet', muestra: 'Alimentos fitness y gourmet', linea: 'salsas, cremas y snacks' },
      { categoria: 'Barritas de Proteína', muestra: 'Barritas de proteína', linea: 'el formato que se lleva encima' },
      { categoria: 'Harinas y salvados', muestra: 'Harinas y salvados', linea: 'lo de cocinar en casa' },
    ],
    formato: 'En polvo, en barrita o ya hecho.',
    frase: 'Quiero cuidar la alimentación.',
  },
  {
    id: 'cero',
    etiqueta: 'Empiezo de cero',
    surtido: 'Proteínas · Multivitamínico · Creatina',
    queMirar: [
      { categoria: 'Proteinas', muestra: 'Proteínas', linea: 'el bote de siempre' },
      { categoria: 'Multivitamínico', muestra: 'Multivitamínico', linea: 'el complemento de diario' },
      { categoria: 'Creatina', muestra: 'Creatina', linea: 'monohidrato, el de toda la vida' },
    ],
    formato: 'En polvo, en cápsulas o en barrita.',
    frase: 'Empiezo de cero.',
  },
];

/**
 * La ruta de regalo. El diseño decía que SUSTITUYE a «Empiezo de cero» entre
 * el 15-nov y el 6-ene; se AÑADE en vez de sustituir, y el motivo es de bulto:
 * «Empiezo de cero» es la única ruta que responde literalmente la pregunta que
 * da nombre a la sección. Quitarla en Navidad —seis semanas de tráfico de
 * gente que no sabe de esto— es quitarla justo cuando más falta hace.
 */
const RUTA_REGALO: Ruta = {
  id: 'regalo',
  etiqueta: 'Vengo a regalar',
  surtido: 'Shaker · Mochilas · Ropa',
  queMirar: [
    { categoria: 'Mezcladores', muestra: 'Mezcladores', linea: 'el shaker, que siempre falta' },
    { categoria: 'Mochilas y Neveras', muestra: 'Mochilas y neveras', linea: 'el táper del gimnasio' },
    { categoria: 'Ropa', muestra: 'Ropa', linea: 'sudaderas, tops y leggings' },
  ],
  formato: 'Un bote, ropa o accesorios.',
  frase: 'Vengo a regalar.',
};

/**
 * ¿Cae la fecha dentro de la temporada de regalo? Del 15 de noviembre al 6 de
 * enero, los dos incluidos.
 *
 * Se calcula sobre la fecha EN MADRID, no sobre la del servidor, que corre en
 * UTC: el 6 de enero a las 00:30 en Madrid es todavía el 5 en UTC, y la ruta
 * desaparecería un día antes en la única noche en que eso importa.
 */
export function esTemporadaDeRegalo(ahora: Date): boolean {
  const [, mes, dia] = fechaEnMadrid(ahora).split('-').map(Number);
  if (mes === 11) return dia >= 15;
  if (mes === 12) return true;
  if (mes === 1) return dia <= 6;
  return false;
}

/** Las rutas que se pintan hoy. Cuatro casi todo el año, cinco en Navidad. */
export function rutasDeHoy(ahora: Date): Ruta[] {
  return esTemporadaDeRegalo(ahora) ? [...RUTAS_FIJAS, RUTA_REGALO] : [...RUTAS_FIJAS];
}

/**
 * El mensaje que el visitante manda. ES la conversión: el franquiciado abre
 * WhatsApp y ya sabe a qué viene quien escribe, sin preguntar nada.
 *
 * NO lleva el nombre de la tienda, y la primera versión sí lo llevaba. Con el
 * rótulo salía «Hola, os escribo desde la web de VILLANUEVA», gritado: el
 * rótulo está hecho para un cartel, no para una frase. Y el nombre no aportaba
 * nada, porque el mensaje ya va al número de esa tienda y de ninguna otra.
 *
 * Lo que sí aporta —y por eso se queda— es «desde vuestra web»: es la única
 * atribución que el franquiciado va a ver nunca sin abrir un informe.
 */
export function mensajeDeRuta(ruta: Ruta): string {
  return `Hola, os escribo desde vuestra web. ${ruta.frase} ¿Qué me aconsejáis mirar?`;
}

/** Todo el texto de una ruta, para que el test del léxico no se deje ninguno. */
export function textosDeRuta(ruta: Ruta): string[] {
  return [
    ruta.etiqueta,
    ruta.surtido,
    ruta.formato,
    ruta.frase,
    ...ruta.queMirar.flatMap((q) => [q.categoria, q.muestra, q.linea]),
  ];
}
