"""
LAS DOS FUENTES DE «RÓTULO», GENERADAS DE FORMA REPRODUCIBLE

Rótulo descarga exactamente dos ficheros y ninguno más: la display del cartel y
la cursiva de una palabra por titular. El cuerpo va con la fuente del sistema,
que pesa cero.

POR QUÉ SE GENERAN AQUÍ Y NO SE BAJAN DEL CDN DE GOOGLE

  · Google NO acota los ejes de una fuente variable. Pedirle «solo ancho 125 y
    peso 900» y pedirle la familia entera devuelven EL MISMO fichero de 90.104
    bytes (medido). Instanciada y subseteada aquí, la display pesa 5.124.
  · El parámetro `text=` de su API genera URLs efímeras que dependen del agente
    de usuario: sirve para probar, no para construir.
  · Subsetear una fuente ES modificarla. La OFL lo permite, pero exige renombrar
    si la familia tiene nombre reservado. Aquí se hace explícito y no depende de
    que alguien se acuerde.

El commit de google/fonts va anclado: sin anclarlo, dos builds pueden producir
métricas distintas y descolocar la fórmula del tamaño del rótulo, que se calcula
con la tabla de avances de esta misma fuente.

  Requisitos: pip install fonttools brotli
  Uso: python scripts/fuentes-rotulo.py
"""
import io
import os
import subprocess
import sys
import urllib.request

from fontTools.ttLib import TTFont

# Anclado el 2026-09-06. Para actualizar: cambiar aquí, ejecutar, y comprobar
# que las aserciones de abajo siguen pasando (sobre todo el avance de la M, que
# es lo que usa la fórmula del rótulo).
COMMIT = '5e35378e6bda803962ee6fd257e444a7d459660d'
RAW = f'https://raw.githubusercontent.com/google/fonts/{COMMIT}/'

# SIN ESTO NO HAY REPRODUCIBILIDAD, y lo descubrí midiendo: fontTools escribe la
# hora actual en la cabecera de la fuente, así que dos ejecuciones seguidas
# daban ficheros con bytes distintos (la cursiva no, porque su subset no pasa
# por el instanciador). `SOURCE_DATE_EPOCH` es la convención que fontTools —y
# medio mundo de las builds reproducibles— respeta para fijar esa marca.
# El valor es la fecha del commit anclado de arriba: si se cambia el commit, se
# cambia también esto.
os.environ['SOURCE_DATE_EPOCH'] = '1757116800'  # 2026-09-06T00:00:00Z

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = os.path.join(RAIZ, '.fuentes-tmp')
FONTS = os.path.join(RAIZ, 'public', 'fonts')
LISTAS = os.path.join(RAIZ, 'src', 'data', 'fuentes')
os.makedirs(TMP, exist_ok=True)

ORIGEN = {
    'Archivo[wdth,wght].ttf': 'ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf',
    'Allura-Regular.ttf': 'ofl/allura/Allura-Regular.ttf',
}


def bajar(nombre: str, ruta: str) -> str:
    destino = os.path.join(TMP, nombre)
    if not os.path.exists(destino):
        req = urllib.request.Request(RAW + ruta, headers={'User-Agent': 'usafitness-fuentes/1.0'})
        io.open(destino, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
    return destino


def correr(args: list[str]) -> None:
    subprocess.run([sys.executable, '-m'] + args, check=True, cwd=TMP)


for nombre, ruta in ORIGEN.items():
    bajar(nombre, ruta)

# 1. Display: instancia ESTÁTICA en el único punto de diseño que usa Rótulo.
#    Todo el Archivo de la plantilla va a 125/900; comprar ejes que el diseño no
#    mueve es peso sin uso.
correr([
    'fontTools.varLib.instancer', 'Archivo[wdth,wght].ttf',
    'wdth=125', 'wght=900', '-o', 'archivo-125-900.ttf',
])
correr([
    'fontTools.subset', 'archivo-125-900.ttf',
    f'--text-file={os.path.join(LISTAS, "glifos-rotulo.txt")}',
    '--flavor=woff2', '--no-hinting', '--desubroutinize',
    '--name-IDs=0,1,2,3,4,5,6,13,14', '--notdef-outline',
    f'--output-file={os.path.join(FONTS, "archivo-expanded-black-rotulo.woff2")}',
])

# 2. Cursiva: subset por PALABRAS, no por rango. El subset queda atado al copy,
#    así que añadir una palabra obliga a regenerar el fichero: la regla de
#    escasez convertida en mecanismo.
#    Allura es OFL SIN nombre reservado, así que se sirve con el suyo. Si algún
#    día se cambia por Sacramento o Kaushan, que sí lo tienen, hay que reescribir
#    los identificadores de nombre 1/4/16 y 3/6 antes de publicarla.
correr([
    'fontTools.subset', 'Allura-Regular.ttf',
    f'--text-file={os.path.join(LISTAS, "palabras-script.txt")}',
    '--flavor=woff2', '--no-hinting',
    '--name-IDs=0,1,2,3,4,5,6,13,14', '--notdef-outline',
    f'--output-file={os.path.join(FONTS, "rotulo-script.woff2")}',
])

# 3. Verificación: lo que se acaba de generar es lo que se cree que es.
display = TTFont(os.path.join(FONTS, 'archivo-expanded-black-rotulo.woff2'))
script = TTFont(os.path.join(FONTS, 'rotulo-script.woff2'))

assert 'fvar' not in display, 'la display tiene que ser ESTÁTICA: sobran los ejes'
assert display['OS/2'].usWidthClass == 7, 'la display no salió expandida'
assert display['OS/2'].usWeightClass == 900, 'la display no salió negra'
m = display['hmtx'][display.getBestCmap()[ord('M')]][0] / display['head'].unitsPerEm
assert abs(m - 1.178) < 0.001, f'el avance de la M cambió ({m}): la fórmula del rótulo hay que re-medirla'

falta = [c for c in io.open(os.path.join(LISTAS, 'glifos-rotulo.txt'), encoding='utf-8').read()
         if ord(c) not in display.getBestCmap()]
assert not falta, f'la display no cubre: {falta}'
falta = [c for c in io.open(os.path.join(LISTAS, 'palabras-script.txt'), encoding='utf-8').read()
         if c != ' ' and ord(c) not in script.getBestCmap()]
assert not falta, f'la cursiva no cubre: {falta}'

for f in ['archivo-expanded-black-rotulo.woff2', 'rotulo-script.woff2']:
    print(f'{f}: {os.path.getsize(os.path.join(FONTS, f))} B')
