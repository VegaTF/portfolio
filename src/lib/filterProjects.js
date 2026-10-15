// Filtrado de proyectos (lógica pura, sin React).
// `date` es 'AAAA-MM', así que comparar como texto ordena igual que por fecha.

// Tecnologías que aparecen en algún proyecto, por orden alfabético.
export function uniqueTags(projects) {
  const all = projects.flatMap((project) => project.tags ?? [])
  return [...new Set(all)].sort((a, b) => a.localeCompare(b))
}

// Años con proyectos, del más reciente al más antiguo ('2026', '2025'…).
export function uniqueYears(projects) {
  const years = projects.map((project) => project.date?.slice(0, 4)).filter(Boolean)
  return [...new Set(years)].sort((a, b) => b.localeCompare(a))
}

// `tags`: un proyecto pasa si tiene ALGUNA de las seleccionadas (vacío = todos).
// `year`: '' = cualquier año. Devuelve los proyectos de más reciente a más antiguo.
export function filterProjects(projects, { tags = [], year = '' } = {}) {
  return projects
    .filter((project) => tags.length === 0 || project.tags?.some((tag) => tags.includes(tag)))
    .filter((project) => !year || project.date?.startsWith(year))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}
