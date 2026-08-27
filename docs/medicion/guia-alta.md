# Guía de alta: monitor, Search Console, GA4 y analítica

**Fecha:** 26 de agosto de 2026 · **Alcance:** los 8 dominios en producción · **Escala objetivo:** 58 tiendas

Léela de arriba abajo con los paneles abiertos. No te saltes el bloque 0.

---

> # 🔴 0. Arregla esto antes de nada
>
> **No hay una web caída. Hay dos.**
>
> `usafitnesslasrosas.com` y `usafitnesslagoh.com` están las dos muertas ahora mismo: los nameservers de Cloudflare devuelven `REFUSED` para esas dos zonas. Medido hoy contra los resolvedores públicos de Google (8.8.8.8), Cloudflare (1.1.1.1) y Quad9 (9.9.9.9): los tres fallan.
>
> **Lagoh nadie lo sabía.** Y hay algo peor: desde tu PC, `usafitnesslagoh.com` responde HTTP 200. Tu router lo resuelve por caché local a 185.45.73.103. Si lo compruebas abriendo el navegador, te va a parecer que funciona mientras el resto de internet no puede entrar. **Tu navegador miente. No lo uses como comprobación de nada en esta guía.**

## 0.1 Estado real de los 8 dominios (medido hoy)

| Dominio | Nameservers | Estado |
|---|---|---|
| usafitnessmarineda.com | michelle/mitchell.ns.cloudflare.com | ✅ OK |
| usafitnessalcobendas.com | michelle/mitchell.ns.cloudflare.com | ✅ OK |
| usafitnessgrancasa.com | michelle/mitchell.ns.cloudflare.com | ✅ OK |
| usafitnessvigo.com | michelle/mitchell.ns.cloudflare.com | ✅ OK |
| usafitnesselarcangel.com | michelle/mitchell.ns.cloudflare.com | ✅ OK |
| **usafitnesslasrosas.com** | michelle/mitchell.ns.cloudflare.com | 🔴 **REFUSED — caído** |
| **usafitnesslagoh.com** | michelle/mitchell.ns.cloudflare.com | 🔴 **REFUSED — caído** |
| **usafitnessvillanueva.com** | dns5716/dns5717.phdns22.es | ⚠️ **Ni está en Cloudflare ni sirve tu web** |

**El diagnóstico que circulaba era incorrecto en la causa.** Los NS de lasrosas y lagoh **no** están mal apuntados: apuntan exactamente al mismo par que los cinco que funcionan. Lo que falta no es la delegación, es **la zona dentro de la cuenta de Cloudflare**.

Según la documentación de Cloudflare, solo hay **dos** estados en los que Cloudflare no responde a ninguna consulta DNS:

- **`Initializing`** — el panel lo etiqueta **«Finish setup»**. Pasa cuando añadiste el dominio pero nunca terminaste el alta eligiendo plan.
- **`Purged`** — estado final e irreversible, 7 días después de borrar una zona.

Una zona en `Pending` **sí responde** al DNS. Así que «está pendiente de activarse» no es la explicación.

## 0.2 Levantar lasrosas y lagoh (20 minutos, ahora)

**Paso 0.2.1.** Entra en el panel de Cloudflare y ve a la sección **«Domains»** (en español, **«Dominios»**).

> ⚠️ No busques un menú llamado «Websites». Cloudflare renombró esa sección; la documentación oficial de onboarding, actualizada el 5 de mayo de 2026, dice «Domains».

**Paso 0.2.2.** Busca `usafitnesslasrosas.com` y `usafitnesslagoh.com` en la lista y mira su estado. Solo hay tres posibilidades:

| Lo que ves | Qué pasó | Qué haces |
|---|---|---|
| Etiqueta **«Finish setup»** | El alta se quedó a medias, nunca se eligió plan | Entra, completa el alta y **elige el plan Free hasta el final** |
| **No aparecen en la lista** | Las zonas se borraron y se purgaron | Hay que darlas de alta de nuevo (paso 0.2.3) |
| **«Pending Nameserver Update»** | Mi diagnóstico se queda corto | Salta a 0.2.7 |

**Paso 0.2.3.** Si no aparecen: pulsa el botón **«Onboard a domain»**.

> ⚠️ El botón ya no se llama «Add a domain». Y **no** es «Add a site» — ese botón existe, pero es de otro producto distinto (Web Analytics, bloque 4).
>
> Flujo actual: **Domains** → **«Onboard a domain»** → escribe el dominio apex (`usafitnesslasrosas.com`) y elige cómo añadir los registros DNS → **«Continue»** → **elige plan (Free)**.
>
> **El paso de elegir plan es obligatorio.** Si te lo saltas, la zona se queda en «Finish setup», que es exactamente el estado en el que Cloudflare no contesta a ninguna consulta DNS. Es, muy probablemente, lo que ha pasado aquí.

**Paso 0.2.4. Mete TODOS los registros DNS antes de tocar nada más.** Una zona recién creada empieza a responder al DNS enseguida; si está vacía, responderá «no existe», que para el cliente es exactamente igual de malo.

Abre en otra pestaña la zona de `usafitnessmarineda.com` (**DNS → Records**), que sí funciona, y copia la misma configuración: el registro que apunta a Railway, los MX de correo, el SPF, el TXT de verificación existente. No te dejes ninguno.

**Paso 0.2.5. Ve a la página «Overview» de CADA una de las dos zonas y copia los nameservers que Cloudflare asigne AHÍ.**

> ⚠️ **Esta es la trampa que te puede tener otro día caído.** Cita literal de la documentación de Cloudflare: *«Re-adding a previously deleted domain triggers the same reassignment»* — al re-añadir un dominio que estuvo borrado, Cloudflare te asigna **a propósito** un par de nameservers **distinto**, como medida antisecuestro. Y avisa expresamente: *«Do not assume the assignment is the same as one you have used before on another domain or in another account.»*
>
> Traducido: **no des por hecho que serán michelle/mitchell.** Mira lo que pone en el Overview de esa zona concreta.

**Paso 0.2.6.** Si el par asignado es **distinto** al que hay hoy en el registrador, entra en el registrador y cámbialo por el nuevo. Si es el mismo, no toques nada en el registrador.

**Paso 0.2.7. Comprueba que ha vuelto. Desde el navegador, no desde tu PC.** Abre esta URL:

```
https://dns.google/resolve?name=usafitnesslasrosas.com&type=A
```

Y esta:

```
https://dns.google/resolve?name=usafitnesslagoh.com&type=A
```

Busca el campo `"Status"`. **Si vale `0`, está vivo. Si vale `2`, sigue muerto.** Esta es la única comprobación que vale: pregunta al resolvedor público de Google, no al de tu router.

**Paso 0.2.8. No esperes a que ponga «Active».** En cuanto la zona pasa a «Pending Nameserver Update», Cloudflare ya contesta al DNS y la web vuelve. Son minutos, no 24 horas.

**Paso 0.2.9.** Abre el correo de la cuenta de Cloudflare, **incluida la carpeta de spam**, y busca avisos sobre estos dos dominios. La documentación dice: *«If your zone status changes, you will receive an email at the address associated with your account»*. Ahí está la prueba de cuándo y por qué se rompió. No es una alerta configurable ni se puede mandar a varios sitios — por eso se perdió.

## 0.3 Por qué esto va a volver a pasar si no cambias el procedimiento

Cloudflare tiene una cadena de **autoborrado** documentada que puede tumbar un dominio sin que nadie toque nada:

- Zona **Free** en «Finish setup» más de **28 días** → se borra sola.
- Zona **Free** en «Pending» más de **28 días** → se borra sola.
- Zona en «Moved» (Free) → se borra a los **7 días**.
- Zona «Deleted» → pasa a «Purged» a los **7 días**, y ahí el DNS deja de responder.

**Un dominio dado de alta a medias en enero desaparece de internet en marzo, solo.** Con 58 dominios esto no es un accidente: es un evento recurrente esperable.

## 0.4 El orden correcto para migrar los 50 que faltan

Escríbelo y no te lo saltes nunca. **El orden es lo único que evita repetir esto.**

1. Añadir el dominio en Cloudflare **y elegir plan Free hasta el final**. Si se queda en «Finish setup», Cloudflare no responde a NINGUNA consulta DNS de ese dominio, y además se autoborra a los 28 días.
2. Meter y revisar **todos** los registros DNS.
3. Copiar los nameservers de la página **Overview de esa zona concreta**.
4. **Solo ahora**, cambiar los nameservers en el registrador.
5. **Dar de alta el dominio en el monitor (bloque 1) en el mismo momento.** Un dominio que no está en la lista es un dominio que nadie vigila.

**Nunca al revés.** Si cambias los NS antes de crear la zona, Cloudflare te asigna un par distinto como medida antisecuestro y el dominio nace muerto.

## 0.5 Decisión pendiente: usafitnessvillanueva.com

