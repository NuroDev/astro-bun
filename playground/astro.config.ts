import { defineConfig } from 'astro/config';
import { createResolver } from 'astro-integration-kit';
import { hmrIntegration } from 'astro-integration-kit/dev';

const { default: bun } = await import('@nurodev/astro-bun');

// https://astro.build/config
export default defineConfig({
  adapter: bun(),
  integrations: [
    hmrIntegration({
      directory: createResolver(import.meta.url).resolve('../package/dist'),
    }),
  ],
  output: 'server',
});
