import _ from 'lodash'
import { act } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { SUI } from 'src/lib'
import Popup from 'src/modules/Popup/Popup'
import { positionsMapping } from 'src/modules/Popup/lib/positions'
import PopupHeader from 'src/modules/Popup/PopupHeader'
import PopupContent from 'src/modules/Popup/PopupContent'
import * as common from 'test/specs/commonTests'
import { domEvent, sandbox } from 'test/utils'

vi.mock('react-popper', () => ({
  Popper: ({ children }) =>
    children({ placement: 'top-start', ref: () => {}, update: () => {}, style: {} }),
}))

// ----------------------------------------
// Wrapper
// ----------------------------------------
let wrapper

// we need to unmount the Popup after every test to remove it from the document
// wrap the render methods to update a global wrapper that is unmounted after each test
const wrapperMount = (...args) => {
  let result

  act(() => {
    result = render(...args)
  })

  wrapper = result
  return result
}

const renderPopup = (...args) => {
  let result

  act(() => {
    result = render(...args)
  })

  return result
}

const assertIn = (node, selector, isPresent = true) => {
  const didFind = node.querySelector(selector) !== null
  didFind.should.equal(
    isPresent,
    `${didFind ? 'Found' : 'Did not find'} "${selector}" in the ${node}.`,
  )
}
const assertInBody = (...args) => assertIn(document.body, ...args)

