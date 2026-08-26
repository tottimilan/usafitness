/**
 * ESQUEMA DE stores.json — la puerta por la que pasan los datos de N empresas
 *
 * `stores.json` se escribe a mano y no lo revisa nadie. Hasta ahora, un campo
 * mal escrito no daba error: daba una página rota, un dato legal falso o un
 * hueco silencioso en el marcado, en el dominio de un cliente que paga.
 *
 * Este fichero convierte esa clase entera de fallos en un error de build.
 * Si algo de aquí falla, no se despliega nada. Es deliberado: en un servicio
 * que sirve todos los dominios desde un solo punto de entrada, publicar a medias es
 * peor que no publicar.
 *
 * DÓNDE ESTÁ LA LÍNEA (la decisión de diseño de este fichero)
 *
 *   ERROR   → lo que rompe el render o publica un dato FALSO.
 *             Un NIF mal formado, un teléfono que no se puede marcar, un
 *             horario que la página no sabe leer, una clave con un typo.
 *
 *   AVISO   → lo que solo DEGRADA. Sin fotos no hay galería, sin reseñas no
 *             hay reseñas, sin `company` las legales van a noindex.
 *             Son datos que dependen de terceros (el franquiciado, la ficha
 *             de Google) y bloquear el despliegue de todos los dominios vivos hasta
 *             que lleguen sería peor que la carencia.
 *
 * Lo que NO comprueba: que los ficheros de imagen existan de verdad en disco.
 * Eso necesita acceso al sistema de ficheros y va aparte (tarea 3.7).
 */

import { z } from 'astro/zod';
import bruto from './stores.json' with { type: 'json' };
import { parseHorario } from './horario.ts';
import { SECTION_IDS } from './templates.ts';

/* ── Piezas reutilizadas ───────────────────────────────────────────────── */

const texto = (campo: string) => z.string().trim().min(1, `${campo} no puede estar vacío`);

/** Ruta servida desde `public/`. Absoluta o no resuelve en producción. */
const rutaPublica = z
  .string()
  .regex(/^\/[^\s]+\.(webp|avif|jpg|jpeg|png|svg)$/i, 'debe ser una ruta absoluta a un fichero de imagen, p. ej. "/photos/vigo/hero.webp"');

/**
 * E.164 español. Se exige `+34` y 9 dígitos porque el número no es decorativo:
 * va literal dentro de `href="tel:"` y de `https://wa.me/`. Un número con
 * espacios o sin prefijo abre el marcador con basura y la llamada no sale.
 */
const telefonoE164 = z
  .string()
  .regex(/^\+34[6-9]\d{8}$/, 'debe ser E.164 español sin espacios: +34 seguido de 9 dígitos (p. ej. "+34986916804")');

const EsquemaEmpresa = z.strictObject({
  razonSocial: texto('razonSocial'),
  // Sociedades: letra + 8 dígitos. Autónomos: 8 dígitos + letra.
  nif: z.string().regex(/^([A-HJ-NP-SUVW]\d{7}[0-9A-J]|\d{8}[A-Z])$/, 'NIF/CIF con formato no válido'),
  direccionPostal: texto('direccionPostal'),
  emailLegal: z.email('el email legal no es una dirección válida'),
  telefonoLegal: texto('telefonoLegal'),
  // Se publica literal en los cuatro documentos legales.
  lastUpdated: texto('lastUpdated'),
});

const EsquemaResena = z.strictObject({
  author: texto('author'),
  text: texto('text'),
  avatar: rutaPublica.optional(),
  stars: z.number().int().min(1).max(5),
});

const EsquemaSocial = z.strictObject({
  instagram: z.url().optional(),
  facebook: z.url().optional(),
  tiktok: z.url().optional(),
  youtube: z.url().optional(),
});

/**
 * Coordenadas dentro de la caja que contiene España peninsular, Baleares y Canarias.
 *
 * Y con AL MENOS 5 DECIMALES, que es la regla que de verdad sirve aquí. Un `geo`
 * copiado del payload de una ficha de Google trae 6-7 decimales; uno estimado a
 * ojo sobre un mapa se escribe con 3 o 4. Aplicada a los datos que había el
 * 2026-08-25 cazaba los 4 malos —40.4483/-3.9942, 43.3292/-8.4184,
 * 40.533/-3.642, 42.2272/-8.7106, entre 1.003 y 1.871 metros de error— sin un
 * solo falso positivo sobre los 2 buenos. Cinco decimales son ~1 metro: nadie
 * los escribe a mano.
 */
