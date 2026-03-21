import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Icon from 'src/elements/Icon/Icon'
import IconGroup from 'src/elements/Icon/IconGroup'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
import nestedShallow from 'test/utils/nestedShallow'

describe('Icon', () => {
  common.isConformant(Icon)
  common.forwardsRef(Icon, { isMemoized: true, tagName: 'i' })
  common.hasSubcomponents(Icon, [IconGroup])

  common.implementsCreateMethod(Icon)

  common.propKeyAndValueToClassName(Icon, 'flipped', ['horizontally', 'vertically'])
  common.propKeyAndValueToClassName(Icon, 'rotated', ['clockwise', 'counterclockwise'])

  common.propKeyOnlyToClassName(Icon, 'bordered')
  common.propKeyOnlyToClassName(Icon, 'circular')
  common.propKeyOnlyToClassName(Icon, 'disabled')
  common.propKeyOnlyToClassName(Icon, 'fitted')
  common.propKeyOnlyToClassName(Icon, 'inverted')
  common.propKeyOnlyToClassName(Icon, 'link')
  common.propKeyOnlyToClassName(Icon, 'loading')

  common.propKeyOrValueAndKeyToClassName(Icon, 'corner', [
    'top left',
    'top right',
    'bottom left',
    'bottom right',
  ])

  common.propValueOnlyToClassName(Icon, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Icon, 'name', ['money'])
  common.propValueOnlyToClassName(Icon, 'size', _.without(SUI.SIZES, 'medium'))

  it('renders as an <i> by default', () => {
    const element = nestedShallow(<Icon />)
    expect(element.tagName.toLowerCase()).to.equal('i')
  })

  describe('aria-hidden', () => {
    it('should add aria-hidden by default', () => {
      const element = nestedShallow(<Icon />)
      expect(element.getAttribute('aria-hidden')).to.equal('true')
    })

    it('should pass aria-hidden', () => {
      let element = nestedShallow(<Icon aria-hidden='true' />)
      expect(element.getAttribute('aria-hidden')).to.equal('true')

      element = nestedShallow(<Icon aria-hidden='false' />)
      expect(element.getAttribute('aria-hidden')).to.equal('false')
    })

    it('should passed aria-hidden with aria-label', () => {
      const element = nestedShallow(<Icon aria-hidden='false' aria-label='icon' />)
      expect(element.getAttribute('aria-hidden')).to.equal('false')
    })
  })

  describe('aria-label', () => {
    it('should not applied by default', () => {
      const element = nestedShallow(<Icon />)
      expect(element.getAttribute('aria-label')).to.be.null()
    })

    it('should pass value and omit aria-hidden when is set', () => {
      const element = nestedShallow(<Icon aria-label='icon' />)

      expect(element.getAttribute('aria-hidden')).to.be.null()
      expect(element.getAttribute('aria-label')).to.equal('icon')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = sandbox.spy()
      const { container } = render(<Icon onClick={onClick} />)

      fireEvent.click(container.firstChild)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' }, { onClick })
    })

    it('is not called when "disabled" is true', () => {
      const onClick = sandbox.spy()
      const preventDefault = sandbox.spy()
      const { container } = render(<Icon disabled onClick={onClick} />)

      fireEvent.click(container.firstChild, { preventDefault })

      onClick.should.have.not.been.called()
      preventDefault.should.have.calledOnce()
    })
  })
})
