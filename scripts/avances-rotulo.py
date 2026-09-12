"""Extrae la tabla de avances de la fuente del rótulo.

    python scripts/avances-rotulo.py

Escribe `src/data/fuentes/avances-rotulo.json` con el avance horizontal de cada
carácter del subset, en em. Con eso, `rotulo.ts` calcula en SSR el tamaño de
letra de CADA tienda en vez de poner un `18vw` a ojo y rezar.

POR QUÉ ESTO EXISTE Y NO SE MIDE EN EL NAVEGADOR

El rótulo es lo primero y lo más grande de la página, y su ancho depende de la
tienda: «LAGOH» son cinco letras y «EL ARCÁNGEL» son once. Medirlo en el cliente
exigiría JavaScript y un salto de maquetación en cuanto la fuente terminara de
cargar — justo encima del titular. Con la tabla de avances, el servidor ya sabe
cuánto va a medir el texto antes de mandarlo.

LA TABLA ES DE LA FUENTE QUE SE SIRVE, no de la familia de Google. El subset de
`public/fonts/archivo-expanded-black-rotulo.woff2` es lo que el navegador va a
usar de verdad, así que es lo único que vale para medir.

Reproducible: no escribe fecha ni nada que cambie entre dos ejecuciones.
"""

import json
import io
from pathlib import Path

from fontTools.ttLib import TTFont

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / 'public' / 'fonts' / 'archivo-expanded-black-rotulo.woff2'
GLIFOS = RAIZ / 'src' / 'data' / 'fuentes' / 'glifos-rotulo.txt'
SALIDA = RAIZ / 'src' / 'data' / 'fuentes' / 'avances-rotulo.json'

fuente = TTFont(FUENTE)
upm = fuente['head'].unitsPerEm
hmtx = fuente['hmtx']
cmap = fuente.getBestCmap()

# Las mismas guardas que el script que genera la fuente: si alguien la regenera
# y sale variable, estrecha o con otra M, esto se planta antes de escribir nada.
assert 'fvar' not in fuente, 'la fuente salió variable y tiene que ser una instancia estática'
assert fuente['OS/2'].usWidthClass == 7, f"el ancho dejó de ser expandido: {fuente['OS/2'].usWidthClass}"
assert fuente['OS/2'].usWeightClass == 900, f"el peso dejó de ser black: {fuente['OS/2'].usWeightClass}"
avance_m = hmtx[cmap[ord('M')]][0] / upm
assert abs(avance_m - 1.178) < 0.001, f'el avance de la M cambió: {avance_m}'

texto = io.open(GLIFOS, encoding='utf-8').read()
caracteres = sorted({c for c in texto if c not in '\n\r'})

avances = {}
faltan = []
for c in caracteres:
    glifo = cmap.get(ord(c))
    if glifo is None:
        faltan.append(c)
        continue
    avances[c] = round(hmtx[glifo][0] / upm, 4)

assert not faltan, f'la fuente no trae estos caracteres del subset: {faltan!r}'

datos = {
    '_lee_esto_antes_de_tocar': [
        'Generado por scripts/avances-rotulo.py desde la fuente que se SIRVE, no desde la familia de Google.',
        'El avance es el ancho horizontal de cada carácter en em: multiplicado por el tamaño de letra da el ancho en px.',
        'No se edita a mano. Si la fuente cambia, se regenera y el diff enseña qué se movió.',
    ],
    'fuente': '/fonts/archivo-expanded-black-rotulo.woff2',
    'unitsPerEm': upm,
    'avances': avances,
}

SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(avances)} avances escritos en {SALIDA.relative_to(RAIZ)}')
print(f'  M = {avances["M"]} em (el más ancho)  ·  espacio = {avances[" "]} em')
