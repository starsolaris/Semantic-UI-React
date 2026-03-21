import React, { createElement } from 'react'
import { render } from '@testing-library/react'

import Button from 'src/elements/Button'
import Icon from 'src/elements/Icon'
import Image from 'src/elements/Image'
import Label from 'src/elements/Label'
import { numberToWord, SUI } from 'src/lib'
import implementsShorthandProp from './implementsShorthandProp'
import { noClassNameFromBoolProps, noDefaultClassNameFromProp } from './classNameHelpers'
import helpers from './commonHelpers'

export const implementsButtonProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'button',
    ShorthandComponent: Button,
    mapValueToProps: (val) => ({ content: val }),
    ...options,
  })
}

export const implementsHTMLIFrameProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'iframe',
    ShorthandComponent: 'iframe',
    mapValueToProps: (src) => ({ src }),
    ...options,
  })
}

export const implementsHTMLInputProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'input',
    ShorthandComponent: 'input',
    mapValueToProps: (val) => ({ type: val }),
    ...options,
  })
}

export const implementsHTMLLabelProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'label',
    ShorthandComponent: 'label',
    mapValueToProps: (val) => ({ children: val }),
    ...options,
  })
}

export const implementsIconProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    assertExactMatch: false,
    propKey: 'icon',
    ShorthandComponent: Icon,
    mapValueToProps: (val) => ({ name: val }),
    ...options,
  })
}

export const implementsImageProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'image',
    ShorthandComponent: Image,
    mapValueToProps: (val) => ({ src: val }),
    ...options,
  })
}

export const implementsLabelProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'label',
    ShorthandComponent: Label,
    mapValueToProps: (val) => ({ content: val }),
    ...options,
  })
}

export const implementsMultipleProp = (Component, propKey, propValues) => {
  const { assertRequired } = helpers('propKeyAndValueToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')

    noDefaultClassNameFromProp(Component, propKey, propValues)
    noClassNameFromBoolProps(Component, propKey, propValues)

    propValues.forEach((propVal) => {
      it(`adds "${propVal} ${propKey}" to className`, () => {
        const { container } = render(createElement(Component, { [propKey]: propVal }))
        expect(container.firstChild.className).to.include(`${propVal} ${propKey}`)
      })
    })

    it('adds all possible values to className', () => {
      const className = propValues.map((prop) => `${prop} ${propKey}`).join(' ')
      const propValue = propValues.join(' ')

      const { container } = render(createElement(Component, { [propKey]: propValue }))
      expect(container.firstChild.className).to.include(className)
    })
  })
}

export const implementsTextAlignProp = (
  Component,
  alignments = SUI.TEXT_ALIGNMENTS,
  options = {},
) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('implementsTextAlignProp', Component)

  describe('aligned (common)', () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, 'textAlign', alignments, options)
    noDefaultClassNameFromProp(Component, 'textAlign', alignments, options)

    alignments.forEach((propVal) => {
      if (propVal === 'justified') {
        it('adds "justified" without "aligned" to className', () => {
          const { container } = render(<Component {...requiredProps} textAlign='justified' />)
          expect(container.firstChild.className).to.include('justified')
          expect(container.firstChild.className).to.not.include('aligned')
        })
      } else {
        it(`adds "${propVal} aligned" to className`, () => {
          const { container } = render(<Component {...requiredProps} textAlign={propVal} />)
          expect(container.firstChild.className).to.include(`${propVal} ${'aligned'}`)
        })
      }
    })
  })
}

export const implementsVerticalAlignProp = (
  Component,
  alignments = SUI.VERTICAL_ALIGNMENTS,
  options = {},
) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('implementsVerticalAlignProp', Component)

  describe('verticalAlign (common)', () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, 'verticalAlign', alignments, options)
    noDefaultClassNameFromProp(Component, 'verticalAlign', alignments, options)

    alignments.forEach((propVal) => {
      it(`adds "${propVal} aligned" to className`, () => {
        const { container } = render(<Component {...requiredProps} verticalAlign={propVal} />)
        expect(container.firstChild).toHaveClass(`${propVal} ${'aligned'}`)
      })
    })
  })
}

export const implementsWidthProp = (Component, widths = SUI.WIDTHS, options = {}) => {
  const { canEqual = true, propKey, requiredProps, widthClass } = options
  const { assertRequired } = helpers('implementsWidthProp', Component)
  const propValues = canEqual ? [...widths, 'equal'] : widths

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)

    it('adds numberToWord value to className', () => {
      widths.forEach((width) => {
        const expectClass = widthClass
          ? `${numberToWord(width)} ${widthClass}`
          : numberToWord(width)

        const { container } = render(
          createElement(Component, { ...requiredProps, [propKey]: width }),
        )
        expect(container.firstChild.className).to.include(expectClass)
      })
    })

    if (canEqual) {
      it('adds "equal width" to className', () => {
        const { container } = render(
          createElement(Component, { ...requiredProps, [propKey]: 'equal' }),
        )
        expect(container.firstChild.className).to.include('equal width')
      })
    }
  })
}

export const labelImplementsHtmlForProp = (Component, options = {}) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('labelImplementsHtmlForProp', Component)

  describe('htmlFor (common)', () => {
    assertRequired(Component, 'a `Component`')

    it('adds htmlFor to label', () => {
      const id = 'id-for-test'
      const label = 'label-for-test'

      const { container } = render(<Component {...requiredProps} id={id} label={label} />)
      const labelNode = container.querySelector('label')
      const idElement = container.querySelector(`#${id}`)

      expect(idElement).to.exist
      expect(labelNode).to.have.attribute('htmlFor', id)
    })
  })
}
