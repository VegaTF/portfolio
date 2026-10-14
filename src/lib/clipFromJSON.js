import { AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three'

// Construye un AnimationClip a partir del JSON generado por scripts/convert-animations.mjs:
//   { duration, times?, tracks: [[nombre, 'q' | 'v', valores, tiempos?], ...] }
// Si `times` está en la raíz, lo comparten todas las pistas.
export function clipFromJSON(name, data) {
  const tracks = data.tracks.map(([trackName, kind, values, times]) => {
    const keyTimes = times ?? data.times
    return kind === 'q'
      ? new QuaternionKeyframeTrack(trackName, keyTimes, values)
      : new VectorKeyframeTrack(trackName, keyTimes, values)
  })
  return new AnimationClip(name, data.duration, tracks)
}
