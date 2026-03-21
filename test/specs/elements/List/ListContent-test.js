import faker from 'faker'
import React from 'react'

import ListContent from 'src/elements/List/ListContent'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedShallow'

describe('ListContent', () => {
  common.isConformant(ListContent)
  common.forwardsRef(ListContent)
  common.forwardsRef(ListContent, { requiredProps: { children: <span /> } })
  common.rendersChildren(ListContent)

  common.implementsCreateMethod(ListContent)

  common.implementsVerticalAlignProp(ListContent)
  common.propKeyAndValueToClassName(ListContent, 'floated', SUI.FLOATS)

  describe('shorthand', () => {
    const baseProps = {
      content: faker.hacker.phrase(),
      description: faker.hacker.phrase(),
      header: faker.hacker.phrase(),
    }

    it('renders content without wrapping ListContent', () => {
      const element = nestedShallow(<ListContent {...baseProps} />)

      const header = element.querySelector('.header')
      const description = element.querySelector('.description')

      expect(header.textContent).to.equal(baseProps.header)
      expect(description.textContent).to.equal(baseProps.description)
      expect(element.textContent).to.include(baseProps.content)
    })
  })
})