Hoy no está en Cloudflare (está en nameservers de ProfesionalHosting, `phdns22.es`), resuelve a 45.154.57.16 y **sirve un WordPress con Elementor y el `<title>` vacío**. No es tu web. Es el sitio antiguo.

Eso significa que hoy villanueva:

- Queda fuera de Cloudflare: sin proxy, sin Web Analytics, sin nada del bloque 4.
- **No tiene sentido verificarlo en Search Console ni ponerle GA4** — estarías midiendo y verificando el sitio equivocado.

Decide qué haces con él antes de seguir. Si va a migrar, migra primero y luego vuelve aquí. Si no va a migrar, tacha su fila en todas las tablas de esta guía y monitorízalo igual (el bloque 1 sí aplica: que sirva el sitio viejo no quita que quieras enterarte si cae).

---

# 1. El monitor

**GA4 te dice cuánta gente entró. El monitor te dice que no puede entrar nadie.** Por eso va primero.

## 1.1 Corrección al planteamiento (importante, cambia la urgencia)

La idea de que «un monitor que solo mire HTTP tiene el mismo agujero que `/health`» **es falsa**.

`/health` no podía avisar porque es el propio servicio contestándose a sí mismo. Pero un monitor **externo** resuelve el hostname **antes** de hacer la petición: si el DNS devuelve REFUSED, el monitor no consigue conectar y marca caída. **Avisa.**

Lo que no hace es decirte que la causa fue el DNS: lo reporta como caída genérica y te deja una hora dando vueltas.

Conclusión práctica:
- **El requisito duro es:** el monitor tiene que vivir **fuera de Railway y fuera de Cloudflare**.
- **El chequeo de tipo DNS es un plus:** convierte «está caído» en «está caído POR DNS» y te ahorra el diagnóstico.

## 1.2 Qué monitorizar exactamente (detalle específico de este proyecto)

**Apunta los monitores HTTP a `/health`, no a la home.**

Motivo, sacado del propio código: `src/pages/health.ts` responde con `Cache-Control: no-store`. Es la única ruta que garantiza un fallo de caché en cada visita, en todos los dominios. Si monitorizas `https://<dominio>/`, Cloudflare puede servirte la home desde su caché con un 200 impecable **aunque Railway esté muerto**. Con `/health` eso no pasa.

Regalo extra: `/health` devuelve **503** cuando la tabla de dominios es incoherente (`src/data/salud.ts`). Es decir, un monitor HTTP contra `/health` también detecta el caso en el que una sociedad estaría sirviendo el contenido y el NIF de otra — un fallo que ningún monitor de home vería, porque la home devolvería 200.

Y `/health` está fuera del rastreo (`robots.txt` lo tiene en `Disallow` y el endpoint emite `X-Robots-Tag: noindex`), así que monitorizarlo no tiene coste de SEO.

## 1.3 La comprobación de 5 minutos que decide qué servicio usas

Toda la recomendación principal depende de una cosa **que no se ha podido confirmar en fuente primaria**: si el tipo de test **DNS** y el **token de API** están disponibles en el plan **gratuito** de StatusCake. Ni su página de precios ni su base de conocimiento desglosan los tipos de test por plan.

**Haz esto antes de comprometerte:**

1. Crea cuenta gratuita en `statuscake.com`.
2. Intenta crear un test nuevo y mira si en el selector de tipo aparece **«DNS»**.
3. Ve a la configuración de tu cuenta e intenta **generar un API token**.

| Resultado | Tu ruta |
|---|---|
| **Las dos cosas funcionan** | **Ruta A — StatusCake** (§1.4). Es la respuesta correcta. |
| **Falla cualquiera de las dos** | **Ruta B — HetrixTools** (§1.6). Pierdes la etiqueta «es DNS», ganas intervalo de 1 minuto. |

## 1.4 Ruta A — StatusCake (principal)

**Por qué gana:** *la herramienta no cambia entre 8 y 58 dominios, solo cambia el plan*. Mismo producto, misma API, mismo script. A partir del dominio nº 10 pulsas «upgrade» y sigues. Esa continuidad es la razón principal, no el precio.

- **Gratuito:** 10 uptime tests, intervalo de 5 minutos, 1 domain test, 1 SSL test, 14 integraciones (Slack, Microsoft Teams, Discord).
- **A 58 tiendas:** plan **Superior**, **19,99 €/mes** en facturación mensual o **16,66 €/mes** con pago anual → **~200 €/año**, 100 tests, intervalo de 1 minuto. Salen ~3,45 € por tienda y año. Eso se repercute en la cuota y no lo nota nadie.

### 1.4.1 Reparto de los 10 tests gratuitos de hoy

Con 8 dominios y 10 tests, la única distribución que tiene sentido es:

- **8 tests de tipo DNS**, uno por dominio, contra `dns_server=1.1.1.1` («¿lo ve el mundo?»).
- **2 tests HTTP** contra `/health` de los dos dominios que más te preocupan (lasrosas y lagoh).

Cuando pases a Superior (100 tests), el reparto bueno es **58 DNS + 58 HTTP** — no cabe, así que serían 58 DNS + 42 HTTP, o directamente el escalón siguiente. Con 58 tiendas revisa el precio en el momento.

> **Truco que aplica justo al incidente de hoy, cuando tengas tests de sobra:** haz **dos** tests DNS por dominio, uno con `dns_server=1.1.1.1` y otro con `dns_server=<el NS de Cloudflare asignado a esa zona>`. El segundo es el que devuelve REFUSED y el que te dice la causa en el propio aviso.

### 1.4.2 Antes del alta: saca las IPs reales de cada dominio

El test DNS de StatusCake compara los registros devueltos contra una lista de IPs esperadas (`dns_ips`). Necesitas saber qué devuelve hoy cada dominio. Abre en el navegador, uno por uno:

```
https://dns.google/resolve?name=usafitnessmarineda.com&type=A
```

O sácalos todos de una vez (Git Bash):

```
for d in usafitnessvillanueva.com usafitnessmarineda.com usafitnesslasrosas.com usafitnessalcobendas.com usafitnessgrancasa.com usafitnessvigo.com usafitnesselarcangel.com usafitnesslagoh.com; do echo -n "$d,"; curl -s "https://dns.google/resolve?name=$d&type=A" | grep -o '"data":"[0-9.]*"' | cut -d'"' -f4 | paste -sd'|' -; done
```

> ⚠️ **Aviso honesto sobre esto:** los dominios proxeados por Cloudflare devuelven IPs **anycast de un pool**, y Cloudflare puede rotarlas. Si pones una sola IP en `dns_ips`, existe riesgo de falsas alarmas. Mitigación: mete **todas** las IPs que devuelva hoy la consulta, y si en la primera semana ves avisos que se resuelven solos en un minuto, ese dominio pásalo a monitor HTTP y quédate con el DNS solo para los dominios con IP estable. No lo he podido verificar en vivo con estas zonas.

### 1.4.3 Alta de un dominio por panel (para aprender el flujo)

Hazlo **una vez** a mano, para ver los nombres reales de los campos, y las 7 restantes por API.

1. **Uptime** → **New Uptime Test** *(nombre del botón no verificado; el panel puede llamarlo «Add New Test»)*.
2. **Test type:** DNS.
3. **Website URL:** `usafitnesslasrosas.com` (sin `https://`).
4. **Check rate:** 5 minutes.
5. **DNS IPs:** las IPs que sacaste en 1.4.2.
6. **DNS server:** `1.1.1.1`.
7. **Confirmation:** que avise tras **2** comprobaciones fallidas, no tras 1. Un fallo transitorio de DNS pasa; dos seguidos, no.
8. Asigna el **grupo de contactos** que crearás en §1.7.
9. Guardar.

### 1.4.4 Alta por API (el comando que convierte 58 formularios en un bucle)

Un test DNS:

```
curl -X POST https://api.statuscake.com/v1/uptime -H "Authorization: Bearer $STATUSCAKE_TOKEN" -d "name=lasrosas-dns" -d "test_type=DNS" -d "website_url=usafitnesslasrosas.com" -d "check_rate=300" -d "dns_ips[]=104.21.0.0" -d "dns_server=1.1.1.1"
```

Un test HTTP contra `/health`:

```
curl -X POST https://api.statuscake.com/v1/uptime -H "Authorization: Bearer $STATUSCAKE_TOKEN" -d "name=lasrosas-http" -d "test_type=HTTP" -d "website_url=https://usafitnesslasrosas.com/health" -d "check_rate=300"
```

El bucle para las 58, leyendo un CSV `dominio,ip` como el que genera el comando de 1.4.2:

```
while IFS=, read -r dominio ips; do curl -s -X POST https://api.statuscake.com/v1/uptime -H "Authorization: Bearer $STATUSCAKE_TOKEN" -d "name=$dominio-dns" -d "test_type=DNS" -d "website_url=$dominio" -d "check_rate=300" -d "dns_ips[]=$ips" -d "dns_server=1.1.1.1"; echo " <- $dominio"; sleep 2; done < dominios.csv
```

