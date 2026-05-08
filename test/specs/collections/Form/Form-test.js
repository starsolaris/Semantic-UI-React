import faker from 'faker'
import _ from 'lodash'
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
    const createSubmitEvent = (preventDefault = sandbox.spy()) => {
      const event = new Event('submit', { bubbles: true, cancelable: true })
      event.preventDefault = preventDefault

      return { event, preventDefault }
    }

    it('prevents default on the event when there is no action', () => {
      // Heads up!
      // In this test we pass some invalid values to verify correct work.
      consoleUtil.disableOnce()

      const submitEvent1 = createSubmitEvent()
      const submitEvent2 = createSubmitEvent()
      const submitEvent3 = createSubmitEvent()

      const { container: c1 } = render(<Form />)
      const { container: c2 } = render(<Form action={false} />)
      const { container: c3 } = render(<Form action={null} />)

      fireEvent(c1.firstChild, submitEvent1.event)
      fireEvent(c2.firstChild, submitEvent2.event)
      fireEvent(c3.firstChild, submitEvent3.event)

      expect(submitEvent1.preventDefault).toHaveBeenCalledOnce()
      expect(submitEvent2.preventDefault).toHaveBeenCalledOnce()
      expect(submitEvent3.preventDefault).toHaveBeenCalledOnce()
    })

    it('does not prevent default on the event when there is an action', () => {
      const submitEvent1 = createSubmitEvent()
      const submitEvent2 = createSubmitEvent()

      const { container: c1 } = render(<Form action='do not prevent default!' />)
      const { container: c2 } = render(<Form action='' />)

      fireEvent(c1.firstChild, submitEvent1.event)
      fireEvent(c2.firstChild, submitEvent2.event)

      expect(submitEvent1.event.defaultPrevented).toBe(false)
      expect(submitEvent2.event.defaultPrevented).toBe(false)
    })

    it('is called with (e, props) on submit', () => {
      const onSubmit = sandbox.spy()
      const props = { 'data-bar': 'baz' }

      const { container } = render(<Form {...props} onSubmit={onSubmit} />)
      fireEvent.submit(container.firstChild)

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'submit' }),
        expect.objectContaining(props),
      )
    })

    it('passes all args to onSubmit', () => {
      const onSubmit = sandbox.spy()
      const props = { 'data-baz': 'baz' }

      const { container } = render(<Form {...props} onSubmit={onSubmit} />)
      fireEvent.submit(container.firstChild)

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'submit' }),
        expect.objectContaining(props),
      )
    })
  })
})
