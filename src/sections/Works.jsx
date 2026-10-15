import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
// LazyMotion + `m`: versión ligera de framer-motion (solo las animaciones de DOM que
// usamos), en lugar de importar el componente `motion` completo.
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import { WORKS_AVATAR_SLOT_ID } from '../config/sections'
import { PROJECTS } from '../data/projects'
import { filterProjects, uniqueTags, uniqueYears } from '../lib/filterProjects'
import { pageCount, pageItems } from '../lib/paginate'
import ProjectCard from '../components/ui/ProjectCard'
import ProjectDialog from '../components/ui/ProjectDialog'

// Media query reactiva. El diseño depende del ancho Y del alto de la pantalla (un móvil
// en horizontal es ancho pero muy bajo), así que se decide aquí, en JS, y no solo con
// breakpoints de anchura.
function useMedia(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

const SWIPE_MIN_PX = 50
const CARD_GAP = '0.75rem' // gap-3 de las cards compactas

// Se calculan una vez: los datos no cambian en ejecución.
const ALL_TAGS = uniqueTags(PROJECTS)
const ALL_YEARS = uniqueYears(PROJECTS)

const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' }

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
// `custom` es la dirección (1 siguiente, -1 anterior): las cards entran desde ese lado.
const item = {
  hidden: (dir) => ({ opacity: 0, x: dir * 24, y: 12 }),
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

function Chevron({ direction, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// `hidden`: se oculta con `invisible` (no con un `if`) para que siga ocupando su sitio.
function ArrowButton({ direction, hidden, disabled, onClick, className = '' }) {
  const isPrev = direction === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? 'Previous projects' : 'Next projects'}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-(--color-ink)/20 bg-(--color-paper)/85 backdrop-blur-sm transition hover:bg-(--color-ink) hover:text-(--color-paper) focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-10 ${
        hidden ? 'invisible' : ''
      } ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={isPrev ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// Fondo translúcido con desenfoque para el texto que cae sobre el avatar (móvil).
const PILL =
  'rounded-full bg-(--color-paper)/80 backdrop-blur-md shadow-[0_1px_8px_rgb(0_0_0/0.06)]'

export default function Works() {
  // Forma de la pantalla.
  const stack = useMedia('(max-width: 639px)') // móvil: cards apiladas, avatar detrás
  const short = useMedia('(max-height: 600px)') // móvil en horizontal / tablet baja
  const compact = useMedia('(max-width: 639px), (max-height: 640px)') // cards compactas
  const tiny = useMedia('(max-height: 600px)') // cards sin descripción
  const wide = useMedia('(min-width: 1180px)') // sitio para 3 cards en fila

  // Cards por "página": 3 en móvil (apiladas; 1 si además es muy baja), 2 en tablet y
  // pantallas medianas (con tres, la columna es demasiado estrecha) y 3 en escritorio.
  const perPage = stack ? (short ? 1 : 3) : wide ? 3 : 2
  const columns = stack ? 1 : perPage
  const rows = stack ? perPage : 1
  const rowHeight = tiny ? '5.25rem' : '6.5rem'
  const blockHeight = compact
    ? `calc(${rowHeight} * ${rows} + ${CARD_GAP} * ${rows - 1})`
    : '18.5rem'

  // Filtros y página. Cambiar un filtro vuelve a la página 1 (en el propio handler, sin
  // efectos). Si al redimensionar quedan menos páginas, `page` se recorta más abajo.
  const [filters, setFilters] = useState({ tags: [], year: '' })
  const [nav, setNav] = useState({ page: 0, dir: 1 })
  // Proyecto abierto en la ventana de detalles, con el rectángulo de su card.
  const [selected, setSelected] = useState(null)
  const closeDialog = useCallback(() => setSelected(null), [])

  const filtered = useMemo(() => filterProjects(PROJECTS, filters), [filters])
  const total = filtered.length
  const pages = pageCount(total, perPage)
  const page = Math.min(nav.page, pages - 1)
  const visible = pageItems(filtered, page, perPage)
  const first = page * perPage + 1
  const last = first + visible.length - 1
  const hasFilters = filters.tags.length > 0 || filters.year !== ''

  const updateFilters = (next) => {
    setFilters(next)
    setNav({ page: 0, dir: 1 })
  }
  const toggleTag = (tag) =>
    updateFilters({
      ...filters,
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag],
    })
  const clearFilters = () => updateFilters({ tags: [], year: '' })

  const goTo = (next) => {
    const clamped = Math.min(Math.max(next, 0), pages - 1)
    if (clamped === page) return
    setNav({ page: clamped, dir: clamped > page ? 1 : -1 })
  }

  // Gesto de deslizar en táctil (touch-pan-y deja el scroll vertical al navegador).
  const touchStart = useRef(null)
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return
    goTo(page + (dx < 0 ? 1 : -1))
  }

  // Cambia al cambiar filtros, página o tamaño: fuerza la entrada escalonada de nuevo.
  const listKey = `${perPage}-${page}-${filters.tags.join(',')}-${filters.year}`

  // Maquetación según la forma de la pantalla.
  const sectionPad = short
    ? 'pt-14 pb-3 md:px-10 min-[1200px]:pl-24'
    : 'pt-[4.5rem] pb-6 sm:pt-20 sm:pb-16 md:px-10 md:py-16 min-[1200px]:pl-24'
  const gridCols =
    short && !stack
      ? 'grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'
      : 'grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'
  // Hueco del avatar: en móvil ocupa la pantalla (absoluto) y las cards van encima, con
  // el avatar y las formas de fondo; en el resto, una columna propia.
  const slotClass = stack
    ? short
      ? 'absolute inset-x-0 top-14 bottom-4'
      : 'absolute inset-x-0 top-20 bottom-16'
    : short
      ? 'min-h-[68vh]'
      : 'sm:min-h-[45vh] md:min-h-[70vh]'
  // En una línea con scroll horizontal cuando falta altura; si no, en varias líneas.
  const scrollable = stack || short
  const filtersLayout = scrollable
    ? 'flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    : 'flex-wrap justify-center'

  // Qué bordes de la fila de filtros tienen más contenido fuera de la vista.
  const filtersRef = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  useEffect(() => {
    const el = filtersRef.current
    if (!el || !scrollable) return
    // El ResizeObserver avisa al observar por primera vez: ahí se calcula el estado inicial.
    const update = () => {
      const left = el.scrollLeft > 4
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
      setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }))
    }
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [scrollable])
  const scrollFilters = (direction) =>
    filtersRef.current?.scrollBy({ left: direction * 160, behavior: 'smooth' })
  const fade = '2.75rem'
  const fadeMask = {
    maskImage: `linear-gradient(to right, ${
      edges.left ? `transparent 0, #000 ${fade}` : '#000 0'
    }, ${edges.right ? `#000 calc(100% - ${fade}), transparent 100%` : '#000 100%'})`,
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className={`relative flex min-h-svh items-center overflow-x-clip px-6 ${sectionPad}`}
    >
      <LazyMotion features={domAnimation} strict>
        {/* Bloque centrado: hueco para el avatar (izquierda) + título y cards (derecha).
            La columna es `minmax(0, 1fr)` también en móvil: un elemento de un grid no baja
            de su ancho de contenido, y la fila de chips (sin saltos de línea) lo habría
            ensanchado más que la pantalla. */}
        <div
          className={`mx-auto grid w-full max-w-6xl items-center ${short ? 'gap-6' : 'gap-10'} ${gridCols}`}
        >
          {/* Hueco reservado: el avatar de pie se encuadra aquí (ver scene/CameraRig.jsx). */}
          <div id={WORKS_AVATAR_SLOT_ID} className={slotClass} />

          <div className="relative min-w-0">
            {/* El título se centra respecto a las cards, no respecto a la página. En móvil
                lleva un fondo para que se lea sobre el avatar. */}
            <h2
              id="projects-title"
              className={`text-center font-semibold ${short ? 'text-3xl' : 'text-4xl sm:text-5xl'} ${
                stack ? `mx-auto w-fit px-6 py-2 leading-normal ${PILL}` : ''
              }`}
            >
              Projects
            </h2>

            {/* Filtros: año y tecnologías (selección múltiple). Cuando van en una línea con
                scroll, el borde por el que queda más contenido se funde a transparente y
                lleva una flecha. */}
            <div
              className={`relative ${short ? 'mt-2' : 'mt-4 sm:mt-6'} ${stack ? '-mx-6' : ''}`}
            >
            <div
              ref={filtersRef}
              style={scrollable ? fadeMask : undefined}
              className={`flex items-center gap-2 ${filtersLayout} ${stack ? 'px-6' : ''}`}
            >
              <label className="shrink-0 text-sm">
                <span className="sr-only">Filter by year</span>
                <select
                  value={filters.year}
                  onChange={(e) => updateFilters({ ...filters, year: e.target.value })}
                  className="rounded-full border border-(--color-ink)/20 bg-(--color-paper)/85 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <option value="">All years</option>
                  {ALL_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <ul aria-label="Filter by technology" className="contents">
                {ALL_TAGS.map((tag) => {
                  const active = filters.tags.includes(tag)
                  return (
                    <li key={tag} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          active
                            ? 'border-(--color-ink) bg-(--color-ink) text-(--color-paper)'
                            : 'border-(--color-ink)/20 bg-(--color-paper)/85 hover:border-(--color-ink)/50'
                        }`}
                      >
                        {tag}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
              {scrollable && edges.left && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => scrollFilters(-1)}
                  className={`absolute top-1/2 left-1 flex size-7 -translate-y-1/2 items-center justify-center ${PILL}`}
                >
                  <Chevron direction="prev" />
                </button>
              )}
              {scrollable && edges.right && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => scrollFilters(1)}
                  className={`absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center ${PILL}`}
                >
                  <Chevron direction="next" />
                </button>
              )}
            </div>

            {/* "Clear filters" abre su propia fila con una animación de altura: el resto
                del bloque (cards, tabs, contador) baja y sube suavemente, sin saltos. */}
            <AnimatePresence initial={false}>
              {hasFilters && (
                <m.div
                  key="clear-filters"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex justify-center overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`mt-1 px-3 py-1 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${
                      stack ? PILL : ''
                    }`}
                  >
                    Clear filters
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            <div
              role="group"
              aria-roledescription="carousel"
              aria-label="Projects"
              className={short ? 'mt-2' : 'mt-4 sm:mt-6'}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Flechas laterales (≥640 px). Ocupan siempre su sitio: invisibles si
                    solo hay una página. En móvil van debajo, junto a los puntos. */}
                <ArrowButton
                  direction="prev"
                  className="max-sm:hidden"
                  hidden={pages <= 1}
                  disabled={page === 0}
                  onClick={() => goTo(page - 1)}
                />

                {/* Altura mínima de las cards de una página: al filtrar a pocos resultados
                    (o a ninguno) el bloque no salta ni descuadra el encuadre del avatar. */}
                <div
                  className="min-w-0 flex-1 touch-pan-y"
                  style={{ minHeight: blockHeight }}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  {visible.length > 0 ? (
                    <m.ul
                      key={listKey}
                      className={`grid items-stretch ${COLS[columns]} ${compact ? 'gap-3' : 'gap-4'}`}
                      style={compact ? { gridAutoRows: rowHeight } : undefined}
                      variants={list}
                      custom={nav.dir}
                      initial="hidden"
                      whileInView="show"
                      // "some": en cuanto asoma un píxel (con un porcentaje, en móvil
                      // tardarían en aparecer).
                      viewport={{ once: true, amount: 'some' }}
                    >
                      {visible.map((project) => (
                        <m.li key={project.id} variants={item} custom={nav.dir}>
                          <ProjectCard
                            {...project}
                            compact={compact}
                            tiny={tiny}
                            onOpen={(rect) => setSelected({ project, rect })}
                          />
                        </m.li>
                      ))}
                    </m.ul>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--color-ink)/25 bg-(--color-paper)/70 p-4 text-center backdrop-blur-sm"
                      style={{ minHeight: blockHeight }}
                    >
                      <p>No projects match these filters.</p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>

                <ArrowButton
                  direction="next"
                  className="max-sm:hidden"
                  hidden={pages <= 1}
                  disabled={page === pages - 1}
                  onClick={() => goTo(page + 1)}
                />
              </div>

              <div className={`flex flex-col items-center ${short ? 'mt-2 gap-1' : 'mt-3 gap-2 sm:mt-5 sm:gap-3'}`}>
                <div className="flex items-center gap-4">
                  <ArrowButton
                    direction="prev"
                    className="sm:hidden"
                    hidden={pages <= 1}
                    disabled={page === 0}
                    onClick={() => goTo(page - 1)}
                  />
                  {/* Puntos: fondo propio en móvil para que se vean sobre el avatar. */}
                  <div
                    className={`${stack ? `${PILL} px-2.5 py-2` : ''} ${pages > 1 ? '' : 'invisible'}`}
                  >
                    {/* Altura fija (h-2) y siempre presente: solo cambia su contenido. */}
                    <div className="flex h-2 items-center gap-2">
                      {pages > 1 &&
                        Array.from({ length: pages }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Go to page ${i + 1} of ${pages}`}
                            aria-current={i === page ? 'true' : undefined}
                            className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                              i === page ? 'w-6 bg-(--color-ink)' : 'w-2 bg-(--color-ink)/25'
                            }`}
                          />
                        ))}
                    </div>
                  </div>
                  <ArrowButton
                    direction="next"
                    className="sm:hidden"
                    hidden={pages <= 1}
                    disabled={page === pages - 1}
                    onClick={() => goTo(page + 1)}
                  />
                </div>
                <p
                  aria-live="polite"
                  className={`text-sm ${stack ? `${PILL} px-3 py-1` : 'opacity-70'}`}
                >
                  {total === 0
                    ? 'No projects found'
                    : `Showing ${first === last ? first : `${first}–${last}`} of ${total}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <ProjectDialog
              key={selected.project.id}
              project={selected.project}
              origin={selected.rect}
              onClose={closeDialog}
            />
          )}
        </AnimatePresence>
      </LazyMotion>
    </section>
  )
}