**Parámetros obligatorios** (verificados en la doc oficial de la API): `name`, `test_type`, `website_url`, `check_rate`. Valores válidos de `test_type`: `DNS`, `HEAD`, `HTTP`, `PING`, `SMTP`, `SSH`, `TCP`. Para `test_type=DNS` son condicionalmente obligatorios `dns_ips` y `dns_server`.

> **Escribe el script desde el día 1, aunque hoy sean 8.** El script de 8 y el de 58 son el mismo con una lista más larga. Si hoy los das de alta a mano, el día de la tienda 20 repites el trabajo entero.

## 1.5 Capa 2 gratuita: UptimeRobot (aviso al móvil)

Son gratis, tardas 30 minutos, y si uno de los dos proveedores tiene un mal día no te quedas ciego otra vez. A escala consolidas en uno.

- **Gratuito:** 50 monitores, intervalo mínimo 5 minutos, 3 meses de retención, 1 status page.
- **Uso comercial permitido.** Desde el 15 de junio de 2026 su documentación dice literalmente: *«Yes. The free plan can be used for business, commercial, and revenue-generating projects.»* Muchas comparativas de internet siguen repitiendo la prohibición vieja (octubre 2024 – junio 2026). Está revertida.
- **El chequeo de tipo DNS NO está en el gratuito.** *«DNS monitoring is available on Solo, Team, and Enterprise plans.»* Por eso es capa 2 y no principal.
- **Su valor real aquí:** la **app oficial iOS/Android con push**, gratis y sin gastar créditos de SMS.

Alta de un monitor HTTP por API v3:

```
curl -X POST https://api.uptimerobot.com/v3/monitors -H "Authorization: Bearer $UPTIMEROBOT_TOKEN" -H "Content-Type: application/json" -d '{"type":"HTTP","url":"https://usafitnesslasrosas.com/health","interval":300}'
```

> ⚠️ **Haz esta llamada con UN solo monitor antes de lanzar ningún bucle.** El nombre exacto del campo del nombre amistoso no está confirmado (`friendlyName` o `friendly_name`). Lanza una, lee la respuesta, y ajusta el bucle con el nombre que veas.
>
> Usa **v3**. La v2 (`POST /v2/newMonitor` con `api_key` en el cuerpo) está marcada oficialmente como legacy: *«This version is no longer receiving updates or new features.»*
>
> Límite de peticiones en el plan free: 10 req/min. Con `sleep 7` entre llamadas vas sobrado.

**Precios reales de UptimeRobot, por si alguna vez lo consideras como principal** (aquí hay una trampa que muchas comparativas cuentan mal): el plan **Solo tiene dos niveles**, no uno.

| Plan | Monitores | Mensual | Anual | ¿DNS? |
|---|---|---|---|---|
| Free | 50 | 0 € | 0 € | ❌ |
| Solo (nivel 10) | 10 | 10 €/mes | 9 €/mes | ✅ |
| Solo (nivel 50) | 50 | 22 €/mes | 19 €/mes | ✅ |
| Team | 100 | 41 €/mes | 35 €/mes | ✅ |
| Scale | 200 / 500 | 77 € / 179 €/mes | 65 € / 149 €/mes | ✅ |

Para los **8 de hoy** con DNS de verdad, **Solo-50 (228 €/año)** es una opción real. Para las **58** hay que ir a **Team (420 €/año)**, que sigue siendo el doble que StatusCake Superior (~200 €/año). Por eso StatusCake gana a escala.

## 1.6 Ruta B — HetrixTools (plan B, si StatusCake gratuito no da DNS o API)

- **Gratuito:** 15 monitores, **intervalo de 1 minuto** (el mejor gratuito del comparativo), 4 localizaciones, status pages ilimitadas.
- **A 58:** plan **Business, 19,95 $/mes**, 60 monitores. Cubre las 58 justo.
- **Telegram gratis**, que es la vía más directa al móvil sin instalar app propietaria.
- **Su monitor de dominio detecta cambios de nameservers** — literalmente el disparador del incidente de hoy.

**Lo que pierdes:** no tiene tipo de monitor «DNS record check» con valor esperado. Sus tipos son website/HTTP, ping, service/port, SMTP y heartbeat. Un fallo de resolución te llegaría como «caído», no como «caído por DNS». Sí mide el tiempo de DNS Lookup.

Alta por API *(estructura tomada de su documentación; no verificada con una llamada real)*:

```
curl -X POST "https://api.hetrixtools.com/v2/$HETRIX_TOKEN/uptime/add/" -H "Content-Type: application/json" -d '{"Type":"website","Name":"lasrosas","Target":"https://usafitnesslasrosas.com/health","Timeout":10,"ContactList":"0","Category":"0"}'
```

Ojo: el token va **en la URL**, no en cabecera.

> ⚠️ **Riesgo operativo del gratuito de HetrixTools:** exige actividad en la cuenta (entrar cada 90 días) o desactivan los monitores. Si lo dejas como capa de respaldo olvidada, un día se apaga solo. Ponte un recordatorio trimestral.

## 1.7 Avisos al móvil

Configura **el mismo grupo de contactos** para todos los tests, y no lo cambies por test. Con 58 monitores, un canal distinto por tienda es un canal que un día no revisas.

**Ruta A (StatusCake):** email + una de las 14 integraciones. **Discord** es lo más rápido de montar para el móvil: crea un servidor privado solo tuyo, un canal `#caidas`, un webhook, y activa las notificaciones push de ese canal en la app de Discord.

**Ruta B (HetrixTools):** **Telegram**, gratis y confirmado. Es la más directa.

**Capa 2 (UptimeRobot):** instala la app oficial y activa el push. Gratis y sin créditos.

> **No confirmado:** si StatusCake tiene integración nativa con Telegram en el plan gratuito. Sé que hay 14 integraciones e incluyen Slack, Teams y Discord. Si Telegram es tu canal preferido, eso empuja hacia HetrixTools.

## 1.8 La prueba del fallo provocado (sin esto, el monitor es un placebo)

**Un monitor que nunca ha disparado no es un monitor, es una suposición.** Haz esto hoy, no «cuando tengas un rato».

**Paso 1.8.1.** Crea un test **desechable**, con el **mismo grupo de contactos** que los reales, apuntando a un hostname que no puede existir:

```
curl -X POST https://api.statuscake.com/v1/uptime -H "Authorization: Bearer $STATUSCAKE_TOKEN" -d "name=PRUEBA-BORRAR" -d "test_type=DNS" -d "website_url=prueba-de-aviso-usafitness-no-existe.com" -d "check_rate=300" -d "dns_ips[]=1.2.3.4" -d "dns_server=1.1.1.1"
```

**Paso 1.8.2.** Espera. Con `check_rate=300` y confirmación a 2 fallos, el aviso tarda unos 10-15 minutos. **No hagas nada más hasta que llegue.**

**Paso 1.8.3.** Comprueba estas cuatro cosas, en este orden:

- [ ] Llegó el aviso.
- [ ] Llegó **al móvil**, no solo al correo del portátil.
- [ ] Se leía **de qué dominio** hablaba sin abrir nada.
- [ ] **Llegó con el móvil en su estado normal de noche** (silencio, No Molestar, o como lo tengas). Este es el que falla. Un push que el modo silencio se traga a las 3 de la mañana es un monitor que no existe. Si no suena, cambia el canal o sube ese contacto a excepción de No Molestar.

**Paso 1.8.4.** Borra el test de prueba. Y anota el hueco: entre el fallo real y el aviso pasan unos 10-15 minutos en el plan gratuito, ~4 minutos en Superior. Ese es tu tiempo de reacción real, no cero.

**Paso 1.8.5.** Repite esta prueba **cada vez que cambies de plan, de canal de aviso o de móvil.** Tres veces al año como mucho, y es lo que separa vigilar de creer que vigilas.

## 1.9 La segunda red: un cron tuyo, gratis (15 minutos, muy recomendado)

**Cloudflare no tiene ninguna alerta configurable de estado de zona.** Está verificado enumerando su catálogo completo de Notifications: no existe «zone deactivated», ni «zone status change», ni «nameserver change». Las únicas notificaciones DNS son de Secondary DNS y requieren Enterprise. «Traffic Anomalies Alert» es solo Enterprise. Los Health Checks son Pro **y además no verían esto**, porque vigilan un origen, no la resolución del dominio público.

Así que esta red hay que construirla. Son 30 líneas y ya tienes GitHub.

Crea `.github/workflows/vigilancia-dns.yml`:

