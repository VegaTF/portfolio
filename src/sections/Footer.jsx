const YEAR = new Date().getFullYear()

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Footer() {
  const backToTop = () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })

  return (
    <footer className="relative z-10 border-t border-(--page-fg)/15 px-10 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <p>
          © {YEAR} Jorge Vega. All rights reserved.
        </p>
        <button
          type="button"
          onClick={backToTop}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-(--page-fg)/40 px-5 font-medium transition duration-300 hover:-translate-y-0.5 hover:bg-(--page-fg) hover:text-(--page-bg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-peach)"
        >
          Back to top <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  )
}
