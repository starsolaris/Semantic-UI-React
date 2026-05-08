import React from 'react'
import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableHeaderCell from 'src/collections/Table/TableHeaderCell'

const renderWithWrapper = (element) =>
  render(
    <table>
      <thead>
        <tr>{element}</tr>
      </thead>
    </table>,
  )

describe('TableHeaderCell', () => {
  common.isConformant(TableHeaderCell, { renderWithWrapper })
  common.forwardsRef(TableHeaderCell, { tagName: 'th', renderWithWrapper })
  common.propKeyAndValueToClassName(TableHeaderCell, 'sorted', ['ascending', 'descending'])

  it('renders as a th by default', () => {
    const { container } = render(<TableHeaderCell />)
    expect(container.firstChild.tagName).toBe('TH')
  })
})
