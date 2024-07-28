import { createResolver } from 'astro-integration-kit';
import { hmrIntegration } from 'astro-integration-kit/dev';
import { defineConfig } from 'astro/config';

const { default: bun } = await import('@nurodev/astro-bun');

// https://astro.build/config
export default defineConfig({
  adapter: bun(),
  integrations: [
    hmrIntegration({
      directory: createResolver(import.meta.url).resolve('../package/dist'),
    }),
  ],
  output: 'hybrid',
});
