// Mide un hueco del HTML. La posición vertical se da respecto al inicio de su sección:
// cuando la sección está en pantalla, su inicio coincide con el del viewport, así que
// (centerX, centerY) es donde se verá el hueco "en reposo".
export function measureSlot(id) {
  const el = document.getElementById(id)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const section = el.closest('section')
  const sectionTop = section ? section.getBoundingClientRect().top + window.scrollY : 0
  return {
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + window.scrollY - sectionTop + rect.height / 2,
    width: rect.width,
    height: rect.height,
  }
}
