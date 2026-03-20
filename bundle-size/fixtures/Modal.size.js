import { createRoot } from 'react-dom/client'
import { Modal } from 'semantic-ui-react'
import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  return <Modal trigger={<button>An example</button>}>Some content</Modal>
}

const root = createRoot(document.querySelector('#root'))
root.render(<App />)
