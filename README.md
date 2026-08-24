# USAFitness Landing Pages

Generador de landing pages para las tiendas USAFitness en España. Cada tienda tiene su propia landing con datos personalizados (nombre, ubicación, horario, reseñas, fotos, redes y datos legales) a partir de una única plantilla. Cada tienda usa su propio dominio.

## Stack

- **Astro** (SSR con Node adapter para Railway)
- **HTML/CSS** puro (0 JS en el cliente excepto las tabs de reseñas)
- **SEO optimizado**: Schema.org `LocalBusiness` (logo, `sameAs`, horario, geo, rating), Open Graph, `sitemap.xml` y `robots.txt` **dinámicos por dominio**

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:4321/villanueva` (o cualquier slug de tienda).

> En local, las tiendas se ven por slug (`/villanueva`). En producción, cada tienda se sirve en la raíz de su propio dominio (ver Middleware más abajo).

## Añadir una tienda nueva

1. Editar `src/data/stores.json` y añadir un nuevo objeto al array `stores`.
2. Poner las fotos en `public/photos/[slug]/` (`hero.jpg` + `tienda-1.jpg`…). Pueden ser `.jpg` o `.webp`.
3. (Opcional) Avatares de reseñas en `public/photos/[slug]/reviews/`.
4. (Cuando se tengan) Rellenar el bloque `company` con los datos legales reales de esa tienda.
5. Push a GitHub → Railway redespliega automáticamente.

## Configuración por tienda (`stores.json`)

Cada tienda es un objeto dentro de `stores`. Campos:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `slug` | sí | URL path (ej: `villanueva`) |
| `name` | sí | Nombre completo (ej: `USAFITNESS VILLANUEVA`) |
| `domain` | sí | Dominio propio (ej: `usafitnessvillanueva.com`) |
| `streetAddress` | sí | Dirección de la tienda (para Schema) |
| `postalCode` | sí | Código postal |
| `geo` | sí | `{ "lat": number, "lng": number }` |
| `title` | sí | Título H1 del hero |
| `subtitle` | sí | Subtítulo de la sección mapa |
| `location` | sí | Localidad para SEO |
| `metaDescription` | sí | Meta description para Google |
| `phone` | sí | Teléfono de la tienda, formato `+34...` |
| `phoneDisplay` | sí | Teléfono formateado para mostrar |
| `whatsapp` | no | Número WhatsApp, formato `+34...`. Si falta, no se muestran la burbuja flotante ni la tarjeta de contacto |
| `googleMapsEmbed` | sí | URL del iframe de Google Maps |
| `googleMapsLink` | sí | Link directo a Google Maps (ideal: enlace corto del perfil) |
| `schedule` | sí | Horario (separar líneas con `\n`). Ver formatos abajo |
| `heroImage` | sí | Path a la foto hero (`.jpg` o `.webp`) |
| `reviews` | no | Array de reseñas (`text`, `author`, `avatar`, `stars`). Si falta o está vacío, no se muestra la sección **ni se emite `aggregateRating`** en el Schema |
| `galleryImages` | no | Array de paths a fotos de la tienda. Si falta o está vacío, no se muestra la galería |
| `galleryFeatured` | no | `true` → primera foto a todo el ancho + fila de 3 |
| `social` | no | `{ "instagram": "...", "facebook": "...", "tiktok": "...", "youtube": "..." }` |
| `company` | no | Datos legales del titular de ESA tienda (ver abajo) |

### Horario (`schedule`)

El parser genera el `OpeningHoursSpecification` de Schema.org a partir del texto. Frases reconocidas (insensible a mayúsculas):

- `lunes a viernes` → L-V
- `lunes a sábado` → L-S
- `lunes a domingo` → L-D
- `sábado` (línea suelta, ej. `Sábados: 10:00–21:00`) → Sábado
- `domingo` (línea suelta, ej. `Domingos: 11:00 a 21:00`) → Domingo

Las horas pueden separarse con `a`, `–` o `-`.

### Reseñas y avatares

```json
"reviews": [
  { "text": "...", "author": "Nieves Rodriguez", "avatar": "/photos/villanueva/reviews/nieves.jpg", "stars": 5 }
]
```

- Si `avatar` está vacío (`""`), se muestra la inicial del autor en un círculo.
- **Buena práctica:** descargar los avatares de Google en local (`public/photos/[slug]/reviews/`) en vez de enlazar a `lh3.googleusercontent.com`, porque esas URLs pueden caducar.

### Redes sociales (`social`)

Si la tienda tiene `social`, se muestran:
- El icono de **Instagram en el header** (si hay `instagram`).
- La sección **«Síguenos en redes sociales»** con todas las redes definidas.

Si no hay `social`, no se renderiza nada de eso. Soporta `instagram`, `facebook`, `tiktok`, `youtube`.

### Datos legales (`company`)

Los datos legales son **por tienda** (cada tienda puede tener un titular distinto):

```json
"company": {
  "razonSocial": "NM10 SHOP S.L.",
  "nif": "B22854681",
  "direccionPostal": "Avenida Secundino Zuazo, 44. Bajo A, 28055 Madrid (Madrid)",
  "emailLegal": "adricbp@gmail.com",
  "telefonoLegal": "625850691",
  "lastUpdated": "6 de abril de 2026"
}
```

- Con `company` definido → las páginas legales (`/aviso-legal`, `/politica-de-privacidad`, `/politica-de-cookies`, `/politica-redes-sociales`) se rellenan con esos datos y son **indexables**.
- Sin `company` → las páginas legales muestran un aviso de «en actualización» y van en `noindex` (no se publican datos incorrectos).
- Los textos de las políticas viven en `src/data/legal.ts` (template común para todas las tiendas).

## Páginas legales

- En el dominio propio: `usafitnesstienda.com/aviso-legal` (URL limpia, vía middleware).
- En local/preview: `/[slug]/aviso-legal`.
- El banner «Información legal» del footer aparece en todas las tiendas.

## SEO

- `Landing.astro` genera `<title>`, meta description, canonical (por dominio), Open Graph/Twitter y Schema.org `LocalBusiness`.
- `src/pages/sitemap.xml.ts` y `src/pages/robots.txt.ts` son **dinámicos por dominio**: cada tienda expone solo sus propias URLs canónicas. Sin mezclar tiendas.
- Favicon en `public/favicon-96.png` (96×96, requisito de Google) + `favicon.png` (32×32).

## Middleware (`src/middleware.ts`)

Mapea **dominio → slug**. En el dominio de una tienda:
- `/` → contenido de la tienda.
- `/aviso-legal` (y demás políticas) → página legal de esa tienda con URL limpia.

## Deploy en Railway

1. Conectar el repo en Railway.
2. Build: `npm run build`
3. Start: `node dist/server/entry.mjs`
4. Configurar los dominios personalizados de cada tienda en Railway.

## Estructura

```
src/
  data/
    stores.json      ← Datos de todas las tiendas
    legal.ts         ← Templates de las políticas legales
  layouts/Landing.astro    ← Layout base con SEO + Schema
  components/              ← Componentes reutilizables (Hero, Gallery, Social, Footer…)
  pages/
    [...slug].astro        ← Página de cada tienda
    [slug]/[doc].astro     ← Páginas legales por tienda
    sitemap.xml.ts         ← Sitemap dinámico por dominio
    robots.txt.ts          ← Robots dinámico por dominio
  middleware.ts            ← Dominio → slug + URLs legales limpias
public/
  usafitness.svg           ← Logo
  favicon-96.png / favicon.png
  hero-bg.jpg              ← Fondo del hero (compartido)
  brands/                  ← Logos de marcas
  photos/[slug]/           ← Fotos por tienda (+ reviews/ para avatares)
```
