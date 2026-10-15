import { GitHubIcon } from './SocialIcons'

const ACCENTS = {
  peach: 'var(--color-peach)',
  sky: 'var(--color-sky)',
  fuchsia: 'var(--color-fuchsia)',
}

const MONTH_YEAR = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

// 'AAAA-MM' → "May 2026". Si no hay fecha o no es válida, no se muestra nada.
function formatDate(date) {
  if (!date) return null
  const parsed = new Date(`${date}-01T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : MONTH_YEAR.format(parsed)
}

// Card de proyecto reutilizable.
//
//  - TODA la card es pulsable y abre la ventana con los detalles (ProjectDialog): el
//    título es el botón y su `::after` se estira para cubrir la card (así hay un solo
//    control accesible y el resto del contenido sigue siendo texto normal). `onOpen`
//    recibe el rectángulo de la card, de donde "nace" la ventana. El enlace al
//    repositorio va por encima (z-10) para poder pulsarse por separado.
//  - Con `image` muestra la captura; sin ella, el degradado de `accent`. Con
//    `comingSoon` el degradado lleva una etiqueta y la card no es enlace.
//  - `compact`: versión de altura reducida (la fija quien la contiene, ver Works.jsx)
//    para móviles y pantallas bajas: la imagen pasa a un lateral. `tiny`: aún más baja,
//    sin descripción. Se deciden por JS (y no con breakpoints de Tailwind) porque
//    dependen del ancho Y del alto de la pantalla.
export default function ProjectCard({
  title,
  description,
  tags = [],
  date = null,
  repo = null,
  image = null,
  thumb = null,
  accent = 'peach',
  comingSoon = false,
  compact = false,
  tiny = false,
  onOpen = null,
}) {
  const formatted = formatDate(date)

  // Imagen (o degradado). En compacto ocupa un lateral; si no, la cabecera.
  const media = (
    <div
      aria-hidden="true"
      className={`relative shrink-0 overflow-hidden transition duration-300 group-hover:brightness-105 ${
        compact ? 'w-24' : 'h-24 w-full'
      }`}
      style={
        image ? undefined : { background: `linear-gradient(135deg, ${ACCENTS[accent]}, var(--color-paper))` }
      }
    >
      {image && (
        <img
          src={`${import.meta.env.BASE_URL}${thumb ?? image}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-left-top"
        />
      )}
      {comingSoon && (
        <span className="absolute inset-0 flex items-center justify-center p-1.5 text-center">
          <span className="rounded-full bg-(--color-paper)/85 px-2.5 py-1 text-[11px] leading-tight font-medium">
            Coming soon
          </span>
        </span>
      )}
    </div>
  )

  return (
    <article
      className={`group relative flex h-full overflow-hidden rounded-2xl border border-(--color-ink)/15 bg-(--color-paper)/85 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
        compact ? 'flex-row' : 'flex-col'
      }`}
    >
      {media}
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col ${compact ? 'gap-1 p-2.5' : 'gap-2 p-3.5'}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <h3
            className={`min-w-0 leading-tight font-semibold ${compact ? 'text-base' : 'text-lg'}`}
          >
            {comingSoon ? (
              title
            ) : (
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(event) =>
                  onOpen?.(event.currentTarget.closest('article').getBoundingClientRect())
                }
                className="cursor-pointer rounded-sm text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {title}
                <span className="sr-only"> (view project details)</span>
              </button>
            )}
          </h3>
          {formatted && (
            <time dateTime={date} className="shrink-0 text-xs opacity-70">
              {formatted}
            </time>
          )}
        </div>
        {!tiny && (
          <p
            className={`leading-relaxed ${
              compact ? 'line-clamp-1 text-xs' : 'line-clamp-2 text-sm'
            }`}
          >
            {description}
          </p>
        )}
        {/* Compacto: tecnologías y enlace a la derecha, en una fila. Normal: el enlace va
            debajo de las tecnologías, con aire entre ambos. */}
        <div
          className={`mt-auto flex ${
            compact
              ? 'flex-nowrap items-end justify-between gap-x-3 pt-0.5'
              : 'flex-col items-start gap-3 pt-1'
          }`}
        >
          <ul
            aria-label="Technologies"
            className={`flex min-w-0 ${compact ? 'flex-nowrap gap-1 overflow-hidden' : 'flex-wrap gap-1.5'}`}
          >
            {tags.map((tag) => (
              <li
                key={tag}
                className={`shrink-0 rounded-full border border-(--color-ink)/20 py-0.5 ${
                  compact ? 'px-2 text-[11px]' : 'px-2.5 text-xs'
                }`}
              >
                {tag}
              </li>
            ))}
          </ul>
          {repo && (
            <a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} source code on GitHub`}
              className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full text-xs font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <GitHubIcon size={compact ? 16 : 14} />
              {!compact && <span>Code</span>}
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
