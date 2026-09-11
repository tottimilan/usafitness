# Rodaja 1c de Rótulo — la oferta del mes, que caduca sola — Implementation Plan

**Date:** 2026-09-06
**Branch:** `feat/rotulo-ofertas`
**Author:** User + Claude Opus 5
**Status:** Done (2026-09-06)

## Amendment 2026-09-06 — lo que se desvió al ejecutarlo

1. **La precedencia es entre ofertas VIVAS, y el plan no lo decía.** «Propia sobre central» admitía dos lecturas: que la propia bloquee siempre, o que solo gane si está viva. Se implementó la segunda, que es la útil: si el franquiciado puso una oferta en julio y no la quitó, en septiembre sale la de la central en vez de nada. Hay una prueba que lo fija.
2. **El precio se borra en la función, no se oculta en la plantilla.** Es más fuerte: lo que no sale de `ofertaViva` no puede colarse en ninguna página por descuido. Y el esquema cierra la puerta de atrás, que era meter el precio dentro de la cifra grande.
3. **El evento `ver_oferta` ya estaba en el registro** con su parámetro de origen desde el 27-ago. Se comprobó antes de escribirlo en vez de duplicarlo.
4. **No hizo falta aviso de oferta caducada como tarea aparte:** salió con `ofertasParaLimpiar`, que el build ya imprime.

**Resultado medido:** 249 pruebas, 249 pasan con la suite armada, 0 dormidas. Tres mutaciones: quitar la caducidad mata tres pruebas, invertir la precedencia mata una, dejar pasar el precio mata otra.

## Goal

Que una tienda pueda publicar la oferta del mes —la de la central o la suya— y que **deje de publicarse sola el día que caduca**, sin que nadie tenga que acordarse. Sin oferta viva, la sección no existe y no hay un solo píxel rojo en la página.

## Architecture

Dos niveles, como decidió el dueño el 27-ago (memory/04 §Ofertas): una **oferta central** en dato compartido, que la central produce y el operador publica, y un campo **`ofertaPropia`** por tienda que la pisa. Precedencia: propia sobre central, y ninguna si las dos han caducado.

La caducidad se calcula con la fecha de Madrid, reutilizando `fechaEnMadrid` de `horario.ts`: dos formas de saber qué día es acabarían discrepando justo el día del cambio de hora.

**Lo que no se puede improvisar:** la oferta de la central se publica **bajo el CIF de cada franquiciado**, así que su texto se archiva por escrito con quién lo autorizó y cuándo. Es la lección del «Hasta 20% dto.» que hubo que retirar por no tener fuente. El campo `procedencia` es obligatorio, no decorativo.

**Y los precios están ocultos por decisión del dueño.** El campo existe, pero solo se sirve si esa tienda lo ha activado. Además el esquema rechaza que se cuele un precio dentro de la cifra grande, que es por donde se colaría.

## Success criteria (observable)

- [ ] Una oferta con fecha de fin pasada **no se publica**, sin tocar nada: `ofertaViva` devuelve `null`.
- [ ] Una oferta programada no se publica antes de su fecha de inicio, y el último día sí cuenta.
- [ ] Con oferta propia y central vivas manda la propia; si la propia caducó y la central vive, sale la central.
- [ ] El precio no llega a la página salvo que la tienda lo haya activado.
- [ ] El esquema rechaza una fecha de fin anterior a la de inicio, y una cifra que lleve un precio dentro.
- [ ] Hoy ninguna de las ocho tiendas tiene oferta: ninguna emite rojo, y hay una prueba que lo fija.
- [ ] `npm run build` verde y las ocho webs idénticas.

## Files

| Acción | Ruta | Para qué |
|---|---|---|
| Crear | `src/data/ofertas.ts` | Esquema, precedencia, caducidad y el filtro de precio. |
| Crear | `src/data/oferta-central.json` | La oferta de la central. Nace vacía. |
| Modificar | `src/data/stores.ts` | `ofertaPropia` y `preciosVisibles`. |
| Modificar | `docs/medicion/guia-alta.md` | `ver_oferta` con su parámetro de origen. |
| Modificar | `tests/datos.test.mjs` | Las pruebas de las tres reglas. |

## Tasks

1. **`ofertas.ts`**: el esquema de una oferta, `ofertaViva` con precedencia y caducidad, y el filtro de precio. Test primero.
2. **Los campos de tienda** y la oferta central vacía, con sus rechazos.
3. **El registro del evento** y el aviso de oferta caducada que conviene limpiar.
4. **Mutaciones**: quitar la caducidad, invertir la precedencia, dejar pasar el precio.

## Execution

En línea, commit por tarea, mutación antes de cada commit.
