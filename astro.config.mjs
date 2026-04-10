import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://usafitness.es',
  integrations: [sitemap()],
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
