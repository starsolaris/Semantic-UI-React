import React from 'react'

import Container from 'src/elements/Container/Container'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedElement'

describe('Container', () => {
  common.isConformant(Container)
  common.forwardsRef(Container)
  common.rendersChildren(Container)
  common.hasUIClassName(Container)

  common.propKeyOnlyToClassName(Container, 'text')
  common.propKeyOnlyToClassName(Container, 'fluid')

  common.implementsTextAlignProp(Container)

  it('renders a <div /> element', () => {
    const element = nestedShallow(<Container />)
    expect(element.tagName.toLowerCase()).to.equal('div')
  })
})
