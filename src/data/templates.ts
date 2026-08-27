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