const conPrecisionDeFicha = (etiqueta: string) =>
  z.number().refine((n) => (String(n).split('.')[1] ?? '').length >= 5, {
    message: `${etiqueta} con menos de 5 decimales: eso es una estimación a ojo, no una coordenada copiada de la ficha de Google`,
  });

const EsquemaGeo = z.strictObject({
  lat: conPrecisionDeFicha('latitud').refine((n) => n >= 27 && n <= 44, 'la latitud cae fuera de España'),
  lng: conPrecisionDeFicha('longitud').refine((n) => n >= -19 && n <= 5, 'la longitud cae fuera de España'),
});

/* ── La tienda ─────────────────────────────────────────────────────────── */

/**
 * `strictObject` y no `object`: una clave desconocida es un ERROR, no se
 * ignora. Es la mitad del valor de este fichero. Escribir `heroimage` en vez
 * de `heroImage` hoy no da error — da una tienda con la foto por defecto de
 * otra. Con esto, no compila.
 */
const EsquemaTienda = z.strictObject({
  /* Identidad — sin esto no hay ni ruta ni dominio */
  slug: z.string().regex(/^[a-z0-9-]+$/, 'solo minúsculas, números y guiones'),
  domain: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, 'dominio sin protocolo ni barra final, p. ej. "usafitnessvigo.com"'),
  name: texto('name'),

  /* Contenido visible */
  title: texto('title'),
  subtitle: texto('subtitle'),
  location: texto('location'),
  metaDescription: texto('metaDescription')
    // Google trunca alrededor de 160 caracteres. Pasarse no penaliza, pero el
    // final de la frase no lo lee nadie y aquí es texto escrito a mano.
    .max(320, 'demasiado larga: Google la va a cortar mucho antes'),
  heroText: z.string().trim().min(1).optional(),

  /* Dirección — alimenta Schema.org y la coherencia NAP, que es el activo */
  streetAddress: texto('streetAddress'),
  postalCode: z.string().regex(/^\d{5}$/, 'código postal español de 5 dígitos'),
  addressLocality: texto('addressLocality'),
  addressRegion: texto('addressRegion'),
  /** Centro comercial. Hoy no lo pinta ningún componente; es materia prima del
   *  contenido local del roadmap (§4 Fase 4). Se exige para no perderlo. */
  mall: texto('mall'),
  geo: EsquemaGeo.optional(),

  /* Contacto — los tres caminos de conversión */
  phone: telefonoE164,
  phoneDisplay: texto('phoneDisplay'),
  whatsapp: telefonoE164.optional(),
  /**
   * FORMA CANÓNICA OBLIGATORIA, y no una URL cualquiera.
   *
   * Las dos apuntan a la ficha por su CID, el identificador numérico del
   * negocio en Google. El regex rechaza de un golpe todo lo que estaba roto el
   * 2026-08-25:
   *   · `?q=<dirección>&output=embed` → geocodifica un texto, así que el pin
   *     caía sobre el centro comercial y no sobre el local (síntoma A).
   *   · `pb=!1m18!...` largo escrito a mano → llevaba feature ids inventados;
   *     el de marineda devolvía un mapa sin ningún pin.
   *   · `/maps/search/<texto>` → una página de RESULTADOS. El botón abría
   *     Google Maps pero no la tienda (síntoma B).
   *   · `/maps/place/<nombre>/` sin identificador → búsqueda por texto: hoy
   *     acierta, mañana depende del ranking de Google.
   *   · `maps.app.goo.gl/...` → opaco. Nadie que lea este JSON sabe adónde
   *     apunta, que es justo cómo se colaron los ids fabricados.
   *
   * Ausentes solo cuando la tienda no tiene ficha (ver `googleMapsStatus`).
   */
  googleMapsEmbed: z
    .string()
    .regex(/^https:\/\/www\.google\.com\/maps\/embed\?origin=mfe&pb=!1m3!3m2!1m1!4s\d{15,20}!3m1!1ses!5m1!1ses$/,
      'el embed debe ser la forma canónica por CID. Se obtiene con: https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s<CID>!3m1!1ses!5m1!1ses')
    .optional(),
  googleMapsLink: z
    .string()
    .regex(/^https:\/\/maps\.google\.com\/\?cid=\d{15,20}$/,
      'el enlace debe ser https://maps.google.com/?cid=<CID>. Una URL /maps/search/ abre resultados, no la ficha')
    .optional(),

  /**
   * Declara, y solo para eso, que una tienda NO tiene ficha de Google Business.
   *
   * Existe para que el hueco se VEA. La alternativa tentadora —enlazar la ficha
   * del centro comercial— publicaría la tarjeta de otro negocio, con su
   * teléfono y sus reseñas, en la web de este cliente. Comprobado el 2026-08-25:
   * el CID del centro GranCasa devuelve "Gran Casa" y cero menciones a USA
   * Fitness.
   */
  googleMapsStatus: z.literal('sin-ficha-gbp').optional(),

  /* Horario: se valida con el MISMO parser que emite el marcado */
  schedule: z.string().refine((t) => parseHorario(t).length > 0, {
    message:
      'el parser no entiende este horario, así que la página se publicaría SIN openingHoursSpecification. ' +
      'Formato reconocido: "De lunes a sábado: 10:00 a 22:00" (rangos: lunes a viernes / sábado / domingo)',
  }),

  /* Medios */
  heroImage: rutaPublica,
  galleryImages: z.array(rutaPublica),
  galleryFeatured: z.boolean().optional(),

  /* Prueba social */
  reviews: z.array(EsquemaResena),
  social: EsquemaSocial.optional(),

  /* Legal — opcional a propósito: sin esto las legales van a noindex, que es
     el comportamiento correcto mientras el franquiciado no dé los datos */
  company: EsquemaEmpresa.optional(),

  /* Sistema de plantillas (Fase 4) */
  template: z.string().optional(),
  sections: z
    .array(
      z.union([
        z.enum(SECTION_IDS),
        z.strictObject({ id: z.enum(SECTION_IDS), variant: z.string().optional() }),
      ])
    )
    .optional(),

  /* Medición (Fase 1) — el código ya está, faltan los identificadores */
  // `GT-` además de `G-`: la interfaz de Google entrega hoy identificadores
  // `GT-` y `gtag('config')` acepta los dos. Con el regex anterior, pegar el
  // ID que Google acaba de dar reventaba el build de todos los dominios con un
  // mensaje que mandaba a buscar un ID que quizá no existe.
  ga4Id: z.string().regex(/^(G|GT)-[A-Z0-9]+$/, 'un ID de GA4 tiene la forma "G-XXXXXXXXXX" o "GT-XXXXXXXX"').optional(),
  googleSiteVerification: z.string().min(10).optional(),
});

