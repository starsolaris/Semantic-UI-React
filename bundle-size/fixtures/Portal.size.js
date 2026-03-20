import { createRoot } from 'react-dom/client'
import { Portal } from 'semantic-ui-react'
import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  return <Portal trigger={<button>A button</button>}>Some content</Portal>
}

const root = createRoot(document.querySelector('#root'))
root.render(<App />)
