import { copyFileSync } from 'node:fs'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// Inyecta en <head> las etiquetas que exigen URL ABSOLUTA (canonical y vista previa
// al compartir). Solo si se ha definido VITE_SITE_URL: sin dominio no tiene sentido
// ponerlas con valores relativos.
function seoUrls(siteUrl) {
  return {
    name: 'seo-urls',
    transformIndexHtml() {
      if (!siteUrl) return []
      return [
        { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${siteUrl}/` }, injectTo: 'head' },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: `${siteUrl}/og-image.png` },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: `${siteUrl}/og-image.png` },
          injectTo: 'head',
        },
      ]
    },
  }
}

// GitHub Pages es estático: una URL como /portfolio/projects no existe como archivo y
// devuelve su 404.html. Copiando index.html a 404.html, esa dirección carga la app, que
// lee la ruta y lleva a la sección (ver hooks/useSectionUrl.js).
function spaFallback() {
  return {
    name: 'spa-fallback',
    apply: 'build',
    writeBundle(options) {
      if (!options.dir) return
      copyFileSync(join(options.dir, 'index.html'), join(options.dir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '')

  return {
    base: '/portfolio/',
    plugins: [react(), tailwindcss(), seoUrls(siteUrl), spaFallback()],
  }
})
