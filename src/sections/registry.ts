/**
 * REGISTRO DE SECCIONES
 *
 * Único sitio que sabe qué componente corresponde a cada sección y qué props
 * necesita. Antes esa información estaba repartida entre el orden hardcodeado
 * de `[...slug].astro` y varios condicionales sueltos.
 *
 * Cada entrada declara:
 *   - `component` : el .astro que la pinta
 *   - `props`     : cómo se derivan sus props desde el objeto de tienda
 *   - `visible`   : si la sección tiene datos suficientes. Si devuelve false,
 *                   NO se renderiza. Aquí viven las reglas que antes eran
 *                   `hasGallery`, `hasReviews` y el `{waNumber && …}`.
 *
 * QUÉ NO ESTÁ AQUÍ, Y ES DELIBERADO:
 * Header, Footer, WhatsAppFloat y CookieConsent NO son componibles. Siguen
 * fijos en la página. Motivo: un error de configuración no puede dejar una
 * landing sin aviso de cookies ni sin enlaces legales. Eso es riesgo legal
 * para el cliente, no una preferencia estética.
 */

import Hero from '@/components/Hero.astro';
import Promotions from '@/components/Promotions.astro';
import Location from '@/components/Location.astro';
import Gallery from '@/components/Gallery.astro';
import Reviews from '@/components/Reviews.astro';
import Products from '@/components/Products.astro';
import Brands from '@/components/Brands.astro';
import Schedule from '@/components/Schedule.astro';
import Social from '@/components/Social.astro';

import type { SectionId } from '@/data/templates';

type Store = Record<string, any>;

export interface SectionDef {
  component: any;
  props: (store: Store) => Record<string, any>;
  visible?: (store: Store) => boolean;
}

export const SECTIONS: Record<SectionId, SectionDef> = {
  hero: {
    component: Hero,
    props: (s) => ({
      name: s.name,
      title: s.title,
      location: s.location,
      googleMapsLink: s.googleMapsLink,
      heroImage: s.heroImage,
      heroText: s.heroText,
    }),
  },

  promotions: {
    component: Promotions,
    props: (s) => ({ phone: s.phone }),
  },

  location: {
    component: Location,
    props: (s) => ({
      subtitle: s.subtitle,
      googleMapsEmbed: s.googleMapsEmbed,
      googleMapsLink: s.googleMapsLink,
    }),
  },

  gallery: {
    component: Gallery,
    // Sin fotos no hay galería: antes salía la sección con el título y nada debajo.
    visible: (s) => Array.isArray(s.galleryImages) && s.galleryImages.length > 0,
    props: (s) => ({
      images: s.galleryImages ?? [],
      name: s.name,
      location: s.location,
      featured: s.galleryFeatured ?? false,
    }),
  },

  reviews: {
    component: Reviews,
    // Una tienda recién abierta no tiene reseñas todavía.
    visible: (s) => Array.isArray(s.reviews) && s.reviews.length > 0,
    props: (s) => ({ reviews: s.reviews ?? [] }),
  },

  products: {
    component: Products,
    // Contenido común a todas las tiendas por decisión de marca: venden lo mismo.
    props: () => ({}),
  },

  brands: {
    component: Brands,
    // Idem: las 8 marcas son las mismas en todas las tiendas.
    props: () => ({}),
  },

  schedule: {
    component: Schedule,
    props: (s) => ({
      schedule: s.schedule,
      phone: s.phone,
      phoneDisplay: s.phoneDisplay,
      whatsapp: s.whatsapp,
      googleMapsLink: s.googleMapsLink,
      name: s.name,
    }),
  },

  social: {
    component: Social,
    // El propio componente ya no pinta nada sin enlaces, pero declararlo aquí
    // evita emitir la sección vacía en el HTML.
    visible: (s) => !!s.social && Object.values(s.social).some(Boolean),
    props: (s) => ({ social: s.social, name: s.name }),
  },
};

/** Devuelve el plan de renderizado: solo las secciones con datos, en orden,
 *  con la variante que pida la plantilla inyectada como prop. */
export function buildPlan(
  store: Store,
  orden: { id: SectionId; variant?: string }[]
) {
  return orden
    .map(({ id, variant }) => {
      const def = SECTIONS[id];
      if (!def) return null; // id desconocido: se ignora, no tumba la página
      if (def.visible && !def.visible(store)) return null;
      const props = def.props(store);
      // La variante llega a todos los componentes por igual; el que no la use
      // simplemente la ignora, porque Astro no falla por props de más.
      return { id, component: def.component, props: variant ? { ...props, variant } : props };
    })
    .filter(Boolean) as {
    id: SectionId;
    component: any;
    props: Record<string, any>;
  }[];
}
