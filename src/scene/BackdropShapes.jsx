import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { CAMERA_KEYFRAMES } from '../config/cameraKeyframes'
import { sampleStops } from '../config/choreography'
import { mouseState } from '../state/mouseState'
import { scrollState } from '../state/scrollState'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Cuándo se ven (index): aparecen (crecen) cuando el avatar aterriza en Trabajos y
// se encogen al irse hacia el retrato. Escalar en vez de usar opacidad evita
// transparencias.
const SCALE_STOPS = [
  [0.4, 0],
  [0.72, 1],
  [1.45, 1],
  [1.8, 0],
]

const rand = (min, max) => min + Math.random() * (max - min)
const sign = () => (Math.random() < 0.5 ? -1 : 1)

// Posición de cada forma en el ENCUADRE de la cámara de Trabajos, en metros:
// right = a la derecha de la pantalla, up = arriba, depth = hacia el fondo (detrás
// del avatar). Se convierte a mundo una sola vez con la base de esa cámara.
// El conjunto está equilibrado alrededor del avatar (la media de "right" es ~0) para que
// quede centrado respecto a él también en móvil, donde el avatar va en medio de la página.
const FRAMING = [
  { kind: 'sphere', color: '#9cc7ff', right: -0.6, up: 0.92, depth: 1.0, size: 0.58 },
  { kind: 'hexagon', color: '#ffb38a', right: 0.6, up: 0.4, depth: 0.8, size: 0.6 },
  { kind: 'cube', color: '#f2a6d8', right: 0.0, up: -0.92, depth: 1.2, size: 0.52 },
]

function buildShapes() {
  const keyframe = CAMERA_KEYFRAMES[1] // Trabajos
  const target = new Vector3(...keyframe.target)
  const camera = new Vector3(...keyframe.position)
  const forward = target.clone().sub(camera).normalize() // hacia el fondo
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize()
  const up = new Vector3().crossVectors(right, forward).normalize()

  return FRAMING.map((shape) => {
    const position = target
      .clone()
      .addScaledVector(right, shape.right + rand(-0.08, 0.08))
      .addScaledVector(up, shape.up + rand(-0.08, 0.08))
      .addScaledVector(forward, shape.depth)
    return {
      ...shape,
      position: position.toArray(),
      rotation: [rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI)],
      spin: [sign() * rand(0.12, 0.3), sign() * rand(0.15, 0.35)],
      phase: rand(0, Math.PI * 2),
    }
  })
}

// Aleatorios al cargar el módulo (una vez por visita), no durante el render.
const SHAPES = buildShapes()

function Geometry({ kind }) {
  if (kind === 'sphere') return <sphereGeometry args={[0.5, 48, 48]} />
  if (kind === 'hexagon') return <cylinderGeometry args={[0.5, 0.5, 0.85, 6]} />
  return <boxGeometry args={[0.85, 0.85, 0.85]} />
}

function Shape({ shape }) {
  const ref = useRef()
  const time = useRef(0)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh || prefersReducedMotion) return
    time.current += delta
    mesh.rotation.x += shape.spin[0] * delta
    mesh.rotation.y += shape.spin[1] * delta
    // Flotación muy suave arriba y abajo.
    mesh.position.y = shape.position[1] + Math.sin(time.current * 0.7 + shape.phase) * 0.06
  })

  return (
    <mesh ref={ref} position={shape.position} rotation={shape.rotation} scale={shape.size}>
      <Geometry kind={shape.kind} />
      <meshStandardMaterial color={shape.color} roughness={0.55} metalness={0} />
    </mesh>
  )
}

// Esfera, cilindro hexagonal y cubo detrás del avatar en Trabajos. Viven en la escena
// principal (no en el HTML) para quedar DETRÁS del avatar, no delante.
export default function BackdropShapes() {
  const group = useRef()
  const center = useMemo(() => new Vector3(...CAMERA_KEYFRAMES[1].target), [])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const scale = sampleStops(SCALE_STOPS, scrollState.index)
    g.visible = scale > 0.01
    g.scale.setScalar(Math.max(scale, 0.0001))

    // Inclinación suave con el ratón, como la habitación.
    if (!prefersReducedMotion) {
      g.rotation.y = MathUtils.damp(g.rotation.y, mouseState.x * 0.25, 4, delta)
      g.rotation.x = MathUtils.damp(g.rotation.x, -mouseState.y * 0.15, 4, delta)
    }
  })

  // El grupo se coloca en el centro del encuadre: así la escala y el giro son sobre él.
  return (
    <group ref={group} position={center} visible={false}>
      <group position={[-center.x, -center.y, -center.z]}>
        {SHAPES.map((shape) => (
          <Shape key={shape.kind} shape={shape} />
        ))}
      </group>
    </group>
  )
}
