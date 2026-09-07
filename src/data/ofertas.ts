/**
 * LA OFERTA DEL MES, Y POR QUÉ CADUCA SOLA
 *
 * Dos niveles, como se decidió el 2026-08-27 (memory/04 §Ofertas): una oferta
 * CENTRAL en dato compartido, que la central produce y el operador publica, y
 * un campo `ofertaPropia` por tienda que la pisa. La precedencia es entre
 * ofertas VIVAS: una propia caducada no bloquea a la central.
 *
 * POR QUÉ LA FECHA DE FIN ES OBLIGATORIA Y LA CADUCIDAD ES AUTOMÁTICA
 *
 * Una oferta caducada en la web de una tienda física no es un dato viejo: es
 * una promesa que alguien va a intentar canjear en el mostrador. Y el sistema
 * está pensado para funcionar desatendido diez días seguidos, así que no puede
 * depender de que nadie se acuerde de quitarla. Sin fecha de fin no se publica;
 * pasada la fecha, deja de publicarse sin que nadie toque nada.
 *
 * POR QUÉ `procedencia` NO ES DECORATIVA
 *
 * La oferta de la central se publica BAJO EL CIF DE CADA FRANQUICIADO: quien
 * responde de ese texto es él. Ya hubo que retirar un «Hasta 20% dto.» que
 * nadie sabía de dónde había salido (Fase 0.2). Así que cada oferta archiva
 * quién autorizó el texto y cuándo.
 *
 * POR QUÉ EL PRECIO NO SALE
 *
 * El dueño decidió precios ocultos, con un interruptor por tienda «por si algún
 * franquiciado sí los quiere». El campo existe, pero `ofertaViva` lo borra
 * salvo que esa tienda lo haya activado — y el esquema impide que se cuele un
 * precio dentro de la cifra grande, que es por donde se colaría.
 *
 * La fecha se calcula con `fechaEnMadrid`, la misma que el horario: dos formas
 * de saber qué día es acabarían discrepando justo el día del cambio de hora.
 */

import { z } from 'astro/zod';
import bruto from './oferta-central.json' with { type: 'json' };
import { fechaEnMadrid } from './horario.ts';

const fecha = (campo: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${campo} va como "AAAA-MM-DD"`);

/**
 * La cifra es lo que se pinta en rojo y a tamaño grande: «2×1», «−20 %»,
 * «MUESTRA GRATIS». Un precio ahí dentro se saltaría la decisión de precios
 * ocultos por la puerta de atrás, así que el esquema lo rechaza.
 */
const cifraSinPrecio = z
  .string()
  .trim()
  .min(1)
  .max(16, 'la cifra se pinta enorme: más de 16 caracteres no cabe')
  .refine((c) => !/€|\beur/i.test(c) && !/\d+[.,]\d{2}\b/.test(c), {
    message: 'la cifra no puede llevar un precio: los precios están ocultos por decisión del dueño, y para eso está el campo `precio` con su interruptor por tienda',
  });

export const EsquemaOferta = z
  .strictObject({
    cifra: cifraSinPrecio,
    titulo: z.string().trim().min(1),
    condicion: z.string().trim().min(1, 'la condición es lo que evita una reclamación en el mostrador'),
    desde: fecha('desde'),
    /** Obligatoria: sin ella la oferta no caducaría sola y alguien la canjearía. */
    hasta: fecha('hasta'),
    /** Quién autorizó el texto y cuándo. Se publica bajo el CIF del franquiciado. */
    procedencia: z.strictObject({
      autorizadaPor: z.string().trim().min(1),
      fecha: fecha('la fecha de la autorización'),
      donde: z.string().trim().min(1).optional(),
    }),
    /** Oculto salvo que la tienda active `preciosVisibles`. */
    precio: z.string().trim().min(1).optional(),
  })
  .refine((o) => o.hasta >= o.desde, {
    message: 'la oferta termina antes de empezar',
    path: ['hasta'],
  });

export type Oferta = z.infer<typeof EsquemaOferta>;
export type OfertaViva = Oferta & { origen: 'central' | 'propia' };

/** La oferta de la central, validada al cargar igual que `stores.json`. */
function cargarCentral(): Oferta | null {
  const datos = (bruto as { oferta: unknown }).oferta;
  if (datos === null || datos === undefined) return null;
  const r = EsquemaOferta.safeParse(datos);
  if (!r.success) {
    throw new Error(
      `\n\noferta-central.json no es válida. No se despliega nada hasta arreglarlo:\n\n${z.prettifyError(r.error)}\n\n` +
        `Reglas en src/data/ofertas.ts.\n`
    );
  }
  return r.data;
}

export const OFERTA_CENTRAL: Oferta | null = cargarCentral();

/** ¿Esta oferta está viva hoy? El último día cuenta; el anterior al primero no. */
function vive(o: Oferta, hoy: string): boolean {
  return hoy >= o.desde && hoy <= o.hasta;
}

/**
 * La oferta que esta tienda publica hoy, o `null`.
 *
 * `null` es un resultado normal y hoy es el de las ocho: sin oferta viva la
 * sección no se pinta y la página no lleva un solo píxel rojo.
 */
export function ofertaViva(
  store: { ofertaPropia?: Oferta; preciosVisibles?: boolean },
  ahora: Date,
  central: Oferta | null = OFERTA_CENTRAL
): OfertaViva | null {
  const hoy = fechaEnMadrid(ahora);

  let elegida: OfertaViva | null = null;
  if (store.ofertaPropia && vive(store.ofertaPropia, hoy)) {
    elegida = { ...store.ofertaPropia, origen: 'propia' };
  } else if (central && vive(central, hoy)) {
    elegida = { ...central, origen: 'central' };
  }
  if (!elegida) return null;

  // El precio se BORRA aquí y no se oculta en la plantilla: lo que no sale de
  // esta función no puede colarse en ninguna página por descuido.
  if (!store.preciosVisibles) delete (elegida as { precio?: string }).precio;
  return elegida;
}

/** Ofertas caducadas hace tiempo que conviene limpiar del fichero. */
export function ofertasParaLimpiar(
  tiendas: { slug: string; ofertaPropia?: Oferta }[],
  ahora: Date,
  central: Oferta | null = OFERTA_CENTRAL
): string[] {
  const hoy = fechaEnMadrid(ahora);
  const avisos: string[] = [];
  if (central && hoy > central.hasta) {
    avisos.push(`oferta-central.json: la oferta «${central.titulo}» caducó el ${central.hasta} y ya no se publica en ninguna tienda`);
  }
  for (const t of tiendas) {
    if (t.ofertaPropia && hoy > t.ofertaPropia.hasta) {
      avisos.push(`${t.slug}: su oferta propia caducó el ${t.ofertaPropia.hasta} y ya no se publica`);
    }
  }
  return avisos;
}
