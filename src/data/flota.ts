/**
 * ESTADO DE LA FLOTA
 *
 * Responde una sola pregunta, la que más veces se hace durante una migración:
 * **¿qué sirve de verdad cada dominio ahora mismo?**
 *
 * POR QUÉ EXISTE
 *
 * El 2026-08-26 se descubrieron dos problemas de producción a mano, con `curl`,
 * mientras se revisaba otra cosa:
 *
 *  1. `usafitnesslasrosas.com` no resolvía DNS. La web de un cliente llevaba
 *     horas inalcanzable y no lo dijo nada.
 *  2. `usafitnesslagoh.com` devolvía 200 alegremente… sirviendo el WordPress
 *     anterior. El código de esa tienda estaba fusionado y desplegado; lo que
 *     faltaba era el registro DNS. Un monitor que solo mire el código HTTP da
 *     esa tienda por buena: 200 es 200.
 *
 * Los dos fallos comparten forma: **el dominio contesta algo, pero no lo
 * nuestro** — o no contesta nadie. Ninguno es visible desde dentro del
 * servidor, así que ningún test de la suite podía cazarlos.
 *
 * LA SONDA ES `/health`, NO LA PORTADA
 *
 * Mirar si la portada contiene `/_astro/` funcionaría, pero `/health` responde
 * además la pregunta que de verdad importa: `tienda` dice *quién cree el
 * servidor que es en este host*. Eso distingue tres cosas que un ping mezcla:
 * Railway caído, DNS sin cambiar, y enrutado roto (el caso peor: 200, contenido
 * nuestro, y la tienda equivocada — una sociedad sirviendo el NIF de otra).
 *
 * Este módulo es PURO: recibe una sonda ya hecha y la clasifica. La red vive en
 * `scripts/estado-flota.mjs`. Así la clasificación —que es donde están las
 * decisiones— se prueba sin tocar internet ni depender de que un dominio de un
 * cliente esté vivo mientras corre la suite.
 */

/** Lo que el sondeo observó de un dominio. Sin interpretar. */
export interface Sonda {
  slug: string;
  dominio: string;
  /** `false` cuando el nombre no resuelve. Entonces `codigo` y `cuerpo` son null. */
  resuelveDns: boolean;
  /** Código HTTP, o `null` si no llegó a haber respuesta. */
  codigo: number | null;
  /** Cuerpo crudo de `/health`. Puede no ser JSON: eso es justamente un dato. */
  cuerpo: string | null;
  /**
   * Cuerpo de la portada, y `null` si no se sondeó.
   *
   * Existe porque el 404 que devuelve `/health` en un WordPress NO lleva las
   * huellas de WordPress — comprobado contra usafitnesslagoh.com y
   * usafitnessvillanueva.com el 2026-08-26. La huella está en la portada. Solo
   * se sondea cuando la primera respuesta no es nuestra: es una petición extra
   * únicamente para los dominios que ya sabemos que van mal.
   */
  cuerpoPortada?: string | null;
}

export type Estado =
  /** Sirve nuestro código y se identifica como la tienda correcta. */
  | 'servida'
  /** El nombre no resuelve. No hay web, ni siquiera la anterior. */
  | 'sin-dns'
  /** Contesta, pero no es nuestro sistema. El DNS apunta a otro sitio. */
  | 'otro-sistema'
  /** Es nuestro, pero se identifica como otra tienda (o como ninguna). */
  | 'enrutado-roto'
  /** Es nuestro y admite que su tabla de dominios está incoherente (503). */
  | 'degradada'
  /** Resuelve pero no hubo respuesta, o la respuesta no encaja en nada. */
  | 'sin-clasificar';

export interface Diagnostico {
  slug: string;
  dominio: string;
  estado: Estado;
  /** Frase para un humano. Dice qué pasa y, cuando se sabe, qué hacer. */
  detalle: string;
  /** SHA desplegado, solo cuando la respuesta era nuestra. */
  sha: string | null;
}

/** Los estados que exigen que alguien haga algo. */
const PROBLEMAS: readonly Estado[] = ['sin-dns', 'otro-sistema', 'enrutado-roto', 'degradada', 'sin-clasificar'];

export function esProblema(estado: Estado): boolean {
  return PROBLEMAS.includes(estado);
}

/**
 * Huellas de sistemas que NO son el nuestro, para poder decir qué hay ahí en
 * vez de un genérico "no es lo nuestro". Saber que sigue el WordPress anterior
 * es accionable —hay que cambiar el DNS—; "desconocido" no lo es.
 */
