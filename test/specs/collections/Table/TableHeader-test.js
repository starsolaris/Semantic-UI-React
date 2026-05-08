import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableHeader from 'src/collections/Table/TableHeader'

const renderWithWrapper = (element) => render(<table>{element}</table>)

describe('TableHeader', () => {
  common.isConformant(TableHeader, { renderWithWrapper })
  common.forwardsRef(TableHeader, { tagName: 'thead', renderWithWrapper })

  common.propKeyOnlyToClassName(TableHeader, 'fullWidth', {
    className: 'full-width',
  })

  it('renders as a thead by default', () => {
    const { container } = render(<TableHeader />)
    expect(container.firstChild.tagName).toBe('THEAD')
  })

  it('renders row children', () => {
    const { container } = renderWithWrapper(
      <TableHeader>
        <tr data-child='row' />
      </TableHeader>,
    )

    expect(container.querySelector('[data-child="row"]')).to.exist
  })
})
