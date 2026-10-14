// Huecos del HTML donde debe verse el render 3D de cada sección.
// La cámara (CameraRig.jsx) encuadra el avatar / la habitación sobre estos elementos.
export const HOME_RENDER_SLOT_ID = 'home-render-slot'
export const WORKS_AVATAR_SLOT_ID = 'works-avatar-slot'
export const ABOUT_PORTRAIT_SLOT_ID = 'about-portrait-slot'

// Orden de las secciones de la página. El id debe coincidir con el id del <section>.
export const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]
