import React from 'react'
import { render } from '@testing-library/react'

import FormButton from 'src/collections/Form/FormButton'
import Button from 'src/elements/Button/Button'
import * as common from 'test/specs/commonTests'

describe('FormButton', () => {
  common.isConformant(FormButton, {
    ignoredTypingsProps: ['label'],
  })
  common.labelImplementsHtmlForProp(FormButton)

  it('renders a FormField with a Button control', () => {
    const { container } = render(<FormButton />)
    const button = container.querySelector('button')
    expect(button).toBeTruthy()
  })

  common.forwardsRef(FormButton, { tagName: 'button' })
})
