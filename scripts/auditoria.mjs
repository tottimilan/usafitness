/**
 * LA ALARMA DE DEPENDENCIAS
 *
 *   npm run auditoria
 *
 * Corre `npm audit`, y deja pasar el build solo si todos los avisos CRÍTICOS
 * están en una lista de excepciones con fecha, motivo y evidencia medida.
 *
 * Toda la decisión vive en `src/data/auditoria.ts`, que es función pura y está
 * bajo test con los casos que importan: el aviso nuevo, la excepción caducada,
 * la que sobra y la del plazo imposible. Aquí solo viven el `npm audit`, el
 * reloj y la pantalla — igual que en `estado-flota.mjs` aquí solo vive la red.
 *
 * FALLA CERRADO. Si `npm audit` no se puede ejecutar o no devuelve algo que se
 * pueda leer, esto sale con 1. Una alarma que se cae en silencio y deja pasar
 * el build es peor que no tenerla.
 */

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { revisarAuditoria, PLAZO_MAXIMO_DIAS } from '../src/data/auditoria.ts';

const LISTA = new URL('../docs/security/excepciones-audit.json', import.meta.url);

/** La fecha de HOY en Madrid. El resto del proyecto ya calcula así los días. */
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());

function auditar() {
  try {
    // `npm audit` sale con 1 cuando encuentra algo, que es lo normal aquí: el
    // código de salida no dice nada que no diga ya el informe.
    return JSON.parse(
      execFileSync('npm', ['audit', '--json'], {
        encoding: 'utf8',
        shell: process.platform === 'win32',
        maxBuffer: 32 * 1024 * 1024,
      })
    );
  } catch (e) {
    if (e.stdout) {
      try {
        return JSON.parse(e.stdout);
      } catch {
        /* se cae abajo */
      }
    }
    console.error(`\n  No se pudo leer el informe de npm audit: ${e.message}\n`);
    process.exit(1);
  }
}

let excepciones;
try {
  excepciones = JSON.parse(readFileSync(LISTA, 'utf8')).excepciones;
  if (!Array.isArray(excepciones)) throw new Error('la clave «excepciones» no es una lista');
} catch (e) {
  console.error(`\n  No se pudo leer ${LISTA.pathname}: ${e.message}\n`);
  process.exit(1);
}

const { problemas, aceptados } = revisarAuditoria({ informe: auditar(), excepciones, hoy });

console.log(`\n  AUDITORÍA DE DEPENDENCIAS — ${hoy}\n`);

for (const a of aceptados) {
  const e = excepciones.find((x) => x.aviso === a.aviso);
  console.log(`  · aceptado hasta ${e.caduca}  ${a.aviso}  ${a.paquete}`);
  console.log(`      ${e.motivo}`);
  console.log(`      cierra en ${e.cierraEn} · evidencia: ${e.evidencia}`);
}

if (!problemas.length) {
  const n = aceptados.length;
  console.log(
    n
      ? `\n  Ningún crítico nuevo. ${n} aceptado(s) con fecha; el build pasa.\n`
      : '\n  Ningún aviso crítico, y ninguna excepción abierta.\n'
  );
  process.exit(0);
}

const COMO = {
  desconocido: 'Triarlo en docs/security/ y, si se acepta, añadirlo a la lista con su evidencia.',
  caducada: 'Volver a medirlo: o se arregla, o se renueva la fecha con la evidencia de hoy.',
  sobra: 'Borrar esa entrada de docs/security/excepciones-audit.json.',
  'plazo-largo': `Acortar el plazo: máximo ${PLAZO_MAXIMO_DIAS} días desde que se abrió.`,
  incompleta: 'Rellenar los campos que faltan, o quitar la entrada.',
};

console.log(`  ${problemas.length} problema(s):\n`);
for (const p of problemas) {
  console.log(`  ✖ [${p.clase}] ${p.aviso}`);
  console.log(`      ${p.detalle}`);
  console.log(`      → ${COMO[p.clase]}\n`);
}
process.exit(1);
