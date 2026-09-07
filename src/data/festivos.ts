/**
 * CUÁNDO CALLAR: EL CALENDARIO DEL CENTRO COMERCIAL
 *
 * R3 dejó el estado en vivo («abierto ahora», «cierra en 2 h 15 min»)
 * condicionado a que existiera un calendario de festivos, y por eso el minutero
 * se retiró entero el 2026-08-27. Este módulo es ese calendario, y su único
 * trabajo es decidir cuándo la página NO puede hablar.
 *
 * POR QUÉ POR CENTRO COMERCIAL Y NO POR COMUNIDAD AUTÓNOMA
 *
 * La primera respuesta obvia era el calendario laboral y las órdenes
 * autonómicas de apertura en domingos y festivos. No sirven: la Ley 1/2004 de
 * Horarios Comerciales, artículo 5, da plena libertad para determinar días y
 * horas a los establecimientos de menos de 300 m² de superficie útil que no
 * pertenecen a un grupo de distribución grande. Nuestras tiendas lo son y cada
 * franquiciado es una sociedad independiente, así que esas órdenes no les
 * aplican. Lo que decide si el cliente llega a la puerta es si abre EL CENTRO.
 *
 * De modo que el dato no se deduce: se pregunta. El calendario laboral solo
 * sirve para saber por qué catorce días del año hay que preguntar, y de eso se
 * encarga `scripts/festivos.mjs`.
 *
 * LA REGLA QUE HACE QUE NO PUEDA MENTIR
 *
 * El minutero solo sale si el centro de esa tienda tiene calendario y ese
 * calendario cubre el día de hoy. Sin calendario, o con uno caducado, la página
 * imprime la franja del día y nada más — que es exactamente lo que hace hoy.
 * Así no hace falta saber si hoy es fiesta: si no lo sabemos, no lo decimos.
 *
 * El fichero se importa estáticamente, como `dimensiones.json`: nada de
 * `node:fs`, porque este módulo lo cargan los tres cargadores del proyecto.
 */

import bruto from './festivos.json' with { type: 'json' };
import { franjaDeHoy, cierraEn, fechaEnMadrid } from './horario.ts';

/** Horario especial de un día, o `null` si ese día el centro no abre. */
export type DiaDeCalendario = { opens: string; closes: string } | null;

export interface CalendarioDeCentro {
  /** De dónde salió, para poder volver a mirarlo. */
  fuente: string;
  leidoEl: string;
  /** Pasada esta fecha el calendario deja de valer y el minutero se apaga. */
  cubreHasta: string;
  dias: Record<string, DiaDeCalendario>;
}

export type Calendarios = Record<string, CalendarioDeCentro>;

export const CALENDARIOS: Calendarios = (bruto as { centros: Calendarios }).centros;

export type EstadoDeHoy =
  /** Día normal con calendario vigente: se puede decir todo, minutero incluido. */
  | { tipo: 'franja'; opens: string; closes: string; cierraEn: number | null }
  /** Día normal sin calendario vigente: la franja sí, el minutero no. */
  | { tipo: 'franja-sin-calendario'; opens: string; closes: string }
  /** El horario de la tienda no cubre hoy (Marineda los domingos). */
  | { tipo: 'cerrado' }
  /** El centro no abre hoy. */
  | { tipo: 'festivo-cerrado' }
  /** El centro abre hoy con otras horas. */
  | { tipo: 'festivo-especial'; opens: string; closes: string; cierraEn: number | null };

/**
 * Qué se puede decir hoy de esta tienda.
 *
 * Los calendarios se inyectan para poder probar los cinco estados sin tocar el
 * fichero real, que hoy está vacío.
 */
export function estadoDeHoy(
  store: { schedule: string; mall: string },
  ahora: Date,
  calendarios: Calendarios = CALENDARIOS
): EstadoDeHoy {
  const hoy = fechaEnMadrid(ahora);
  const cal = calendarios[store.mall];
  const vigente = !!cal && hoy <= cal.cubreHasta;

  if (vigente) {
    const dia = cal.dias[hoy];
    // `null` es «cerrado» y `undefined` es «día normal»: son cosas distintas y
    // por eso se pregunta por la clave y no por el valor.
    if (hoy in cal.dias) {
      if (dia === null) return { tipo: 'festivo-cerrado' };
      return { tipo: 'festivo-especial', opens: dia.opens, closes: dia.closes, cierraEn: cierraEn(dia, ahora) };
    }
  }

  const franja = franjaDeHoy(store.schedule, ahora);
  if (!franja) return { tipo: 'cerrado' };

  if (!vigente) return { tipo: 'franja-sin-calendario', opens: franja.opens, closes: franja.closes };
  return { tipo: 'franja', opens: franja.opens, closes: franja.closes, cierraEn: cierraEn(franja, ahora) };
}

/** Los centros de la flota que hoy no tienen calendario vigente. Para el aviso. */
export function centrosSinCalendario(
  tiendas: { mall: string }[],
  ahora: Date,
  calendarios: Calendarios = CALENDARIOS
): string[] {
  const hoy = fechaEnMadrid(ahora);
  const sin = new Set<string>();
  for (const t of tiendas) {
    const cal = calendarios[t.mall];
    if (!cal || hoy > cal.cubreHasta) sin.add(t.mall);
  }
  return [...sin];
}
