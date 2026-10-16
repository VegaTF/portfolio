import { useEffect, useRef } from 'react'
import { ABOUT_PORTRAIT_SLOT_ID, WORKS_AVATAR_SLOT_ID } from '../config/sections'
import {
  CONTACT_CANVAS_OPACITY,
  PORTRAIT_CLOSE,
  PORTRAIT_OPEN,
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

      let ringAmount = 0

      if (frame && portrait) {
        const w = window.innerWidth
        const h = window.innerHeight
        const cover = Math.hypot(w, h) * 1.3 // radio que cubre la pantalla entera
        const small = portrait.width / 2 // radio del retrato
        // `radius === null` = sin recorte (pantalla completa).
        let radius = null
        let cx = 0
        let cy = 0

        if (index < 2) {
          // Home → Trabajos → About: el círculo sigue al avatar, del hueco de Trabajos
          // al del retrato (la cámara hace el mismo recorrido). Misma curva que la cámara:
          // 0 (sin recorte) → 1 (círculo). En móvil el avatar de Trabajos se ha
          // desplazado con el contenido (offset).
          const { from, t } = sectionBlend(index, SECTION_COUNT)
          const amount = from === 1 ? t : 0
          if (amount > 0.001) {
            const start = works ?? portrait
            const startY = start.centerY - (works ? scrollState.offset : 0)
            cx = lerp(start.centerX, portrait.centerX, t)
            cy = lerp(startY, portrait.centerY, t)
            radius = small + (cover - small) * (1 - amount) ** 2
            ringAmount = ease((amount - 0.6) / 0.4)
          }
        } else {
          // About → Contacto: el círculo se CIERRA sobre el avatar (que sigue dentro) y,
          // ya vacío, el marco se reabre a pantalla completa desde el centro para la
          // habitación. Así el avatar nunca se ve fuera del círculo.
          const shrink = ease((index - PORTRAIT_CLOSE[0]) / (PORTRAIT_CLOSE[1] - PORTRAIT_CLOSE[0]))
          const reveal = ease((index - PORTRAIT_OPEN[0]) / (PORTRAIT_OPEN[1] - PORTRAIT_OPEN[0]))
          if (reveal > 0) {
            cx = w / 2
            cy = h / 2
            radius = reveal >= 1 ? null : cover * reveal
          } else {
            cx = portrait.centerX
            cy = portrait.centerY
            radius = small * (1 - shrink)
            ringAmount = 1 - shrink
          }
        }

        if (radius === null) {
          frame.style.clipPath = 'none'
        } else {
          frame.style.clipPath = `circle(${radius.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`
          // El aro vive en una capa fija (no scrollea con la página) y copia al círculo.
          if (ring) {
            const size = radius * 2
            ring.style.width = `${size.toFixed(1)}px`
            ring.style.height = `${size.toFixed(1)}px`
            ring.style.transform = `translate3d(${(cx - radius).toFixed(1)}px, ${(cy - radius).toFixed(1)}px, 0)`
          }
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
