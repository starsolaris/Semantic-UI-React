import React from 'react'
import { render } from '@testing-library/react'

import FormCheckbox from 'src/collections/Form/FormCheckbox'
import Checkbox from 'src/modules/Checkbox/Checkbox'
import * as common from 'test/specs/commonTests'

describe('FormCheckbox', () => {
  common.isConformant(FormCheckbox, {
    ignoredTypingsProps: ['type'],
  })

  it('renders a FormField with a Checkbox control', () => {
    const { container } = render(<FormCheckbox />)
    const checkbox = container.querySelector('.ui.checkbox')
    expect(checkbox).toBeTruthy()
  })

  common.forwardsRef(FormCheckbox, { tagName: 'input' })
})
