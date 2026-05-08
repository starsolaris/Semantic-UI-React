import React from 'react'
import { render } from '@testing-library/react'

import Sidebar from 'src/modules/Sidebar/Sidebar'
import * as common from 'test/specs/commonTests'
import { assertWithTimeout, domEvent, sandbox } from 'test/utils'

describe('Sidebar', () => {
  common.isConformant(Sidebar)
  common.forwardsRef(Sidebar)
  common.hasUIClassName(Sidebar)
  common.rendersChildren(Sidebar)

  common.propKeyOnlyToClassName(Sidebar, 'visible')

  common.propValueOnlyToClassName(Sidebar, 'animation', [
    'overlay',
    'push',
    'scale down',
    'uncover',
    'slide out',
    'slide along',
  ])
  common.propValueOnlyToClassName(Sidebar, 'direction', ['top', 'right', 'bottom', 'left'], {
    defaultValue: 'left',
  })
  common.propValueOnlyToClassName(Sidebar, 'width', ['very thin', 'thin', 'wide', 'very wide'])

  describe('componentWillUnmount', () => {
    it('will call "clearTimeout"', (done) => {
      const clear = sandbox.spy(window, 'clearTimeout')

      render(<Sidebar />)

      // start animation
      const { unmount } = render(<Sidebar visible />)
      unmount()

      assertWithTimeout(() => {
        expect(clear).to.have.been.called()
      }, done)
    })
  })

  describe('onHide', () => {
    it('is called when the "visible" prop changes to "false"', () => {
      const onHide = sandbox.spy()
      const { rerender } = render(<Sidebar onHide={onHide} visible />)
      expect(onHide).to.have.not.been.called()

      rerender(<Sidebar onHide={onHide} visible={false} />)
      expect(onHide).to.have.been.calledOnce()
      expect(onHide).to.have.been.calledWithMatch(null, { visible: false })
    })

    it('is called when a click on the document was done', () => {
      const onHide = sandbox.spy()
      render(<Sidebar onHide={onHide} visible />)
      expect(onHide).to.have.not.been.called()

      domEvent.click(document)
      expect(onHide).to.have.been.calledOnce()
      expect(onHide).to.have.been.calledWithMatch({}, { visible: false })
    })

    it('is called when a click on the document was done only once', () => {
      const onHide = sandbox.spy()
      const { rerender } = render(<Sidebar onHide={onHide} visible />)

      domEvent.click(document)
      rerender(<Sidebar onHide={onHide} visible={false} />)
      expect(onHide).to.have.been.calledOnce()
    })

    it('is not called when a click was done inside the component', () => {
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      const onHide = sandbox.spy()
      const { unmount } = render(
        <Sidebar onHide={onHide} visible>
          <div id='child' />
        </Sidebar>,
        { container: mountNode },
      )

      domEvent.click('div#child')
      expect(onHide).to.have.not.been.called()

      unmount()
      document.body.removeChild(mountNode)
    })
  })

  describe('onHidden', () => {
    it('is called when the "visible" prop was changed to "false"', (done) => {
      Sidebar.animationDuration = 0
      const onHidden = sandbox.spy()
      const { rerender } = render(<Sidebar onHidden={onHidden} visible />)

      expect(onHidden).to.have.not.been.called()
      rerender(<Sidebar onHidden={onHidden} visible={false} />)

      assertWithTimeout(() => {
        expect(onHidden).to.have.been.calledOnce()
        expect(onHidden).to.have.been.calledWithMatch(null, { visible: false })
      }, done)
    })
  })

  describe('onShow', () => {
    it('is called when the "visible" prop was changed to "true"', (done) => {
      Sidebar.animationDuration = 0
      const onShow = sandbox.spy()
      const { rerender } = render(<Sidebar onShow={onShow} />)

      expect(onShow).to.have.not.been.called()
      rerender(<Sidebar onShow={onShow} visible />)

      assertWithTimeout(() => {
        expect(onShow).to.have.been.calledOnce()
        expect(onShow).to.have.been.calledWithMatch(null, { visible: true })
      }, done)
    })
  })

  describe('onVisible', () => {
    it('is called when the "visible" prop changes to "true"', () => {
      const onVisible = sandbox.spy()
      const { rerender } = render(<Sidebar onVisible={onVisible} />)
      expect(onVisible).to.have.not.been.called()

      rerender(<Sidebar onVisible={onVisible} visible />)
      expect(onVisible).to.have.been.calledOnce()
      expect(onVisible).to.have.been.calledWithMatch(null, { visible: true })
    })
  })

  describe('target', () => {
    it('is passed to the EventListener component', () => {
      const target = document.createElement('div')
      const { container } = render(<Sidebar target={target} visible />)
      const listener = container.querySelector('.ui.sidebar')

      expect(listener).toBeTruthy()
    })
  })
})
