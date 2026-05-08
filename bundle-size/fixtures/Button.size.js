import { createRoot } from 'react-dom/client'
import { Button } from 'semantic-ui-react'
import React from 'react'

function App() {
  return <Button>A sample button</Button>
}

const root = createRoot(document.querySelector('#root'))
root.render(<App />)
