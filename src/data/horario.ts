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
