import { useState } from 'react'

const FIELD =
  'mt-1.5 w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-base short:mt-1 short:py-1.5 placeholder:text-white/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-peach)'

// Formulario básico: la maquetación y el estilo ya están; el envío se conecta después.
export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    // Altura exacta de la pantalla: la card queda centrada en ella y el footer
    // (otra sección, debajo) no se ve hasta que se hace scroll.
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative flex h-svh min-h-[34rem] items-center justify-center px-6 pt-14 md:px-10 min-[1200px]:pt-0 short:min-h-0 short:pt-12"
    >
      {/* Card blanquecina de baja opacidad: el render se ve desenfocado detrás.
          backdrop-brightness oscurece lo que hay detrás para que el texto claro
          mantenga buen contraste sobre él. */}
      <div className="w-full max-w-lg rounded-3xl border border-white/25 bg-white/10 p-6 shadow-2xl backdrop-blur-lg backdrop-brightness-50 md:p-8 short:max-w-3xl short:p-4 md:short:p-4">
        <h2
          id="contact-title"
          className="text-center text-4xl font-semibold short:text-2xl"
        >
          Contact
        </h2>
        <p className="mt-2 text-center text-sm opacity-90 short:hidden">
          Let&apos;s talk about how we can work together.
        </p>

        {/* En pantallas bajas el formulario se reparte en dos columnas (nombre | email) y
            el mensaje ocupa las dos, para que todo quepa sin scroll. */}
        <form
          className="mt-5 space-y-4 short:mt-2 short:grid short:grid-cols-2 short:gap-x-3 short:gap-y-2 short:space-y-0"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="contact-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your name"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@email.com"
              className={FIELD}
            />
          </div>
          <div className="short:col-span-2">
            <label htmlFor="contact-message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={3}
              required
              placeholder="Write your message"
              className={`${FIELD} short:h-14`}
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 w-full short:col-span-2 short:h-10 items-center justify-center rounded-full bg-(--page-fg) px-6 text-base font-medium text-(--page-bg) transition duration-300 hover:bg-(--color-peach) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-peach)"
          >
            Send message
          </button>

          <p role="status" className="min-h-5 text-center text-sm opacity-90 short:col-span-2 short:min-h-0">
            {submitted && 'Sending is not connected yet: it will be enabled in the next step.'}
          </p>
        </form>
      </div>
    </section>
  )
}
