import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { fileURLToPath } from 'node:url';

/**
 * Valida `stores.json` y los ficheros que declara ANTES de compilar, y al
 * arrancar `astro dev`.
 *
 * Sin esto, el esquema de `src/data/stores.ts` solo se ejecuta cuando el
 * servidor carga el módulo — es decir, ya desplegado. Un dato roto pasaría el
 * build, pasaría el CI, se desplegaría, y tumbaría los 7 dominios a la vez al
 * arrancar. El fallo tiene que ocurrir aquí, en la máquina de quien lo escribió.
 */
function validarDatosDeTienda() {
  return {
    name: 'usafitness:validar-datos',
    hooks: {
      'astro:config:setup': async ({ logger, config }) => {
        const { stores, avisosDeDatos } = await import('./src/data/stores.ts');
        logger.info(`stores.json válido — ${stores.length} tiendas`);

        // El esquema comprueba que una ruta TENGA forma de ruta; esto
        // comprueba que el fichero exista. Es un error, no un aviso: una ruta
        // mal escrita no da fallo, da un hueco roto en el dominio de un
        // cliente que paga y solo se descubre mirando.
        const { assetsQueFaltan } = await import('./src/build/verificar-assets.ts');
        const faltan = assetsQueFaltan(stores, fileURLToPath(config.publicDir));
        if (faltan.length > 0) {
          const lista = faltan.map((f) => `  ✖ ${f}`).join('\n');
          throw new Error(
            `\n\nFaltan ${faltan.length} ficheros en public/. No se despliega nada hasta arreglarlo:\n\n${lista}\n`
          );
        }

        // Se miden las imágenes ANTES de compilar y el resultado se escribe en
        // `src/data/dimensiones.json`, que la galería importa. No se puede
        // medir al renderizar: en SSR sería leer disco en cada petición, y al
        // cargar el módulo tampoco vale porque en producción `public/` ya no
        // existe con ese nombre — el adaptador la copia a `dist/client/`.
        const { escribirDimensiones } = await import('./src/build/medir-imagenes.ts');
        const { total, cambios } = escribirDimensiones(
          fileURLToPath(config.publicDir),
          fileURLToPath(new URL('./src/data/dimensiones.json', import.meta.url))
        );
        logger.info(
          `${total} imágenes medidas${cambios ? ` — dimensiones.json ACTUALIZADO (commitéalo)` : ''}`
        );

        // Los avisos no rompen nada: son carencias que dependen de datos que
        // tiene que dar el franquiciado. Se listan para que se vean.
        for (const aviso of avisosDeDatos()) logger.warn(aviso);

        // Fotos que se verán ampliadas. Mismo trato que los avisos de datos: no
        // rompen el build, pero sin decirlo nadie descubre que hace falta pedir
        // fotos mejores — desde la pantalla eso no se deduce.
        const { avisosDeGaleria } = await import('./src/data/galeria-de-tiendas.ts');
        for (const aviso of avisosDeGaleria(stores)) logger.warn(aviso);
      },
    },
  };
}

export default defineConfig({
  output: 'server',
  // Una sola forma canónica por URL. Sin esto, /aviso-legal y /aviso-legal/
  // son dos URLs que devuelven la misma página, y Google las trata como
  // contenido duplicado. El middleware redirige con 301 las que lleguen con
  // barra final, para que el enlace externo acabe corrigiéndose.
  trailingSlash: 'never',
  adapter: node({ mode: 'standalone' }),
  site: 'https://usafitness.es',
  integrations: [validarDatosDeTienda()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '4321'),
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
