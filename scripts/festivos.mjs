/**
 * QUÉ DÍAS HAY QUE PREGUNTARLE A CADA CENTRO COMERCIAL
 *
 * El calendario que la web necesita es el del CENTRO, no el de la comunidad
 * autónoma: la Ley 1/2004 art. 5 da libertad de días y horas a los locales de
 * menos de 300 m² que no pertenecen a un grupo grande, y nuestras tiendas lo
 * son. Así que el dato no se deduce de ninguna norma: se pregunta.
 *
 * Lo que sí sale gratis es la LISTA DE DÍAS por los que preguntar. Este script
 * la saca de los festivos nacionales y autonómicos, cruza cada tienda con la
 * comunidad de su provincia, y escribe el esqueleto que el operador rellena
 * mirando la web del centro o preguntando al franquiciado.
 *
 *   node scripts/festivos.mjs 2027
 *   node scripts/festivos.mjs 2027 --json   (el esqueleto listo para pegar)
 *
 * Son unos catorce días por comunidad. Preguntar por catorce es una llamada;
 * mirar 365, un proyecto.
 *
 * Fuente: date.nager.at (MIT, instancia pública gratuita), que devuelve los
 * festivos de España con su código de comunidad. Si algún día no responde, la
 * misma lista está en la resolución anual del BOE.
 */
import { readFileSync } from 'node:fs';

const anio = Number(process.argv[2]) || new Date().getFullYear() + 1;
const comoJson = process.argv.includes('--json');

// La comunidad de cada tienda, por su provincia. `addressRegion` en stores.json
// es la PROVINCIA, y los festivos vienen por comunidad.
const COMUNIDAD = {
  'A Coruña': 'ES-GA', Pontevedra: 'ES-GA', Lugo: 'ES-GA', Ourense: 'ES-GA',
  Madrid: 'ES-MD',
  Zaragoza: 'ES-AR', Huesca: 'ES-AR', Teruel: 'ES-AR',
  Sevilla: 'ES-AN', Córdoba: 'ES-AN', Málaga: 'ES-AN', Granada: 'ES-AN',
  Cádiz: 'ES-AN', Almería: 'ES-AN', Huelva: 'ES-AN', Jaén: 'ES-AN',
};

const { stores } = JSON.parse(readFileSync(new URL('../src/data/stores.json', import.meta.url), 'utf8'));

const festivos = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${anio}/ES`).then((r) => r.json());

// Un centro por clave: dos tiendas del mismo centro comparten calendario.
const centros = new Map();
for (const t of stores) {
  const cca = COMUNIDAD[t.addressRegion];
  if (!cca) {
    console.error(`✖ ${t.slug}: no sé en qué comunidad está "${t.addressRegion}". Añádela a COMUNIDAD en este script.`);
    continue;
  }
  if (!centros.has(t.mall)) centros.set(t.mall, { cca, slugs: [], region: t.addressRegion });
  centros.get(t.mall).slugs.push(t.slug);
}

const esqueleto = {};
for (const [mall, { cca, slugs, region }] of centros) {
  const dias = festivos
    .filter((f) => f.global || (f.counties ?? []).includes(cca))
    .map((f) => ({ fecha: f.date, nombre: f.localName }));

  if (!comoJson) {
    console.log(`\n${mall}  (${slugs.join(', ')} · ${region})`);
    for (const d of dias) console.log(`   ${d.fecha}  ${d.nombre}`);
    console.log(`   → ${dias.length} días que preguntar. Los que el centro abra normal, se borran.`);
  }
  esqueleto[mall] = {
    fuente: 'PENDIENTE: web del centro o franquiciado',
    leidoEl: 'PENDIENTE',
    cubreHasta: `${anio}-12-31`,
    dias: Object.fromEntries(dias.map((d) => [d.fecha, null])),
  };
}

if (comoJson) {
  console.log(JSON.stringify({ centros: esqueleto }, null, 2));
} else {
  console.log(
    `\nCada día listado va en src/data/festivos.json con null (cerrado) o con sus horas.\n` +
      `Un día que el centro abra normal NO se lista. Y hasta que 'cubreHasta' no llegue a hoy,\n` +
      `esas tiendas no emiten minutero: es la degradación de R3, ahora con datos.\n` +
      `Con --json sale el esqueleto listo para pegar.`
  );
}
