import faker from 'faker'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import DimmerInner from 'src/modules/Dimmer/DimmerInner'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('DimmerInner', () => {
  common.isConformant(DimmerInner)
  common.forwardsRef(DimmerInner)
  common.hasUIClassName(DimmerInner)
  common.rendersChildren(DimmerInner)

  common.implementsVerticalAlignProp(DimmerInner, ['bottom', 'top'])

  common.propKeyOnlyToClassName(DimmerInner, 'active', {
    className: 'active transition visible',
  })
  common.propKeyOnlyToClassName(DimmerInner, 'disabled')
  common.propKeyOnlyToClassName(DimmerInner, 'inverted')
  common.propKeyOnlyToClassName(DimmerInner, 'simple')

  describe('active', () => {
    it('adds "display: flex" after set to "true"', () => {
      const { container, rerender } = render(<DimmerInner />)
      expect(container.firstChild).not.toHaveStyle({ display: 'flex' })

      rerender(<DimmerInner active />)
      expect(container.firstChild).toHaveStyle({ display: 'flex' })
    })
  })

  describe('onClickOutside', () => {
    it('called when Dimmer has not children', () => {
      const onClickOutside = sandbox.spy()
      const { container } = render(<DimmerInner onClickOutside={onClickOutside} />)

      fireEvent.click(container.firstChild)
      onClickOutside.should.have.been.calledOnce()
    })

    it('omitted when click on children', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      const onClickOutside = sandbox.spy()
      const { container, unmount } = render(
        <DimmerInner onClickOutside={onClickOutside}>
          <div>{faker.hacker.phrase()}</div>
        </DimmerInner>,
        { container: element },
      )

      const child = container.querySelector('div.content > div')
      fireEvent.click(child)
      onClickOutside.should.have.not.been.called()

      unmount()
      document.body.removeChild(element)
    })

    it('called when click on Dimmer', () => {
      const onClickOutside = sandbox.spy()
      const { container } = render(
        <DimmerInner onClickOutside={onClickOutside}>{faker.hacker.phrase()}</DimmerInner>,
      )

      fireEvent.click(container.firstChild)
      onClickOutside.should.have.been.calledOnce()
    })

    it('called when click on center', () => {
      const onClickOutside = sandbox.spy()
      const { container } = render(
        <DimmerInner onClickOutside={onClickOutside}>{faker.hacker.phrase()}</DimmerInner>,
      )

      const content = container.querySelector('div.content')
      fireEvent.click(content)
      onClickOutside.should.have.been.calledOnce()
    })
  })
})
