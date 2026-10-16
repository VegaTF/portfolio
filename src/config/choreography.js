// Coreografía por scroll: qué hacen el avatar, la habitación y la animación en
// cada sección. Todo se expresa respecto a scrollState.index
// (0 = Home, 1 = Trabajos, 2 = About, 3 = Contacto; valores intermedios = transición).
import { AVATAR_BASE } from './avatarAlignment'
import { ROOM_BASE_YAW } from './stage'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// smoothstep: arranca y termina suave.
export const ease = (t) => {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

// ── Ventanas de transición ────────────────────────────────────────────────────
// Cada tramo entre dos secciones (0→1, 1→2, 2→3) se recorre con `frac` de 0 a 1.
// La transición solo ocurre dentro de [inicio, fin]: antes de `inicio` se mantiene el
// encuadre de la sección de origen y desde `fin` el de destino. Así cada sección tiene
// una "meseta" de scroll en la que se ve estable (el imán de scroll cae en su centro).
// Si fin <= inicio la transición es un salto (se usa para cambios que ocurren sin verse).
export const CAMERA_WINDOWS = [
  [0.15, 0.75], // Home → Trabajos
  [0.12, 0.72], // Trabajos → About
  [0.2, 0.75], // About → Contacto (empieza cuando el retrato ya se ha cerrado)
]

// Home → Trabajos: el avatar usa la MISMA ventana que la cámara. Así la cámara le sigue
// mientras cae y el avatar se queda a la vista, cruzando la pantalla de derecha a izquierda
// por el centro. (Si llegara antes que la cámara, caería fuera de cuadro por abajo y
// reaparecería de golpe a la izquierda.)
// El tramo About → Contacto no usa ventana: lo gobierna CONTACT_FALL (ver abajo).
export const AVATAR_WINDOWS = [
  CAMERA_WINDOWS[0], // cae junto con la cámara
  [0.12, 0.72], // gira hacia el retrato
]

// Amortiguación (lambda de MathUtils.damp) con la que la cámara y el avatar siguen al
// scroll. Debe ser la MISMA en los dos: si no, con un scroll rápido uno se adelanta al otro
// (el avatar cae fuera de cuadro y reaparece de golpe).
export const FOLLOW_DAMPING = 5

// Qué dos secciones rodean a `index` y cuánto avanzamos entre ellas (ya suavizado).
export function sectionBlend(index, count, windows = CAMERA_WINDOWS) {
  const last = count - 1
  const i = clamp(index, 0, last)
  const from = Math.min(Math.floor(i), last - 1)
  const to = from + 1
  const frac = i - from
  const [start, end] = windows[from]
  const t = end > start ? ease((frac - start) / (end - start)) : frac >= start ? 1 : 0
  return { from, to, t }
}

// Interpola una lista de [x, valor] con smoothstep entre paradas.
export function sampleStops(stops, x) {
  if (x <= stops[0][0]) return stops[0][1]
  for (let i = 1; i < stops.length; i++) {
    const [x1, v1] = stops[i]
    if (x <= x1) {
      const [x0, v0] = stops[i - 1]
      return v0 + (v1 - v0) * ease((x - x0) / (x1 - x0))
    }
  }
  return stops[stops.length - 1][1]
}

// ── Avatar ───────────────────────────────────────────────────────────────────
// Dónde queda el avatar de pie en Trabajos/About: justo debajo del sofá, muy por
// debajo de la habitación (el avatar "cae" fuera de ella y la cámara le sigue).
export const STAND_DROP = 7
export const STAND_POSITION = [0.3, -STAND_DROP, -1.0]

// Altura de la superficie del suelo de la habitación (la losa de room.glb llega a
// y ≈ 0.09) más ~0.01 que el calzado queda por debajo del origen del avatar.
export const ROOM_FLOOR_Y = 0.1

// Posición (en coordenadas del escenario) y giro Y del avatar en cada sección.
export const AVATAR_KEYS = [
  { position: AVATAR_BASE.position, yaw: AVATAR_BASE.rotationY }, // sentado en el sofá
  { position: STAND_POSITION, yaw: -0.05 }, // de pie, mirando a las cards
  { position: STAND_POSITION, yaw: -0.35 }, // retrato
  { position: [-0.75, ROOM_FLOOR_Y, 0.3], yaw: 0.75 }, // de pie en la habitación, de frente
]

// Del retrato a Contacto (sin transparencias en el avatar: se vería su cara interior):
//  1. El círculo del retrato se cierra sobre el avatar (PORTRAIT_CLOSE): nunca se le ve
//     fuera de él, ni "cayendo" sin marco.
//  2. Con el círculo cerrado (AVATAR_HIDDEN) se oculta y se recoloca arriba; la cámara
//     empieza a subir hacia la habitación en ese momento (CAMERA_WINDOWS[2]).
//  3. El marco se reabre a pantalla completa (PORTRAIT_OPEN) y el avatar entra cayendo
//     desde CONTACT_ENTRY_HEIGHT metros sobre el suelo y aterriza en la habitación
//     (CONTACT_FALL = [index al empezar, index al aterrizar]).
export const CONTACT_ENTRY_HEIGHT = 5
export const AVATAR_HIDDEN = [2.2, 2.5]
export const CONTACT_FALL = [2.5, 2.85]

// Animaciones: sentado hasta SIT_UNTIL, cayendo hasta LAND_AT, y de pie después.
// En Contacto vuelve a caer entre CONTACT_FALL[0] y CONTACT_FALL[1].
export const SIT_UNTIL = 0.15
// Justo antes de que acabe la ventana de la caída (0.75): ya está llegando al suelo.
export const LAND_AT = 0.72

// Segundos de mezcla al pasar de una animación a otra ("desde>hasta").
export const CLIP_FADES = {
  'sitting>falling': 0.15,
  'falling>breathing': 0.25,
  'breathing>falling': 0.15,
  'falling>sitting': 0.25,
}
export const DEFAULT_CLIP_FADE = 0.2

// ── Habitación ───────────────────────────────────────────────────────────────
// Giro del escenario por sección. En Contacto la habitación pasa a vista isométrica.
export const STAGE_YAW_KEYS = [ROOM_BASE_YAW, ROOM_BASE_YAW, ROOM_BASE_YAW, 0]

// Opacidad de la habitación: casi desaparece antes de que el avatar cruce el suelo,
// y reaparece en Contacto.
export const ROOM_OPACITY_STOPS = [
  [0, 1],
  [0.12, 0.45],
  [0.28, 0],
  [2.35, 0],
  [2.7, 1],
]

// ── Marco del canvas ─────────────────────────────────────────────────────────
// Al ir de About a Contacto, el círculo del retrato primero se CIERRA sobre el avatar
// (radio → 0) y después el marco se reabre a pantalla completa para la habitación.
export const PORTRAIT_CLOSE = [2.0, 2.2]
export const PORTRAIT_OPEN = [2.25, 2.45]
// Opacidad del canvas en Contacto (para que destaque el formulario).
export const CONTACT_CANVAS_OPACITY = 0.6
