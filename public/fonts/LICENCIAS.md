# Las fuentes que servimos, y con qué permiso

Todo lo de esta carpeta se sirve desde nuestro propio dominio, nunca desde un
tercero: es la regla R9 (cero peticiones a terceros antes del consentimiento) y
también la razón de que el aviso de cookies pueda decir la verdad.

| Fichero | Familia original | Licencia | Nombre reservado | Qué le hemos hecho |
|---|---|---|---|---|
| `inter-latin.woff2`, `inter-latin-ext.woff2` | Inter (Rasmus Andersson) | SIL Open Font License 1.1 | no | subset latin de la distribución oficial |
| `barlow-condensed-700-latin.woff2`, `-800-` | Barlow Condensed (Jeremy Tribby) | SIL OFL 1.1 | no | subset latin |
| `archivo-expanded-black-rotulo.woff2` | Archivo (Omnibus-Type) | SIL OFL 1.1 | no | instanciada a ancho 125 / peso 900 y subseteada a los caracteres de `src/data/fuentes/glifos-rotulo.txt` |
| `rotulo-script.woff2` | Allura (TypeSETit) | SIL OFL 1.1 | no | subseteada a las palabras de `src/data/fuentes/palabras-script.txt` |

## Por qué esto está escrito

Subsetear una fuente **es modificarla**, y la OFL lo permite. Lo que no permite
es conservar un **nombre reservado** en una versión modificada: si algún día se
cambia la cursiva por Sacramento o Kaushan Script, que sí lo tienen, hay que
reescribir la tabla de nombres del fichero antes de publicarlo. Allura y Archivo
no tienen nombre reservado, así que se sirven con el suyo.

Los avisos de licencia viajan **dentro** de cada woff2 (identificadores 13 y 14
de la tabla de nombres), que es lo que la OFL pide para el software incrustado.
`scripts/fuentes-rotulo.py` los conserva a propósito con `--name-IDs`.

Las dos últimas se regeneran con ese script desde un commit anclado de
`google/fonts`, con la marca de tiempo fijada para que dos ejecuciones den los
mismos bytes. Los textos completos de las licencias están en ese repositorio.
