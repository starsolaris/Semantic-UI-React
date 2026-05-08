import faker from 'faker'
import React from 'react'

import Loader from 'src/elements/Loader/Loader'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedElement'

const hasClass = (element, className) => element.className.split(/\s+/).includes(className)

describe('Loader', () => {
  common.isConformant(Loader)
  common.forwardsRef(Loader)
  common.hasUIClassName(Loader)
  common.rendersChildren(Loader)

  common.propKeyOnlyToClassName(Loader, 'active')
  common.propKeyOnlyToClassName(Loader, 'disabled')
  common.propKeyOnlyToClassName(Loader, 'indeterminate')
  common.propKeyOnlyToClassName(Loader, 'inverted')

  common.propKeyOrValueAndKeyToClassName(Loader, 'inline', ['centered'])

  common.propValueOnlyToClassName(Loader, 'size', SUI.SIZES)

  describe('text (class)', () => {
    it('omitted by default', () => {
      const element = nestedShallow(<Loader />)
      expect(hasClass(element, 'text')).to.equal(false)
    })

    it('add class when has children', () => {
      const text = faker.hacker.phrase()
      const element = nestedShallow(<Loader>{text}</Loader>)

      expect(element).toHaveClass('text')
    })

    it('add class when has content prop', () => {
      const text = faker.hacker.phrase()
      const element = nestedShallow(<Loader content={text} />)

      expect(element).toHaveClass('text')
    })
  })
})
