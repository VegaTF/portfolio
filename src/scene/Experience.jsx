import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, useProgress } from '@react-three/drei'
import Room from './Room'
import Avatar from './Avatar'
import BackdropShapes from './BackdropShapes'
import CameraRig from './CameraRig'
import Loader from './Loader'
import SceneFrame from './SceneFrame'
import { useMousePosition } from '../hooks/useMousePosition'
import { isCoarsePointer } from '../lib/webgl'

// Calidad según el dispositivo. En pantallas táctiles (móviles/tablets) se baja el
// tamaño del mapa de sombras, el antialiasing y el límite de resolución.
const COARSE = isCoarsePointer()
const SHADOW_MAP_SIZE = COARSE ? 1024 : 2048
const DPR_MAX = Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 1.75)

// Aparece con un fundido cuando los modelos ya están cargados, en lugar de "saltar".
// (Opacidad en un contenedor: no crea un contexto de posicionamiento para los fixed.)
function Reveal({ children }) {
  const { active, progress } = useProgress()
  const ready = !active && progress === 100
  return (
    <div className={`transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  )
}

export default function Experience() {
  useMousePosition()
  // Resolución adaptativa: si los fotogramas caen por debajo de lo aceptable, baja a 1.
  const [dpr, setDpr] = useState(DPR_MAX)

  return (
    <>
      <Loader />
      {/* El Canvas va fijo en z-0 y el HTML por encima (z-10), sin capturar clics.
          OJO: un z-index negativo quedaría tapado por el fondo del body. */}
      <Reveal>
      <SceneFrame>
        {/* La posición inicial real la fija CameraRig en cada frame. */}
        <Canvas
          dpr={dpr}
          shadows="percentage"
          camera={{ position: [5, 3.5, 6], fov: 40 }}
          gl={{ antialias: !COARSE, powerPreference: 'high-performance' }}
        >
          {/* Mide los fps: onDecline baja la resolución y, si vuelve a ir bien, la sube. */}
          <PerformanceMonitor
            flipflops={3}
            onIncline={() => setDpr(DPR_MAX)}
            onDecline={() => setDpr(1)}
            onFallback={() => setDpr(1)}
          />
          {/* Luz cálida y envolvente: cielo crema, rebote melocotón del suelo. */}
          <hemisphereLight args={['#fff1e0', '#e8b99a', 1.0]} />
          <ambientLight intensity={0.5} color="#fff4e6" />
          {/* Única luz que proyecta sombras. El volumen (camera) solo cubre la habitación. */}
          <directionalLight
            castShadow
            position={[4, 6, 5]}
            color="#ffe2c2"
            intensity={1.8}
            shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-bias={-0.0004}
            shadow-normalBias={0.03}
          />
          {/* Luz puntual naranja, como una lámpara: da calidez al interior. */}
          <pointLight position={[-1, 1.5, -0.5]} color="#ffb766" intensity={3} distance={4} decay={2} />
          <CameraRig />
          <BackdropShapes />
          <Suspense fallback={null}>
            <Room>
              <Avatar />
            </Room>
          </Suspense>
        </Canvas>
      </SceneFrame>
      </Reveal>
    </>
  )
}
