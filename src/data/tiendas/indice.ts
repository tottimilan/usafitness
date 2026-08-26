// Réplica exacta de la forma que propone el diseño ganador de 3.10:
// una línea por tienda en cada bloque, plana y única.
import alcobendas from './alcobendas.json' with { type: 'json' };
import arcangel from './arcangel.json' with { type: 'json' };
import vigo from './vigo.json' with { type: 'json' };

export const tiendasCrudas: unknown[] = [
  alcobendas,
  arcangel,
  vigo,
];
