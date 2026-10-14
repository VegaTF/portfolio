let cached

// ¿Puede este navegador crear un contexto WebGL? Si no (navegador antiguo, GPU en lista
// negra, ahorro de energía), la página funciona igual pero sin el 3D.
export function isWebGLAvailable() {
  if (cached !== undefined) return cached
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    cached = Boolean(gl)
    // Libera el contexto de prueba para no gastar uno de los pocos disponibles.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}

// Pantalla táctil / dispositivo de gama media-baja: se usa para bajar la calidad.
export function isCoarsePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}
