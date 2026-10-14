import { useEffect, useState } from 'react'
import { scrollState } from '../state/scrollState'

// Id de la sección que ocupa el centro de la pantalla, como estado de React.
// scrollState es un objeto mutable (no dispara renders), así que lo vigilamos con
// requestAnimationFrame y solo llamamos a setState cuando CAMBIA de sección.
export function useActiveSection() {
  const [section, setSection] = useState(scrollState.section)

  useEffect(() => {
    let raf
    let last = scrollState.section
    const tick = () => {
      if (scrollState.section !== last) {
        last = scrollState.section
        setSection(last)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return section
}
