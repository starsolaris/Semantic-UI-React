import React from 'react'
import { render } from '@testing-library/react'

import SearchCategory from 'src/modules/Search/SearchCategory'
import * as common from 'test/specs/commonTests'

describe('SearchCategory', () => {
  common.isConformant(SearchCategory)
  common.forwardsRef(SearchCategory)
  common.rendersChildren(SearchCategory)

  describe('children', () => {
    it('should be a child with a "name" className', () => {
      const { container } = render(<SearchCategory />)
      const children = container.firstChild.children

      expect(children[0].classList.contains('name')).to.be.true()
    })

    it('should be wrapped with a "results" className', () => {
      const { container } = render(<SearchCategory />)
      const children = container.firstChild.children

      expect(children[1].classList.contains('results')).to.be.true()
    })
  })
})
