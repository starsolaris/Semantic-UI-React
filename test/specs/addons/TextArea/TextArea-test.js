import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import TextArea from 'src/addons/TextArea/TextArea'
import { sandbox } from 'test/utils'
import * as common from 'test/specs/commonTests'

// ----------------------------------------
// Wrapper
// ----------------------------------------
// we need to unmount the dropdown after every test to ensure all event listeners are cleaned up
// wrap the render methods to update a global wrapper that is unmounted after each test
let wrapper
const wrapperMount = (element, opts) => {
  const result = render(element, opts)
  wrapper = result
  return result
}

describe('TextArea', () => {
  beforeEach(() => {
    wrapper = undefined
    document.body.innerHTML = ''
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) wrapper.unmount()
  })

  common.isConformant(TextArea)
  common.forwardsRef(TextArea, { tagName: 'textarea' })

  describe('focus', () => {
    it('can be set via a ref', () => {
      const ref = React.createRef()

      wrapperMount(<TextArea ref={ref} />)
      const element = document.querySelector('textarea')

      ref.current.focus()
      expect(document.activeElement).to.equal(element)
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', () => {
      const onChange = sandbox.spy()
      const e = { target: { value: 'name' } }
      const props = { 'data-foo': 'bar', onChange }

      const { container } = render(<TextArea {...props} />)
      const textarea = container.querySelector('textarea')
      fireEvent.change(textarea, e)

      onChange.should.have.been.calledOnce()
      onChange.should.have.been.calledWithMatch(e, { ...props, value: e.target.value })
    })
  })

  describe('onInput', () => {
    it('is called with (e, data) on input', () => {
      const onInput = sandbox.spy()
      const e = { target: { value: 'name' } }
      const props = { 'data-foo': 'bar', onInput }

      const { container } = render(<TextArea {...props} />)
      const textarea = container.querySelector('textarea')
      fireEvent.input(textarea, e)

      onInput.should.have.been.calledOnce()
      onInput.should.have.been.calledWithMatch(e, { ...props, value: e.target.value })
    })
  })

  describe('rows', () => {
    it('has default value', () => {
      const { container } = render(<TextArea />)
      const textarea = container.querySelector('textarea')
      expect(textarea.rows).to.equal(3)
    })

    it('sets prop', () => {
      const { container } = render(<TextArea rows={1} />)
      const textarea = container.querySelector('textarea')
      expect(textarea.rows).to.equal(1)
    })
  })
})
