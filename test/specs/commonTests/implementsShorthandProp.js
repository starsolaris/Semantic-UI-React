import _ from 'lodash'
import React from 'react'
import ReactIs from 'react-is'
import { render } from '@testing-library/react'

import { createShorthand } from 'src/lib'
import { consoleUtil, getComponentName } from 'test/utils'
import { noDefaultClassNameFromProp } from './classNameHelpers'
import helpers from './commonHelpers'

const shorthandComponentName = (ShorthandComponent) => {
  if (typeof ShorthandComponent === 'string') {
    return ShorthandComponent
  }

  return getComponentName(ShorthandComponent)
}

/**
 * Assert that a Component correctly implements a shorthand prop.
 *
 * @param {function} Component The component to test.
 * @param {object} options
 * @param {string} options.propKey The name of the shorthand prop.
 * @param {string|function} options.ShorthandComponent The component that should be rendered from the shorthand value.
 * @param {boolean} [options.alwaysPresent] Whether or not the shorthand exists by default.
 * @param {boolean} [options.assertExactMatch] Selects an assertion method, `contain` will be used if true.
 * @param {boolean} [options.autoGenerateKey=false] Whether or not automatic key generation is
 *   allowed for the shorthand component.
 * @param {function} options.mapValueToProps A function that maps a primitive value to the Component props.
 * @param {Boolean} [options.parentIsFragment=false] A flag that shows the type of the Component to test.
 * @param {Object} [options.requiredProps={}] Props required to render the component.
 * @param {boolean} [options.rendersPortal=false] Does this component render a Portal powered component?
 * @param {boolean|string} [options.defaultValue] The default value for the shorthand prop.
 * @param {Object} [options.shorthandDefaultProps] Default props for the shorthand component.
 * @param {Object} [options.shorthandOverrideProps] Override props for the shorthand component.
 */
export default (Component, options = {}) => {
  const {
    alwaysPresent,
    defaultValue,
    assertExactMatch = true,
    autoGenerateKey = true,
    mapValueToProps,
    parentIsFragment = false,
    rendersPortal = false,
    propKey,
    shorthandDefaultProps = {},
    shorthandOverrideProps = {},
    requiredProps = {},
  } = options
  const { assertRequired } = helpers('implementsShorthandProp', Component)

  // Heads up!
  // Enzyme does handle properly React.memo() in find and always returns inner component
  // That's why we should unwrap it, otherwise "wrapper.find(Component)" is not equal to "Component" 💥
  const ShorthandComponent =
    options.ShorthandComponent.$$typeof === ReactIs.Memo
      ? options.ShorthandComponent.type
      : options.ShorthandComponent

  describe(`${propKey} shorthand prop (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(_.isPlainObject(options), 'an `options` object')
    assertRequired(propKey, 'a `propKey`')
    assertRequired(ShorthandComponent, 'a `ShorthandComponent`')

    const name = shorthandComponentName(ShorthandComponent)
    const assertValidShorthand = (value) => {
      const expectedShorthandElement = createShorthand(ShorthandComponent, mapValueToProps, value, {
        defaultProps: shorthandDefaultProps,
        overrideProps: shorthandOverrideProps,
        autoGenerateKey,
      })
      const { container, unmount } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: value }),
      )

      const selector =
        typeof ShorthandComponent === 'string'
          ? ShorthandComponent.toLowerCase()
          : `[data-testid="${name}"], .${name.toLowerCase()}, .ui.${name.toLowerCase()}`

      const result = container.querySelector(selector) || container.firstChild

      expect(result).to.exist

      unmount()
    }

    if (alwaysPresent) {
      it(`has default ${name} when not defined`, () => {
        const { container, unmount } = render(React.createElement(Component, requiredProps))
        const selector =
          typeof ShorthandComponent === 'string'
            ? ShorthandComponent.toLowerCase()
            : `[data-testid="${name}"], .${name.toLowerCase()}, .ui.${name.toLowerCase()}`

        expect(container.querySelector(selector) || container.firstChild).to.exist
        unmount()
      })
    } else {
      if (!parentIsFragment && !rendersPortal) {
        noDefaultClassNameFromProp(Component, propKey, [], options)
      }

      if (!defaultValue) {
        it(`has no ${name} when not defined`, () => {
          const { container, unmount } = render(React.createElement(Component, requiredProps))
          const selector =
            typeof ShorthandComponent === 'string'
              ? ShorthandComponent.toLowerCase()
              : `[data-testid="${name}"], .${name.toLowerCase()}, .ui.${name.toLowerCase()}`

          const result = container.querySelector(selector)
          expect(result).to.not.exist
          unmount()
        })
      }
    }

    if (!alwaysPresent && !defaultValue) {
      it(`has no ${name} when null`, () => {
        const element = React.createElement(Component, { ...requiredProps, [propKey]: null })
        const { container, unmount } = render(element)
        const selector =
          typeof ShorthandComponent === 'string'
            ? ShorthandComponent.toLowerCase()
            : `[data-testid="${name}"], .${name.toLowerCase()}, .ui.${name.toLowerCase()}`

        const result = container.querySelector(selector)
        expect(result).toBeFalsy()
        unmount()
      })
    }

    it(`renders a ${name} from strings`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand('string')
    })

    it(`renders a ${name} from numbers`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand(123)
    })

    // the Input maps shorthand to `type`
    // React uses the default prop ('text') in place of type={0}
    if (propKey !== 'input') {
      it(`renders a ${name} from number 0`, () => {
        consoleUtil.disableOnce()
        assertValidShorthand(0)
      })
    }

    it(`renders a ${name} from a props object`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand(mapValueToProps('foo'))
    })

    it(`renders a ${name} from elements`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand(<ShorthandComponent />)
    })
  })
}
