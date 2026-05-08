import { createRoot } from 'react-dom/client'
import { Icon } from 'semantic-ui-react'
import React from 'react'

function App() {
  return <Icon name='book' />
}

const root = createRoot(document.querySelector('#root'))
root.render(<App />)
