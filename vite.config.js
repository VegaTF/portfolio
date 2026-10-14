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

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '')

  return {
    base: '/portfolio/',
    plugins: [react(), tailwindcss(), seoUrls(siteUrl)],
  }
})
