// Envío del formulario de contacto a Web3Forms (https://web3forms.com).
// No hay backend propio: el servicio recibe los datos y te los reenvía por correo.
//
// La access key es PÚBLICA por diseño (va en el bundle del navegador): solo permite
// enviar mensajes al correo con el que se registró, no leer nada. Está en .env como
// VITE_WEB3FORMS_KEY.
const ENDPOINT = 'https://api.web3forms.com/submit'
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY

// Devuelve { ok: true } o { ok: false, reason }, sin lanzar excepciones: así el
// formulario solo tiene que mirar el resultado.
export async function sendContact({ name, email, message, botcheck = false }) {
  if (!ACCESS_KEY) return { ok: false, reason: 'missing-key' }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `New message from ${name} (portfolio)`,
        from_name: 'Portfolio contact form',
        name,
        email,
        message,
        // Honeypot: Web3Forms descarta el envío si llega marcado (lo rellenan los bots).
        botcheck,
      }),
    })
    const data = await response.json().catch(() => null)
    return data?.success ? { ok: true } : { ok: false, reason: 'rejected' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
