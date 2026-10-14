import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { MathUtils } from 'three'
import { HIDDEN_NODES, roomPalette } from '../config/roomPalette'
import {
  ROOM_OPACITY_STOPS,
  STAGE_YAW_KEYS,
  sampleStops,
  sectionBlend,
} from '../config/choreography'
import { ROOM_CENTER } from '../config/stage'
import { applyOpacity, makeFadeable } from '../lib/fade'
import { mouseState } from '../state/mouseState'
import { scrollState } from '../state/scrollState'

const ROOM_URL = '/models/room.glb'

const MAX_TILT_Y = 0.12 // rad
const MAX_TILT_X = 0.05 // rad
const DAMPING = 4

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Nombre del nodo "de primer nivel" al que pertenece un objeto
// (divan, kamod...). Un nodo con varios materiales llega como Group con
// varios Mesh hijos, así que subimos hasta el hijo directo de la escena.
function getTopNodeName(object, root) {
  let current = object
  while (current.parent && current.parent !== root) current = current.parent
  return current.name
}

// Habitación + escenario. Los hijos (el avatar) comparten sus coordenadas y giran con ella.
export default function Room({ children, ...props }) {
  // useGLTF suspende el componente hasta que el modelo está cargado.
  // `scene` es el grafo de objetos 3D del archivo (nodos: divan, stol, steni...).
  const { scene } = useGLTF(ROOM_URL)

  // Materiales de la habitación (para desvanecerla con el scroll).
  const materials = useMemo(() => {
    const found = new Set()
    scene.traverse((child) => {
      if (!child.isMesh) return
      // Cada pieza proyecta y recibe sombras (suelo y paredes incluidos).
      child.castShadow = true
      child.receiveShadow = true
      const node = getTopNodeName(child, scene)

      if (HIDDEN_NODES.includes(node)) {
        child.visible = false
        return
      }

      const color = roomPalette[node]?.[child.material.name]
      if (color) {
        // Los materiales se comparten entre nodos: clonamos para no teñir otras piezas.
        // Idempotente: en desarrollo StrictMode ejecuta este bloque dos veces y, si
        // clonáramos de nuevo, la lista devuelta apuntaría a clones ya descartados.
        if (!child.material.userData.roomClone) {
          child.material = child.material.clone()
          child.material.userData.roomClone = true
        }
        child.material.color.set(color)
        child.material.metalness = 0
        child.material.roughness = 0.85
      }
      found.add(child.material)
    })
    const list = [...found]
    makeFadeable(list)
    return list
  }, [scene])

  const groupRef = useRef() // escenario completo (gira con el ratón)
  const roomRef = useRef() // solo la habitación (se oculta al desvanecerse)
  const materialsRef = useRef([])
  const lastOpacity = useRef(-1)

  // Los materiales se guardan en una ref: useFrame los muta cada frame.
  useEffect(() => {
    materialsRef.current = materials
  }, [materials])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    const index = scrollState.index

    // Giro del escenario según la sección + inclinación suave con el ratón.
    const { from, to, t } = sectionBlend(index, STAGE_YAW_KEYS.length)
    const baseYaw = MathUtils.lerp(STAGE_YAW_KEYS[from], STAGE_YAW_KEYS[to], t)
    const tiltY = prefersReducedMotion ? 0 : mouseState.x * MAX_TILT_Y
    const tiltX = prefersReducedMotion ? 0 : -mouseState.y * MAX_TILT_X
    group.rotation.y = MathUtils.damp(group.rotation.y, baseYaw + tiltY, DAMPING, delta)
    group.rotation.x = MathUtils.damp(group.rotation.x, tiltX, DAMPING, delta)

    // Desvanecimiento: la habitación se queda arriba mientras el avatar cae.
    const opacity = sampleStops(ROOM_OPACITY_STOPS, index)
    if (Math.abs(opacity - lastOpacity.current) < 0.002) return
    lastOpacity.current = opacity

    // Oculta del todo cuando es invisible: así tampoco proyecta sombras.
    if (roomRef.current) roomRef.current.visible = opacity > 0.01
    applyOpacity(materialsRef.current, opacity)
  })

  // El grupo se coloca en el centro de la habitación y la escena se desplaza
  // en negativo: así el giro es sobre el centro y no sobre el origen del modelo.
  return (
    <group ref={groupRef} position={ROOM_CENTER} {...props}>
      <group position={[-ROOM_CENTER[0], 0, -ROOM_CENTER[2]]}>
        <group ref={roomRef}>
          {/* <primitive> inserta un objeto de three ya creado dentro de la escena de R3F. */}
          <primitive object={scene} />
        </group>
        {children}
      </group>
    </group>
  )
}

// Empieza la descarga en cuanto se importa el módulo, antes de montar el Canvas.
useGLTF.preload(ROOM_URL)
