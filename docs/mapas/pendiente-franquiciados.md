# Lo que hay que pedir a cada franquiciado — mapas y datos

Salido del diagnóstico del 2026-08-25. El código ya está arreglado; esto es lo
que **no se puede arreglar desde el código**.

---

## 1. GranCasa — bloqueante

**No tiene ficha de Google Business**, o no está publicada/verificada. Se buscó
por ocho vías independientes, todas en negativo: por dirección, por marca, por
teléfono (`876439039` no resuelve), por dominio, por razón social, por vecindad
anclada en las coordenadas del centro (Google **sí** tiene indexados local a
local a Decathlon, VivaGym, JD Sports, Décimas e Hipercor dentro de GranCasa —
USA Fitness no está), por el directorio de `grancasa.es` y por
`comunidadusafitness.com`, cuyo listado no incluye Aragón.

**Pedir a USA GOVE S.L.** (`grancasa@tiendausa.es`, 876 439 039), en este orden:

1. **¿Existe la ficha?** Si sí, que envíe el enlace desde el botón **Compartir**
   dentro del panel de Google Business Profile — un `maps.app.goo.gl/…` o un
   `maps.google.com/?cid=…`. **No vale** una URL copiada de la barra del
   navegador ni el resultado de una búsqueda. Con eso se saca el CID en un minuto.
2. **Si no existe:** darla de alta y **verificarla** en `business.google.com`.
   Sin ficha verificada no hay URL que arregle el mapa.
3. Al darla de alta, colocar el pin **sobre el local**, no sobre la entrada del centro.
4. El **número de local y la planta** dentro de GranCasa. Hoy `streetAddress` es
   la dirección del centro comercial entero.

Mientras tanto la página no muestra mapa ni botón de cómo llegar, y su
Schema.org sale sin `geo`. Es deliberado: **no se enlaza la ficha del centro
comercial**, que existe y "se vería bien", porque publicaría la tarjeta de otro
negocio —con su teléfono y sus 25.602 reseñas— en la web de este cliente.

---

## 2. Villanueva — contradice la premisa del proyecto

`stores.json` dice `mall: "C.C. El Zoco"`, pero la ficha real de Google dice
**"Av. de la Sierra de Gredos, 2, Loc 5"**, y **no existe en Google ninguna
entidad "El Zoco" en Villanueva de la Cañada** (el único Zoco que resuelve es el
Centro Comercial Zoco Pozuelo, otro municipio).

Parece un **local a pie de calle**, no una tienda dentro de un centro comercial.
Si se confirma, hay que corregir `streetAddress` y `mall` — y afecta al
posicionamiento, porque toda la estrategia local se apoya en el nombre del centro.

---

## 3. Confirmar que el pin cae sobre el local (las 6 con ficha)

La técnica garantiza que se muestre **la ficha**; **quién coloca el pin es el
dueño en su Google Business Profile**.

Indicio favorable ya medido — separación entre el punto de la tienda y el del
centro comercial: arcángel **54,6 m**, lasrosas **60,0 m**, alcobendas **83,1 m**,
vigo **90,9 m**, marineda **157,8 m**. Son puntos propios dentro del recinto, no
el centroide del centro. Basta con que cada franquiciado abra su
`https://maps.google.com/?cid=<su CID>` y confirme.

---

## 4. Conflictos de datos detectados de paso

Ninguno tocado: cada uno necesita que lo confirme su franquiciado.

| tienda | qué | web dice | ficha de Google dice |
|---|---|---|---|
| marineda | **teléfono** | `881169567` (en `phone`, `phoneDisplay` **y `whatsapp`**) | `881 30 24 18` |
| marineda | dirección | `C.C. Marineda City, A Coruña` | `Est. Baños de Arteixo, 43` |
| lasrosas | **código postal** | `28051` | `28032` (lo corroboran la ficha de la tienda **y** la del centro) |
| lasrosas | dirección | `C.C. Las Rosas, Madrid` | `Av. de Guadalajara, 2` · `San Blas-Canillejas` |
| lasrosas | nombre de la ficha | — | `USA Fitness - C.C La Rosas` ← **errata en el propio Google**, la corrige el dueño |

**El del teléfono de marineda es el más urgente:** si el bueno es el de la ficha,
hoy el botón de llamar y el de WhatsApp llevan a un número equivocado. Son dos de
los tres caminos de conversión.

### Horarios: 4 discrepancias entre la web y la ficha

| tienda | web (`stores.json`) | ficha de Google |
|---|---|---|
| villanueva | L-V 10:00-21:30 · S 10:00-21:00 | L-V 10-14 y 17:30-21:30 · S 10-14 · **D cerrado** |
| lasrosas | domingo 10:00-22:00 | domingo 11:00-21:00 |
| vigo | L-D 10:00-22:00 | **domingo cerrado** |
| arcángel | L-D 10:00-22:00 | **domingo cerrado** |

Lo que ve el cliente es lo de la web. Si el bueno es el de la ficha, hay gente
yendo en domingo a tiendas cerradas.

---

## 5. Lo que queda sin cubrir por el código

El esquema valida **forma** e **identidad conocida**, pero los dos formatos que
usa Google (`pb=` y `cid=`) **no están documentados**. Si Google los retira, los
6 iframes se quedan grises **sin ningún error visible**.

La red que faltaría: un job que pida los 6 embeds y falle si la respuesta no
trae `spotlit`. No está hecho — requiere red, así que no puede ir en el build.

Mitigación de fondo: el `pb=` corto se regenera desde el CID en cualquier
momento. **El dato crítico que hay que custodiar es el CID, no la URL.**