```yaml
name: vigilancia-dns
on:
  schedule:
    - cron: '0 7 * * *'
  workflow_dispatch:
jobs:
  comprobar:
    runs-on: ubuntu-latest
    steps:
      - name: Resolucion real desde fuera
        run: |
          FALLOS=0
          for D in usafitnessvillanueva.com usafitnessmarineda.com usafitnesslasrosas.com usafitnessalcobendas.com usafitnessgrancasa.com usafitnessvigo.com usafitnesselarcangel.com usafitnesslagoh.com; do
            S=$(curl -s "https://dns.google/resolve?name=$D&type=A" | grep -o '"Status":[0-9]*' | cut -d: -f2)
            if [ "$S" != "0" ]; then echo "::error::$D no resuelve (Status=$S)"; FALLOS=1; else echo "ok $D"; fi
          done
          exit $FALLOS
      - name: Inventario de zonas en Cloudflare
        env:
          CF_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: |
          ESPERADOS="usafitnessmarineda.com usafitnesslasrosas.com usafitnessalcobendas.com usafitnessgrancasa.com usafitnessvigo.com usafitnesselarcangel.com usafitnesslagoh.com"
          RESP=$(curl -s "https://api.cloudflare.com/client/v4/zones?per_page=50&page=1" -H "Authorization: Bearer $CF_TOKEN")
          FALLOS=0
          for D in $ESPERADOS; do
            if ! echo "$RESP" | grep -q "\"name\":\"$D\""; then echo "::error::$D NO EXISTE como zona en Cloudflare"; FALLOS=1; fi
          done
          echo "$RESP" | grep -o '"status":"[a-z]*"' | sort -u
          exit $FALLOS
```

Dos cosas que hay que entender de este fichero, porque son la diferencia entre que sirva y que no:

**(a) La comprobación B compara contra una lista fija y grita por los que FALTAN, no solo por los que están en mal estado.** El filtro `status` de la API de Cloudflare solo admite `initializing`, `pending`, `active` y `moved`. **Las zonas borradas o purgadas no aparecen en el listado en absoluto.** Un script que solo mire estados **no habría detectado lo de hoy**: simplemente no salen.

**(b) La comprobación A es la que cubre el agujero de `/health`.** Si el DNS no resuelve no hay petición HTTP que hacer, así que ningún monitor de códigos HTTP puede diagnosticarlo. Es literalmente la técnica con la que se encontró el segundo dominio caído.

Que el Action **falle** si algo no cuadra: el email de GitHub Actions ya es la alerta, no hace falta montar nada más.

**El token de Cloudflare:** My Profile → API Tokens → Create Token → permiso **`Zone → Zone → Read`** sobre todas las zonas de la cuenta. Guárdalo como secret de GitHub con el nombre `CLOUDFLARE_API_TOKEN`. **El valor solo se muestra una vez.**

Con 58 dominios hacen falta **dos páginas** (`per_page` tiene un máximo de 50): añade una llamada con `&page=2`.

---

# 2. Search Console

**No hagas este bloque hasta que el 0 esté cerrado.** Verificar en Search Console un dominio que no resuelve es imposible por construcción: Google necesita leer el TXT por DNS, exactamente el mismo agujero que tiene `/health`.

Hoy son **5 dominios verificables**: marineda, alcobendas, grancasa, vigo, elarcangel. Lasrosas y lagoh cuando resuelvan. Villanueva, cuando decidas qué haces con él.

## 2.1 Antes de tocar nada: no borres los TXT que ya hay

**5 de los 8 dominios ya tienen un registro `google-site-verification` en DNS** (marineda, alcobendas, grancasa, vigo, elarcangel — villanueva no tiene ninguno). No son tuyos casi con seguridad: todos los dominios llevan `include:spf.profesionalhosting.com` en el SPF, así que lo más probable es que sean de la agencia anterior o del hosting.

**No los borres.** Google permite varios propietarios y varios TXT a la vez, y borrar el ajeno puede tirar accesos de terceros sin avisar y sin que te enteres. **Añade un SEGUNDO registro TXT con tu token, en paralelo.**

## 2.2 Alta por panel (5 dominios, ~15 minutos)

**Paso 2.2.1.** Entra en Search Console y abre el **desplegable selector de propiedades** (arriba a la izquierda, en cualquier página) → **«+ Añadir propiedad»**.

**Paso 2.2.2.** Elige el **TIPO de propiedad**: **«Propiedad de sitio web»**.

> ⚠️ **La pantalla cambió hace menos de dos meses.** El diálogo de dos columnas («Dominio» a la izquierda, «Prefijo de URL» a la derecha) ya no existe. Google introdujo las «propiedades de plataforma» el 7 de julio de 2026, con despliegue completo el 29 de julio de 2026. Ahora te pide **primero el tipo**. Vas a ver una lista que incluye Instagram, TikTok, X y YouTube — esas son «Propiedad de plataforma», no es lo tuyo. También hay «Propiedades alojadas en Google» (Sites, Blogger, Workspace). **Tú quieres «Propiedad de sitio web».**

**Paso 2.2.3.** Dentro de sitio web, elige **«Propiedad de dominio (example.com)»**, **no** «Propiedad de prefijo de URL».

**Paso 2.2.4.** Escribe el dominio pelado: `usafitnessvigo.com`. Sin `https://` y sin `www`.

**Paso 2.2.5.** Google te muestra el método **«Proveedor de nombres de dominio»**. En **«Selecciona el tipo de registro»** elige **TXT**. Copia la cadena completa `google-site-verification=...`.

**Paso 2.2.6.** En Cloudflare: **DNS → Records → Add record**.
- **Type:** TXT
- **Name:** `@` (Cloudflare lo mostrará luego como el dominio raíz)
- **Content:** la cadena `google-site-verification=...` **entera**
- **TTL:** Auto

**Paso 2.2.7. No busques la nube naranja. No existe en un TXT.** Cita literal de Cloudflare: *«Only records used for IP address resolution — A, AAAA, and CNAME records — can be proxied. Other record types (such as MX or TXT) are always DNS-only.»* Varios blogs dicen que hay que apagar el proxy para el TXT: es falso, ese interruptor ni siquiera aparece.

**Paso 2.2.8.** Vuelve a Search Console y pulsa **«Verificar»**. Si falla al primer intento, espera 5 minutos y reintenta. El TTL de Cloudflare es corto; no suele tardar horas.

**Paso 2.2.9. No borres nunca el TXT.** Aviso literal de Google: *«Important: To stay verified, don't remove the DNS record from your provider, even after verification succeeds.»* No es un paso de un solo uso.

## 2.3 El sitemap

**Buena noticia: la mitad ya está hecha en el código.** Verificado en este repo:

- `src/pages/robots.txt.ts` ya emite `Sitemap: https://<dominio>/sitemap.xml` construyendo el origen desde la cabecera `Host` real. Cada dominio anuncia **su** sitemap, no el de otro.
- `src/pages/sitemap.xml.ts` es **por tienda**: cada dominio lista solo sus propias URLs canónicas. No hay mezcla entre sociedades. (Es el fallo clásico en multi-dominio con un solo servicio, y aquí está evitado.)

Aun así, envíalo a mano la primera vez para que Google no espere a descubrirlo:

**Paso 2.3.1.** En Search Console, con la propiedad seleccionada: **Sitemaps** → escribe `sitemap.xml` → **Enviar**.

> El viejo truco de hacer ping a `google.com/ping?sitemap=...` **está muerto**: Google lo deprecó en junio de 2023 y devuelve 404. Las vías vivas son la directiva `Sitemap:` en robots.txt (ya la tienes), la UI, y la API.

## 2.4 La vía API (para las 50 que faltan)

**A 5-8 dominios el panel gana.** El script hay que escribirlo, autorizarlo por OAuth y depurarlo, y eso cuesta más que 8 formularios. Pero a 58 sí compensa, y el camino está verificado y es scriptable de punta a punta.

Son **dos APIs distintas** y hacen falta las dos. Este es el error que hace perder una tarde:

- La **Search Console API** (`sites.add`) **solo da de alta la propiedad. NO la verifica.**
- La **Site Verification API** (`webResource.insert`) es la que **verifica**.

**Paso 2.4.1. Crear el TXT en las 58 zonas** (API de Cloudflare, token con permiso `Zone → DNS → Edit`):

```
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -H "Authorization: Bearer $CLOUDFLARE_TOKEN" -H "Content-Type: application/json" -d '{"type":"TXT","name":"@","content":"google-site-verification=XXXXXXXX","ttl":1}'
```

**Paso 2.4.2. Pedir el token a Google** (scopes: `siteverification` y `webmasters`):

```
curl -X POST "https://www.googleapis.com/siteVerification/v1/token" -H "Authorization: Bearer $GTOKEN" -H "Content-Type: application/json" -d '{"verificationMethod":"DNS_TXT","site":{"type":"INET_DOMAIN","identifier":"usafitnessvigo.com"}}'
```

**Paso 2.4.3. Verificar** (esto es lo que registra la propiedad como tuya):

```
curl -X POST "https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=DNS_TXT" -H "Authorization: Bearer $GTOKEN" -H "Content-Type: application/json" -d '{"site":{"type":"INET_DOMAIN","identifier":"usafitnessvigo.com"}}'
```

Para dominio completo el body lleva `site.type = "INET_DOMAIN"` y `site.identifier` = **el dominio pelado**, no una URL.

**Paso 2.4.4. Dar de alta la propiedad en Search Console** (`sc-domain:` va URL-encodeado, los dos puntos son `%3A`):

