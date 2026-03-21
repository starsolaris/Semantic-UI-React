import React from 'react'
import { render } from '@testing-library/react'

import ModalDimmer from 'src/modules/Modal/ModalDimmer'
import * as common from 'test/specs/commonTests'

describe('ModalDimmer', () => {
  common.isConformant(ModalDimmer)
  common.forwardsRef(ModalDimmer)
  common.hasUIClassName(ModalDimmer)
  common.rendersChildren(ModalDimmer)

  common.propKeyOnlyToClassName(ModalDimmer, 'inverted')

  it('has required classes', () => {
    const { container } = render(<ModalDimmer mountNode={null} />)
    const element = container.firstChild

    expect(element.classList.contains('page')).to.be.true()
    expect(element.classList.contains('modals')).to.be.true()
    expect(element.classList.contains('dimmer')).to.be.true()
    expect(element.classList.contains('transition')).to.be.true()
    expect(element.classList.contains('visible')).to.be.true()
    expect(element.classList.contains('active')).to.be.true()
  })

  describe('children', () => {
    it('adds classes to "mountNode"', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} />)

      expect(element.className).to.include('dimmable')
      expect(element.className).to.include('dimmed')
    })
  })

  describe('blurring', () => {
    it('adds nothing "mountNode" by default', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} />)

      expect(element.className).to.not.include('blurring')
    })

    it('adds a class to "MountNode" when is "true"', () => {
      const element = document.createElement('div')
      render(<ModalDimmer blurring mountNode={element} />)

      expect(element.className).to.include('blurring')
    })
  })

  describe('centered', () => {
    it('adds "top aligned" to "className" by default', () => {
      const { container } = render(<ModalDimmer />)
      const dimmer = container.querySelector('.dimmer')

      expect(dimmer.classList.contains('top aligned')).to.be.true()
    })

    it('adds nothing to "className" when is "true"', () => {
      const { container } = render(<ModalDimmer centered />)
      const dimmer = container.querySelector('.dimmer')

      expect(dimmer.classList.contains('top aligned')).to.be.false()
    })
  })

  describe('scrolling', () => {
    it('adds nothing "MountNode" by default', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} />)

      expect(element.className).to.not.include('scrolling')
    })

    it('adds "className" to "MountNode"', () => {
      const element = document.createElement('div')
      render(<ModalDimmer mountNode={element} scrolling />)

      expect(element.className).to.include('scrolling')
    })
  })

  describe('style', () => {
    it('adds "display: flex" with "important"', () => {
      const { container } = render(<ModalDimmer />)
      const element = container.firstChild
      const style = element.style

      expect(style.getPropertyValue('display')).to.equal('flex')
      expect(style.getPropertyPriority('display')).to.equal('important')
    })
  })
})
