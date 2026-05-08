import * as React from 'react'
import * as ReactIs from 'react-is'
import { render } from '@testing-library/react'

import { sandbox } from 'test/utils'

/**
 * Assert a Component correctly implements a shorthand create method.
 * @param {React.ElementType} Component The component to test
 * @param {{ isMemoized?: Boolean, requiredProps?: Object, tagName?: string, renderWithWrapper?: Function }} options
 */
export default function forwardsRef(Component, options = {}) {
  describe('forwardsRef', () => {
    const {
      isMemoized = false,
      requiredProps = {},
      tagName = 'div',
      renderWithWrapper = (element) => render(element),
    } = options
    const RootComponent = isMemoized ? Component.type : Component

    it('is produced by React.forwardRef() call', () => {
      expect(ReactIs.isForwardRef(<RootComponent {...requiredProps} />)).to.equal(true)
    })

    it('a render function is anonymous', () => {
      const innerFunctionName = RootComponent.render.name
      expect(['', Component.displayName, RootComponent.displayName, RootComponent.name]).to.include(
        innerFunctionName,
      )
    })

    it(`forwards ref to "${tagName}"`, () => {
      const ref = sandbox.spy()

      renderWithWrapper(<Component {...requiredProps} ref={ref} />)

      expect(ref).toHaveBeenCalledTimes(1)
      const callArgs = ref.mock ? ref.mock.calls[0][0] : ref.firstCall.args[0]
      expect(callArgs.tagName).to.equal(tagName.toUpperCase())
    })
  })
}
