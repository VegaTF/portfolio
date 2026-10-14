// Convierte las animaciones FBX de Mixamo (source-assets/animations) en JSON compacto
// (public/animations). El FBX es pesado de descargar y, sobre todo, de interpretar en el
// navegador; el JSON ya trae las pistas listas para crear un AnimationClip.
//
// Uso:  node scripts/convert-animations.mjs
//
// Qué hace:
//  - Se queda con las pistas de rotación (quaternion) de todos los huesos y con la
//    posición solo de la cadera (Hips): el resto de huesos no se desplazan.
//  - Si el clip viene en centímetros (típico de Mixamo) pasa las posiciones a metros.
//  - Redondea para quitar decimales que no se ven.
import fs from 'node:fs'
import path from 'node:path'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

const SOURCE_DIR = 'source-assets/animations'
const OUTPUT_DIR = 'public/animations'

const round = (value, decimals) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

for (const file of fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.fbx'))) {
  const buffer = fs.readFileSync(path.join(SOURCE_DIR, file))
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  const clip = new FBXLoader().parse(arrayBuffer, '').animations[0]

  const hips = clip.tracks.find((track) => track.name === 'Hips.position')
  const unit = hips && Math.abs(hips.values[1]) > 10 ? 0.01 : 1

  const kept = clip.tracks.filter(
    (track) => track.name.endsWith('.quaternion') || track.name === 'Hips.position',
  )

  // Si todas las pistas comparten los mismos instantes (lo normal en Mixamo, a 30 fps),
  // se guardan una sola vez en lugar de repetirlos en cada pista.
  const roundedTimes = (track) => Array.from(track.times, (t) => round(t, 3))
  const first = JSON.stringify(roundedTimes(kept[0]))
  const sharedTimes = kept.every((track) => JSON.stringify(roundedTimes(track)) === first)

  // Cuaterniones a 3 decimales (≈ 0.06° de error, invisible) y posición a 0.1 mm.
  const tracks = kept.map((track) => {
    const isQuaternion = track.name.endsWith('.quaternion')
    const values = Array.from(track.values, (v) =>
      isQuaternion ? round(v, 3) : round(v * unit, 4),
    )
    return sharedTimes
      ? [track.name, isQuaternion ? 'q' : 'v', values]
      : [track.name, isQuaternion ? 'q' : 'v', values, roundedTimes(track)]
  })

  const name = path.basename(file, '.fbx')
  const output = path.join(OUTPUT_DIR, `${name}.json`)
  const data = { duration: round(clip.duration, 3), tracks }
  if (sharedTimes) data.times = roundedTimes(kept[0])
  fs.writeFileSync(output, JSON.stringify(data))

  const before = Math.round(buffer.length / 1024)
  const after = Math.round(fs.statSync(output).size / 1024)
  console.log(`${file.padEnd(16)} ${String(before).padStart(5)} KB → ${name}.json ${String(after).padStart(5)} KB  (${tracks.length} pistas, ${clip.duration.toFixed(2)} s, unidad ×${unit})`)
}
