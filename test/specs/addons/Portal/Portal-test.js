import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import { domEvent, sandbox } from 'test/utils'
import Portal from 'src/addons/Portal/Portal'
import PortalInner from 'src/addons/Portal/PortalInner'
import wait from 'test/utils/wait'

let wrapper

const createHandlingComponent = (eventName) =>
  class HandlingComponent extends React.Component {
    handleEvent = (e) => this.props.handler(e, this.props)

    render() {
      const buttonProps = { [eventName]: this.handleEvent }

      return <button {...buttonProps} />
    }
  }

const wrapperMount = (node, opts) => {
  wrapper = render(node, opts)
  return wrapper
}

describe('Portal', () => {
  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      try {
        wrapper.unmount()
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  })

  common.hasSubcomponents(Portal, [PortalInner])
  common.hasValidTypings(Portal, { forwardsRef: false })

  it('propTypes.children should be required', () => {
    Portal.propTypes.children.should.equal(PropTypes.node.isRequired)
  })

  it('does not call this.setState() if portal is unmounted', () => {
    wrapperMount(
      <Portal open>
        <p />
      </Portal>,
    )

    wrapper.unmount()
  })

  describe('open', () => {
    it('opens the portal when toggled from false to true', () => {
      const { rerender, container } = wrapperMount(
        <Portal open={false}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      rerender(
        <Portal open>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })

    it('closes the portal when toggled from true to false ', () => {
      const { rerender, container } = wrapperMount(
        <Portal open>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      rerender(
        <Portal open={false}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })
  })

  describe('onMount', () => {
    it('called when portal opens', () => {
      const props = { open: false, onMount: sandbox.spy() }
      const { rerender } = wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal {...props} open>
          <p />
        </Portal>,
      )
      props.onMount.should.have.been.calledOnce()
    })

    it('is not called when portal receives props', () => {
      const props = { open: false, onMount: sandbox.spy() }
      const { rerender } = wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal {...props} open className='old'>
          <p />
        </Portal>,
      )
      props.onMount.should.have.been.calledOnce()

      rerender(
        <Portal {...props} open className='new'>
          <p />
        </Portal>,
      )
      props.onMount.should.have.been.calledOnce()
    })
  })

  describe('onUnmount', () => {
    it('is called when portal closes', () => {
      const props = { open: true, onUnmount: sandbox.spy() }
      const { rerender } = wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal {...props} open={false}>
          <p />
        </Portal>,
      )
      props.onUnmount.should.have.been.calledOnce()
    })

    it('is not called when portal receives props', () => {
      const props = { open: true, onUnmount: sandbox.spy() }
      const { rerender } = wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      rerender(
        <Portal {...props} open={false} className='old'>
          <p />
        </Portal>,
      )
      props.onUnmount.should.have.been.calledOnce()

      rerender(
        <Portal {...props} open={false} className='new'>
          <p />
        </Portal>,
      )
      props.onUnmount.should.have.been.calledOnce()
    })

    it('is called only once when portal closes and then is unmounted', () => {
      const onUnmount = sandbox.spy()
      const { rerender, unmount } = wrapperMount(
        <Portal onUnmount={onUnmount} open>
          <p />
        </Portal>,
      )

      rerender(
        <Portal onUnmount={onUnmount} open={false}>
          <p />
        </Portal>,
      )
      act(() => {
        unmount()
      })
      onUnmount.should.have.been.calledOnce()
    })

    it('is called only once when directly unmounting', () => {
      const onUnmount = sandbox.spy()
      const { unmount } = wrapperMount(
        <Portal onUnmount={onUnmount} open>
          <p />
        </Portal>,
      )

      act(() => {
        unmount()
      })
      onUnmount.should.have.been.calledOnce()
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const onOpen = sandbox.spy()
      wrapperMount(
        <Portal onOpen={onOpen} trigger={<div id='trigger' />}>
          <p />
        </Portal>,
      )

      fireEvent.click(document.querySelector('#trigger'))
      onOpen.should.have.been.calledOnce()
      onOpen.should.have.been.calledWithMatch({}, { open: true })
    })
  })

  describe('onClose', () => {
    it('is called on body click', () => {
      const onClose = sandbox.spy()
      wrapperMount(
        <Portal defaultOpen onClose={onClose} trigger={<div />}>
          <p />
        </Portal>,
      )

      domEvent.click(document.body)
      onClose.should.have.been.called()
      onClose.should.have.been.calledWithMatch({}, { open: false })
    })
  })

  describe('trigger', () => {
    it('renders null when not set', () => {
      const { container } = wrapperMount(
        <Portal>
          <p />
        </Portal>,
      )

      expect(container.innerHTML).to.equal('')
    })

    it('renders the trigger when set', () => {
      const text = 'open by click on me'
      const trigger = <button>{text}</button>
      const { container } = wrapperMount(
        <Portal trigger={trigger}>
          <p />
        </Portal>,
      )

      expect(container.textContent).to.equal(text)
    })

    _.forEach(['onBlur', 'onClick', 'onFocus', 'onMouseLeave', 'onMouseEnter'], (handlerName) => {
      it(`handles ${handlerName} on trigger and passes all arguments`, () => {
        const event = { target: null }
        const handler = sandbox.spy()
        const Trigger = createHandlingComponent(handlerName)
        const trigger = <Trigger color='blue' handler={handler} />

        wrapperMount(
          <Portal trigger={trigger}>
            <p />
          </Portal>,
        )

        const eventType = _.toLower(handlerName.substring(2))
        fireEvent[eventType](document.querySelector('button'), event)

        handler.should.have.been.calledOnce()
        handler.should.have.been.calledWithMatch(event, {
          handler,
          color: 'blue',
        })
      })
    })
  })

  describe('triggerRef', () => {
    it('calls itself and an original ref', () => {
      const elementRef = React.createRef()
      const triggerRef = React.createRef()

      const { container } = wrapperMount(
        <Portal trigger={<div id='trigger' ref={elementRef} />} triggerRef={triggerRef}>
          <p />
        </Portal>,
      )
      const element = container.firstChild

      expect(element.tagName).to.equal('DIV')

      expect(elementRef.current).to.equal(element)
      expect(triggerRef.current).to.equal(element)
    })
  })

  describe('mountNode', () => {
    it('passed to PortalInner', () => {
      const mountNode = document.createElement('div')
      wrapperMount(
        <Portal mountNode={mountNode} open>
          <p />
        </Portal>,
      )

      expect(mountNode.querySelector('p')).to.not.be.null()
    })
  })

  describe('openOnTriggerClick', () => {
    it('defaults to true', () => {
      const onTriggerClick = sandbox.spy()
      const trigger = <button onClick={onTriggerClick}>button</button>

      const { container } = wrapperMount(
        <Portal trigger={trigger}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      fireEvent.click(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
      onTriggerClick.should.have.been.calledOnce()
    })

    it('does not open the portal on trigger click when false', () => {
      const spy = sandbox.spy()
      const trigger = <button onClick={spy}>button</button>

      const { container } = wrapperMount(
        <Portal trigger={trigger} openOnTriggerClick={false}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      fireEvent.click(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
      spy.should.have.been.calledOnce()
    })

    it('opens the portal on trigger click when true', () => {
      const spy = sandbox.spy()
      const trigger = <button onClick={spy}>button</button>

      const { container } = wrapperMount(
        <Portal trigger={trigger} openOnTriggerClick>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      fireEvent.click(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
      spy.should.have.been.calledOnce()
    })
  })

  describe('closeOnTriggerClick', () => {
    it('does not close the portal on click', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.click(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })

    it('closes the portal on click when set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerClick>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.click(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })
  })

  describe('openOnTriggerMouseEnter', () => {
    it('does not open the portal on mouseenter when not set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      fireEvent.mouseEnter(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })

    it('opens the portal on mouseenter when set', (done) => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={0}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      fireEvent.mouseEnter(container.querySelector('button'))
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

        done()
      }, 1)
    })

    /**
     * e--l--d--v
     * ^: mouseenter
     *    ^: BEFORE_DELAY: mouseleave
     *       ^: expected DELAY
     *          ^: final validation
     */
    it('does not open the portal when leave before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      const { container } = wrapperMount(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={DELAY}>
          <p />
        </Portal>,
      )

      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
      fireEvent.mouseEnter(container.querySelector('button'))

      await wait(BEFORE_DELAY)

      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
      fireEvent.mouseLeave(container.querySelector('button'))

      await wait(DELAY)

      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })
  })

  describe('closeOnTriggerMouseLeave', () => {
    it('does not close the portal on mouseleave when not set', (done) => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.mouseLeave(container.querySelector('button'))
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

        done()
      }, 1)
    })

    it('closes the portal on mouseleave when set', (done) => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={0}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.mouseLeave(container.querySelector('button'))
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

        done()
      }, 1)
    })

    /**
     * e--l--e--d--v
     * ^: mouseenter
     *    ^: mouseleave
     *       ^: BEFORE_DELAY: reenter
     *          ^: expected DELAY
     *             ^: final validation
     */
    it('does not close the portal when reenter before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      const { container } = wrapperMount(
        <Portal
          trigger={<button />}
          openOnTriggerMouseEnter
          closeOnTriggerMouseLeave
          mouseLeaveDelay={DELAY}
        >
          <p />
        </Portal>,
      )

      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
      fireEvent.mouseEnter(container.querySelector('button'))

      await wait(BEFORE_DELAY)

      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
      fireEvent.mouseLeave(container.querySelector('button'))

      await wait(BEFORE_DELAY)

      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
      fireEvent.mouseEnter(container.querySelector('button'))

      await wait(DELAY)

      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })
  })

  describe('closeOnPortalMouseLeave', () => {
    it('does not close the portal on mouseleave of portal when not set', (done) => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.mouseLeave('#inner')
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

        done()
      }, 1)
    })

    it('closes the portal on mouseleave of portal when set', (done) => {
      const { container } = wrapperMount(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.mouseLeave('#inner')
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

        done()
      }, 1)
    })

    it("does not close the portal on mouseleave triggered by the portal's children", (done) => {
      const { container } = wrapperMount(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <div>
            <p id='child' />
          </div>
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.mouseLeave('#child')
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

        done()
      }, 1)
    })
  })

  describe('closeOnTriggerMouseLeave + closeOnPortalMouseLeave', () => {
    it('closes the portal on trigger mouseleave even when portal receives mouseenter within limit', (done) => {
      const delay = 10
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={delay}>
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.mouseLeave(container.querySelector('button'))

      // Fire a mouseEnter on the portal within the time limit
      setTimeout(() => {
        domEvent.mouseEnter('#inner')
      }, delay - 1)

      // The portal should close because closeOnPortalMouseLeave not set
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

        done()
      }, delay + 1)
    })

    it('does not close the portal on trigger mouseleave when portal receives mouseenter within limit', (done) => {
      const delay = 10
      const { container } = wrapperMount(
        <Portal
          trigger={<button />}
          defaultOpen
          closeOnTriggerMouseLeave
          closeOnPortalMouseLeave
          mouseLeaveDelay={delay}
        >
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.mouseLeave(container.querySelector('button'))

      // Fire a mouseEnter on the portal within the time limit
      setTimeout(() => {
        domEvent.mouseEnter('#inner')
      }, delay - 1)

      // The portal should not have closed
      setTimeout(() => {
        expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

        done()
      }, delay + 1)
    })
  })

  describe('openOnTriggerFocus', () => {
    it('does not open the portal on focus when not set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />}>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      fireEvent.focus(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })

    it('opens the portal on focus when set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} openOnTriggerFocus>
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()

      fireEvent.focus(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })
  })

  describe('closeOnTriggerBlur', () => {
    it('does not close the portal on blur when not set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.blur(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })

    it('closes the portal on blur when set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerBlur>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      fireEvent.blur(container.querySelector('button'))
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })
  })

  describe('closeOnEscape', () => {
    it('closes the portal on escape', () => {
      const { container } = wrapperMount(
        <Portal closeOnEscape defaultOpen>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.keyDown(document, { key: 'Escape' })
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })

    it('does not close the portal on escape when false', () => {
      const { container } = wrapperMount(
        <Portal closeOnEscape={false} defaultOpen>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.keyDown(document, { key: 'Escape' })
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })
  })

  describe('closeOnDocumentClick', () => {
    it('closes the portal on document click', () => {
      const { container } = wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.click(document)
      expect(container.querySelector('[data-react-portal-inner]')).to.be.null()
    })

    it('does not close on click inside', () => {
      const { container } = wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.click('#inner')
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })

    it('does not close on mousedown inside and mouseup outside', () => {
      const { container } = wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()

      domEvent.mouseDown('#inner')
      domEvent.click(document)
      expect(container.querySelector('[data-react-portal-inner]')).to.not.be.null()
    })
  })

  // Heads Up!
  // Portals used to take focus on mount and restore focus to the original activeElement on unMount.
  // One by one, these auto set/remove focus features were removed and the assertions negated.
  // Leave these tests here to ensure we aren't ever stealing focus.
  describe('focus', () => {
    it('does not take focus onMount', (done) => {
      wrapperMount(
        <Portal defaultOpen>
          <p id='inner' />
        </Portal>,
      )

      setTimeout(() => {
        document.activeElement.should.not.equal(document.getElementById('inner'))

        done()
      }, 0)
    })

    it('does not take focus on unMount', (done) => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      document.activeElement.should.equal(input)

      const { rerender, unmount } = wrapperMount(
        <Portal open>
          <p />
        </Portal>,
      )
      document.activeElement.should.equal(input)

      setTimeout(() => {
        document.activeElement.should.equal(input)

        rerender(
          <Portal open={false}>
            <p />
          </Portal>,
        )
        unmount()

        document.activeElement.should.equal(input)

        document.body.removeChild(input)
        done()
      }, 0)
    })

    it('does not take focus on re-render', (done) => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      document.activeElement.should.equal(input)

      const { rerender } = wrapperMount(
        <Portal defaultOpen>
          <p />
        </Portal>,
      )
      document.activeElement.should.equal(input)

      setTimeout(() => {
        document.activeElement.should.equal(input)

        rerender(
          <Portal defaultOpen>
            <p />
          </Portal>,
        )
        document.activeElement.should.equal(input)

        document.body.removeChild(input)
        done()
      }, 0)
    })
  })
})

  describe('open', () => {
    it('opens the portal when toggled from false to true', () => {
      wrapperMount(
        <Portal open={false}>
          <p />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      // Enzyme docs say it merges previous props but without children, react complains
      wrapper.setProps({ open: true, children: <p /> })
      wrapper.should.have.descendants(PortalInner)
    })

    it('closes the portal when toggled from true to false ', () => {
      wrapperMount(
        <Portal open>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.setProps({ open: false, children: <p /> })
      wrapper.should.not.have.descendants(PortalInner)
    })
  })

  describe('onMount', () => {
    it('called when portal opens', () => {
      const props = { open: false, onMount: sandbox.spy() }
      wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      wrapper.setProps({ open: true, children: <p /> })
      props.onMount.should.have.been.calledOnce()
    })

    it('is not called when portal receives props', () => {
      const props = { open: false, onMount: sandbox.spy() }
      wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      wrapper.setProps({ open: true, children: <p />, className: 'old' })
      props.onMount.should.have.been.calledOnce()

      wrapper.setProps({ open: true, children: <p />, className: 'new' })
      props.onMount.should.have.been.calledOnce()
    })
  })

  describe('onUnmount', () => {
    it('is called when portal closes', () => {
      const props = { open: true, onUnmount: sandbox.spy() }
      wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      wrapper.setProps({ open: false, children: <p /> })
      props.onUnmount.should.have.been.calledOnce()
    })

    it('is not called when portal receives props', () => {
      const props = { open: true, onUnmount: sandbox.spy() }
      wrapperMount(
        <Portal {...props}>
          <p />
        </Portal>,
      )

      wrapper.setProps({ open: false, children: <p />, className: 'old' })
      props.onUnmount.should.have.been.calledOnce()

      wrapper.setProps({ open: false, children: <p />, className: 'new' })
      props.onUnmount.should.have.been.calledOnce()
    })

    it('is called only once when portal closes and then is unmounted', () => {
      const onUnmount = sandbox.spy()
      wrapperMount(
        <Portal onUnmount={onUnmount} open>
          <p />
        </Portal>,
      )

      wrapper.setProps({ open: false, children: <p /> })
      act(() => {
        wrapper.unmount()
      })
      onUnmount.should.have.been.calledOnce()
    })

    it('is called only once when directly unmounting', () => {
      const onUnmount = sandbox.spy()
      wrapperMount(
        <Portal onUnmount={onUnmount} open>
          <p />
        </Portal>,
      )

      act(() => {
        wrapper.unmount()
      })
      onUnmount.should.have.been.calledOnce()
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const onOpen = sandbox.spy()
      wrapperMount(
        <Portal onOpen={onOpen} trigger={<div id='trigger' />}>
          <p />
        </Portal>,
      )

      wrapper.find('#trigger').simulate('click')
      onOpen.should.have.been.calledOnce()
      onOpen.should.have.been.calledWithMatch({}, { open: true })
    })
  })

  describe('onClose', () => {
    it('is called on body click', () => {
      const onClose = sandbox.spy()
      wrapperMount(
        <Portal defaultOpen onClose={onClose} trigger={<div />}>
          <p />
        </Portal>,
      )

      domEvent.click(document.body)
      onClose.should.have.been.called()
      onClose.should.have.been.calledWithMatch({}, { open: false })
    })
  })

  describe('trigger', () => {
    it('renders null when not set', () => {
      wrapperMount(
        <Portal>
          <p />
        </Portal>,
      )

      expect(wrapper.html()).to.equal(null)
    })

    it('renders the trigger when set', () => {
      const text = 'open by click on me'
      const trigger = <button>{text}</button>
      wrapperMount(
        <Portal trigger={trigger}>
          <p />
        </Portal>,
      )

      wrapper.text().should.equal(text)
    })

    _.forEach(['onBlur', 'onClick', 'onFocus', 'onMouseLeave', 'onMouseEnter'], (handlerName) => {
      it(`handles ${handlerName} on trigger and passes all arguments`, () => {
        const event = { target: null }
        const handler = sandbox.spy()
        const Trigger = createHandlingComponent(handlerName)
        const trigger = <Trigger color='blue' handler={handler} />

        wrapperMount(
          <Portal trigger={trigger}>
            <p />
          </Portal>,
        )
          .find('button')
          .simulate(_.toLower(handlerName.substring(2)), event)

        handler.should.have.been.calledOnce()
        handler.should.have.been.calledWithMatch(event, {
          handler,
          color: 'blue',
        })
      })
    })
  })

  describe('triggerRef', () => {
    it('calls itself and an original ref', () => {
      const elementRef = React.createRef()
      const triggerRef = React.createRef()

      wrapperMount(
        <Portal trigger={<div id='trigger' ref={elementRef} />} triggerRef={triggerRef}>
          <p />
        </Portal>,
      )
      const element = wrapper.getDOMNode()

      expect(element.tagName).to.equal('DIV')

      expect(elementRef.current).to.equal(element)
      expect(triggerRef.current).to.equal(element)
    })
  })

  describe('mountNode', () => {
    it('passed to PortalInner', () => {
      const mountNode = document.createElement('div')
      wrapperMount(
        <Portal mountNode={mountNode} open>
          <p />
        </Portal>,
      )

      wrapper.find(PortalInner).should.have.prop('mountNode', mountNode)
    })
  })

  describe('openOnTriggerClick', () => {
    it('defaults to true', () => {
      const onTriggerClick = sandbox.spy()
      const trigger = <button onClick={onTriggerClick}>button</button>

      wrapperMount(
        <Portal trigger={trigger}>
          <p />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      wrapper.find('button').simulate('click')
      wrapper.should.have.descendants(PortalInner)
      onTriggerClick.should.have.been.calledOnce()
    })

    it('does not open the portal on trigger click when false', () => {
      const spy = sandbox.spy()
      const trigger = <button onClick={spy}>button</button>

      wrapperMount(
        <Portal trigger={trigger} openOnTriggerClick={false}>
          <p />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      wrapper.find('button').simulate('click')
      wrapper.should.not.have.descendants(PortalInner)
      spy.should.have.been.calledOnce()
    })

    it('opens the portal on trigger click when true', () => {
      const spy = sandbox.spy()
      const trigger = <button onClick={spy}>button</button>

      wrapperMount(
        <Portal trigger={trigger} openOnTriggerClick>
          <p />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      wrapper.find('button').simulate('click')
      wrapper.should.have.descendants(PortalInner)
      spy.should.have.been.calledOnce()
    })
  })

  describe('closeOnTriggerClick', () => {
    it('does not close the portal on click', () => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('click')
      wrapper.should.have.descendants(PortalInner)
    })

    it('closes the portal on click when set', () => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerClick>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('click')
      wrapper.should.not.have.descendants(PortalInner)
    })
  })

  describe('openOnTriggerMouseEnter', () => {
    it('does not open the portal on mouseenter when not set', () => {
      wrapperMount(
        <Portal trigger={<button />}>
          <p />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      wrapper.find('button').simulate('mouseenter')
      wrapper.should.not.have.descendants(PortalInner)
    })

    it('opens the portal on mouseenter when set', (done) => {
      wrapperMount(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={0}>
          <p />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      wrapper.find('button').simulate('mouseenter')
      setTimeout(() => {
        wrapper.update()
        wrapper.should.have.descendants(PortalInner)

        done()
      }, 1)
    })

    /**
     * e--l--d--v
     * ^: mouseenter
     *    ^: BEFORE_DELAY: mouseleave
     *       ^: expected DELAY
     *          ^: final validation
     */
    it('does not open the portal when leave before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      wrapperMount(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={DELAY}>
          <p />
        </Portal>,
      )

      wrapper.should.not.have.descendants(PortalInner)
      wrapper.find('button').simulate('mouseenter')

      await wait(BEFORE_DELAY)

      wrapper.update()
      wrapper.should.not.have.descendants(PortalInner)
      wrapper.find('button').simulate('mouseleave')

      await wait(DELAY)

      wrapper.update()
      wrapper.should.not.have.descendants(PortalInner)
    })
  })

  describe('closeOnTriggerMouseLeave', () => {
    it('does not close the portal on mouseleave when not set', (done) => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('mouseleave')
      setTimeout(() => {
        wrapper.update()
        wrapper.should.have.descendants(PortalInner)

        done()
      }, 1)
    })

    it('closes the portal on mouseleave when set', (done) => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={0}>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('mouseleave')
      setTimeout(() => {
        wrapper.update()
        wrapper.should.not.have.descendants(PortalInner)

        done()
      }, 1)
    })

    /**
     * e--l--e--d--v
     * ^: mouseenter
     *    ^: mouseleave
     *       ^: BEFORE_DELAY: reenter
     *          ^: expected DELAY
     *             ^: final validation
     */
    it('does not close the portal when reenter before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      wrapperMount(
        <Portal
          trigger={<button />}
          openOnTriggerMouseEnter
          closeOnTriggerMouseLeave
          mouseLeaveDelay={DELAY}
        >
          <p />
        </Portal>,
      )

      wrapper.should.not.have.descendants(PortalInner)
      wrapper.find('button').simulate('mouseenter')

      await wait(BEFORE_DELAY)

      wrapper.update()
      wrapper.should.have.descendants(PortalInner)
      wrapper.find('button').simulate('mouseleave')

      await wait(BEFORE_DELAY)

      wrapper.update()
      wrapper.should.have.descendants(PortalInner)
      wrapper.find('button').simulate('mouseenter')

      await wait(DELAY)

      wrapper.update()
      wrapper.should.have.descendants(PortalInner)
    })
  })

  describe('closeOnPortalMouseLeave', () => {
    it('does not close the portal on mouseleave of portal when not set', (done) => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.mouseLeave('#inner')
      setTimeout(() => {
        wrapper.update()
        wrapper.should.have.descendants(PortalInner)

        done()
      }, 1)
    })

    it('closes the portal on mouseleave of portal when set', (done) => {
      wrapperMount(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.mouseLeave('#inner')
      setTimeout(() => {
        wrapper.update()
        wrapper.should.not.have.descendants(PortalInner)

        done()
      }, 1)
    })

    it("does not close the portal on mouseleave triggered by the portal's children", (done) => {
      wrapperMount(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <div>
            <p id='child' />
          </div>
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.mouseLeave('#child')
      setTimeout(() => {
        wrapper.update()
        wrapper.should.have.descendants(PortalInner)

        done()
      }, 1)
    })
  })

  describe('closeOnTriggerMouseLeave + closeOnPortalMouseLeave', () => {
    it('closes the portal on trigger mouseleave even when portal receives mouseenter within limit', (done) => {
      const delay = 10
      wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={delay}>
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('mouseleave')

      // Fire a mouseEnter on the portal within the time limit
      setTimeout(() => {
        domEvent.mouseEnter('#inner')
      }, delay - 1)

      // The portal should close because closeOnPortalMouseLeave not set
      setTimeout(() => {
        wrapper.update()
        wrapper.should.not.have.descendants(PortalInner)

        done()
      }, delay + 1)
    })

    it('does not close the portal on trigger mouseleave when portal receives mouseenter within limit', (done) => {
      const delay = 10
      wrapperMount(
        <Portal
          trigger={<button />}
          defaultOpen
          closeOnTriggerMouseLeave
          closeOnPortalMouseLeave
          mouseLeaveDelay={delay}
        >
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('mouseleave')

      // Fire a mouseEnter on the portal within the time limit
      setTimeout(() => {
        domEvent.mouseEnter('#inner')
      }, delay - 1)

      // The portal should not have closed
      setTimeout(() => {
        wrapper.update()
        wrapper.should.have.descendants(PortalInner)

        done()
      }, delay + 1)
    })
  })

  describe('openOnTriggerFocus', () => {
    it('does not open the portal on focus when not set', () => {
      wrapperMount(
        <Portal trigger={<button />}>
          <p />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      wrapper.find('button').simulate('focus')
      wrapper.should.not.have.descendants(PortalInner)
    })

    it('opens the portal on focus when set', () => {
      wrapperMount(
        <Portal trigger={<button />} openOnTriggerFocus>
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.not.have.descendants(PortalInner)

      wrapper.find('button').simulate('focus')
      wrapper.should.have.descendants(PortalInner)
    })
  })

  describe('closeOnTriggerBlur', () => {
    it('does not close the portal on blur when not set', () => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('blur')
      wrapper.should.have.descendants(PortalInner)
    })

    it('closes the portal on blur when set', () => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerBlur>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      wrapper.find('button').simulate('blur')
      wrapper.should.not.have.descendants(PortalInner)
    })
  })

  describe('closeOnEscape', () => {
    it('closes the portal on escape', () => {
      wrapperMount(
        <Portal closeOnEscape defaultOpen>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.keyDown(document, { key: 'Escape' })
      wrapper.update()
      wrapper.should.not.have.descendants(PortalInner)
    })

    it('does not close the portal on escape when false', () => {
      wrapperMount(
        <Portal closeOnEscape={false} defaultOpen>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.keyDown(document, { key: 'Escape' })
      wrapper.update()
      wrapper.should.have.descendants(PortalInner)
    })
  })

  describe('closeOnDocumentClick', () => {
    it('closes the portal on document click', () => {
      wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.click(document)
      wrapper.update()
      wrapper.should.not.have.descendants(PortalInner)
    })

    it('does not close on click inside', () => {
      wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.click('#inner')
      wrapper.update()
      wrapper.should.have.descendants(PortalInner)
    })

    it('does not close on mousedown inside and mouseup outside', () => {
      wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' />
        </Portal>,
      )
      wrapper.should.have.descendants(PortalInner)

      domEvent.mouseDown('#inner')
      domEvent.click(document)
      wrapper.update()
      wrapper.should.have.descendants(PortalInner)
    })
  })

  // Heads Up!
  // Portals used to take focus on mount and restore focus to the original activeElement on unMount.
  // One by one, these auto set/remove focus features were removed and the assertions negated.
  // Leave these tests here to ensure we aren't ever stealing focus.
  describe('focus', () => {
    it('does not take focus onMount', (done) => {
      wrapperMount(
        <Portal defaultOpen>
          <p id='inner' />
        </Portal>,
      )

      setTimeout(() => {
        document.activeElement.should.not.equal(document.getElementById('inner'))
        done()
      }, 0)
    })

    it('does not take focus on unMount', (done) => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      document.activeElement.should.equal(input)

      wrapperMount(
        <Portal open>
          <p />
        </Portal>,
      )
      document.activeElement.should.equal(input)

      setTimeout(() => {
        document.activeElement.should.equal(input)

        wrapper.setProps({ open: false })
        wrapper.unmount()

        document.activeElement.should.equal(input)

        document.body.removeChild(input)
        done()
      }, 0)
    })

    it('does not take focus on re-render', (done) => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      document.activeElement.should.equal(input)

      wrapperMount(
        <Portal defaultOpen>
          <p />
        </Portal>,
      )
      document.activeElement.should.equal(input)

      setTimeout(() => {
        document.activeElement.should.equal(input)

        wrapper.render()
        document.activeElement.should.equal(input)

        document.body.removeChild(input)
        done()
      }, 0)
    })
  })
})
