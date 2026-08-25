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
};

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
 * Un id desconocido se ignora en silencio: un error de tecleo en un JSON no
 * puede tumbar la web de un cliente que está en producción.
 */
export function resolveSections(
  template: Template,
  override?: SectionRef[] | null
): { id: SectionId; variant?: string }[] {
  const validas = new Set<string>(ORDEN_BASE.map((r) => normalizeRef(r).id));
  const limpiar = (refs: SectionRef[]) =>
    refs.map(normalizeRef).filter((r) => validas.has(r.id));

  if (Array.isArray(override) && override.length > 0) {
    const filtradas = limpiar(override);
    if (filtradas.length > 0) return filtradas;
  }
  return limpiar(template.sections);
}
