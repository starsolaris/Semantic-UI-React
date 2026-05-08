import { render } from '@testing-library/react'
import React from 'react'
import { createPortal } from 'react-dom'

function TestPortal({ children }) {
  return createPortal(children, document.body)
}

function TestComponent() {
  return (
    <TestPortal>
      <div className='test-portal'>Hello</div>
    </TestPortal>
  )
}

describe('Test Portal', () => {
  it('should render portal to document.body', () => {
    render(<TestComponent />)
    expect(document.querySelector('.test-portal')).to.not.be.null()
  })
})
