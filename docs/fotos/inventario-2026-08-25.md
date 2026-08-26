# Inventario de fotos de tienda — 2026-08-25

Mirada foto a foto, no deducida del ratio. El criterio de "plano general" es el
que dio el usuario: **se ve el rótulo de USAFitness y la tienda desde fuera**.

## Cuál es el plano general de cada tienda

| tienda | plano general | ¿está primera hoy? | qué es |
|---|---|---|---|
| villanueva | `tienda-1` (r=1.33) | ✅ | Escaparate con el vinilo de marca y el logo. La `tienda-4` (r=0.75) es la entrada con el rótulo iluminado: **también es plano de fachada**, en vertical |
| marineda | `tienda-2` (r=1.33) | ❌ **no** | Entrada desde el pasillo con el rótulo grande encima. Hoy la primera es `tienda-1`, un pasillo interior |
| lasrosas | `tienda-1` (r=1.33) | ✅ | Escaparate desde el pasillo del centro |
| alcobendas | `tienda-1` (r=1.78) | ✅ | Fachada con el rótulo USA FITNESS sobre el escaparate |
| vigo | `tienda-1` (r=1.33) | ✅ | Fachada acristalada desde el pasillo |
| arcangel | `tienda-5` (r=1.33) | ❌ **no** | Interior amplio con el rótulo en la pared. **No hay ninguna foto de fachada**: es el mejor plano disponible. Hoy está la última |

## El heurístico del ratio NO funciona — y esto decide el diseño

La idea de "la más horizontal es el plano general" falla justo en los dos casos
que hay que arreglar:

- **arcangel**: las 5 fotos son r=1.33. Empate a cinco. El ratio no puede elegir.
- **marineda**: `tienda-1`, `tienda-2` y `tienda-3` son r=1.33. Empate a tres, y
  la buena es la 2. El ratio elegiría la 1, que es la que está mal hoy.

**Conclusión: cuál es el plano general es un DATO, no un cálculo.** Ninguna
regla sobre píxeles lo resuelve con fiabilidad, y equivocarse tiene coste: la
primera foto es la que ocupa el espacio grande.

Lo que sí puede hacer un script es **proponer** candidatas y obligar a que
alguien confirme; lo que no puede es decidirlo solo.

## Casi duplicadas

Un solo par por encima del umbral en las 7 tiendas:

- **marineda `tienda-4` vs `tienda-6` = 91%**. Confirmado mirándolas: la misma
  toma desde la entrada, con el rótulo arriba. 1400x1867 y 1200x1600 — mismo
  ratio exacto, distinta resolución. Sobra una.

El resto de pares cae entre 45% y 61%. El salto entre 91% y el siguiente (60,9%)
es lo que hace defendible el umbral del 85%: no es un número elegido a ojo.

## Recorte actual (`aspect-ratio: 4/3` + `object-fit: cover`)

| ratio | se ve | tiendas |
|---|---|---|
| 1.33 | 100% | villanueva, marineda, lasrosas, arcangel, vigo(1) |
| 1.78 | 75% del ancho | alcobendas |
| 0.75 | 56,2% del alto | villanueva ×3, marineda ×3 |
| 0.56 | **42,2% del alto** | vigo ×3 |

**Vigo tira el 57,8% de sus tres verticales.** Y dos de esas tres verticales de
villanueva/marineda son planos de fachada — se está recortando justo el tipo de
foto que más informa.

## Paridad

Impares: `lasrosas` (5) y `arcangel` (5). Las dos son 100% horizontales, que es
el caso fácil. **Las de orientación mixta —las difíciles— son todas pares**, así
que la paridad y el problema visual real no coinciden.

## Sin fotos

`grancasa`: 0. Ningún sistema arregla eso.
