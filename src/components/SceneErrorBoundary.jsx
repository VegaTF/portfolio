import { Component } from 'react'

// Si algo del 3D falla (modelo que no carga, contexto WebGL que no se puede crear...),
// la página sigue funcionando sin él en lugar de quedarse en blanco.
export default class SceneErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('The 3D scene could not be rendered:', error)
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
