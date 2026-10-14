// Posición del ratón normalizada a -1..1 (x: izquierda→derecha, y: abajo→arriba).
// Objeto mutable a propósito: se lee en useFrame sin provocar re-renders.
export const mouseState = { x: 0, y: 0 }
