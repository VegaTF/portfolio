// LazyMotion + `m`: versión ligera de framer-motion (solo las animaciones de DOM que
// usamos), en lugar de importar el componente `motion` completo.
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { WORKS_AVATAR_SLOT_ID } from '../config/sections'
import { PROJECTS } from '../data/projects'
import ProjectCard from '../components/ui/ProjectCard'

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Works() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative flex min-h-svh items-center px-6 pt-20 pb-16 md:px-10 md:py-16"
    >
      {/* Bloque centrado: hueco para el avatar (izquierda) + título y cards (derecha). */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Hueco reservado: el avatar de pie se encuadra aquí (ver scene/CameraRig.jsx). */}
        <div id={WORKS_AVATAR_SLOT_ID} className="min-h-[45vh] md:min-h-[70vh]" />

        <div>
          {/* El título se centra respecto a las cards, no respecto a la página. */}
          <h2 id="projects-title" className="text-center text-5xl font-semibold">
            Projects
          </h2>

          {/* TAREA PENDIENTE (ver agents.md → "Trabajos: filtros y slider"):
              - filtro por tecnología y filtro por fechas, encima de las cards;
              - slider que muestre las cards de 3 en 3, con flechas para navegar.
              Hoy se muestran todas en una cuadrícula de 3 columnas. */}
          <LazyMotion features={domAnimation} strict>
            <m.ul
              className="mt-8 grid gap-4 sm:grid-cols-3"
              variants={list}
              initial="hidden"
              whileInView="show"
              // "some": en cuanto asoma un píxel. Con un porcentaje, en móvil (lista muy
              // larga) las cards no aparecerían hasta haber recorrido casi media pantalla.
              viewport={{ once: true, amount: 'some' }}
            >
              {PROJECTS.map((project) => (
                <m.li key={project.id} variants={item}>
                  <ProjectCard {...project} />
                </m.li>
              ))}
            </m.ul>
          </LazyMotion>
        </div>
      </div>
    </section>
  )
}
