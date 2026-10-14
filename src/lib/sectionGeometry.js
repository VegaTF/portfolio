import { SECTIONS } from '../config/sections'

// Geometría de scroll de las secciones (en px de documento).
//
//   tops[i]   scroll al que la sección i queda arriba del todo.
//   rests[i]  último scroll en el que la sección i sigue "en reposo". En secciones
//             más bajas que la pantalla coincide con tops[i]. En las altas (típico en
//             móvil, con las cards apiladas) es tops[i + 1] - alto de pantalla: mientras
//             se lee el contenido la escena no cambia, y la transición a la siguiente
//             sección ocurre durante la última pantalla antes de ella.
//   max       scroll máximo de la página.
export function getSectionGeometry() {
  const viewport = window.innerHeight
  const tops = SECTIONS.map(({ id }) => {
    const el = document.getElementById(id)
    return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : 0
  })
  const rests = tops.map((top, i) =>
    i < tops.length - 1 ? Math.max(top, tops[i + 1] - viewport) : top,
  )
  const max = Math.round(document.documentElement.scrollHeight - viewport)
  return { tops, rests, max, viewport }
}
