import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { SUI } from 'src/lib'
import Rating from 'src/modules/Rating/Rating'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('Rating', () => {
  common.isConformant(Rating)
  common.forwardsRef(Rating)
  common.hasUIClassName(Rating)

  common.propKeyOnlyToClassName(Rating, 'disabled')

  common.propValueOnlyToClassName(Rating, 'icon', ['star', 'heart'])
  common.propValueOnlyToClassName(Rating, 'size', _.without(SUI.SIZES, 'medium', 'big'))

  describe('clicking on icons', () => {
    it('makes icons active up to and including the clicked icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i.icon')

      fireEvent.click(icons[1])

      expect(icons[0].classList.contains('active')).to.equal(true)
      expect(icons[1].classList.contains('active')).to.equal(true)
      expect(icons[2].classList.contains('active')).to.equal(false)
    })

    it('if no rating selected no icon should have aria-checked', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i.icon')

      expect(icons[0].getAttribute('aria-checked')).to.equal('false')
      expect(icons[1].getAttribute('aria-checked')).to.equal('false')
      expect(icons[2].getAttribute('aria-checked')).to.equal('false')
    })

    it('makes the clicked icon aria-checked', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i.icon')

      fireEvent.click(icons[1])

      expect(icons[0].getAttribute('aria-checked')).to.equal('false')
      expect(icons[1].getAttribute('aria-checked')).to.equal('true')
      expect(icons[2].getAttribute('aria-checked')).to.equal('false')
    })

    it('set aria-setsize on each rating icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i.icon')

      expect(icons[0].getAttribute('aria-setsize')).to.equal('3')
      expect(icons[1].getAttribute('aria-setsize')).to.equal('3')
      expect(icons[2].getAttribute('aria-setsize')).to.equal('3')
    })

    it('sets aria-posinset on each rating icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i.icon')

      expect(icons[0].getAttribute('aria-posinset')).to.equal('1')
      expect(icons[1].getAttribute('aria-posinset')).to.equal('2')
      expect(icons[2].getAttribute('aria-posinset')).to.equal('3')
    })

    it('removes the "selected" prop', () => {
      const { container } = render(<Rating maxRating={3} />)
      const lastIcon = container.querySelectorAll('i.icon')[2]

      fireEvent.mouseEnter(lastIcon)
      fireEvent.click(lastIcon)
      expect(container.querySelector('.selected')).toBeFalsy()
      expect(container.querySelectorAll('.selected.icon')).toHaveLength(0)
    })
  })

  describe('hovering on icons', () => {
    it('adds the "selected" className to the Rating', () => {
      const { container } = render(<Rating maxRating={3} />)
      const firstIcon = container.querySelector('i.icon')

      fireEvent.mouseEnter(firstIcon)
      expect(container.firstChild.classList.contains('selected')).to.equal(true)
    })

    it('selects icons up to and including the hovered icon', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i.icon')

      fireEvent.mouseEnter(icons[1])

      expect(icons[0].classList.contains('selected')).to.equal(true)
      expect(icons[1].classList.contains('selected')).to.equal(true)
      expect(icons[2].classList.contains('selected')).to.equal(false)
    })

    it('unselects icons on mouse leave', () => {
      const { container } = render(<Rating maxRating={3} />)
      const lastIcon = container.querySelectorAll('i.icon')[2]

      fireEvent.mouseEnter(lastIcon)
      fireEvent.mouseLeave(container.firstChild)

      expect(container.querySelectorAll('.selected.icon')).toHaveLength(0)
    })
  })

  describe('clearable', () => {
    it('prevents clearing by default with multiple icons', () => {
      const { container } = render(<Rating defaultRating={5} maxRating={5} />)
      const lastIcon = container.querySelectorAll('i.icon')[4]

      fireEvent.click(lastIcon)
      expect(container.querySelectorAll('.active.icon')).toHaveLength(5)
    })

    it('allows toggling when set to "auto" with a single icon', () => {
      const { container } = render(<Rating clearable='auto' maxRating={1} />)
      const icon = container.querySelector('i.icon')

      fireEvent.click(icon)
      expect(icon.classList.contains('active')).to.equal(true)

      fireEvent.click(icon)
      expect(icon.classList.contains('active')).to.equal(false)
    })

    it('allows clearing when true with a single icon', () => {
      const { container } = render(<Rating clearable defaultRating={1} maxRating={1} />)
      const icon = container.querySelector('i.icon')

      fireEvent.click(icon)
      expect(icon.classList.contains('active')).to.equal(false)
    })

    it('allows clearing when true with multiple icons', () => {
      const { container } = render(<Rating clearable defaultRating={4} maxRating={5} />)
      const icon3 = container.querySelectorAll('i.icon')[3]

      fireEvent.click(icon3)
      expect(container.querySelectorAll('.active.icon')).toHaveLength(0)
    })

    it('prevents clearing when false with a single icon', () => {
      const { container } = render(<Rating clearable={false} defaultRating={1} maxRating={1} />)
      const icon = container.querySelector('i.icon')

      fireEvent.click(icon)
      expect(icon.classList.contains('active')).to.equal(true)
    })

    it('prevents clearing when false with multiple icons', () => {
      const { container } = render(<Rating clearable={false} defaultRating={5} maxRating={5} />)
      const lastIcon = container.querySelectorAll('i.icon')[4]

      fireEvent.click(lastIcon)
      expect(container.querySelectorAll('.active.icon')).toHaveLength(5)
    })
  })

  describe('disabled', () => {
    it('prevents the rating from being toggled', () => {
      const { container } = render(<Rating clearable='auto' disabled maxRating={1} rating={1} />)
      const icon = container.querySelector('i.icon')
      fireEvent.click(icon)
      expect(icon.classList.contains('active')).to.equal(true)

      const { container: c2 } = render(
        <Rating clearable='auto' disabled maxRating={1} rating={0} />,
      )
      const icon2 = c2.querySelector('i.icon')
      fireEvent.click(icon2)
      expect(icon2.classList.contains('active')).to.equal(false)
    })

    it('prevents the rating from being cleared', () => {
      const { container } = render(<Rating disabled maxRating={3} rating={3} />)
      const lastIcon = container.querySelectorAll('i.icon')[2]
      fireEvent.click(lastIcon)
      expect(container.querySelectorAll('.active.icon')).toHaveLength(3)
    })

    it('prevents icons from becoming selected on mouse enter', () => {
      const { container } = render(<Rating disabled maxRating={3} />)
      const lastIcon = container.querySelectorAll('i.icon')[2]
      fireEvent.mouseEnter(lastIcon)
      expect(container.querySelectorAll('.selected.icon')).toHaveLength(0)
    })

    it('prevents icons from becoming unselected on mouse leave when disabled', () => {
      // First, select icons in a non-disabled rating
      const { container } = render(<Rating maxRating={3} />)
      const lastIcon = container.querySelectorAll('i.icon')[2]

      fireEvent.mouseEnter(lastIcon)
      expect(container.querySelectorAll('.selected.icon')).toHaveLength(3)

      // Now test that disabled rating doesn't respond to mouse events
      const { container: c2 } = render(<Rating disabled maxRating={3} />)
      const c2LastIcon = c2.querySelectorAll('i.icon')[2]
      fireEvent.mouseEnter(c2LastIcon)
      // Should not select any icons when disabled
      expect(c2.querySelectorAll('.selected.icon')).toHaveLength(0)
    })

    it('prevents icons from becoming active on click', () => {
      const { container } = render(<Rating disabled maxRating={3} />)
      const lastIcon = container.querySelectorAll('i.icon')[2]
      fireEvent.click(lastIcon)
      expect(container.querySelectorAll('.active.icon')).toHaveLength(0)
    })
  })

  describe('maxRating', () => {
    it('controls how many icons are displayed', () => {
      _.times(10, (i) => {
        const maxRating = i + 1
        const { container } = render(<Rating maxRating={maxRating} />)
        const icons = container.querySelectorAll('i.icon')
        expect(icons.length).to.equal(maxRating)
      })
    })
  })

  describe('onRate', () => {
    it('is called with (event, { rating, maxRating } on icon click', () => {
      const spy = sandbox.spy()

      const { container } = render(<Rating maxRating={3} onRate={spy} />)
      const lastIcon = container.querySelectorAll('i.icon')[2]
      fireEvent.click(lastIcon)

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({ type: 'click' }, { rating: 3, maxRating: 3 })
    })
  })

  describe('rating', () => {
    it('controls how many icons are active', () => {
      const { container, rerender } = render(<Rating maxRating={10} />)
      _.times(10, (rating) => {
        rerender(<Rating maxRating={10} rating={rating} />)
        expect(container.querySelectorAll('.active.icon').length).to.equal(
          rating,
          `Rating should have ${rating} RatingIcon with "active" prop`,
        )
      })
    })
  })

  describe('tabIndex', () => {
    it('sets icons tabIndex to -1 to prevent focus when element is disabled', () => {
      const { container } = render(<Rating maxRating={3} />)
      const icons = container.querySelectorAll('i.icon')
      icons.forEach((node) => expect(node.tabIndex).to.equal(0))

      const { container: c2 } = render(<Rating disabled maxRating={3} />)
      const icons2 = c2.querySelectorAll('i.icon')
      icons2.forEach((node) => expect(node.tabIndex).to.equal(-1))
    })

    it('sets Rating element tabIndex to 0 to allow focusing the whole group when disabled', () => {
      const { container } = render(<Rating maxRating={3} />)
      expect(container.firstChild.tabIndex).to.equal(-1)

      const { container: c2 } = render(<Rating disabled maxRating={3} />)
      expect(c2.firstChild.tabIndex).to.equal(0)
    })
  })
})
