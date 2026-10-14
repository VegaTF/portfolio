import { useProgress } from '@react-three/drei'

// Indicador de progreso de los modelos (useProgress lee un store global de drei).
// Discreto y sin bloquear: la página ya se puede leer y navegar mientras carga.
// Al terminar desaparece; la escena aparece con un fundido (ver Experience.jsx).
export default function Loader() {
  const { progress, active } = useProgress()

  if (!active && progress === 100) return null

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-(--page-fg) px-4 py-1.5 text-sm text-(--page-bg) shadow-lg"
    >
      Loading 3D scene… {Math.round(progress)}%
    </div>
  )
}
