import React, { act } from 'react'
import { render, fireEvent } from '@testing-library/react'

import { SUI } from 'src/lib'
import Transition from 'src/modules/Transition/Transition'
import TransitionGroup from 'src/modules/Transition/TransitionGroup'
import {
  TRANSITION_STATUS_ENTERED,
  TRANSITION_STATUS_ENTERING,
  TRANSITION_STATUS_EXITED,
  TRANSITION_STATUS_EXITING,
} from 'src/modules/Transition/utils/computeStatuses'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

let container
let rerenderFn

const wrapperMount = (node, opts) => {
  const result = render(node, opts)
  container = result.container
  rerenderFn = result.rerender
  return result
}

describe('Transition', () => {
  common.hasSubcomponents(Transition, [TransitionGroup])
  common.hasValidTypings(Transition, { forwardsRef: false })

  beforeEach(() => {
    container = undefined
    rerenderFn = undefined
  })

  afterEach(() => {
    if (container) {
      try {
        container.remove()
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  })

  describe('animation', () => {
    SUI.DIRECTIONAL_TRANSITIONS.forEach((animation) => {
      it(`directional ${animation}`, () => {
        wrapperMount(
          <Transition animation={animation} transitionOnMount>
            <p />
          </Transition>,
        )

        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
        animation
          .split(' ')
          .forEach((className) =>
            expect(container.firstChild.classList.contains(className)).to.be.true(),
          )
        expect(container.firstChild.classList.contains('in')).to.be.true()

        rerenderFn(
          <Transition animation={animation} visible={false}>
            <p />
          </Transition>,
        )
        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
        animation
          .split(' ')
          .forEach((className) =>
            expect(container.firstChild.classList.contains(className)).to.be.true(),
          )
        expect(container.firstChild.classList.contains('out')).to.be.true()
      })
    })

    SUI.STATIC_TRANSITIONS.forEach((animation) => {
      it(`static ${animation}`, () => {
        wrapperMount(
          <Transition animation={animation} transitionOnMount>
            <p />
          </Transition>,
        )

        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
        expect(container.firstChild.classList.contains(animation)).to.be.true()
        expect(container.firstChild.classList.contains('in')).to.be.false()

        rerenderFn(
          <Transition animation={animation} visible={false}>
            <p />
          </Transition>,
        )
        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
        expect(container.firstChild.classList.contains(animation)).to.be.true()
        expect(container.firstChild.classList.contains('out')).to.be.false()
      })
    })

    it('supports custom animations', () => {
      wrapperMount(
        <Transition animation='jump' transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.firstChild.classList.contains('jump')).to.be.true()

      rerenderFn(
        <Transition animation='jump' visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.firstChild.classList.contains('jump')).to.be.true()
    })
  })

  describe('className', () => {
    it("passes element's className", () => {
      wrapperMount(
        <Transition>
          <p className='foo bar' />
        </Transition>,
      )

      expect(container.firstChild.classList.contains('foo')).to.be.true()
      expect(container.firstChild.classList.contains('bar')).to.be.true()
    })

    it('adds classes when ENTERED', () => {
      wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )

      expect(container.firstChild.classList.contains('visible')).to.be.true()
      expect(container.firstChild.classList.contains('transition')).to.be.true()
    })

    it('adds classes when ENTERING', () => {
      wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.firstChild.classList.contains('animating')).to.be.true()
      expect(container.firstChild.classList.contains('visible')).to.be.true()
      expect(container.firstChild.classList.contains('transition')).to.be.true()
    })

    it('adds classes when EXITED', () => {
      wrapperMount(
        <Transition visible={false} mountOnShow={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      expect(container.firstChild.classList.contains('hidden')).to.be.true()
      expect(container.firstChild.classList.contains('transition')).to.be.true()
    })

    it('adds classes when EXITING', () => {
      wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )
      rerenderFn(
        <Transition transitionOnMount={false} visible={false}>
          <p />
        </Transition>,
      )

      expect(container.firstChild.classList.contains('animating')).to.be.true()
      expect(container.firstChild.classList.contains('visible')).to.be.true()
      expect(container.firstChild.classList.contains('transition')).to.be.true()
    })
  })

  describe('directional', () => {
    it('adds classes when is "true"', () => {
      wrapperMount(
        <Transition directional transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.firstChild.classList.contains('in')).to.be.true()

      rerenderFn(
        <Transition directional visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.firstChild.classList.contains('out')).to.be.true()
    })

    it('do not add classes when is "false"', () => {
      wrapperMount(
        <Transition directional={false} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.firstChild.classList.contains('in')).to.be.false()

      rerenderFn(
        <Transition directional={false} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.firstChild.classList.contains('out')).to.be.false()
    })
  })

  describe('children', () => {
    it('clones element', () => {
      wrapperMount(
        <Transition>
          <p className='foo' />
        </Transition>,
      )
      expect(container.querySelector('p.foo')).to.not.be.null()
    })

    it('returns hidden content when EXITED and unmount is disabled', () => {
      wrapperMount(
        <Transition mountOnShow={false} unmountOnHide={false} visible={false}>
          <p className='foo bar' />
        </Transition>,
      )
      expect(container.querySelector('p')).to.not.be.null()
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITED)
    })
  })

  describe('constructor', () => {
    it('has default statuses', () => {
      wrapperMount(
        <Transition>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERED)
      expect(container.querySelector('p').dataset.testNextStatus).to.be.undefined()
    })

    it('sets statuses when `visible` is false', () => {
      wrapperMount(
        <Transition visible={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p')).to.be.null()
    })

    it('sets statuses when mount is disabled', () => {
      wrapperMount(
        <Transition visible={false} mountOnShow={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITED)
      expect(container.querySelector('p').dataset.testNextStatus).to.be.undefined()
    })
  })

  describe('duration', () => {
    it('does not apply to style when ENTERED', () => {
      wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )

      expect(container.firstChild.style.animationDuration).to.equal('')
    })

    it('applies default value to style when ENTERING', () => {
      wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.firstChild.style.animationDuration).to.equal('500ms')
    })

    it('applies numeric value to style when ENTERING', () => {
      wrapperMount(
        <Transition duration={1000} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.firstChild.style.animationDuration).to.equal('1000ms')
    })

    it('applies object value to style when ENTERING', () => {
      wrapperMount(
        <Transition duration={{ hide: 1000, show: 2000 }} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.firstChild.style.animationDuration).to.equal('2000ms')
    })

    it('does not apply to style when EXITED', () => {
      wrapperMount(
        <Transition visible={false} mountOnShow={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITED)
      expect(container.firstChild.style.animationDuration).to.equal('')
    })

    it('applies default value to style when EXITING', () => {
      wrapperMount(
        <Transition>
          <p />
        </Transition>,
      )

      rerenderFn(
        <Transition visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.firstChild.style.animationDuration).to.not.equal('')
    })

    it('applies numeric value to style when EXITING', () => {
      wrapperMount(
        <Transition duration={1000} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.firstChild.style.animationDuration).to.equal('1000ms')
    })

    it('applies object value to style when EXITING', () => {
      wrapperMount(
        <Transition duration={{ hide: 1000, show: 2000 }}>
          <p />
        </Transition>,
      )

      rerenderFn(
        <Transition duration={{ hide: 1000, show: 2000 }} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.firstChild.style.animationDuration).to.equal('1000ms')
    })
  })

  describe('visible', () => {
    it('updates status when set to false while ENTERING', () => {
      wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)

      rerenderFn(
        <Transition visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(TRANSITION_STATUS_EXITED)
    })

    it('updates status when set to false while ENTERED', () => {
      wrapperMount(
        <Transition transitionOnMount={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERED)

      rerenderFn(
        <Transition transitionOnMount={false} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(TRANSITION_STATUS_EXITED)
    })

    it('updates status when set to true while UNMOUNTED', () => {
      wrapperMount(
        <Transition visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).to.be.null()

      rerenderFn(
        <Transition visible>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(
        TRANSITION_STATUS_ENTERED,
      )
    })

    it('updates next status when set to true while performs an ENTERING transition', (done) => {
      wrapperMount(
        <Transition duration={10} transitionOnMount onHide={done}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)

      rerenderFn(
        <Transition duration={10} visible={false} onHide={done}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(TRANSITION_STATUS_EXITED)
    })

    it('updates next status when set to true while performs an EXITING transition', (done) => {
      wrapperMount(
        <Transition duration={10} onShow={done} visible>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERED)

      rerenderFn(
        <Transition duration={10} onShow={done} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(TRANSITION_STATUS_EXITED)

      rerenderFn(
        <Transition duration={10} onShow={done} visible>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(
        TRANSITION_STATUS_ENTERED,
      )
    })
  })

  describe('onComplete', () => {
    it('is called with (null, props) when transition completed', async () => {
      const onComplete = sandbox.spy()
      const args = await new Promise((resolve) => {
        const handleComplete = (...callbackArgs) => {
          onComplete(...callbackArgs)
          resolve(callbackArgs)
        }

        wrapperMount(
          <Transition duration={0} onComplete={handleComplete} transitionOnMount>
            <p />
          </Transition>,
        )
      })

      onComplete.should.have.been.calledOnce()
      onComplete.should.have.been.calledWithMatch(null, {
        duration: 0,
        status: TRANSITION_STATUS_ENTERED,
      })
      expect(args[0]).to.equal(null)
    })

    it('is called after a render with visibility changes', async () => {
      // This test ensures that a setTimeout will not be cleared on a simple rerender
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/4059

      const onComplete = sandbox.spy()
      vi.useFakeTimers()

      wrapperMount(
        <Transition duration={200} onComplete={onComplete} transitionOnMount>
          <p />
        </Transition>,
      )

      setTimeout(() => {
        rerenderFn(
          <Transition duration={200} onComplete={onComplete} transitionOnMount>
            <p />
          </Transition>,
        )
      }, 100)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(250)
      })

      onComplete.should.have.been.calledOnce()
      vi.useRealTimers()
    })
  })

  describe('onHide', () => {
    it('is called with (null, props) when hidden', async () => {
      const onHide = sandbox.spy()
      const args = await new Promise((resolve) => {
        const handleHide = (...callbackArgs) => {
          onHide(...callbackArgs)
          resolve(callbackArgs)
        }

        wrapperMount(
          <Transition duration={0} onHide={handleHide} transitionOnMount={false}>
            <p />
          </Transition>,
        )
        rerenderFn(
          <Transition duration={0} onHide={handleHide} transitionOnMount={false} visible={false}>
            <p />
          </Transition>,
        )
      })

      onHide.should.have.been.calledOnce()
      onHide.should.have.been.calledWithMatch(null, {
        duration: 0,
        status: TRANSITION_STATUS_EXITED,
      })
      expect(args[0]).to.equal(null)
    })

    it('depends on the specified duration', (done) => {
      const onHide = sandbox.spy()
      wrapperMount(
        <Transition duration={{ hide: 200 }} onHide={onHide} transitionOnMount={false}>
          <p />
        </Transition>,
      )

      rerenderFn(
        <Transition
          duration={{ hide: 200 }}
          onHide={onHide}
          transitionOnMount={false}
          visible={false}
        >
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)

      setTimeout(() => {
        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      }, 100)
      setTimeout(() => {
        onHide.should.have.been.calledOnce()
        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITED)

        done()
      }, 200)
    })

    it('will be called once even during rerender', async () => {
      const onStart = sandbox.spy()

      wrapperMount(
        <Transition duration={200} onStart={onStart}>
          <p />
        </Transition>,
      )

      rerenderFn(
        <Transition duration={200} onStart={onStart} visible={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(TRANSITION_STATUS_EXITED)

      rerenderFn(
        <Transition duration={200} onStart={onStart} visible={false}>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(TRANSITION_STATUS_EXITED)

      onStart.should.have.been.calledOnce()
    })
  })

  describe('onShow', () => {
    it('is called with (null, props) when shown', async () => {
      const onShow = sandbox.spy()
      const args = await new Promise((resolve) => {
        const handleShow = (...callbackArgs) => {
          onShow(...callbackArgs)
          resolve(callbackArgs)
        }

        wrapperMount(
          <Transition duration={0} onShow={handleShow} transitionOnMount>
            <p />
          </Transition>,
        )
      })

      onShow.should.have.been.calledOnce()
      onShow.should.have.been.calledWithMatch(null, {
        duration: 0,
        status: TRANSITION_STATUS_ENTERED,
      })
      expect(args[0]).to.equal(null)
    })

    it('depends on the specified duration', (done) => {
      const onShow = sandbox.spy()
      wrapperMount(
        <Transition duration={{ show: 200 }} onShow={onShow} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)

      setTimeout(() => {
        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      }, 100)
      setTimeout(() => {
        onShow.should.have.been.calledOnce()
        expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERED)
        done()
      }, 200)
    })
  })

  describe('onStart', () => {
    it('is called with (null, props) when transition started', async () => {
      const onStart = sandbox.spy()
      const args = await new Promise((resolve) => {
        const handleStart = (...callbackArgs) => {
          onStart(...callbackArgs)
          resolve(callbackArgs)
        }

        wrapperMount(
          <Transition duration={0} onStart={handleStart} transitionOnMount>
            <p />
          </Transition>,
        )
      })

      onStart.should.have.been.calledOnce()
      onStart.should.have.been.calledWithMatch(null, {
        duration: 0,
        status: TRANSITION_STATUS_ENTERING,
      })
      expect(args[0]).to.equal(null)
    })

    it('will be called once even during rerender', async () => {
      const onStart = sandbox.spy()

      wrapperMount(
        <Transition duration={200} onStart={onStart} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(
        TRANSITION_STATUS_ENTERED,
      )

      rerenderFn(
        <Transition duration={200} onStart={onStart} transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(
        TRANSITION_STATUS_ENTERED,
      )

      onStart.should.have.been.calledOnce()
    })
  })

  describe('style', () => {
    it("passes element's style", () => {
      wrapperMount(
        <Transition>
          <p style={{ bottom: 5, top: 10 }} />
        </Transition>,
      )

      expect(container.firstChild.style.bottom).to.equal('5px')
      expect(container.firstChild.style.top).to.equal('10px')
    })
  })

  describe('transitionOnMount', () => {
    it('sets statuses when is true', () => {
      wrapperMount(
        <Transition transitionOnMount>
          <p />
        </Transition>,
      )

      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_ENTERING)
      expect(container.querySelector('p').dataset.testNextStatus).to.equal(
        TRANSITION_STATUS_ENTERED,
      )
    })
  })

  describe('unmountOnHide', () => {
    it('unmounts child when true', () => {
      wrapperMount(
        <Transition duration={0} transitionOnMount={false} unmountOnHide>
          <p />
        </Transition>,
      )

      rerenderFn(
        <Transition duration={0} transitionOnMount={false} unmountOnHide visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p')).to.be.null()
    })

    it('lefts mounted when false', () => {
      wrapperMount(
        <Transition duration={0} transitionOnMount={false} unmountOnHide={false}>
          <p />
        </Transition>,
      )

      rerenderFn(
        <Transition duration={0} transitionOnMount={false} unmountOnHide={false} visible={false}>
          <p />
        </Transition>,
      )
      expect(container.querySelector('p').dataset.testStatus).to.equal(TRANSITION_STATUS_EXITED)
    })
  })
})
