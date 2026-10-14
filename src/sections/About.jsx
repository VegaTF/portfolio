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
      className="relative flex min-h-svh items-center px-6 pt-20 pb-12 md:px-10 md:py-16"
    >
      {/* Bloque centrado: contenido a la izquierda y retrato circular grande a la derecha. */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* Hueco del retrato: el canvas se recorta en círculo sobre él (ver SceneFrame.jsx
            y CameraRig.jsx). Es solo reserva de espacio; el aro lo dibuja SceneFrame. */}
        <div className="flex justify-center md:order-2">
          <div
            id={ABOUT_PORTRAIT_SLOT_ID}
            className="aspect-square w-full max-w-[17rem] rounded-full md:max-w-[28rem]"
          />
        </div>

        <div className="md:order-1">
          <h2 id="about-title" className="text-5xl font-semibold">
            About
          </h2>

          <p className="mt-6 text-lg leading-relaxed">
            Full-Stack Web Developer in training with a main focus on Front-End. I have a hybrid
            profile that combines development, web architecture and visual design, bringing an
            aesthetic eye to the interface together with a solid technical foundation in software
            logic and IT infrastructure. Day to day, I build custom websites and integrate AI
            agents (Claude Code) into my workflow to iterate fast, audit code quality and deliver
            clean, accessible and maintainable components.
          </p>

          <ul aria-label="Social links" className="mt-8 flex flex-wrap items-center gap-4">
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
