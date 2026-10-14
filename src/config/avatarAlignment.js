// Colocación del avatar dentro de la habitación y offsets por animación.
// Coordenadas en el espacio de room.glb (metros). Se calibran a ojo en el navegador.

// Sofá (divan): x 0.10..0.96, z -2.17..-0.32. Mira hacia la pared de la TV (-x).
export const AVATAR_BASE = {
  position: [0.45, 0, -1.25],
  // Giro del cuerpo en Y (rad). 0 = mira a +z; -PI/2 = mira a -x (hacia la TV).
  // Lo giramos un poco hacia la cámara para que se le vea la cara.
  rotationY: -1,
}

// Corrección por clip: cada animación de Mixamo deja el cuerpo en un punto
// ligeramente distinto. Se suma a la posición que marca la coreografía.
export const avatarAlignment = {
  sitting: { position: [-0.14, 0.07, 0], rotationY: 0 },
  falling: { position: [0, 0, 0], rotationY: 0 },
  breathing: { position: [0, 0, 0], rotationY: 0 },
}

// Seguimiento de la cámara y del ratón con la cabeza (rad).
export const HEAD_LOOK = {
  maxYaw: 0.5, // cuánto se desvía de la cámara con el ratón en el borde
  maxPitch: 0.35,
  limitYaw: 1.15, // máximo total que gira (cuello + cabeza)
  limitPitch: 0.6,
  neckShare: 0.4, // parte del giro que hace el cuello; el resto, la cabeza
  damping: 5,
}
