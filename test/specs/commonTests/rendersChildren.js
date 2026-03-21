import faker from 'faker'
import React, { createElement } from 'react'
import { render } from '@testing-library/react'

import helpers from './commonHelpers'

/**
 * Assert a component renders children somewhere in the tree.
 * @param {React.Component|Function} Component A component that should render children.
 * @param {Object} [options={}]
 * @param {Number} [options.nestingLevel=0] The nesting level of the component.
 * @param {Object} [options.rendersContent] Assert that component also renders `content` prop.
 * @param {Object} [options.requiredProps={}] Props required to render the component.
 */
export default (Component, options = {}) => {
  const { rendersContent = true, requiredProps = {} } = options
  const { assertRequired } = helpers('rendersChildren', Component)

  assertRequired(Component, 'a `Component`')

  describe('children (common)', () => {
    it('renders child text', () => {
      const text = faker.hacker.phrase()
      const { container } = render(createElement(Component, requiredProps, text))

      expect(container.textContent).to.include(text)
    })

    it('renders child components', () => {
      const child = <div data-child={faker.hacker.noun()} />
      const { container } = render(createElement(Component, requiredProps, child))

      expect(container.querySelector(`[data-child]`)).to.exist
    })

    it('renders child number with 0 value', () => {
      const { container } = render(createElement(Component, requiredProps, 0))

      expect(container).toHaveTextContent('0')
    })
  })

  if (rendersContent) {
    describe('content (common)', () => {
      it('renders child text', () => {
        const text = faker.hacker.phrase()
        const { container } = render(createElement(Component, { ...requiredProps, content: text }))

        expect(container.textContent).to.include(text)
      })

      it('renders child components', () => {
        const child = <div data-child={faker.hacker.noun()} />
        const { container } = render(createElement(Component, { ...requiredProps, content: child }))

        expect(container.querySelector(`[data-child]`)).to.exist
      })

      it('renders child number with 0 value', () => {
        const { container } = render(createElement(Component, { ...requiredProps, content: 0 }))

        expect(container).toHaveTextContent('0')
      })
    })
  }
}
