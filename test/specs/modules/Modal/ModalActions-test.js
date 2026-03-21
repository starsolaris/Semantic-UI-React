import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import ModalActions from 'src/modules/Modal/ModalActions'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('ModalActions', () => {
  common.isConformant(ModalActions)
  common.forwardsRef(ModalActions)
  common.forwardsRef(ModalActions, { requiredProps: { children: <span /> } })
  common.rendersChildren(ModalActions)

  common.implementsCreateMethod(ModalActions)

  const actions = [
    { key: 'cancel', content: 'Cancel', 'data-foo': 'something' },
    { key: 'ok', content: 'OK', 'data-foo': 'something' },
  ]

  describe('actions', () => {
    it('renders children', () => {
      const { container } = render(<ModalActions actions={actions} />)
      const buttons = container.querySelectorAll('button')

      expect(buttons[0].textContent).to.include('Cancel')
      expect(buttons[1].textContent).to.include('OK')
    })

    it('passes arbitrary props', () => {
      const { container } = render(<ModalActions actions={actions} />)
      const buttons = container.querySelectorAll('button')

      buttons.forEach((button) => {
        expect(button.getAttribute('data-foo')).to.equal('something')
      })
    })
  })

  describe('onActionClick', () => {
    it('can be omitted', () => {
      const { container } = render(<ModalActions actions={actions} />)
      const button = container.querySelector('button')

      expect(() => fireEvent.click(button)).to.not.throw()
    })

    it('is called with (e, actionProps) when clicked', () => {
      const event = { target: null }
      const onActionClick = sandbox.spy()
      const onButtonClick = sandbox.spy()

      const action = { key: 'users', content: 'Disable', onClick: onButtonClick }
      const matchProps = { content: 'Disable' }

      const { container } = render(<ModalActions actions={[...actions, action]} onActionClick={onActionClick} />)
      const buttons = container.querySelectorAll('button')
      const lastButton = buttons[buttons.length - 1]

      fireEvent.click(lastButton, event)

      onActionClick.should.have.been.calledOnce()
      onActionClick.should.have.been.calledWithMatch(event, matchProps)
      onButtonClick.should.have.been.calledOnce()
      onButtonClick.should.have.been.calledWithMatch(event, matchProps)
    })
  })
})
