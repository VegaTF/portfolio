import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'framer-motion'
import { GitHubIcon } from './SocialIcons'

const ACCENTS = {
  peach: 'var(--color-peach)',
  sky: 'var(--color-sky)',
  fuchsia: 'var(--color-fuchsia)',
}

const MONTH_YEAR = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })

function formatDate(date) {
  if (!date) return null
  const parsed = new Date(`${date}-01T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : MONTH_YEAR.format(parsed)
}

// Ventana con la información completa de un proyecto. Se "agranda" desde la card que se
// pulsó (`origin` es su rectángulo) hasta el centro de la pantalla.
//
// Accesibilidad: role="dialog" + aria-modal, foco dentro (con trampa de Tab), Escape y
// clic en el fondo para cerrar, y el foco vuelve a la card al cerrar.
// Se monta en <body> (portal): así ningún ancestro con transform o filtros altera su
// posición `fixed`. Debe renderizarse dentro de <LazyMotion> y <AnimatePresence>.
export default function ProjectDialog({ project, origin, onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const titleId = `project-dialog-${project.id}`
  const { title, description, details, tags = [], date, href, repo, image, accent = 'peach' } = project
  const formatted = formatDate(date)

  useEffect(() => {
    const previousFocus = document.activeElement
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    // Sin scroll de la página mientras está abierta. `scrollbar-gutter: stable` (index.css)
    // mantiene el hueco de la barra, así el contenido no se desplaza al ocultarla.
    html.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      // Trampa de foco: Tab / Shift+Tab ciclan dentro de la ventana.
      const focusables = panelRef.current?.querySelectorAll('a[href], button:not([disabled])')
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      html.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [onClose])

  // Desde el centro de la card hasta el centro de la pantalla.
  const fromX = origin ? origin.left + origin.width / 2 - window.innerWidth / 2 : 0
  const fromY = origin ? origin.top + origin.height / 2 - window.innerHeight / 2 : 0

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <m.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />

      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-3xl bg-(--color-paper) text-(--color-ink) shadow-2xl"
        initial={{ opacity: 0, x: fromX, y: fromY, scale: 0.4 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.94 }}
        transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-(--color-paper)/90 shadow-sm transition hover:bg-(--color-ink) hover:text-(--color-paper) focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Captura (o degradado si no hay imagen). */}
        <div
          aria-hidden="true"
          className="aspect-[16/10] max-h-[38svh] w-full overflow-hidden"
          style={
            image
              ? undefined
              : { background: `linear-gradient(135deg, ${ACCENTS[accent]}, var(--color-paper))` }
          }
        >
          {image && (
            <img
              src={`${import.meta.env.BASE_URL}${image}`}
              alt=""
              className="size-full object-cover object-top"
            />
          )}
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id={titleId} className="text-2xl font-semibold sm:text-3xl">
              {title}
            </h2>
            {formatted && (
              <time dateTime={date} className="text-sm opacity-70">
                {formatted}
              </time>
            )}
          </div>

          <p className="mt-3 text-base leading-relaxed">{description}</p>
          {details && <p className="mt-3 text-base leading-relaxed opacity-85">{details}</p>}

          {tags.length > 0 && (
            <ul aria-label="Technologies" className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag} className="rounded-full border border-(--color-ink)/20 px-3 py-1 text-sm">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-(--color-ink) px-6 text-base font-medium text-(--color-paper) transition hover:bg-(--color-peach) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Visit website
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7 17L17 7M9 7h8v8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            {repo && (
              <a
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-(--color-ink)/25 px-5 text-base font-medium transition hover:border-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <GitHubIcon size={18} />
                Source code
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </m.div>
    </div>,
    document.body,
  )
}
