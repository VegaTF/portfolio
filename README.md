# Jorge Vega — 3D Portfolio

Live: <https://vegatf.github.io/portfolio/>

Single-page interactive portfolio built with **React 19**, **Vite**, **Three.js / React Three
Fiber** and **Tailwind CSS v4**. A fixed 3D scene (a room and an animated avatar) reacts to the
page scroll while the HTML content scrolls above it.

## Features

- Scroll-driven 3D: camera, avatar animations (Mixamo clips), room fade, circular portrait.
- Sections: Home, Projects, About, Contact, Footer — with an adaptive layout for phones,
  tablets and desktop (portrait and landscape).
- Projects: paginated cards with technology and year filters, and a detail dialog.
- Working contact form (Web3Forms) with validation and spam protection.
- Section URLs (`/portfolio/home`, `/projects`, `/about`, `/contact`) kept in sync with scroll.
- Accessible (keyboard, screen readers, `prefers-reduced-motion`) and SEO-ready.

## Scripts

```bash
npm install
npm run dev       # development server (http://localhost:5173/portfolio/)
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

## Environment variables

Defined in `.env` (and overridable in `.env.production`):

| Variable | Purpose |
|---|---|
| `VITE_SITE_URL` | Public URL of the site (no trailing slash needed). Used for the `canonical`, `og:url`, `og:image` and `twitter:image` tags, which require absolute URLs (see `vite.config.js`). |
| `VITE_WEB3FORMS_KEY` | Public access key of [Web3Forms](https://web3forms.com), used by the contact form (`src/lib/sendContact.js`). It is public by design: it only allows sending messages to the owner's email. |

Only variables prefixed with `VITE_` reach the browser. Never put real secrets there.

## Deployment

The site is deployed to **GitHub Pages** by GitHub Actions on every push to `main`
(`.github/workflows/deploy.yml`). In the repository settings, *Pages → Source* must be
**GitHub Actions**.

- `vite.config.js` sets `base: '/portfolio/'`. In JavaScript, asset paths must use
  `import.meta.env.BASE_URL`.
- The build copies `index.html` to `404.html` so that direct links such as
  `/portfolio/projects` load the app (GitHub Pages serves them with a 404 status code).

## Project structure

```
public/            3D models (GLB), animation clips (JSON), project screenshots (WebP),
                   self-hosted font, favicon, social image
scripts/           convert-animations.mjs (FBX → JSON)
source-assets/     original FBX / avatar files (not published)
src/
  config/          sections, camera keyframes, choreography, palette, socials
  data/            project data
  scene/           everything inside the <Canvas> (room, avatar, camera, frame)
  sections/        Home, Projects, About, Contact, Footer (HTML)
  components/      Navbar, project card and dialog, hero shapes, error boundary...
  hooks/           scroll progress, scroll magnet, section spacing and URL, mouse...
  lib/             scroll geometry, filtering, pagination, form submission, helpers
  state/           mutable scroll/mouse state read every frame (no re-renders)
```

## Documentation

- [`docs/GUIA-APRENDIZAJE.md`](docs/GUIA-APRENDIZAJE.md) — beginner-friendly guide (in Spanish)
  to understand the project and learn React, Tailwind and Three.js with its real code.

## Performance notes

- The 3D scene (`three`, R3F, drei) is a separate lazy chunk that starts when the browser is
  idle after first paint; the text and navigation are usable immediately.
- Models, animations and the font are preloaded from `index.html`.
- `avatar.glb` is optimised (WebP textures, no unused morph targets); animations are compact JSON.
- Resolution adapts to the frame rate (drei `PerformanceMonitor`) and is capped on touch
  devices; shadow maps are smaller on mobile.
- Project screenshots are WebP, with small thumbnails for the cards.
- If WebGL is unavailable or the scene fails to load, the page still works without the 3D.
- Respects `prefers-reduced-motion`.
- Measure with Lighthouse against `npm run build && npm run preview`, not the dev server.
