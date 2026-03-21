import React from 'react'
import { render } from '@testing-library/react'

import FormDropdown from 'src/collections/Form/FormDropdown'
import Dropdown from 'src/modules/Dropdown/Dropdown'
import * as common from 'test/specs/commonTests'

describe('FormDropdown', () => {
  common.isConformant(FormDropdown, { ignoredTypingsProps: ['error'] })
  common.labelImplementsHtmlForProp(FormDropdown)
  common.forwardsRef(FormDropdown)

  it('renders a FormField with a Dropdown control', () => {
    const { container } = render(<FormDropdown />)
    const dropdown = container.querySelector('.ui.dropdown')
    expect(dropdown).toBeTruthy()
  })
})