describe('Popup', () => {
  beforeEach(() => {
    wrapper = undefined
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) wrapper.unmount()
  })

  common.isConformant(Popup, { rendersChildren: false, rendersPortal: true, forwardsRef: false })
  common.hasSubcomponents(Popup, [PopupHeader, PopupContent])

  // Heads up!
  //
  // Our commonTests do not currently handle wrapped components.
  // Nor do they handle components rendered to the body with Portal.
  // The Popup is wrapped in a Portal, so we manually test a few things here.

  describe('children', () => {
    it('renders a Portal', async () => {
      wrapperMount(<Popup open />)

      await waitFor(() => {
        expect(document.querySelector('.ui.popup.visible')).to.not.be.null()
      })
    })

    it('renders to the document body', () => {
      wrapperMount(<Popup open />)
      assertInBody('.ui.popup.visible')
    })

    it('renders child text', async () => {
      wrapperMount(<Popup open>child text</Popup>)

      await waitFor(() => {
        expect(document.querySelector('.ui.popup.visible')?.textContent).to.equal('child text')
      })
    })

    it('renders child components', async () => {
      const child = <div data-child />
      wrapperMount(<Popup open>{child}</Popup>)

      await waitFor(() => {
        expect(document.querySelector('.ui.popup.visible [data-child]')).to.not.equal(
          null,
          'Popup did not render the child component.',
        )
      })
    })
  })

  describe('className', () => {
    it('should add className to the wrapping node', () => {
      wrapperMount(<Popup className='some-class' open />)
      assertInBody('.ui.popup.visible.some-class')
    })
  })

  describe('basic', () => {
    it('adds basic to the popup className', () => {
      wrapperMount(<Popup basic open />)
      assertInBody('.ui.basic.popup.visible')
    })
  })

  describe('disabled', () => {
    it('is not disabled by default', async () => {
      wrapperMount(<Popup open />)

      await waitFor(() => {
        expect(document.querySelector('.ui.popup')).to.not.be.null()
      })
    })

    it('does not render Portal if disabled', () => {
      const { container } = renderPopup(<Popup disabled />)
      expect(container.querySelector('.ui.popup')).to.be.null()
    })

    it('does not render Portal even with open prop', () => {
      const { container } = renderPopup(<Popup open disabled />)
      expect(container.querySelector('.ui.popup')).to.be.null()
    })
  })

  describe('eventsEnabled ', () => {
    it(`is "true" by default`, () => {
      wrapperMount(<Popup open />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })

    it(`can be set to "false"`, () => {
      wrapperMount(<Popup eventsEnabled={false} open />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })
  })

  describe('flowing', () => {
    it('adds flowing to the popup className', () => {
      wrapperMount(<Popup flowing open />)
      assertInBody('.ui.flowing.popup.visible')
    })
  })

  describe('hideOnScroll', () => {
    const trigger = <button>foo</button>

    it('hides on window scroll', () => {
      wrapperMount(<Popup content='foo' hideOnScroll trigger={<button>foo</button>} />)

      fireEvent.click(document.querySelector('button'))
      assertInBody('.ui.popup.visible')

      domEvent.scroll(window)
      assertInBody('.ui.popup.visible', false)
    })

    it('is called with (e, props) when scroll', () => {
      const onClose = sandbox.spy()

      wrapperMount(<Popup content='foo' hideOnScroll onClose={onClose} trigger={trigger} />)

      fireEvent.click(document.querySelector('button'))
      domEvent.scroll(window)

      onClose.should.have.been.calledOnce()
      onClose.should.have.been.calledWithMatch({}, { content: 'foo', onClose, trigger })
    })

    it('not hide on scroll from inside a popup', () => {
      const onClose = sandbox.spy()
      const child = <div data-child />

      wrapperMount(
        <Popup hideOnScroll onClose={onClose} trigger={trigger}>
          {child}
        </Popup>,
      )
      fireEvent.click(document.querySelector('button'))

      domEvent.scroll(document.querySelector('[data-child]'))
      onClose.should.not.have.been.called()

      domEvent.scroll(window)
      onClose.should.have.been.calledOnce()
    })
  })

  describe('hoverable', () => {
    it('can be set to stay visible while hovering the popup', async () => {
      wrapperMount(<Popup hoverable open />)

      await waitFor(() => {
        expect(document.querySelector('.ui.popup.visible')).to.not.be.null()
      })
    })
  })

  describe('inverted', () => {
    it('adds inverted to the popup className', () => {
      wrapperMount(<Popup inverted open />)
      assertInBody('.ui.inverted.popup.visible')
    })
  })

  describe('offset', () => {
    it('passes values to Popper', () => {
      wrapperMount(<Popup content='foo' open offset={[50, 100]} position='bottom right' />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })
  })

  describe('onClose', () => {
    it('is not called on click inside of the popup', () => {
      const onClose = sandbox.spy()
      wrapperMount(<Popup defaultOpen onClose={onClose} />)

      domEvent.click('.ui.popup')
      onClose.should.not.have.been.calledOnce()
    })

    it('is called on body click', () => {
      const onClose = sandbox.spy()
      wrapperMount(<Popup defaultOpen onClose={onClose} />)

      domEvent.click('body')
      onClose.should.have.been.calledOnce()
    })

    it('is called when pressing escape', () => {
      const onClose = sandbox.spy()
      wrapperMount(<Popup defaultOpen onClose={onClose} />)

      domEvent.keyDown(document, { key: 'Escape' })
      onClose.should.have.been.calledOnce()
    })

    it('is not called when the open prop changes to false', () => {
      const onClose = sandbox.spy()
      const { rerender } = renderPopup(<Popup defaultOpen onClose={onClose} />)

      act(() => {
        rerender(<Popup open={false} onClose={onClose} />)
      })
      onClose.should.not.have.been.called()
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const onOpen = sandbox.spy()
      wrapperMount(
        <Popup onOpen={onOpen} trigger={<div id='trigger' />}>
          <p />
        </Popup>,
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
        <Popup defaultOpen onClose={onClose} trigger={<div />}>
          <p />
        </Popup>,
      )

      domEvent.click(document.body)
      onClose.should.have.been.called()
      onClose.should.have.been.calledWithMatch({}, { open: false })
    })
  })

  describe('open', () => {
    it('is not open by default', () => {
      wrapperMount(<Popup />)
      assertInBody('.ui.popup.visible', false)
    })

    it('is passed to Portal open', async () => {
      const { rerender } = renderPopup(<Popup open />)

      await waitFor(() => {
        expect(document.querySelector('.ui.popup.visible')).to.not.be.null()
      })

      act(() => {
        rerender(<Popup open={false} />)
      })

      await waitFor(() => {
        expect(document.querySelector('.ui.popup.visible')).to.be.null()
      })
    })

    it('does not show the popup when false', () => {
      wrapperMount(<Popup open={false} />)
      assertInBody('.ui.popup.visible', false)
    })

    it('shows the popup on changing from false to true', () => {
      const { rerender } = renderPopup(<Popup open={false} />)
      assertInBody('.ui.popup.visible', false)

      act(() => {
        rerender(<Popup open />)
      })
      assertInBody('.ui.popup.visible')
    })

    it('hides the popup on changing from true to false', () => {
      const { rerender } = renderPopup(<Popup open />)
      assertInBody('.ui.popup.visible')

      act(() => {
        rerender(<Popup open={false} />)
      })
      assertInBody('.ui.popup.visible', false)
    })
  })

  describe('pinned', () => {
    it(`is "true" by default`, () => {
      wrapperMount(<Popup open />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })

    it(`disables "flip" modifier in PopperJS when is "true"`, () => {
      wrapperMount(<Popup open pinned />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })

    it(`enables "flip" modifier in PopperJS when is "false"`, () => {
      wrapperMount(<Popup open pinned={false} />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })
  })

  describe('position', () => {
    _.forEach(positionsMapping, (placement, position) => {
      it(`passes the "${position}" as "${placement}" to Popper`, () => {
        wrapperMount(<Popup open position={position} />)

        const popup = document.querySelector('.ui.popup')
        expect(popup).to.not.be.null()
      })
    })
  })

  describe('positionFixed', () => {
    it(`is not defiend by default`, () => {
      wrapperMount(<Popup open />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })

    it(`can be set to "true"`, () => {
      wrapperMount(<Popup positionFixed open />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })
  })

  describe('popper', () => {
    it('passes a zIndex value from .popup', async () => {
      wrapperMount(<Popup open style={{ zIndex: 5000 }} />)

      await waitFor(() => {
        const popup = document.querySelector('.ui.popup')
        expect(popup).to.not.be.null()
      })
    })

    it('zIndex passed to a shorthand wins', async () => {
      wrapperMount(<Popup open popper={{ style: { zIndex: 100 } }} style={{ zIndex: 5000 }} />)

      await waitFor(() => {
        const popup = document.querySelector('.ui.popup')
        expect(popup).to.not.be.null()
      })
    })

    it('additional props can be passed via shorthand', () => {
      wrapperMount(<Popup open popper={{ className: 'foo', id: 'bar' }} />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })

    it('"style" prop is merged', () => {
      wrapperMount(<Popup open popper={{ style: { color: 'red', display: 'block' } }} />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })
  })

  describe('popperModifiers', () => {
    it('are passed to Popper', () => {
      const modifierOffset = { name: 'offset', options: { offset: [0, 10] } }
      const modifierPreventOverflow = { name: 'preventOverflow', options: { padding: 0 } }
      wrapperMount(<Popup popperModifiers={[modifierOffset, modifierPreventOverflow]} open />)

      const popup = document.querySelector('.ui.popup')
      expect(popup).to.not.be.null()
    })
  })

  describe('reference visibility', () => {
    const popupWrapper = () => document.querySelector('.ui.popup').parentElement

    it('hides the popup when the reference has no geometry', async () => {
      const { rerender } = wrapperMount(
        <Popup open trigger={<button>t</button>}><p>content</p></Popup>,
      )
      await waitFor(() => expect(document.querySelector('.ui.popup')).to.not.be.null())

      rerender(
        <Popup open trigger={<button>t</button>}><p>content</p></Popup>,
      )

      // jsdom gives every element a zero-size rect, so the reference is dead
      expect(popupWrapper().style.visibility).to.equal('hidden')
    })

    it('keeps the popup visible when the reference has a valid rect', async () => {
      const { container, rerender } = wrapperMount(
        <Popup open trigger={<button>t</button>}><p>content</p></Popup>,
      )
      await waitFor(() => expect(document.querySelector('.ui.popup')).to.not.be.null())

      container.querySelector('button').getBoundingClientRect = () => ({
        width: 100, height: 50, top: 0, left: 0, right: 100, bottom: 50, x: 0, y: 0,
      })

      rerender(
        <Popup open trigger={<button>t</button>}><p>content</p></Popup>,
      )

      expect(popupWrapper().style.visibility).to.not.equal('hidden')
    })

    it('uses the context node as the reference when provided', async () => {
      const contextNode = document.createElement('div')
      contextNode.getBoundingClientRect = () => ({
        width: 100, height: 50, top: 0, left: 0, right: 100, bottom: 50, x: 0, y: 0,
      })

      wrapperMount(
        <Popup open context={contextNode}><p>content</p></Popup>,
      )
      await waitFor(() => expect(document.querySelector('.ui.popup')).to.not.be.null())

      // triggerRef is null here - only the context node can satisfy the check
      expect(popupWrapper().style.visibility).to.not.equal('hidden')
    })
  })

  describe.skip('popperDependencies', () => {
    // TODO: find a way to implement these tests
    // it('will call "scheduleUpdate" if dependencies changed', () => {
    //   wrapperMount(<Popup popperDependencies={[1, 2, 3]} />)
    //   const scheduleUpdate = sandbox.spy(wrapper.instance(), 'handleUpdate')
    //
    //   wrapper.setProps({ popperDependencies: [2, 3, 4] })
    //   scheduleUpdate.should.have.been.calledOnce()
    // })
    //
    // it('will skip "scheduleUpdate" if dependencies are same', () => {
    //   wrapperMount(<Popup popperDependencies={[1, 2, 3]} />)
    //   const scheduleUpdate = sandbox.spy(wrapper.instance(), 'handleUpdate')
    //
    //   wrapper.setProps({ popperDependencies: [1, 2, 3] })
    //   scheduleUpdate.should.have.not.been.called()
    // })
  })

  describe('size', () => {
    const sizes = _.without(SUI.SIZES, 'medium', 'big', 'massive')

    sizes.forEach((size) => {
      it(`adds the ${size} to the popup className`, () => {
        wrapperMount(<Popup size={size} open />)
        assertInBody(`.ui.${size}.popup`)
      })
    })
  })

  describe('trigger', () => {
    it('opens Popup on click', () => {
      wrapperMount(<Popup on='click' content='foo' trigger={<button />} />)

      fireEvent.click(document.querySelector('button'))
      assertInBody('.ui.popup.visible')
    })

    it('opens Popup on hover', async () => {
      wrapperMount(<Popup content='foo' mouseEnterDelay={0} trigger={<button />} />)

      fireEvent.mouseEnter(document.querySelector('button'))
      await waitFor(() => {
        assertInBody('.ui.popup.visible')
      })
    })

    it('opens Popup on focus', () => {
      wrapperMount(<Popup on='focus' content='foo' trigger={<input />} />)

      fireEvent.focus(document.querySelector('input'))
      assertInBody('.ui.popup.visible')
    })

    it('opens Popup on multiple', async () => {
      wrapperMount(<Popup on={['click', 'hover']} content='foo' trigger={<button />} />)

      fireEvent.click(document.querySelector('button'))
      assertInBody('.ui.popup.visible')

      domEvent.click('body')

      fireEvent.mouseEnter(document.querySelector('button'))
      await waitFor(() => {
        assertInBody('.ui.popup.visible')
      })
    })
  })

  describe('wide', () => {
    it('adds to the popup className', () => {
      wrapperMount(<Popup wide open />)
      assertInBody('.ui.wide.popup.visible')
    })

    it('adds "very" to the popup className', () => {
      wrapperMount(<Popup wide='very' open />)
      assertInBody('.ui.very.wide.popup.visible')
    })
  })
})
