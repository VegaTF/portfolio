import { useEffect } from 'react'
import { SECTIONS } from '../config/sections'
import { getSectionGeometry } from '../lib/sectionGeometry'
import { scrollState } from '../state/scrollState'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// A partir de este index (Contacto casi a mitad de pantalla) se invierten los colores.
const DARK_FROM_INDEX = 2.5

// Un único listener de scroll para toda la app. Escribe en scrollState.
export function useScrollProgress() {
  useEffect(() => {
    let geometry = { tops: [], rests: [], max: 0, viewport: 0 }

    const update = () => {
      const y = window.scrollY
      const { tops, rests, max, viewport } = geometry
      if (!tops.length) return
      scrollState.progress = max > 0 ? clamp(y / max, 0, 1) : 0

      // Última sección cuyo inicio ya ha pasado la parte superior de la pantalla.
      let i = 0
      for (let k = 0; k < tops.length; k++) if (y >= tops[k] - 1) i = k

      // Entre tops[i] y rests[i] la sección está en reposo (index entero); la
      // transición a la siguiente ocurre entre rests[i] y tops[i + 1].
      const next = tops[i + 1]
      const span = next !== undefined ? next - rests[i] : 0
      const frac = span > 0 ? clamp((y - rests[i]) / span, 0, 1) : 0
      scrollState.index = clamp(i + frac, 0, tops.length - 1)
      scrollState.offset = clamp(y - tops[i], 0, rests[i] - tops[i])

      // Sección activa: la que ocupa el centro de la pantalla.
      const center = y + viewport / 2
      let active = 0
      for (let k = 0; k < tops.length; k++) if (center >= tops[k]) active = k
      scrollState.section = SECTIONS[active].id
      // Los colores del degradado de fondo cambian con la sección (ver index.css).
      if (document.documentElement.dataset.section !== scrollState.section) {
        document.documentElement.dataset.section = scrollState.section
      }

      // Modo oscuro parcial: Contacto y Footer invierten los colores.
      document.documentElement.classList.toggle('theme-dark', scrollState.index > DARK_FROM_INDEX)
    }

    const measure = () => {
      geometry = getSectionGeometry()
      update()
    }

    measure()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    // El contenido puede cambiar de altura (fuentes, imágenes): remedimos.
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(document.body)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', measure)
      resizeObserver.disconnect()
    }
  }, [])
}
