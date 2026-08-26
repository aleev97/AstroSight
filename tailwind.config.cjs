// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Rutas donde Tailwind buscará clases usadas, para hacer tree-shaking del CSS final
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta personalizada para la temática "cielo nocturno"
        space: {
          950: '#030712',
          900: '#0a0f1e',
          800: '#131b2e',
        },
        nebula: {
          500: '#6366f1',
        },
        star: {
          400: '#fde68a',
        },
      },
    },
  },
  plugins: [],
};