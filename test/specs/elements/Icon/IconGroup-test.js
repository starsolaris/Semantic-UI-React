import React from 'react'

import IconGroup from 'src/elements/Icon/IconGroup'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedElement'

describe('IconGroup', () => {
  common.isConformant(IconGroup)
  common.rendersChildren(IconGroup)

  it('renders as an <i> by default', () => {
    const element = nestedShallow(<IconGroup />)
    expect(element.tagName.toLowerCase()).to.equal('i')
  })
})
