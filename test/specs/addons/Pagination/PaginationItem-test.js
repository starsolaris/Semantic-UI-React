import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import PaginationItem from 'src/addons/Pagination/PaginationItem'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('PaginationItem', () => {
  common.isConformant(PaginationItem)
  common.forwardsRef(PaginationItem, { tagName: 'a' })
  common.implementsCreateMethod(PaginationItem)

  describe('active', () => {
    it('is "undefined" by default', () => {
      const { container } = render(<PaginationItem />)
      const element = container.firstChild
      expect(element.getAttribute('active')).to.be.null()
    })

    it('can pass its value', () => {
      const { container } = render(<PaginationItem active />)
      const element = container.firstChild
      expect(element.getAttribute('aria-current')).to.equal('true')
    })
  })

  describe('aria-current', () => {
    it('matches the values of "active" prop by default', () => {
      const { container } = render(<PaginationItem active />)
      const element = container.firstChild
      expect(element.getAttribute('aria-current')).to.equal('true')
    })

    it('can be overridden', () => {
      const { container } = render(<PaginationItem active aria-current={false} />)
      const element = container.firstChild
      expect(element.getAttribute('aria-current')).to.equal('false')
    })
  })

  describe('disabled', () => {
    it('is "false" by default', () => {
      const { container } = render(<PaginationItem />)
      const element = container.firstChild

      expect(element.getAttribute('disabled')).to.be.null()
      expect(element.getAttribute('aria-disabled')).to.equal('false')
    })

    it('is "true" when "type" is "ellipsisItem"', () => {
      const { container } = render(<PaginationItem type='ellipsisItem' />)
      const element = container.firstChild

      expect(element.getAttribute('aria-disabled')).to.equal('true')
    })

    it('can be overridden', () => {
      const { container } = render(<PaginationItem disabled />)
      const element = container.firstChild

      expect(element.getAttribute('aria-disabled')).to.equal('true')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', () => {
      const onClick = sandbox.spy()

      const { container } = render(<PaginationItem onClick={onClick} />)
      fireEvent.click(container.firstChild)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' }, { onClick })
    })

    it('is called with (e, props) when "Enter" is pressed', () => {
      const event = { key: 'Enter' }
      const onClick = sandbox.spy()

      const { container } = render(<PaginationItem onClick={onClick} />)
      fireEvent.keyDown(container.firstChild, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ key: 'Enter' }, { onClick })
    })
  })

  describe('onKeyDown', () => {
    it('is called with (e, props) when clicked', () => {
      const event = { key: 'Enter' }
      const onKeyDown = sandbox.spy()

      const { container } = render(<PaginationItem onKeyDown={onKeyDown} />)
      fireEvent.keyDown(container.firstChild, event)

      onKeyDown.should.have.been.calledOnce()
      onKeyDown.should.have.been.calledWithMatch({ key: 'Enter' }, { onKeyDown })
    })
  })

  describe('tabIndex', () => {
    it('is "0" by default', () => {
      const { container } = render(<PaginationItem />)
      const element = container.firstChild
      expect(element.tabIndex).to.equal(0)
    })

    it('is "-1" when "type" is "ellipsisItem"', () => {
      const { container } = render(<PaginationItem type='ellipsisItem' />)
      const element = container.firstChild
      expect(element.tabIndex).to.equal(-1)
    })

    it('can be overridden', () => {
      const { container } = render(<PaginationItem tabIndex={5} />)
      const element = container.firstChild
      expect(element.tabIndex).to.equal(5)
    })
  })
})
