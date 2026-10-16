import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { CAMERA_KEYFRAMES } from '../config/cameraKeyframes'
import { FOLLOW_DAMPING, sectionBlend } from '../config/choreography'
import { measureSlot } from '../lib/measureSlot'
import { scrollState } from '../state/scrollState'

// Misma amortiguación que el avatar (ver choreography.js → FOLLOW_DAMPING).
const DAMPING = FOLLOW_DAMPING
const mix = MathUtils.lerp

// Distancia cámara-objetivo de cada keyframe (fija: se usa para calcular el zoom).
const DISTANCES = CAMERA_KEYFRAMES.map((k) =>
  Math.hypot(
    k.position[0] - k.target[0],
    k.position[1] - k.target[1],
    k.position[2] - k.target[2],
  ),
)

// Estado de cámara: { p: [x,y,z], t: [x,y,z], zoom, sx, sy }
function blend(a, b, t) {
  return {
    p: a.p.map((v, i) => mix(v, b.p[i], t)),
    t: a.t.map((v, i) => mix(v, b.t[i], t)),
    zoom: mix(a.zoom, b.zoom, t),
    sx: mix(a.sx, b.sx, t),
    sy: mix(a.sy, b.sy, t),
  }
}

// Interpola la cámara entre los keyframes vecinos según scrollState.index.
export default function CameraRig() {
  const current = useRef(null)
  const slots = useRef({}) // medidas de los huecos HTML

  useEffect(() => {
    const ids = CAMERA_KEYFRAMES.map((k) => k.frame?.slotId).filter(Boolean)
    const measure = () => {
      for (const id of ids) slots.current[id] = measureSlot(id)
    }

    measure()
    const observer = new ResizeObserver(measure)
    // Observamos el cuerpo: cualquier cambio de maquetación vuelve a medir.
    observer.observe(document.body)
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useFrame(({ camera, size }, delta) => {
    const last = CAMERA_KEYFRAMES.length - 1
    const { from, to, t } = sectionBlend(scrollState.index, CAMERA_KEYFRAMES.length)

    // Estado de un keyframe: si tiene hueco HTML, zoom y desplazamiento salen de él.
    const resolve = (i) => {
      const k = CAMERA_KEYFRAMES[i]
      const state = { p: [...k.position], t: [...k.target], zoom: k.zoom, sx: k.shift[0], sy: k.shift[1] }
      const slot = k.frame && slots.current[k.frame.slotId]
      if (slot && slot.width > 0) {
        const { axis, meters, fill, biasX } = k.frame
        // Píxeles por metro con zoom 1 a la distancia del objetivo, y los que queremos.
        const pxPerMeter =
          size.height / (2 * DISTANCES[i] * Math.tan(MathUtils.degToRad(camera.fov) / 2))
        const slotPx = axis === 'width' ? slot.width : slot.height
        state.zoom = (slotPx * fill) / meters / pxPerMeter
        state.sx = (slot.centerX + biasX - size.width / 2) / size.width
        state.sy = (slot.centerY - size.height / 2) / size.height
      } else if (!k.frame) {
        // Sin hueco (Contacto): el zoom de escritorio se reduce en pantallas estrechas.
        state.zoom = k.zoom * MathUtils.clamp(size.width / 1100, 0.55, 1)
      }
      return state
    }
    const goal = blend(resolve(Math.min(from, last)), resolve(Math.min(to, last)), t)

    // Primera vez: colocarse directamente (sin vuelo inicial).
    if (!current.current) current.current = goal
    const c = current.current

    // damp suaviza los saltos (scroll rápido, rueda con inercia...).
    const d = (a, b) => MathUtils.damp(a, b, DAMPING, delta)
    for (let i = 0; i < 3; i++) {
      c.p[i] = d(c.p[i], goal.p[i])
      c.t[i] = d(c.t[i], goal.t[i])
    }
    c.zoom = d(c.zoom, goal.zoom)
    c.sx = d(c.sx, goal.sx)
    c.sy = d(c.sy, goal.sy)

    // En secciones altas (móvil) el contenido de la sección se desplaza con el scroll
    // mientras la escena está en reposo: el 3D se mueve con su hueco, como parte de la
    // página, y no se queda fijo detrás de las cards. No se amortigua (va pegado al
    // dedo) y se funde a 0 durante la transición a la sección siguiente.
    const hold = scrollState.offset * (1 - t)

    camera.position.set(c.p[0], c.p[1], c.p[2])
    camera.lookAt(c.t[0], c.t[1], c.t[2])
    camera.zoom = c.zoom
    // Un offset negativo desplaza la imagen hacia la derecha / abajo.
    camera.setViewOffset(
      size.width,
      size.height,
      -c.sx * size.width,
      -c.sy * size.height + hold,
      size.width,
      size.height,
    )
  })

  return null
}
