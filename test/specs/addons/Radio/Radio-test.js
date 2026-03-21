import React from 'react'
import { render } from '@testing-library/react'

import Radio from 'src/addons/Radio/Radio'
import * as common from 'test/specs/commonTests'

describe('Radio', () => {
  common.isConformant(Radio)
  common.forwardsRef(Radio, { tagName: 'input' })

  it('renders a radio Checkbox', () => {
    const { container } = render(<Radio />)
    const input = container.querySelector('input')
    expect(input.type).to.equal('radio')
  })

  it('is not a radio when slider', () => {
    const { container } = render(<Radio slider />)
    const input = container.querySelector('input')
    expect(input.type).to.equal('checkbox')
  })

  it('is not a radio when toggle', () => {
    const { container } = render(<Radio toggle />)
    const input = container.querySelector('input')
    expect(input.type).to.equal('checkbox')
  })
})
