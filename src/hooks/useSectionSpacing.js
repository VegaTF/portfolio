import { useEffect } from 'react'

// Distancia visual deseada entre el contenido de una sección y el de la siguiente,
// como fracción del alto de pantalla (con límites en px). Es la misma para todas.
const GAP_RATIO = 0.275
const GAP_MIN = 140
const GAP_MAX = 260
// Margen (px) por debajo del borde de la pantalla en el que debe quedar el contenido de
// la siguiente sección cuando la actual está en reposo (sombras, desenfoque de la card).
const PEEK_MARGIN = 32

// Pares de secciones consecutivas (la primera "se acerca" a la segunda).
const PAIRS = [
  ['home', 'projects'],
  ['projects', 'about'],
  ['about', 'contact'],
]

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// Cada sección centra su contenido en una pantalla entera, así que el hueco entre un
// contenido y el siguiente depende de lo alto que sea cada uno. Este hook mide esos
// huecos y aplica a cada sección un margen inferior negativo para que los tres sean
// iguales. Se recalcula al cambiar el tamaño de la ventana.
export function useSectionSpacing() {
  useEffect(() => {
    const pulls = {} // margen negativo aplicado ahora a cada sección (px)

    const contentOf = (id) => document.getElementById(id)?.firstElementChild ?? null

    const apply = () => {
      const target = clamp(window.innerHeight * GAP_RATIO, GAP_MIN, GAP_MAX)

      for (const [firstId, secondId] of PAIRS) {
        const first = contentOf(firstId)
        const second = contentOf(secondId)
        if (!first || !second) continue

        // Hueco "natural" = el actual + lo que ya habíamos acercado.
        const currentPull = pulls[firstId] ?? 0
        const secondTop = second.getBoundingClientRect().top
        const gap = secondTop - first.getBoundingClientRect().bottom
        const natural = gap + currentPull
        let pull = Math.max(0, Math.round(natural - target))

        // Nunca acercar tanto que, con la sección en reposo, asome la siguiente: en
        // pantallas altas (tablet) sobra mucho aire y el contenido de la sección de
        // abajo entraría por el borde inferior. Si la sección es más alta que la
        // pantalla (móvil) no hace falta: su reposo es la última pantalla.
        const section = document.getElementById(firstId)
        const sectionRect = section.getBoundingClientRect()
        if (sectionRect.height <= window.innerHeight + 1) {
          const room = secondTop + currentPull - sectionRect.top - window.innerHeight - PEEK_MARGIN
          pull = Math.min(pull, Math.max(0, Math.round(room)))
        }

        // Y lo mismo al revés: con la SIGUIENTE sección en reposo, el final del contenido
        // de la actual (p. ej. los botones de About) no debe asomar por arriba. El
        // acercamiento no puede ser mayor que el aire que hay bajo ese contenido.
        const below = sectionRect.bottom - first.getBoundingClientRect().bottom
        pull = Math.min(pull, Math.max(0, Math.round(below - PEEK_MARGIN)))

        pulls[firstId] = pull
        document.getElementById(firstId).style.marginBottom = `-${pull}px`
      }
    }

    apply()
    window.addEventListener('resize', apply)
    // Las fuentes pueden cambiar la altura del contenido al terminar de cargar.
    document.fonts?.ready.then(apply)

    // El layout no es definitivo al montar (fuentes, estilos): recalculamos cuando
    // cambia el tamaño de cualquier bloque de contenido. Los márgenes no cambian
    // esos tamaños, así que no hay bucle.
    const observer = new ResizeObserver(apply)
    for (const id of new Set(PAIRS.flat())) {
      const content = contentOf(id)
      if (content) observer.observe(content)
    }

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', apply)
    }
  }, [])
}
