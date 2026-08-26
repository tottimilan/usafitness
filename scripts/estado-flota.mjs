/**
 * ¿QUÉ SIRVE CADA DOMINIO AHORA MISMO?
 *
 *   npm run flota
 *
 * Sondea `/health` en el dominio de cada tienda y dice qué hay al otro lado.
 * Toda la clasificación vive en `src/data/flota.ts`, que es función pura y está
 * bajo test con los dos fallos reales del 2026-08-26 congelados como casos.
 * Aquí solo vive la red.
 *
 * NO SUSTITUYE AL MONITOR EXTERNO, y conviene tenerlo claro: esto se ejecuta
 * cuando alguien lo ejecuta. Sirve para mirar durante una migración —que es
 * cuando el estado cambia— y para comprobar un alta recién hecha. Lo que avisa
 * a las 4 de la mañana es el monitor, y sigue pendiente (riesgo #10).
 *
 * Sale con código 1 si alguna tienda tiene un problema, para poder encadenarlo.
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { clasificar, resumirFlota } from '../src/data/flota.ts';

const TIEMPO_LIMITE = 20_000;

const { stores } = JSON.parse(readFileSync(new URL('../src/data/stores.json', import.meta.url), 'utf8'));

/**
 * Se resuelve el DNS por separado ANTES de la petición. `fetch` mezcla los dos
 * fallos en un `TypeError: fetch failed` genérico, y la diferencia entre "el
 * dominio no existe" y "el servidor no contesta" es justo la que decide a quién
 * llamar: al registrador o a Railway.
 */
async function sondear(tienda) {
  try {
    await lookup(tienda.domain);
  } catch {
    return { slug: tienda.slug, dominio: tienda.domain, resuelveDns: false, codigo: null, cuerpo: null };
  }

  try {
    const res = await fetch(`https://${tienda.domain}/health`, {
      signal: AbortSignal.timeout(TIEMPO_LIMITE),
      redirect: 'follow',
      headers: { 'User-Agent': 'usafitness-estado-flota' },
    });
    // El cuerpo se corta: si el dominio sirve otra cosa, puede ser una página
    // entera de WordPress y solo hacen falta las primeras líneas para
    // reconocerla.
    const cuerpo = (await res.text()).slice(0, 4000);
    const base = { slug: tienda.slug, dominio: tienda.domain, resuelveDns: true, codigo: res.status, cuerpo };

    // Segunda petición SOLO si la primera no fue nuestra. El 404 que devuelve
    // `/health` en un WordPress no lleva ninguna huella reconocible; la portada
    // sí. Sondearla siempre sería doblar el tráfico contra webs de clientes para
    // no aprender nada en el caso normal.
    if (cuerpo.includes('"dominios"')) return base;
    return { ...base, cuerpoPortada: await portada(tienda.domain) };
  } catch {
    return { slug: tienda.slug, dominio: tienda.domain, resuelveDns: true, codigo: null, cuerpo: null };
  }
}

async function portada(dominio) {
  try {
    const res = await fetch(`https://${dominio}/`, {
      signal: AbortSignal.timeout(TIEMPO_LIMITE),
      redirect: 'follow',
      headers: { 'User-Agent': 'usafitness-estado-flota' },
    });
    return (await res.text()).slice(0, 4000);
  } catch {
    return null;
  }
}

const ICONO = {
  servida: '✔',
  'sin-dns': '✖',
  'otro-sistema': '✖',
  'enrutado-roto': '✖',
  degradada: '!',
  'sin-clasificar': '?',
};

const diagnosticos = (await Promise.all(stores.map(sondear))).map(clasificar);
const r = resumirFlota(diagnosticos);

console.log(`\n  ESTADO DE LA FLOTA — ${r.servidas}/${r.total} sirviendo lo nuestro\n`);
for (const d of diagnosticos) {
  console.log(`  ${ICONO[d.estado]} ${d.slug.padEnd(12)} ${d.dominio.padEnd(28)} ${d.detalle}`);
}

if (r.shas.length > 1) {
  console.log(`\n  ! ${r.shas.length} SHAs distintos entre dominios servidos: ${r.shas.map((s) => s.slice(0, 8)).join(', ')}`);
  console.log('    Un solo servicio sirve todos los dominios, así que esto no debería pasar.');
} else if (r.shas.length === 1) {
  let local = null;
  try {
    local = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    /* fuera de un repo git: el SHA desplegado sigue siendo útil por sí solo */
  }
  const desplegado = r.shas[0];
  console.log(`\n  desplegado: ${desplegado.slice(0, 8)}`);
  if (local && local !== desplegado) {
    console.log(`  local HEAD: ${local.slice(0, 8)}  ← distinto: lo que tienes delante no es lo que sirve producción`);
  }
}

if (r.problemas.length) {
  console.log(`\n  ${r.problemas.length} tienda(s) exigen actuar: ${r.problemas.map((p) => p.slug).join(', ')}\n`);
  process.exit(1);
}

console.log('\n  Todas las tiendas sirven su propia web.\n');