const HUELLAS: ReadonlyArray<readonly [RegExp, string]> = [
  // `/wp-` y no `wp-content`: medido contra usafitnessvillanueva.com, su primer
  // `wp-content` está en el byte 13036 — fuera del corte de 4000 del sondeo. En
  // los primeros 4000 solo aparece `/wp-` (de `/wp-json/`), y aparece también
  // en usafitnesslagoh.com. Un falso positivo aquí solo equivocaría el NOMBRE
  // del sistema ajeno: esta tabla únicamente se consulta cuando ya se sabe que
  // la respuesta no es nuestra.
  [/\/wp-|wp-(singular|content|includes)/, 'WordPress'],
  [/\/_next\//, 'Next.js'],
  [/Shopify\.theme|cdn\.shopify\.com/, 'Shopify'],
  [/wix\.com|wixstatic/, 'Wix'],
];

/** `null` cuando no se reconoce nada: quien llama decide cómo redactarlo. */
function queSistemaEs(sonda: Sonda): string | null {
  for (const texto of [sonda.cuerpoPortada, sonda.cuerpo]) {
    if (!texto) continue;
    for (const [patron, nombre] of HUELLAS) if (patron.test(texto)) return nombre;
  }
  return null;
}

/**
 * `/health` en cualquier host nuestro devuelve SIEMPRE las mismas claves con
 * los mismos tipos —está documentado en `src/pages/health.ts` y es lo que
 * permite reconocerlo sin ambigüedad—. Se comprueban las claves estructurales,
 * no los valores: `tienda` es null en un host genérico y eso sigue siendo
 * nuestro.
 */
function respuestaNuestra(cuerpo: string | null): { ok: boolean; tienda: string | null; sha: string | null } | null {
  if (!cuerpo) return null;
  let j: unknown;
  try {
    j = JSON.parse(cuerpo);
  } catch {
    return null;
  }
  if (typeof j !== 'object' || j === null) return null;
  const o = j as Record<string, unknown>;
  // `tiendas` y `dominios` son los que la hacen inconfundible: ningún panel de
  // hosting ni ninguna página de error devuelve ese par.
  if (typeof o.ok !== 'boolean' || typeof o.tiendas !== 'number' || typeof o.dominios !== 'number') return null;
  return {
    ok: o.ok,
    tienda: typeof o.tienda === 'string' ? o.tienda : null,
    sha: typeof o.sha === 'string' ? o.sha : null,
  };
}

export function clasificar(sonda: Sonda): Diagnostico {
  const base = { slug: sonda.slug, dominio: sonda.dominio, sha: null as string | null };

  if (!sonda.resuelveDns) {
    return {
      ...base,
      estado: 'sin-dns',
      detalle:
        'el dominio no resuelve: no hay web, ni siquiera la anterior. Mira si la zona está activa en Cloudflare',
    };
  }

  const nuestra = respuestaNuestra(sonda.cuerpo);

  if (!nuestra) {
    if (sonda.codigo === null) {
      return { ...base, estado: 'sin-clasificar', detalle: 'el nombre resuelve pero no hubo respuesta' };
    }
    // Se nombra el sistema cuando se reconoce, y se dice que el arreglo está en
    // el DNS. "Responde 404 y no es nuestro" describe; "lo sirve WordPress: el
    // DNS apunta a otro sitio" es lo que se puede ir a hacer.
    const sistema = queSistemaEs(sonda);
    return {
      ...base,
      estado: 'otro-sistema',
      detalle: sistema
        ? `responde ${sonda.codigo} pero lo sirve ${sistema}, no nosotros: el DNS apunta a otro sitio`
        : `responde ${sonda.codigo} y no es nuestro sistema: el DNS apunta a otro sitio`,
    };
  }

  if (!nuestra.ok) {
    return {
      ...base,
      sha: nuestra.sha,
      estado: 'degradada',
      detalle: 'es nuestro sistema y declara su tabla de dominios incoherente (503)',
    };
  }

  if (nuestra.tienda !== sonda.slug) {
    return {
      ...base,
      sha: nuestra.sha,
      estado: 'enrutado-roto',
      detalle: `es nuestro sistema pero en este host se identifica como ${nuestra.tienda ?? 'ninguna tienda'}, no como ${sonda.slug}`,
    };
  }

  return { ...base, sha: nuestra.sha, estado: 'servida', detalle: 'sirve su propia tienda' };
}

export interface ResumenFlota {
  total: number;
  servidas: number;
  problemas: Diagnostico[];
  /**
   * SHAs distintos vistos entre las tiendas servidas. Un solo servicio sirve
   * todos los dominios, así que más de uno significa que algo va mal: un
   * despliegue a medias, o una respuesta cacheada pese al `no-store`.
   */
  shas: string[];
}

export function resumirFlota(diagnosticos: Diagnostico[]): ResumenFlota {
  const servidas = diagnosticos.filter((d) => d.estado === 'servida');
  return {
    total: diagnosticos.length,
    servidas: servidas.length,
    problemas: diagnosticos.filter((d) => esProblema(d.estado)),
    shas: [...new Set(servidas.map((d) => d.sha).filter((s): s is string => typeof s === 'string'))],
  };
}
