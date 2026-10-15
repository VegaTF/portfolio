import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Euler, FileLoader, MathUtils, Quaternion, Vector3 } from 'three'
import { clipFromJSON } from '../lib/clipFromJSON'
import { HEAD_LOOK, avatarAlignment } from '../config/avatarAlignment'
import {
  AVATAR_HIDDEN,
  AVATAR_KEYS,
  AVATAR_WINDOWS,
  CLIP_FADES,
  CONTACT_ENTRY_HEIGHT,
  CONTACT_FALL,
  DEFAULT_CLIP_FADE,
  LAND_AT,
  SIT_UNTIL,
  ease,
  sectionBlend,
} from '../config/choreography'
import { mouseState } from '../state/mouseState'
import { scrollState } from '../state/scrollState'

// BASE_URL respeta el `base` de Vite ('/portfolio/' en GitHub Pages).
const BASE = import.meta.env.BASE_URL
const AVATAR_URL = `${BASE}models/avatar.glb`
// Animaciones de Mixamo ya convertidas a JSON compacto (scripts/convert-animations.mjs):
// ~110 KB en total y sin parser FBX, frente a ~1 MB y mucho CPU con los .fbx.
const CLIP_URLS = {
  sitting: `${BASE}animations/sitting.json`,
  falling: `${BASE}animations/falling.json`,
  breathing: `${BASE}animations/breathing.json`,
}
const asJSON = (loader) => loader.setResponseType('json')
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Reutilizados en cada frame para no crear objetos nuevos (evita basura en el GC).
const lookEuler = new Euler(0, 0, 0, 'YXZ')
const lookQuat = new Quaternion()
const tmpCamera = new Vector3()
const tmpHead = new Vector3()
const lookState = new WeakMap() // hueso → { base, left, applied }

// Suma un giro encima de la pose animada. Si el mixer no ha escrito el hueso en este frame
// (acción parada, delta 0, pestaña en segundo plano), el hueso aún conserva nuestro giro
// anterior: multiplicar otra vez lo acumularía y el cuello giraría sin parar. Por eso se
// parte siempre de la pose base.
function applyLook(bone, pitch, yaw) {
  if (!bone) return
  let s = lookState.get(bone)
  if (!s) {
    s = { base: new Quaternion(), left: new Quaternion(), applied: false }
    lookState.set(bone, s)
  }
  if (s.applied && bone.quaternion.equals(s.left)) bone.quaternion.copy(s.base)
  else s.base.copy(bone.quaternion)
  lookEuler.set(pitch, yaw, 0)
  lookQuat.setFromEuler(lookEuler)
  bone.quaternion.multiply(lookQuat)
  s.left.copy(bone.quaternion)
  s.applied = true
}

// Animación que toca según el scroll: sentado → cayendo → de pie, y otra vez
// cayendo al entrar en la habitación de Contacto.
function phaseFor(index) {
  if (index < SIT_UNTIL) return 'sitting'
  if (index < LAND_AT) return 'falling'
  if (index >= CONTACT_FALL[0] && index < CONTACT_FALL[1]) return 'falling'
  return 'breathing'
}

