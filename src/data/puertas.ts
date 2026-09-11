/**
 * LAS PUERTAS DE PRODUCTO — y por qué NINGUNA lleva cifra
 *
 * Responde P2 («¿qué tienen?»), que es la queja literal del dueño sobre la web
 * de siempre: «no veo ni productos». Siete puertas con una línea de surtido cada
 * una, y **un solo número en toda la sección**.
 *
 * EL DISEÑO PEDÍA UNA CIFRA POR PUERTA. NO SE PUEDE, Y ESTÁ MEDIDO
 *
 * La tesis de la sección era «la cifra real, verificable»: «Proteínas — 199».
 * Se verificó el 11-09-2026 bajando los conjuntos completos de fichas de cada
 * categoría del catálogo de la central, y el resultado es que **el catálogo no
 * es una partición en ningún nivel**:
 *
 *  · Un bote está en tres puertas a la vez. AMIX CGT-3 declara en su propia
 *    ficha las categorías Aminoácidos, Creatina y Pre-entrenos, y aparece en
 *    los tres listados. No es un error de archivo: el producto es las tres cosas.
 *  · Creatina y Pre-entrenos comparten 10 fichas, el 16 % de Creatina.
 *  · Las ocho hijas de Nutrición suman 1.435 y su unión son 1.282.
 *
 * El conjunto máximo de categorías reales con solape CERO entre todas son
 * cuatro puertas que cubren el 32 % del catálogo y dejan fuera aminoácidos y
 * pre-entrenos, que son dos de las puertas obvias de una tienda de suplementos.
 *
 * Y fundirlas tampoco vale: «Creatina y pre-entrenos — 133» sería correcto como
 * conjunto, pero **ninguna página de la tienda imprime ese 133**, así que nadie
 * puede comprobarlo con un clic — y la comprobabilidad era la tesis entera.
 *
 * Así que las puertas van sin número. Es un resultado, no una renuncia: el
 * error que esto evita es el de agosto, cuando siete puertas sumaban 2.588
 * sobre un catálogo de 1.683 y cualquiera que sumara veía que algo mentía.
 *
 * EL ÚNICO NÚMERO QUE AGUANTA, Y CADUCA SOLO
 *
 * El del catálogo entero, con la frase exacta de qué cuenta. Y se retira solo
 * cuando el extracto envejece: cinco de las ocho cifras de agosto se habían
 * movido quince días después. Una cifra escrita a mano sin fecha de caducidad
 * es una cifra falsa con retardo.
 *
 * LO QUE NINGUNA FRASE PUEDE DECIR: «en tienda», «disponibles», «en stock».
 * 798 de las 1.687 fichas (47 %) llevan hoy el flag «Fuera de stock» en la web
 * de la central, y desde fuera no se distingue si eso significa «no está en la
 * estantería» o «no se envía hoy». Nadie ha contado la estantería de Lagoh.
 *
 * LAS PUERTAS SE NOMBRAN COMO LAS NOMBRA LA TIENDA
 *
 * No son etiquetas nuestras: son las categorías del catálogo de la central,
 * citadas. Por eso «Salud y bienestar» se queda con ese nombre aunque el
 * Reglamento 1924/2006 nos haga evitar la palabra en textos propios — citar el
 * rótulo de una estantería no es predicar un beneficio. Las líneas de debajo sí
 * son nuestras, y siguen la misma regla que `rutas.ts`: surtido, sin un solo
 * verbo de resultado.
 */

import catalogo from './catalogo.json' with { type: 'json' };
import { fechaEnMadrid } from './horario.ts';

export interface Puerta {
  /** El nombre de la categoría tal y como la llama el catálogo de la central. */
  nombre: string;
  /** Qué hay dentro. Surtido, nunca efecto. */
  linea: string;
}

/** El orden es el de volumen del catálogo, de más a menos. */
export const PUERTAS: Puerta[] = [
  { nombre: 'Proteínas', linea: 'whey, isolada, caseína y vegana' },
  { nombre: 'Salud y bienestar', linea: 'vitaminas, omega 3 y colágeno' },
  { nombre: 'Complementos', linea: 'shakers, cinturones y mochilas' },
  { nombre: 'Alimentos fitness y gourmet', linea: 'barritas, cremas y salsas' },
  { nombre: 'Aminoácidos', linea: 'ramificados, esenciales y glutamina' },
  { nombre: 'Pre-entrenos', linea: 'con cafeína y sin ella' },
  { nombre: 'Creatina', linea: 'monohidrato y kre-alkalina' },
];

export interface CifraDelCatalogo {
  total: number;
  /** La frase exacta que va debajo. No se escribe en la plantilla: se escribe aquí. */
  pie: string;
}

/**
 * La cifra del catálogo, o `null` si el extracto ha envejecido.
 *
 * `ahora` se inyecta para poder probar el día anterior y el posterior a la
 * caducidad sin tocar el reloj de la máquina, igual que en `hoy.ts`.
 */
export function cifraDelCatalogo(ahora: Date, datos = catalogo): CifraDelCatalogo | null {
  const dias = Math.floor((Date.parse(fechaEnMadrid(ahora)) - Date.parse(datos.extraido)) / 86_400_000);
  if (!Number.isFinite(dias) || dias < 0 || dias > datos.diasDeValidez) return null;
  return {
    total: datos.total,
    pie: `Contados en la tienda online de la cadena el ${enCastellano(datos.extraido)}. Es lo que hay en el catálogo, no un recuento de esta tienda.`,
  };
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** «2026-09-11» → «11 de septiembre de 2026». */
export function enCastellano(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** Todo el texto de las puertas, para que el test del léxico no se deje ninguno. */
export function textosDePuertas(): string[] {
  return PUERTAS.flatMap((p) => [p.nombre, p.linea]);
}
