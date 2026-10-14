// Botón-enlace de red social: relleno del color del texto, con efecto hover.
export default function SocialButton({ href, label, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-(--page-fg) px-6 text-base font-medium text-(--page-bg) shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-(--color-peach) hover:text-(--color-ink) hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-peach)"
    >
      <span aria-hidden="true" className="transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
        {icon}
      </span>
      {label}
      <span
        aria-hidden="true"
        className="-ml-1 translate-x-0 opacity-70 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100"
      >
        →
      </span>
    </a>
  )
}
