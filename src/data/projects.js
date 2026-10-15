// Proyectos mostrados en la sección Projects.
//
// title / description / tags: lo que se ve en la card. Las `tags` alimentan el filtro por
//                             tecnología.
// date:   'AAAA-MM'. Se muestra en la card y alimenta el filtro por fechas.
// href:   web desplegada. Se ofrece como botón "Visit website" en la ventana de detalles
//         que abre la card (pestaña nueva).
// repo:   repositorio de GitHub (enlace pequeño "Code" dentro de la card).
// image:  captura grande (ventana de detalles), relativa a `public/` (p. ej.
//         'projects/isaac-tools.webp'). Sin imagen
//         se muestra el degradado de `accent` (peach | sky | fuchsia).
// details: texto más largo, solo para la ventana que se abre al pulsar la card.
// thumb:  miniatura (480 px) para las cards; si falta se usa `image`.
// comingSoon: card de reserva, sin enlaces ni datos; no entra en los filtros.
const COMING_SOON = {
  title: 'New project',
  description: 'A new project is on its way.',
  tags: [],
  date: null,
  href: null,
  repo: null,
  image: null,
  thumb: null,
  comingSoon: true,
}

export const PROJECTS = [
  {
    id: 'portfolio',
    title: 'Portfolio',
    description:
      'This site: an interactive 3D portfolio with a scroll-driven scene, animated avatar and responsive layouts.',
    details:
      'A single-page site with a fixed React Three Fiber canvas behind the HTML: scrolling drives the camera and the avatar animations (Mixamo clips), with responsive layouts for any screen, SEO metadata, accessible navigation and a working contact form.',
    tags: ['React', 'Three.js', 'Tailwind'],
    date: '2026-10',
    href: 'https://vegatf.github.io/portfolio/',
    repo: 'https://github.com/VegaTF/portfolio',
    image: 'projects/portfolio.webp',
    thumb: 'projects/portfolio-thumb.webp',
    accent: 'peach',
  },
  {
    id: 'isaac-tools',
    title: 'isaac-tools',
    description:
      'Searchable compendium of The Binding of Isaac items, with filters and item cards built from a custom JSON dataset.',
    details:
      'A minimal single-page app built with React and Vite: a search bar, a filterable item list and item cards, with the data stored in a custom JSON file. Deployed on GitHub Pages.',
    tags: ['React', 'Vite', 'JavaScript'],
    date: '2026-09',
    href: 'https://vegatf.github.io/isaac-tools/',
    repo: 'https://github.com/VegaTF/isaac-tools',
    image: 'projects/isaac-tools.webp',
    thumb: 'projects/isaac-tools-thumb.webp',
    accent: 'fuchsia',
  },
  {
    id: 'cineatlas',
    title: 'CineAtlas',
    description:
      'Responsive movie website organised by genre: semantic HTML5, SEO-friendly markup and a flexbox layout.',
    details:
      "First collaborative project of UNIR's higher-level web development programme. A Spanish-language site with navigation for eight film genres, a hero section and a responsive flexbox layout with a custom colour palette, built with HTML5, CSS3, JavaScript (ES6+), Montserrat and Normalize.css.",
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    date: '2026-03',
    href: 'https://vegatf.github.io/CineAtlas/',
    repo: 'https://github.com/VegaTF/CineAtlas',
    image: 'projects/cineatlas.webp',
    thumb: 'projects/cineatlas-thumb.webp',
    accent: 'sky',
  },
  { id: 'soon-1', accent: 'sky', ...COMING_SOON },
  { id: 'soon-2', accent: 'fuchsia', ...COMING_SOON },
  { id: 'soon-3', accent: 'peach', ...COMING_SOON },
]
