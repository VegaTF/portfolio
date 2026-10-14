import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { mouseState } from '../state/mouseState'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// El canvas es CANVAS_MARGIN veces más grande que el área que ocupan las formas,
// para que el giro con el ratón y la flotación no las recorten en el borde.
// La cámara se aleja en la misma proporción: las formas conservan su tamaño en pantalla.
const CANVAS_MARGIN = 1.7
const CAMERA_DISTANCE = 5 * CANVAS_MARGIN
// Tamaño global del conjunto (1 = original).
const CLUSTER_SCALE = 0.85

const rand = (min, max) => min + Math.random() * (max - min)
const sign = () => (Math.random() < 0.5 ? -1 : 1)

// Esfera, cilindro hexagonal y cubo, cada uno con un color de la paleta.
// Los valores aleatorios se generan al cargar el módulo (una vez por visita):
// ligera variación de posición, giro inicial, velocidad y fase de flotación.
const SHAPES = [
  { kind: 'sphere', color: '#9cc7ff', base: [-1.7, 0.75, 0], scale: 0.95 },
  { kind: 'hexagon', color: '#ffb38a', base: [-0.2, -0.55, -0.7], scale: 1.05 },
  { kind: 'cube', color: '#f2a6d8', base: [1.55, 0.85, 0.2], scale: 0.95 },
].map((shape) => ({
  ...shape,
  position: shape.base.map((v) => v + rand(-0.15, 0.15)),
  rotation: [rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI)],
  spin: [sign() * rand(0.12, 0.3), sign() * rand(0.15, 0.35)],
  phase: rand(0, Math.PI * 2),
}))

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
    mesh.position.y = shape.position[1] + Math.sin(time.current * 0.7 + shape.phase) * 0.07
  })

  return (
    <mesh ref={ref} position={shape.position} rotation={shape.rotation} scale={shape.scale}>
      <Geometry kind={shape.kind} />
      <meshStandardMaterial color={shape.color} roughness={0.55} metalness={0} />
    </mesh>
  )
}

// El conjunto se inclina un poco con el ratón, como la habitación.
function Cluster() {
  const group = useRef()

  useFrame((_, delta) => {
    if (!group.current || prefersReducedMotion) return
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, mouseState.x * 0.3, 4, delta)
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -mouseState.y * 0.18, 4, delta)
  })

  return (
    <group ref={group} scale={CLUSTER_SCALE}>
      {SHAPES.map((shape) => (
        <Shape key={shape.kind} shape={shape} />
      ))}
    </group>
  )
}

// Formas decorativas detrás del título del Home. Canvas propio: se posiciona con CSS,
// así que no depende de la cámara de la escena principal (centrada en la habitación).
export default function HeroShapes() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(true)

  // Con el Home fuera de pantalla no hace falta dibujar nada: se pausa el render.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="size-full">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, CAMERA_DISTANCE], fov: 35 }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[3, 4, 5]} intensity={2} color="#fff1e0" />
        <Cluster />
      </Canvas>
    </div>
  )
}
