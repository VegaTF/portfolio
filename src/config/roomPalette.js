// Colores de room.glb por pieza (nodo) y nombre de material.
// El modelo no trae texturas y casi todo comparte "Material.001", por eso
// se colorea por nodo + material. Los materiales que no aparecen aquí
// (p.ej. las pantallas emisivas Material.006 / Material.014) se dejan como vienen.
//
// Nodos del modelo: cover (alfombra), divan (sofá), kamod (estantería),
// kartini (cuadros), okna (ventanas), steni (paredes y suelo),
// stol (mesa), stolik (mesita).

export const HIDDEN_NODES = ['okna'] // las ventanas atraviesan la habitación

export const roomPalette = {
  cover: { 'Material.004': '#f2a6d8' }, // alfombra: fucsia pastel
  divan: {
    'Material.001': '#9cc7ff', // cuerpo del sofá: azul pastel
    'Material.002': '#bcd9ff',
    'Material.003': '#ffb38a', // cojines: naranja pastel
  },
  kamod: {
    'Material.001': '#8f7a68', // estantes: nogal grisáceo
    'Material.002': '#bcd9ff',
    'Material.004': '#bcd9ff',
    'Material.003': '#ffb38a',
    'Material.007': '#ffb38a',
  },
  kartini: {
    'Material.001': '#4d4946', // marcos
    'Material.008': '#f2a6d8', // cuadro 1
    'Material.009': '#ffb38a', // cuadro 2
  },
  steni: {
    'Material.001': '#efe6dc', // paredes
    'Material.003': '#b6ada6',
    'Material.012': '#f1cdb4', // suelo
  },
  stol: {
    'Material.012': '#4d4946',
    'Material.013': '#a68c74', // mesa: madera media
  },
  stolik: {
    'Material.012': '#bcd9ff',
    'Material.013': '#b8a28c', // mesita: madera algo más clara
  },
}
