import { useEffect, useRef } from 'react'
import { scrollState } from '../../state/scrollState'

// Solo para depurar (Paso 5). Escribe en el DOM directamente en cada frame:
// así se ve el estado en vivo sin provocar re-renders de React.
export default function ScrollDebug() {
  const ref = useRef(null)

  useEffect(() => {
    let raf
    const tick = () => {
      if (ref.current) {
        const { progress, index, section } = scrollState
        ref.current.textContent =
          `progress ${progress.toFixed(3)} · index ${index.toFixed(2)} · ${section}`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      data-testid="scroll-debug"
      className="pointer-events-none fixed right-4 bottom-4 z-50 rounded-lg bg-black/70 px-3 py-2 font-mono text-xs text-white"
    />
  )
}
