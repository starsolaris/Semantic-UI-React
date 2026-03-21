import React from 'react'

import ListList from 'src/elements/List/ListList'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedShallow'

describe('ListList', () => {
  common.isConformant(ListList)
  common.forwardsRef(ListList)
  common.rendersChildren(ListList)

  describe('list', () => {
    it('omitted when rendered as `ol`', () => {
      const element = nestedShallow(<ListList as='ol' />)
      expect(element).to.not.have.class('list')
    })

    it('omitted when rendered as `ul`', () => {
      const element = nestedShallow(<ListList as='ul' />)
      expect(element).to.not.have.class('list')
    })
  })
})