export type Tienda = z.infer<typeof EsquemaTienda>;

/* ── Reglas que solo se ven mirando las 7 a la vez ─────────────────────── */

/** Exportado para poder probar la GUARDA, no solo los datos: un esquema que
 *  nunca se ha visto rechazar nada no demuestra que rechace algo.
 *  Ver `tests/datos.test.mjs`. */
export const esquemaTiendas = z.array(EsquemaTienda).superRefine((tiendas, ctx) => {
  const visto = (campo: 'slug' | 'domain') => {
    const cuenta = new Map<string, number[]>();
    tiendas.forEach((t, i) => {
      const k = t[campo].toLowerCase();
      cuenta.set(k, [...(cuenta.get(k) ?? []), i]);
    });
    for (const [valor, indices] of cuenta) {
      if (indices.length > 1) {
        ctx.addIssue({
          code: 'custom',
          path: [indices[1], campo],
          message: `"${valor}" está repetido en ${indices.length} tiendas. Dos tiendas con el mismo ${campo} hacen que una sea inalcanzable`,
        });
      }
    }
  };
  visto('slug');
  visto('domain');

  /* ── Mapas: las reglas que habrían cazado el bug de agosto ──────────── */

  const cidDe = (url?: string) => url?.match(/\d{15,20}/)?.[0] ?? null;

  tiendas.forEach((t, i) => {
    const sinFicha = t.googleMapsStatus === 'sin-ficha-gbp';

    // Una tienda o tiene ficha (embed + enlace + geo) o declara que no la tiene.
    // El estado intermedio —sin mapa y sin declararlo— es el que dejó a GranCasa
    // meses publicando Schema.org sin coordenadas sin que nadie lo viera.
    if (!sinFicha) {
      for (const campo of ['googleMapsEmbed', 'googleMapsLink', 'geo'] as const) {
        if (!t[campo]) {
          ctx.addIssue({ code: 'custom', path: [i, campo],
            message: `falta ${campo}. Si esta tienda no tiene ficha de Google Business, decláralo con googleMapsStatus: "sin-ficha-gbp" en vez de dejar el hueco mudo` });
        }
      }
    } else if (t.googleMapsEmbed || t.googleMapsLink || t.geo) {
      ctx.addIssue({ code: 'custom', path: [i, 'googleMapsStatus'],
        message: 'declara no tener ficha pero trae embed, enlace o geo. Una de las dos cosas sobra' });
    }

    // EL EMBED Y EL ENLACE TIENEN QUE APUNTAR A LA MISMA FICHA.
    // Esta sola regla habría cazado el fallo de lasrosas, cuyos dos campos se
    // desmentían entre sí — y con el dato bueno ya presente en el repo, en el
    // otro campo.
    const a = cidDe(t.googleMapsEmbed), b = cidDe(t.googleMapsLink);
    if (a && b && a !== b) {
      ctx.addIssue({ code: 'custom', path: [i, 'googleMapsLink'],
        message: `el embed apunta al CID ${a} y el enlace al ${b}: el mapa y el botón llevan a fichas distintas` });
    }
  });

  /**
   * Fichas que NO son de ninguna tienda y que alguien podría enlazar por
   * parecer que arreglan el mapa.
   *
   * El esquema valida FORMA; esto valida IDENTIDAD, y hace falta porque la
   * forma canónica de un CID del centro comercial es indistinguible de la de
   * una tienda. Al diagnosticar el bug de agosto de 2026 apareció la tentación:
   * GranCasa no tiene ficha, pero el centro comercial sí, y su embed se ve
   * "bien". Comprobado: ese CID devuelve "Gran Casa", con su teléfono y sus
   * 25.602 reseñas. Enlazarlo publicaría la tarjeta de otro negocio en la web
   * de este cliente, y convertiría el síntoma en permanente.
   */
  const FICHAS_PROHIBIDAS = new Map([
    ['13649349957894030431', 'el CENTRO COMERCIAL GranCasa, no la tienda'],
  ]);
  tiendas.forEach((t, i) => {
    for (const campo of ['googleMapsEmbed', 'googleMapsLink'] as const) {
      const c = cidDe(t[campo]);
      if (c && FICHAS_PROHIBIDAS.has(c)) {
        ctx.addIssue({ code: 'custom', path: [i, campo],
          message: `el CID ${c} es ${FICHAS_PROHIBIDAS.get(c)}. Sin ficha propia, se declara googleMapsStatus: "sin-ficha-gbp"` });
      }
    }
  });

  // Dos tiendas con el mismo CID es copy-paste, y sociedades distintas
  // compartiendo ficha de Google.
  const porCid = new Map<string, string[]>();
  tiendas.forEach((t) => {
    const c = cidDe(t.googleMapsLink);
    if (c) porCid.set(c, [...(porCid.get(c) ?? []), t.slug]);
  });
  for (const [cid, slugs] of porCid) {
    if (slugs.length > 1) {
      ctx.addIssue({ code: 'custom', path: ['googleMapsLink'],
        message: `el CID ${cid} está en ${slugs.join(', ')}: dos tiendas no pueden compartir ficha de Google` });
    }
  }

  // Una reseña firmada por la misma persona en dos dominios de sociedades
  // distintas no es contenido duplicado: es publicidad con testimonios que
  // parecen falsos, y responde la sociedad titular de cada dominio.
  // Ya pasó una vez (10 reseñas retiradas el 2026-08-24). No otra.
  const porAutor = new Map<string, string[]>();
  tiendas.forEach((t) => {
    for (const r of t.reviews) {
      const k = r.author.trim().toLowerCase();
      porAutor.set(k, [...(porAutor.get(k) ?? []), t.slug]);
    }
  });
  for (const [autor, slugs] of porAutor) {
    if (new Set(slugs).size > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['reviews'],
        message: `"${autor}" firma reseñas en ${[...new Set(slugs)].join(', ')}. La misma persona no puede avalar varias empresas independientes`,
      });
    }
  }
});

