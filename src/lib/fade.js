// Prepara materiales para poder desvanecerlos con el scroll.
//
// `transparent` debe ser true DESDE EL PRINCIPIO: three compila el shader con OPAQUE
// (alfa forzado a 1) cuando transparent es false, y cambiarlo después no recompila el
// programa de forma fiable. Con opacidad 1 y depthWrite activo, un material transparente
// se ve igual que uno opaco.
// Vive fuera de los componentes a propósito: muta objetos de three.
export function makeFadeable(materials) {
  for (const material of materials) {
    material.transparent = true
    material.depthWrite = true
    material.opacity = 1
  }
}

// Aplica una opacidad a una lista de materiales ya preparados con makeFadeable.
export function applyOpacity(materials, opacity) {
  for (const material of materials) material.opacity = opacity
}
