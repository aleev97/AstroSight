// astro.config.mjs (variante Tailwind v4)
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()], // Tailwind v4 se integra como plugin de Vite, no como integración Astro
  },
});