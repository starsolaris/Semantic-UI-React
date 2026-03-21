import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import TransitionablePortal from 'src/addons/TransitionablePortal/TransitionablePortal'
import * as common from 'test/specs/commonTests'
import { domEvent, sandbox, assertWithTimeout } from 'test/utils'

const quickTransition = { duration: 0 }
const requiredProps = {
  children: <div id='children' />,
}

describe('TransitionablePortal', () => {
  common.isConformant(TransitionablePortal, {
    rendersPortal: true,
    requiredProps,
    forwardsRef: false,
  })

  describe('children', () => {
    it('renders a Transition', () => {
      const { container } = render(<TransitionablePortal {...requiredProps} open />)

      expect(container.querySelector('.transition')).to.exist()
    })
  })

  describe('onClose', () => {
    it('is called with (null, data) on a click outside', (done) => {
      const onClose = sandbox.spy()
      const { container, unmount } = render(
        <TransitionablePortal
          {...requiredProps}
          onClose={onClose}
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      const button = container.querySelector('button')
      fireEvent.click(button)
      domEvent.click(document.body)

      assertWithTimeout(() => {
        onClose.should.have.been.calledOnce()
        onClose.should.have.been.calledWithMatch(null, { portalOpen: false })

        unmount()
      }, done)
    })

    it('hides contents on a click outside', () => {
      const { container } = render(<TransitionablePortal {...requiredProps} trigger={<button />} />)

      const button = container.querySelector('button')
      fireEvent.click(button)
      expect(container.querySelector('.in#children')).to.exist()

      domEvent.click(document.body)
      expect(container.querySelector('.out#children')).to.exist()
    })
  })

  describe('onHide', () => {
    it('is called with (null, data) when exiting transition finished', (done) => {
      const onHide = sandbox.spy()
      const { rerender, unmount } = render(
        <TransitionablePortal
          {...requiredProps}
          onHide={onHide}
          open
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      rerender(
        <TransitionablePortal
          {...requiredProps}
          onHide={onHide}
          open={false}
          transition={quickTransition}
          trigger={<button />}
        />,
      )
      assertWithTimeout(() => {
        onHide.should.have.been.calledOnce()
        onHide.should.have.been.calledWithMatch(null, {
          ...quickTransition,
          portalOpen: false,
          transitionVisible: false,
        })

        unmount()
      }, done)
    })
  })

  describe('onOpen', () => {
    it('is called with (null, data) when opens', () => {
      const onOpen = sandbox.spy()
      const { container } = render(
        <TransitionablePortal {...requiredProps} onOpen={onOpen} trigger={<button />} />,
      )

      const button = container.querySelector('button')
      fireEvent.click(button)
      onOpen.should.have.been.calledOnce()
      onOpen.should.have.been.calledWithMatch(null, { portalOpen: true })
    })

    it('renders contents', () => {
      const { container } = render(<TransitionablePortal {...requiredProps} trigger={<button />} />)

      const button = container.querySelector('button')
      fireEvent.click(button)
      expect(container.querySelector('.in#children')).to.exist()
    })
  })

  describe('open', () => {
    it('blocks update of state on a portal close', () => {
      const { container } = render(<TransitionablePortal {...requiredProps} open />)
      expect(container.querySelector('#children').classList.contains('in')).to.be.true()

      domEvent.click(document.body)
      expect(container.querySelector('#children').classList.contains('in')).to.be.true()
    })

    it('passes `open` prop to Transition when defined', () => {
      const { container, rerender } = render(<TransitionablePortal {...requiredProps} />)

      rerender(<TransitionablePortal {...requiredProps} open />)
      expect(container.querySelector('#children').classList.contains('in')).to.be.true()

      rerender(<TransitionablePortal {...requiredProps} open={false} />)
      expect(container.querySelector('#children').classList.contains('out')).to.be.true()
    })

    it('does not pass `open` prop to Transition when not defined', () => {
      const { container } = render(<TransitionablePortal {...requiredProps} />)
      expect(container.querySelector('#children')).to.be.null()

      const { container: container2 } = render(<TransitionablePortal {...requiredProps} transition={{}} />)
      expect(container2.querySelector('#children')).to.be.null()
    })
  })
})
