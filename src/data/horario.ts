/**
 * HORARIO → Schema.org
 *
 * El horario de cada tienda es texto libre escrito a mano ("De lunes a sábado:
 * 10:00 a 22:00"). Google no entiende ese texto: necesita
 * `openingHoursSpecification` con días en inglés y horas en HH:MM.
 *
 * Este parser vivía dentro de `Landing.astro`. Se saca aquí por un motivo
 * concreto: el esquema de `stores.json` necesita comprobar que el horario de
 * cada tienda SE PUEDE parsear, y si el esquema usara sus propias reglas
 * acabarían separándose de las reales. Entonces el esquema daría verde con un
 * horario que la página no sabe leer, que es exactamente el fallo silencioso
 * que se está intentando eliminar.
 *
 * Una sola implementación. La página la usa para emitir el marcado; el esquema
 * la usa para exigir que devuelva algo.
 */

const LUN_VIE = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const LUN_SAB = [...LUN_VIE, 'Saturday'];
const LUN_DOM = [...LUN_SAB, 'Sunday'];

export interface FranjaHoraria {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/**
 * Devuelve una franja por cada línea del horario que se entienda.
 * Array vacío = el texto no lo entiende nadie y la tienda se publicaría sin
 * horario en el marcado. El esquema convierte ese caso en error de build.
 */
export function parseHorario(texto: string): FranjaHoraria[] {
  const franjas: FranjaHoraria[] = [];

  for (const linea of texto.split('\n')) {
    const min = linea.toLowerCase();

    // Acepta "10:00 a 22:00", "10:00–21:00" y "10:00 - 21:00": las tres formas
    // aparecen ya en los datos reales.
    const horas = linea.match(/(\d{1,2}:\d{2})\s*[a–-]\s*(\d{1,2}:\d{2})/);
    if (!horas) continue;

    // Los rangos van primero: "lunes a domingo" también contiene "domingo", y
    // evaluarlo al revés duplicaría el domingo en dos franjas distintas.
    let dias: string[] | null = null;
    if (min.includes('lunes a domingo')) dias = LUN_DOM;
    else if (min.includes('lunes a sábado')) dias = LUN_SAB;
    else if (min.includes('lunes a viernes')) dias = LUN_VIE;
    else if (min.includes('domingo')) dias = ['Sunday'];
    else if (min.includes('sábado')) dias = ['Saturday'];

    if (!dias) continue;

    franjas.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dias,
      opens: horas[1],
      closes: horas[2],
    });
  }

  return franjas;
}

/* ── El horario de HOY ──────────────────────────────────────────────────────
 *
 * `parseHorario` dice qué días abre la tienda. Estas dos funciones dicen qué
 * pasa HOY, que es lo que R3 pide enseñar en el primer scroll.
 *
 * TODO pasa por `Intl.DateTimeFormat` con `Europe/Madrid` y NUNCA por
 * `getDay()` ni `getHours()`. El servidor va en tiempo universal: con el reloj
 * del sistema, la web diría «cerrado» con la tienda abierta durante las horas
 * de desfase, en las ocho tiendas a la vez y solo en producción, que es la
 * clase de fallo que nadie ve hasta que lo cuenta un cliente.
 *
 * La fecha se inyecta y no se lee por dentro: si no, no habría forma de probar
 * ninguna de las dos sin esperar a que llegara la hora.
 */

const DIA_EN_MADRID = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Madrid',
  weekday: 'long',
});

const HORA_EN_MADRID = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Madrid',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Minutos desde medianoche de un "HH:MM". */
function enMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** La fecha de hoy en Madrid como "AAAA-MM-DD", que es la clave del calendario. */
export function fechaEnMadrid(ahora: Date): string {
  // 'en-CA' da exactamente AAAA-MM-DD; construirlo a mano con getFullYear() y
  // compañía volvería a leer el reloj del servidor, que es lo que aquí se evita.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(ahora);
}

export interface FranjaDelDia {
  opens: string;
  closes: string;
}

/**
 * La franja de hoy, o `null` si la tienda no abre hoy.
 *
 * `null` es un resultado legítimo y frecuente: Marineda cierra los domingos.
 * Lo que NO se hace nunca es inventar un horario para rellenar el hueco — la
 * plantilla imprime otra cosa, pero no una hora falsa.
 */
export function franjaDeHoy(texto: string, ahora: Date): FranjaDelDia | null {
  const hoy = DIA_EN_MADRID.format(ahora);
  for (const franja of parseHorario(texto)) {
    if (franja.dayOfWeek.includes(hoy)) {
      return { opens: franja.opens, closes: franja.closes };
    }
  }
  return null;
}

/**
 * Minutos que faltan para cerrar, o `null` si la tienda no está abierta ahora.
 *
 * Esto es el minutero, y su único trabajo es no mentir. Quien lo llama tiene
 * que haber comprobado antes que hoy no es un día de calendario del centro
 * (ver `festivos.ts`): esta función solo sabe de horas, no de fiestas.
 */
export function cierraEn(franja: FranjaDelDia, ahora: Date): number | null {
  const ahoraMin = enMinutos(HORA_EN_MADRID.format(ahora));
  const abre = enMinutos(franja.opens);
  const cierra = enMinutos(franja.closes);
  if (ahoraMin < abre || ahoraMin >= cierra) return null;
  return cierra - ahoraMin;
}