```
curl -X PUT "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Ausafitnessvigo.com" -H "Authorization: Bearer $GTOKEN"
```

**Paso 2.4.5. Enviar el sitemap** (devuelve cuerpo vacío si va bien; requiere la propiedad ya verificada):

```
curl -X PUT "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Ausafitnessvigo.com/sitemaps/https%3A%2F%2Fusafitnessvigo.com%2Fsitemap.xml" -H "Authorization: Bearer $GTOKEN"
```

**Las cuotas no son el problema:** 20 QPS y 200 peticiones por minuto por usuario. 58 dominios son 58 llamadas. El cuello de botella real es el alta OAuth y tener las 58 zonas correctas en Cloudflare.

## 2.5 Search Console como canario de DNS (gratis, pero no es un monitor)

Verificado: *«Search Console periodically checks if your verification token is still present and valid.»* Si la zona no resuelve, Google no puede leer el TXT y esa comprobación falla igual que si lo hubieras borrado.

Y entonces: *«If verification can no longer be confirmed, you will be notified. If the issue is not fixed, your permissions on that property will expire after a certain grace period.»*

Traducido: **primero llega un email, y solo si no lo arreglas pierdes permisos**, pasado un periodo de gracia. Y los **datos no se pierden, se pierde el acceso**: *«Data for the property will continue to be collected, but nobody will have access to it until someone verifies ownership.»* Al arreglar el DNS y re-verificar, el histórico sigue ahí (retención máxima: 16 meses).

**Efecto secundario útil:** ese email es detección gratis de un fallo que `/health` no puede ver. **No lo uses como monitor**: Google no publica cada cuánto revisa ni cuánto dura el periodo de gracia. Es una red lenta e imprecisa detrás de la del bloque 1, no un sustituto.

---

# 3. GA4

## 3.1 ⚠️ Léelo antes de tocar el repo: rellenar `ga4Id` NO es un cambio invisible

Verificado en el código de este proyecto (`src/components/CookieConsent.astro`):

- La línea 17 es `const analitica = !!ga4Id;`. **En cuanto rellenas `ga4Id` y despliegas, esa web empieza a mostrar la sección de analítica en el aviso de cookies.**
- La línea 72 inyecta `https://www.googletagmanager.com/gtag/js?id=...` **solo después de que el visitante acepte**.

Es decir: cambias lo que ve el usuario **y** cambias qué terceros se cargan en la web de una sociedad ajena. **Avísalo al franquiciado antes de desplegar**, no después.

Segundo detalle verificado (`src/pages/[...slug].astro:60`): el `ga4Id` **solo se inyecta si estás en el dominio propio de la tienda** (o en localhost). Si pruebas en la URL de Railway o en el dominio de otra tienda, no verás nada, y no es un fallo.

## 3.2 Preparación (una vez, 5 minutos)

**Paso 3.2.1.** Entra en `analytics.google.com`.

**Paso 3.2.2.** Si no tienes cuenta: **«Administrar»** (engranaje abajo a la izquierda) → **«Crear»** → **«Cuenta»**. Nombre: `USAFitness`.

**Paso 3.2.3. UNA sola cuenta para las 58 tiendas.** No hagas una cuenta por tienda.

Los límites, verificados: **2.000 propiedades por cuenta de Analytics** y **100 cuentas de Analytics por cuenta de Google**. Con 58 tiendas usas el **2,9%** de una sola cuenta. El aislamiento entre franquiciados se consigue a nivel de **propiedad**, no de cuenta.

Y cuando llegas a un límite, Google no avisa antes ni degrada: *«Google Analytics doesn't allow you to configure an item once the limit for that item is reached.»* Simplemente deja de dejarte crear.

## 3.3 Alta de una tienda por panel (repetir 8 veces, ~4 min cada una)

**Recomendación de ejecución: haz las 8 a mano HOY, y escribe el script ANTES de la novena.** 8 × 4 minutos = media hora; escribir y depurar el script cuesta más que eso. Pero 58 × 4 minutos son casi 4 horas de panel, y a mano se cometen errores de dedo (una zona horaria mal, un dominio pegado en la propiedad equivocada) que contaminan el dato de una sociedad ajena.

Ejemplo con `usafitnesslasrosas.com`:

1. **«Administrar»**.
2. Botón **«Crear»** (arriba a la izquierda) → **«Propiedad»**.
3. **Nombre de la propiedad:** `USAFitness Las Rosas`. **Usa siempre el patrón `USAFitness <Tienda>`.** Con 58 propiedades en una lista, el orden alfabético es lo único que te salvará.
4. **Zona horaria de los informes:** España → **(GMT+01:00) Madrid**. ⚠️ Esto **no se puede cambiar** sin romper la comparabilidad histórica. Ponlo bien a la primera.
5. **Moneda:** Euro (EUR).
6. **«Siguiente»**.
7. **Categoría del sector:** la que más se acerque (Salud, o Fitness si aparece). **Tamaño de la empresa:** Pequeña. Solo afecta a informes de referencia, no al dato.
8. **«Siguiente»**.
9. **Objetivos de negocio:** marca **«Generar clientes potenciales»**. Es lo que hace este sitio: clics a llamar, WhatsApp y cómo llegar.
10. **«Crear»**. Si es la primera propiedad, acepta las Condiciones del Servicio y la Enmienda de Tratamiento de Datos.

Ahora el flujo de datos:

11. **«Administrar»** → sección **«Recogida y modificación de datos»** → **«Flujos de datos»**.

> ⚠️ Es **«Recogida»**, no «Recopilación». En inglés, «Data collection and modification».

12. **«Añadir flujo»** → **«Web»**.
13. **URL del sitio web:** `https://usafitnesslasrosas.com`. **Nombre del flujo:** `usafitnesslasrosas.com`. **Usa el dominio literal como nombre del flujo.** Con 58, adivinar «cuál era Marineda» a partir de un nombre bonito es tiempo perdido garantizado.
14. **Medición mejorada:** déjala **activada**. Te da scroll, clics salientes y búsqueda interna sin tocar código, y no entra en conflicto con los tres eventos propios.
15. **«Crear flujo»**.
16. Se abre el detalle del flujo. **En la primera fila está el ID de medición: `G-XXXXXXXXXX`.** Cópialo.
17. **Pégalo YA en la tabla de §5**, junto a su dominio. No confíes en volver a buscarlo: en la pantalla siguiente ya no sabrás cuál era cuál.

**No instales ningún tag.** La pantalla te ofrecerá «Instalar con un creador de sitios web / Instalar manualmente». **Ignórala.** El código de medición de este proyecto ya está escrito y ya sabe qué hacer con el ID.

## 3.4 Los tres eventos clave — y el REGISTRO ÚNICO de eventos del sistema

> Esta tabla es el registro canónico. Un nombre de evento que no esté aquí no
> existe: la hoja de objetivos (metodología §1) solo usa eventos de este
> registro, o los propone aquí en el mismo PR. El primer typo
> ver_oferta/oferta_vista parte la medición en dos y nadie lo ve hasta el
> informe — por eso hay UNA lista.

| Evento (nombre exacto) | Parámetros | Sección emisora | Estado |
|---|---|---|---|
| `contacto_llamada` | `seccion` (origen) | cualquier `tel:` | ✅ vivo |
| `contacto_whatsapp` | `seccion` | cualquier `wa.me` | ✅ vivo |
| `contacto_maps` | `seccion` | enlaces a Maps | ✅ vivo |
| `interes_socio` | `seccion` | Hazte socio | pendiente de instrumentar (F2) |
| `ver_oferta` | `seccion`, `origen` (central/propia) | Oferta del mes | pendiente (F2) |
| `ver_horario` | `seccion` | Hoy en tienda | pendiente (F2) — en informes se llama «intención de visita» |
| `ver_productos` | `seccion` | Productos y marcas | pendiente (F2) |
| `punto_de_partida` | `ruta` | Empieza aquí (asesor) | pendiente — aprobado 27-ago (ronda 2) |
| `verdad_abierta` | `cual` | Las verdades del mostrador | pendiente — aprobado 27-ago |
| `vale_orientacion` | `seccion` | /guia | pendiente — aprobado 27-ago |
| `pedir_cita` | `origen` | /guia (capa con móvil verificado) | pendiente — aprobado 27-ago |
| `pedir_reserva` | `seccion`, `producto` | Apártamelo | pendiente — aprobado 27-ago |
| `cupon_vuelta` | `origen` | Tarjeta que vuelve | pendiente — aprobado 27-ago |
| `unirse_canal` | `seccion` | Canal de WhatsApp | pendiente — aprobado 27-ago |


Los eventos de este proyecto se llaman **exactamente**:

```
contacto_llamada
contacto_whatsapp
contacto_maps
```

**Créalos ANTES de que llegue tráfico.** Marcar un evento como clave **no es retroactivo**: *«Marking an event as a key event affects reports from time of creation. It doesn't change historic data.»* Cada hora con el `ga4Id` puesto y el evento sin marcar es una hora de conversiones que no se contabilizan.

