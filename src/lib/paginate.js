// Paginado puro (sin React): fácil de probar y reutilizable cuando lleguen los filtros.

export function pageCount(total, perPage) {
  return Math.max(1, Math.ceil(total / perPage))
}

// Elementos de la página `page` (empieza en 0). Una página fuera de rango se recorta.
export function pageItems(items, page, perPage) {
  const safe = Math.min(Math.max(page, 0), pageCount(items.length, perPage) - 1)
  const start = safe * perPage
  return items.slice(start, start + perPage)
}
