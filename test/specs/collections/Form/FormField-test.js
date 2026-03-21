import faker from 'faker'
import React from 'react'
import { render } from '@testing-library/react'

import Radio from 'src/addons/Radio/Radio'
import Label from 'src/elements/Label/Label'
import FormField from 'src/collections/Form/FormField'
import { SUI } from 'src/lib'
import Button from 'src/elements/Button/Button'
import Checkbox from 'src/modules/Checkbox/Checkbox'
import * as common from 'test/specs/commonTests'

describe('FormField', () => {
  common.isConformant(FormField)
  common.rendersChildren(FormField)

  // No Control
  common.forwardsRef(FormField)
  common.forwardsRef(FormField, {
    tagName: 'div',
    requiredProps: {
      children: <input />,
    },
  })

  // HTML Checkbox/Radio Control
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: 'input', type: 'radio' },
  })
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: 'input', type: 'checkbox' },
  })

  // Checkbox/Radio Control
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: Checkbox },
  })
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: Radio },
  })

  // Other Control
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: 'input' },
  })

  common.implementsHTMLLabelProp(FormField, { autoGenerateKey: false })
  common.implementsWidthProp(FormField, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'width',
  })

  common.propKeyOnlyToClassName(FormField, 'disabled')
  common.propKeyOnlyToClassName(FormField, 'error')
  common.propKeyOnlyToClassName(FormField, 'inline')
  common.propKeyOnlyToClassName(FormField, 'required', {
    requiredProps: { label: '' },
  })

  describe('control', () => {
    it('adds an HTML element child of the same type', () => {
      const controls = ['button', 'input', 'select', 'textarea']

      controls.forEach((control) => {
        const { container } = render(<FormField control={control} />)
        expect(container.querySelector(control)).toBeTruthy()
      })
    })
  })

  describe('error', () => {
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { label: faker.lorem.word() },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: 'radio' },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: Checkbox },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: 'input' },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })

    it('positioned in DOM according to passed "pointing" prop', () => {
      ;[
        { pointing: 'below', inDom: 'before' },
        { pointing: 'right', inDom: 'before' },
        { pointing: 'left', inDom: 'after' },
        { pointing: 'above', inDom: 'after' },
      ].forEach(({ pointing, inDom }) => {
        const { container } = render(
          <FormField
            control='input'
            error={{ content: faker.lorem.word(), pointing }}
            type='text'
          />,
        )

        const field = container.firstChild
        const labelElement = field.querySelector('.ui.label')
        const inputElement = field.querySelector('input')

        if (inDom === 'before') {
          expect(labelElement.nextSibling).toBe(inputElement)
        } else {
          expect(inputElement.nextSibling).toBe(labelElement)
        }
      })
    })
  })

  describe('label', () => {
    it('wraps html checkbox inputs', () => {
      const text = faker.hacker.phrase()
      const { container } = render(<FormField control='input' label={text} type='checkbox' />)
      const label = container.querySelector('label')

      expect(label.querySelector('input')).toBeTruthy()
      expect(label.textContent).toContain(text)
    })

    it('wraps html radio inputs', () => {
      const text = faker.hacker.phrase()
      const { container } = render(<FormField control='input' label={text} type='radio' />)
      const label = container.querySelector('label')

      expect(label.querySelector('input')).toBeTruthy()
      expect(label.textContent).toContain(text)
    })

    it('is passed to Checkbox controls', () => {
      const text = faker.hacker.phrase()
      const { container } = render(<FormField control={Checkbox} label={text} />)
      const checkbox = container.querySelector('.ui.checkbox')

      expect(checkbox.textContent).toContain(text)
    })

    it('is passed to Radio controls', () => {
      const text = faker.hacker.phrase()
      const { container } = render(<FormField control={Radio} label={text} />)
      const radio = container.querySelector('.ui.radio.checkbox')

      expect(radio.textContent).toContain(text)
    })

    it('is sibling to text inputs', () => {
      const text = faker.hacker.phrase()
      const { container } = render(<FormField control='input' label={text} type='text' />)

      const labelElement = container.querySelector('label')
      const inputElement = container.querySelector('input')

      expect(labelElement.textContent).toContain(text)
      expect(inputElement).toBeTruthy()
    })
  })

  describe('disabled', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control='input' />)
      const input = container.querySelector('input')

      expect(input).toBeTruthy()
      expect(input.hasAttribute('disabled')).toBe(false)
    })
    it('is passed to the control', () => {
      const { container } = render(<FormField control='input' disabled />)
      const input = container.querySelector('input')

      expect(input).toBeTruthy()
      expect(input.hasAttribute('disabled')).toBe(true)
    })
  })

  describe('required', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control='input' />)
      const input = container.querySelector('input')

      expect(input).toBeTruthy()
      expect(input.hasAttribute('required')).toBe(false)
    })
    it('is passed to the control', () => {
      const { container } = render(<FormField control='input' required />)
      const input = container.querySelector('input')

      expect(input).toBeTruthy()
      expect(input.hasAttribute('required')).toBe(true)
    })
  })

  describe('content', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control={Button} />)
      const button = container.querySelector('button')

      expect(button).toBeTruthy()
      expect(button.textContent).toBe('')
    })
    it('is passed to the control', () => {
      const { container } = render(<FormField control={Button} content='Click Me' />)
      const button = container.querySelector('button')

      expect(button).toBeTruthy()
      expect(button.textContent).toBe('Click Me')
    })
  })

  describe('id', () => {
    it('is set when content is provided', () => {
      const { container } = render(<FormField content='content' id='testId' />)
      expect(container.firstChild.getAttribute('id')).toBe('testId')
    })
    it('is set when have child elements', () => {
      const { container } = render(
        <FormField id='testId'>
          <input />
        </FormField>,
      )
      expect(container.firstChild.getAttribute('id')).toBe('testId')
    })
  })

  describe('aria-invalid', () => {
    it('is not set by default', () => {
      const { container } = render(<FormField control='input' />)
      const input = container.querySelector('input')
      expect(input.hasAttribute('aria-invalid')).toBe(false)
    })
    it('is not set when error is false', () => {
      const { container } = render(<FormField control='input' error={false} />)
      const input = container.querySelector('input')
      expect(input.hasAttribute('aria-invalid')).toBe(false)
    })
    it('is set when error is true', () => {
      const { container } = render(<FormField control='input' error />)
      const input = container.querySelector('input')
      expect(input.getAttribute('aria-invalid')).toBe('true')
    })
    it('is is set when error object is provided', () => {
      const { container } = render(
        <FormField
          control='input'
          error={{
            content: 'Error message',
            pointing: 'left',
          }}
        />,
      )
      const input = container.querySelector('input')
      expect(input.getAttribute('aria-invalid')).toBe('true')
    })
  })
})
