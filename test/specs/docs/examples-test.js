import * as React from 'react'
import { render } from '@testing-library/react'
import { consoleUtil } from 'test/utils'

const exampleModules = import.meta.glob('/docs/src/examples/**/*Example*.js', { eager: true })
const allowedRecoverableExamples = new Set([
  'DropdownExampleImage.js',
  'DropdownExampleMultipleSearchInMenu.js',
])
let wrapper

describe('examples', () => {
  afterEach(async () => {
    if (wrapper?.unmount) {
      await React.act(async () => {
        wrapper.unmount()
        await Promise.resolve()
      })
    }

    wrapper = undefined
  })

  Object.entries(exampleModules).forEach(([path, module]) => {
    const filename = path.replace(/^.*\/(\w+\.js)$/, '$1')

    it(`${filename} renders without console activity`, async () => {
      const Component = module.default

      if (allowedRecoverableExamples.has(filename)) {
        consoleUtil.disableOnce()
      }

      await React.act(async () => {
        wrapper = render(React.createElement(Component))
        await Promise.resolve()
      })

      expect(wrapper.container.innerHTML).to.not.equal('')
    })
  })
})
