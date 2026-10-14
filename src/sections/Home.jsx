import { HOME_RENDER_SLOT_ID } from '../config/sections'
import { lazy, Suspense } from 'react'
import Parallax from '../components/Parallax'
import SceneErrorBoundary from '../components/SceneErrorBoundary'
import { useAfterFirstPaint } from '../hooks/useAfterFirstPaint'
import { isWebGLAvailable } from '../lib/webgl'

// Las formas del título usan three.js: se cargan aparte para no retrasar el texto.
const HeroShapes = lazy(() => import('../components/HeroShapes'))

const TECHNOLOGIES = ['React', 'Three.js', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'PHP', 'MySQL']

export default function Home() {
  const startShapes = useAfterFirstPaint()

  return (
    // pt-14: en tablet/móvil la barra superior mide ~56 px; así el centrado vertical
    // del hero tiene en cuenta ese espacio y no queda pegado arriba.
    <section
      id="home"
      className="relative flex min-h-svh items-center overflow-x-clip px-6 pt-14 md:px-10 min-[1200px]:pt-0"
    >
      {/* Texto + render forman un único bloque centrado en la página. */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-16 md:flex-row md:gap-8">
        <div className="relative w-full text-center md:w-auto md:shrink-0 md:text-left">
          {/* Formas 3D decorativas, detrás del título (esquina superior izquierda).
              La caja es 1.7× el área visible de las formas (ver HeroShapes.jsx) para
              que no se recorten; el texto va por encima (z-10). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[110px] -left-[130px] z-0 h-[381px] w-[544px] md:-top-[202px] md:-left-[214px] md:h-[435px] md:w-[653px]"
          >
            {isWebGLAvailable() && startShapes && (
              <SceneErrorBoundary>
                <Suspense fallback={null}>
                  <HeroShapes />
                </Suspense>
              </SceneErrorBoundary>
            )}
          </div>

          <Parallax strength={10} className="relative z-10">
            <h1 className="text-5xl font-semibold sm:text-6xl">Jorge Vega</h1>
            {/* Móvil: "Web Developer" y el eslogan en líneas centradas, sin barra.
                Desde md: en la misma línea separados por "|". */}
            <p className="mt-2 flex flex-col items-center gap-0.5 md:mt-1 md:flex-row md:flex-wrap md:gap-x-3">
              <span className="text-xl">Web Developer</span>
              <span aria-hidden="true" className="hidden text-xl md:inline">|</span>
              <span className="text-sm">Where Architecture and Design Meets</span>
            </p>
            <ul
              aria-label="Main technologies"
              className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2 md:mx-0 md:mt-6 md:justify-start"
            >
              {TECHNOLOGIES.map((tech) => (
                <li
                  key={tech}
                  className="inline-flex h-8 items-center rounded-full border border-(--color-ink)/20 bg-(--color-paper)/70 px-3 text-sm leading-none"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Parallax>
        </div>

        {/* Hueco reservado: la escena 3D se centra aquí (ver scene/CameraRig.jsx).
            En móvil tiene proporción fija (el render no necesita más alto), así el
            bloque entero es compacto y queda centrado en la pantalla. */}
        <div
          id={HOME_RENDER_SLOT_ID}
          className="aspect-[4/3] w-full max-w-md md:aspect-auto md:min-h-[55vh] md:min-w-0 md:max-w-none md:flex-1"
        />
      </div>
    </section>
  )
}
