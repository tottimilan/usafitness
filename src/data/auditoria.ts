/**
 * LA ALARMA DE DEPENDENCIAS — qué es nuevo y qué ya decidimos
 *
 * Sustituye a `npm audit --audit-level=critical`, que era un sí o un no y se
 * quedó permanentemente en «no».
 *
 * POR QUÉ HIZO FALTA CAMBIARLA
 *
 * El 11-sep apareció el primer aviso crítico desde que existe la alarma
 * (GHSA-26w7-cxv4-gfx2, ejecución remota al decodificar AVIF). Se triò: no nos
 * alcanza —no hay un solo `.avif` que ese decodificador pueda leer, y `/_image`
 * devuelve 404 en todos los hosts desde el mismo día— pero **no tiene arreglo
 * dentro de la línea 6.x de Astro**, así que la alarma se quedó roja sin
 * ninguna acción posible que la apagara salvo un salto mayor de versión.
 *
 * Y una alarma permanentemente roja no avisa de nada. Es exactamente lo que el
 * triaje de agosto razonó al descartar poner el umbral en `high`: «sería
 * teatro, estaría rojo permanentemente por los 8 high aceptados con evidencia».
 * Dejarla roja por un crítico aceptado con evidencia es el mismo teatro.
 *
 * LO QUE ESTA ALARMA NO ES
 *
 * No es una forma de silenciar avisos. Una excepción cuesta más que arreglar la
 * dependencia en la mayoría de los casos: hay que escribir el motivo, enlazar
 * la evidencia, poner fecha de apertura y de caducidad, y decir en qué versión
 * se cierra. Y **cinco cosas distintas rompen el build**, no una:
 *
 *   1. Un crítico que no está en la lista.           → es lo que la alarma vigila
 *   2. Una excepción caducada.                       → el olvido rompe, no avisa
 *   3. Una excepción que ya no corresponde a nada.   → se arregló: bórrala
 *   4. Un plazo de más de 90 días.                   → «caduca en 2099» no cuela
 *   5. Una excepción a la que le falta un campo.     → sin motivo no hay excepción
 *
 * La 2 y la 3 son las que impiden que esto se pudra. Una excepción que caduca y
 * solo avisa se renueva sola por costumbre; una que rompe el build obliga a
 * volver a mirar. Y una excepción que sobrevive a su propio arreglo miente:
 * dice que aceptamos un riesgo que ya no existe.
 *
 * La función es pura y recibe la fecha: el `npm audit` y el reloj viven en
 * `scripts/auditoria.mjs`, igual que la red vive fuera de `flota.ts`.
 */

/** Plazo máximo que se le puede dar a una excepción, en días. */
export const PLAZO_MAXIMO_DIAS = 90;

/** Los campos sin los cuales una excepción no es una decisión, es un silencio. */
export const CAMPOS_OBLIGATORIOS = ['aviso', 'paquete', 'motivo', 'evidencia', 'abierta', 'caduca', 'cierraEn'] as const;

export interface Excepcion {
  /** El identificador del aviso, tal y como lo publica GitHub: `GHSA-…`. */
  aviso: string;
  paquete: string;
  /** Por qué se acepta. En una frase, y que se entienda dentro de seis meses. */
  motivo: string;
  /** Dónde está la evidencia medida. Un fichero del repositorio, no una opinión. */
  evidencia: string;
  /** AAAA-MM-DD en que se decidió. */
  abierta: string;
  /** AAAA-MM-DD a partir del cual esto rompe el build. */
  caduca: string;
  /** Qué versión lo cierra de verdad, para que se vea lo que falta. */
  cierraEn: string;
}

export interface AvisoCritico {
  aviso: string;
  paquete: string;
  titulo: string;
  rango: string;
}

export interface Problema {
  clase: 'desconocido' | 'caducada' | 'sobra' | 'plazo-largo' | 'incompleta';
  aviso: string;
  detalle: string;
}

/** Extrae los avisos CRÍTICOS del informe de `npm audit --json`. */
export function criticosDelInforme(informe: any): AvisoCritico[] {
  const fuera: AvisoCritico[] = [];
  const vistos = new Set<string>();
  for (const [paquete, entrada] of Object.entries<any>(informe?.vulnerabilities ?? {})) {
    // `via` mezcla objetos (avisos de verdad) y cadenas (el nombre del paquete
    // por el que llega la cadena transitiva). Solo los objetos son avisos.
    for (const v of entrada?.via ?? []) {
      if (!v || typeof v !== 'object' || v.severity !== 'critical') continue;
      const aviso = idDeAviso(v.url);
      if (!aviso || vistos.has(aviso)) continue;
      vistos.add(aviso);
      fuera.push({ aviso, paquete, titulo: v.title ?? '', rango: v.range ?? '' });
    }
  }
  return fuera;
}

