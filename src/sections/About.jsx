import { ABOUT_PORTRAIT_SLOT_ID } from '../config/sections'
import { SOCIALS } from '../config/socials'
import SocialButton from '../components/ui/SocialButton'
import { SOCIAL_ICONS } from '../components/ui/SocialIcons'

export default function About() {
  return (
    // pt-20: deja sitio a la barra superior en tablet/móvil.
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative flex min-h-svh items-center px-6 pt-[3.75rem] pb-4 sm:pt-20 sm:pb-12 md:px-10 md:py-16 min-[1200px]:pl-24 short:pt-14 short:pb-4"
    >
      {/* Bloque centrado: contenido a la izquierda y retrato circular grande a la derecha.
          `short:` = pantalla baja (móvil en horizontal): dos columnas aunque falte ancho.
          Los tamaños dependen también del alto (svh) para que el retrato no se coma la
          pantalla en móviles bajos. */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-16 short:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] short:gap-8">
        {/* Hueco del retrato: el canvas se recorta en círculo sobre él (ver SceneFrame.jsx
            y CameraRig.jsx). Es solo reserva de espacio; el aro lo dibuja SceneFrame. */}
        <div className="flex justify-center md:order-2 short:order-2">
          <div
            id={ABOUT_PORTRAIT_SLOT_ID}
            className="aspect-square w-full max-w-[min(17rem,24svh)] rounded-full sm:max-w-[min(17rem,32svh)] md:max-w-[min(28rem,60svh)] short:max-w-[min(18rem,68svh)]"
          />
        </div>

        <div className="md:order-1 short:order-1">
          <h2
            id="about-title"
            className="text-4xl font-semibold sm:text-5xl short:text-3xl"
          >
            About
          </h2>

          <p className="mt-3 text-[clamp(0.8125rem,2.3svh,1rem)] leading-normal sm:mt-6 sm:text-lg sm:leading-relaxed short:mt-2 short:text-[13px] short:leading-snug">
            Full-Stack Web Developer in training with a main focus on Front-End. I have a hybrid
            profile that combines development, web architecture and visual design, bringing an
            aesthetic eye to the interface together with a solid technical foundation in software
            logic and IT infrastructure. Day to day, I build custom websites and integrate AI
            agents (Claude Code) into my workflow to iterate fast, audit code quality and deliver
            clean, accessible and maintainable components.
          </p>

          <ul aria-label="Social links" className="mt-4 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4 short:mt-3">
            {SOCIALS.map(({ id, label, href }) => {
              const Icon = SOCIAL_ICONS[id]
              return (
                <li key={id}>
                  <SocialButton href={href} label={label} icon={<Icon />} />
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
