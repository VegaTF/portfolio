import { lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import Home from './sections/Home'
import Works from './sections/Works'
import About from './sections/About'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import Navbar from './components/layout/Navbar'
import PageLoader from './components/PageLoader'
import SceneErrorBoundary from './components/SceneErrorBoundary'
import ScrollDebug from './components/ui/ScrollDebug'
import { useAfterFirstPaint } from './hooks/useAfterFirstPaint'
import { useScrollMagnet } from './hooks/useScrollMagnet'
import { useScrollProgress } from './hooks/useScrollProgress'
import { useSectionSpacing } from './hooks/useSectionSpacing'
import { isWebGLAvailable } from './lib/webgl'

// La escena 3D (three.js, R3F, drei, modelos) va en su propio paquete y se descarga en
// paralelo: el HTML, el texto y la navegación aparecen sin esperar a todo eso.
const Experience = lazy(() => import('./scene/Experience'))

const HAS_WEBGL = isWebGLAvailable()

export function App() {
  useSectionSpacing()
  useScrollProgress()
  useScrollMagnet()
  // El 3D arranca cuando el texto ya está pintado y el navegador está inactivo.
  const startScene = useAfterFirstPaint()

  return (
    // reducedMotion="user": framer-motion respeta prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-(--color-ink) focus:px-4 focus:py-2 focus:text-(--color-paper)"
      >
        Skip to main content
      </a>

      {/* Fondo: dos orbes de color que se mezclan + malla. Va antes del canvas (misma
          capa, z-0), así que el 3D queda por encima. */}
      <div className="backdrop" aria-hidden="true">
        <span className="blob-wrap blob-wrap-a">
          <span className="blob blob-a" />
        </span>
        <span className="blob-wrap blob-wrap-b">
          <span className="blob blob-b" />
        </span>
      </div>

      {HAS_WEBGL && startScene && (
        <SceneErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Experience />
          </Suspense>
        </SceneErrorBoundary>
      )}

      <Navbar />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Home />
        <Works />
        <About />
        <Contact />
      </main>
      <Footer />
      {import.meta.env.DEV && <ScrollDebug />}
    </MotionConfig>
  )
}

export default App
