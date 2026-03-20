import { createRoot } from 'react-dom/client'
import { Image } from 'semantic-ui-react'
import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  return <Image src='image.jpg' />
}

const root = createRoot(document.querySelector('#root'))
root.render(<App />)
