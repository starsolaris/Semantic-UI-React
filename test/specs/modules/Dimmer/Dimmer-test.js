import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Portal from 'src/addons/Portal/Portal'
import Dimmer from 'src/modules/Dimmer/Dimmer'
import DimmerDimmable from 'src/modules/Dimmer/DimmerDimmable'
import DimmerInner from 'src/modules/Dimmer/DimmerInner'
import * as common from 'test/specs/commonTests'

describe('Dimmer', () => {
  common.isConformant(Dimmer)
  common.forwardsRef(Dimmer)
  common.hasSubcomponents(Dimmer, [DimmerDimmable, DimmerInner])

  common.implementsCreateMethod(Dimmer)

  describe('children', () => {
    it('renders a DimmerInner', () => {
      const { container } = render(<Dimmer />)
      expect(container.querySelector('.ui.dimmer')).toBeTruthy()
    })
  })

  describe('page', () => {
    it('renders a Portal', () => {
      const { container } = render(<Dimmer page />)
      expect(container.querySelector('.ui.portal')).toBeTruthy()
    })

    describe('active', () => {
      beforeEach(() => {
        document.body.classList.remove('dimmable', 'dimmed')
      })

      it('when true, Portal is opened dimmer classes are present on body', () => {
        const { container } = render(<Dimmer page active />)
        const classes = document.body.classList

        expect(classes.contains('dimmable')).to.equal(true)
        expect(classes.contains('dimmed')).to.equal(true)
      })

      it('when false, Portal is closed dimmer classes are absent on body', () => {
        const { container } = render(<Dimmer page active={false} />)
        const classes = document.body.classList

        expect(classes.contains('dimmable')).to.equal(false)
        expect(classes.contains('dimmed')).to.equal(false)
      })

      it('when changed to false, dimmer classes are removed from body', () => {
        const { rerender } = render(<Dimmer page active />)
        const classes = document.body.classList

        rerender(<Dimmer page active={false} />)

        expect(classes.contains('dimmable')).to.equal(false)
        expect(classes.contains('dimmed')).to.equal(false)
      })
    })
  })
})
