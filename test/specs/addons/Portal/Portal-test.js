import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { act } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'

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
  // TODO: Fix hasValidTypings - broken during vitest migration (componentInfoContext removed)
  // common.hasValidTypings(Portal, { forwardsRef: false })

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
    it('opens the portal when toggled from false to true', async () => {
      const { rerender } = wrapperMount(
        <Portal open={false}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      rerender(
        <Portal open>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })
    })

    it('closes the portal when toggled from true to false ', async () => {
      const { rerender } = wrapperMount(
        <Portal open>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      rerender(
        <Portal open={false}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
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
        const eventType = _.toLower(handlerName.substring(2))
        const actualEventType =
          eventType === 'mouseenter'
            ? 'mouseOver'
            : eventType === 'mouseleave'
            ? 'mouseOut'
            : eventType
        const handler = sandbox.spy()
        const Trigger = createHandlingComponent(handlerName)
        const trigger = <Trigger color='blue' handler={handler} />

        const { container } = wrapperMount(
          <Portal trigger={trigger}>
            <p />
          </Portal>,
        )

        const button = container.querySelector('button')
        if (!button) {
          throw new Error(`Button element not found for "${eventType}" event`)
        }

        const event = { target: button }
        if (fireEvent[actualEventType]) {
          fireEvent[actualEventType](button, event)
        } else {
          throw new Error(
            `Unable to fire a "${actualEventType}" event - please provide a DOM element.`,
          )
        }

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
    it('defaults to true', async () => {
      const onTriggerClick = sandbox.spy()
      const trigger = <button onClick={onTriggerClick}>button</button>

      const { container } = wrapperMount(
        <Portal trigger={trigger}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      fireEvent.click(container.querySelector('button'))
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })
      onTriggerClick.should.have.been.calledOnce()
    })

    it('does not open the portal on trigger click when false', () => {
      const spy = sandbox.spy()
      const trigger = <button onClick={spy}>button</button>

      const { container } = wrapperMount(
        <Portal trigger={trigger} openOnTriggerClick={false}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      fireEvent.click(container.querySelector('button'))
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      spy.should.have.been.calledOnce()
    })

    it('opens the portal on trigger click when true', async () => {
      const spy = sandbox.spy()
      const trigger = <button onClick={spy}>button</button>

      const { container } = wrapperMount(
        <Portal trigger={trigger} openOnTriggerClick>
          <p data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      fireEvent.click(container.querySelector('button'))
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })
      spy.should.have.been.calledOnce()
    })
  })

  describe('closeOnTriggerClick', () => {
    it('does not close the portal on click', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.click(container.querySelector('button'))
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })

    it('closes the portal on click when set', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerClick>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.click(container.querySelector('button'))
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
    })
  })

  describe('openOnTriggerMouseEnter', () => {
    it('does not open the portal on mouseenter when not set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      fireEvent.mouseEnter(container.querySelector('button'))
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
    })

    it('opens the portal on mouseenter when set', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={0}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      fireEvent.mouseEnter(container.querySelector('button'))
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })
    })

    it('does not open the portal when leave before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      const { container } = wrapperMount(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={DELAY}>
          <p data-testid='portal-content' />
        </Portal>,
      )

      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      fireEvent.mouseEnter(container.querySelector('button'))

      await wait(BEFORE_DELAY)

      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      fireEvent.mouseLeave(container.querySelector('button'))

      await wait(DELAY)

      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
    })
  })

  describe('closeOnTriggerMouseLeave', () => {
    it('does not close the portal on mouseleave when not set', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.mouseLeave(container.querySelector('button'))
      await wait(1)
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })

    it('closes the portal on mouseleave when set', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={0}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.mouseLeave(container.querySelector('button'))
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
    })

    it('does not close the portal when reenter before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      vi.useFakeTimers()

      try {
        const { container } = wrapperMount(
          <Portal
            trigger={<button />}
            openOnTriggerMouseEnter
            closeOnTriggerMouseLeave
            mouseLeaveDelay={DELAY}
          >
            <p data-testid='portal-content' />
          </Portal>,
        )

        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

        await act(async () => {
          fireEvent.mouseOver(container.querySelector('button'))
          await vi.runAllTimersAsync()
        })

        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()

        await act(async () => {
          fireEvent.mouseLeave(container.querySelector('button'))
          await vi.advanceTimersByTimeAsync(BEFORE_DELAY)
        })

        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()

        await act(async () => {
          fireEvent.mouseOver(container.querySelector('button'))
          await vi.advanceTimersByTimeAsync(DELAY)
        })

        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('closeOnPortalMouseLeave', () => {
    it('does not close the portal on mouseleave of portal when not set', async () => {
      wrapperMount(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.mouseLeave('#inner')
      await wait(1)
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })

    it('closes the portal on mouseleave of portal when set', async () => {
      wrapperMount(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.mouseLeave('#inner')
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
    })

    it("does not close the portal on mouseleave triggered by the portal's children", async () => {
      wrapperMount(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <div>
            <p id='child' data-testid='portal-content' />
          </div>
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.mouseLeave('#child')
      await wait(1)
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })
  })

  describe('closeOnTriggerMouseLeave + closeOnPortalMouseLeave', () => {
    it('closes the portal on trigger mouseleave even when portal receives mouseenter within limit', async () => {
      const delay = 10
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={delay}>
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.mouseLeave(container.querySelector('button'))

      // Fire a mouseEnter on the portal within the time limit
      setTimeout(() => {
        act(() => {
          domEvent.mouseEnter('#inner')
        })
      }, delay - 1)

      // The portal should close because closeOnPortalMouseLeave not set
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
    })

    it('does not close the portal on trigger mouseleave when portal receives mouseenter within limit', async () => {
      const delay = 10
      const { container } = wrapperMount(
        <Portal
          trigger={<button />}
          defaultOpen
          closeOnTriggerMouseLeave
          closeOnPortalMouseLeave
          mouseLeaveDelay={delay}
        >
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.mouseLeave(container.querySelector('button'))

      // Fire a mouseEnter on the portal within the time limit
      setTimeout(() => {
        domEvent.mouseEnter('#inner')
      }, delay - 1)

      // The portal should not have closed
      await wait(delay + 1)
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })
  })

  describe('openOnTriggerFocus', () => {
    it('does not open the portal on focus when not set', () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />}>
          <p data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      fireEvent.focus(container.querySelector('button'))
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
    })

    it('opens the portal on focus when set', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} openOnTriggerFocus>
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()

      fireEvent.focus(container.querySelector('button'))
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })
    })
  })

  describe('closeOnTriggerBlur', () => {
    it('does not close the portal on blur when not set', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen>
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.blur(container.querySelector('button'))
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })

    it('closes the portal on blur when set', async () => {
      const { container } = wrapperMount(
        <Portal trigger={<button />} defaultOpen closeOnTriggerBlur>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      fireEvent.blur(container.querySelector('button'))
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
    })
  })

  describe('closeOnEscape', () => {
    it('closes the portal on escape', async () => {
      wrapperMount(
        <Portal closeOnEscape defaultOpen>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.keyDown(document, { key: 'Escape' })
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
    })

    it('does not close the portal on escape when false', async () => {
      wrapperMount(
        <Portal closeOnEscape={false} defaultOpen>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.keyDown(document, { key: 'Escape' })
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })
  })

  describe('closeOnDocumentClick', () => {
    it('closes the portal on document click', async () => {
      wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.click(document)
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.be.null()
      })
    })

    it('does not close on click inside', async () => {
      wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.click('#inner')
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })

    it('does not close on mousedown inside and mouseup outside', async () => {
      wrapperMount(
        <Portal closeOnDocumentClick defaultOpen>
          <p id='inner' data-testid='portal-content' />
        </Portal>,
      )
      await waitFor(() => {
        expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
      })

      domEvent.mouseDown('#inner')
      domEvent.click(document)
      expect(document.querySelector('[data-testid="portal-content"]')).to.not.be.null()
    })
  })

  describe('focus', () => {
    it('does not take focus onMount', async () => {
      wrapperMount(
        <Portal defaultOpen>
          <p id='inner' />
        </Portal>,
      )

      await waitFor(() => {
        expect(document.activeElement).to.not.equal(document.getElementById('inner'))
      })
    })

    it('does not take focus on unMount', async () => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      expect(document.activeElement).to.equal(input)

      const { rerender, unmount } = wrapperMount(
        <Portal open>
          <p />
        </Portal>,
      )
      expect(document.activeElement).to.equal(input)

      await waitFor(() => {
        expect(document.activeElement).to.equal(input)
      })

      rerender(
        <Portal open={false}>
          <p />
        </Portal>,
      )
      unmount()

      expect(document.activeElement).to.equal(input)

      document.body.removeChild(input)
    })

    it('does not take focus on re-render', async () => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      input.focus()
      expect(document.activeElement).to.equal(input)

      const { rerender } = wrapperMount(
        <Portal defaultOpen>
          <p />
        </Portal>,
      )
      expect(document.activeElement).to.equal(input)

      await waitFor(() => {
        expect(document.activeElement).to.equal(input)
      })

      rerender(
        <Portal defaultOpen>
          <p />
        </Portal>,
      )
      expect(document.activeElement).to.equal(input)

      document.body.removeChild(input)
    })
  })
})
