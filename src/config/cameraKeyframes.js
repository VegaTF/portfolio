// Una cámara por sección, en el mismo orden que SECTIONS (config/sections.js).
//
// position / target: coordenadas de MUNDO.
// frame: cómo se encuadra el sujeto en un hueco del HTML (slotId). Si el hueco existe,
//        el zoom y el desplazamiento se calculan a partir de él:
//   axis   'width' | 'height': dimensión del hueco que debe ocupar `meters`.
//   meters cuántos metros de la escena deben caber en esa dimensión (× fill).
//   fill   fracción del hueco que se ocupa.
//   biasX  empujón horizontal en px (compensa la perspectiva).
// zoom / shift: valores de reserva si no hay hueco (p.ej. en móvil sin ese bloque).
import {
  ABOUT_PORTRAIT_SLOT_ID,
  HOME_RENDER_SLOT_ID,
  WORKS_AVATAR_SLOT_ID,
} from './sections'
import { STAND_POSITION } from './choreography'
import { ROOM_BASE_YAW, stageToWorld } from './stage'

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

// Avatar de pie (Trabajos/About) en coordenadas de mundo, a una altura dada.
const standing = (height) =>
  stageToWorld([STAND_POSITION[0], STAND_POSITION[1] + height, STAND_POSITION[2]], ROOM_BASE_YAW)

const worksTarget = standing(0.9) // centro del cuerpo
const aboutTarget = standing(1.5) // entre pecho y cabeza

export const CAMERA_KEYFRAMES = [
  {
    id: 'home',
    position: [5, 3.5, 6],
    target: [0, 1, 0],
    frame: { slotId: HOME_RENDER_SLOT_ID, axis: 'width', meters: 3.58, fill: 0.93, biasX: 30 },
    zoom: 1,
    shift: [0, 0],
  },
  {
    // Avatar de cuerpo entero en el hueco izquierdo (las cards, a la derecha).
    id: 'projects',
    position: add(worksTarget, [1.2, 0.45, 4.2]),
    target: worksTarget,
    frame: { slotId: WORKS_AVATAR_SLOT_ID, axis: 'height', meters: 2.0, fill: 0.92, biasX: 0 },
    zoom: 1,
    shift: [-0.3, 0],
  },
  {
    // Plano retrato: cabeza y hombros dentro del círculo.
    id: 'about',
    position: add(aboutTarget, [0.35, 0.1, 1.9]),
    target: aboutTarget,
    // meters: ancho de la escena que cabe en el círculo (hombros ≈ 0.55 m + margen).
    frame: { slotId: ABOUT_PORTRAIT_SLOT_ID, axis: 'width', meters: 0.78, fill: 1, biasX: 0 },
    zoom: 1,
    shift: [0, -0.2],
  },
  {
    // Habitación completa en vista isométrica, centrada, con el avatar de pie.
    id: 'contact',
    position: [5, 3.5, 6],
    target: [-0.65, 0.9, -0.55],
    frame: null,
    zoom: 1.7, // más grande que la card: la habitación asoma por los lados
    shift: [0, 0],
  },
]
