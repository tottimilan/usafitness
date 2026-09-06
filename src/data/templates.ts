/**
 * CATÁLOGO DE PLANTILLAS
 *
 * Una plantilla declara tres cosas y ninguna es código:
 *   - `tokens`   : sobrescrituras de las custom properties de global.css
 *   - `sections` : qué secciones trae y EN QUÉ ORDEN (la propuesta por defecto)
 *   - `label`    : el nombre con el que se le enseña al dueño de la tienda
 *
 * Añadir una plantilla nueva debe ser barato: si exige tocar un componente,
 * el diseño está mal. Ver `memory/01-product-vision.md`.
 *
 * El orden que propone la plantilla lo puede ajustar una tienda concreta con
 * su campo `sections` en stores.json — la plantilla propone, la tienda ajusta.
 */

import { CSS_ENERGIA } from './plantilla-energia-css.ts';

/** Las secciones que existen. Es un array y no solo un tipo porque el esquema
 *  de `stores.json` necesita la lista EN TIEMPO DE EJECUCIÓN para rechazar un
 *  id inventado; si fueran dos listas separadas acabarían desincronizadas. */
export const SECTION_IDS = [
  'hero',
  'promotions',
  'location',
  'gallery',
  'reviews',
  'products',
  'brands',
  'schedule',
  'social',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Una sección en una plantilla es su id, o el id con una variante.
 *  La VARIANTE es el tercer eje de diferenciación: el mismo Hero puede verse
 *  distinto en dos plantillas sin duplicar el componente. */
export type SectionRef = SectionId | { id: SectionId; variant?: string };

/**
 * Lo que una tienda puede pedir que se vea primero. UNA sola elección, tecleada
 * por el operador en la sesión de alta a partir de una pregunta: «¿qué quieres
 * que vea primero quien te busca?».
 *
 * Son cuatro y no más a propósito. El dueño pidió que no todas las tiendas
 * siguieran el mismo orden, y la alternativa —dejar que cada tienda ordene sus
 * secciones— son cientos de miles de órdenes posibles por plantilla, imposibles
 * de diseñar y de probar, y con la puerta abierta a sacar el horario del primer
 * scroll. Aquí la tienda mueve una cosa y el sistema garantiza el resto.
 */
export const PRIORIDADES = ['visita', 'oferta', 'socio', 'asesoramiento'] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

/**
 * El único hueco del orden que la tienda gobierna.
 *
 * `posicion` es el índice que la tienda puede cambiar, `defecto` quién lo ocupa
 * si no elige, y `mapa` qué bloque sube por cada prioridad. El bloque desplazado
 * baja al hueco que deja el que sube: es un INTERCAMBIO, así que el número de
 * secciones no cambia, ninguna se cuela y ninguna desaparece.
 *
 * Lo que esto NO puede tocar, por construcción: la periferia, el primer
 * viewport y las posiciones protegidas por R1-R3. Por eso la plantilla decide
 * el mapa y `posicion` nunca es 0.
 */
export interface ZonaMovil {
  posicion: number;
  defecto: SectionId;
  mapa: Partial<Record<Prioridad, SectionId>>;
}

export interface Template {
  id: string;
  label: string;
  /** Sobrescrituras de tokens. Se emiten como CSS bajo html[data-plantilla]. */
  tokens: Record<string, string>;
  /** Orden por defecto de las secciones componibles, con su variante. */
  sections: SectionRef[];
  /**
   * Hoja CSS propia de la plantilla, ya prefijada con `html[data-plantilla]`.
   * Viaja inline en el <head> SOLO en las páginas que usan la plantilla: en
   * `global.css` pesaría para las 50 tiendas. Es la extensión que separa una
   * plantilla de verdad de un cambio de pintura — los tokens solos no pueden
   * cambiar composición, tipografía ni movimiento, y eso es exactamente lo
   * que el ojo usa para decidir si dos webs son distintas.
   */
  css?: string;
  /** Ficheros de fuente propios, para el <link rel="preload"> de Base.astro. */
  fonts?: string[];
  /**
   * Variantes para las piezas FIJAS de la página (header, footer, contacto).
   * Siguen fijas —un error de configuración no puede dejar una landing sin
   * aviso de cookies ni enlaces legales—, pero una plantilla puede pedirles
   * otra cara. Sin declarar nada, la cara de siempre: ninguna web viva cambia.
   */
  periferia?: { header?: string; footer?: string; contacto?: string };
  /**
   * El hueco que la tienda gobierna con su `prioridad`. Sin esto, la plantilla
   * no admite prioridad y su orden manda siempre — que es lo que pasa hoy en
   * las tres vivas.
   */
  zonaMovil?: ZonaMovil;
}

/** Normaliza el atajo string a la forma canónica. Un solo punto de entrada
 *  para que no circulen dos formas por el resto del código. */
export function normalizeRef(ref: SectionRef): { id: SectionId; variant?: string } {
  return typeof ref === 'string' ? { id: ref } : ref;
}

/** Orden histórico de la landing. Es la referencia: `clasica` debe emitir
 *  exactamente esto para que adoptar el sistema no cambie ninguna web viva. */
export const ORDEN_BASE: SectionRef[] = [
  'hero',
  'promotions',
  'location',
  'gallery',
  'reviews',
  'products',
  'brands',
  'schedule',
  'social',
];

export const TEMPLATES: Record<string, Template> = {
  clasica: {
    id: 'clasica',
    label: 'Clásica',
    // Sin sobrescrituras: usa los tokens de :root tal cual.
    tokens: {},
    sections: ORDEN_BASE,
  },

  angular: {
    id: 'angular',
    label: 'Angular',
    // Misma paleta —es la marca—; cambian forma, densidad, foto y tipografía.
    tokens: {
      '--radius': '0px',
      '--radius-sm': '0px',
      '--radius-xs': '0px',
      '--radius-btn': '0px',
      '--shadow-card': 'none',
      '--shadow-card-hover': 'none',
      '--shadow-media': 'none',
      '--shadow-panel': 'none',
      '--section-padding': '3rem 1.5rem',
      '--hero-overlay': 'rgba(255, 255, 255, 0.62)',
      '--diagonal-size': '3rem',
      '--font-weight-heading': '800',
    },
    // Narrativa distinta: la prueba social sube por delante del surtido.
    sections: [
      { id: 'hero', variant: 'compacto' },   // hero más bajo, texto a la izquierda
      'promotions',
      { id: 'gallery', variant: 'destacada' }, // primera foto a todo el ancho
      'reviews',
      'location',
      'products',
      'brands',
      'schedule',
      'social',
    ],
  },

  energia: {
    id: 'energia',
    label: 'Energía',
    // La web como cartel de sala de entrenamiento. Ganadora del panel de
    // diseño del 2026-08-26 (9/8/7 sobre 10 en venta/obra/marca): la ciudad en
    // condensada gigante, promos desfilando en banda roja, el horario como
    // marcador. Es la plantilla que no depende de que las fotos sean buenas.
    tokens: {
      '--radius': '0px',
      '--radius-sm': '0px',
      '--radius-xs': '0px',
      '--radius-btn': '0px',
      '--shadow-card': 'none',
      '--shadow-card-hover': 'none',
      '--shadow-media': 'none',
      '--font-weight-heading': '800',
    },
    css: CSS_ENERGIA,
    fonts: ['/fonts/barlow-condensed-700-latin.woff2', '/fonts/barlow-condensed-800-latin.woff2'],
    periferia: {
      header: 'cinta-de-marca',
      footer: 'megafooter-diagonal',
      contacto: 'barra-accion-movil',
    },
    // La narrativa del cartel: identidad → oferta → prueba visual → surtido →
    // marcas → prueba social → dónde → cuándo → síguenos. La superficie
    // alterna azul/rojo/blanco/noche para que el scroll tenga ritmo; la
    // asignación va POR SECCIÓN en la hoja, así que una sección ausente no
    // rompe la alternancia.
    sections: [
      { id: 'hero', variant: 'cartel' },
      { id: 'promotions', variant: 'marquesina' },
      { id: 'gallery', variant: 'tira' },
      { id: 'products', variant: 'pizarra' },
      // Brands YA es una marquesina con pista duplicada: la hoja solo la
      // reestiliza (logos en gris, sobre blanco). No hace falta variante.
      'brands',
      'reviews',
      'location',
      { id: 'schedule', variant: 'billboard' },
      { id: 'social', variant: 'compacta' },
    ],
  },
};

/**
 * Los ids que una plantilla declara y que NO existen en el vocabulario.
 *
 * Existe porque el filtro de `resolveSections` es deliberadamente tolerante, y
 * esa tolerancia solo tiene sentido para el JSON del cliente. Una plantilla la
 * escribimos nosotros: si nombra una sección que no existe, no queremos que se
 * publique con una sección menos y sin un solo error — queremos que reviente
 * el build. TypeScript ya lo impide al compilar, pero el build lo comprueba
 * igualmente porque `stores.json` y las previsualizaciones entran por caminos
 * que no pasan por el compilador.
 */
export function seccionesInvalidas(t: Template): string[] {
  const validas = new Set<string>(SECTION_IDS);
  return t.sections.map((r) => normalizeRef(r).id).filter((id) => !validas.has(id));
}

/** Todas las plantillas con alguna sección inventada. Vacío = todo en orden. */
export function plantillasConSeccionesInvalidas(
  plantillas: Record<string, Template> = TEMPLATES
): { plantilla: string; desconocidas: string[] }[] {
  return Object.values(plantillas)
    .map((t) => ({ plantilla: t.id, desconocidas: seccionesInvalidas(t) }))
    .filter((x) => x.desconocidas.length > 0);
}

export const PLANTILLA_POR_DEFECTO = 'clasica';

export function getTemplate(id?: string): Template {
  return TEMPLATES[id ?? ''] ?? TEMPLATES[PLANTILLA_POR_DEFECTO];
}

/** Convierte los tokens de una plantilla en una regla CSS.
 *  El selector es `html[data-plantilla]` (especificidad 0,1,1) y no `:root`
 *  (0,1,0): así gana a global.css de forma determinista, sin depender del
 *  orden en que Astro inyecte el CSS del bundle. */
export function tokensToCss(t: Template): string {
  const pares = Object.entries(t.tokens);
  if (pares.length === 0) return '';
  const cuerpo = pares.map(([k, v]) => `${k}:${v}`).join(';');
  return `html[data-plantilla="${t.id}"]{${cuerpo}}`;
}

/**
 * Resuelve qué secciones se pintan y en qué orden.
 *
 * 1. Sin `template` ni `sections` → plantilla por defecto y orden base.
 *    Es el caso de TODAS las tiendas hoy, y debe producir la salida de siempre.
 * 2. Con `template` → el orden que propone esa plantilla.
 * 3. Con `sections` → manda ese array. Es la excepción por tienda.
 *
 * Un id desconocido EN `override` se ignora en silencio: ese array viene de
 * `stores.json`, y un error de tecleo en el fichero de un cliente no puede
 * tumbar su web en producción. Lo que SÍ tumba el build es un id desconocido
 * en la plantilla, porque eso lo escribimos nosotros — ver `seccionesInvalidas`.
 *
 * El filtro se hace contra SECTION_IDS, el vocabulario completo, y no contra
 * ORDEN_BASE, que es solo el orden histórico de nueve secciones. Estuvo mal
 * desde el principio y no se notaba porque ambas listas coincidían: en cuanto
 * el vocabulario crece, una sección nueva y perfectamente válida se caía aquí
 * SIN DECIR NADA, y la plantilla se publicaba con las secciones de siempre y
 * la pintura nueva. Que es, literalmente, el fallo por el que se rechazaron
 * dos plantillas.
 */
export function resolveSections(
  template: Template,
  override?: SectionRef[] | null
): { id: SectionId; variant?: string }[] {
  const validas = new Set<string>(SECTION_IDS);
  const limpiar = (refs: SectionRef[]) =>
    refs.map(normalizeRef).filter((r) => validas.has(r.id));

  if (Array.isArray(override) && override.length > 0) {
    const filtradas = limpiar(override);
    if (filtradas.length > 0) return filtradas;
  }
  return limpiar(template.sections);
}

/**
 * El orden final: el de `resolveSections` más el intercambio de la zona móvil.
 *
 * `tieneDato` lo inyecta quien llame —la página se lo pasa desde el registro de
 * secciones— porque este módulo NO puede importar el registro: el registro
 * importa los componentes `.astro`, y `templates.ts` tiene que cargar también
 * en `node --test` y dentro de `astro:config:setup`. Es la misma restricción de
 * tres cargadores que ya obligó a inyectar los lectores en `presupuesto.ts`.
 *
 * Sin `prioridad` o sin `zonaMovil` devuelve exactamente lo de siempre: por eso
 * esta función puede sustituir a `resolveSections` en la página sin cambiar una
 * sola de las ocho webs vivas.
 */
export function ordenDeSecciones(
  template: Template,
  store: { sections?: SectionRef[] | null; prioridad?: Prioridad },
  tieneDato: (id: SectionId) => boolean = () => true
): { id: SectionId; variant?: string }[] {
  const orden = resolveSections(template, store.sections);
  const zona = template.zonaMovil;
  if (!zona || !store.prioridad) return orden;

  const elegido = zona.mapa[store.prioridad];
  // Sin dato que enseñar se queda el ocupante por defecto. Hoy es el caso
  // normal y no el raro: las ocho tiendas están sin oferta viva, así que
  // prometer que «oferta» mueve algo sería mentir en la sesión de alta.
  if (!elegido || !tieneDato(elegido)) return orden;

  const destino = zona.posicion;
  const origen = orden.findIndex((s) => s.id === elegido);
  // Si el bloque elegido no está en el orden (lo quitó un `visible`) o la
  // posición no existe, no hay nada que intercambiar. El caso «ya ocupa el
  // hueco» no necesita guarda: intercambiar un elemento consigo mismo no hace
  // nada, y probé a añadirla — la mutación sobrevivía, o sea que era código
  // muerto pidiendo mantenimiento.
  if (origen < 0 || destino < 0 || destino >= orden.length) return orden;

  // INTERCAMBIO, no inserción. Con una inserción el bloque desplazado y todos
  // los de en medio bajarían un puesto, y una prioridad acabaría reordenando
  // media página en vez de mover una cosa. Con el intercambio, exactamente dos
  // posiciones cambian pase lo que pase.
  const copia = [...orden];
  [copia[destino], copia[origen]] = [copia[origen], copia[destino]];
  return copia;
}

/**
 * El aviso de build cuando la prioridad elegida no tiene dato que enseñar.
 *
 * No es un error: la prioridad la elige el franquiciado y el dato depende de
 * que la central publique una oferta o de que lleguen los textos. Pero tiene
 * que VERSE, porque si no, una tienda pide abrir por la oferta y abre por otra
 * cosa sin que nadie se entere.
 */
export function avisoDePrioridad(
  template: Template,
  store: { slug: string; prioridad?: Prioridad },
  tieneDato: (id: SectionId) => boolean
): string | null {
  const zona = template.zonaMovil;
  if (!zona || !store.prioridad) return null;
  const elegido = zona.mapa[store.prioridad];
  if (!elegido) {
    return `${store.slug}: la plantilla «${template.id}» no sabe qué hacer con prioridad "${store.prioridad}"`;
  }
  if (!tieneDato(elegido)) {
    return `${store.slug}: prioridad "${store.prioridad}" sin dato (${elegido}) → se queda ${zona.defecto}`;
  }
  return null;
}
