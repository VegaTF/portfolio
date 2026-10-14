import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '../../config/sections'
import { SOCIALS } from '../../config/socials'
import { useActiveSection } from '../../hooks/useActiveSection'
import { SOCIAL_ICONS } from '../ui/SocialIcons'

// En About ya hay botones de GitHub y LinkedIn grandes: aquí se ocultan para no repetir.
const HIDE_SOCIALS_IN = 'about'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Lleva a una sección con scroll suave. El imán (useScrollMagnet) no interfiere:
// el destino ya es un punto de reposo.
function goTo(event, id) {
  event.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({
    top: Math.round(el.getBoundingClientRect().top + window.scrollY),
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })
}

// Enlaces de sección con la estética del panel de escritorio: mayúsculas pequeñas con
// separación entre letras y un punto bajo el activo. El activo va en el color de texto
// de la página (negro en claro, blanco roto en Contacto); los demás, atenuados.
// `vertical` rota el texto (panel izquierdo); si no, van en fila (barra superior).
function SectionLinks({ active, vertical, className }) {
  return (
    <ul className={className}>
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id
        return (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              onClick={(event) => goTo(event, id)}
              aria-current={isActive ? 'location' : undefined}
              className={[
                'flex items-center justify-center transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-peach)',
                // Vertical: el punto va a continuación. En fila: el punto se coloca
                // debajo SIN ocupar sitio, así el texto queda centrado con los iconos.
                vertical ? 'flex-col gap-2 py-1' : 'relative px-1 py-1.5',
                isActive
                  ? 'font-semibold text-(--page-fg)'
                  : // Atenuado pero con contraste suficiente (≥ 4.5:1) para texto pequeño.
                    'font-medium text-(--page-fg)/65 hover:text-(--page-fg)',
              ].join(' ')}
            >
              <span
                className={[
                  'whitespace-nowrap uppercase',
                  vertical
                    ? 'rotate-180 text-xs tracking-[0.22em] [writing-mode:vertical-rl]'
                    : 'text-[11px] tracking-[0.14em]',
                ].join(' ')}
              >
                {label}
              </span>
              {/* Punto indicador de la sección actual. */}
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full bg-current transition duration-300 ${
                  vertical ? '' : 'absolute -bottom-1 left-1/2 -translate-x-1/2'
                } ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
              />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function Chevron({ direction }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true" focusable="false">
      <path
        d={direction === 'left' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Fila de enlaces desplazable (para pantallas estrechas): si no caben, aparecen flechas
// en los extremos y el enlace activo se mantiene a la vista.
function ScrollableLinks({ active }) {
  const scrollerRef = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  // Qué extremos tienen contenido oculto. ResizeObserver lo llama también al empezar.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const update = () => {
      setEdges({
        left: scroller.scrollLeft > 4,
        right: scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4,
      })
    }
    scroller.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  // Centra el enlace activo cuando cambia de sección.
  useEffect(() => {
    const scroller = scrollerRef.current
    const link = scroller?.querySelector('[aria-current]')
    if (!scroller || !link) return
    const left = link.offsetLeft - (scroller.clientWidth - link.offsetWidth) / 2
    scroller.scrollTo({ left, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [active])

  const scrollBy = (direction) => {
    const scroller = scrollerRef.current
    scroller?.scrollBy({
      left: direction * scroller.clientWidth * 0.6,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const arrow = (direction, visible) => (
    <button
      type="button"
      aria-label={direction < 0 ? 'Show previous sections' : 'Show more sections'}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => scrollBy(direction)}
      className={[
        'absolute top-1/2 z-10 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-(--page-bg)/85 text-(--page-fg) shadow-sm backdrop-blur-sm transition duration-300 focus-visible:outline-2 focus-visible:outline-(--color-peach)',
        direction < 0 ? 'left-0' : 'right-0',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      <Chevron direction={direction < 0 ? 'left' : 'right'} />
    </button>
  )

  // Los enlaces se funden en el borde donde hay más contenido, bajo la flecha.
  const fadeLeft = edges.left ? 'transparent 0, black 30px' : 'black 0'
  const fadeRight = edges.right ? 'black calc(100% - 30px), transparent 100%' : 'black 100%'
  const mask = `linear-gradient(to right, ${fadeLeft}, ${fadeRight})`

  return (
    <div className="relative min-w-0 flex-1">
      <nav
        ref={scrollerRef}
        aria-label="Main navigation"
        // La barra de scroll horizontal se oculta: se navega con las flechas o el dedo.
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <SectionLinks active={active} className="flex w-max items-center gap-1.5 px-1" />
      </nav>
      {arrow(-1, edges.left)}
      {arrow(1, edges.right)}
    </div>
  )
}

// Iconos de redes: botones redondos rellenos con el color del texto.
function SocialLinks({ hidden, size, className }) {
  return (
    <ul
      aria-label="Social links"
      // inert: oculto también para teclado y lectores de pantalla.
      inert={hidden}
      className={[
        className,
        'transition duration-500',
        hidden ? 'pointer-events-none translate-x-3 opacity-0' : 'translate-x-0 opacity-100',
      ].join(' ')}
    >
      {SOCIALS.map(({ id, label, href }) => {
        const Icon = SOCIAL_ICONS[id]
        return (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}
              className="inline-flex items-center justify-center rounded-full bg-(--page-fg) text-(--page-bg) shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-(--color-peach) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-peach)"
              style={{ width: size, height: size }}
            >
              <Icon size={Math.round(size * 0.5)} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

// Desktop (≥1200 px): navegación vertical a la izquierda y redes a la derecha.
// Tablet / móvil: barra superior con la misma estética (enlaces en fila con flechas si
// no caben) y las redes a la derecha.
export default function Navbar() {
  const active = useActiveSection()
  const hideSocials = active === HIDE_SOCIALS_IN

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed top-1/2 left-5 z-40 hidden -translate-y-1/2 min-[1200px]:block"
      >
        <SectionLinks active={active} vertical className="flex flex-col gap-7" />
      </nav>

      <SocialLinks
        hidden={hideSocials}
        size={40}
        className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 flex-col gap-3 min-[1200px]:flex"
      />

      <header className="fixed inset-x-0 top-0 z-40 min-[1200px]:hidden">
        {/* Velo del color de la página que se desvanece hacia abajo (sin borde duro). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-(--page-bg)/80 backdrop-blur-md transition-colors duration-700 [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
        />
        <div className="relative flex items-center gap-3 px-3 pt-2.5 pb-4">
          <ScrollableLinks active={active} />
          <div
            // Al ocultarse las redes (About) este bloque se pliega y los enlaces ganan sitio.
            className={`shrink-0 overflow-hidden transition-[max-width] duration-500 ${
              hideSocials ? 'max-w-0' : 'max-w-24'
            }`}
          >
            <SocialLinks hidden={hideSocials} size={32} className="flex items-center gap-2" />
          </div>
        </div>
      </header>
    </>
  )
}