/* ── Validación al cargar ──────────────────────────────────────────────── */

const resultado = esquemaTiendas.safeParse(bruto.stores);

if (!resultado.success) {
  // `prettifyError` da la ruta exacta, pero identifica la tienda por su índice
  // en el array (`[3].reviews[0]`). Se sustituye por el slug: nadie debería
  // tener que contar posiciones a mano para saber qué tienda está rota.
  const conNombre = z.prettifyError(resultado.error).replace(/→ at \[(\d+)\](\.)?/g, (_, i, punto) => {
    const t = (bruto.stores as any[])[Number(i)];
    return `→ en ${t?.slug ?? `tienda #${i}`}${punto ? ', campo ' : ''}`;
  });

  throw new Error(
    `\n\nstores.json no es válido. No se despliega nada hasta arreglarlo:\n\n${conNombre}\n\n` +
      `Reglas en src/data/stores.ts.\n`
  );
}

export const stores: Tienda[] = resultado.data;

/** Índice dominio → tienda. Cubre el dominio pelado y el `www.`. */
export const porDominio = new Map<string, Tienda>();
for (const t of stores) {
  porDominio.set(t.domain, t);
  porDominio.set(`www.${t.domain}`, t);
}

export const porSlug = new Map(stores.map((t) => [t.slug, t]));

