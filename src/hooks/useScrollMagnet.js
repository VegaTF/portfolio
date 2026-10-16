import { useEffect } from 'react'
import { getSectionGeometry } from '../lib/sectionGeometry'

// Fuerza del imán. Se ajusta aquí:
// PUSH:   fracción del tramo de transición que hay que recorrer para que la página
//         termine de pasar a la sección siguiente. Más bajo = imán más fuerte.
//         0.2 es deliberadamente suave: un roce no mueve nada y un gesto claro sí.
// SETTLE: ms sin ninguna actividad de scroll (rueda, tacto, teclado, barra) tras los que
//         se considera que el usuario ha parado de verdad. Hasta entonces la página es
//         100 % suya: el imán no toca nada, ni siquiera "empuja" un poco.
const PUSH = 0.2
const SETTLE_MS = 1000
// Tiempo máximo que esperamos a que termine un desplazamiento del imán.
const MAX_SNAP_MS = 2500

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Imán de scroll con dirección. Principios (priorizan no ser intrusivo):
//  - Solo actúa en los TRAMOS DE TRANSICIÓN entre secciones (los mismos en los que la
//    escena cambia). Mientras se lee una sección alta (móvil) no hace nada.
//  - Deja moverse libremente: solo actúa cuando pasa SETTLE_MS (1 s) sin ninguna
//    actividad de scroll. Entonces completa la transición o vuelve al reposo según la
//    dirección del gesto. Con "reducir movimiento" no actúa nunca.
//  - Nunca compite con el usuario: no actúa con el dedo en pantalla o un botón del
//    ratón pulsado (arrastrando la barra), y cede el control al instante si el usuario
//    toca, usa la rueda o el teclado mientras la página se está colocando.
export function useScrollMagnet() {
  useEffect(() => {
    let timer = null
    let lastRest = window.scrollY // último punto donde se detuvo
    let touching = false // dedo en pantalla
    let pressed = false // botón del ratón pulsado (p. ej. arrastrando la barra)
    let snapping = false // el imán está desplazando la página ahora mismo
    let snapTarget = 0 // hacia dónde
    let snapStart = 0 // cuándo empezó (para no esperar eternamente)

    const settle = () => {
      if (touching || pressed) return
      // Con "reducir movimiento" no se recoloca nada: un salto instantáneo sería lo más
      // intrusivo de todo. La página se queda donde el usuario la dejó.
      if (prefersReducedMotion) return
      const y = window.scrollY
      const { tops, rests, max } = getSectionGeometry()

      // Tramos en los que el imán puede actuar: [reposo de una sección, inicio de la
      // siguiente], y el último, de Contacto al final de la página (footer).
      const spans = []
      for (let i = 0; i < tops.length - 1; i++) spans.push([rests[i], tops[i + 1]])
      spans.push([tops[tops.length - 1], max])

      const span = spans.find(([a, b]) => b > a && y >= a - 1 && y <= b + 1)

      let target = null
      if (span) {
        const [prev, next] = span
        const progress = (y - prev) / (next - prev)
        const direction = Math.sign(y - lastRest)
        if (direction > 0) target = progress > PUSH ? next : prev
        else if (direction < 0) target = progress < 1 - PUSH ? prev : next
        else target = progress < 0.5 ? prev : next
      }

      if (target !== null && Math.abs(target - y) > 2) {
        snapping = true
        snapTarget = target
        snapStart = performance.now()
        window.scrollTo({ top: target, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
      }
      lastRest = target ?? y
    }

    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        // Si el imán aún está en camino a su destino (fotogramas lentos, hilo ocupado),
        // no iniciamos otra colocación encima: la reiniciaría una y otra vez.
        if (snapping) {
          const arrived = Math.abs(window.scrollY - snapTarget) <= 2
          const timedOut = performance.now() - snapStart > MAX_SNAP_MS
          if (!arrived && !timedOut) {
            schedule()
            return
          }
          snapping = false
        }
        settle()
      }, SETTLE_MS)
    }

    // El usuario toma el control: se anula lo pendiente. Con tacto o ratón (antes de que
    // haya movimiento) además se frena el desplazamiento del imán en curso: misma
    // posición, sin animación. Con rueda o teclado NO: ese gesto ya interrumpe por sí
    // mismo el desplazamiento programático, y un scrollTo aquí se comería su movimiento.
    const takeControl = (stopAnimation = true) => {
      window.clearTimeout(timer)
      if (snapping) {
        snapping = false
        if (stopAnimation) window.scrollTo({ top: window.scrollY, behavior: 'instant' })
      }
    }

    // Tacto
    const onTouchStart = () => {
      touching = true
      takeControl()
    }
    const onTouchEnd = () => {
      touching = false
      schedule()
    }

    // Ratón: en la fase de captura para ver también los clics sobre la barra de scroll.
    const onMouseDown = () => {
      pressed = true
      takeControl()
    }
    const onMouseUp = () => {
      if (!pressed) return
      pressed = false
      // lastRest se conserva: la dirección del gesto es desde el último reposo hasta
      // donde el usuario suelta (así arrastrar la barra hacia abajo avanza de sección).
      schedule()
    }
    // Si se soltó fuera de la ventana no llega mouseup: lo detectamos al volver a moverse.
    const onMouseMove = (event) => {
      if (pressed && event.buttons === 0) onMouseUp()
    }
    // Rueda o teclado: el usuario vuelve a manejar el scroll de otra forma.
    const onOtherInput = () => {
      pressed = false
      takeControl(false)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('mousedown', onMouseDown, true)
    window.addEventListener('mouseup', onMouseUp, true)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('wheel', onOtherInput, { passive: true })
    window.addEventListener('keydown', onOtherInput)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('mousedown', onMouseDown, true)
      window.removeEventListener('mouseup', onMouseUp, true)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('wheel', onOtherInput)
      window.removeEventListener('keydown', onOtherInput)
    }
  }, [])
}
