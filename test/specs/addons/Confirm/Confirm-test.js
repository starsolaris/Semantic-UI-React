import keyboardKey from 'keyboard-key'
import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Confirm from 'src/addons/Confirm/Confirm'
import Modal from 'src/modules/Modal/Modal'
import { assertBodyContains, domEvent, sandbox } from 'test/utils'
import * as common from 'test/specs/commonTests'

// ----------------------------------------
// Wrapper
// ----------------------------------------
let wrapper

// we need to unmount the modal after every test to remove it from the document
// wrap the render methods to update a global wrapper that is unmounted after each test
const wrapperMount = (...args) => {
  const result = render(...args)
  wrapper = result
  return result
}

describe('Confirm', () => {
  beforeEach(() => {
    wrapper = undefined
    document.body.innerHTML = ''
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) wrapper.unmount()
  })

  common.isConformant(Confirm, { rendersPortal: true })

  common.implementsShorthandProp(Confirm, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: Modal.Header,
    rendersPortal: true,
    mapValueToProps: (content) => ({ content }),
    requiredProps: { open: true },
  })
  common.implementsShorthandProp(Confirm, {
    defaultValue: 'OK',
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: Modal.Content,
    rendersPortal: true,
    mapValueToProps: (content) => ({ content }),
    requiredProps: { open: true },
  })

  describe('children', () => {
    it('renders a Modal', () => {
      const { container } = render(<Confirm />)
      expect(container.querySelector('.ui.modal')).to.exist()
    })
  })

  describe('size', () => {
    it('has "small" size by default', () => {
      const { container } = render(<Confirm />)
      expect(container.querySelector('.ui.modal.small')).to.exist()
    })

    _.forEach(['mini', 'tiny', 'small', 'large', 'fullscreen'], (size) => {
      it(`applies ${size} size`, () => {
        const { container } = render(<Confirm size={size} />)
        expect(container.querySelector(`.ui.modal.${size}`)).to.exist()
      })
    })
  })

  describe('cancelButton', () => {
    it('is "Cancel" by default', () => {
      const { container } = render(<Confirm />)
      const cancelButton = container.querySelector('.ui.button:not(.primary)')
      expect(cancelButton.textContent).to.equal('Cancel')
    })
    it('sets the cancel button text', () => {
      const { container } = render(<Confirm cancelButton='foo' />)
      const cancelButton = container.querySelector('.ui.button:not(.primary)')
      expect(cancelButton.textContent).to.equal('foo')
    })
  })

  describe('confirmButton', () => {
    it('is "OK" by default', () => {
      const { container } = render(<Confirm />)
      const confirmButton = container.querySelector('.ui.button.primary')
      expect(confirmButton.textContent).to.equal('OK')
    })
    it('sets the confirm button text', () => {
      const { container } = render(<Confirm confirmButton='foo' />)
      const confirmButton = container.querySelector('.ui.button.primary')
      expect(confirmButton.textContent).to.equal('foo')
    })
  })

  describe('onCancel', () => {
    let spy

    beforeEach(() => {
      spy = sandbox.spy()
      wrapperMount(<Confirm onCancel={spy} defaultOpen />)
    })

    it('omitted when not defined', () => {
      const { container } = render(<Confirm />)
      const cancelButton = container.querySelector('.ui.button:not(.primary)')
      const click = () => fireEvent.click(cancelButton)

      expect(click).to.not.throw()
    })

    it('is called on Cancel button click', () => {
      const { container } = render(<Confirm onCancel={spy} />)
      const cancelButton = container.querySelector('.ui.button:not(.primary)')
      fireEvent.click(cancelButton)

      spy.should.have.been.calledOnce()
    })

    it('is passed to the Modal onClose prop', () => {
      const func = () => null
      const { container } = render(<Confirm onCancel={func} />)
      expect(container.querySelector('.ui.modal')).to.exist()
    })

    it('is called on dimmer click', () => {
      domEvent.click('.ui.dimmer')
      spy.should.have.been.calledOnce()
    })

    it('is called on click outside of the modal', () => {
      domEvent.click(document.querySelector('.ui.modal').parentNode)
      spy.should.have.been.calledOnce()
    })

    it('is not called on click inside of the modal', () => {
      domEvent.click(document.querySelector('.ui.modal'))
      spy.should.not.have.been.calledOnce()
    })

    it('is not called on body click', () => {
      domEvent.click('body')
      spy.should.not.have.been.calledOnce()
    })

    it('is called when pressing escape', () => {
      domEvent.keyDown(document, { key: 'Escape' })
      spy.should.have.been.calledOnce()
    })

    it('is not called when pressing a key other than "Escape"', () => {
      _.each(keyboardKey, (val, key) => {
        // skip Escape key
        if (val === keyboardKey.Escape) return

        domEvent.keyDown(document, { key })
        spy.should.not.have.been.called(`onClose was called when pressing "${key}"`)
      })
    })

    it('is not called when the open prop changes to false', () => {
      const { rerender } = render(<Confirm onCancel={spy} defaultOpen />)
      rerender(<Confirm onCancel={spy} open={false} />)
      spy.should.not.have.been.called()
    })
  })

  describe('onConfirm', () => {
    it('omitted when not defined', () => {
      const { container } = render(<Confirm />)
      const confirmButton = container.querySelector('.ui.button.primary')
      const click = () => fireEvent.click(confirmButton)

      expect(click).to.not.throw()
    })

    it('is called on OK button click', () => {
      const spy = sandbox.spy()
      const { container } = render(<Confirm onConfirm={spy} />)
      const confirmButton = container.querySelector('.ui.button.primary')
      fireEvent.click(confirmButton)

      spy.should.have.been.calledOnce()
    })
  })

  describe('open', () => {
    it('is not open by default', () => {
      wrapperMount(<Confirm />)
      assertBodyContains('.ui.modal.open', false)
    })

    it('does not show the modal when false', () => {
      wrapperMount(<Confirm open={false} />)
      assertBodyContains('.ui.modal', false)
    })

    it('shows the modal when true', () => {
      wrapperMount(<Confirm open />)
      assertBodyContains('.ui.modal')
    })

    it('shows the modal on changing from false to true', () => {
      const { rerender } = render(<Confirm open={false} />)
      assertBodyContains('.ui.modal', false)

      rerender(<Confirm open />)
      assertBodyContains('.ui.modal')
    })

    it('hides the modal on changing from true to false', () => {
      const { rerender } = render(<Confirm open />)
      assertBodyContains('.ui.modal')

      rerender(<Confirm open={false} />)
      assertBodyContains('.ui.modal', false)
    })
  })
})
