/**
 * LA CITA DE ASESORAMIENTO — elegir una frase real sin cambiarle el sentido
 *
 * «Por qué en tienda» afirma que atiende una persona, y esa afirmación la tiene
 * que sostener alguien que no seamos nosotros. Las ocho reseñas del repositorio
 * elogian el asesoramiento, así que el material existe; el problema es que una
 * reseña entera mide entre 60 y 300 caracteres y no cabe en la sección.
 *
 * RECORTAR UNA RESEÑA ES PELIGROSO. Cortar por la mitad puede cambiar lo que
 * dijo esa persona, y hablamos de texto firmado con nombre y apellidos que la
 * tienda republica. Por eso aquí no se trunca nunca: se elige una FRASE
 * COMPLETA de la reseña, la más corta que hable del asesoramiento.
 *
 * Y no se coge la primera frase por sistema: la de El Arcángel empieza hablando
 * de la variedad de producto y el elogio al trato viene después. Coger la
 * primera habría publicado una cita que no sostiene la afirmación de al lado.
 *
 * Sin ninguna reseña —hoy 5 de 8 tiendas— no se inventa nada: la sección usa
 * el hecho operativo, que es verdad en las ocho.
 */

/** Lo que hace que una frase sirva para sostener «te asesora una persona». */
const HABLA_DE_ASESORAMIENTO = /asesor|aconsej|atenci[oó]n|atendi|ayuda|recomend/i;

/** Ni un titular de dos palabras ni un párrafo: lo que cabe y se lee. */
const MINIMO = 30;
const MAXIMO = 120;

export interface Cita {
  texto: string;
  autor: string;
}

/**
 * La frase más corta, completa y sobre el asesoramiento, de las reseñas de esta
 * tienda. `null` si no hay ninguna que sirva.
 */
export function citaDeAsesoramiento(reviews: { text: string; author: string }[]): Cita | null {
  const candidatas: Cita[] = [];

  for (const r of reviews) {
    // Se parte por final de frase de verdad (punto, exclamación, interrogación)
    // y se conserva la frase entera, sin el signo final para poder entrecomillar.
    for (const trozo of r.text.split(/(?<=[.!?…])\s+/)) {
      const frase = trozo.trim().replace(/[.!?…]+$/, '').trim();
      if (frase.length < MINIMO || frase.length > MAXIMO) continue;
      if (!HABLA_DE_ASESORAMIENTO.test(frase)) continue;
      candidatas.push({ texto: frase, autor: r.author });
    }
  }

  if (candidatas.length === 0) return null;
  // La más corta; a igualdad, la primera, para que dos builds den lo mismo.
  return candidatas.reduce((mejor, c) => (c.texto.length < mejor.texto.length ? c : mejor));
}
