import bun from '@nurodev/astro-bun';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  adapter: bun(),
  output: 'hybrid',
});
