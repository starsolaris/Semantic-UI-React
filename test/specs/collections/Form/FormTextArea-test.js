import React from 'react'
import { render } from '@testing-library/react'

import TextArea from 'src/addons/TextArea/TextArea'
import FormTextArea from 'src/collections/Form/FormTextArea'
import * as common from 'test/specs/commonTests'

describe('FormTextArea', () => {
  common.isConformant(FormTextArea)
  common.forwardsRef(FormTextArea, { tagName: 'textarea' })
  common.labelImplementsHtmlForProp(FormTextArea)

  it('renders a FormField with a TextArea control', () => {
    const { container } = render(<FormTextArea />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toBeTruthy()
  })
})
