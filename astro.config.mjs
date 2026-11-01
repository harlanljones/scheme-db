import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// The relaunch site: static pages built from `data/`, with React islands only where a page needs to move.
export default defineConfig({
  site: 'https://schemedb.harlanljones.com',
  srcDir: './site',
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
  build: { format: 'directory' },
});
