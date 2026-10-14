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
export default function ProjectCard({
  title,
  description,
  tags = [],
  date = null,
  href = null,
  accent = 'peach',
}) {
  const formatted = formatDate(date)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-ink)/15 bg-(--color-paper)/80 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Cabecera: de momento un bloque de color; aquí irá la captura del proyecto. */}
      <div
        aria-hidden="true"
        className="h-16 w-full transition duration-300 group-hover:brightness-105"
        style={{ background: `linear-gradient(135deg, ${ACCENTS[accent]}, var(--color-paper))` }}
      />
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {formatted && (
            <time dateTime={date} className="shrink-0 text-xs opacity-70">
              {formatted}
            </time>
          )}
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed">{description}</p>
        <ul aria-label="Technologies" className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full border border-(--color-ink)/20 px-2.5 py-0.5 text-xs">
              {tag}
            </li>
          ))}
        </ul>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline underline-offset-4"
          >
            View project
          </a>
        )}
      </div>
    </article>
  )
}
