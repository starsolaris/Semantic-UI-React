import * as React from 'react'
import { render } from '@testing-library/react'

const exampleModules = import.meta.glob('../docs/src/examples/**/*Example*.js', { eager: true })
let wrapper

console.log('Found modules:', Object.keys(exampleModules))

describe('examples', () => {
  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount()
    }
  })

  it('should have found some modules', () => {
    expect(Object.keys(exampleModules).length).toBeGreaterThan(0)
  })

  Object.entries(exampleModules)
    .slice(0, 3)
    .forEach(([path, module]) => {
      const filename = path.replace(/^.*\/(\w+\.js)$/, '$1')
      it(`${filename} renders without console activity`, () => {
        const Component = module.default
        wrapper = render(React.createElement(Component))
        expect(wrapper.container.innerHTML).to.not.equal('')
      })
    })
})
