import React from 'react'
import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableBody from 'src/collections/Table/TableBody'

describe('TableBody', () => {
  common.isConformant(TableBody)
  common.forwardsRef(TableBody, { tagName: 'tbody' })
  common.rendersChildren(TableBody, {
    rendersContent: false,
  })

  it('renders as a tbody by default', () => {
    const { container } = render(<TableBody />)
    expect(container.firstChild.tagName).toBe('TBODY')
  })
})