/** `https://github.com/advisories/GHSA-xxxx-yyyy-zzzz` → `GHSA-xxxx-yyyy-zzzz`. */
export function idDeAviso(url: string | undefined): string | null {
  const m = /\/(GHSA-[a-z0-9-]+|CVE-\d{4}-\d+)$/i.exec(url ?? '');
  return m ? m[1] : null;
}

function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(hasta) - Date.parse(desde)) / 86_400_000);
}

/**
 * ¿Puede pasar el build?
 *
 * `hoy` llega en formato AAAA-MM-DD y no se saca de un reloj aquí dentro, para
 * que los tests puedan situarse el día antes y el día después de una caducidad
 * sin tocar la hora de la máquina.
 */
export function revisarAuditoria({
  informe,
  excepciones,
  hoy,
}: {
  informe: any;
  excepciones: Excepcion[];
  hoy: string;
}): { problemas: Problema[]; aceptados: AvisoCritico[] } {
  const criticos = criticosDelInforme(informe);
  const porAviso = new Map(criticos.map((c) => [c.aviso, c]));
  const problemas: Problema[] = [];
  const aceptados: AvisoCritico[] = [];
  const excusados = new Set<string>();
  /**
   * Todo aviso que la lista NOMBRA, salga bien o mal su entrada.
   *
   * Sin esto, una excepción caducada producía DOS problemas para el mismo
   * aviso: el de la caducidad y, detrás, un «es nuevo: hay que triarlo» sobre
   * algo que estaba triado y escrito. Un mensaje falso en la salida de una
   * alarma es peor que un mensaje de menos: enseña a desconfiar de ella.
   */
  const mencionados = new Set(excepciones.map((e) => e?.aviso).filter(Boolean));

  for (const e of excepciones) {
    const faltan = CAMPOS_OBLIGATORIOS.filter((c) => !String((e as any)?.[c] ?? '').trim());
    if (faltan.length) {
      problemas.push({
        clase: 'incompleta',
        aviso: e?.aviso ?? '(sin identificador)',
        detalle: `le faltan campos: ${faltan.join(', ')}. Sin motivo y sin evidencia no es una excepción, es un silencio.`,
      });
      continue;
    }

    const plazo = diasEntre(e.abierta, e.caduca);
    if (!Number.isFinite(plazo) || plazo <= 0) {
      problemas.push({
        clase: 'plazo-largo',
        aviso: e.aviso,
        detalle: `las fechas no cuadran: abierta el ${e.abierta} y caduca el ${e.caduca}. Una excepción caduca DESPUÉS de abrirse.`,
      });
      continue;
    }
    if (plazo > PLAZO_MAXIMO_DIAS) {
      problemas.push({
        clase: 'plazo-largo',
        aviso: e.aviso,
        detalle: `de ${e.abierta} a ${e.caduca} van ${plazo} días y el máximo son ${PLAZO_MAXIMO_DIAS}. Una excepción larga es una decisión que nadie vuelve a mirar.`,
      });
      continue;
    }

    if (hoy > e.caduca) {
      problemas.push({
        clase: 'caducada',
        aviso: e.aviso,
        detalle: `caducó el ${e.caduca}. Toca volver a mirarlo: o se arregla (${e.cierraEn}) o se renueva con la evidencia delante.`,
      });
      continue;
    }

    const critico = porAviso.get(e.aviso);
    if (!critico) {
      problemas.push({
        clase: 'sobra',
        aviso: e.aviso,
        detalle: `ya no aparece en la auditoría. Estaba aceptado y ya no hace falta: bórralo de la lista, o dirá que aceptamos un riesgo que no existe.`,
      });
      continue;
    }

    excusados.add(e.aviso);
    aceptados.push(critico);
  }

  for (const c of criticos) {
    if (excusados.has(c.aviso) || mencionados.has(c.aviso)) continue;
    problemas.push({
      clase: 'desconocido',
      aviso: c.aviso,
      detalle: `${c.paquete}: ${c.titulo} (afecta a ${c.rango}). Es nuevo: hay que triarlo antes de seguir.`,
    });
  }

  return { problemas, aceptados };
}
