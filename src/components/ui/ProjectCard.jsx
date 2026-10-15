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

// Card de proyecto reutilizable. Si `href` es null, no se muestra enlace.
//
// `compact`: versión de altura reducida (la fija quien la contiene, ver Works.jsx) para
// móviles y pantallas bajas: franja de color en vez de cabecera, descripción de una línea
// y textos algo menores. `tiny`: aún más baja, sin descripción. Se deciden por JS (y no
// con breakpoints de Tailwind) porque dependen del ancho Y del alto de la pantalla.
// El título y la fecha pueden pasar a dos líneas si no caben (columnas estrechas).
export default function ProjectCard({
  title,
  description,
  tags = [],
  date = null,
  href = null,
  accent = 'peach',
  compact = false,
  tiny = false,
}) {
  const formatted = formatDate(date)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-ink)/15 bg-(--color-paper)/85 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Cabecera: de momento un bloque de color; aquí irá la captura del proyecto. */}
      <div
        aria-hidden="true"
        className={`w-full shrink-0 transition duration-300 group-hover:brightness-105 ${
          compact ? 'h-1.5' : 'h-16'
        }`}
        style={{ background: `linear-gradient(135deg, ${ACCENTS[accent]}, var(--color-paper))` }}
      />
      <div
        className={`flex min-h-0 flex-1 flex-col ${compact ? 'gap-1 p-2.5' : 'gap-2 p-3.5'}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <h3
            className={`min-w-0 leading-tight font-semibold ${compact ? 'text-base' : 'text-lg'}`}
          >
            {title}
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
              compact ? 'line-clamp-1 text-xs' : 'line-clamp-3 text-sm'
            }`}
          >
            {description}
          </p>
        )}
        <div
          className={`mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 ${
            compact ? 'pt-0.5' : 'pt-1'
          }`}
        >
          <ul
            aria-label="Technologies"
            className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}
          >
            {tags.map((tag) => (
              <li
                key={tag}
                className={`rounded-full border border-(--color-ink)/20 py-0.5 ${
                  compact ? 'px-2 text-[11px]' : 'px-2.5 text-xs'
                }`}
              >
                {tag}
              </li>
            ))}
          </ul>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium underline underline-offset-4 ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              View project
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
