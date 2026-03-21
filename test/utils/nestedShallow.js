import { render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'

const getNestedElement = (container, autoNesting, nestingLevel) => {
  let element = container.firstChild

  if (autoNesting && element) {
    element = element.firstChild || element
  }

  _.times(nestingLevel, () => {
    element = element?.firstChild || element
  })

  return element
}

const nestedShallow = (node, options = {}) => {
  const { autoNesting = false, nestingLevel = 0, ...rest } = options

  const { container } = render(node)
  return getNestedElement(container, autoNesting, nestingLevel)
}

export default nestedShallow