/**
 * ¿La tabla de dominios está entera?
 *
 * El bucle de arriba registra DOS entradas por tienda (el dominio pelado y el
 * `www.`). Una tabla a medias es el fallo más caro posible aquí: el middleware
 * dejaría de reconocer un dominio y su tráfico caería al host genérico — o
 * peor, un dominio duplicado haría que una sociedad sirviera el contenido y el
 * NIF de otra, con un 200 impecable que ningún ping detecta.
 *
 * Es función pura y exportada para poder probarla con una tabla ROTA en
 * `tests/datos.test.mjs`: `/health` la usa para decidir su 503, y un camino de
 * error que ningún test ejerce es una puerta que nadie ha comprobado que
 * cierre (I-4 de la revisión del PR #1).
 */
export function tablaCoherente(tiendas: Tienda[], mapa: Map<string, Tienda>): boolean {
  return tiendas.length > 0 && mapa.size === tiendas.length * 2;
}

/* ── Avisos: degradan, no rompen ───────────────────────────────────────── */

/**
 * Se imprime una vez al arrancar. En Railway queda en el log del despliegue,
 * que es donde se puede ver de un vistazo qué tienda está publicando de menos
 * y por qué. No falla el build a propósito: todo lo de aquí depende de datos
 * que tiene que dar el franquiciado, no el código.
 */
export function avisosDeDatos(): string[] {
  const avisos: string[] = [];
  for (const t of stores) {
    if (!t.company) avisos.push(`${t.slug}: sin datos legales → sus 4 páginas legales van a noindex`);
    if (t.galleryImages.length === 0) avisos.push(`${t.slug}: sin fotos → no se renderiza la galería`);
    if (t.reviews.length === 0) avisos.push(`${t.slug}: sin reseñas → no se renderiza la sección`);
    if (!t.geo) avisos.push(`${t.slug}: sin coordenadas → el marcado sale sin "geo"`);
    if (!t.ga4Id) avisos.push(`${t.slug}: sin ga4Id → los eventos de conversión no se envían a ningún sitio`);
    // Un fijo en WhatsApp abre una conversación que nadie va a leer. El usuario
    // decidió mantenerlos (2026-08-24); el aviso queda para que conste.
    if (t.whatsapp && t.whatsapp === t.phone) {
      avisos.push(`${t.slug}: el WhatsApp es el mismo número que el fijo — sin verificar que esté dado de alta`);
    }
    // El aviso del `!4v` con ceros redondos que había aquí ya no hace falta: el
    // esquema exige ahora la forma canónica por CID, así que un embed escrito a
    // mano no llega a compilar. Lo que sí sigue siendo un aviso es no tener
    // ficha, porque eso depende del franquiciado y no del código.
    if (t.googleMapsStatus === 'sin-ficha-gbp') {
      avisos.push(`${t.slug}: sin ficha de Google Business → sin mapa, sin botón de cómo llegar y sin "geo" en el marcado. Hay que darla de alta y verificarla`);
    }
  }
  return avisos;
}
