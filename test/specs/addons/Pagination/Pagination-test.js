import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Pagination from 'src/addons/Pagination/Pagination'
import PaginationItem from 'src/addons/Pagination/PaginationItem'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

const requiredProps = {
  totalPages: 0,
}

describe('Pagination', () => {
  common.isConformant(Pagination, { requiredProps })
  common.forwardsRef(Pagination, { requiredProps, tagName: 'div' })
  common.hasSubcomponents(Pagination, [PaginationItem])

  describe('disabled', () => {
    it('is passed to an each item', () => {
      const { container } = render(<Pagination activePage={1} disabled totalPages={3} />)
      const items = container.querySelectorAll('.menu .item')

      items.forEach((item) => {
        expect(item.getAttribute('aria-disabled')).to.equal('true')
      })
    })
  })

  describe('onPageChange', () => {
    it('is called with (e, data) when clicked on a pagination item', () => {
      const onPageChange = sandbox.spy()
      const onPageItemClick = sandbox.spy()

      const { container } = render(
        <Pagination
          activePage={1}
          onPageChange={onPageChange}
          pageItem={{ onClick: onPageItemClick }}
          totalPages={3}
        />,
      )

      const items = container.querySelectorAll('.menu .item')
      fireEvent.click(items[4])

      onPageChange.should.have.been.calledOnce()
      onPageChange.should.have.been.calledWithMatch({ type: 'click' }, { activePage: 3 })
      onPageItemClick.should.have.been.calledOnce()
      onPageItemClick.should.have.been.calledWithMatch({ type: 'click' }, { value: 3 })
    })

    it('will be omitted if occurred for the same pagination item as the current', () => {
      const onPageChange = sandbox.spy()
      const { container } = render(
        <Pagination
          activePage={1}
          firstItem={null}
          onPageChange={onPageChange}
          prevItem={null}
          totalPages={3}
        />,
      )

      const items = container.querySelectorAll('.menu .item')
      fireEvent.click(items[0])
      onPageChange.should.have.not.been.called()
    })

    it('will be omitted when item "type" is "ellipsisItem"', () => {
      const onPageChange = sandbox.spy()
      const { container } = render(
        <Pagination
          activePage={5}
          firstItem={null}
          onPageChange={onPageChange}
          prevItem={null}
          totalPages={10}
        />,
      )

      const items = container.querySelectorAll('.menu .item')
      fireEvent.click(items[1])
      onPageChange.should.have.not.been.called()
    })
  })

  describe('activePage', () => {
    it('defaults to "1"', () => {
      const { container } = render(<Pagination totalPages={3} />)
      const items = Array.from(container.querySelectorAll('.menu .item')).map(
        (item) => item.textContent,
      )

      expect(items).to.include('1')
      expect(items).to.include('2')
    })

    it('can be set via "defaultActivePage"', () => {
      const { container } = render(<Pagination defaultActivePage={2} totalPages={3} />)
      const items = container.querySelectorAll('.menu .item')

      expect(items[3].classList.contains('active')).to.be.true()
    })

    it('can be set via "activePage"', () => {
      const { container } = render(<Pagination activePage={2} totalPages={3} />)
      const items = container.querySelectorAll('.menu .item')

      expect(items[3].classList.contains('active')).to.be.true()
    })
  })
})
