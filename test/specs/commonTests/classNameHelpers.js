import _ from 'lodash'
import React from 'react'
import { render } from '@testing-library/react'

import { consoleUtil } from 'test/utils'

export const classNamePropValueBeforePropName = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {} } = options

  propValues.forEach((propVal) => {
    it(`adds "${propVal} ${className}" to className`, () => {
      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: propVal }),
      )
      const elementClassName = container.firstChild.className

      expect(elementClassName).include(`${propVal} ${className}`)
    })
  })
}

export const noClassNameFromBoolProps = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {} } = options

  _.each([true, false], (bool) =>
    it(`does not add any className when ${bool}`, () => {
      consoleUtil.disableOnce()

      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: bool }),
      )

      expect(container.firstChild.className).to.not.include(className)
      expect(container.firstChild.className).to.not.include('true')
      expect(container.firstChild.className).to.not.include('false')

      propValues.forEach((propVal) =>
        expect(container.firstChild.className).to.not.include(propVal.toString()),
      )
    }),
  )
}

export const noDefaultClassNameFromProp = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {}, defaultValue } = options

  // required props may include a prop that creates a className
  // if so, we cannot assert that it doesn't exist by default because it is required to exist
  // skip assertions for required props
  if (defaultValue) return
  if (propKey in requiredProps) return

  it('is not included in className when not defined', () => {
    consoleUtil.disableOnce()
    const { container } = render(<Component {...requiredProps} />)

    expect(container.firstChild.className).to.not.include(className)

    // ensure that none of the prop option values are in className
    // SUI classes ought to be built up using a declarative component API
    propValues.forEach((propValue) =>
      expect(container.firstChild.className).to.not.include(propValue.toString()),
    )
  })
}
