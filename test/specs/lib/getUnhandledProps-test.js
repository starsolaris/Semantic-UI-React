import React from 'react'
import { render } from '@testing-library/react'
import { getUnhandledProps } from 'src/lib'

// We spread the unhandled props onto the rendered result.
// Then, we can test the props of the rendered result.
// This is the intended usage of the util.
function TestComponent(props) {
  return <div {...getUnhandledProps(TestComponent, props)} />
}

describe('getUnhandledProps', () => {
  it('removes the proprietary childKey prop', () => {
    const { container } = render(<TestComponent childKey={1} />)
    const element = container.firstChild
    expect(element.getAttribute('childKey')).to.be.null()
  })

  it('leaves props that are not defined in handledProps', () => {
    const { container } = render(<TestComponent data-leave-this='it is unhandled' />)
    const element = container.firstChild
    expect(element.getAttribute('data-leave-this')).to.equal('it is unhandled')
  })

  it('removes props defined in handledProps', () => {
    TestComponent.handledProps = ['data-remove-me']
    const { container } = render(<TestComponent data-remove-me='it is handled' />)
    const element = container.firstChild
    expect(element.getAttribute('data-remove-me')).to.be.null()
  })
})
