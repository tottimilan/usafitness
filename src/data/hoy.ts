/**
 * QUÉ SE LE DICE HOY AL QUE ENTRA — la línea que responde P1
 *
 * P1 («¿está abierto?, ¿a qué hora?, ¿dónde?») es el 54 % de por qué alguien
 * busca una tienda. Esta es la frase que la contesta, y `estadoDeHoy` ya decidió
 * en `festivos.ts` qué se PUEDE decir; aquí solo se elige cómo decirlo.
 *
 * LA REGLA QUE GOBIERNA EL CASO INCÓMODO
 *
 * Tres de las ocho tiendas —Villanueva, Marineda y GranCasa— no declaran el
 * domingo. La tentación es escribir «Hoy cerrado» y queda una frase estupenda.
 * No se hace, y el motivo está medido: en el semáforo NAP de agosto **dos
 * tiendas figuraban cerradas los domingos en Google estando abiertas**. O sea
 * que la ausencia de una línea en `schedule` ya ha significado, en este mismo
 * proyecto, «se nos olvidó» y no «cerramos».
 *
 * Deducir el cierre de esa ausencia cuesta lo más caro que hay aquí: alguien
 * que iba a ir, no va. Así que cuando hoy no está cubierto se dice **la verdad
 * sobre nosotros** —no publicamos ese dato— y se ofrece el teléfono. Una duda
 * convertida en llamada es mejor negocio que una certeza inventada.
 *
 * La excepción es el festivo: ahí el cierre lo dice el calendario del centro
 * comercial, que es un dato positivo y no una ausencia. Eso sí se afirma.
 *
 * LA ASIMETRÍA QUE DEJA CONTESTAR «¿ESTÁ ABIERTO AHORA?» GRATIS
 *
 * Sin calendario del centro no se puede afirmar que la tienda está ABIERTA
 * ahora: un festivo podría haberla cerrado y no lo sabríamos. Pero sí se puede
 * afirmar lo contrario, y es la mitad que importa a las once de la noche —**un
 * festivo solo puede cerrar más, nunca abrir de más**—. Así que fuera de la
 * franja se dice «ya hemos cerrado» o «todavía no hemos abierto» con o sin
 * calendario, y dentro de la franja se calla salvo que haya calendario.
 *
 * Sin esto, a las 23:30 la sección decía «Hoy, de 10:00 a 22:00.» y se quedaba
 * tan ancha: quien pregunta «¿está abierto?» —que es el 54 % de por qué alguien
 * busca una tienda— tenía que hacer la cuenta él.
 *
 * EL MINUTERO SOLO CON CALENDARIO VIGENTE
 *
 * «Cierra en 2 h» es la frase más útil de la sección y la más fácil de
 * convertir en mentira: el día que el centro cierre por fiesta y nosotros
 * digamos que cierra en dos horas, el visitante se planta delante de una
 * persiana. Por eso `estadoDeHoy` distingue `franja` de `franja-sin-calendario`
 * y aquí el minutero solo aparece en la primera. Hoy, con `festivos.json`
 * vacío, no lo ve nadie — y eso es correcto, no una carencia.
 */

import type { EstadoDeHoy } from './festivos.ts';
import { momentoDelDia } from './horario.ts';

export interface TextoDeHoy {
  /** La línea grande. Siempre hay una: la sección nunca se queda muda. */
  titular: string;
  /** El minutero o el «ya hemos cerrado». Solo lo que se puede sostener. */
  minutero: string | null;
  /** La salida cuando no podemos responder: convierte la duda en contacto. */
  pideLlamar: boolean;
}

/** «135» → «2 h 15 min». Sin ceros de relleno y sin decir «0 h». */
export function enHorasYMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * El texto de hoy a partir del estado.
 *
 * Función pura sobre el estado, no sobre la tienda: así se prueban los cinco
 * casos sin fabricar horarios ni calendarios.
 */
export function textoDeHoy(estado: EstadoDeHoy, ahora: Date): TextoDeHoy {
  /** Lo seguro de decir fuera de la franja, con calendario o sin él. */
  const fuera = (opens: string, closes: string): string | null => {
    const m = momentoDelDia({ opens, closes }, ahora);
    if (m === 'antes') return 'Todavía no hemos abierto.';
    if (m === 'despues') return 'Ya hemos cerrado por hoy.';
    return null;
  };

  switch (estado.tipo) {
    case 'franja':
      return {
        titular: `Hoy, de ${estado.opens} a ${estado.closes}.`,
        minutero:
          estado.cierraEn === null
            ? fuera(estado.opens, estado.closes)
            : `Cierra en ${enHorasYMinutos(estado.cierraEn)}.`,
        pideLlamar: false,
      };

    case 'franja-sin-calendario':
      return {
        titular: `Hoy, de ${estado.opens} a ${estado.closes}.`,
        // Dentro de la franja se calla: sin calendario no podemos afirmar que
        // esté abierta. Fuera, se dice, porque un festivo no la abriría.
        minutero: fuera(estado.opens, estado.closes),
        pideLlamar: false,
      };

    case 'festivo-especial':
      return {
        titular: `Hoy, festivo: de ${estado.opens} a ${estado.closes}.`,
        minutero:
          estado.cierraEn === null
            ? fuera(estado.opens, estado.closes)
            : `Cierra en ${enHorasYMinutos(estado.cierraEn)}.`,
        pideLlamar: false,
      };

    case 'festivo-cerrado':
      // Esto SÍ se afirma: lo dice el calendario del centro, que es un dato
      // positivo escrito por alguien, no la ausencia de una línea.
      return { titular: 'Hoy el centro no abre.', minutero: null, pideLlamar: false };

    case 'cerrado':
      // Y esto NO se afirma. Ver la cabecera: la ausencia ya ha significado
      // «se nos olvidó» dos veces en este proyecto.
      return { titular: 'Hoy no figura en nuestro horario.', minutero: null, pideLlamar: true };
  }
}

/** Las líneas del horario tal y como las escribió el operador, para la semana. */
export function lineasDeSemana(schedule: string): string[] {
  return schedule
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}
