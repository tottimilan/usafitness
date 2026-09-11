/**
 * SACAR Y REFRESCAR LOS PLACE ID SIN ACCESO DE GESTOR NI API DE PAGO
 *
 * Google exige el Place ID (`ChIJ…`) para el formulario de «escribir reseña»;
 * el CID que ya guardamos solo abre la ficha. La vía documentada para
 * conseguirlo pasa por el panel de Perfil de Empresa, que exige que el
 * franquiciado nos dé acceso de gestor — una puerta externa por tienda, para un
 * dato que ya está en el repositorio: el HTML del propio embed por CID lo trae.
 *
 * Este script lo extrae, comprueba con el mismo descodificador que usa el build
 * que lleva dentro el CID correcto, y con `--escribir` lo guarda.
 *
 *   node scripts/place-id.mjs             lista lo que hay y lo que falta
 *   node scripts/place-id.mjs --verificar sale con 1 si alguno no cuadra
 *   node scripts/place-id.mjs --escribir  rellena los que falten
 *
 * Google avisa de que un Place ID puede cambiar y recomienda refrescarlo
 * pasados doce meses: `--verificar` es esa pasada, y entra en el Semáforo NAP.
 * Comprueba las 58 tiendas en menos de un minuto.
 *
 * Si algún día el embed deja de traer el `ChIJ` —es un detalle que Google no
 * documenta— el script lo dice y manda al buscador oficial de Place ID, que es
 * un minuto a mano por tienda. No se queda callado.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { cidDePlaceId } from '../src/data/resenas.ts';

const FICHERO = new URL('../src/data/stores.json', import.meta.url);
const escribir = process.argv.includes('--escribir');
const verificar = process.argv.includes('--verificar');

const original = readFileSync(FICHERO, 'utf8');
const datos = JSON.parse(original);
let problemas = 0;
const nuevos = new Map();

for (const t of datos.stores) {
  if (t.googleMapsStatus === 'sin-ficha-gbp') {
    console.log(`  ${t.slug}: sin ficha de Google — no procede`);
    continue;
  }
  const cid = t.googleMapsLink?.match(/\d{15,20}/)?.[0];
  if (!cid) {
    console.error(`✖ ${t.slug}: sin googleMapsLink por CID, no hay de dónde sacarlo`);
    problemas++;
    continue;
  }

  const url = `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s${cid}!3m1!1ses!5m1!1ses`;
  let html;
  try {
    html = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      },
    }).then((r) => r.text());
  } catch (e) {
    console.error(`✖ ${t.slug}: no se pudo consultar Google (${e.message})`);
    problemas++;
    continue;
  }

  const encontrado = html.match(/ChIJ[A-Za-z0-9_-]{23}/)?.[0] ?? null;
  if (!encontrado) {
    console.error(
      `✖ ${t.slug}: el embed ya no trae el Place ID. Sácalo a mano en ` +
        `https://developers.google.com/maps/documentation/places/web-service/place-id (CID ${cid})`
    );
    problemas++;
    continue;
  }
  if (cidDePlaceId(encontrado) !== cid) {
    console.error(
      `✖ ${t.slug}: el Place ID ${encontrado} lleva dentro ${cidDePlaceId(encontrado)} y esperábamos ${cid}`
    );
    problemas++;
    continue;
  }

  if (t.placeId && t.placeId !== encontrado) {
    console.error(`✖ ${t.slug}: HA CAMBIADO — guardado ${t.placeId}, Google devuelve ${encontrado}`);
    problemas++;
    if (escribir) nuevos.set(t.slug, encontrado);
  } else if (!t.placeId) {
    console.log(`+ ${t.slug}: ${encontrado}`);
    if (escribir) nuevos.set(t.slug, encontrado);
    else problemas++;
  } else {
    console.log(`  ${t.slug}: ${t.placeId} ✓`);
  }
}

if (escribir && nuevos.size > 0) {
  // Se escribe por TEXTO y no reserializando el JSON: así el diff son las
  // líneas que cambian y no el fichero entero reformateado.
  let texto = original;
  for (const t of datos.stores) {
    const valor = nuevos.get(t.slug);
    if (!valor) continue;
    const cid = t.googleMapsLink.match(/\d{15,20}/)[0];
    if (t.placeId) {
      texto = texto.replace(`"placeId": "${t.placeId}"`, `"placeId": "${valor}"`);
    } else {
      const ancla = `"googleMapsLink": "https://maps.google.com/?cid=${cid}"`;
      texto = texto.replace(ancla, `${ancla},\n      "placeId": "${valor}"`);
    }
  }
  writeFileSync(FICHERO, texto);
  console.log(`\n${nuevos.size} escritos en stores.json — mira el diff antes de commitear`);
}

if (verificar && problemas > 0) process.exit(1);
