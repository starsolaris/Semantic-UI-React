import React from 'react'
import _ from 'lodash'
import { render } from '@testing-library/react'

import { consoleUtil } from 'test/utils'
import {
  classNamePropValueBeforePropName,
  noClassNameFromBoolProps,
  noDefaultClassNameFromProp,
} from './classNameHelpers'
import helpers from './commonHelpers'

/**
 * Assert that a Component prop's name and value are required to create a className.
 * @param {React.Component|Function} Component The component to test.
 * @param {String} propKey A props key.
 * @param {array} propValues Array of possible values of prop.
 * @param {Object} [options={}]
 * @param {Object} [options.requiredProps={}] Props required to render the component.
 * @param {Object} [options.className=propKey] The className to assert exists.
 */
export const propKeyAndValueToClassName = (Component, propKey, propValues, options = {}) => {
  const { assertRequired } = helpers('propKeyAndValueToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    classNamePropValueBeforePropName(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)
    noClassNameFromBoolProps(Component, propKey, propValues, options)
  })
}

/**
 * Assert that only a Component prop's name is converted to className.
 * @param {React.Component|Function} Component The component to test.
 * @param {String} propKey A props key.
 * @param {Object} [options={}]
 * @param {Object} [options.className=propKey] The className to assert exists.
 * @param {boolean|string} [options.defaultValue] The default value for the shorthand prop.
 * @param {Object} [options.requiredProps={}] Props required to render the component.
 * @param {Object} [options.className=propKey] The className to assert exists.
 */
export const propKeyOnlyToClassName = (Component, propKey, options = {}) => {
  const { className = propKey, requiredProps = {} } = options
  const { assertRequired } = helpers('propKeyOnlyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noDefaultClassNameFromProp(Component, propKey, [], options)

    it('adds prop name to className', () => {
      consoleUtil.disableOnce()

      const element = React.createElement(Component, { ...requiredProps, [propKey]: true })
      const { container } = render(element)
      const elementClassName = container.firstChild.className

      expect(elementClassName).include(className)
    })

    it('does not add prop value to className', () => {
      consoleUtil.disableOnce()

      const value = 'foo-bar-baz'
      const element = React.createElement(Component, { ...requiredProps, [propKey]: value })
      const { container } = render(element)

      expect(container.firstChild.className).to.not.include(value)
    })
  })
}

/**
 * Assert that a Component prop name or value convert to a className.
 * @param {React.Component|Function} Component The component to test.
 * @param {String} propKey A props key.
 * @param {array} propValues Array of possible values of prop.
 * @param {Object} [options={}]
 * @param {boolean|string} [options.defaultValue] The default value for the shorthand prop.
 * @param {Object} [options.requiredProps={}] Props required to render the component.
 * @param {Object} [options.className=propKey] The className to assert exists.
 */
export const propKeyOrValueAndKeyToClassName = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {} } = options
  const { assertRequired } = helpers('propKeyOrValueAndKeyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noDefaultClassNameFromProp(Component, propKey, propValues, options)
    classNamePropValueBeforePropName(Component, propKey, propValues, options)

    beforeEach(() => {
      consoleUtil.disableOnce()
    })

    it('adds only the name to className when true', () => {
      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: true }),
      )

      expect(container.firstChild.className).to.include(className)
    })

    it('adds no className when false', () => {
      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: false }),
      )

      expect(container.firstChild.className).to.not.include(className)
      expect(container.firstChild.className).to.not.include('true')
      expect(container.firstChild.className).to.not.include('false')

      _.each(propValues, (propVal) => {
        expect(container.firstChild.className).to.not.include(propVal)
      })
    })
  })
}

/**
 * Assert that only a Component prop's value is converted to className.
 * @param {React.Component|Function} Component The component to test.
 * @param {String} propKey A props key.
 * @param {array} propValues Array of possible props values.
 * @param {Object} [options={}]
 * @param {Object} [options.className=propKey] The className to assert exists.
 * @param {boolean|string} [options.defaultValue] The default value for the shorthand prop.
 * @param {Number} [options.nestingLevel=0] The nesting level of the component.
 * @param {Object} [options.requiredProps={}] Props required to render the component.
 */
export const propValueOnlyToClassName = (Component, propKey, propValues, options = {}) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('propValueOnlyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noClassNameFromBoolProps(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)

    it('adds prop value to className', () => {
      propValues.forEach((propValue) => {
        const { container } = render(
          React.createElement(Component, { ...requiredProps, [propKey]: propValue }),
        )

        expect(container.firstChild.className).to.include(propValue)
      })
    })

    it('does not add prop name to className', () => {
      consoleUtil.disableOnce()

      propValues.forEach((propValue) => {
        const { container } = render(
          React.createElement(Component, { ...requiredProps, [propKey]: propValue }),
        )

        expect(container.firstChild.className).to.not.include(propKey)
      })
    })
  })
}