**Por panel:** **«Administrar»** → **«Visualización de datos»** → **«Eventos»** → en la fila del evento, activa el **interruptor «Marcar como evento clave»**, y elige el valor predeterminado y el método de recuento.

> Circulaba una contradicción sobre si es un interruptor o un icono de estrella. **Es un interruptor.** La página canónica de Google dice literalmente: *«Click the toggle next to Mark as key event, and then select your preferred Default key event value and Counting method.»* El icono de estrella pertenece a una vista distinta y más antigua.
>
> Y la terminología vigente es **«eventos clave»**, no «conversiones». El cambio fue en marzo de 2024, es permanente y no hay opción de revertirlo. Cualquier guía que hable de «conversiones» en GA4 está desactualizada.

**Pega este método de recuento: `ONCE_PER_SESSION`** (una vez por sesión), no `ONCE_PER_EVENT`. Si alguien pulsa WhatsApp tres veces porque se equivocó, eso es **una** intención de contacto, no tres. Con `ONCE_PER_EVENT` el informe que le enseñas al franquiciado está inflado, y se nota en cuanto lo cruza con su bandeja de WhatsApp.

**El problema del panel:** hay que esperar a que el evento llegue solo para poder marcarlo, y volver a entrar en 58 propiedades. Por eso la vía API es la buena.

## 3.5 La vía API (para las 50 restantes)

**Paso 3.5.1.** En `console.cloud.google.com`, crea o elige un proyecto y habilita **«Google Analytics Admin API»** (`analyticsadmin.googleapis.com`).

**Paso 3.5.2.** Autentícate **como tú mismo**, no con cuenta de servicio (así evitas tener que dar de alta un email raro en Analytics):

```
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/analytics.manage.users,https://www.googleapis.com/auth/cloud-platform"
```

```
TOKEN=$(gcloud auth application-default print-access-token)
```

> ⚠️ Tiene que ser **`application-default print-access-token`**. El `gcloud auth print-access-token` a secas **no lleva los scopes de Analytics** y te dará 403.

**Paso 3.5.3.** Averigua el ID numérico de tu cuenta (Administrar → Configuración de la cuenta, o `GET https://analyticsadmin.googleapis.com/v1beta/accounts`).

**Paso 3.5.4. Crear la propiedad:**

```
curl -s -X POST "https://analyticsadmin.googleapis.com/v1beta/properties" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"parent":"accounts/123456","displayName":"USAFitness Las Rosas","timeZone":"Europe/Madrid","currencyCode":"EUR","industryCategory":"OTHER"}'
```

La respuesta trae `"name": "properties/987654321"`. Guarda el número.

**Paso 3.5.5. Crear el flujo web y recoger el ID de medición en la misma pasada:**

```
curl -s -X POST "https://analyticsadmin.googleapis.com/v1beta/properties/987654321/dataStreams" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"type":"WEB_DATA_STREAM","displayName":"usafitnesslasrosas.com","webStreamData":{"defaultUri":"https://usafitnesslasrosas.com"}}'
```

La respuesta trae `"webStreamData": { "measurementId": "G-XXXXXXXXXX" }`. **Eso es lo que buscas.** El script puede crear propiedad + flujo y quedarse con el `G-` sin abrir el panel.

> ⚠️ **El tipo es `WEB_DATA_STREAM`, no `WEB`.** Es el error más común aquí y da un 400 poco descriptivo.

**Paso 3.5.6. Los tres eventos clave:**

```
for E in contacto_llamada contacto_whatsapp contacto_maps; do curl -s -X POST "https://analyticsadmin.googleapis.com/v1beta/properties/987654321/keyEvents" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"eventName":"'"$E"'","countingMethod":"ONCE_PER_SESSION"}'; done
```

**Paso 3.5.7 (opcional, pero es LA razón de una propiedad por tienda). Dar acceso de solo lectura al franquiciado:**

```
curl -s -X POST "https://analyticsadmin.googleapis.com/v1alpha/properties/987654321/accessBindings" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"user":"franquiciado.lasrosas@ejemplo.com","roles":["predefinedRoles/viewer"]}'
```

`accessBindings` **solo existe en v1alpha** (no en v1beta) y usa un scope distinto, `analytics.manage.users`. Por eso el paso 3.5.2 pide los dos scopes.

**Paso 3.5.8. Ritmo.** Son 5 escrituras por tienda. El límite es **180 escrituras/minuto por usuario** (y 600/min por proyecto). 58 × 5 = 290 escrituras: cabe, pero supera el límite por usuario si lo lanzas de golpe. Mete un `sleep 2` entre tiendas y no te acercarás. **No lances las 58 en paralelo.**

**Lo único que NO se puede automatizar** es crear la **cuenta** de Analytics: `accounts:provisionAccountTicket` (solo v1alpha) devuelve un ticket, pero un humano tiene que abrir un enlace y aceptar las Condiciones del Servicio. Eso se hace una vez.

## 3.6 Pegar los IDs en el repo

**Paso 3.6.1.** Edita **`src/data/stores.json`** y añade el campo `ga4Id` a cada tienda con su `G-XXXXXXXXXX`.

**Paso 3.6.2.** El esquema (`src/data/stores.ts:238`) valida el formato `/^(G|GT)-[A-Z0-9]+$/` y hace fallar el build si te equivocas de **formato**. **Pero si te equivocas de TIENDA, no te lo va a decir nadie.** Revisa la correspondencia dominio → ID **dos veces** antes de commitear: pegar el ID de Marineda en la ficha de Vigo significa mandar los datos de una sociedad a la cuenta de otra.

**Paso 3.6.3.** Despliega. Después, comprueba cuántas tiendas están midiendo sin abrir GA4:

```
curl -s https://usafitnessmarineda.com/health
```

Mira el campo `midiendoFlota` (cuántas de las 8 tienen ID) y `midiendo` (si mide **esta** tienda). Verificado en `src/data/salud.ts:52-54`.

## 3.7 Verificar que funciona

1. Abre `https://usafitnesslasrosas.com` **en el dominio propio** (no en la URL de Railway), en ventana de incógnito.
2. **ACEPTA EL AVISO DE COOKIES.** Esto es obligatorio y es la trampa número uno de este proyecto: la puerta de consentimiento **no carga ni un byte de Google** hasta que el visitante acepta. Si no aceptas, GA4 marcará cero y pensarás que lo has hecho mal.
3. En GA4: **Informes → Tiempo real**. Deberías aparecer en unos minutos.
4. Pulsa el botón de llamar, el de WhatsApp y el de «cómo llegar». En la tarjeta de eventos de Tiempo real deberían salir `contacto_llamada`, `contacto_whatsapp` y `contacto_maps`.
5. **Interpretación:** si Tiempo real te ve pero los tres eventos no salen → el problema es el código de medición. Si Tiempo real **no** te ve → el problema es el ID o el consentimiento.

## 3.8 Qué esperar y cuándo (para no repetir el trabajo)

| Cuándo | Qué |
|---|---|
| Minutos | Apareces en **Tiempo real**. Es la única confirmación inmediata que existe. |
| Hasta unas horas | El marcado de evento clave termina de aplicarse. |
| 2-6 horas | Primeros datos intradía en los informes normales. |
| 12-24 horas | Datos del día anterior consolidados. |
| **24-48 horas** | **Procesamiento inicial de una propiedad nueva. Durante este periodo las cifras pueden cambiar solas. Es normal.** |

**Regla: no toques nada, no vuelvas a crear nada y no le enseñes números al franquiciado hasta que hayan pasado 48 horas.** Si a las 48 horas los informes estándar siguen vacíos **pero** Tiempo real funcionaba, el problema no es GA4: es que no ha entrado tráfico.

## 3.9 Dos avisos que van a doler si no los dices tú primero

**(1) GA4 no es un monitor.** Lo que pasó hoy con lasrosas y lagoh se vería en GA4 como una caída a cero en Tiempo real, y nadie mira Tiempo real de 58 propiedades. Además GA4 no distingue «web caída» de «nadie ha entrado esta mañana», y menos con la puerta de consentimiento delante. **GA4 responde «cuánta gente contacta». No responde «sigue viva la web».**

**(2) La puerta de consentimiento subcuenta a propósito.** GA4 solo verá a los visitantes que aceptan el aviso. **El número de GA4 será menor que el tráfico real**, y esa diferencia hay que explicársela al franquiciado **antes** de enseñarle el primer informe, no después de que pregunte por qué su web «tiene tan pocas visitas». Es el precio correcto de no inyectar Google sin permiso, pero es un precio. El bloque 4 te da el contraste.

---

# 4. Cloudflare Web Analytics

**Veredicto: sí, merece la pena. Cuatro clics, cero código, cero coste — y es el único sitio donde vas a ver el tráfico real, el que GA4 no mide porque no aceptó el aviso.** Ese contraste es lo que hace que la conversación del punto 3.9(2) sea un dato y no una excusa.

