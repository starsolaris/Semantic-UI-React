import React from 'react'
import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableFooter from 'src/collections/Table/TableFooter'

const renderWithWrapper = (element) => render(<table>{element}</table>)

describe('TableFooter', () => {
  common.isConformant(TableFooter, { renderWithWrapper })
  common.forwardsRef(TableFooter, { tagName: 'tfoot', renderWithWrapper })

  it('renders as a tfoot by default', () => {
    const { container } = render(<TableFooter />)
    expect(container.firstChild.tagName).toBe('TFOOT')
  })
})
