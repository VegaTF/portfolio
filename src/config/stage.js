// "Escenario" = habitación + avatar. Se mueve y gira junto (ver Room.jsx).
// Las posiciones del avatar se dan en coordenadas del escenario (las de room.glb);
// la cámara trabaja en coordenadas de MUNDO. stageToWorld traduce de unas a otras.

// Centro aproximado de la habitación (suelo de steni): el escenario gira sobre él.
export const ROOM_CENTER = [-0.68, 0, -0.75]

// Giro del escenario con el que se ve el Home (para que se le vea la cara al avatar).
export const ROOM_BASE_YAW = 0.6 // rad

// Punto del escenario → mundo, para un giro Y del escenario.
export function stageToWorld(point, yaw = ROOM_BASE_YAW) {
  const dx = point[0] - ROOM_CENTER[0]
  const dz = point[2] - ROOM_CENTER[2]
  const cos = Math.cos(yaw)
  const sin = Math.sin(yaw)
  return [
    ROOM_CENTER[0] + dx * cos + dz * sin,
    point[1],
    ROOM_CENTER[2] - dx * sin + dz * cos,
  ]
}