Sigue existiendo en 2026, sigue gratis y está *«Available on all plans»*. Documentación actualizada en agosto de 2026, sin aviso de deprecación.

## 4.1 Activación (4 clics por dominio)

1. Panel de Cloudflare → menú de la **CUENTA** (no el de la zona) → **«Analytics & Logs»** → **«Web Analytics»**.
2. Botón **«Add a site»**.

> Este sí es «Add a site». No confundir con el «Onboard a domain» del bloque 0 — son productos distintos.

3. Elige el hostname del desplegable.
4. **«Done»**. Deja el modo automático por defecto.

**No elijas «Enable, excluding visitor data in the EU».** Suena a la solución perfecta al problema de consentimiento, pero los 8 gimnasios son españoles: prácticamente el 100% del tráfico es de la UE, así que activarla equivale a no medir nada.

**Verifica que inyecta:** abre la web, ver código fuente, busca `beacon.min.js`.

**Dos comprobaciones hechas en este repo, para que no pierdas tiempo si no aparece:**
- ✅ **No hay ninguna Content-Security-Policy** en el proyecto que pudiera bloquear `beacon.min.js` (revisado `src/middleware.ts`, `astro.config.mjs` y `src/`).
- ✅ **El origen no envía `Cache-Control: public, no-transform`** en el HTML, que es la otra condición que haría que Cloudflare no pudiera inyectar el snippet.

Así que si no aparece, no es el proyecto: revisa que el dominio esté proxeado (nube naranja).

**No sirve para `usafitnessvillanueva.com`** mientras no esté proxeado en Cloudflare: *«you can only use the automatic setup with JS snippet injection if traffic to your domain is proxied through Cloudflare».*

**Coste a escala:** un site tag **no vale para otro dominio** (*«Can I use the same JS Snippet for a different domain? No.»*). Son 58 altas manuales de 4 clics. No he encontrado API para esto.

**Un clic gratis más:** activa la notificación **«Weekly summary»** de Web Analytics (disponible en todos los planes). Es lenta, pero un dominio con cero visitas en el resumen semanal canta. Red terciaria, gratis.

## 4.2 Sobre el consentimiento: mi lectura, y su límite

**Mi lectura es que se puede activar sin aviso de cookies.** Razonamiento:

- Cita literal de Cloudflare: *«It does not use any client-side state, such as cookies or localStorage, to collect usage metrics»* y *«We also don't fingerprint individuals via their IP address, User Agent string, or any other data.»*
- El **artículo 22.2 de la LSSI** (y el 5.3 de la Directiva ePrivacy), que es lo que obliga al banner, regula *«almacenar información o acceder a información ya almacenada en el equipo terminal»*. Si no se almacena ni se lee nada, ese artículo no se activa.
- **Cloudflare ya es el proxy de estos dominios**, así que ya recibe la IP y la petición de cada visitante por necesidad técnica de servir la web. Activar Web Analytics **no incorpora un destinatario nuevo de datos personales**. Eso lo diferencia radicalmente de Google Analytics o Meta Pixel.
- Base legal: **interés legítimo (art. 6.1.f RGPD)**, con mención en la política de privacidad.

**Y aquí el límite honesto:**
- El script **se descarga de `static.cloudflareinsights.com`, que es un dominio de tercero** — lo demuestra la propia guía de CSP de Cloudflare, que exige permitir `script-src https://static.cloudflareinsights.com/beacon.min.js`. Lo que sí es de primera parte es el **envío**: con inyección automática el beacon reporta a `/cdn-cgi/rum` del propio dominio.
- **No figura en la lista de la CNIL** de soluciones de medición de audiencia exentas de consentimiento (ahí están Matomo configurado, AT Internet, SmartProfile, Wysistat, Abla). La ausencia no significa prohibición — era un programa voluntario y Cloudflare no se presentó — pero significa que **no hay respaldo de autoridad al que agarrarse**.
- **No consta pronunciamiento de la AEPD** sobre esta herramienta concreta.

**Esto es razonamiento jurídico fundado, no un dictamen.** Antes de replicarlo a **58 empresas distintas**, que lo valide un asesor. El riesgo se multiplica por 58, y el que responde no eres tú.

*(Ventaja técnica de la inyección automática, por si te la discuten: Cloudflare le añade el atributo `integrity` — Subresource Integrity. Con instalación manual no se puede, porque Cloudflare no versiona el beacon.)*

## 4.3 Qué le puedes vender al franquiciado y qué NO

| ✅ Sí da | ❌ No da |
|---|---|
| Visits, Page views | Usuarios únicos reales |
| Page load time, Core Web Vitals (LCP, INP, CLS) | Sesiones |
| Filtro por país, host, ruta, referente | Nuevos vs recurrentes |
| Filtro por dispositivo, navegador, sistema operativo | Embudos de conversión |
| Exclude Bots, Navigation type | **Eventos personalizados** — «cuántos pulsaron WhatsApp» NO se mide con esto |
| | Atribución de campañas más allá del referer |
| | Tiempo de permanencia |

**Dos definiciones que hay que explicar o generarán discusiones:**

- **«Visit»** = *«A page view that originated from a different website or direct link»* — Cloudflare comprueba que el referer HTTP no coincida con el hostname. **No es una sesión ni una persona.** Un mismo usuario que vuelve tres veces al día desde Google cuenta **tres visitas**.
- **«Page view»** = una respuesta HTTP correcta con `content-type` HTML.

**Retención muy corta:** *«We retain unsampled beacon data for the past 7 days, after this point data is aggregated down to around 10%.»* **Siete días sin muestrear.** Si el franquiciado quiere comparar agosto con el agosto anterior, esto no le vale. **No pongas esta cifra por escrito en un contrato**: Cloudflare puede cambiarla sin avisar.

**Es un contador de visitas honesto, no una herramienta de marketing.** Dilo así desde el principio y te ahorras la conversación incómoda del mes tres.

---

# 5. Tabla de control

Imprímela o cópiala. Marca según avanzas.

## 5.1 Progreso

| Dominio | DNS resuelve | Monitor dado de alta | GSC verificado | Sitemap enviado | GA4 creado | `ga4Id` pegado | Web Analytics |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| usafitnessvillanueva.com ⚠️ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | n/a |
| usafitnessmarineda.com | ✅ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| usafitnesslasrosas.com 🔴 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| usafitnessalcobendas.com | ✅ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| usafitnessgrancasa.com | ✅ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| usafitnessvigo.com | ✅ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| usafitnesselarcangel.com | ✅ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| usafitnesslagoh.com 🔴 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

⚠️ villanueva: fuera de Cloudflare y sirviendo el WordPress viejo. Decide primero (§0.5).
🔴 lasrosas y lagoh: caídos. Bloque 0 antes que nada.

## 5.2 Datos que hay que apuntar según los sacas

| Dominio | Slug en `stores.json` | Nº de propiedad GA4 | `ga4Id` (G-…) | IP(s) A actuales |
|---|---|---|---|---|
| usafitnessvillanueva.com | `villanueva` | | | 45.154.57.16 |
| usafitnessmarineda.com | `marineda` | | | |
| usafitnesslasrosas.com | `lasrosas` | | | |
| usafitnessalcobendas.com | `alcobendas` | | | |
| usafitnessgrancasa.com | `grancasa` | | | |
| usafitnessvigo.com | `vigo` | | | |
| usafitnesselarcangel.com | `arcangel` | | | |
| usafitnesslagoh.com | `lagoh` | | | |

*(Ojo al slug de El Arcángel: en `stores.json` es `arcangel`, no `elarcangel`.)*

## 5.3 Tareas de una sola vez

| Tarea | Bloque | Hecho |
|---|---|:---:|
| lasrosas y lagoh vuelven a resolver (Status 0 en dns.google) | §0.2 | ☐ |
| Revisado el correo de Cloudflare buscando el aviso perdido | §0.2.9 | ☐ |
| Decidido qué pasa con villanueva | §0.5 | ☐ |
| Escrito el procedimiento de alta de dominio (5 pasos) donde no se pierda | §0.4 | ☐ |
| Comprobado en el panel si StatusCake gratuito da DNS + API | §1.3 | ☐ |
| Grupo de contactos de aviso creado y configurado | §1.7 | ☐ |
| **Prueba del fallo provocado: el aviso llegó al móvil en silencio** | §1.8 | ☐ |
| GitHub Action `vigilancia-dns.yml` funcionando | §1.9 | ☐ |
| Notificación «Weekly summary» de Web Analytics activada | §4.1 | ☐ |
| Script de alta escrito (aunque hoy se ejecute a mano) | §1.4.4 | ☐ |

---

# 6. Lo que no se ha podido confirmar

Léelo. Es donde puedes perder una tarde si te fías de más.

## Bloquea la recomendación principal

- **StatusCake plan gratuito: si el tipo de test DNS y el acceso a la API están incluidos.** Ni su página de precios ni su base de conocimiento desglosan los tipos de test por plan. **Toda la recomendación principal del bloque 1 depende de esto.** Son 5 minutos de comprobación en el panel (§1.3) y hay plan B definido (HetrixTools).

