# USAFitness Landing Pages

Generador de landing pages para las tiendas USAFitness en España. Cada tienda tiene su propia landing con datos personalizados (nombre, ubicación, horario, reseñas, fotos) a partir de una única plantilla.

## Stack

- **Astro** (SSG + Node adapter para Railway)
- **HTML/CSS** puro (0 JS en el cliente excepto las tabs de reseñas)
- **SEO optimizado**: Schema.org LocalBusiness, Open Graph, sitemap, robots.txt

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:4321/villanueva` (o cualquier slug de tienda).

## Añadir una tienda nueva

1. Editar `src/data/stores.json` y añadir un nuevo objeto al array `stores`
2. Poner las fotos en `public/photos/[slug]/` (hero.jpg + tienda-1.jpg a tienda-6.jpg)
3. Push a GitHub → Railway redespliega automáticamente

## Configuración por tienda (`stores.json`)

Cada tienda necesita estos campos:

| Campo | Descripción |
|-------|-------------|
| `slug` | URL path (ej: `villanueva`) |
| `name` | Nombre completo (ej: `USAFITNESS VILLANUEVA`) |
| `domain` | Dominio propio (ej: `usafitnessvillanueva.com`) |
| `title` | Título H1 del hero |
| `subtitle` | Subtítulo de la sección mapa |
| `location` | Localidad para SEO |
| `metaDescription` | Meta description para Google |
| `phone` | Teléfono formato +34... |
| `phoneDisplay` | Teléfono formateado para mostrar |
| `whatsapp` | Número WhatsApp |
| `googleMapsEmbed` | URL del iframe de Google Maps |
| `googleMapsLink` | Link directo a Google Maps |
| `schedule` | Horario (separar líneas con \n) |
| `heroImage` | Path a la foto hero |
| `reviews` | Array de reseñas (text, author, stars) |
| `galleryImages` | Array de 6 paths a fotos de la tienda |

## Deploy en Railway

1. Conectar el repo en Railway
2. Railway auto-detecta Node.js
3. Build: `npm run build`
4. Start: `node dist/server/entry.mjs`
5. Configurar dominios personalizados en Railway si se necesitan

## Estructura

```
src/
  data/stores.json      ← Datos de todas las tiendas
  layouts/Landing.astro  ← Layout base con SEO
  components/            ← Componentes reutilizables
  pages/[...slug].astro  ← Genera 1 página por tienda
public/
  usafitness.svg         ← Logo
  brands/                ← Logos de marcas
  photos/[slug]/         ← Fotos por tienda
```
