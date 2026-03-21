import React from 'react'
import { render } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import TableRow from 'src/collections/Table/TableRow'

describe('TableRow', () => {
  common.isConformant(TableRow)
  common.forwardsRef(TableRow, { tagName: 'tr' })
  common.forwardsRef(TableRow, { requiredProps: { children: <span /> }, tagName: 'tr' })
  common.rendersChildren(TableRow, {
    rendersContent: false,
  })

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