export default function Avatar() {
  const groupRef = useRef()
  const { scene } = useGLTF(AVATAR_URL)
  // useLoader suspende y cachea por URL, igual que useGLTF.
  const sittingData = useLoader(FileLoader, CLIP_URLS.sitting, asJSON)
  const fallingData = useLoader(FileLoader, CLIP_URLS.falling, asJSON)
  const breathingData = useLoader(FileLoader, CLIP_URLS.breathing, asJSON)

  const clips = useMemo(
    () => [
      clipFromJSON('sitting', sittingData),
      clipFromJSON('falling', fallingData),
      clipFromJSON('breathing', breathingData),
    ],
    [sittingData, fallingData, breathingData],
  )

  // El mixer actualiza los huesos en su propio useFrame, registrado ANTES que el
  // nuestro de abajo: así la cabeza se orienta después de la animación.
  const { actions } = useAnimations(clips, groupRef)

  // Sombras y huesos de la cabeza. El avatar nunca usa transparencias: al ser una malla
  // abierta se vería su cara interior (cuencas de los ojos, parte trasera de la cabeza).
  const rig = useMemo(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
      // Con pose animada la caja envolvente calculada puede quedarse corta.
      child.frustumCulled = false
    })

    return {
      head: scene.getObjectByName('Head'),
      neck: scene.getObjectByName('Neck'),
    }
  }, [scene])

  const current = useRef(null) // animación que suena ahora
  const offset = useRef({ x: 0, y: 0, z: 0, yaw: 0 }) // alineación suavizada
  const look = useRef({ yaw: 0, pitch: 0 })

  // Arranca sentado, sin fundido.
  useEffect(() => {
    const first = actions.sitting
    if (!first) return
    first.reset().play()
    current.current = 'sitting'
    return () => {
      first.stop()
      current.current = null
    }
  }, [actions])

  useFrame(({ camera }, delta) => {
    const group = groupRef.current
    if (!group) return

    const index = scrollState.index

    // 1) Animación: mezcla suave (y corta) al cambiar de fase.
    const phase = phaseFor(index)
    if (current.current && phase !== current.current && actions[phase]) {
      const next = actions[phase]
      const previous = actions[current.current]
      const fade = CLIP_FADES[`${current.current}>${phase}`] ?? DEFAULT_CLIP_FADE
      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(fade).play()
      previous?.fadeOut(fade)
      current.current = phase
    }

    // 2) Posición y giro. Hasta About se interpolan entre keyframes con las ventanas
    //    del avatar; después se queda en el hueco del retrato (sale de cuadro cuando la
    //    cámara sube) y, ya oculto, entra cayendo en la habitación.
    const [stand, room] = [AVATAR_KEYS[2], AVATAR_KEYS[3]]
    let px
    let py
    let pz
    let yaw
    if (index < 2) {
      const { from, to, t } = sectionBlend(index, 3, AVATAR_WINDOWS)
      const a = AVATAR_KEYS[from]
      const b = AVATAR_KEYS[to]
      px = MathUtils.lerp(a.position[0], b.position[0], t)
      py = MathUtils.lerp(a.position[1], b.position[1], t)
      pz = MathUtils.lerp(a.position[2], b.position[2], t)
      yaw = MathUtils.lerp(a.yaw, b.yaw, t)
    } else if (index < CONTACT_FALL[0]) {
      ;[px, py, pz] = stand.position
      yaw = stand.yaw
    } else {
      // Caída hacia el suelo de la habitación, con aterrizaje suave.
      const u = ease((index - CONTACT_FALL[0]) / (CONTACT_FALL[1] - CONTACT_FALL[0]))
      px = room.position[0]
      py = MathUtils.lerp(room.position[1] + CONTACT_ENTRY_HEIGHT, room.position[1], u)
      pz = room.position[2]
      yaw = room.yaw
    }

    const align = avatarAlignment[phase]
    const o = offset.current
    o.x = MathUtils.damp(o.x, align.position[0], 4, delta)
    o.y = MathUtils.damp(o.y, align.position[1], 4, delta)
    o.z = MathUtils.damp(o.z, align.position[2], 4, delta)
    o.yaw = MathUtils.damp(o.yaw, align.rotationY, 4, delta)
    group.position.set(px + o.x, py + o.y, pz + o.z)
    group.rotation.y = yaw + o.yaw

    // 3) Oculto mientras está fuera de la vista entre el retrato y Contacto.
    group.visible = !(index > AVATAR_HIDDEN[0] && index < AVATAR_HIDDEN[1])

    // 4) Cabeza: mira a la cámara y se desvía hacia donde esté el ratón.
    const { head, neck } = rig
    if (!head) return
    group.updateWorldMatrix(true, false)
    group.worldToLocal(tmpCamera.copy(camera.position))
    head.getWorldPosition(tmpHead)
    group.worldToLocal(tmpHead)

    const toCameraYaw = Math.atan2(tmpCamera.x, tmpCamera.z)
    const horizontal = Math.hypot(tmpCamera.x, tmpCamera.z)
    // Ángulo positivo = cabeza hacia abajo; si la cámara está más arriba, mira arriba.
    const toCameraPitch = -Math.atan2(tmpCamera.y - tmpHead.y, horizontal)

    const mouseYaw = prefersReducedMotion ? 0 : mouseState.x * HEAD_LOOK.maxYaw
    const mousePitch = prefersReducedMotion ? 0 : -mouseState.y * HEAD_LOOK.maxPitch
    const targetYaw = MathUtils.clamp(
      toCameraYaw + mouseYaw,
      -HEAD_LOOK.limitYaw,
      HEAD_LOOK.limitYaw,
    )
    const targetPitch = MathUtils.clamp(
      toCameraPitch + mousePitch,
      -HEAD_LOOK.limitPitch,
      HEAD_LOOK.limitPitch,
    )

    look.current.yaw = MathUtils.damp(look.current.yaw, targetYaw, HEAD_LOOK.damping, delta)
    look.current.pitch = MathUtils.damp(look.current.pitch, targetPitch, HEAD_LOOK.damping, delta)

    // Reparto cuello / cabeza para que se vea natural.
    applyLook(neck, look.current.pitch * HEAD_LOOK.neckShare, look.current.yaw * HEAD_LOOK.neckShare)
    const headShare = 1 - HEAD_LOOK.neckShare
    applyLook(head, look.current.pitch * headShare, look.current.yaw * headShare)
  })

  return (
    <group ref={groupRef} position={AVATAR_KEYS[0].position}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(AVATAR_URL)
Object.values(CLIP_URLS).forEach((url) => useLoader.preload(FileLoader, url, asJSON))
