# Rodaja 1d de Rótulo — el horario de hoy, y el calendario que decide cuándo callar — Implementation Plan

**Date:** 2026-09-06
**Branch:** `feat/rotulo-hoy-festivos`
**Author:** User + Claude Opus 5
**Status:** Done (2026-09-06)

## Amendment 2026-09-06 — lo que se desvió al ejecutarlo

1. **Un solo `festivos.json` en vez de un fichero por centro.** El plan y el desglose decían `src/data/festivos/<centro>.json`. No vale: el módulo lo cargan los tres cargadores del proyecto y no puede tocar el disco, así que el fichero tiene que importarse estáticamente como `dimensiones.json`. Un único fichero indexado por el campo `mall` lo resuelve y además evita una carpeta de cincuenta y ocho ficheros.
2. **El estado «hoy es festivo pero nadie lo confirmó» no existe, y es mejor así.** Estaba previsto detectar los días candidatos con el calendario laboral para poder decir «Hoy es festivo: consulta el horario del centro». Sobra: si el centro no tiene calendario vigente, el minutero ya no sale, y entonces da igual si hoy es fiesta. Menos código y la misma garantía — no hace falta saber si hoy es fiesta cuando ya hemos decidido no hablar.
3. **El aviso va por centro y no por tienda**, porque la carencia es del centro. Sale una línea por centro, no ocho iguales.

**Resultado medido:** 235 pruebas, 235 pasan con la suite armada, 0 dormidas. Cuatro mutaciones probadas: el reloj del servidor mata cuatro pruebas, ignorar la vigencia mata una y quitar la rama sin-calendario mata tres.

## Goal

Que la página pueda decir «Hoy 10:00–22:00» con la hora de Madrid y no la del servidor, y que el minutero «cierra en 2 h 15 min» pueda volver **sin poder mentir nunca**: solo se emite cuando el centro comercial de esa tienda tiene un calendario vigente que cubre el día de hoy. Sin calendario, la franja y nada más.

## Architecture

`parseHorario` ya convierte el texto libre del horario en franjas con día de la semana en inglés, y lo usan a la vez el esquema (para exigir que se entienda) y la página (para emitir el marcado). Aquí se le añaden dos funciones puras encima, en el mismo módulo, para que no haya dos interpretaciones del mismo texto circulando.

El servidor va en tiempo universal: calcular el día con `getDay()` haría que la web dijera «cerrado» con la tienda abierta durante las horas de desfase, **en las ocho a la vez y solo en producción**. Todo pasa por `Intl.DateTimeFormat` con `Europe/Madrid`.

El calendario vive en un único `src/data/festivos.json` importado estáticamente, como `dimensiones.json`: nada de `node:fs`, porque este módulo lo cargan los tres cargadores del proyecto. Se indexa por el campo `mall`, que el esquema ya exige y que hoy es distinto en las ocho tiendas.

**La decisión que gobierna todo esto** (tomada el 6-sep con la ley leída): la unidad es el centro comercial y no la comunidad autónoma, porque la Ley 1/2004 art. 5 da plena libertad de días y horas a los locales de menos de 300 m² que no pertenecen a un grupo grande. Lo que decide si el cliente llega a la puerta es si abre el centro.

## Success criteria (observable)

- [ ] `franjaDeHoy` devuelve la franja del día correcto con la hora de Madrid, probada con fechas fijas en invierno y en verano (una hora de desfase distinta) y con un instante que en tiempo universal cae en otro día.
- [ ] Marineda, cuyo horario es de lunes a sábado, devuelve `null` un domingo. La página no imprime un horario inventado.
- [ ] `estadoDeHoy` devuelve `franja` en un día normal, y en un día del calendario devuelve `cerrado` o `especial` con sus horas.
- [ ] **El minutero solo existe con calendario vigente:** sin entrada para ese centro, o con la entrada caducada, `cierraEn` es `null` aunque la tienda esté abierta.
- [ ] `npm run build` verde, las ocho webs vivas idénticas, y `avisosDeDatos()` dice qué centros no tienen calendario.
- [ ] `node scripts/festivos.mjs 2027` imprime los días que hay que preguntar a cada centro, sacados de la lista pública de festivos por comunidad.

## Files

| Acción | Ruta | Para qué |
|---|---|---|
| Modificar | `src/data/horario.ts` | `franjaDeHoy` y `cierraEn`, con la hora de Madrid. |
| Crear | `src/data/festivos.json` | El calendario por centro. Nace vacío a propósito. |
| Crear | `src/data/festivos.ts` | `calendarioDe`, `estadoDeHoy` y el aviso. |
| Modificar | `src/data/stores.ts` | El aviso de centro sin calendario. |
| Crear | `scripts/festivos.mjs` | Los días que hay que preguntar cada año. |
| Modificar | `tests/datos.test.mjs` | Las pruebas de las dos cosas. |

## Tasks

1. **`franjaDeHoy` y `cierraEn`** — puras, con fecha inyectada, sin leer el reloj por dentro. Test primero con fechas fijas.
2. **El calendario y `estadoDeHoy`** — con la regla de vigencia: `cubreHasta` decide si el minutero puede salir.
3. **El aviso** en `avisosDeDatos()` y el script que genera los días candidatos.
4. **Mutaciones** de las tres guardas: la zona horaria, la vigencia y el día sin franja.

## Execution

En línea, en la rama, con commit por tarea y mutación antes de cada commit.
