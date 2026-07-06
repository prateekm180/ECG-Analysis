/**
 * CORVIS PostCSS Configuration
 * ----------------------------
 * Tailwind v4 requires the '@tailwindcss/postcss' package.
 * This file bridges the gap between Vite and Tailwind CSS.
 *
 * Note: autoprefixer was removed — Tailwind v4's @tailwindcss/postcss
 * plugin handles vendor prefixing internally (via Lightning CSS), so a
 * separate autoprefixer pass is redundant and just adds build time.
 */

export default {
  plugins: {
    // Ye line v3 ke 'tailwindcss' plugin ko replace karti hai
    "@tailwindcss/postcss": {},
  },
}