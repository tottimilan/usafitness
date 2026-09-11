# Reevaluación del triaje — 11 de septiembre de 2026

- **Por qué se reabre:** el tripwire de CI (`npm audit --audit-level=critical`) se puso rojo por primera vez. Es el disparador nº 1 que el [triaje de agosto](./triaje-npm-audit-2026-08.md) dejó escrito: *«un aviso nuevo critical»*.
- **Commit base:** `2dfd171` (`main`, con la PR #25 mezclada). `astro@6.1.5`, `@astrojs/node@10.0.6`, `sharp@0.34.5`.
- **Método:** cinco vectores, cada uno con un agente que verificaba y **otro que intentaba refutar su veredicto**. Después reproduje a mano cada hallazgo contra el build de producción **y contra producción de verdad**, que es donde el triaje de agosto no había llegado.

**Resumen en una frase:** el crítico no nos alcanza y la alarma tiene razón igualmente —no hay arreglo dentro de la línea 6.x—; y de paso aparecieron cuatro defectos **nuestros**, tres de ellos arreglados aquí y uno que no es nuestro y no podemos cerrar.

---

## 1. El aviso que disparó la alarma

`GHSA-26w7-cxv4-gfx2` — **ejecución remota de código al optimizar imágenes AVIF**, CVSS 9,8, rango `<7.2.8`.

**No nos alcanza, y el motivo hay que decirlo entero.** El camino de ataque es el endpoint `/_image`, que decodifica con `sharp` → `libheif`. Tres hechos medidos:

1. **El endpoint existía**, aunque no usemos `astro:assets`. Lo registra el adaptador por su cuenta: aparece en el manifiesto compilado (`dist/server/chunks/…`) y `sharp` se importa en tiempo de ejecución. *La creencia anterior —«no usamos astro:assets, luego no hay endpoint»— era falsa.*
2. **Solo acepta bytes de dentro.** Con URL remota devuelve 403; con `file://` o `../` devuelve 500. Solo lee ficheros de `dist/client`.
3. **No hay un solo `.avif`** en `public/`, en `src/` ni en `dist/client` (182 webp, 11 jpg, 9 png, 6 woff2, 1 svg, 1 mp4). El decodificador AVIF no tiene nada que decodificar.

**Pero estábamos a un commit de que sí:** `src/data/stores.ts` acepta rutas `.avif` en `heroImage` y `galleryImages`. Una foto `.avif` commiteada habría entrado en `dist/client`, o sea dentro de lo que `/_image` puede leer.

---

## 2. Lo que sí estaba abierto, y ya no

### 2.1 El endpoint `/_image`, servido a cualquiera — **ARREGLADO**

En los ocho dominios estaba tapado **por casualidad**: la reescritura del middleware lo convertía en `/<slug>/_image`, que no existe. En cualquier otro host respondía. Medido contra el build de producción:

```
Host: usafitnessvigo.com      → 404      0 B        0,028 s
Host: preview.up.railway.app  → 200  382.030 B      1,210 s   ← amplificador de 43×
```

Un desconocido podía gastar 1,2 s de CPU por petición sin coste. **Arreglo:** corte explícito en `src/middleware.ts`, **antes** de mirar la tienda, porque el agujero estaba justo en el camino del host desconocido. Ahora 404 y 0 bytes en todos los hosts.

### 2.2 La cabecera `Host` sin normalizar — **ARREGLADO**

`porDominio` tiene las claves en minúscula y sin punto final, porque el esquema valida `domain` con `^[a-z0-9.-]+`. La cabecera `Host` no funciona así: el RFC 9110 dice que no distingue mayúsculas, y `usafitnessvigo.com.` es un nombre absoluto válido. **Ocho sitios** leían la cabecera cruda.

```
build de producción, antes:   Host: usafitnessvigo.com   → tienda "vigo"
                              Host: USAFITNESSVIGO.COM   → tienda null   ← host genérico
                              Host: usafitnessvigo.com.   → tienda null
```

**En producción NO pasaba,** y esto es lo importante de haberlo medido fuera: Cloudflare pone la cabecera en minúscula antes de reenviarla, y Railway rechaza el punto final con su propio 404 (`x-railway-fallback: true`). **Nos tapaba el fallo la configuración de otros dos.** Eso no es una defensa, es una coincidencia.

**Arreglo:** `hostCanonico(request)` en `src/data/stores.ts`, junto al mapa que se consulta, y usada en los ocho sitios.

### 2.3 `robots.txt` devolvía la cabecera de quien llamaba — **ARREGLADO**

```
Host: atacante.com · x-forwarded-proto: javascript
  → Sitemap: javascript://atacante.com/sitemap.xml
  → cache-control: public, max-age=3600
```

No es una vía de ejecución —es texto plano y ningún rastreador sigue un `javascript:`— pero es texto del atacante publicado bajo el dominio de un cliente, con una hora de vida en cualquier caché. **Arreglo:** la URL sale de `store.domain`, como `sitemap.xml.ts` ya hacía desde el principio; en host desconocido no se emite línea `Sitemap`. Añadido `X-Content-Type-Options: nosniff`.

### 2.4 `?plantilla=` llegaba al prototipo — **ARREGLADO**

`TEMPLATES` es un objeto literal, así que hereda `constructor`, `toString` y `valueOf`. Los tres pasan el filtro del parámetro (minúsculas, guiones, 12 caracteres) y devuelven una **función**, que es truthy, así que el `??` de reserva no disparaba.

```
?plantilla=constructor → 500     ?plantilla=toString → 500     ?plantilla=valueOf → 500
```

Un 500 sin autenticar: ni fuga ni ejecución, pero ruido y una señal de que el filtro no filtraba lo que creía. **Arreglo:** `Object.hasOwn`.

---

## 3. Lo que NO se ha podido cerrar

### 3.1 Redirección abierta en el servidor de estáticos del adaptador — **ACEPTADO, con fecha**

```
GET //evil.com/../photos/   Host: usafitnessvigo.com
  → 301 Location: https://evil.com/photos      ← medido CONTRA PRODUCCIÓN, no en local
```

Está en `@astrojs/node/dist/serve-static.js`, que corre **antes** que nuestro middleware: no hay forma de interceptarlo desde el código de la aplicación. La rama `case "never"` —la nuestra, por `trailingSlash: 'never'`— decide con la ruta normalizada pero responde con la cruda, y no pasa por `isInternalPath`. El parche 11.0.2 (`GHSA-r557-wffq-wvrc`) **solo arregla la rama `always`**, así que subir de versión probablemente no lo cierra.

**Por qué se acepta:** para que la ruta llegue cruda al origen hace falta un cliente que **no normalice** los segmentos `..`. Los navegadores sí normalizan: pedir esa misma URL sin `--path-as-is` da `301 → http://photos/`, sin `evil.com`. O sea, no sirve para engañar a una persona con un enlace, que es el uso que tendría.

**Reevaluar cuando:** aparezca un cliente o un intermediario de la cadena que pase segmentos `..` sin tocar; o al subir a `@astrojs/node@11`, comprobando si sigue (**no suponerlo**). Pendiente: abrir issue en `withastro/astro` con el caso mínimo.

### 3.2 El tripwire seguirá rojo — **DECISIÓN DEL DUEÑO**

El crítico **no tiene arreglo en la línea 6.x**: la 6.x acaba en 6.4.8 y el aviso se cierra en `>=7.2.8`. Así que `npm audit --audit-level=critical` devuelve 1 hasta que se salte a Astro 7.

El estudio de rotura de la subida está hecho (guía de migración, adaptador, middleware, API de integraciones contra nuestro `astro.config.mjs`) y su riesgo es **alto**, sobre todo por dos cambios que no dan error y sí cambian la pantalla: `compressHTML` pasa de `true` a `'jsx'` (junta palabras entre elementos en línea) y el compilador Rust deja de autocorregir el HTML semánticamente inválido. En ocho webs de ocho clientes distintos, eso no se mezcla el mismo día que otra cosa.

**Mientras no se suba, la alarma se queda roja a la vista.** Anotarla como excepción en el workflow sería convertir el tripwire en decoración, que es exactamente contra lo que existe.

---

## 4. Lo que cambia en las reglas de agosto

- La regla *«ningún no-alcanzable vale sin el comando que lo demuestra»* se queda, y se le añade una línea: **el comando hay que ejecutarlo también contra producción cuando el veredicto depende de la infraestructura**. El triaje de agosto dio por buenos veredictos medidos solo contra el build local; dos de los cuatro hallazgos de hoy (`/_image` y el `Host`) cambian de signo según dónde se midan.
- Un *«no alcanzable porque el middleware lo reescribe»* **no es una defensa**: es un efecto colateral. Si algo no debe ser alcanzable, se cierra explícitamente y con un test.
- Nuevo disparador: **si alguien commitea un `.avif`**, el triaje de `sharp` y del crítico de Astro se reabre el mismo día.

---

## 5. Los cuatro arreglos, con su test

Cada uno tiene una prueba de regresión, y cada prueba se validó **deshaciendo el arreglo y comprobando que cae exactamente ese test**:

| Arreglo | Test que lo fija | Muere al deshacerlo |
|---|---|---|
| Normalización del `Host` | *mayúsculas, punto final y puerto dan la misma clave* + el de humo sobre las 8 tiendas | ✅ |
| Corte de `/_image` | *`/_image` devuelve 404 en TODOS los hosts* | ✅ |
| `robots.txt` sin reflejo | *robots.txt no devuelve ni una letra de lo que le mandan* | ✅ |
| `getTemplate` sin prototipo | *constructor, toString y valueOf devuelven la plantilla por defecto* | ✅ |

208 pruebas, 208 en verde con la suite armada, 0 saltadas.
