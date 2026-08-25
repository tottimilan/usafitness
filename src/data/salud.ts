/**
 * LA RESPUESTA DE /health, COMO FUNCIÓN PURA
 *
 * Separada de `src/pages/health.ts` por una razón de testabilidad concreta:
 * la ruta usa el alias `@/` (que Node a pelo no resuelve) y corre dentro de
 * Astro, así que `tests/datos.test.mjs` no puede importarla. Y probar el
 * camino del 503 contra el build real exigiría compilar con una tabla rota.
 *
 * Con la respuesta aquí —imports relativos, cero Astro— el test le pasa una
 * tabla a medias y exige `status: 503` directamente. La primera versión probaba
 * solo `tablaCoherente` y una mutación lo demostró insuficiente: fijar
 * `status: 200` en la ruta dejaba la suite en verde. El mapeo ok→503 es lo
 * único que Railway lee; si no está bajo test, `railway.json` apunta a una
 * puerta sin comprobar.
 */

import { tablaCoherente, type Tienda } from './stores.ts';

export interface RespuestaSalud {
  status: 200 | 503;
  cuerpo: {
    ok: boolean;
    tienda: string | null;
    tiendas: number;
    dominios: number;
    midiendo: boolean;
    midiendoFlota: number;
    sha: string | null;
    uptime: number;
  };
}

export function respuestaDeSalud(
  tiendas: Tienda[],
  mapa: Map<string, Tienda>,
  host: string,
  sha: string | null,
  uptime: number
): RespuestaSalud {
  const tiendaDelHost = mapa.get(host) ?? null;
  const ok = tablaCoherente(tiendas, mapa);

  return {
    status: ok ? 200 : 503,
    cuerpo: {
      ok,
      tienda: tiendaDelHost?.slug ?? null,
      tiendas: tiendas.length,
      dominios: mapa.size,
      // Booleano y con el alcance del host: "¿mide ESTA tienda?". Una lista de
      // slugs publicaría el censo de las otras seis en el dominio de un cliente.
      midiendo: Boolean(tiendaDelHost?.ga4Id),
      // Recuento sin nombres: puede viajar en cualquier host sin filtrar nada.
      midiendoFlota: tiendas.filter((t) => t.ga4Id).length,
      sha,
      uptime,
    },
  };
}
