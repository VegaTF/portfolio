import { useEffect, useState } from 'react'

// Devuelve true cuando el navegador ya ha pintado la página y está inactivo (o, como
// máximo, pasado `timeout` ms). Sirve para empezar el trabajo pesado (descargar y
// arrancar el 3D) sin retrasar el primer pintado del texto.
export function useAfterFirstPaint(timeout = 1200) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const start = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout })
      return () => window.cancelIdleCallback(id)
    }
    // Safari no tiene requestIdleCallback.
    const id = window.setTimeout(start, 250)
    return () => window.clearTimeout(id)
  }, [timeout])

  return ready
}
