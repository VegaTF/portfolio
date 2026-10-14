import { useEffect } from 'react'

// Distancia visual deseada entre el contenido de una sección y el de la siguiente,
// como fracción del alto de pantalla (con límites en px). Es la misma para todas.
const GAP_RATIO = 0.275
const GAP_MIN = 140
const GAP_MAX = 260

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
        const gap = second.getBoundingClientRect().top - first.getBoundingClientRect().bottom
        const natural = gap + (pulls[firstId] ?? 0)
        const pull = Math.max(0, Math.round(natural - target))

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
