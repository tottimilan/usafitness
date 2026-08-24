# Design System — USAFitness Landing Pages

> **Corrección 2026-08-24:** este fichero venía de la plantilla con todo en `_TBD_` y una cabecera que asumía shadcn/ui + react-native-reusables. Este proyecto no usa ninguno de los dos. Reescrito con el sistema real, que sí existe y está en uso.

**Last updated:** 2026-08-24

## Platform

**web** — Astro SSR con **HTML y CSS puro**. Sin React, sin Tailwind, sin shadcn/ui, sin `components.json`, sin librería de componentes. ~0 JS de cliente (solo las pestañas de reseñas y el banner de cookies).

> **No aplicar aquí** `.cursor/rules/08-design-system.mdc`, las skills `prototype-designer` / `mockup-factory`, los comandos `/mm-design` / `/mm-mockup` ni `scripts/install-shadcn-mcp`. Ver la excepción en `.cursor/rules/usafitness-project.mdc`.

## Tokens (fuente única: `src/styles/global.css`)

Custom properties CSS en `:root`. Son el sistema de diseño real del proyecto.

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#1B3A6B` | Azul marino corporativo. Títulos, H1, cabeceras |
| `--color-primary-light` | `#3B6FC1` | Azul medio |
| `--color-cta` | `#4A7BD4` | Botones de acción |
| `--color-cta-hover` | `#3A65B5` | Hover de botón |
| `--color-text` | `#333333` | Texto base |
| `--color-text-light` | `#666666` | Texto secundario |
| `--color-bg` | `#FFFFFF` | Fondo por defecto |
| `--color-bg-alt` | `#F0F4F8` | Fondo de sección alterna |
| `--color-bg-gallery` | `#F5F0EE` | Fondo de la galería |
| `--color-stars` | `#F4B400` | Estrellas de reseñas |
| `--color-whatsapp` | `#25D366` | Verde de marca WhatsApp |
| `--font-family` | `'Inter'`, con fallback a system stack | Tipografía única |
| `--max-width` | `1200px` | Ancho del contenedor |
| `--section-padding` | `4rem 1.5rem` | Ritmo vertical entre secciones |

## Componentes instalados

**Ninguno de librería.** Los 13 componentes son `.astro` propios, cada uno con su `<style>` local (CSS con ámbito de Astro):

`Header` · `Hero` · `Promotions` · `Location` · `Gallery` · `Reviews` · `Products` · `Brands` · `Schedule` · `Social` · `Footer` · `WhatsAppFloat` · `CookieConsent`

## Patrones vigentes

- **Estilo por componente**: cada `.astro` lleva su `<style>`; lo compartido son las custom properties y `global.css`.
- **Alternancia de fondo**: las secciones alternan `--color-bg` y `--color-bg-alt` para dar ritmo.
- **Sección opcional**: si el dato no existe, la sección no se renderiza (`whatsapp`, `reviews`, `galleryImages`, `social`). Ver commit `828ec40`. Es el germen del sistema de secciones que persigue `memory/01-product-vision.md`.
- **Sin JS salvo lo imprescindible**: decisión deliberada por rendimiento y SEO.

## Restricción de diseño heredada

La imagen de portada del hero **está fija en CSS** (`Hero.astro` → `background-image: url('/hero-bg.jpg')`), compartida por todas las tiendas, con un overlay blanco al 0.78. El campo `heroImage` por tienda **no** se usa como fondo: alimenta el `og:image` y el `image` del JSON-LD. Es intencionado (confirmado por el usuario 2026-08-24), no un defecto.

## Lo que falta para el sistema de plantillas

`memory/01-product-vision.md` persigue **varias plantillas** que difieran en lo visual y en la estructura de la landing. Hoy hay **una sola** y los tokens son globales, no por plantilla. Convertir esta tabla en tokens por plantilla (o temas) es parte del trabajo pendiente.
