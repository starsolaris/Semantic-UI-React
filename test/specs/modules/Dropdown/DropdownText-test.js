import React from 'react'
import { render } from '@testing-library/react'

import DropdownText from 'src/modules/Dropdown/DropdownText'
import * as common from 'test/specs/commonTests'

describe('DropdownText', () => {
  common.isConformant(DropdownText)
  common.forwardsRef(DropdownText)
  common.rendersChildren(DropdownText)

  it('aria attributes', () => {
    const { container } = render(<DropdownText />)
    const element = container.firstChild

    expect(element).toHaveAttribute('aria-live', 'polite')
    expect(element).toHaveAttribute('aria-atomic', 'true')
    expect(element).toHaveAttribute('role', 'alert')
  })
})
