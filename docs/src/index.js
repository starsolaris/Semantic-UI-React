import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

import App from './App'

export default App

if (typeof document !== 'undefined') {
  const rootNode = document.getElementById('root')
  const root = module.hot ? createRoot(rootNode) : null
  const render = (Component) => {
    if (root) {
      root.render(<Component />)
      return
    }

    hydrateRoot(rootNode, <Component />)
  }

  render(App)
}
