# La escala real del proyecto — 58 tiendas, no 7

**Descubierto el 2026-08-26**, leyendo el directorio de `usafitness.es`.
Hasta hoy toda la memoria del proyecto decía "7 tiendas".

## Los números

| | |
|---|---|
| Tiendas en la web de marca | **58** |
| En centro comercial | 47 |
| **A pie de calle** | **11** |
| En el repo | 7 → **12% de cobertura** |
| Con dominio conectado (según el usuario) | 8 — incluye `usafitnesslagoh.com`, que **no está en el repo** |
| Marcadas «PRÓXIMAMENTE» en la web de marca | 2 — `As Termas` y **`Gran Casa`** |

## Cuatro cosas que esto rompe, y ninguna es teórica

### 1. `mall` es obligatorio y hay 11 tiendas sin centro comercial

`src/data/stores.ts:154` exige `mall`. Las 11 a pie de calle —Arturo Soria 310,
Albufera 98, Alcalá 345, Andorra, Bravo Murillo 300, Fuenlabrada Central,
Hortaleza 18, López de Hoyos 133, Moncloa, **Villanueva de la Cañada**, Ávila—
no tienen. El esquema no las deja entrar.

**Y esto cierra una duda abierta:** Villanueva aparece en el directorio de marca
como *«USAfitness Villanueva de la Cañada»*, **sin `C.C.`**, mientras que las 47
restantes sí lo llevan. Es la **cuarta fuente independiente** que dice que
«C.C. El Zoco» está mal, tras la ficha de Google (*Av. de la Sierra de Gredos,
2, Loc 5*), la foto de su Instagram (*C.C. La Pasada*) y un análisis anterior.

### 2. GranCasa figura «PRÓXIMAMENTE» en la web de marca

Aunque ya está abierta y con dominio. Explica por qué **no tiene ficha de Google
Business**: para la marca todavía no ha abierto.

### 3. Todo lo verificado a mano es O(n) manual

Lo hecho hasta ahora funciona porque n=7. A 58 no:

| tarea | coste a 7 | coste a 58 |
|---|---|---|
| Verificar el CID de la ficha de Google | hecho, una tarde | **inviable a mano** |
| Verificar cada handle de Instagram | hecho, una tarde | **inviable a mano** |
| Elegir el plano general mirando las fotos | 24 fotos | ~230 fotos |
| Convertir y nombrar fotos | 6 por tienda | ~350 |
| Recabar datos legales | 4 pendientes | ~55 pendientes |

**La conclusión operativa:** lo que a 7 tiendas es «trabajo», a 58 es «producto».
Cada verificación manual tiene que convertirse en un script con controles, o el
alta de tienda no escala.

### 4. El sistema de plantillas sigue sin usarlo nadie

**0 de 7** tiendas declaran `template` o `sections`. A 7 tiendas eso es una
curiosidad; a 58 es el mecanismo que evita 58 webs idénticas — que es
exactamente la huella que el propio roadmap identifica como delatora
(misma IP, misma plantilla, mismos textos).

## Lo que hay que decidir, y no lo decide el código

1. **¿El objetivo es cubrir las 58, o un subconjunto?** El usuario dice que irá
   subiendo poco a poco y que las 8 con dominio son «las primeras que
   conectaremos». Eso implica un flujo de alta repetible, no 58 altas a mano.
2. **¿Cada tienda es un cliente que paga por separado?** Son sociedades
   distintas. La respuesta cambia si el producto es «una web» o «una plataforma».
3. **`usafitnesslagoh.com` ya existe y sirve WordPress.** ¿Entra ya en el repo?

## Nota sobre redes sociales

Cada franquicia lleva sus RRSS por su cuenta y decide cómo. Se nota en los datos:
Vigo publicó hace 4 días con 80 publicaciones; Las Rosas lleva **460 días** sin
publicar; GranCasa tiene **0**. El usuario lo señala como oportunidad de servicio
(contenido con IA, UGC). Ver `memory/06-feature-map.md §3`.
