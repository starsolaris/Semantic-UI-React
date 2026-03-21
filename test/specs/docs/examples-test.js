import * as React from 'react'
import { render } from '@testing-library/react'

const exampleModules = import.meta.glob('/docs/src/examples/**/*Example*.js', { eager: true })
let wrapper

describe('examples', () => {
  afterEach(() => {
    wrapper.unmount()
  })

  Object.entries(exampleModules).forEach(([path, module]) => {
    const filename = path.replace(/^.*\/(\w+\.js)$/, '$1')

    it(`${filename} renders without console activity`, () => {
      const Component = module.default

      wrapper = render(React.createElement(Component))
      expect(wrapper.container.innerHTML).to.not.equal('')
    })
  })
})
