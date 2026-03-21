import React from 'react'
import { render } from '@testing-library/react'

import Transition from 'src/modules/Transition/Transition'
import TransitionGroup from 'src/modules/Transition/TransitionGroup'
import * as common from 'test/specs/commonTests'

let wrapper

const wrapperMount = (...args) => {
  const result = render(...args)
  wrapper = result
  return result
}

describe('TransitionGroup', () => {
  common.isConformant(TransitionGroup, {
    rendersFragmentByDefault: true,
    rendersChildren: false,
  })
  common.forwardsRef(TransitionGroup, { requiredProps: { as: 'div' } })

  beforeEach(() => {
    wrapper = undefined
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) wrapper.unmount()
  })

  describe('children', () => {
    it('wraps all children to Transition', () => {
      wrapperMount(
        <TransitionGroup>
          <div />
          <div />
          <div />
        </TransitionGroup>,
      )

      const children = wrapper.container.firstChild.children
      expect(children.length).to.equal(3)
      Array.from(children).forEach(child => {
        expect(child.classList.contains('transition')).to.be.true()
      })
    })

    it('passes props to children', () => {
      wrapperMount(
        <TransitionGroup animation='scale' directional duration={1500}>
          <div />
          <div />
          <div />
        </TransitionGroup>,
      )

      const children = wrapper.container.firstChild.children
      expect(children.length).to.equal(3)
      Array.from(children).forEach(child => {
        expect(child.classList.contains('scale')).to.be.true()
        expect(child.classList.contains('transition')).to.be.true()
      })
    })

    it('wraps new child to Transition and sets transitionOnMount to true', () => {
      wrapperMount(
        <TransitionGroup>
          <div key='first' />
        </TransitionGroup>,
      )
      wrapper.rerender(
        <TransitionGroup>
          <div key='first' />
          <div key='second' />
        </TransitionGroup>,
      )

      const children = wrapper.container.firstChild.children
      expect(children.length).to.equal(2)
      expect(children[1].classList.contains('transition')).to.be.true()
    })

    it('skips invalid children', () => {
      wrapperMount(
        <TransitionGroup>
          <div key='first' />
        </TransitionGroup>,
      )
      wrapper.rerender(
        <TransitionGroup>
          <div key='first' />
          {''}
          <div key='second' />
        </TransitionGroup>,
      )

      const children = wrapper.container.firstChild.children
      expect(children.length).to.equal(2)
    })

    it('sets visible to false when child was removed', () => {
      wrapperMount(
        <TransitionGroup>
          <div key='first' />
          <div key='second' />
        </TransitionGroup>,
      )
      wrapper.rerender(
        <TransitionGroup>
          <div key='first' />
        </TransitionGroup>,
      )

      const children = wrapper.container.firstChild.children
      expect(children.length).to.equal(2)
      expect(children[0].classList.contains('transition')).to.be.true()
      expect(children[1].classList.contains('transition')).to.be.true()
    })

    it('removes child after transition', (done) => {
      wrapperMount(
        <TransitionGroup duration={0}>
          <div key='first' />
          <div key='second' />
        </TransitionGroup>,
      )
      wrapper.rerender(
        <TransitionGroup duration={0}>
          <div key='first' />
        </TransitionGroup>,
      )

      setTimeout(() => {
        const children = wrapper.container.firstChild.children
        expect(children.length).to.equal(1)

        done()
      }, 0)
    })
  })
})
