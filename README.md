# Jorge Vega — 3D Portfolio

Single-page interactive portfolio built with **React 19**, **Vite**, **Three.js / React Three
Fiber** and **Tailwind CSS v4**. A fixed 3D scene (a room and an animated avatar) reacts to
the page scroll while the HTML content scrolls above it.

## Scripts

```bash
npm install
npm run dev       # development server
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

## Before publishing

Set the public URL of the site in `.env` (no trailing slash):

```
VITE_SITE_URL=https://your-domain.com
```

It is used to inject the `canonical`, `og:url`, `og:image` and `twitter:image` tags, which
require absolute URLs (see `vite.config.js`). Without it those tags are simply omitted.

## Project structure

```
public/            3D models (GLB), Mixamo animations (compact JSON, see scripts/convert-animations.mjs), self-hosted font, favicon, social image
src/
  config/          sections, camera keyframes, choreography, palette, socials
  scene/           everything inside the <Canvas> (room, avatar, camera, frame)
  sections/        Home, Projects, About, Contact, Footer (HTML)
  components/      Navbar, project cards, hero shapes, error boundary...
  hooks/           scroll progress, scroll magnet, section spacing, mouse...
  lib/             scroll geometry, WebGL detection, helpers
  state/           mutable scroll/mouse state read every frame (no re-renders)
```

Architecture notes, design decisions and the task list live in `agents.md`.

## Performance notes

- The 3D scene (`three`, R3F, drei) is a separate lazy chunk that starts when the browser is
  idle after first paint; the text and navigation are usable immediately.
- Models and animations are preloaded from `index.html`.
- `avatar.glb` is optimised (WebP textures, no unused morph targets).
- Resolution adapts to the frame rate (drei `PerformanceMonitor`) and is capped on
  touch devices; shadow maps are smaller on mobile.
- If WebGL is unavailable or the scene fails to load, the page still works without the 3D.
- Respects `prefers-reduced-motion`.
