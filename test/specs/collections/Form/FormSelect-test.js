import React from 'react'
import { render } from '@testing-library/react'

import Select from 'src/addons/Select/Select'
import FormSelect from 'src/collections/Form/FormSelect'
import * as common from 'test/specs/commonTests'

const requiredProps = {
  options: [],
}

describe('FormSelect', () => {
  common.isConformant(FormSelect, { requiredProps, ignoredTypingsProps: ['error'] })
  common.labelImplementsHtmlForProp(FormSelect, { requiredProps })
  common.forwardsRef(FormSelect, { requiredProps })

  it('renders a FormField with a Select control', () => {
    const { container } = render(<FormSelect {...requiredProps} />)
    const select = container.querySelector('.ui.selection.dropdown')
    expect(select).toBeTruthy()
  })
})
