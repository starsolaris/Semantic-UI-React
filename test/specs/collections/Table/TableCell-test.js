import React from 'react'
import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableCell from 'src/collections/Table/TableCell'
import { SUI } from 'src/lib'

const renderWithWrapper = (element) =>
  render(
    <table>
      <tbody>
        <tr>{element}</tr>
      </tbody>
    </table>,
  )

describe('TableCell', () => {
  common.isConformant(TableCell, { renderWithWrapper })
  common.forwardsRef(TableCell, { tagName: 'td', renderWithWrapper })
  common.forwardsRef(TableCell, {
    requiredProps: { children: <span /> },
    tagName: 'td',
    renderWithWrapper,
  })
  common.rendersChildren(TableCell, { renderWithWrapper })

  common.implementsCreateMethod(TableCell)
  common.implementsTextAlignProp(TableCell, ['left', 'center', 'right'])
  common.implementsVerticalAlignProp(TableCell)
  common.implementsWidthProp(TableCell, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'width',
    widthClass: 'wide',
  })

  common.propKeyOnlyToClassName(TableCell, 'active')
  common.propKeyOnlyToClassName(TableCell, 'collapsing')
  common.propKeyOnlyToClassName(TableCell, 'disabled')
  common.propKeyOnlyToClassName(TableCell, 'error')
  common.propKeyOnlyToClassName(TableCell, 'negative')
  common.propKeyOnlyToClassName(TableCell, 'positive')
  common.propKeyOnlyToClassName(TableCell, 'selectable')
  common.propKeyOnlyToClassName(TableCell, 'singleLine', {
    className: 'single line',
  })
  common.propKeyOnlyToClassName(TableCell, 'warning')

  it('renders as a td by default', () => {
    const { container } = render(<TableCell />)
    expect(container.firstChild.tagName).toBe('TD')
  })
})
