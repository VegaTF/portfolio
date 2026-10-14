import { useEffect } from 'react'
import { mouseState } from '../state/mouseState'

// Escucha el ratón en toda la ventana y lo guarda en mouseState.
// Se escucha en window (no en el canvas) porque el canvas tiene pointer-events-none
// y el HTML de las secciones va por encima.
export function useMousePosition() {
  useEffect(() => {
    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      mouseState.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseState.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}
