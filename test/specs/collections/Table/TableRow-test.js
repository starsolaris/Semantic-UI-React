import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableRow from 'src/collections/Table/TableRow'

const renderWithWrapper = (element) =>
  render(
    <table>
      <tbody>{element}</tbody>
    </table>,
  )

describe('TableRow', () => {
  common.isConformant(TableRow, { renderWithWrapper })
  common.forwardsRef(TableRow, { tagName: 'tr', renderWithWrapper })

  common.implementsCreateMethod(TableRow)
  common.implementsTextAlignProp(TableRow, ['left', 'center', 'right'])
  common.implementsVerticalAlignProp(TableRow)

  common.propKeyOnlyToClassName(TableRow, 'active')
  common.propKeyOnlyToClassName(TableRow, 'disabled')
  common.propKeyOnlyToClassName(TableRow, 'error')
  common.propKeyOnlyToClassName(TableRow, 'negative')
  common.propKeyOnlyToClassName(TableRow, 'positive')
  common.propKeyOnlyToClassName(TableRow, 'warning')

  it('renders as a tr by default', () => {
    const { container } = render(<TableRow />)
    expect(container.firstChild.tagName).toBe('TR')
  })

  it('renders cell children', () => {
    const { container } = renderWithWrapper(
      <TableRow>
        <td data-child='cell' />
      </TableRow>,
    )

    expect(container.querySelector('[data-child="cell"]')).to.exist
  })

  describe('shorthand', () => {
    const cells = ['Name', 'Status', 'Notes']

    it('renders empty tr with no shorthand', () => {
      const { container } = render(<TableRow />)
      expect(container.querySelectorAll('td')).toHaveLength(0)
    })

    it('renders the cells', () => {
      const { container } = render(<TableRow cells={cells} />)
      expect(container.querySelectorAll('td')).toHaveLength(cells.length)
    })

    it('renders the cells using cellAs', () => {
      const { container } = render(<TableRow cells={cells} cellAs='th' />)
      const headerCells = container.querySelectorAll('th')

      expect(headerCells).toHaveLength(cells.length)
    })
  })
})
