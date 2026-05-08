import faker from 'faker'
import React from 'react'

import ButtonOr from 'src/elements/Button/ButtonOr'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedElement'

describe('ButtonOr', () => {
  common.isConformant(ButtonOr)
  common.forwardsRef(ButtonOr)

  describe('text', () => {
    it('should not define attr when not defined', () => {
      const element = nestedShallow(<ButtonOr />)
      expect(element.getAttribute('data-text')).to.be.null()
    })

    it('should pass value to attr', () => {
      const word = faker.lorem.word()
      const element = nestedShallow(<ButtonOr text={word} />)

      expect(element.getAttribute('data-text')).to.equal(word)
    })
  })
})