## Cloudflare y el incidente

- **La causa raíz exacta de lasrosas y lagoh.** El síntoma está verificado en vivo (REFUSED desde los NS de Cloudflare, mientras marineda funciona en esos mismos NS). Que sea «zona en Finish setup» o «zona purgada» es deducción a partir de la documentación: son los dos únicos estados documentados en los que Cloudflare no responde a ninguna consulta. **No he visto tu panel.** Podría ser también zona en otra cuenta de Cloudflare, o registros DS/DNSSEC obsoletos en el registrador. Si el panel muestra «Pending Nameserver Update», mi diagnóstico es erróneo.
- **Desde cuándo estaba caído lagoh.** Se descubrió durante esta investigación; el encargo solo mencionaba lasrosas.
- **Si Cloudflare manda email cuando una zona Free se autoborra** por llevar 28 días en Finish setup o Pending. La documentación solo dice que se envía email «si el estado de la zona cambia»; un borrado automático podría no generar aviso útil.
- **Cuántas cuentas de Cloudflare hay.** Los 7 dominios comprobados comparten el par michelle/mitchell, lo que sugiere una sola cuenta, pero no está confirmado y afecta al parámetro `account.id` del script de §1.9.
- **Si los otros 50 dominios ya tienen los nameservers repuntados a Cloudflare sin zona creada.** Sería el mismo accidente esperando a ocurrir, ×50. Merece una comprobación antes de migrar nada.
- **No se ha ejecutado la llamada a la API de zonas con credenciales reales.** El endpoint, los parámetros y el permiso `Zone Zone Read` están verificados en documentación, pero no la respuesta real de esta cuenta.
- **Si `usafitnessvillanueva.com` está fuera de Cloudflare a propósito** (migración pendiente, tienda que no ha contratado) o es un olvido. Es una decisión de negocio, no técnica.

## Monitores

- **Estabilidad de las IPs anycast de Cloudflare para el test DNS con IP esperada** (§1.4.2). Riesgo real de falsas alarmas, no medido en el tiempo.
- **Nombre exacto de los botones de alta de test en StatusCake** («New Uptime Test» vs «Add New Test»).
- **Better Stack: el gating por plan de REST API, Terraform, webhooks y DNS monitoring.** El dossier lo daba por verificado; **no se ha podido reproducir hoy**. El HTML de su página de precios no expone esa información de forma legible, y una lectura automatizada concluyó lo contrario. **Eso importa** porque es la única razón para descartar Better Stack como principal, y es el proveedor con **mejores avisos del comparativo: llamadas de teléfono y SMS ilimitados gratis**. Si algún día quieres que te *suene* el teléfono a las 3 de la mañana, empieza preguntando a su soporte si la API está en el gratuito.
  - Lo que **sí** queda confirmado de Better Stack: gratuito con 10 monitores, 1 status page, **intervalo mínimo 3 minutos** (*«The frequency options range from 3 minutes for free plans to 30 seconds for paid plans»*), y 50 monitores adicionales por 25 $/mes mensual o 21 $/mes anual.
- **Nombre exacto del campo del nombre amistoso** en `POST /v3/monitors` de UptimeRobot (`friendlyName` o `friendly_name`). Haz una llamada de prueba con un solo monitor.
- **Si el plan gratuito de UptimeRobot permite crear monitores por API o solo leerlos.** El límite documentado de 10 req/min para FREE lo sugiere fuertemente, pero no es una afirmación explícita de su documentación.
- **Si StatusCake tiene integración nativa con Telegram en el gratuito.** Sé que hay 14 integraciones e incluyen Slack, Teams y Discord.
- **Que HetrixTools permita uso comercial en el gratuito** viene de fuente secundaria, no de sus términos. Lo que sí confirma su página es que exige actividad en la cuenta (entrar cada 90 días) o desactivan los monitores.
- **El payload de la API de HetrixTools no se ha probado con una llamada real**, solo leído de su documentación.
- **Precio a más de 58 tiendas.** Si el cliente crece de 58 a 150, StatusCake Superior (100 tests) se queda corto y habría que revisar el siguiente escalón, que no se ha mirado.
- **Ninguna de estas APIs se ha ejecutado.** Todos los cuerpos de petición vienen de documentación oficial leída, no de una llamada real.

## Search Console

- **Duración del periodo de gracia** antes de perder permisos por TXT ilegible. Google dice literalmente *«a certain grace period»* y **no publica el número de días en ninguna página**. Cualquier cifra concreta que veas en un blog de SEO está inventada. No se le puede prometer al franquiciado «tienes X días».
- **Cada cuánto revalida Google el TXT.** Solo dice *«periodically»*. **Por eso no se puede vender Search Console como sistema de monitorización.**
- **De quién son los 5 tokens `google-site-verification` existentes.** Se ven en DNS pero es imposible saber desde fuera a qué cuenta de Google pertenecen. Que sean de la agencia anterior o de ProfesionalHosting es inferencia a partir de los SPF, no un hecho.
- **Cuánto histórico se muestra al verificar una propiedad nueva.** Google confirma que sigue recogiendo datos sin propietario verificado, y de ahí se deduce que aparece histórico, pero no lo documenta explícitamente. El límite de 16 meses de retención sí es conocido.
- **La latencia «2-3 días» de los informes normales** procede de fuentes secundarias. Lo que sí está documentado oficialmente (blog de Google, diciembre 2024) es la vista de 24 horas y su retraso de pocas horas.
- **El texto original del post de Google sobre la deprecación del ping de sitemaps** no se pudo recuperar palabra por palabra. La deprecación está corroborada por múltiples fuentes independientes y por la ausencia del endpoint (404).
- **El endpoint `POST /siteVerification/v1/token`** está tomado de la referencia de la Site Verification API, no ejecutado.

## GA4

- **Los nombres en español del panel** son traducción de la documentación en inglés, salvo los que se han podido verificar en la doc con `hl=es` (que sí están confirmados: «Administrar», «Recogida y modificación de datos», «Flujos de datos», «Añadir flujo», «Crear flujo», «Visualización de datos», «Eventos», «Marcar como evento clave», «Crear», «Siguiente»). Si una etiqueta no coincide exactamente, **la ruta y el orden de pantallas sí son correctos**.
- **Si `industryCategory` es estrictamente obligatorio** en `properties.create`. La referencia REST lo lista entre los campos requeridos, pero el ejemplo oficial de Google lo envía siempre, así que nunca se prueba el caso contrario. Enviar `"OTHER"` esquiva la duda.
- **Número de cuentas de Analytics por cuenta de Google:** la página oficial de jerarquía dice 100; fuentes de terceros dicen 2.000. Se ha usado el 100 por ser el dato oficial. Es irrelevante aquí porque el diseño usa **una sola cuenta**.
- **No existe límite documentado de propiedades creadas por DÍA vía API**, solo por minuto. Se desconoce si Google aplica algún control antifraude no documentado al ver 58 propiedades creadas en ráfaga desde una cuenta nueva. Por eso: espáciarlas.
- **Si una cuenta de servicio** (que no puede aceptar Condiciones del Servicio) puede ejecutar `properties.create` después de ser añadida como Editor en Analytics. Por eso §3.5 usa autenticación como usuario.
- **Cómo interactúa Consent Mode v2 con el modelado de comportamiento de GA4**, que requiere umbrales mínimos de tráfico por propiedad. **Con 58 tiendas pequeñas es probable que muchas propiedades no alcancen esos umbrales** y que los informes muestren menos de lo esperado. Merece verificación propia antes de prometerle informes a un franquiciado.
- **Las pantallas intermedias de creación de propiedad** (categoría del sector, tamaño de empresa, objetivos) pueden variar según la antigüedad y el país de la cuenta. Ninguno de esos pasos afecta al dato: si algo no coincide, elige lo más parecido y sigue.

## Cloudflare Web Analytics

- **El análisis RGPD/LSSI es razonamiento jurídico propio, no un dictamen.** No figura en la lista de la CNIL de soluciones exentas de consentimiento y no consta criterio de la AEPD sobre esta herramienta concreta.
- **No se ha revisado el acuerdo de encargado de tratamiento (DPA) de Cloudflare** ni su situación respecto al marco de transferencias UE-EEUU, que es la otra pata del análisis.
- **Los datos de retención** (7 días sin muestrear, luego ~10%) están tomados del FAQ oficial, pero Cloudflare puede cambiarlos sin aviso. No los pongas por escrito en un contrato.
- **No se ha encontrado API** para dar de alta sitios en Web Analytics. A 58 tiendas son 58 altas manuales.

## Riesgo estructural que no cabe en ninguna categoría

Si los 58 dominios acaban en **una cuenta Free** compartiendo par de nameservers, **un problema de cuenta (impago, suspensión, cierre) tumbaría las 58 tiendas a la vez.** El monitor del bloque 1 lo detectaría en minutos. No lo evita.
