/**
 * LA LÓGICA DEL CONSENTIMIENTO, EN UN SOLO SITIO Y BAJO TEST
 *
 * El problema que resuelve este fichero: la decisión de qué se concede, qué se
 * carga y qué cookies se borran vivía dentro de un `<script is:inline>` de
 * `CookieConsent.astro`. Un script inline no se puede importar, así que ningún
 * test podía llegar a esa lógica — solo a la FORMA del HTML resultante.
 *
 * La revisión del PR #1 lo demostró (I-2) con cuatro mutaciones de
 * comportamiento, las cuatro en verde sobre la suite armada:
 *
 *   · llamar al cargador en ámbito global    → gtag.js sin consentimiento
 *   · borrar la llamada al cargador          → aceptar no mide nada
 *   · borrar el filtro de cookies            → revocar no borra nada
 *   · fijar ad_storage: 'granted'            → rechazar concede publicidad
 *
 * Tres de las cuatro son decisiones puras. Aquí están, y `tests/datos.test.mjs`
 * las prueba directamente.
 *
 * CÓMO SE EVITA TENER DOS IMPLEMENTACIONES
 *
 * El script inline no se genera a mano: se compone inyectando el CÓDIGO FUENTE
 * de estas funciones con `Function.prototype.toString()` (ver `fuenteInline`).
 * El test importa exactamente las mismas funciones. No hay una versión "de
 * test" y otra "de producción" que puedan separarse — que es justo el fallo
 * que ya nos costó una sesión con el parser de horarios.
 *
 * POR ESO ESTAS FUNCIONES NO PUEDEN CERRAR SOBRE NADA. Nada de imports, nada
 * de constantes de módulo, nada de sintaxis que el navegador no entienda: su
 * texto viaja tal cual al HTML de siete dominios.
 */

export type Decision = 'granted' | 'denied';

export interface PlanDeConsentimiento {
  /** Lo que se pasa a `gtag('consent','update', …)`. */
  consent: Record<string, Decision>;
  /** ¿Hay que descargar gtag.js ahora? */
  cargarAnalitica: boolean;
  /** ¿Hay que borrar las cookies ya escritas? */
  borrarCookies: boolean;
}

/**
 * Qué implica la decisión del visitante.
 *
 * SOLO `analytics_storage`. Los tres `ad_*` se declaran en `denied` en el
 * `consent default` y ahí se quedan: el banner habla de "cookies analíticas" y
 * la Política de Cookies no menciona publicidad, así que no hay consentimiento
 * informado que conceder para eso (RGPD art. 4.11 · críticos C-1/C-2 de la
 * revisión del PR #1). Cuando existan campañas: primero banner y política, y
 * solo después ampliar esto.
 */
export function planDeConsentimiento(valor: Decision): PlanDeConsentimiento {
  var concedido = valor === 'granted';
  return {
    consent: { analytics_storage: concedido ? 'granted' : 'denied' },
    cargarAnalitica: concedido,
    borrarCookies: !concedido,
  };
}

/**
 * Los ámbitos de dominio en los que hay que intentar borrar una cookie.
 *
 * Sufijos PROGRESIVOS, no solo el host exacto: GA escribe en el dominio
 * registrable, así que visitando con el prefijo `www.` la cookie vive en el
 * dominio pelado con punto delante. La primera versión probaba solo el host y
 * `'.'+host`, y la dejaba viva ahí mientras el comentario afirmaba lo
 * contrario (I-1 de la revisión). El `''` inicial cubre el borrado sin
 * atributo `domain`, que es como las escribe un script del propio host.
 */
export function ambitosDeBorrado(hostname: string): string[] {
  var partes = hostname.split('.');
  var ambitos = [''];
  for (var i = 0; i < partes.length - 1; i++) {
    var sufijo = partes.slice(i).join('.');
    ambitos.push(sufijo);
    ambitos.push('.' + sufijo);
  }
  return ambitos;
}

/**
 * ¿Es una cookie que Google escribe bajo consentimiento?
 *
 * `_ga`/`_gid`/`_gat` son de Analytics; `_gac`/`_gcl` de Ads. Los `ad_*` no se
 * conceden hoy, pero borrar de más es gratis y borrar de menos incumple el
 * art. 7.3 del RGPD.
 */
export function esCookieDeGoogle(nombre: string): boolean {
  return /^_(ga|gid|gat|gac|gcl)/.test(nombre);
}

/**
 * El código fuente de las tres funciones, listo para inyectar en el script
 * inline del componente.
 *
 * Esto es lo que garantiza una sola implementación: lo que se prueba arriba es
 * literalmente lo que viaja al navegador. Si alguien cambia una función, el
 * test y el HTML cambian a la vez o no cambia ninguno.
 */
export function fuenteInline(): string {
  return [planDeConsentimiento, ambitosDeBorrado, esCookieDeGoogle]
    .map((f) => f.toString())
    .join('\n');
}
