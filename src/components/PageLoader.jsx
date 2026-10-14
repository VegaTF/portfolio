// Indicador discreto mientras se descarga el código de la escena 3D. NO tapa la página:
// el texto y la navegación ya son utilizables. (El indicador siguiente, con el porcentaje
// real de los modelos, vive dentro de la escena y usa drei.) HTML plano: no depende de three.js.
export default function PageLoader() {
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-(--page-fg) px-4 py-1.5 text-sm text-(--page-bg) shadow-lg"
    >
      Loading 3D scene…
    </div>
  )
}
