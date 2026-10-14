import { useEffect, useRef } from 'react'
import { ABOUT_PORTRAIT_SLOT_ID, WORKS_AVATAR_SLOT_ID } from '../config/sections'
import {
  CONTACT_CANVAS_OPACITY,
  PORTRAIT_OUT,
  ease,
  sectionBlend,
} from '../config/choreography'
import { measureSlot } from '../lib/measureSlot'
import { scrollState } from '../state/scrollState'

const SECTION_COUNT = 4
const lerp = (a, b, t) => a + (b - a) * t

// Marco fijo del canvas. Según el scroll:
//  - en About lo recorta a un círculo (retrato) que sigue al avatar, con su aro;
//  - en Contacto baja su opacidad para que destaque el formulario.
// Todo se escribe en el DOM directamente, sin estado de React. El círculo, el aro y la
// cámara usan la misma curva de transición, así que siempre quedan alineados.
export default function SceneFrame({ children }) {
  const frameRef = useRef(null)
  const backdropRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    // Posiciones "en reposo" (en viewport) del avatar en Trabajos y del retrato en About.
    let works = null
    let portrait = null
    const measure = () => {
      works = measureSlot(WORKS_AVATAR_SLOT_ID)
      portrait = measureSlot(ABOUT_PORTRAIT_SLOT_ID)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener('resize', measure)

    let raf
    const tick = () => {
      const index = scrollState.index
      const frame = frameRef.current
      const backdrop = backdropRef.current
      const ring = ringRef.current

      // Misma transición que la cámara: 0 (sin recorte) → 1 (círculo) al bajar a About
      // y de vuelta a 0 al ir hacia Contacto.
      const { from, t } = sectionBlend(index, SECTION_COUNT)
      const closing = index >= 2 ? 1 : from === 1 ? t : 0
      const opening = ease((index - PORTRAIT_OUT[0]) / (PORTRAIT_OUT[1] - PORTRAIT_OUT[0]))
      const amount = closing * (1 - opening)

      let ringAmount = 0

      if (frame && portrait) {
        if (amount > 0.001) {
          const w = window.innerWidth
          const h = window.innerHeight
          // El círculo sigue al avatar: va del hueco de Trabajos al del retrato
          // (la cámara hace el mismo recorrido) y de ahí al centro de la pantalla.
          // En móvil el avatar de Trabajos se ha desplazado con el contenido (offset).
          const start = works ?? portrait
          const startY = start.centerY - (works ? scrollState.offset : 0)
          const [fromX, fromY, toX, toY] =
            index < 2
              ? [start.centerX, startY, portrait.centerX, portrait.centerY]
              : [portrait.centerX, portrait.centerY, w / 2, h / 2]
          const cx = lerp(fromX, toX, index < 2 ? t : ease(index - 2))
          const cy = lerp(fromY, toY, index < 2 ? t : ease(index - 2))
          // Con amount → 0 el radio crece hasta cubrir la pantalla entera.
          const cover = Math.hypot(w, h) * 1.3
          const small = portrait.width / 2
          const radius = small + (cover - small) * (1 - amount) ** 2
          frame.style.clipPath = `circle(${radius.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`

          // El aro vive en una capa fija (no scrollea con la página) y copia al círculo.
          ringAmount = ease((amount - 0.6) / 0.4)
          if (ring) {
            const size = radius * 2
            ring.style.width = `${size.toFixed(1)}px`
            ring.style.height = `${size.toFixed(1)}px`
            ring.style.transform = `translate3d(${(cx - radius).toFixed(1)}px, ${(cy - radius).toFixed(1)}px, 0)`
          }
        } else {
          frame.style.clipPath = 'none'
        }
        const contact = ease((index - 2.4) / 0.6)
        frame.style.opacity = (1 - (1 - CONTACT_CANVAS_OPACITY) * contact).toFixed(3)
      }

      // Fondo pastel y aro del retrato: solo cuando el círculo ya es pequeño.
      if (backdrop) backdrop.style.opacity = ringAmount.toFixed(3)
      if (ring) ring.style.opacity = ringAmount.toFixed(3)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <>
      {/* aria-hidden: el 3D es decorativo; todo el contenido está en el HTML. */}
      <div ref={frameRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        {/* Fondo del círculo del retrato (queda recortado igual que el canvas). */}
        <div
          ref={backdropRef}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, #ffd9bf 0%, #f2c4e0 55%, #bcd9ff 100%)',
          }}
        />
        {children}
      </div>
      {/* Aro del retrato: encima del canvas y debajo del contenido (z-10). */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[1] rounded-full opacity-0 shadow-[0_0_0_5px_rgb(255_255_255/0.75),0_18px_40px_-12px_rgb(0_0_0/0.25)]"
      />
    </>
  )
}
