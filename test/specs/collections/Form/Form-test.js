import faker from 'faker'
import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Form from 'src/collections/Form/Form'
import FormButton from 'src/collections/Form/FormButton'
import FormCheckbox from 'src/collections/Form/FormCheckbox'
import FormDropdown from 'src/collections/Form/FormDropdown'
import FormField from 'src/collections/Form/FormField'
import FormGroup from 'src/collections/Form/FormGroup'
import FormInput from 'src/collections/Form/FormInput'
import FormRadio from 'src/collections/Form/FormRadio'
import FormSelect from 'src/collections/Form/FormSelect'
import FormTextArea from 'src/collections/Form/FormTextArea'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { consoleUtil, sandbox } from 'test/utils'

describe('Form', () => {
  common.isConformant(Form)
  common.hasSubcomponents(Form, [
    FormButton,
    FormCheckbox,
    FormDropdown,
    FormField,
    FormTextArea,
    FormGroup,
    FormInput,
    FormRadio,
    FormSelect,
  ])
  common.hasUIClassName(Form)
  common.rendersChildren(Form, {
    rendersContent: false,
  })

  common.forwardsRef(Form, {
    tagName: 'form',
    requiredProps: { children: <input /> },
  })
  common.implementsWidthProp(Form, [], {
    propKey: 'widths',
  })

  common.propKeyOnlyToClassName(Form, 'error')
  common.propKeyOnlyToClassName(Form, 'inverted')
  common.propKeyOnlyToClassName(Form, 'loading')
  common.propKeyOnlyToClassName(Form, 'reply')
  common.propKeyOnlyToClassName(Form, 'success')
  common.propKeyOnlyToClassName(Form, 'unstackable')
  common.propKeyOnlyToClassName(Form, 'warning')

  common.propValueOnlyToClassName(Form, 'size', _.without(SUI.SIZES, 'medium'))

  describe('action', () => {
    it('is not set by default', () => {
      const { container } = render(<Form />)
      expect(container.firstChild.hasAttribute('action')).toBe(false)
    })

    it('applied when defined', () => {
      const action = faker.internet.url()
      const { container } = render(<Form action={action} />)
      expect(container.firstChild.getAttribute('action')).toBe(action)
    })
  })

  describe('onSubmit', () => {
    it('prevents default on the event when there is no action', () => {
      // Heads up!
      // In this test we pass some invalid values to verify correct work.
      consoleUtil.disableOnce()

      const preventDefault = sandbox.spy()
      const event = { preventDefault }

      const { container: c1 } = render(<Form />)
      const { container: c2 } = render(<Form action={false} />)
      const { container: c3 } = render(<Form action={null} />)

      fireEvent.submit(c1.firstChild, event)
      fireEvent.submit(c2.firstChild, event)
      fireEvent.submit(c3.firstChild, event)

      expect(preventDefault).toHaveBeenCalledTimes(3)
    })

    it('does not prevent default on the event when there is an action', () => {
      const preventDefault = sandbox.spy()
      const event = { preventDefault }

      const { container: c1 } = render(<Form action='do not prevent default!' />)
      const { container: c2 } = render(<Form action='' />)

      fireEvent.submit(c1.firstChild, event)
      fireEvent.submit(c2.firstChild, event)

      expect(preventDefault).not.toHaveBeenCalled()
    })

    it('is called with (e, props) on submit', () => {
      const onSubmit = sandbox.spy()
      const event = { name: 'foo' }
      const props = { 'data-bar': 'baz' }

      const { container } = render(<Form {...props} onSubmit={onSubmit} />)
      fireEvent.submit(container.firstChild, event)

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining(event), props)
    })

    it('passes all args to onSubmit', () => {
      const onSubmit = sandbox.spy()
      const props = { 'data-baz': 'baz' }
      const event = { fake: 'event' }
      const args = ['some', 'extra', 'args']

      const { container } = render(<Form {...props} onSubmit={onSubmit} />)
      fireEvent.submit(container.firstChild, event)

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining(event), props)
    })
  })
})
