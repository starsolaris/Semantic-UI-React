import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableBody from 'src/collections/Table/TableBody'

const renderWithWrapper = (element) => render(<table>{element}</table>)

describe('TableBody', () => {
  common.isConformant(TableBody, { renderWithWrapper })
  common.forwardsRef(TableBody, { tagName: 'tbody', renderWithWrapper })

  it('renders as a tbody by default', () => {
    const { container } = render(<TableBody />)
    expect(container.firstChild.tagName).toBe('TBODY')
  })

  it('renders row children', () => {
    const { container } = renderWithWrapper(
      <TableBody>
        <tr data-child='row' />
      </TableBody>,
    )

    expect(container.querySelector('[data-child="row"]')).to.exist
  })
})
