import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import BreadcrumbSection from 'src/collections/Breadcrumb/BreadcrumbSection'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('BreadcrumbSection', () => {
  common.isConformant(BreadcrumbSection)
  common.forwardsRef(BreadcrumbSection)
  common.rendersChildren(BreadcrumbSection)

  common.propKeyOnlyToClassName(BreadcrumbSection, 'active')

  it('renders as a div by default', () => {
    const { container } = render(<BreadcrumbSection />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  describe('link', () => {
    it('is should be `a` when has prop link', () => {
      const { container } = render(<BreadcrumbSection link />)
      expect(container.firstChild.tagName).toBe('A')
    })
  })

  describe('href', () => {
    it('is not present by default', () => {
      const { container } = render(<BreadcrumbSection />)
      expect(container.firstChild.hasAttribute('href')).toBe(false)
    })

    it('should have attr `href` when has prop', () => {
      const { container } = render(<BreadcrumbSection href='http://example.com' />)

      expect(container.firstChild.tagName).toBe('A')
      expect(container.firstChild.getAttribute('href')).toBe('http://example.com')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', () => {
      const onClick = sandbox.spy()
      const props = { active: true, content: 'home' }

      const { container } = render(<BreadcrumbSection onClick={onClick} {...props} />)
      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(props),
      )
    })
  })
})
