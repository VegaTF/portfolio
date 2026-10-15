import { useEffect } from 'react'
import { SECTIONS } from '../config/sections'
import { scrollState } from '../state/scrollState'

// Mantiene la URL sincronizada con la sección visible: /portfolio/home, /portfolio/projects…
// y al abrir una de esas URLs directamente, lleva a su sección.
//
//  - Se usa `replaceState` (no `pushState`): cada sección por la que pasas no añade una
//    entrada al historial, así el botón "atrás" sigue saliendo de la web y no obliga a
//    retroceder sección por sección.
//  - GitHub Pages es estático: para que /portfolio/projects cargue al recargar o compartir
//    el enlace, la build copia index.html a 404.html (ver vite.config.js).
const BASE = import.meta.env.BASE_URL // '/portfolio/'
const IDS = SECTIONS.map((section) => section.id)

// Sección que indica la URL actual (o null si no es una de ellas).
function sectionFromPath() {
  const { pathname } = window.location
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname
  const id = rest.replace(/^\/+|\/+$/g, '')
  return IDS.includes(id) ? id : null
}

export function useSectionUrl() {
  useEffect(() => {
    const target = sectionFromPath()
    const hasTarget = target !== null && target !== 'home'

    // Mientras se coloca la página en la sección de la URL, no se sobrescribe la URL
    // (al arrancar la sección visible sigue siendo Home).
    let settled = !hasTarget
    let userMoved = false
    let timer = null

    const goToTarget = () => {
      const el = document.getElementById(target)
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
      }
    }
    const onUserInput = () => {
      userMoved = true
    }

    if (hasTarget) {
      window.addEventListener('wheel', onUserInput, { passive: true })
      window.addEventListener('touchstart', onUserInput, { passive: true })
      window.addEventListener('keydown', onUserInput)
      // El layout se asienta en varias fases (fuentes, espaciado entre secciones): se
      // recoloca al arrancar y de nuevo cuando ha terminado, salvo que el usuario ya
      // haya empezado a moverse por su cuenta.
      requestAnimationFrame(goToTarget)
      document.fonts?.ready.then(() => {
        if (!userMoved) goToTarget()
      })
      timer = window.setTimeout(() => {
        if (!userMoved) goToTarget()
        settled = true
      }, 900)
    }

    // Vigila scrollState.section (objeto mutable, sin renders) y escribe la URL solo
    // cuando CAMBIA.
    let raf
    let last = null
    const tick = () => {
      if ((settled || userMoved) && scrollState.section !== last) {
        last = scrollState.section
        const url = `${BASE}${last}${window.location.search}`
        if (window.location.pathname + window.location.search !== url) {
          window.history.replaceState(window.history.state, '', url)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      window.removeEventListener('wheel', onUserInput)
      window.removeEventListener('touchstart', onUserInput)
      window.removeEventListener('keydown', onUserInput)
    }
  }, [])
}
