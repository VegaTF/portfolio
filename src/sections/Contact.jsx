import { useState } from 'react'
import { sendContact } from '../lib/sendContact'

const FIELD =
  'mt-1.5 w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-base short:mt-1 short:py-1.5 placeholder:text-white/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-peach) aria-[invalid=true]:border-(--color-peach)'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Devuelve un objeto { campo: 'mensaje' } solo con los campos que fallan.
function validate({ name, email, message }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Please enter your name.'
  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Please enter a valid email address.'
  if (message.trim().length < 5) errors.message = 'Please write a short message (5+ characters).'
  return errors
}

// Mensaje visible en cada estado del envío.
const STATUS_TEXT = {
  sending: 'Sending…',
  success: 'Message sent. Thank you, I will get back to you soon.',
  error: 'Something went wrong and your message was not sent. Please try again.',
}

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-sm text-(--color-peach)">
      {message}
    </p>
  )
}

// Formulario de contacto: valida en cliente y envía por Web3Forms (ver lib/sendContact.js).
// Estados: idle → sending → success | error.
export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const update = (field) => (event) => {
    const value = event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    // Al corregir un campo, su error desaparece sin esperar al siguiente envío.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (status === 'success' || status === 'error') setStatus('idle')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    // El honeypot es un campo oculto: una persona nunca lo rellena.
    const honeypot = new FormData(event.currentTarget).get('botcheck') === 'on'

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Foco en el primer campo con error, para teclado y lectores de pantalla.
      const first = ['name', 'email', 'message'].find((field) => found[field])
      document.getElementById(`contact-${first}`)?.focus()
      return
    }

    setStatus('sending')
    const result = await sendContact({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      botcheck: honeypot,
    })

    if (result.ok) {
      setValues({ name: '', email: '', message: '' })
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  const sending = status === 'sending'

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
            el mensaje ocupa las dos, para que todo quepa sin scroll. `noValidate`: los
            errores los muestra nuestra validación, con textos propios y accesibles. */}
        <form
          noValidate
          className="mt-5 space-y-4 short:mt-2 short:grid short:grid-cols-2 short:gap-x-3 short:gap-y-2 short:space-y-0"
          onSubmit={handleSubmit}
        >
          {/* Honeypot: fuera de la vista, del foco y de los lectores de pantalla. */}
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] size-px opacity-0"
          />

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
              value={values.name}
              onChange={update('name')}
              disabled={sending}
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              className={FIELD}
            />
            <FieldError id="contact-name-error" message={errors.name} />
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
              value={values.email}
              onChange={update('email')}
              disabled={sending}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              className={FIELD}
            />
            <FieldError id="contact-email-error" message={errors.email} />
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
              value={values.message}
              onChange={update('message')}
              disabled={sending}
              aria-invalid={errors.message ? 'true' : undefined}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className={`${FIELD} short:h-14`}
            />
            <FieldError id="contact-message-error" message={errors.message} />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-11 w-full short:col-span-2 short:h-10 items-center justify-center rounded-full bg-(--page-fg) px-6 text-base font-medium text-(--page-bg) transition duration-300 hover:bg-(--color-peach) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-peach) disabled:cursor-wait disabled:opacity-70"
          >
            {sending ? 'Sending…' : 'Send message'}
          </button>

          {/* aria-live: los lectores de pantalla anuncian el resultado del envío. */}
          <p
            role={status === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`min-h-5 text-center text-sm short:col-span-2 short:min-h-0 ${
              status === 'error' ? 'text-(--color-peach)' : 'opacity-90'
            }`}
          >
            {STATUS_TEXT[status] ?? ''}
          </p>
        </form>
      </div>
    </section>
  )
}
