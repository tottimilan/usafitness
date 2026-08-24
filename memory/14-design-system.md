# Design System — USAFitness Landing Pages

**Last updated:** 2026-08-24
**Fuente autoritativa:** `UF BRAND BOOK - ANEXO IDENTIDAD CORPORATIVA.pdf` (9 páginas), facilitado por el usuario el 2026-08-24. Sustituye a cualquier color deducido del logo o de la web actual.

## Platform

**web** — Astro SSR con **HTML y CSS puro**. Sin React, sin Tailwind, sin shadcn/ui, sin librería de componentes. ~0 JS de cliente.

> **No aplicar aquí** `.cursor/rules/08-design-system.mdc`, `prototype-designer`, `mockup-factory`, `/mm-design`, `/mm-mockup` ni `scripts/install-shadcn-mcp`. Ver la excepción en `.cursor/rules/usafitness-project.mdc`.

---

## 1. Paleta oficial de marca

### Colores corporativos (del logotipo)

El brand book los justifica así: *"Los colores fundamentales corresponden a los utilizados en la bandera estadounidense, azul y rojo, añadiendo un tercer color, gris, para neutralizar el efecto colorido y servir de puente de unión entre ambos tonos."*

| Color | HTML | Pantone | RGB | RAL | Rol en el logo |
|---|---|---|---|---|---|
| **Azul** | `#0055B8` | 2935C | 0, 85, 184 | 5005 | La "U" (con estrellas) |
| **Gris** | `#98989A` | Cool Gray 7 | 152, 152, 154 | 7042 | La "S" y la palabra FITNESS |
| **Rojo** | `#E1251B` | 485C | 225, 37, 27 | 3020 | La "A" |

### Colores secundarios (decorativos y fondos)

Brand book: *"se utilizarán como **elementos decorativos o fondos** para graficar cartelerías en tiendas físicas, así como materiales impresos o digitales."*

| Color | HTML | Pantone | RGB | RAL |
|---|---|---|---|---|
| **Cian** | `#00A7E1` | 2995C | 0, 167, 225 | 5012 |
| **Gris claro** | `#DADADA` | — (K 20%) | 218, 218, 218 | — |

### ⚠️ Ni un solo color de la web coincide con la marca

| Token actual | Valor actual | Debería ser | Situación |
|---|---|---|---|
| `--color-primary` | `#1B3A6B` | `#0055B8` | Azul marino apagado, **no es el azul de marca** |
| `--color-primary-light` | `#3B6FC1` | `#00A7E1` (cian) | No existe en la marca |
| `--color-cta` | `#4A7BD4` | — | No existe en la marca |
| `--color-cta-hover` | `#3A65B5` | — | No existe en la marca |
| `--color-text-light` | `#666666` | `#98989A` | El gris de marca es más claro y neutro |
| — | — | **`#E1251B`** | **El rojo de marca no existe en la web** |
| `--color-bg-alt` | `#F0F4F8` | derivar de `#DADADA` | Azulado, no neutro como la marca |

**Conclusión:** la paleta actual se construyó a ojo. El rojo —un tercio de la identidad— está ausente de las 7 webs, y el azul es visiblemente más apagado que el corporativo.

---

## 2. Tipografía oficial

**Familia corporativa: Helvetica Neue LT Std.**

Roles definidos por el brand book:

| Variante | Uso prescrito |
|---|---|
| **Helvetica BOLD** | Títulos principales |
| **Helvetica BOLD EXTENDED** | Slogans, palabras sueltas, hashtags |
| **Helvetica EXTENDED** | Subtítulos |
| **Helvetica ROMAN** | Texto de contenido |
| **Helvetica LIGHT** | Texto de contenido |

**Situación web:** el proyecto usa **Inter**. No es un error: Helvetica Neue LT Std es una fuente de pago sin licencia web libre, e Inter es la neo-grotesca diseñada para pantalla más cercana. Se mantiene como sustituto justificado, y queda **documentado como desviación consciente**, no como despiste.

Lo que sí falta trasladar es el **sistema de roles**: hoy hay un único `--font-family` y ningún token de peso ni de escala. Los cinco roles de arriba son exactamente el eje "escala tipográfica" por el que deben diferenciarse las plantillas.

---

## 3. Logotipo

- Composición: **U azul con estrellas · S gris · A roja** + "FITNESS" en gris, con trazos dinámicos.
- **Zona de protección:** margen equivalente a la altura de las letras de la palabra FITNESS.
- **Versiones monocromáticas:** solo blanco y negro. Sobre fotografía o fondos texturados se usa blanco o negro según la luminosidad predominante de la imagen.
- **Fichero actual en el repo:** `public/usafitness.svg` — **276 KB para pintar 200×42 px**. Es un PNG envuelto en SVG. Pendiente sustituir por vectorial real o un raster optimizado.

## 4. Fotografía

Los ejemplos del brand book muestran personas reales entrenando, en espacios de gimnasio, con luz natural y tratamiento poco saturado. El logo se superpone en blanco o negro según la imagen.

Es uno de los ejes de diferenciación entre plantillas (tratamiento a sangre vs. contenido, overlays, proporciones).

---

## 5. Estado del código

**14 custom properties** en `:root` de `src/styles/global.css`, frente a **49 colores literales a fuego** repartidos por los 13 componentes, más 18 `border-radius` y 18 `box-shadow` literales.

Los 13 componentes son `.astro` propios con `<style>` de ámbito local: `Header` · `Hero` · `Promotions` · `Location` · `Gallery` · `Reviews` · `Products` · `Brands` · `Schedule` · `Social` · `Footer` · `WhatsAppFloat` · `CookieConsent`.

### Restricción de diseño heredada

La imagen de fondo del hero está fija en CSS (`Hero.astro:41` → `/hero-bg.jpg`), compartida por todas las tiendas, con overlay blanco al 0.78. El campo `heroImage` por tienda alimenta el `og:image` y el JSON-LD, no el fondo. **Es intencionado** (confirmado por el usuario 2026-08-24), no un defecto — no revertirlo por cuenta propia.

---

## 6. Lo que hay que hacer (paso 0 del sistema de plantillas)

1. **Corregir la paleta** a los valores oficiales e **introducir el rojo `#E1251B`**, que hoy no existe. Cambia el aspecto de las 7 tiendas → requiere aprobación explícita del usuario antes de tocar producción (Vigo y Alcobendas están vivas).
2. **Tokenizar los 49 colores literales**, o cambiar de plantilla dejará media web con la piel vieja.
3. **Crear el vocabulario de tokens que falta**, que es justo el de los ejes de diferenciación elegidos: forma (`--radius`, `--shadow`), ritmo (`--section-padding` por plantilla, escalas de espaciado), foto (`--hero-overlay`, proporciones) y tipografía (pesos y escala de titulares según los 5 roles del brand book).
4. **Optimizar los 812 KB** del viewport inicial: logo de 276 KB y fondo de hero de 536 KB.
