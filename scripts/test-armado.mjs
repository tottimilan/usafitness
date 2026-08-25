/**
 * LA SUITE, ARMADA
 *
 * Hoy ninguna tienda tiene `ga4Id` ni `googleSiteVerification`, así que los
 * tests que protegen la puerta de consentimiento y el acotado del token de
 * Search Console duermen (`skipped 2`), y los siete del bloque «Nada de
 * terceros antes del consentimiento» pasan por construcción: sin ID, el
 * componente no emite un solo byte que nombre a Google.
 *
 * La revisión del PR #1 lo demostró de la forma incómoda (I-3): reponiendo el
 * `<script async src=gtag.js>` anterior al PR — la vulnerabilidad entera de
 * 145 KB — la suite seguía en verde. La verificación con datos armados existía,
 * pero era un ritual manual: inyectar un ID de prueba, compilar, mirar, restaurar.
 * Los rituales manuales se olvidan; este fichero lo convierte en un paso de CI.
 *
 * Qué hace: inyecta una tienda con datos de FIXTURE (válidos para el esquema
 * Zod, inequívocamente falsos para un humano), recompila, corre la suite
 * entera —los dormidos despiertan: 0 skipped— y restaura SIEMPRE, pase lo que
 * pase. Si tras restaurar `stores.json` difiere de git, el script falla: un
 * fixture superviviente desplegaría un ID inventado en el dominio de un
 * cliente real.
 *
 *   npm run test:armado
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const FICHERO = new URL('../src/data/stores.json', import.meta.url);

// Válidos para Zod (^(G|GT)-[A-Z0-9]+$ · min 10 chars), imposibles de confundir
// con datos reales.
const FIXTURE = {
  ga4Id: 'G-FIXTURE0000',
  googleSiteVerification: 'fixture-no-es-un-token-real',
};

const original = readFileSync(FICHERO, 'utf8');

function correr(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: new URL('..', import.meta.url) });
}

let codigo = 0;
try {
  const datos = JSON.parse(original);
  // La primera tienda basta: los tests con `skip` buscan «alguna tienda con el
  // campo», y el bloque de terceros recorre las 7 igualmente.
  Object.assign(datos.stores[0], FIXTURE);
  writeFileSync(FICHERO, JSON.stringify(datos, null, 2) + '\n');
  console.log(`\n[test-armado] fixture inyectado en "${datos.stores[0].slug}" — compilando y corriendo la suite armada\n`);

  correr('npm run build');
  correr('node --test tests/*.test.mjs');
} catch {
  codigo = 1;
} finally {
  writeFileSync(FICHERO, original);
}

// Cinturón y tirantes: el restaurado de arriba escribe el contenido original
// byte a byte, pero si algo se torciera (otro proceso tocando el fichero, un
// crash a medias), git es el árbitro.
try {
  execSync('git diff --quiet -- src/data/stores.json', { cwd: new URL('..', import.meta.url) });
} catch {
  console.error('\n[test-armado] ✖ stores.json quedó distinto de git tras restaurar. NO despliegues hasta mirar esto.\n');
  codigo = 1;
}

console.log(codigo === 0 ? '\n[test-armado] ✔ suite armada en verde y datos restaurados\n' : '\n[test-armado] ✖ fallo — ver arriba\n');
process.exit(codigo);
