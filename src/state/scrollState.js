// Estado de scroll compartido. Objeto mutable a propósito: lo escribe un listener
// y lo lee la escena en useFrame, sin provocar re-renders de React.
//
// progress: 0..1 sobre el scroll total de la página.
// index:    posición flotante entre secciones (0 = inicio de Home, 1 = inicio de
//           Trabajos, 1.5 = a mitad de camino entre Trabajos y About...).
//           Es lo que usa la cámara para interpolar entre keyframes. En secciones
//           altas (móvil) se queda en el entero mientras se lee y solo avanza durante
//           la última pantalla (ver lib/sectionGeometry.js).
// offset:   píxeles que se ha desplazado el contenido de una sección alta mientras
//           estaba en reposo. La escena los usa para que el 3D se mueva con su hueco.
// section:  id de la sección que ocupa el centro de la pantalla.
export const scrollState = { progress: 0, index: 0, offset: 0, section: 'home' }
