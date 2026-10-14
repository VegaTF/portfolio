import { useEffect, useRef } from 'react'
import { mouseState } from '../state/mouseState'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Mueve su contenido unos píxeles siguiendo al ratón. Escribe el transform
// directamente en el DOM (sin estado de React) para no re-renderizar en cada frame.
export default function Parallax({ strength = 10, className, children }) {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion) return

    let raf
    let x = 0
    let y = 0
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      // Suavizado exponencial hacia el objetivo (equivale a MathUtils.damp).
      const k = 1 - Math.exp(-5 * dt)
      x += (mouseState.x * strength - x) * k
      y += (-mouseState.y * strength * 0.6 - y) * k
      if (ref.current) {
        ref.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [strength])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
